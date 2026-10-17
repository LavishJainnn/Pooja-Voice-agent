// useCallManager.js — Orchestrates the full voice call pipeline
import { useState, useCallback, useRef } from "react";
import { useGeminiAgent } from "./useGeminiAgent";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useTextToSpeech } from "./useTextToSpeech";

export const AGENT_STATE = {
  IDLE: "idle",
  LISTENING: "listening",
  THINKING: "thinking",
  SPEAKING: "speaking",
};

export function useCallManager() {
  const [callState, setCallState] = useState("inactive"); // inactive | active | ended
  const [agentState, setAgentState] = useState(AGENT_STATE.IDLE);
  const [transcript, setTranscript] = useState([]);
  const [callSummary, setCallSummary] = useState(null);
  const [error, setError] = useState(null);

  const isCallActiveRef = useRef(false);
  const pendingListenRef = useRef(false);

  const { sendMessage, initChat, resetChat } = useGeminiAgent();
  const { isSpeaking, speak, stopSpeaking } = useTextToSpeech();

  const addToTranscript = useCallback((role, text) => {
    setTranscript((prev) => [
      ...prev,
      { role, text, timestamp: new Date().toLocaleTimeString("en-IN") },
    ]);
  }, []);

  const startListeningCycle = useCallback(() => {
    // Will trigger after agent finishes speaking
    pendingListenRef.current = true;
  }, []);

  const handleSpeechResult = useCallback(
    async (userText) => {
      if (!isCallActiveRef.current) return;
      
      setAgentState(AGENT_STATE.THINKING);
      addToTranscript("user", userText);

      try {
        const { text } = await sendMessage(userText);
        if (!isCallActiveRef.current) return;

        addToTranscript("agent", text);
        setAgentState(AGENT_STATE.SPEAKING);

        speak(text, () => {
          if (isCallActiveRef.current) {
            setAgentState(AGENT_STATE.LISTENING);
            // Re-trigger recognition via event
            window.dispatchEvent(new CustomEvent("Pooja-listen"));
          }
        });
      } catch (err) {
        console.error("Pipeline error:", err);
        setError(err.message);
        setAgentState(AGENT_STATE.IDLE);
      }
    },
    [sendMessage, speak, addToTranscript]
  );

  const handleSpeechError = useCallback((errMsg) => {
    setError(errMsg);
    console.warn("STT error:", errMsg);
  }, []);

  const { isListening, interimText, startListening, stopListening, isSupported } =
    useSpeechRecognition({
      onResult: handleSpeechResult,
      onError: handleSpeechError,
    });

  // Listen for the Pooja-listen event
  const handlePoojaListen = useCallback(() => {
    if (isCallActiveRef.current) {
      startListening();
    }
  }, [startListening]);

  const startCall = useCallback(async () => {
    if (!isSupported) {
      setError("Speech recognition not supported. Please use Chrome browser.");
      return;
    }

    setError(null);
    setTranscript([]);
    setCallSummary(null);
    isCallActiveRef.current = true;
    setCallState("active");
    setAgentState(AGENT_STATE.THINKING);

    window.addEventListener("Pooja-listen", handlePoojaListen);

    try {
      await initChat();
      // Get opening greeting
      const { text } = await sendMessage(
        "[SYSTEM: The call has just started. Greet the customer as Pooja from Aura Skincare.]"
      );
      addToTranscript("agent", text);
      setAgentState(AGENT_STATE.SPEAKING);

      speak(text, () => {
        if (isCallActiveRef.current) {
          setAgentState(AGENT_STATE.LISTENING);
          startListening();
        }
      });
    } catch (err) {
      console.error("Start call error:", err);
      setError(err.message);
      setAgentState(AGENT_STATE.IDLE);
      setCallState("inactive");
      isCallActiveRef.current = false;
    }
  }, [isSupported, initChat, sendMessage, speak, startListening, addToTranscript, handlePoojaListen]);

  const generateCallSummary = useCallback(async (transcriptData) => {
    try {
      const summaryPrompt = `Based on this call transcript, generate a structured JSON summary. Return ONLY valid JSON, no markdown.

Transcript:
${transcriptData.map((t) => `${t.role === "user" ? "Customer" : "Pooja"}: ${t.text}`).join("\n")}

Return JSON with these fields:
{
  "customer_intent": "one of: ORDER_TRACKING | RETURN_REQUEST | CANCELLATION | REFUND | PRODUCT_INQUIRY | POLICY_QUERY | OUT_OF_SCOPE | GENERAL",
  "order_id": "order ID mentioned or null",
  "resolution_status": "RESOLVED | UNRESOLVED | ESCALATION_NEEDED | OUT_OF_SCOPE",
  "sentiment": "POSITIVE | NEUTRAL | NEGATIVE",
  "topics_discussed": ["array", "of", "topics"],
  "call_summary": "2-3 sentence summary of the conversation"
}`;

      const { text } = await sendMessage(summaryPrompt);
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error("Summary generation error:", err);
    }
    return null;
  }, [sendMessage]);

  const endCall = useCallback(async () => {
    isCallActiveRef.current = false;
    stopListening();
    stopSpeaking();
    window.removeEventListener("Pooja-listen", handlePoojaListen);
    setAgentState(AGENT_STATE.IDLE);
    setCallState("ended");

    // Generate post-call summary
    if (transcript.length > 0) {
      const summary = await generateCallSummary(transcript);
      setCallSummary(summary);
    }

    resetChat();
  }, [stopListening, stopSpeaking, handlePoojaListen, transcript, generateCallSummary, resetChat]);

  return {
    callState,
    agentState,
    transcript,
    callSummary,
    interimText,
    error,
    isSupported,
    startCall,
    endCall,
    isListening,
    isSpeaking,
  };
}

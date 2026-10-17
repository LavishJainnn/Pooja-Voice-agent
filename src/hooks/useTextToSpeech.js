// useTextToSpeech.js — Browser Web Speech API TTS with Indian voice selection
import { useState, useRef, useCallback, useEffect } from "react";

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // Find best Indian English voice
  useEffect(() => {
    const findIndianVoice = () => {
      const voices = speechSynthesis.getVoices();
      if (!voices.length) return;

      // Priority: Indian English female > Indian English > English female > any English
      const priority = [
        (v) => v.lang === "en-IN" && v.name.toLowerCase().includes("female"),
        (v) => v.lang === "en-IN",
        (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"),
        (v) => v.lang.startsWith("en"),
      ];

      for (const matcher of priority) {
        const found = voices.find(matcher);
        if (found) {
          setSelectedVoice(found);
          return;
        }
      }
      setSelectedVoice(voices[0]);
    };

    findIndianVoice();
    speechSynthesis.onvoiceschanged = findIndianVoice;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    (text, onEnd) => {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      // Clean text for speech (remove markdown symbols)
      const cleanText = text
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/#{1,6}\s/g, "")
        .replace(/`/g, "")
        .replace(/₹/g, "rupees ");

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current = utterance;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.lang = "en-IN";
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = (e) => {
        if (e.error !== "interrupted") {
          console.error("TTS error:", e);
        }
        setIsSpeaking(false);
        onEnd?.();
      };

      speechSynthesis.speak(utterance);
    },
    [selectedVoice]
  );

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  return { isSpeaking, speak, stopSpeaking, selectedVoice };
}

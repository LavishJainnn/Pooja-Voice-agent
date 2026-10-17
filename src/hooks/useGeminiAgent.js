// useGeminiAgent.js — Core AI reasoning using Groq (Llama models)
// Keeping the same export name so useCallManager.js works without changes
import { useState, useRef, useCallback } from "react";
import Groq from "groq-sdk";
import { BRAND_SYSTEM_PROMPT } from "../data/brandKnowledge";
import { getOrderDetails } from "../data/orders";

function getApiKey() {
  return (
    localStorage.getItem("groq_api_key") ||
    import.meta.env.VITE_GROQ_API_KEY ||
    window.__groqApiKey ||
    ""
  );
}

// Tool declaration in OpenAI-compatible format (used by Groq)
const ORDER_TOOL = {
  type: "function",
  function: {
    name: "get_order_details",
    description:
      "Retrieves order details for a given order ID from the Aura Skincare database. Call this whenever a customer mentions an order ID like ORD-101, ORD-102, ORD-103.",
    parameters: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "The order ID to look up, e.g. ORD-101",
        },
      },
      required: ["order_id"],
    },
  },
};

// Models to try, in order of preference (all support tool calling on Groq)
const MODELS_TO_TRY = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "openai/gpt-oss-120b",
];

export function useGeminiAgent() {
  const [isThinking, setIsThinking] = useState(false);
  const groqRef = useRef(null);
  const messagesRef = useRef([]); // Chat history (OpenAI messages format)
  const modelRef = useRef(null);

  const initChat = useCallback(async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("Groq API key not found. Please enter your API key above.");
    }

    groqRef.current = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Reset conversation history with system prompt
    messagesRef.current = [
      { role: "system", content: BRAND_SYSTEM_PROMPT },
    ];

    // Probe which model is available
    let lastError = null;
    for (const modelId of MODELS_TO_TRY) {
      try {
        // Quick test call to verify the model works
        await groqRef.current.chat.completions.create({
          model: modelId,
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 5,
        });
        modelRef.current = modelId;
        console.log(`✓ Groq model: ${modelId}`);
        return;
      } catch (err) {
        console.warn(`Model "${modelId}" init failed:`, err.message);
        lastError = err;
      }
    }
    throw lastError ?? new Error("No Groq model available.");
  }, []);

  const processToolCall = useCallback((name, args) => {
    if (name === "get_order_details") {
      return getOrderDetails(args.order_id);
    }
    return { error: `Unknown tool: ${name}` };
  }, []);

  const sendMessage = useCallback(
    async (userText) => {
      if (!groqRef.current || !modelRef.current) {
        await initChat();
      }
      setIsThinking(true);
      try {
        // Add user message to history
        messagesRef.current.push({ role: "user", content: userText });

        // Send to Groq with tools
        let response = await groqRef.current.chat.completions.create({
          model: modelRef.current,
          messages: messagesRef.current,
          tools: [ORDER_TOOL],
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens: 300,
        });

        let message = response.choices[0].message;

        // Tool call loop — handles chained function calls (max 5 iterations)
        let iters = 0;
        while (iters < 5 && message.tool_calls && message.tool_calls.length > 0) {
          // Add the assistant message with tool_calls to history
          messagesRef.current.push(message);

          // Execute each tool call and add results
          for (const toolCall of message.tool_calls) {
            const fnName = toolCall.function.name;
            const fnArgs = JSON.parse(toolCall.function.arguments);
            const result = processToolCall(fnName, fnArgs);

            messagesRef.current.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            });
          }

          // Send tool results back for the model to formulate a final answer
          response = await groqRef.current.chat.completions.create({
            model: modelRef.current,
            messages: messagesRef.current,
            tools: [ORDER_TOOL],
            tool_choice: "auto",
            temperature: 0.7,
            max_tokens: 300,
          });

          message = response.choices[0].message;
          iters++;
        }

        const text = message.content;
        if (!text) throw new Error("Empty response from Groq.");

        // Add the final assistant message to history
        messagesRef.current.push({ role: "assistant", content: text });

        return { text };
      } catch (err) {
        console.error("Groq sendMessage error:", err);
        throw err;
      } finally {
        setIsThinking(false);
      }
    },
    [initChat, processToolCall]
  );

  const resetChat = useCallback(() => {
    groqRef.current = null;
    modelRef.current = null;
    messagesRef.current = [];
  }, []);

  return { sendMessage, initChat, resetChat, isThinking };
}

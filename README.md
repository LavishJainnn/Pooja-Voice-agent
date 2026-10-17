# ✦ Pooja — AI Voice Support Agent for Aura Skincare

A browser-based AI Voice Customer Support Agent for **Aura Skincare**, a fictional premium organic Indian skincare brand.

**Live Demo:** _[Deploy to Vercel — see Deployment section below]_

---

## 🎙 What It Does

When you open the app and click **Start Call**, you can speak naturally with **Pooja** — a friendly Indian customer support specialist — using your computer's microphone. Pooja responds through your speakers and can:

- ✅ Hold a multi-turn voice conversation with full context
- ✅ Answer questions using Aura Skincare's brand & policy knowledge
- ✅ Look up live order information (ORD-101, ORD-102, ORD-103)
- ✅ Enforce brand policies (politely refuse out-of-policy requests)
- ✅ Handle out-of-scope queries gracefully
- ✅ Generates a downloadable transcript + structured JSON call summary after the call

---

## 🏗 Architecture

```
Browser Microphone
       ↓
Web Speech API (STT — en-IN locale)
       ↓
Llama models via Groq (LLM reasoning + function calling)
       ↓  [calls get_order_details() when needed]
Mock Order Database (in-browser)
       ↓
Web Speech API (TTS — Indian English voice)
       ↓
Browser Speakers
```

**Frontend:** React + Vite  
**AI Model:** Llama models via Groq (free tier via `groq-sdk`)  
**STT:** Browser Web Speech API (`en-IN` locale for Indian English)  
**TTS:** Browser Web Speech Synthesis API (auto-selects Indian English voice)  
**Tool Calling:** Groq function calling with `get_order_details()` tool

---

## 🚀 Getting Started

### Prerequisites
- **Google Chrome** (required for Web Speech API)
- **Groq API Key** — free at [groq.com](https://groq.com)

### Live Link
https://pooja-voice-agent.vercel.app/

### Local Setup

```bash
# 1. Clone/navigate to the project
cd "Voice agent"

# 2. Install dependencies
npm install

# 3. Add your API key (optional — can also enter in the UI)
cp .env.example .env
# Edit .env and add: VITE_GROQ_API_KEY=your_key_here

# 4. Start dev server
npm run dev

# 5. Open http://localhost:5173 in Chrome
```

### Runtime API Key Entry (No .env needed)
You can also enter your Groq API key directly in the app UI — it's saved to `localStorage`.

---

## 🧪 Test Orders

| Order ID | Customer | Product | Status |
|----------|----------|---------|--------|
| ORD-101 | Priya Sharma | Vitamin C Serum (30ml) | Out for Delivery — BlueDart BD-982103, expected by 6 PM |
| ORD-102 | Rahul Verma | Hydrating Sunscreen SPF 50 | Delivered — 14 days ago (not returnable) |
| ORD-103 | Ananya Patel | Green Tea Face Wash + Toner | Processing — eligible for cancellation |

**Try saying:** "Where is my order ORD-101?" or "Can I cancel order ORD-103?"

---

## 📁 Project Structure

```
src/
├── data/
│   ├── orders.js          # Mock order database + getOrderDetails()
│   └── brandKnowledge.js  # System prompt + Groq Llama tool definitions
├── hooks/
│   ├── useGeminiAgent.js  # AI reasoning + function calling
│   ├── useSpeechRecognition.js  # Browser STT
│   ├── useTextToSpeech.js # Browser TTS
│   └── useCallManager.js  # Pipeline orchestration
├── components/
│   ├── AgentOrb.jsx/css   # Animated state indicator
│   ├── Transcript.jsx/css # Live call transcript
│   ├── OrdersPanel.jsx/css # Test helper panel
│   └── CallSummary.jsx/css # Post-call JSON summary
├── App.jsx/css            # Main layout
└── index.css              # Global styles + design tokens
```

---
# ✦ Aria — AI Voice Support Agent for Aura Skincare

A browser-based AI Voice Customer Support Agent for **Aura Skincare**, a fictional premium organic Indian skincare brand.

**Live Demo:** _[Deploy to Vercel — see Deployment section below]_

---

## 🎙 What It Does

When you open the app and click **Start Call**, you can speak naturally with **Aria** — a friendly Indian customer support specialist — using your computer's microphone. Aria responds through your speakers and can:

- ✅ Hold a multi-turn voice conversation with full context
- ✅ Answer questions using Aura Skincare's brand & policy knowledge
- ✅ Look up live order information (ORD-101, ORD-102, ORD-103)
- ✅ Enforce brand policies (politely refuse out-of-policy requests)
- ✅ Handle out-of-scope queries gracefully
- ✅ Generate a transcript + structured JSON call summary after the call

---

## 🏗 Architecture

```
Browser Microphone
       ↓
Web Speech API (STT — en-IN locale)
       ↓
Google Gemini 2.0 Flash (LLM reasoning + function calling)
       ↓  [calls get_order_details() when needed]
Mock Order Database (in-browser)
       ↓
Web Speech API (TTS — Indian English voice)
       ↓
Browser Speakers
```

**Frontend:** React + Vite  
**AI Model:** Google Gemini 2.0 Flash (free tier via `@google/generative-ai`)  
**STT:** Browser Web Speech API (`en-IN` locale for Indian English)  
**TTS:** Browser Web Speech Synthesis API (auto-selects Indian English voice)  
**Tool Calling:** Gemini function calling with `get_order_details()` tool

---

## 🚀 Getting Started

### Prerequisites
- **Google Chrome** (required for Web Speech API)
- **Gemini API Key** — free at [aistudio.google.com](https://aistudio.google.com/app/apikey)

### Local Setup

```bash
# 1. Clone/navigate to the project
cd "Voice agent"

# 2. Install dependencies
npm install

# 3. Add your API key (optional — can also enter in the UI)
cp .env.example .env
# Edit .env and add: VITE_GEMINI_API_KEY=your_key_here

# 4. Start dev server
npm run dev

# 5. Open http://localhost:5173 in Chrome
```

### Runtime API Key Entry (No .env needed)
You can also enter your Gemini API key directly in the app UI — it's saved to `localStorage`.

---

## 🧪 Test Orders

| Order ID | Customer | Product | Status |
|----------|----------|---------|--------|
| ORD-101 | Priya Sharma | Vitamin C Serum (30ml) | Out for Delivery — BlueDart BD-982103, expected by 6 PM |
| ORD-102 | Rahul Verma | Hydrating Sunscreen SPF 50 | Delivered — 14 days ago (not returnable) |
| ORD-103 | Ananya Patel | Green Tea Face Wash + Toner | Processing — eligible for cancellation |

**Try saying:** "Where is my order ORD-101?" or "Can I cancel order ORD-103?"

---

## 📦 Deployment (Vercel)

```bash
npm run build
# Then deploy the 'dist' folder to Vercel, Netlify, or any static host
```

**Vercel:**
1. Push repo to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add env variable: `VITE_GEMINI_API_KEY` = your key
4. Deploy!

---

## 💭 Section 9 — How I Think

### 1. Why this architecture and stack?

I chose a **modular STT → LLM → TTS pipeline** using the browser's built-in Web Speech API for both input and output, with Google Gemini 2.0 Flash as the reasoning engine. This approach has zero infrastructure cost (no telephony, no backend servers), runs entirely in-browser, and the Gemini free tier is generous enough for evaluation. 

Gemini's native **function calling** was key — it lets the model decide when to call `get_order_details()` rather than relying on brittle prompt engineering. The `en-IN` locale for speech recognition dramatically improves accuracy for Indian-accented speech, which was a deliberate choice for the persona.

React + Vite was chosen for fast iteration and easy Vercel deployment. The architecture is modular enough that you could swap any component (e.g., replace Web Speech API with Deepgram for production-grade STT) without touching the rest.

### 2. Most difficult part?

The most challenging aspect was the **voice conversation loop** — ensuring the agent listens → thinks → speaks → listens again seamlessly without awkward gaps or race conditions. The Web Speech API's `onend` and `onerror` events are unreliable across browsers, and managing state transitions between `listening`, `thinking`, and `speaking` required careful use of refs vs state to avoid stale closure issues.

The solution was to use a custom event (`aria-listen`) dispatched after TTS ends, which the recognition hook responds to independently, keeping the pipeline clean.

### 3. If I had one more week?

I'd replace the Web Speech API TTS with **ElevenLabs** or **Sarvam AI** (for authentic Indian voice synthesis), and replace Web Speech API STT with **Deepgram** or **AssemblyAI** for significantly better accuracy on Indian-accented speech and support for Hinglish. These would be the highest-impact improvements for the voice experience.

I'd also add **barge-in support** — detecting when a user starts speaking while Aria is still talking, and interrupting the TTS to listen immediately.

### 4. At 1,000 conversations per day?

Several things would need to change:

1. **Move LLM calls to a backend** — never expose API keys client-side in production. A Node.js/FastAPI proxy with rate limiting and auth is essential.
2. **Replace browser STT/TTS** with proper streaming APIs (Deepgram for STT, ElevenLabs for TTS) for consistent, low-latency voice quality across all browsers (not just Chrome).
3. **Persistent conversation logs** — store transcripts and summaries to a database (Firestore/Postgres) for CX analytics, QA review, and agent training.
4. **Observability** — add logging, error tracking (Sentry), and latency monitoring to identify pipeline bottlenecks.
5. **Caching** — cache common policy questions with pre-generated responses to reduce LLM calls and cost.
6. **Scalability** — the current in-memory order "database" would need to be replaced with a real order management system API.

---

## 📁 Project Structure

```
src/
├── data/
│   ├── orders.js          # Mock order database + getOrderDetails()
│   └── brandKnowledge.js  # System prompt + Gemini tool definitions
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

## 🔗 LinkedIn

[Your LinkedIn Profile URL]

---

## 📝 Short Approach Note

Built a browser-native voice agent using Google Gemini 2.0 Flash's function calling for intelligent order lookup decisions, with Web Speech API for zero-cost STT/TTS and an Indian English locale for authentic persona delivery. The pipeline is fully modular — each component (STT, LLM, TTS) is swappable independently — making it easy to upgrade individual pieces (e.g., swap to Deepgram STT) without architectural changes. Brand guardrails are encoded directly in the system prompt with explicit policy examples, ensuring Aria stays on-brand even for edge cases.

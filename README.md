# Smart-AI-Tutor (AI Smart Compiler Tutor)

An AI-powered educational platform for mastering Compiler Design with interactive parse trees, grammar analysis, LL(1) simulator, full compiler pipeline visualization, quizzes, and personalized AI tutoring powered by Gemini.

## 🚀 Features

- **Compiler Pipeline Visualizer**: Step-by-step breakdown across Lexical Analysis, Syntax Analysis, Semantic Analysis, Intermediate Code Generation (3AC), Code Optimization, and Target Code Generation.
- **Interactive Grammar & Parse Tree Studio**: Input custom CFGs, check for left recursion / ambiguity, compute First & Follow sets, and render interactive parse trees.
- **LL(1) Parser Simulator**: Interactive parsing tables with input string verification and stack-action trace.
- **AI Compiler Tutor**: Interactive chatbot powered by Google Gemini to answer questions, explain concepts, and troubleshoot grammars and ASTs.
- **Quizzes & Flashcards**: Test your knowledge across core compiler design concepts.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Express, Node.js, `tsx`
- **AI**: Google Gen AI SDK (`@google/genai`) with Gemini 3.8 Flash

---

## 💻 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Installation
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Gemini API key:
```bash
cp .env.example .env
```
Edit `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
GEMINI_MODEL=gemini-3.8-flash
PORT=3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License
MIT

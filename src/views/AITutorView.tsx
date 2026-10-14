import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  BookOpen,
  Copy,
  Check,
  AlertCircle,
  Code2,
  Terminal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOPICS_DATA } from '../data/topicsData';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  source?: string;
}

export const AITutorView: React.FC = () => {
  const {
    tutorMode,
    setTutorMode,
    selectedTopicId,
    setSelectedTopicId,
    tutorInitialPrompt,
    setTutorInitialPrompt,
    tutorAlgorithmContext,
    setTutorAlgorithmContext,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `### Welcome to your Compiler Design AI Tutor! 🎓

I am specialized in undergraduate and graduate **Compiler Design & Construction**. 

Here is what I can help you with:
- **Beginner Mode:** Everyday analogies and step-by-step intuitive breakdowns.
- **Detailed Mode:** Algorithmic proofs, transition diagrams, and formal derivations.
- **Exam Mode:** Formal Aho-Lam-Sethi-Ullman (Dragon Book) definitions, tabular comparisons, and common university exam questions.

Select a topic from the right panel or ask any question below!`,
        timestamp: Date.now(),
        source: 'compiler-tutor',
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle initial prompt from Learn/Workbench
  useEffect(() => {
    if (tutorInitialPrompt) {
      handleSendMessage(tutorInitialPrompt);
      setTutorInitialPrompt('');
    }
  }, [tutorInitialPrompt]);

  const activeTopic = TOPICS_DATA.find(t => t.id === selectedTopicId) || TOPICS_DATA[0];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          mode: tutorMode,
          topic: activeTopic.title,
          algorithmContext: tutorAlgorithmContext,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.reply || 'I could not generate an explanation at this moment.',
        timestamp: Date.now(),
        source: data.source || 'gemini',
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Tutor chat request error:', err);
      // Client-side fallback if server error
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: `### Tutor Explanation: ${activeTopic.title}

Regarding your question: *"${textToSend}"*

In compiler theory, this relates to **${activeTopic.title}**.
- **Key Principle:** The compiler ensures language preservation through formal grammar transformations and deterministic parsing tables.
- **Tip:** You can inspect the deterministic algorithm live in the **Grammar Workbench** or trace the stack in the **Parser Simulator**!`,
        timestamp: Date.now(),
        source: 'offline-pedagogical-engine',
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        role: 'assistant',
        content: `Conversation reset. Ready for questions on **${activeTopic.title}**!`,
        timestamp: Date.now(),
        source: 'compiler-tutor',
      },
    ]);
  };

  const samplePrompts = [
    'Explain FIRST and FOLLOW sets with an intuitive analogy.',
    'Why do top-down LL parsers fail on left-recursive grammars?',
    'What is the difference between S-attributed and L-attributed SDDs?',
    'Show me how an LL(1) parsing table handles an epsilon transition.',
    'Explain Constant Folding vs Constant Propagation with examples.',
  ];

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-16">
      {/* Left Area: Main Chat Workspace (8 columns) */}
      <div className="lg:col-span-8 flex flex-col h-[820px] rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">AI Compiler Tutor</h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {tutorMode} mode
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-sm">
                Topic: {activeTopic.title}
              </p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Clear conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Algorithm Context Banner (if supplied from Workbench) */}
        {tutorAlgorithmContext && (
          <div className="px-6 py-2.5 bg-indigo-950/40 border-b border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>
                Verified Algorithm Context Attached: <strong>{tutorAlgorithmContext.type}</strong>
              </span>
            </div>
            <button
              onClick={() => setTutorAlgorithmContext(null)}
              className="text-slate-400 hover:text-white text-[11px] underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-indigo-400 border border-slate-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`relative group rounded-2xl p-5 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Markdown-like rendering */}
                  <div className="prose prose-invert prose-sm max-w-none space-y-3">
                    {msg.content.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h4 key={pIdx} className="text-base font-bold text-indigo-200 mt-2 mb-1">
                            {paragraph.replace('### ', '')}
                          </h4>
                        );
                      }
                      if (paragraph.startsWith('#### ')) {
                        return (
                          <h5 key={pIdx} className="text-sm font-semibold text-indigo-300 mt-2 mb-1">
                            {paragraph.replace('#### ', '')}
                          </h5>
                        );
                      }
                      if (paragraph.startsWith('```')) {
                        const code = paragraph.replace(/```[a-z]*\n?/g, '').trim();
                        return (
                          <pre
                            key={pIdx}
                            className="p-3 rounded-lg bg-[#080c14] border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto"
                          >
                            <code>{code}</code>
                          </pre>
                        );
                      }
                      return <p key={pIdx} className="leading-relaxed whitespace-pre-line">{paragraph}</p>;
                    })}
                  </div>

                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Source: {msg.source || 'gemini-3.8-flash'}</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3.5 max-w-3xl">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>Compiler AI is analyzing grammar and crafting explanation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800/80">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder={`Ask any question about ${activeTopic.title.split('. ')[1] || 'Compiler Design'}...`}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-[#0a0e17] border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Context & Mode Configuration Panel (4 columns) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Teaching Mode Switcher */}
        <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-md">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3">
            Teaching Mode
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'beginner', label: 'Beginner', desc: 'Analogies' },
              { id: 'detailed', label: 'Detailed', desc: 'Algorithms' },
              { id: 'exam', label: 'Exam Prep', desc: 'Definitions' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setTutorMode(m.id as any)}
                className={`p-3 rounded-xl text-center border transition-all ${
                  tutorMode === m.id
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold block">{m.label}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{m.desc}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {tutorMode === 'beginner' && 'Simplifies terminology and emphasizes intuitive real-world analogies.'}
            {tutorMode === 'detailed' && 'Provides formal mathematical grammar notations, intermediate states, and proofs.'}
            {tutorMode === 'exam' && 'Focuses on Dragon Book textbook definitions, algorithm steps, and university grading rubrics.'}
          </p>
        </div>

        {/* Topic Context Picker */}
        <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-md">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Active Topic Context</span>
          </h4>
          <select
            value={selectedTopicId}
            onChange={e => setSelectedTopicId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {TOPICS_DATA.map(t => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <div className="mt-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400">
            The tutor will prioritize explanations relevant to {activeTopic.title}.
          </div>
        </div>

        {/* Suggested Quick Prompts */}
        <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-md">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Suggested Questions</span>
          </h4>
          <div className="space-y-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 transition-all cursor-pointer"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

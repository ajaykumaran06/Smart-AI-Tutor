import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Bookmark,
  Sparkles,
  Binary,
  GitFork,
  Layers,
  GraduationCap,
  ChevronRight,
  Clock,
  HelpCircle,
  FileText,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOPICS_DATA } from '../data/topicsData';

export const LearnView: React.FC = () => {
  const {
    selectedTopicId,
    setSelectedTopicId,
    completedTopics,
    toggleTopicCompletion,
    bookmarkedTopics,
    toggleBookmark,
    setCurrentView,
    setTutorInitialPrompt,
    getTopicMastery,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'overview' | 'worked' | 'pitfalls' | 'practice'>('overview');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const categories = ['All', 'Front-End', 'Parsing', 'Semantic & Intermediate', 'Back-End & Optimization'];

  const filteredTopics = TOPICS_DATA.filter(t =>
    selectedCategory === 'All' ? true : t.category === selectedCategory
  );

  const activeTopic = TOPICS_DATA.find(t => t.id === selectedTopicId) || TOPICS_DATA[0];
  const isCompleted = completedTopics.includes(activeTopic.id);
  const isBookmarked = bookmarkedTopics.includes(activeTopic.id);
  const mastery = getTopicMastery(activeTopic.id);

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Topic List (4 columns) */}
        <div className="lg:col-span-4 space-y-3 max-h-[820px] overflow-y-auto pr-1">
          {filteredTopics.map(topic => {
            const isCurrent = topic.id === activeTopic.id;
            const topicCompleted = completedTopics.includes(topic.id);
            const topicScore = getTopicMastery(topic.id);

            return (
              <div
                key={topic.id}
                onClick={() => {
                  setSelectedTopicId(topic.id);
                  setRevealedAnswers({});
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-950/40'
                    : 'bg-[#0f172a]/50 hover:bg-[#121c33] border-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-1">
                      <span>{topic.category}</span>
                      <span>·</span>
                      <span>{topic.readTime}</span>
                    </div>
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isCurrent ? 'text-indigo-200' : 'text-slate-200'
                      }`}
                    >
                      {topic.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {topicCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                  <span className="font-mono">{topic.difficulty} Difficulty</span>
                  <span className="font-mono text-indigo-400 font-semibold">{topicScore}% Mastery</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Topic Reader (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="p-8 rounded-2xl bg-[#0f172a]/70 border border-slate-800/80 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-2">
                  <span>{activeTopic.category}</span>
                  <span>·</span>
                  <span>{activeTopic.difficulty} Level</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeTopic.readTime} read
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {activeTopic.title}
                </h2>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => toggleBookmark(activeTopic.id)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isBookmarked
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title={isBookmarked ? 'Bookmarked' : 'Add bookmark'}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleTopicCompletion(activeTopic.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
                </button>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex items-center gap-2 mt-6 border-b border-slate-800/60 pb-3">
              {[
                { id: 'overview', label: '1. Overview & Definitions', icon: <FileText className="w-4 h-4" /> },
                { id: 'worked', label: '2. Worked Example', icon: <Lightbulb className="w-4 h-4" /> },
                { id: 'pitfalls', label: '3. Common Pitfalls', icon: <AlertTriangle className="w-4 h-4" /> },
                { id: 'practice', label: '4. Practice Questions', icon: <HelpCircle className="w-4 h-4" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                    Learning Objectives
                  </h4>
                  <ul className="space-y-2">
                    {activeTopic.learningObjectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    <span>Intuitive Mental Model (Analogy)</span>
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {activeTopic.simpleExplanation}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                    Formal Academic Definition
                  </h4>
                  <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 text-sm text-indigo-200 font-mono leading-relaxed">
                    {activeTopic.formalDefinition}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Prerequisites
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeTopic.prerequisites.map((req, i) => (
                      <span
                        key={i}
                        className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700/60"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Worked Example */}
            {activeTab === 'worked' && (
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {activeTopic.workedExample.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    {activeTopic.workedExample.description}
                  </p>

                  {activeTopic.workedExample.codeOrGrammar && (
                    <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 font-mono text-sm text-indigo-300 mb-4 overflow-x-auto">
                      {activeTopic.workedExample.codeOrGrammar}
                    </div>
                  )}

                  <div className="space-y-3">
                    {activeTopic.workedExample.solutionSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Common Pitfalls */}
            {activeTab === 'pitfalls' && (
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 mb-4">
                  These common errors and exam traps frequently cost students marks in university semester examinations.
                </div>
                {activeTopic.commonMistakes.map((mistake, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {mistake}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Practice Questions */}
            {activeTab === 'practice' && (
              <div className="mt-6 space-y-4">
                {activeTopic.practiceQuestions.map((q, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-semibold text-white">
                        Q{idx + 1}: {q.question}
                      </h4>
                      <button
                        onClick={() => toggleAnswer(idx)}
                        className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-indigo-400 hover:text-indigo-300 shrink-0"
                      >
                        {revealedAnswers[idx] ? 'Hide Answer' : 'Show Answer'}
                      </button>
                    </div>

                    {revealedAnswers[idx] && (
                      <div className="mt-3 p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-1.5 animate-fadeIn">
                        <p className="font-semibold text-emerald-400">Answer: {q.answer}</p>
                        <p className="text-slate-300">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Action Launch Bar */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setTutorInitialPrompt(`Can you explain the key concepts and exam formulas for "${activeTopic.title}"?`);
                  setCurrentView('tutor');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Tutor About This</span>
              </button>

              <button
                onClick={() => setCurrentView('workbench')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                <Binary className="w-3.5 h-3.5 text-indigo-400" />
                <span>Test in Grammar Workbench</span>
              </button>

              <button
                onClick={() => setCurrentView('quizzes')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                <span>Take Practice Quiz</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

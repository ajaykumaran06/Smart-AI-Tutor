import React from 'react';
import {
  Sparkles,
  BookOpen,
  Binary,
  GitFork,
  Cpu,
  Layers,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOPICS_DATA } from '../data/topicsData';

export const DashboardView: React.FC = () => {
  const {
    setCurrentView,
    setSelectedTopicId,
    completedTopics,
    quizAttempts,
    getOverallMastery,
    getTopicMastery,
    getWeakTopics,
    getRecommendedTopic,
    setTutorInitialPrompt,
  } = useApp();

  const mastery = getOverallMastery();
  const recommendedTopic = getRecommendedTopic();
  const weakTopics = getWeakTopics();
  const completedCount = completedTopics.length;
  const totalTopicsCount = TOPICS_DATA.length;

  const averageQuizScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / quizAttempts.length
        )
      : 85;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      {/* 1. Welcome & Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141b30] via-[#101728] to-[#0d1322] border border-slate-800/80 p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-4 h-4" />
            <span>Interactive Compiler Engineering Curriculum</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back to <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">AI Smart Compiler Tutor</span>
          </h2>
          <p className="mt-3 text-slate-300 text-base sm:text-lg leading-relaxed">
            Move beyond static textbook theory. Calculate real FIRST & FOLLOW sets, visualize dynamic parse trees, trace pushdown automata step-by-step, and receive instant AI assistance tailored for university exams.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                setSelectedTopicId(recommendedTopic.id);
                setCurrentView('learn');
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:translate-y-[-1px] cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Resume: {recommendedTopic.title.split('. ')[1] || recommendedTopic.title}</span>
            </button>
            <button
              onClick={() => {
                setTutorInitialPrompt('Can you give me a quick high-level overview of the entire compiler front-end pipeline?');
                setCurrentView('tutor');
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700/80 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Ask AI Tutor a Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overall Mastery</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
              %
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{mastery}%</span>
            <span className="text-xs text-indigo-400 font-medium">Curriculum Avg</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${mastery}%` }}
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Topics Completed</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{completedCount}</span>
            <span className="text-xs text-slate-400">/ {totalTopicsCount} Lessons</span>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {totalTopicsCount - completedCount} topics remaining
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Quiz Accuracy</span>
            <GraduationCap className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{averageQuizScore}%</span>
            <span className="text-xs text-violet-400 font-medium">{quizAttempts.length} tests taken</span>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Based on completed topic quizzes
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Focus Areas</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{weakTopics.length}</span>
            <span className="text-xs text-amber-400 font-medium">Require Revision</span>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Targeted practice recommended below
          </p>
        </div>
      </div>

      {/* 3. Interactive Hands-on Tool Launchpad */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Interactive Compiler Laboratories</h3>
            <p className="text-xs text-slate-400 mt-0.5">Explore real compiler engineering algorithms directly on custom grammar inputs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => setCurrentView('workbench')}
            className="group p-6 rounded-2xl bg-[#0f172a]/50 hover:bg-[#131c33] border border-slate-800/80 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Binary className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                Grammar Workbench
              </h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Compute FIRST & FOLLOW sets, remove immediate left recursion, and generate LL(1) parsing tables with conflict detection.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>Open Workbench</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => setCurrentView('visualizer')}
            className="group p-6 rounded-2xl bg-[#0f172a]/50 hover:bg-[#131c33] border border-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <GitFork className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Parse Tree Visualizer
              </h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Interactive derivation tree canvas with operator precedence demonstration, node inspection, and AST mode.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Launch Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => setCurrentView('simulator')}
            className="group p-6 rounded-2xl bg-[#0f172a]/50 hover:bg-[#131c33] border border-slate-800/80 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                Parser Simulator
              </h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Step-by-step LL(1) pushdown stack simulator with remaining input pointers and full explanation audit traces.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Start Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => setCurrentView('pipeline')}
            className="group p-6 rounded-2xl bg-[#0f172a]/50 hover:bg-[#131c33] border border-slate-800/80 hover:border-violet-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                7-Phase Pipeline
              </h4>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Watch code travel through Lexer, Parser, Semantics, Three-Address Code, Optimizer, and Target Assembly.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-violet-400 group-hover:translate-x-1 transition-transform">
              <span>Inspect Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Split: Targeted Revision Recommendations & Recent Quiz Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revision Recommendations */}
        <div className="p-7 rounded-2xl bg-[#0f172a]/50 border border-slate-800/80">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Recommended Revision & Practice</span>
            </h3>
            <span className="text-xs text-slate-400">Based on quiz accuracy</span>
          </div>

          <div className="space-y-4">
            {weakTopics.slice(0, 3).map(topic => {
              const topicScore = getTopicMastery(topic.id);
              return (
                <div
                  key={topic.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
                >
                  <div className="pr-4">
                    <span className="text-xs font-mono text-indigo-400 block mb-0.5">
                      {topic.category} · {topic.difficulty}
                    </span>
                    <h5 className="text-sm font-semibold text-white">
                      {topic.title}
                    </h5>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {topic.simpleExplanation}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-400 block">
                        {topicScore}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">Mastery</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                        setCurrentView('learn');
                      }}
                      className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 transition-colors"
                      title="Review lesson"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Quiz Activity */}
        <div className="p-7 rounded-2xl bg-[#0f172a]/50 border border-slate-800/80">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Recent Quiz Activity</span>
            </h3>
            <button
              onClick={() => setCurrentView('quizzes')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Take New Quiz →
            </button>
          </div>

          <div className="space-y-4">
            {quizAttempts.length > 0 ? (
              quizAttempts.slice(0, 3).map(attempt => (
                <div
                  key={attempt.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <span className="capitalize">{attempt.mode} Mode</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(attempt.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <h5 className="text-sm font-semibold text-white">
                      {attempt.topicTitle}
                    </h5>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span
                        className={`text-sm font-mono font-bold block ${
                          attempt.percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {attempt.percentage}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {attempt.score}/{attempt.totalQuestions} Correct
                      </span>
                    </div>
                    {attempt.percentage >= 70 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 text-sm">
                No quizzes taken yet. Test your knowledge in the Quizzes module!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

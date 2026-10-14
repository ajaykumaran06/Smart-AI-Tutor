import React from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOPICS_DATA } from '../data/topicsData';

export const ProgressView: React.FC = () => {
  const {
    getOverallMastery,
    getTopicMastery,
    getWeakTopics,
    completedTopics,
    quizAttempts,
    resetAllProgress,
    setSelectedTopicId,
    setCurrentView,
    setTutorInitialPrompt,
  } = useApp();

  const mastery = getOverallMastery();
  const weakTopics = getWeakTopics();

  // Category-wise completion
  const categories = ['Front-End', 'Parsing', 'Semantic & Intermediate', 'Back-End & Optimization'];

  const categoryStats = categories.map(cat => {
    const catTopics = TOPICS_DATA.filter(t => t.category === cat);
    const catCompleted = catTopics.filter(t => completedTopics.includes(t.id)).length;
    const catAvgMastery = Math.round(
      catTopics.reduce((acc, t) => acc + getTopicMastery(t.id), 0) / (catTopics.length || 1)
    );
    return {
      category: cat,
      total: catTopics.length,
      completed: catCompleted,
      mastery: catAvgMastery,
    };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      {/* Top Mastery Overview Hero */}
      <div className="p-8 sm:p-10 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Academic Performance Record</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Curriculum Mastery: <span className="text-indigo-400 font-mono">{mastery}%</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your mastery score is calculated deterministically: 70% weighted across topic-specific quiz assessments, combined with a 30% completion index for reading formal curriculum definitions and worked examples.
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
            <span>{completedTopics.length} / {TOPICS_DATA.length} Topics Studied</span>
            <span>·</span>
            <span>{quizAttempts.length} Assessments Recorded</span>
          </div>
        </div>

        {/* Big Circular/Radial Gauge Graphic */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#1e293b"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#6366f1"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - mastery / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold font-mono text-white">{mastery}%</span>
            <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold">Mastery</span>
          </div>
        </div>
      </div>

      {/* Domain Category Progress Breakdown */}
      <div>
        <h3 className="text-xl font-bold text-white mb-5 tracking-tight">
          Curriculum Category Mastery
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryStats.map(stat => (
            <div key={stat.category} className="p-6 rounded-2xl bg-[#0f172a]/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">{stat.category}</span>
                <span className="font-mono text-indigo-400 font-bold">{stat.mastery}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stat.mastery}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500">
                {stat.completed} of {stat.total} lessons completed
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mistake Analytics & Weak Topics Focus Area */}
      <div className="p-8 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Targeted Revision Recommendations</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Topics flagged where quiz accuracy is below 65% or repeated conceptual errors occurred
            </p>
          </div>
          <button
            onClick={() => {
              setTutorInitialPrompt('Can you diagnose my weak topics and give me a custom revision study plan for compiler exams?');
              setCurrentView('tutor');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Revision Plan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weakTopics.map(topic => (
            <div
              key={topic.id}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                  Revision Required
                </span>
                <h4 className="text-sm font-semibold text-white">
                  {topic.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {topic.simpleExplanation}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Mastery: <strong className="text-amber-400">{getTopicMastery(topic.id)}%</strong>
                </span>
                <button
                  onClick={() => {
                    setSelectedTopicId(topic.id);
                    setCurrentView('learn');
                  }}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <span>Review</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Attempt History Table */}
      <div className="rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Assessment & Quiz Attempt History</span>
          </h4>
          <span className="text-xs text-slate-400">{quizAttempts.length} Records Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                <th className="p-3.5 font-mono">Date</th>
                <th className="p-3.5">Curriculum Topic</th>
                <th className="p-3.5 font-mono">Mode</th>
                <th className="p-3.5 font-mono">Score</th>
                <th className="p-3.5 font-mono">Accuracy</th>
                <th className="p-3.5 font-mono">Status</th>
              </tr>
            </thead>
            <tbody>
              {quizAttempts.map(att => (
                <tr key={att.id} className="border-b border-slate-800/50 hover:bg-slate-900/40">
                  <td className="p-3.5 font-mono text-slate-400">
                    {new Date(att.timestamp).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 font-semibold text-white">
                    {att.topicTitle}
                  </td>
                  <td className="p-3.5 font-mono capitalize text-slate-400">
                    {att.mode}
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">
                    {att.score} / {att.totalQuestions}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-indigo-400">
                    {att.percentage}%
                  </td>
                  <td className="p-3.5">
                    {att.percentage >= 70 ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Proficient</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Needs Practice</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-red-300">Reset Learning History</h4>
          <p className="text-xs text-red-400/80 mt-0.5">
            Clear all completed topic checkmarks and stored quiz attempts from your local browser storage.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all your learning progress?')) {
              resetAllProgress();
            }
          }}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Reset All Progress
        </button>
      </div>
    </div>
  );
};

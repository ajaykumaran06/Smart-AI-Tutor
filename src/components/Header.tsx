import React from 'react';
import { Sparkles, BookOpen, Binary, GitFork, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentView, setCurrentView, getOverallMastery } = useApp();
  const mastery = getOverallMastery();

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Student Learning Dashboard',
      subtitle: 'Track your compiler theory progress, weak topics, and active simulations',
    },
    learn: {
      title: 'Compiler Design Curriculum',
      subtitle: '17 structured academic lessons with formal definitions, worked examples, and pitfalls',
    },
    tutor: {
      title: 'AI Compiler Design Tutor',
      subtitle: 'Ask questions, review algorithm outputs, and practice university exam problems',
    },
    workbench: {
      title: 'Grammar Analysis Workbench',
      subtitle: 'Compute FIRST/FOLLOW sets, eliminate Left Recursion, and build LL(1) parsing tables',
    },
    visualizer: {
      title: 'Interactive Parse Tree & AST Visualizer',
      subtitle: 'Explore operator precedence trees and syntax trees with zoom, pan, and step animations',
    },
    simulator: {
      title: 'Step-by-Step Parser Simulator',
      subtitle: 'Trace LL(1) pushdown stack operations, remaining inputs, and decision rules',
    },
    pipeline: {
      title: '7-Phase Compiler Pipeline Simulator',
      subtitle: 'Observe source code transformed through Lexer, Parser, Semantics, TAC, Optimizer, and Assembly',
    },
    quizzes: {
      title: 'Topic-Wise Assessments & Quizzes',
      subtitle: 'Practice exam-level compiler design questions with instant feedback and explanations',
    },
    progress: {
      title: 'Student Progress & Mistake Analytics',
      subtitle: 'Diagnostic mastery metrics, mistake analysis, and personalized revision recommendations',
    },
  };

  const currentInfo = viewTitles[currentView] || {
    title: 'AI Smart Compiler Tutor',
    subtitle: 'Educational Platform for University Compiler Design',
  };

  return (
    <header className="sticky top-0 z-20 h-20 bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 md:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Launch Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => setCurrentView('workbench')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-all"
          >
            <Binary className="w-3.5 h-3.5 text-indigo-400" />
            <span>Grammar Tools</span>
          </button>
          <button
            onClick={() => setCurrentView('visualizer')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-all"
          >
            <GitFork className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tree Visualizer</span>
          </button>
        </div>

        {/* AI Tutor Primary Action */}
        {currentView !== 'tutor' && (
          <button
            onClick={() => setCurrentView('tutor')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Tutor</span>
          </button>
        )}

        {/* Compact Mastery Pill */}
        <div
          onClick={() => setCurrentView('progress')}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
          title="View detailed progress analytics"
        >
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-mono font-medium text-slate-300">
            {mastery}% Mastery
          </span>
        </div>
      </div>
    </header>
  );
};

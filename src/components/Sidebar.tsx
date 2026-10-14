import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Binary,
  GitFork,
  Cpu,
  Layers,
  GraduationCap,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { useApp, ViewType } from '../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { currentView, setCurrentView, getOverallMastery } = useApp();
  const mastery = getOverallMastery();

  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'learn', label: 'Learn Topics', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'tutor', label: 'AI Tutor', icon: <Sparkles className="w-5 h-5 text-indigo-400" />, badge: 'AI' },
    { id: 'workbench', label: 'Grammar Workbench', icon: <Binary className="w-5 h-5" /> },
    { id: 'visualizer', label: 'Parse Tree Visualizer', icon: <GitFork className="w-5 h-5" /> },
    { id: 'simulator', label: 'Parser Simulator', icon: <Cpu className="w-5 h-5" /> },
    { id: 'pipeline', label: 'Compiler Pipeline', icon: <Layers className="w-5 h-5" /> },
    { id: 'quizzes', label: 'Quizzes', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'progress', label: 'My Progress', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-30 flex flex-col justify-between bg-[#0e1424] border-r border-slate-800/80 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Branding */}
      <div>
        <div className="flex items-center justify-between h-20 px-5 border-b border-slate-800/80">
          <div
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="font-bold text-base tracking-tight text-white block truncate">
                  AI Smart Compiler
                </span>
                <span className="text-xs text-indigo-400 font-mono block">
                  Interactive Tutor
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors hidden md:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <span className={`shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Mastery Widget */}
      <div className="p-4 border-t border-slate-800/80">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">Curriculum Mastery</span>
              <span className="font-mono font-semibold text-indigo-400">{mastery}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${mastery}%` }}
              />
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>College Project Demo</span>
              <span className="text-emerald-400 font-medium">v1.0 Ready</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-center" title={`Mastery: ${mastery}%`}>
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500/50 flex items-center justify-center font-mono text-[10px] font-bold text-indigo-300">
              {mastery}%
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { LearnView } from './views/LearnView';
import { AITutorView } from './views/AITutorView';
import { GrammarWorkbenchView } from './views/GrammarWorkbenchView';
import { ParseTreeVisualizerView } from './views/ParseTreeVisualizerView';
import { ParserSimulatorView } from './views/ParserSimulatorView';
import { CompilerPipelineView } from './views/CompilerPipelineView';
import { QuizzesView } from './views/QuizzesView';
import { ProgressView } from './views/ProgressView';

const MainLayout: React.FC = () => {
  const { currentView } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'learn':
        return <LearnView />;
      case 'tutor':
        return <AITutorView />;
      case 'workbench':
        return <GrammarWorkbenchView />;
      case 'visualizer':
        return <ParseTreeVisualizerView />;
      case 'simulator':
        return <ParserSimulatorView />;
      case 'pipeline':
        return <CompilerPipelineView />;
      case 'quizzes':
        return <QuizzesView />;
      case 'progress':
        return <ProgressView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'
        }`}
      >
        <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-[1600px] w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

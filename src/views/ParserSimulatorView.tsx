import React, { useState, useMemo, useEffect } from 'react';
import {
  Cpu,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  parseGrammarText,
  computeFirstAndFollow,
  buildLL1ParsingTable,
  PRESET_GRAMMARS,
} from '../compiler/grammarEngine';
import { simulateLL1Parser, ParseTraceStep } from '../compiler/parserSimulator';
import { useApp } from '../context/AppContext';

export const ParserSimulatorView: React.FC = () => {
  const { setCurrentView, setTutorInitialPrompt, setTutorAlgorithmContext } = useApp();

  const [inputString, setInputString] = useState<string>('id + id * id');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1000); // ms per step

  // Use the canonical LL(1) grammar
  const ll1Preset = PRESET_GRAMMARS[0];
  const { grammar } = useMemo(() => parseGrammarText(ll1Preset.grammarText), [ll1Preset]);
  const firstFollow = useMemo(() => computeFirstAndFollow(grammar), [grammar]);
  const ll1Table = useMemo(() => buildLL1ParsingTable(grammar, firstFollow), [grammar, firstFollow]);

  // Run deterministic simulation
  const simulation = useMemo(() => {
    return simulateLL1Parser(grammar, ll1Table, inputString);
  }, [grammar, ll1Table, inputString]);

  // Reset step on input change
  useEffect(() => {
    setActiveStepIndex(0);
    setIsPlaying(false);
  }, [inputString]);

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStepIndex(prev => {
          if (prev >= simulation.steps.length - 1) {
            setIsPlaying(false);
            return simulation.steps.length - 1;
          }
          return prev + 1;
        });
      }, playSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, simulation.steps.length, playSpeed]);

  const currentStep: ParseTraceStep = simulation.steps[activeStepIndex] || simulation.steps[0];

  const sendTraceToTutor = () => {
    setTutorAlgorithmContext({
      type: 'll1_simulation',
      inputString,
      currentStep,
      success: simulation.success,
    });
    setTutorInitialPrompt(`In this LL(1) parser step, why does the parser execute "${currentStep.action}" when stack top is "${currentStep.stack[currentStep.stack.length - 1]}" and lookahead is "${currentStep.lookahead}"?`);
    setCurrentView('tutor');
  };

  const getActionBadgeColor = (type: ParseTraceStep['actionType']) => {
    switch (type) {
      case 'expand':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'match':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'accept':
        return 'bg-green-500/30 text-green-200 border-green-500/50 font-bold';
      case 'error':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Controls & Input Bar */}
      <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">LL(1) Pushdown Automaton Simulator</h3>
              <p className="text-xs text-slate-400">Deterministic stack expansion, matching, and table lookups</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Quick Test Input:</span>
            {['id + id * id', '( id + id ) * id', 'id * id + id', 'id + + id (Error)'].map((s, i) => (
              <button
                key={i}
                onClick={() => setInputString(s.replace(' (Error)', ''))}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              value={inputString}
              onChange={e => setInputString(e.target.value)}
              placeholder="Enter space-separated tokens e.g. id + id * id"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
              disabled={activeStepIndex === 0}
              className="p-2 rounded-lg text-slate-300 hover:text-white disabled:text-slate-600 hover:bg-slate-800"
              title="Previous Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-slate-800"
              title={isPlaying ? 'Pause' : 'Play animation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setActiveStepIndex(prev => Math.min(simulation.steps.length - 1, prev + 1))}
              disabled={activeStepIndex >= simulation.steps.length - 1}
              className="p-2 rounded-lg text-slate-300 hover:text-white disabled:text-slate-600 hover:bg-slate-800"
              title="Next Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setActiveStepIndex(0);
                setIsPlaying(false);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={sendTraceToTutor}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explain Step with AI</span>
          </button>
        </div>
      </div>

      {/* Visual State Overview (Stack vs Input vs Action) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pushdown Stack State */}
        <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pushdown Stack
            </span>
            <span className="text-[10px] font-mono text-indigo-400">Top is at right</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 min-h-12 p-3 rounded-xl bg-slate-950 border border-slate-800">
            {currentStep.stack.map((sym, idx) => {
              const isTop = idx === currentStep.stack.length - 1;
              return (
                <span
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                    isTop
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/50 scale-105'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {sym}
                  {isTop && <span className="text-[9px] block text-indigo-200">TOP</span>}
                </span>
              );
            })}
          </div>
        </div>

        {/* Remaining Input Buffer */}
        <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Remaining Input Buffer
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Lookahead pointer</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 min-h-12 p-3 rounded-xl bg-slate-950 border border-slate-800">
            {currentStep.remainingInput.map((tok, idx) => {
              const isLookahead = idx === 0;
              return (
                <span
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                    isLookahead
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/50 scale-105'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {tok}
                  {isLookahead && <span className="text-[9px] block text-emerald-200">LOOK</span>}
                </span>
              );
            })}
          </div>
        </div>

        {/* Current Parser Action Card */}
        <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Action at Step {currentStep.step}
              </span>
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getActionBadgeColor(currentStep.actionType)}`}>
                {currentStep.actionType}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-2">
              {currentStep.action}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentStep.explanation}
            </p>
          </div>

          {currentStep.productionApplied && (
            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] font-mono text-indigo-300">
              Rule: {currentStep.productionApplied}
            </div>
          )}
        </div>
      </div>

      {/* Full Trace Execution Table */}
      <div className="rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>LL(1) Stack Execution Trace Table</span>
            <span className="text-xs text-slate-400 font-normal">({simulation.steps.length} total steps)</span>
          </h4>
          <div className="flex items-center gap-2 text-xs">
            {simulation.success ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Accepted Successfully</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>{simulation.message}</span>
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-10 text-slate-400">
                <th className="p-3.5 font-mono">Step</th>
                <th className="p-3.5 font-mono">Stack</th>
                <th className="p-3.5 font-mono">Remaining Input</th>
                <th className="p-3.5 font-mono">Action</th>
                <th className="p-3.5 font-mono">Pedagogical Explanation</th>
              </tr>
            </thead>
            <tbody>
              {simulation.steps.map((st, idx) => {
                const isActive = idx === activeStepIndex;
                return (
                  <tr
                    key={st.step}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`border-b border-slate-800/50 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-indigo-950/40 text-white font-semibold'
                        : 'hover:bg-slate-900/40 text-slate-300'
                    }`}
                  >
                    <td className="p-3.5 font-mono text-indigo-400 font-bold">
                      {st.step}
                    </td>
                    <td className="p-3.5 font-mono">
                      {st.stackDisplay}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {st.inputDisplay}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${getActionBadgeColor(st.actionType)}`}>
                        {st.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 max-w-md">
                      {st.explanation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

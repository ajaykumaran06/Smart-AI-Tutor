import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Table,
  Cpu,
  Zap,
} from 'lucide-react';
import { runCompilerPipeline, PipelinePhaseResult } from '../compiler/pipelineEngine';
import { useApp } from '../context/AppContext';

export const CompilerPipelineView: React.FC = () => {
  const { setCurrentView, setTutorInitialPrompt, setTutorAlgorithmContext } = useApp();

  const [sourceCode, setSourceCode] = useState<string>('x = 2 + 3 * 4');
  const [activePhaseId, setActivePhaseId] = useState<number>(2); // Default to Lexer

  const execution = useMemo(() => {
    return runCompilerPipeline(sourceCode);
  }, [sourceCode]);

  const activePhase = execution.phases.find(p => p.phaseId === activePhaseId) || execution.phases[1];

  const presetCodes = [
    { label: 'x = 2 + 3 * 4 (Constant Folding demo)', code: 'x = 2 + 3 * 4' },
    { label: 'total = base + bonus (Identifier evaluation)', code: 'total = base + bonus' },
    { label: 'val = 100 * 5 (Direct folding)', code: 'val = 100 * 5' },
  ];

  const sendPipelineToTutor = () => {
    setTutorAlgorithmContext({
      type: 'compiler_pipeline',
      sourceCode,
      activePhase: activePhase.name,
      phaseData: activePhase.data,
    });
    setTutorInitialPrompt(`In the compiler pipeline for "${sourceCode}", can you explain what happens during ${activePhase.name} and how it feeds into the subsequent compiler phases?`);
    setCurrentView('tutor');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Source Code Config Bar */}
      <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">7-Phase Educational Compiler Simulator</h3>
              <p className="text-xs text-slate-400">Step through analysis (front-end) and synthesis (back-end)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Preset Source:</span>
            {presetCodes.map((p, i) => (
              <button
                key={i}
                onClick={() => setSourceCode(p.code)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              >
                {p.code}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex-1 min-w-[320px]">
            <input
              type="text"
              value={sourceCode}
              onChange={e => setSourceCode(e.target.value)}
              placeholder="e.g. x = 2 + 3 * 4"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-violet-300 focus:outline-none focus:border-violet-500"
            />
          </div>

          <button
            onClick={sendPipelineToTutor}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explain Phase with AI</span>
          </button>
        </div>
      </div>

      {/* 7-Phase Stepper Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {execution.phases.map(phase => {
          const isActive = phase.phaseId === activePhaseId;
          const isErr = phase.status === 'error';

          return (
            <button
              key={phase.phaseId}
              onClick={() => setActivePhaseId(phase.phaseId)}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-violet-950/40 border-violet-500 text-white shadow-lg shadow-violet-950/30'
                  : isErr
                  ? 'bg-red-950/30 border-red-500/40 text-red-300'
                  : 'bg-[#0e1424] hover:bg-[#131a30] border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-violet-400 font-bold">
                  Phase {phase.phaseId}
                </span>
                {isErr ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <span className="text-xs font-bold block truncate">
                {phase.shortName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Phase Detailed Inspection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Phase Data Workspace (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{activePhase.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">
                  {activePhase.status === 'success' ? 'Validated' : 'Error'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{activePhase.summary}</p>
            </div>
          </div>

          {/* Phase-Specific Visual Output */}
          <div className="p-6 flex-1 space-y-6">
            {/* Phase 1: Source */}
            {activePhase.phaseId === 1 && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Raw Source Program Representation
                </h4>
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-indigo-300">
                  {activePhase.data.rawCode}
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>Total characters: {activePhase.data.charCount}</p>
                  <p>Line count: {activePhase.data.lines.length}</p>
                </div>
              </div>
            )}

            {/* Phase 2: Lexical Analysis */}
            {activePhase.phaseId === 2 && activePhase.data.tokens && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Scanned Tokens Table</span>
                  <span className="font-mono text-indigo-400">{activePhase.data.tokens.length} Tokens</span>
                </h4>
                <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                        <th className="p-3 font-mono">Index</th>
                        <th className="p-3 font-mono">Token Class</th>
                        <th className="p-3 font-mono">Lexeme Value</th>
                        <th className="p-3 font-mono">Character Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activePhase.data.tokens.map((tok: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-900/30">
                          <td className="p-3 font-mono text-slate-500">#{idx + 1}</td>
                          <td className="p-3 font-mono text-indigo-300 font-semibold">{tok.type}</td>
                          <td className="p-3 font-mono text-emerald-300 bg-slate-900/40">{tok.value}</td>
                          <td className="p-3 font-mono text-slate-400">Offset {tok.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Phase 3: Syntax Analysis */}
            {activePhase.phaseId === 3 && activePhase.data && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Syntactic AST Grouping
                </h4>
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="text-indigo-300">Target Assignment: {activePhase.data.target}</div>
                  <div className="text-slate-300">Expression: {activePhase.data.expressionString}</div>
                  <div className="text-amber-300">{activePhase.data.operatorHierarchy}</div>
                </div>
              </div>
            )}

            {/* Phase 4: Semantic Analysis */}
            {activePhase.phaseId === 4 && activePhase.data.symbolTable && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Symbol Table Structure
                </h4>
                <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                        <th className="p-3 font-mono">Variable Name</th>
                        <th className="p-3 font-mono">Inferred Type</th>
                        <th className="p-3 font-mono">Size in Memory</th>
                        <th className="p-3 font-mono">Scope</th>
                        <th className="p-3 font-mono">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activePhase.data.symbolTable.map((entry: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-800/50">
                          <td className="p-3 font-mono text-indigo-300 font-bold">{entry.name}</td>
                          <td className="p-3 font-mono text-emerald-300">{entry.type}</td>
                          <td className="p-3 font-mono text-slate-400">{entry.size} Bytes (32-bit)</td>
                          <td className="p-3 font-mono text-slate-400">{entry.scope}</td>
                          <td className="p-3 font-mono text-emerald-400">Declared & Initialized</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Phase 5: ICG (Three-Address Code & Quadruples) */}
            {activePhase.phaseId === 5 && activePhase.data && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Three-Address Code (TAC)
                  </h4>
                  <div className="space-y-2">
                    {activePhase.data.threeAddressCode.map((tac: any) => (
                      <div
                        key={tac.line}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-mono text-indigo-300 font-bold">{tac.statement}</span>
                        <span className="text-slate-400 text-[11px]">{tac.explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Quadruples Representation Table (op, arg1, arg2, result)
                  </h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                          <th className="p-2.5 font-mono">Index</th>
                          <th className="p-2.5 font-mono">Op</th>
                          <th className="p-2.5 font-mono">Arg 1</th>
                          <th className="p-2.5 font-mono">Arg 2</th>
                          <th className="p-2.5 font-mono">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activePhase.data.quadruples.map((q: any) => (
                          <tr key={q.index} className="border-b border-slate-800/50">
                            <td className="p-2.5 font-mono text-slate-500">({q.index})</td>
                            <td className="p-2.5 font-mono text-violet-300 font-bold">{q.op}</td>
                            <td className="p-2.5 font-mono text-slate-300">{q.arg1}</td>
                            <td className="p-2.5 font-mono text-slate-300">{q.arg2}</td>
                            <td className="p-2.5 font-mono text-indigo-300 font-bold">{q.result}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Phase 6: Optimization */}
            {activePhase.phaseId === 6 && activePhase.data && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Optimized Three-Address Code
                  </h4>
                  <div className="space-y-2">
                    {activePhase.data.optimizedTAC.map((tac: any) => (
                      <div
                        key={tac.line}
                        className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs"
                      >
                        <span className="font-mono text-emerald-300 font-bold">{tac.statement}</span>
                        <span className="text-slate-300 text-[11px]">{tac.explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Optimization Passes Applied
                  </h4>
                  <div className="space-y-2">
                    {activePhase.data.optimizationPasses.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Zap className={`w-3.5 h-3.5 ${p.applied ? 'text-amber-400' : 'text-slate-600'}`} />
                          <span className="font-bold text-white">{p.pass}</span>
                        </div>
                        <span className="text-slate-400">{p.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Phase 7: Target Code Generation */}
            {activePhase.phaseId === 7 && activePhase.data && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Target Assembly (Educational RISC/ARM)</span>
                  <span className="font-mono text-indigo-400">CPU Registers: R1, R2</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                  {activePhase.data.assembly.map((inst: any) => (
                    <div key={inst.line} className="flex items-center justify-between py-1 border-b border-slate-900">
                      <div className="flex items-center gap-4">
                        <span className="text-indigo-400 font-bold w-12">{inst.mnemonic}</span>
                        <span className="text-emerald-300 w-32">{inst.operands}</span>
                      </div>
                      <span className="text-slate-500 text-[11px] italic">; {inst.comment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Architectural Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-md space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Phase Explanation
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activePhase.details}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-md space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Front-End vs Back-End Division
            </h4>
            <div className="text-xs space-y-2 text-slate-400">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-indigo-400 font-bold block">Front-End (Analysis):</span>
                <span>Phases 1 through 5. Machine-independent representation.</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-violet-400 font-bold block">Back-End (Synthesis):</span>
                <span>Phases 6 and 7. Target hardware register allocation and CPU emission.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

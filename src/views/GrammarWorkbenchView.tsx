import React, { useState, useMemo } from 'react';
import {
  Binary,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Info,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import {
  parseGrammarText,
  computeFirstAndFollow,
  eliminateLeftRecursion,
  leftFactoring,
  buildLL1ParsingTable,
  PRESET_GRAMMARS,
  EPSILON,
  END_MARKER,
} from '../compiler/grammarEngine';
import { useApp } from '../context/AppContext';

export const GrammarWorkbenchView: React.FC = () => {
  const { setCurrentView, setTutorInitialPrompt, setTutorAlgorithmContext } = useApp();

  const [grammarInput, setGrammarInput] = useState<string>(PRESET_GRAMMARS[0].grammarText);
  const [activeTab, setActiveTab] = useState<'first-follow' | 'left-recursion' | 'left-factoring' | 'll1-table'>('first-follow');
  const [selectedCell, setSelectedCell] = useState<{ nt: string; term: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Parse grammar reactively
  const { grammar, errors } = useMemo(() => {
    return parseGrammarText(grammarInput);
  }, [grammarInput]);

  // Compute algorithms
  const firstFollowResult = useMemo(() => {
    if (errors.length > 0 || grammar.nonTerminals.length === 0) return null;
    return computeFirstAndFollow(grammar);
  }, [grammar, errors]);

  const leftRecursionResult = useMemo(() => {
    if (errors.length > 0 || grammar.nonTerminals.length === 0) return null;
    return eliminateLeftRecursion(grammar);
  }, [grammar, errors]);

  const leftFactoringResult = useMemo(() => {
    if (errors.length > 0 || grammar.nonTerminals.length === 0) return null;
    return leftFactoring(grammar);
  }, [grammar, errors]);

  const ll1TableResult = useMemo(() => {
    if (!firstFollowResult || errors.length > 0) return null;
    return buildLL1ParsingTable(grammar, firstFollowResult);
  }, [grammar, firstFollowResult, errors]);

  const handlePresetSelect = (presetId: string) => {
    const preset = PRESET_GRAMMARS.find(p => p.id === presetId);
    if (preset) {
      setGrammarInput(preset.grammarText);
      setSelectedCell(null);
    }
  };

  const sendToTutor = (algorithmType: string) => {
    let ctx: any = null;
    let prompt = '';

    if (algorithmType === 'first_follow' && firstFollowResult) {
      ctx = {
        type: 'first_follow',
        grammar: grammarInput,
        firstSets: firstFollowResult.firstSets,
        followSets: firstFollowResult.followSets,
      };
      prompt = 'Can you explain step-by-step why these FIRST and FOLLOW sets were derived for my grammar?';
    } else if (algorithmType === 'left_recursion' && leftRecursionResult) {
      ctx = {
        type: 'left_recursion',
        grammar: grammarInput,
        hasLeftRecursion: leftRecursionResult.hasLeftRecursion,
        rulesTransformed: leftRecursionResult.rulesTransformed,
      };
      prompt = 'Why was immediate left recursion eliminated this way and why does this prevent infinite loops in LL(1) parsing?';
    } else if (algorithmType === 'll1_table' && ll1TableResult) {
      ctx = {
        type: 'll1_table',
        grammar: grammarInput,
        isLL1: ll1TableResult.isLL1,
        conflicts: ll1TableResult.conflicts,
      };
      prompt = `Is my grammar LL(1)? Can you explain why ${ll1TableResult.isLL1 ? 'no conflicts occurred' : 'the parsing table has conflicts'}?`;
    }

    if (ctx) {
      setTutorAlgorithmContext(ctx);
      setTutorInitialPrompt(prompt);
      setCurrentView('tutor');
    }
  };

  const copyGrammar = () => {
    navigator.clipboard.writeText(grammarInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Presets Selector */}
      <div className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Grammar Analysis Engine</h3>
            <p className="text-xs text-slate-400">Deterministic context-free grammar algorithms</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Load Preset:</span>
          {PRESET_GRAMMARS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              {preset.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Grammar Editor (5 columns) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-xl overflow-hidden flex flex-col h-[740px]">
          <div className="px-5 py-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-300">
              Grammar Editor (CFG)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={copyGrammar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setGrammarInput(PRESET_GRAMMARS[0].grammarText)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors"
                title="Reset grammar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 bg-[#0a0e17] flex flex-col">
            <textarea
              value={grammarInput}
              onChange={e => setGrammarInput(e.target.value)}
              placeholder="Enter grammar productions:
E -> E + T | T
T -> T * F | F
F -> ( E ) | id"
              className="w-full flex-1 bg-transparent text-sm font-mono text-indigo-200 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Grammar Metadata & Validation */}
          <div className="p-4 bg-slate-900/60 border-t border-slate-800/80 space-y-3">
            {errors.length > 0 ? (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Grammar Format Error</span>
                </div>
                {errors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            ) : (
              <div className="text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Start Symbol:</span>
                  <span className="font-mono text-indigo-300 font-bold">{grammar.startSymbol}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Non-Terminals:</span>
                  <span className="font-mono text-slate-300">{grammar.nonTerminals.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Terminals:</span>
                  <span className="font-mono text-slate-300">{grammar.terminals.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Total Productions:</span>
                  <span className="font-mono text-slate-300">{grammar.productions.length}</span>
                </div>
              </div>
            )}
            <div className="text-[11px] text-slate-500">
              * Use <code>-&gt;</code> or <code>→</code> for productions. Use <code>|</code> for alternatives. Use <code>ε</code> or <code>epsilon</code> for empty transitions.
            </div>
          </div>
        </div>

        {/* Right Column: Algorithms & Results Panel (7 columns) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-xl overflow-hidden flex flex-col h-[740px]">
          {/* Results Tabs Header */}
          <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto gap-2">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'first-follow', label: 'FIRST & FOLLOW Sets' },
                { id: 'left-recursion', label: 'Left Recursion' },
                { id: 'left-factoring', label: 'Left Factoring' },
                { id: 'll1-table', label: 'LL(1) Table' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => sendToTutor(activeTab.replace('-', '_'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Explain with AI</span>
            </button>
          </div>

          {/* Results Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: FIRST & FOLLOW */}
            {activeTab === 'first-follow' && firstFollowResult && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3">
                    Calculated FIRST & FOLLOW Sets
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* FIRST Sets Card */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
                      <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span>FIRST Sets</span>
                      </h5>
                      <div className="space-y-1.5 text-xs font-mono">
                        {Object.entries(firstFollowResult.firstSets).map(([nt, set]) => (
                          <div key={nt} className="flex items-center justify-between p-2 rounded bg-slate-950/60">
                            <span className="text-indigo-300 font-bold">FIRST({nt}) =</span>
                            <span className="text-slate-200 font-bold">
                              {'{ ' + (set.length > 0 ? set.join(', ') : '∅') + ' }'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FOLLOW Sets Card */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
                      <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-400" />
                        <span>FOLLOW Sets</span>
                      </h5>
                      <div className="space-y-1.5 text-xs font-mono">
                        {Object.entries(firstFollowResult.followSets).map(([nt, set]) => (
                          <div key={nt} className="flex items-center justify-between p-2 rounded bg-slate-950/60">
                            <span className="text-violet-300 font-bold">FOLLOW({nt}) =</span>
                            <span className="text-slate-200 font-bold">
                              {'{ ' + (set.length > 0 ? set.join(', ') : '∅') + ' }'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Steps / Derivation Log */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Deterministic Step-by-Step Derivation Audit
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {firstFollowResult.firstSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                      >
                        <span className="text-indigo-400 font-mono text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded">
                          FIRST
                        </span>
                        <span className="flex-1">{step.step}</span>
                      </div>
                    ))}
                    {firstFollowResult.followSteps.map((step, idx) => (
                      <div
                        key={`follow-${idx}`}
                        className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                      >
                        <span className="text-violet-400 font-mono text-[10px] bg-violet-500/10 px-1.5 py-0.5 rounded">
                          FOLLOW
                        </span>
                        <span className="flex-1">{step.step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LEFT RECURSION */}
            {activeTab === 'left-recursion' && leftRecursionResult && (
              <div className="space-y-6">
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    leftRecursionResult.hasLeftRecursion
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                      : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    {leftRecursionResult.hasLeftRecursion ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>
                      {leftRecursionResult.hasLeftRecursion
                        ? 'Immediate Left Recursion Detected!'
                        : 'No Immediate Left Recursion Found (Grammar is already top-down safe)'}
                    </span>
                  </div>
                  {leftRecursionResult.hasLeftRecursion && (
                    <button
                      onClick={() => {
                        const newText = leftRecursionResult.eliminatedGrammar.productions
                          .map(p => `${p.lhs} -> ${p.rawRhs}`)
                          .join('\n');
                        setGrammarInput(newText);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all cursor-pointer"
                    >
                      Apply Transformed Grammar to Editor
                    </button>
                  )}
                </div>

                {leftRecursionResult.hasLeftRecursion && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Standard Transformation Details
                    </h4>
                    {leftRecursionResult.rulesTransformed.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                        <div className="text-xs font-mono text-indigo-300 font-bold">
                          Non-terminal: {item.originalLhs}
                        </div>
                        <p className="text-xs text-slate-400">{item.explanation}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                          <div className="p-2 rounded bg-slate-950">
                            <span className="text-slate-500 block text-[10px]">Recursive Suffixes (α):</span>
                            <span className="text-amber-300">{item.recursiveAlphas.join(', ')}</span>
                          </div>
                          <div className="p-2 rounded bg-slate-950">
                            <span className="text-slate-500 block text-[10px]">Base Non-recursive (β):</span>
                            <span className="text-emerald-300">{item.betas.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
                      <span className="text-xs font-mono font-semibold text-slate-400 block">
                        Resulting Non-Left-Recursive Grammar:
                      </span>
                      <pre className="text-xs font-mono text-indigo-200">
                        {leftRecursionResult.eliminatedGrammar.productions
                          .map(p => `${p.lhs} -> ${p.rawRhs}`)
                          .join('\n')}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: LEFT FACTORING */}
            {activeTab === 'left-factoring' && leftFactoringResult && (
              <div className="space-y-6">
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    leftFactoringResult.hasFactoringNeeded
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                      : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    {leftFactoringResult.hasFactoringNeeded ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>
                      {leftFactoringResult.hasFactoringNeeded
                        ? 'Common Prefixes Detected (Left Factoring Needed)!'
                        : 'No Common Prefixes Found (Grammar is already left-factored)'}
                    </span>
                  </div>
                </div>

                {leftFactoringResult.hasFactoringNeeded && (
                  <div className="space-y-4">
                    {leftFactoringResult.factoredRules.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
                        <span className="font-mono text-indigo-300 font-bold block">
                          Rule: {item.lhs}
                        </span>
                        <p className="text-slate-400">{item.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: LL(1) TABLE */}
            {activeTab === 'll1-table' && ll1TableResult && (
              <div className="space-y-6">
                {/* Status Callout */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    ll1TableResult.isLL1
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    {ll1TableResult.isLL1 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span>
                      {ll1TableResult.isLL1
                        ? 'Grammar satisfies LL(1) conditions (Deterministic top-down parsable)'
                        : `LL(1) Conflicts detected (${ll1TableResult.conflicts.length} ambiguous cell/cells)`}
                    </span>
                  </div>
                </div>

                {/* 2D Table Display */}
                <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/70">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/80 border-b border-slate-800">
                        <th className="p-3 font-mono font-bold text-slate-400 border-r border-slate-800 sticky left-0 bg-slate-900">
                          Non-Term
                        </th>
                        {ll1TableResult.terminals.map(term => (
                          <th key={term} className="p-3 font-mono font-bold text-indigo-300 text-center border-r border-slate-800 min-w-28">
                            {term}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ll1TableResult.nonTerminals.map(nt => (
                        <tr key={nt} className="border-b border-slate-800/60 hover:bg-slate-900/30">
                          <td className="p-3 font-mono font-bold text-indigo-300 border-r border-slate-800 sticky left-0 bg-slate-950">
                            {nt}
                          </td>
                          {ll1TableResult.terminals.map(term => {
                            const prods = ll1TableResult.table[nt]?.[term] || [];
                            const isConflict = prods.length > 1;
                            const isSelected = selectedCell?.nt === nt && selectedCell?.term === term;

                            return (
                              <td
                                key={term}
                                onClick={() => setSelectedCell({ nt, term })}
                                className={`p-2.5 font-mono text-center border-r border-slate-800 cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-indigo-600/30 ring-2 ring-indigo-500'
                                    : isConflict
                                    ? 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50'
                                    : prods.length > 0
                                    ? 'text-slate-200 hover:bg-slate-800/60'
                                    : 'text-slate-700 hover:bg-slate-900/40'
                                }`}
                              >
                                {prods.length > 0 ? (
                                  prods.map((p, pIdx) => (
                                    <div key={pIdx} className="truncate">
                                      {nt} → {p.rawRhs}
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-slate-700">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Selected Cell Inspector */}
                {selectedCell && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-indigo-300 font-bold">
                        Inspector: Table Entry M[{selectedCell.nt}, {selectedCell.term}]
                      </span>
                      <button
                        onClick={() => setSelectedCell(null)}
                        className="text-slate-500 hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                    {(() => {
                      const prods = ll1TableResult.table[selectedCell.nt]?.[selectedCell.term] || [];
                      if (prods.length === 0) {
                        return (
                          <p className="text-xs text-slate-400">
                            This cell is an <strong>Error Entry</strong>. If the parser has '{selectedCell.nt}' on the stack and sees '{selectedCell.term}', a syntax error is signaled because no production of '{selectedCell.nt}' can derive a sentence starting with '{selectedCell.term}'.
                          </p>
                        );
                      }
                      if (prods.length > 1) {
                        return (
                          <div className="text-xs text-amber-300 space-y-1">
                            <p className="font-semibold">⚠️ LL(1) Conflict!</p>
                            <p>
                              Multiple candidate rules compete for M[{selectedCell.nt}, {selectedCell.term}]: {prods.map(p => `${selectedCell.nt} -> ${p.rawRhs}`).join(' AND ')}. The parser cannot make a deterministic choice with 1 token of lookahead.
                            </p>
                          </div>
                        );
                      }
                      return (
                        <p className="text-xs text-slate-300">
                          Production <strong>{selectedCell.nt} → {prods[0].rawRhs}</strong> is chosen whenever the parser encounters lookahead symbol '{selectedCell.term}' because '{selectedCell.term}' is either in FIRST({prods[0].rawRhs}) or in FOLLOW({selectedCell.nt}) due to an epsilon derivation.
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

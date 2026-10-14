import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  GitFork,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  generateExpressionParseTree,
  generateAST,
  TreeNode,
  TreeLayoutResult,
} from '../compiler/parseTreeEngine';
import { useApp } from '../context/AppContext';

export const ParseTreeVisualizerView: React.FC = () => {
  const { setCurrentView, setTutorInitialPrompt, setTutorAlgorithmContext } = useApp();

  const [expression, setExpression] = useState<string>('id + id * id');
  const [treeMode, setTreeMode] = useState<'parse-tree' | 'ast'>('parse-tree');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // Animation controls
  const [currentStep, setCurrentStep] = useState<number>(999);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const presetExpressions = [
    { label: 'id + id * id (Precedence test)', val: 'id + id * id' },
    { label: '( id + id ) * id (Parentheses grouping)', val: '( id + id ) * id' },
    { label: '2 + 3 * 4 (Numeric evaluation)', val: '2 + 3 * 4' },
    { label: 'a * b + c * d (Dual terms)', val: 'a * b + c * d' },
  ];

  const treeResult: TreeLayoutResult = useMemo(() => {
    return treeMode === 'parse-tree'
      ? generateExpressionParseTree(expression)
      : generateAST(expression);
  }, [expression, treeMode]);

  // Set step to max when tree changes
  useEffect(() => {
    setCurrentStep(treeResult.totalSteps);
    setIsPlaying(false);
  }, [treeResult]);

  // Animation loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= treeResult.totalSteps) {
            setIsPlaying(false);
            return treeResult.totalSteps;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(timer);
  }, [isPlaying, treeResult.totalSteps]);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(2.5, Math.max(0.4, prev + delta)));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const sendTreeToTutor = () => {
    setTutorAlgorithmContext({
      type: 'parse_tree',
      expression,
      treeMode,
      operatorPrecedence: 'Multiplication (*) binds tighter than addition (+)',
    });
    setTutorInitialPrompt(`Can you explain why the parse tree for "${expression}" has this specific shape and how operator precedence is represented?`);
    setCurrentView('tutor');
  };

  // Node styling helper
  const getNodeColor = (type: TreeNode['type'], isSelected: boolean) => {
    if (isSelected) {
      return {
        fill: '#4f46e5',
        stroke: '#818cf8',
        text: '#ffffff',
      };
    }
    switch (type) {
      case 'root':
        return { fill: '#1e1b4b', stroke: '#6366f1', text: '#c7d2fe' };
      case 'non-terminal':
        return { fill: '#0f172a', stroke: '#3b82f6', text: '#93c5fd' };
      case 'operator':
        return { fill: '#311042', stroke: '#c084fc', text: '#f3e8ff' };
      case 'identifier':
      case 'number':
      case 'terminal':
        return { fill: '#064e3b', stroke: '#10b981', text: '#a7f3d0' };
      default:
        return { fill: '#1e293b', stroke: '#64748b', text: '#e2e8f0' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Controls Bar */}
      <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Interactive Tree Visualizer</h3>
              <p className="text-xs text-slate-400">Operator Precedence & Concrete vs Abstract Syntax Trees</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setTreeMode('parse-tree')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                treeMode === 'parse-tree'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Parse Tree (CST)
            </button>
            <button
              onClick={() => setTreeMode('ast')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                treeMode === 'ast'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Abstract Syntax Tree (AST)
            </button>
          </div>
        </div>

        {/* Input Bar & Presets */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex-1 min-w-[280px]">
            <input
              type="text"
              value={expression}
              onChange={e => setExpression(e.target.value)}
              placeholder="e.g. id + id * id or ( a + b ) * c"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Preset:</span>
            <select
              value={expression}
              onChange={e => setExpression(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
            >
              {presetExpressions.map((p, i) => (
                <option key={i} value={p.val}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={sendTreeToTutor}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explain Tree with AI</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Canvas Workspace (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-[#080d1a] border border-slate-800/80 shadow-2xl relative overflow-hidden h-[640px] flex flex-col">
          {/* Canvas Floating Overlay Controls */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 p-1 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800">
            <button
              onClick={() => handleZoom(0.15)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(-0.15)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-2">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Construction Animation Step Controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 p-2 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              title="Previous Step"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-slate-800"
              title={isPlaying ? 'Pause' : 'Play animation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setCurrentStep(prev => Math.min(treeResult.totalSteps, prev + 1))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              title="Next Step"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-2">
              Step {Math.min(currentStep, treeResult.totalSteps)} / {treeResult.totalSteps}
            </span>
          </div>

          {/* SVG Canvas Area */}
          <div
            ref={containerRef}
            className="flex-1 w-full h-full overflow-auto cursor-grab active:cursor-grabbing p-10 flex items-center justify-center"
          >
            <svg
              width={Math.max(treeResult.width * zoom, 700)}
              height={Math.max(treeResult.height * zoom, 500)}
              viewBox={`0 0 ${treeResult.width} ${treeResult.height}`}
              className="transition-transform duration-100 ease-out"
            >
              {/* Edges */}
              {treeResult.edges.map((edge, idx) => {
                const targetNode = treeResult.allNodes.find(n => n.id === edge.to);
                if (targetNode && targetNode.stepIndex > currentStep) return null;

                return (
                  <line
                    key={idx}
                    x1={edge.fromPos[0]}
                    y1={edge.fromPos[1]}
                    x2={edge.toPos[0]}
                    y2={edge.toPos[1]}
                    stroke="#334155"
                    strokeWidth="2.5"
                    strokeDasharray="none"
                  />
                );
              })}

              {/* Nodes */}
              {treeResult.allNodes.map(node => {
                if (node.stepIndex > currentStep) return null;
                const isSelected = selectedNode?.id === node.id;
                const colors = getNodeColor(node.type, isSelected);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    {/* Circle Node */}
                    <circle
                      r={node.type === 'operator' || node.type === 'root' ? 24 : 22}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={isSelected ? '3' : '2'}
                      className="transition-all group-hover:scale-110"
                    />
                    {/* Label */}
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fill={colors.text}
                      fontSize={node.label.length > 3 ? '11px' : '13px'}
                      fontWeight="bold"
                      fontFamily="var(--font-mono)"
                      pointerEvents="none"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Canvas Legend */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#1e1b4b] border border-indigo-500" />
              <span>Root Expression (E)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0f172a] border border-blue-500" />
              <span>Non-Terminal (T, F)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#311042] border border-purple-500" />
              <span>Operator (+, *)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#064e3b] border border-emerald-500" />
              <span>Terminal / Leaf (id, num)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Node Inspector & Precedence Notes (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Node Details Drawer */}
          <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Node Inspector
              </h4>
              {selectedNode && (
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-500 hover:text-white text-xs"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Symbol Label:</span>
                  <span className="font-mono text-base font-bold text-indigo-300">
                    {selectedNode.label}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Syntactic Role:</span>
                  <span className="font-mono text-slate-200 capitalize">
                    {selectedNode.type}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Tree Depth:</span>
                  <span className="font-mono text-slate-200">
                    Level {selectedNode.depth}
                  </span>
                </div>

                {selectedNode.ruleApplied && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Production Rule Applied:</span>
                    <span className="font-mono text-indigo-300 font-bold block">
                      {selectedNode.ruleApplied}
                    </span>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 leading-relaxed">
                  {selectedNode.explanation}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                Click any tree node on the canvas to inspect its depth, derivation rule, and operator semantics.
              </div>
            )}
          </div>

          {/* Academic Precedence Explanation */}
          <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-md space-y-3 text-xs">
            <h4 className="font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>How Precedence is Structured in Trees</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Notice that in the parse tree for <code>id + id * id</code>, the multiplication subtree (<code>T * F</code>) appears <strong>deeper</strong> in the tree than addition (<code>E + T</code>).
            </p>
            <p className="text-slate-400 leading-relaxed">
              Because evaluation traverses from leaves toward root, nodes deeper in the tree execute <strong>first</strong>. This is how context-free grammars enforce mathematical operator precedence without special-case logic!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

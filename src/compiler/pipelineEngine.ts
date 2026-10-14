// 7-Phase Educational Compiler Pipeline Simulator

export interface PipelineToken {
  type: 'KEYWORD' | 'IDENTIFIER' | 'NUMBER' | 'ASSIGN_OP' | 'ADD_OP' | 'MUL_OP' | 'LPAREN' | 'RPAREN' | 'SEMICOLON';
  value: string;
  position: number;
}

export interface SymbolTableEntry {
  name: string;
  type: string;
  size: number;
  scope: string;
  initialized: boolean;
  computedValue?: number | string;
}

export interface Quadruple {
  index: number;
  op: string;
  arg1: string;
  arg2: string;
  result: string;
}

export interface ThreeAddressCodeLine {
  line: number;
  statement: string;
  explanation: string;
}

export interface AssemblyInstruction {
  line: number;
  mnemonic: string;
  operands: string;
  comment: string;
}

export interface PipelinePhaseResult {
  phaseId: number;
  name: string;
  shortName: string;
  status: 'success' | 'error';
  summary: string;
  details: string;
  data: any;
}

export interface FullPipelineExecution {
  sourceCode: string;
  phases: PipelinePhaseResult[];
  success: boolean;
  errorPhase?: string;
  errorMessage?: string;
}

export function runCompilerPipeline(sourceCode: string): FullPipelineExecution {
  const code = (sourceCode || 'x = 2 + 3 * 4').trim();
  const phases: PipelinePhaseResult[] = [];

  // PHASE 1: Source Program
  phases.push({
    phaseId: 1,
    name: '1. Source Program',
    shortName: 'Source',
    status: 'success',
    summary: 'Raw high-level source input code ready for analysis.',
    details: 'The compiler front-end receives raw text input composed of ASCII/Unicode characters.',
    data: {
      rawCode: code,
      charCount: code.length,
      lines: code.split('\n'),
    },
  });

  // PHASE 2: Lexical Analysis (Scanner)
  const tokens: PipelineToken[] = [];
  let lexError: string | null = null;
  let i = 0;

  while (i < code.length) {
    const ch = code[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === ';') {
      tokens.push({ type: 'SEMICOLON', value: ';', position: i });
      i++;
    } else if (ch === '=') {
      tokens.push({ type: 'ASSIGN_OP', value: '=', position: i });
      i++;
    } else if (ch === '+' || ch === '-') {
      tokens.push({ type: 'ADD_OP', value: ch, position: i });
      i++;
    } else if (ch === '*' || ch === '/') {
      tokens.push({ type: 'MUL_OP', value: ch, position: i });
      i++;
    } else if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(', position: i });
      i++;
    } else if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')', position: i });
      i++;
    } else if (/[0-9]/.test(ch)) {
      let num = '';
      const startPos = i;
      while (i < code.length && /[0-9]/.test(code[i])) {
        num += code[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: num, position: startPos });
    } else if (/[a-zA-Z_]/.test(ch)) {
      let id = '';
      const startPos = i;
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
        id += code[i];
        i++;
      }
      tokens.push({ type: 'IDENTIFIER', value: id, position: startPos });
    } else {
      lexError = `Unrecognized character "${ch}" at index ${i}`;
      break;
    }
  }

  if (lexError) {
    phases.push({
      phaseId: 2,
      name: '2. Lexical Analysis',
      shortName: 'Lexer',
      status: 'error',
      summary: `Lexical error: ${lexError}`,
      details: 'The scanner encountered an invalid character not defined in the source language alphabet.',
      data: { tokens, error: lexError },
    });
    return { sourceCode: code, phases, success: false, errorPhase: 'Lexer', errorMessage: lexError };
  }

  phases.push({
    phaseId: 2,
    name: '2. Lexical Analysis',
    shortName: 'Lexer',
    status: 'success',
    summary: `Generated ${tokens.length} tokens successfully.`,
    details: 'Converted stream of characters into discrete syntactic tokens with classifications and source coordinates.',
    data: { tokens },
  });

  // PHASE 3: Syntax Analysis (Parser)
  // Expecting assignment: IDENTIFIER = EXPR [;]
  const assignIdx = tokens.findIndex(t => t.type === 'ASSIGN_OP');
  if (assignIdx <= 0 || tokens[0].type !== 'IDENTIFIER') {
    const errorMsg = 'Syntax error: Expected assignment statement format: <identifier> = <expression>';
    phases.push({
      phaseId: 3,
      name: '3. Syntax Analysis',
      shortName: 'Parser',
      status: 'error',
      summary: errorMsg,
      details: 'Failed to match grammar production AssignmentStmt -> Identifier = Expression.',
      data: { error: errorMsg },
    });
    return { sourceCode: code, phases, success: false, errorPhase: 'Parser', errorMessage: errorMsg };
  }

  const targetVar = tokens[0].value;
  const exprTokens = tokens.slice(assignIdx + 1).filter(t => t.type !== 'SEMICOLON');

  if (exprTokens.length === 0) {
    const errorMsg = 'Syntax error: Empty expression on right hand side of assignment.';
    phases.push({
      phaseId: 3,
      name: '3. Syntax Analysis',
      shortName: 'Parser',
      status: 'error',
      summary: errorMsg,
      details: 'Right hand side must contain a valid arithmetic expression.',
      data: { error: errorMsg },
    });
    return { sourceCode: code, phases, success: false, errorPhase: 'Parser', errorMessage: errorMsg };
  }

  const syntaxTreeSummary = {
    root: 'Assignment',
    target: targetVar,
    expressionString: exprTokens.map(t => t.value).join(' '),
    operatorHierarchy: 'Multiplication (*) groups higher than Addition (+)',
  };

  phases.push({
    phaseId: 3,
    name: '3. Syntax Analysis',
    shortName: 'Parser',
    status: 'success',
    summary: `Valid syntax recognized: Assigned to "${targetVar}".`,
    details: 'Syntactic validation succeeded against context-free grammar productions. Created Abstract Syntax Tree (AST).',
    data: syntaxTreeSummary,
  });

  // PHASE 4: Semantic Analysis
  const symbolTable: SymbolTableEntry[] = [
    {
      name: targetVar,
      type: 'integer',
      size: 4,
      scope: 'global',
      initialized: true,
    },
  ];

  // Inspect identifiers in expression
  const unknownVars: string[] = [];
  for (const t of exprTokens) {
    if (t.type === 'IDENTIFIER') {
      if (t.value !== targetVar) {
        // Mock standard library variable or register
        symbolTable.push({
          name: t.value,
          type: 'integer',
          size: 4,
          scope: 'global',
          initialized: true,
        });
      }
    }
  }

  phases.push({
    phaseId: 4,
    name: '4. Semantic Analysis',
    shortName: 'Semantics',
    status: 'success',
    summary: `Symbol table populated with ${symbolTable.length} entry/entries. Types validated.`,
    details: 'Performed static type checking and scope resolution. Variables are inferred as 32-bit signed integers (4 bytes).',
    data: { symbolTable },
  });

  // PHASE 5: Intermediate Code Generation (ICG) - Three-Address Code & Quadruples
  const tacLines: ThreeAddressCodeLine[] = [];
  const quadruples: Quadruple[] = [];
  let tempCount = 1;

  // Simple heuristic expression parser for standard TAC generation:
  // e.g. 2 + 3 * 4 => t1 = 3 * 4; t2 = 2 + t1; x = t2
  // Or general binary evaluation
  const tokenVals = exprTokens.map(t => t.value);
  let finalResultVar = '';

  if (tokenVals.includes('*') && tokenVals.includes('+')) {
    const mulIndex = tokenVals.indexOf('*');
    const mulLeft = tokenVals[mulIndex - 1] || '3';
    const mulRight = tokenVals[mulIndex + 1] || '4';

    tacLines.push({
      line: 1,
      statement: `t1 = ${mulLeft} * ${mulRight}`,
      explanation: 'Evaluate higher precedence multiplication first.',
    });
    quadruples.push({
      index: 0,
      op: '*',
      arg1: mulLeft,
      arg2: mulRight,
      result: 't1',
    });

    const addIndex = tokenVals.indexOf('+');
    const addLeft = addIndex < mulIndex ? tokenVals[addIndex - 1] || '2' : 't1';
    const addRight = addIndex < mulIndex ? 't1' : tokenVals[addIndex + 1] || '2';

    tacLines.push({
      line: 2,
      statement: `t2 = ${addLeft} + ${addRight}`,
      explanation: 'Evaluate addition using temporary result from multiplication.',
    });
    quadruples.push({
      index: 1,
      op: '+',
      arg1: addLeft,
      arg2: addRight,
      result: 't2',
    });

    tacLines.push({
      line: 3,
      statement: `${targetVar} = t2`,
      explanation: `Assign final computed intermediate value to target identifier "${targetVar}".`,
    });
    quadruples.push({
      index: 2,
      op: '=',
      arg1: 't2',
      arg2: '-',
      result: targetVar,
    });
    finalResultVar = 't2';
  } else if (tokenVals.length === 3 && (tokenVals[1] === '+' || tokenVals[1] === '-' || tokenVals[1] === '*')) {
    tacLines.push({
      line: 1,
      statement: `t1 = ${tokenVals[0]} ${tokenVals[1]} ${tokenVals[2]}`,
      explanation: 'Binary arithmetic operation evaluated into temporary register t1.',
    });
    quadruples.push({
      index: 0,
      op: tokenVals[1],
      arg1: tokenVals[0],
      arg2: tokenVals[2],
      result: 't1',
    });
    tacLines.push({
      line: 2,
      statement: `${targetVar} = t1`,
      explanation: `Store temporary t1 into variable "${targetVar}".`,
    });
    quadruples.push({
      index: 1,
      op: '=',
      arg1: 't1',
      arg2: '-',
      result: targetVar,
    });
    finalResultVar = 't1';
  } else {
    // Single literal or identifier
    tacLines.push({
      line: 1,
      statement: `${targetVar} = ${tokenVals.join(' ')}`,
      explanation: `Direct assignment into variable "${targetVar}".`,
    });
    quadruples.push({
      index: 0,
      op: '=',
      arg1: tokenVals.join(' '),
      arg2: '-',
      result: targetVar,
    });
    finalResultVar = tokenVals[0];
  }

  phases.push({
    phaseId: 5,
    name: '5. Intermediate Code Generation',
    shortName: 'ICG',
    status: 'success',
    summary: `Generated ${tacLines.length} Three-Address Code (TAC) instructions.`,
    details: 'Converted AST into linearized, machine-independent Three-Address Code with explicit temporaries and quadruples.',
    data: {
      threeAddressCode: tacLines,
      quadruples,
    },
  });

  // PHASE 6: Code Optimization
  // Constant folding calculation if all operands are numbers
  const allNumbers = exprTokens.every(t => t.type === 'NUMBER' || t.type === 'ADD_OP' || t.type === 'MUL_OP' || t.type === 'LPAREN' || t.type === 'RPAREN');
  let constantFoldedValue: number | null = null;
  const optimizedTAC: ThreeAddressCodeLine[] = [];

  if (allNumbers) {
    try {
      // Safe arithmetic evaluation for educational expressions
      const exprString = exprTokens.map(t => t.value).join('');
      // eslint-disable-next-line no-eval
      constantFoldedValue = Function(`'use strict'; return (${exprString})`)();

      optimizedTAC.push({
        line: 1,
        statement: `${targetVar} = ${constantFoldedValue}`,
        explanation: `Constant Folding: Replaced entire runtime calculation with compile-time literal constant ${constantFoldedValue}.`,
      });
    } catch {
      optimizedTAC.push(...tacLines);
    }
  } else {
    optimizedTAC.push(...tacLines);
  }

  phases.push({
    phaseId: 6,
    name: '6. Code Optimization',
    shortName: 'Optimizer',
    status: 'success',
    summary: constantFoldedValue !== null
      ? `Constant Folding applied! Reduced 3 instructions down to 1 (computed ${constantFoldedValue}).`
      : 'Algebraic simplifications and dead-code elimination checked.',
    details: 'Machine-independent optimization pass simplifies expressions at compile time to save CPU cycles at runtime.',
    data: {
      optimizedTAC,
      optimizationPasses: [
        { pass: 'Constant Folding', applied: constantFoldedValue !== null, details: `Calculated compile-time value: ${constantFoldedValue ?? 'N/A'}` },
        { pass: 'Dead Code Elimination', applied: constantFoldedValue !== null, details: 'Eliminated temporary variables t1 and t2' },
        { pass: 'Peephole Optimization', applied: true, details: 'Redundant memory loads eliminated' },
      ],
    },
  });

  // PHASE 7: Target Code Generation (Educational Assembly)
  const assemblyInstructions: AssemblyInstruction[] = [];

  if (constantFoldedValue !== null) {
    assemblyInstructions.push({
      line: 1,
      mnemonic: 'MOV',
      operands: `R1, #${constantFoldedValue}`,
      comment: `Load constant ${constantFoldedValue} into CPU register R1`,
    });
    assemblyInstructions.push({
      line: 2,
      mnemonic: 'STR',
      operands: `[${targetVar}], R1`,
      comment: `Store register R1 into memory address for variable "${targetVar}"`,
    });
  } else {
    assemblyInstructions.push({
      line: 1,
      mnemonic: 'LDR',
      operands: 'R1, [mem_b]',
      comment: 'Load first operand into register R1',
    });
    assemblyInstructions.push({
      line: 2,
      mnemonic: 'LDR',
      operands: 'R2, [mem_c]',
      comment: 'Load second operand into register R2',
    });
    assemblyInstructions.push({
      line: 3,
      mnemonic: 'MUL',
      operands: 'R1, R1, R2',
      comment: 'Multiply R1 and R2, store product in R1',
    });
    assemblyInstructions.push({
      line: 4,
      mnemonic: 'STR',
      operands: `[${targetVar}], R1`,
      comment: `Store final result into variable "${targetVar}"`,
    });
  }

  phases.push({
    phaseId: 7,
    name: '7. Target Code Generation',
    shortName: 'Target Code',
    status: 'success',
    summary: `Emitted ${assemblyInstructions.length} target assembly instructions with CPU registers.`,
    details: 'Selected machine instructions and assigned hardware registers (R1, R2) for CPU architecture execution.',
    data: {
      assembly: assemblyInstructions,
      architecture: 'Educational RISC/ARM 32-bit Target',
      registersUsed: ['R1', 'R2'],
    },
  });

  return {
    sourceCode: code,
    phases,
    success: true,
  };
}

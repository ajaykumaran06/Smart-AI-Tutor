import { Grammar, LL1TableResult, END_MARKER, EPSILON } from './grammarEngine';

export interface ParseTraceStep {
  step: number;
  stack: string[];
  stackDisplay: string;
  remainingInput: string[];
  inputDisplay: string;
  lookahead: string;
  action: string;
  actionType: 'expand' | 'match' | 'accept' | 'error' | 'init';
  productionApplied?: string;
  explanation: string;
}

export interface SimulationResult {
  steps: ParseTraceStep[];
  success: boolean;
  message: string;
}

// Tokenize input string for parser
export function tokenizeInput(input: string, terminals: string[]): string[] {
  const clean = input.trim();
  if (!clean) return [];

  // If input is space-separated
  if (clean.includes(' ')) {
    return clean.split(/\s+/).filter(Boolean);
  }

  // Otherwise, match against known multi-character terminals first (like 'id', 'int'), then single chars
  const sortedTerminals = [...terminals].sort((a, b) => b.length - a.length);
  const tokens: string[] = [];
  let i = 0;

  while (i < clean.length) {
    if (clean[i] === ' ') {
      i++;
      continue;
    }

    let matched = false;
    for (const term of sortedTerminals) {
      if (clean.startsWith(term, i)) {
        tokens.push(term);
        i += term.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Single character fallback
      tokens.push(clean[i]);
      i++;
    }
  }

  return tokens;
}

// Simulate LL(1) Stack Parsing with detailed step traces
export function simulateLL1Parser(
  grammar: Grammar,
  ll1Table: LL1TableResult,
  inputStr: string,
  maxSteps: number = 100
): SimulationResult {
  const rawTokens = tokenizeInput(inputStr, grammar.terminals);
  const inputTokens = [...rawTokens, END_MARKER];
  const stack: string[] = [END_MARKER, grammar.startSymbol];

  const steps: ParseTraceStep[] = [];
  let ip = 0; // Input pointer
  let stepCount = 0;
  let success = false;
  let terminationMessage = '';

  // Initial state step
  steps.push({
    step: 0,
    stack: [...stack],
    stackDisplay: stack.join(' '),
    remainingInput: inputTokens.slice(ip),
    inputDisplay: inputTokens.slice(ip).join(' '),
    lookahead: inputTokens[ip],
    action: `Initialize parser with start symbol "${grammar.startSymbol}" and end-marker "$"`,
    actionType: 'init',
    explanation: `The parser pushes the bottom-of-stack marker '$' followed by start symbol '${grammar.startSymbol}'. The input buffer is ready.`,
  });

  while (stepCount < maxSteps) {
    stepCount++;
    const top = stack[stack.length - 1];
    const lookahead = inputTokens[ip];

    // Case 1: Stack is empty
    if (!top) {
      steps.push({
        step: stepCount,
        stack: [],
        stackDisplay: 'ε (empty)',
        remainingInput: inputTokens.slice(ip),
        inputDisplay: inputTokens.slice(ip).join(' '),
        lookahead,
        action: 'Syntax Error: Stack underflow',
        actionType: 'error',
        explanation: 'The parsing stack is empty while input symbols remain unconsumed.',
      });
      terminationMessage = 'Parsing failed: Stack unexpectedly empty.';
      break;
    }

    // Case 2: Stack top matches end-marker and input is at end-marker => ACCEPT
    if (top === END_MARKER && lookahead === END_MARKER) {
      steps.push({
        step: stepCount,
        stack: [END_MARKER],
        stackDisplay: END_MARKER,
        remainingInput: [END_MARKER],
        inputDisplay: END_MARKER,
        lookahead,
        action: 'SUCCESS: Accepted',
        actionType: 'accept',
        explanation: 'Both the stack and the input have successfully reached the end marker "$". The input string is syntactically valid!',
      });
      success = true;
      terminationMessage = 'Input string successfully accepted by LL(1) grammar!';
      break;
    }

    // Case 3: Stack top is a terminal or end-marker
    if (grammar.terminals.includes(top) || top === END_MARKER) {
      if (top === lookahead) {
        // Pop stack and advance input
        stack.pop();
        ip++;
        steps.push({
          step: stepCount,
          stack: [...stack],
          stackDisplay: stack.join(' '),
          remainingInput: inputTokens.slice(ip),
          inputDisplay: inputTokens.slice(ip).join(' '),
          lookahead: inputTokens[ip] || END_MARKER,
          action: `Match and shift terminal "${top}"`,
          actionType: 'match',
          explanation: `Stack top "${top}" matches lookahead terminal "${top}". Pop "${top}" from the stack and consume it from input.`,
        });
      } else {
        steps.push({
          step: stepCount,
          stack: [...stack],
          stackDisplay: stack.join(' '),
          remainingInput: inputTokens.slice(ip),
          inputDisplay: inputTokens.slice(ip).join(' '),
          lookahead,
          action: `Syntax Error: Terminal mismatch. Expected "${top}", found "${lookahead}"`,
          actionType: 'error',
          explanation: `The parser expected terminal '${top}' at the stack top, but found '${lookahead}' in the input string.`,
        });
        terminationMessage = `Syntax error: Expected "${top}", but encountered "${lookahead}".`;
        break;
      }
    }
    // Case 4: Stack top is a non-terminal
    else if (grammar.nonTerminals.includes(top)) {
      const candidates = ll1Table.table[top]?.[lookahead] || [];

      if (candidates.length === 0) {
        steps.push({
          step: stepCount,
          stack: [...stack],
          stackDisplay: stack.join(' '),
          remainingInput: inputTokens.slice(ip),
          inputDisplay: inputTokens.slice(ip).join(' '),
          lookahead,
          action: `Syntax Error: No table entry M[${top}, ${lookahead}]`,
          actionType: 'error',
          explanation: `Predictive parsing table cell M[${top}, ${lookahead}] is empty (error entry). Non-terminal '${top}' cannot derive any sentence beginning with '${lookahead}'.`,
        });
        terminationMessage = `Syntax error: Table entry M[${top}, ${lookahead}] is blank.`;
        break;
      }

      if (candidates.length > 1) {
        // LL(1) conflict!
        const chosenProd = candidates[0];
        stack.pop();
        if (!(chosenProd.rhs.length === 1 && chosenProd.rhs[0] === EPSILON)) {
          // Push symbols in reverse order
          for (let k = chosenProd.rhs.length - 1; k >= 0; k--) {
            stack.push(chosenProd.rhs[k]);
          }
        }

        steps.push({
          step: stepCount,
          stack: [...stack],
          stackDisplay: stack.join(' '),
          remainingInput: inputTokens.slice(ip),
          inputDisplay: inputTokens.slice(ip).join(' '),
          lookahead,
          action: `LL(1) Conflict: Ambiguously expanding ${top} -> ${chosenProd.rawRhs}`,
          actionType: 'expand',
          productionApplied: `${top} -> ${chosenProd.rawRhs}`,
          explanation: `Warning: Multiple productions exist in M[${top}, ${lookahead}]: ${candidates.map(c => `${top} -> ${c.rawRhs}`).join(' vs ')}. The simulator arbitrarily picked the first one.`,
        });
      } else {
        // Normal single deterministic production
        const prod = candidates[0];
        stack.pop(); // Pop LHS

        if (!(prod.rhs.length === 1 && prod.rhs[0] === EPSILON)) {
          // Push RHS symbols in reverse order onto stack
          for (let k = prod.rhs.length - 1; k >= 0; k--) {
            stack.push(prod.rhs[k]);
          }
        }

        const isEps = prod.rhs.length === 1 && prod.rhs[0] === EPSILON;
        steps.push({
          step: stepCount,
          stack: [...stack],
          stackDisplay: stack.join(' '),
          remainingInput: inputTokens.slice(ip),
          inputDisplay: inputTokens.slice(ip).join(' '),
          lookahead,
          action: `Expand ${top} -> ${prod.rawRhs}`,
          actionType: 'expand',
          productionApplied: `${top} -> ${prod.rawRhs}`,
          explanation: isEps
            ? `Table lookup M[${top}, ${lookahead}] specifies ${top} -> ε. Pop '${top}' without pushing any replacement symbols.`
            : `Table lookup M[${top}, ${lookahead}] specifies ${top} -> ${prod.rawRhs}. Replace '${top}' by pushing [${prod.rhs.join(', ')}] in reverse order.`,
        });
      }
    } else {
      // Unknown symbol
      steps.push({
        step: stepCount,
        stack: [...stack],
        stackDisplay: stack.join(' '),
        remainingInput: inputTokens.slice(ip),
        inputDisplay: inputTokens.slice(ip).join(' '),
        lookahead,
        action: `Unknown symbol error: "${top}"`,
        actionType: 'error',
        explanation: `Encountered unexpected symbol '${top}' not present in grammar terminals or non-terminals.`,
      });
      terminationMessage = `Unknown symbol error: "${top}".`;
      break;
    }
  }

  if (stepCount >= maxSteps && !success) {
    terminationMessage = `Simulation stopped: Reached maximum step limit (${maxSteps}). Likely infinite loop due to left recursion or unresolved grammar ambiguity.`;
  }

  return {
    steps,
    success,
    message: terminationMessage || 'Simulation complete.',
  };
}

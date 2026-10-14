// Context-Free Grammar parser and deterministic algorithms for FIRST, FOLLOW, Left Recursion, Left Factoring, and LL(1) Table generation

export interface Production {
  lhs: string; // Non-terminal symbol, e.g. "E"
  rhs: string[]; // Sequence of symbols, e.g. ["E", "+", "T"] or ["ε"]
  rawRhs: string; // String representation, e.g. "E + T"
}

export interface Grammar {
  startSymbol: string;
  nonTerminals: string[];
  terminals: string[];
  productions: Production[];
}

export interface FirstFollowResult {
  firstSets: Record<string, string[]>;
  followSets: Record<string, string[]>;
  firstSteps: { nonTerminal: string; step: string; derivedFirst: string[] }[];
  followSteps: { nonTerminal: string; step: string; derivedFollow: string[] }[];
}

export interface LeftRecursionResult {
  hasLeftRecursion: boolean;
  eliminatedGrammar: Grammar;
  rulesTransformed: {
    originalLhs: string;
    recursiveAlphas: string[];
    betas: string[];
    explanation: string;
  }[];
}

export interface LeftFactoringResult {
  hasFactoringNeeded: boolean;
  factoredGrammar: Grammar;
  factoredRules: {
    lhs: string;
    commonPrefix: string;
    suffixes: string[];
    explanation: string;
  }[];
}

export interface LL1TableCell {
  nonTerminal: string;
  terminal: string;
  productions: Production[];
  isConflict: boolean;
  ruleExplanation?: string;
}

export interface LL1TableResult {
  terminals: string[]; // Columns including '$'
  nonTerminals: string[]; // Rows
  table: Record<string, Record<string, Production[]>>; // [A][a] => productions
  isLL1: boolean;
  conflicts: {
    nonTerminal: string;
    terminal: string;
    productions: Production[];
    reason: string;
  }[];
}

export const EPSILON = 'ε';
export const END_MARKER = '$';

// Check if symbol is epsilon
export function isEpsilon(sym: string): boolean {
  return sym === 'ε' || sym === 'epsilon' || sym === 'EPSILON' || sym === 'e' || sym === '#';
}

// Parse raw text into structured Grammar
export function parseGrammarText(input: string): { grammar: Grammar; errors: string[] } {
  const errors: string[] = [];
  const lines = input
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('//') && !l.startsWith('#'));

  if (lines.length === 0) {
    return {
      grammar: { startSymbol: '', nonTerminals: [], terminals: [], productions: [] },
      errors: ['Grammar input is empty. Please enter production rules like "E -> E + T | T".'],
    };
  }

  const productions: Production[] = [];
  const nonTerminalSet = new Set<string>();
  const allSymbols = new Set<string>();
  let startSymbol = '';

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    // Arrow can be ->, →, or :
    const arrowMatch = line.match(/\s*(->|→|:|=)\s*/);
    if (!arrowMatch || arrowMatch.index === undefined) {
      errors.push(`Line ${lineIndex + 1}: Missing arrow "->" in "${line}". Expected format: LHS -> RHS1 | RHS2`);
      continue;
    }

    const lhs = line.slice(0, arrowMatch.index).trim();
    const rhsPart = line.slice(arrowMatch.index + arrowMatch[0].length).trim();

    if (!lhs) {
      errors.push(`Line ${lineIndex + 1}: Left-hand side is missing.`);
      continue;
    }

    if (lineIndex === 0 && !startSymbol) {
      startSymbol = lhs;
    }

    nonTerminalSet.add(lhs);

    // Split alternatives by |
    const alternatives = rhsPart.split('|').map(alt => alt.trim());

    for (const alt of alternatives) {
      if (!alt) {
        errors.push(`Line ${lineIndex + 1}: Empty alternative in "${line}". Use "ε" or "epsilon" for empty string.`);
        continue;
      }

      // Tokenize RHS into symbols: space-separated or individual chars
      const rawTokens = alt.includes(' ')
        ? alt.split(/\s+/).filter(Boolean)
        : alt.split('').filter(Boolean);

      const symbols = rawTokens.map(t => (isEpsilon(t) ? EPSILON : t));

      for (const s of symbols) {
        if (s !== EPSILON) allSymbols.add(s);
      }

      productions.push({
        lhs,
        rhs: symbols,
        rawRhs: symbols.join(' '),
      });
    }
  }

  const nonTerminals = Array.from(nonTerminalSet);
  const terminalSet = new Set<string>();

  for (const s of allSymbols) {
    if (!nonTerminalSet.has(s) && s !== EPSILON && s !== END_MARKER) {
      terminalSet.add(s);
    }
  }

  const terminals = Array.from(terminalSet);

  return {
    grammar: {
      startSymbol: startSymbol || nonTerminals[0] || 'S',
      nonTerminals,
      terminals,
      productions,
    },
    errors,
  };
}

// Deterministic calculation of FIRST and FOLLOW sets with audit logs
export function computeFirstAndFollow(grammar: Grammar): FirstFollowResult {
  const { nonTerminals, terminals, productions, startSymbol } = grammar;

  const firstSets: Record<string, Set<string>> = {};
  const followSets: Record<string, Set<string>> = {};
  const firstSteps: { nonTerminal: string; step: string; derivedFirst: string[] }[] = [];
  const followSteps: { nonTerminal: string; step: string; derivedFollow: string[] }[] = [];

  // Initialize sets
  for (const nt of nonTerminals) {
    firstSets[nt] = new Set<string>();
    followSets[nt] = new Set<string>();
  }
  for (const t of terminals) {
    firstSets[t] = new Set<string>([t]);
  }

  // Helper to compute FIRST of a symbol sequence
  function getSequenceFirst(symbols: string[]): { first: Set<string>; hasEpsilon: boolean } {
    const result = new Set<string>();
    if (symbols.length === 0 || (symbols.length === 1 && symbols[0] === EPSILON)) {
      result.add(EPSILON);
      return { first: result, hasEpsilon: true };
    }

    let allCanBeEpsilon = true;
    for (const sym of symbols) {
      if (sym === EPSILON) {
        result.add(EPSILON);
        continue;
      }

      const symFirst = firstSets[sym] || (terminals.includes(sym) ? new Set([sym]) : new Set());
      for (const f of symFirst) {
        if (f !== EPSILON) result.add(f);
      }

      if (!symFirst.has(EPSILON)) {
        allCanBeEpsilon = false;
        break;
      }
    }

    if (allCanBeEpsilon) {
      result.add(EPSILON);
    }

    return { first: result, hasEpsilon: allCanBeEpsilon };
  }

  // Iterate to fix-point for FIRST sets
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 50) {
    changed = false;
    iterations++;

    for (const prod of productions) {
      const { lhs, rhs } = prod;
      const beforeSize = firstSets[lhs].size;

      if (rhs.length === 1 && rhs[0] === EPSILON) {
        if (!firstSets[lhs].has(EPSILON)) {
          firstSets[lhs].add(EPSILON);
          changed = true;
          firstSteps.push({
            nonTerminal: lhs,
            step: `Rule "${lhs} -> ε": Added ε to FIRST(${lhs})`,
            derivedFirst: Array.from(firstSets[lhs]),
          });
        }
        continue;
      }

      const { first: seqFirst } = getSequenceFirst(rhs);
      for (const item of seqFirst) {
        if (!firstSets[lhs].has(item)) {
          firstSets[lhs].add(item);
          changed = true;
        }
      }

      if (firstSets[lhs].size > beforeSize) {
        firstSteps.push({
          nonTerminal: lhs,
          step: `Rule "${lhs} -> ${prod.rawRhs}": Contributed { ${Array.from(seqFirst).join(', ')} } to FIRST(${lhs})`,
          derivedFirst: Array.from(firstSets[lhs]),
        });
      }
    }
  }

  // Calculate FOLLOW sets
  if (startSymbol && followSets[startSymbol]) {
    followSets[startSymbol].add(END_MARKER);
    followSteps.push({
      nonTerminal: startSymbol,
      step: `Start symbol rule: Added end-marker '$' to FOLLOW(${startSymbol})`,
      derivedFollow: Array.from(followSets[startSymbol]),
    });
  }

  changed = true;
  iterations = 0;
  while (changed && iterations < 50) {
    changed = false;
    iterations++;

    for (const prod of productions) {
      const { lhs, rhs } = prod;

      for (let i = 0; i < rhs.length; i++) {
        const B = rhs[i];
        if (!nonTerminals.includes(B)) continue;

        const beta = rhs.slice(i + 1);
        const beforeSize = followSets[B].size;

        if (beta.length > 0) {
          const { first: betaFirst, hasEpsilon } = getSequenceFirst(beta);
          for (const item of betaFirst) {
            if (item !== EPSILON && !followSets[B].has(item)) {
              followSets[B].add(item);
              changed = true;
            }
          }

          if (hasEpsilon) {
            for (const item of followSets[lhs]) {
              if (!followSets[B].has(item)) {
                followSets[B].add(item);
                changed = true;
              }
            }
          }
        } else {
          // A -> alpha B: everything in FOLLOW(A) is in FOLLOW(B)
          for (const item of followSets[lhs]) {
            if (!followSets[B].has(item)) {
              followSets[B].add(item);
              changed = true;
            }
          }
        }

        if (followSets[B].size > beforeSize) {
          followSteps.push({
            nonTerminal: B,
            step: `From production "${lhs} -> ${prod.rawRhs}": Updated FOLLOW(${B})`,
            derivedFollow: Array.from(followSets[B]),
          });
        }
      }
    }
  }

  const finalFirst: Record<string, string[]> = {};
  const finalFollow: Record<string, string[]> = {};

  for (const nt of nonTerminals) {
    finalFirst[nt] = Array.from(firstSets[nt] || []).sort((a, b) => (a === EPSILON ? 1 : b === EPSILON ? -1 : a.localeCompare(b)));
    finalFollow[nt] = Array.from(followSets[nt] || []).sort((a, b) => (a === END_MARKER ? 1 : b === END_MARKER ? -1 : a.localeCompare(b)));
  }

  return {
    firstSets: finalFirst,
    followSets: finalFollow,
    firstSteps,
    followSteps,
  };
}

// Eliminate immediate left recursion: A -> A alpha | beta  =>  A -> beta A', A' -> alpha A' | ε
export function eliminateLeftRecursion(grammar: Grammar): LeftRecursionResult {
  const { nonTerminals, terminals, productions, startSymbol } = grammar;
  const newProductions: Production[] = [];
  const newNonTerminals = new Set<string>(nonTerminals);
  const rulesTransformed: LeftRecursionResult['rulesTransformed'] = [];
  let hasLeftRecursion = false;

  for (const nt of nonTerminals) {
    const ntProds = productions.filter(p => p.lhs === nt);
    const recursiveAlphas: string[][] = [];
    const betas: string[][] = [];

    for (const p of ntProds) {
      if (p.rhs.length > 0 && p.rhs[0] === nt) {
        // Immediate left recursive: A -> A alpha
        const alpha = p.rhs.slice(1);
        recursiveAlphas.push(alpha.length > 0 ? alpha : [EPSILON]);
      } else {
        // Beta (non-left-recursive)
        betas.push(p.rhs[0] === EPSILON ? [] : p.rhs);
      }
    }

    if (recursiveAlphas.length > 0) {
      hasLeftRecursion = true;
      const newNt = `${nt}'`;
      newNonTerminals.add(newNt);

      // If no betas exist, create dummy beta (standard fallback)
      const effectiveBetas = betas.length > 0 ? betas : [[EPSILON]];

      // A -> beta A'
      for (const beta of effectiveBetas) {
        const combinedRhs = beta.length > 0 ? [...beta, newNt] : [newNt];
        newProductions.push({
          lhs: nt,
          rhs: combinedRhs,
          rawRhs: combinedRhs.join(' '),
        });
      }

      // A' -> alpha A' | ε
      for (const alpha of recursiveAlphas) {
        const alphaRhs = alpha[0] === EPSILON ? [newNt] : [...alpha, newNt];
        newProductions.push({
          lhs: newNt,
          rhs: alphaRhs,
          rawRhs: alphaRhs.join(' '),
        });
      }
      // A' -> ε
      newProductions.push({
        lhs: newNt,
        rhs: [EPSILON],
        rawRhs: EPSILON,
      });

      rulesTransformed.push({
        originalLhs: nt,
        recursiveAlphas: recursiveAlphas.map(a => a.join(' ')),
        betas: effectiveBetas.map(b => (b.length === 0 ? EPSILON : b.join(' '))),
        explanation: `Detected immediate left recursion in ${nt}. Replaced with ${nt} -> β ${newNt} and ${newNt} -> α ${newNt} | ε.`,
      });
    } else {
      // Keep existing productions untouched
      newProductions.push(...ntProds);
    }
  }

  return {
    hasLeftRecursion,
    eliminatedGrammar: {
      startSymbol,
      nonTerminals: Array.from(newNonTerminals),
      terminals,
      productions: newProductions,
    },
    rulesTransformed,
  };
}

// Eliminate common prefixes (Left Factoring): A -> alpha beta1 | alpha beta2 => A -> alpha A', A' -> beta1 | beta2
export function leftFactoring(grammar: Grammar): LeftFactoringResult {
  const { nonTerminals, terminals, productions, startSymbol } = grammar;
  const newProductions: Production[] = [];
  const newNonTerminals = new Set<string>(nonTerminals);
  const factoredRules: LeftFactoringResult['factoredRules'] = [];
  let hasFactoringNeeded = false;

  for (const nt of nonTerminals) {
    const ntProds = productions.filter(p => p.lhs === nt);
    // Group productions by their first symbol
    const prefixMap = new Map<string, Production[]>();

    for (const p of ntProds) {
      const firstSym = p.rhs[0] || EPSILON;
      if (!prefixMap.has(firstSym)) prefixMap.set(firstSym, []);
      prefixMap.get(firstSym)!.push(p);
    }

    let factoredThisNt = false;
    for (const [prefix, group] of prefixMap.entries()) {
      if (group.length > 1 && prefix !== EPSILON) {
        hasFactoringNeeded = true;
        factoredThisNt = true;
        const newNt = `${nt}'`;
        newNonTerminals.add(newNt);

        // A -> prefix A'
        newProductions.push({
          lhs: nt,
          rhs: [prefix, newNt],
          rawRhs: `${prefix} ${newNt}`,
        });

        const suffixes: string[] = [];
        // A' -> suffix | ε
        for (const p of group) {
          const suffix = p.rhs.slice(1);
          const finalSuffix = suffix.length === 0 ? [EPSILON] : suffix;
          suffixes.push(finalSuffix.join(' '));
          newProductions.push({
            lhs: newNt,
            rhs: finalSuffix,
            rawRhs: finalSuffix.join(' '),
          });
        }

        factoredRules.push({
          lhs: nt,
          commonPrefix: prefix,
          suffixes,
          explanation: `Shared prefix "${prefix}" factored out. Replaced with ${nt} -> ${prefix} ${newNt} and ${newNt} -> ${suffixes.join(' | ')}.`,
        });
      } else {
        // Keep unique productions
        newProductions.push(...group);
      }
    }
  }

  return {
    hasFactoringNeeded,
    factoredGrammar: {
      startSymbol,
      nonTerminals: Array.from(newNonTerminals),
      terminals,
      productions: newProductions,
    },
    factoredRules,
  };
}

// Build LL(1) Predictive Parsing Table
export function buildLL1ParsingTable(grammar: Grammar, firstFollow: FirstFollowResult): LL1TableResult {
  const { nonTerminals, terminals, productions } = grammar;
  const { firstSets, followSets } = firstFollow;

  const tableColumns = [...terminals, END_MARKER];
  const table: Record<string, Record<string, Production[]>> = {};
  const conflicts: LL1TableResult['conflicts'] = [];

  for (const nt of nonTerminals) {
    table[nt] = {};
    for (const col of tableColumns) {
      table[nt][col] = [];
    }
  }

  // Helper to compute FIRST of RHS
  function getRhsFirst(rhs: string[]): { first: Set<string>; hasEpsilon: boolean } {
    const result = new Set<string>();
    if (rhs.length === 0 || (rhs.length === 1 && rhs[0] === EPSILON)) {
      result.add(EPSILON);
      return { first: result, hasEpsilon: true };
    }

    let allEpsilon = true;
    for (const s of rhs) {
      if (s === EPSILON) {
        result.add(EPSILON);
        continue;
      }
      const sFirst = firstSets[s] || (terminals.includes(s) ? [s] : []);
      for (const item of sFirst) {
        if (item !== EPSILON) result.add(item);
      }
      if (!sFirst.includes(EPSILON)) {
        allEpsilon = false;
        break;
      }
    }
    if (allEpsilon) result.add(EPSILON);
    return { first: result, hasEpsilon: allEpsilon };
  }

  for (const prod of productions) {
    const { lhs, rhs } = prod;
    const { first: rhsFirst, hasEpsilon } = getRhsFirst(rhs);

    // Rule 1: For each terminal a in FIRST(alpha), add A -> alpha to M[A, a]
    for (const a of rhsFirst) {
      if (a !== EPSILON && table[lhs] && table[lhs][a]) {
        table[lhs][a].push(prod);
      }
    }

    // Rule 2: If epsilon is in FIRST(alpha), add A -> alpha to M[A, b] for each b in FOLLOW(A)
    if (hasEpsilon) {
      const aFollow = followSets[lhs] || [];
      for (const b of aFollow) {
        if (table[lhs] && table[lhs][b]) {
          // Avoid duplicate entry of exact same production
          if (!table[lhs][b].some(p => p.rawRhs === prod.rawRhs)) {
            table[lhs][b].push(prod);
          }
        }
      }
    }
  }

  // Check for conflicts
  let isLL1 = true;
  for (const nt of nonTerminals) {
    for (const col of tableColumns) {
      const cell = table[nt]?.[col] || [];
      if (cell.length > 1) {
        isLL1 = false;
        conflicts.push({
          nonTerminal: nt,
          terminal: col,
          productions: cell,
          reason: `Multiple productions entry at M[${nt}, ${col}]: ${cell.map(p => `${nt} -> ${p.rawRhs}`).join(' vs ')}`,
        });
      }
    }
  }

  return {
    terminals: tableColumns,
    nonTerminals,
    table,
    isLL1,
    conflicts,
  };
}

// Preset grammars for students
export const PRESET_GRAMMARS = [
  {
    id: 'arithmetic-ll1',
    name: 'LL(1) Arithmetic Expression (Non-recursive)',
    description: 'Classic transformed grammar for expressions with + and * respecting operator precedence.',
    grammarText: `E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> ( E ) | id`,
    sampleInput: 'id + id * id',
  },
  {
    id: 'arithmetic-lr',
    name: 'Left-Recursive Expression Grammar',
    description: 'Natural mathematical expression grammar showing left recursion before elimination.',
    grammarText: `E -> E + T | T
T -> T * F | F
F -> ( E ) | id`,
    sampleInput: 'id + id * id',
  },
  {
    id: 'if-else',
    name: 'If-Else Statement (Dangling Else)',
    description: 'Illustrates ambiguity and LL(1) First/Follow conflict in conditional branching.',
    grammarText: `S -> i E t S S' | a
S' -> e S | ε
E -> b`,
    sampleInput: 'i b t a',
  },
  {
    id: 'simple-decl',
    name: 'Type Declaration Grammar',
    description: 'Grammar for variable declaration lists in typed languages.',
    grammarText: `D -> T L
T -> int | float
L -> L , id | id`,
    sampleInput: 'int id , id',
  },
];

// Curated Compiler Design Quiz Question Bank

export interface QuizQuestion {
  id: string;
  topicId: string;
  topicTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'mcq' | 'true-false' | 'algorithm' | 'predict-output';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint?: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    topicId: 'intro-compilers',
    topicTitle: 'Introduction to Compilers & Interpreters',
    difficulty: 'Easy',
    type: 'mcq',
    question: 'Which of the following is the primary advantage of a compiler over an interpreter?',
    options: [
      'It executes code line-by-line without any upfront delay',
      'The generated target machine code executes significantly faster at runtime',
      'It does not require any memory allocation',
      'It automatically fixes syntax errors during execution',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Compilers perform heavy analysis and optimization upfront to generate native machine code, yielding fast runtime execution compared to interpreters which must decode instructions repeatedly.',
  },
  {
    id: 'q2',
    topicId: 'compiler-phases',
    topicTitle: 'Compiler Architecture & The 7 Phases',
    difficulty: 'Easy',
    type: 'mcq',
    question: 'In standard compiler architecture, which phase immediately precedes Intermediate Code Generation (ICG)?',
    options: [
      'Lexical Analysis',
      'Syntax Analysis',
      'Semantic Analysis',
      'Code Optimization',
    ],
    correctAnswerIndex: 2,
    explanation:
      'The front-end pipeline order is: Lexical Analysis -> Syntax Analysis -> Semantic Analysis -> Intermediate Code Generation.',
  },
  {
    id: 'q3',
    topicId: 'lexical-analysis',
    topicTitle: 'Lexical Analysis & Tokenization',
    difficulty: 'Medium',
    type: 'mcq',
    question: 'What principle does a lexical analyzer follow when an input string like "==" can match both single "=" and double "=="?',
    options: [
      'Shortest Match Principle',
      'Maximal Munch (Longest Match) Principle',
      'Greedy Epsilon Elimination',
      'First-Come First-Served Rule',
    ],
    correctAnswerIndex: 1,
    explanation:
      'The Maximal Munch rule states that the lexer must choose the longest sequence of characters that matches a valid token pattern.',
  },
  {
    id: 'q4',
    topicId: 'regex-automata',
    topicTitle: 'Regular Expressions & Finite Automata',
    difficulty: 'Medium',
    type: 'true-false',
    question: 'True or False: A Deterministic Finite Automaton (DFA) can recognize strings with arbitrarily nested balanced brackets like "[[]]".',
    options: [
      'True',
      'False',
    ],
    correctAnswerIndex: 1,
    explanation:
      'False. Finite automata have a fixed, finite number of states and cannot count arbitrarily deep nesting. Recognizing nested structures requires Context-Free Grammars.',
  },
  {
    id: 'q5',
    topicId: 'syntax-analysis',
    topicTitle: 'Syntax Analysis & Context-Free Grammars',
    difficulty: 'Medium',
    type: 'mcq',
    question: 'A grammar is formally defined as ambiguous if:',
    options: [
      'It contains both uppercase and lowercase symbols',
      'It has left-recursive productions',
      'There exists at least one sentence with two or more distinct parse trees',
      'It cannot be processed by an operating system',
    ],
    correctAnswerIndex: 2,
    explanation:
      'Ambiguity means a single input string produces more than one distinct derivation tree (or equivalently, multiple leftmost derivations).',
  },
  {
    id: 'q6',
    topicId: 'left-recursion',
    topicTitle: 'Left Recursion & Left Factoring',
    difficulty: 'Hard',
    type: 'algorithm',
    question: 'Given the immediate left-recursive production "A -> A α | β", what is the standard transformed set of productions?',
    options: [
      'A -> β A\',  A\' -> α A\' | ε',
      'A -> α A\',  A\' -> β A\' | ε',
      'A -> A\' β,  A\' -> A\' α | ε',
      'A -> β α,   A\' -> ε',
    ],
    correctAnswerIndex: 0,
    explanation:
      'The non-recursive base case β is placed first, followed by a new non-terminal A\' that right-recursively absorbs the α chain and terminates with ε.',
  },
  {
    id: 'q7',
    topicId: 'first-follow',
    topicTitle: 'FIRST & FOLLOW Sets',
    difficulty: 'Easy',
    type: 'true-false',
    question: 'Can epsilon (ε) ever be an element of a FOLLOW set?',
    options: [
      'Yes, if the start symbol derives ε',
      'No, epsilon is never part of any FOLLOW set',
    ],
    correctAnswerIndex: 1,
    explanation:
      'By definition, FOLLOW(A) contains only terminal symbols and the end-marker "$" that can appear immediately to the right of A. Epsilon is an empty transition, not a physical lookahead token.',
  },
  {
    id: 'q8',
    topicId: 'first-follow',
    topicTitle: 'FIRST & FOLLOW Sets',
    difficulty: 'Hard',
    type: 'algorithm',
    question: 'For grammar: S -> A B, A -> a | ε, B -> b. What is FIRST(S)?',
    options: [
      '{ a }',
      '{ b }',
      '{ a, b }',
      '{ a, b, ε }',
    ],
    correctAnswerIndex: 2,
    explanation:
      'FIRST(A) = { a, ε }. Since A can derive ε, the parser also looks at FIRST(B) = { b }. Combining gives FIRST(S) = { a, b }. Since B cannot derive ε, ε is not in FIRST(S).',
  },
  {
    id: 'q9',
    topicId: 'll1-parsing',
    topicTitle: 'LL(1) Parsing & Predictive Parsing Tables',
    difficulty: 'Medium',
    type: 'mcq',
    question: 'In an LL(1) predictive parsing table M[A, a], when is a production "A -> α" placed in column "b" where b ∈ FOLLOW(A)?',
    options: [
      'Always, for every production of A',
      'Only if α derives epsilon (ε ∈ FIRST(α))',
      'Only when b is the end-marker $',
      'Never, FOLLOW sets are only used in LR parsing',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Rule 2 of LL(1) table construction: If ε ∈ FIRST(α), then add A -> α to M[A, b] for each terminal b in FOLLOW(A).',
  },
  {
    id: 'q10',
    topicId: 'll1-parsing',
    topicTitle: 'LL(1) Parsing & Predictive Parsing Tables',
    difficulty: 'Hard',
    type: 'predict-output',
    question: 'An LL(1) parser encounters non-terminal T at the top of the stack and input symbol "*", but table entry M[T, *] is completely blank. What action does it take?',
    options: [
      'Silently skips the "*" symbol and continues',
      'Signals a Syntax Error and initiates error recovery',
      'Pushes epsilon onto the stack',
      'Assumes multiplication has default priority',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Blank cells in an LL(1) parsing table represent error entries. The parser reports a syntax error and may invoke panic-mode recovery.',
  },
  {
    id: 'q11',
    topicId: 'bottom-up-parsing',
    topicTitle: 'Bottom-Up Parsing Concepts',
    difficulty: 'Medium',
    type: 'mcq',
    question: 'What is a "Handle" in bottom-up shift-reduce parsing?',
    options: [
      'A pointer to the symbol table',
      'A substring matching the RHS of a production whose reduction represents one step of a reverse rightmost derivation',
      'The root node of an abstract syntax tree',
      'The memory address of the runtime stack',
    ],
    correctAnswerIndex: 1,
    explanation:
      'A handle is a substring of a sentential form that matches the right side of a production, and whose reduction represents one step of a rightmost derivation in reverse.',
  },
  {
    id: 'q12',
    topicId: 'lr-parsing',
    topicTitle: 'LR Parsing Fundamentals & LR(0) / SLR(1)',
    difficulty: 'Hard',
    type: 'mcq',
    question: 'How does an SLR(1) parser resolve when to perform a reduction "A -> α" compared to a pure LR(0) parser?',
    options: [
      'It performs reduction on all terminal columns unconditionally',
      'It performs reduction only when the current lookahead token is in FOLLOW(A)',
      'It asks the user to pick via a dialog prompt',
      'It restarts parsing from the beginning',
    ],
    correctAnswerIndex: 1,
    explanation:
      'LR(0) puts reductions across ALL columns, causing frequent conflicts. SLR(1) uses simple lookahead: it places reductions only into columns matching terminals in FOLLOW(A).',
  },
  {
    id: 'q13',
    topicId: 'sdd-sdt',
    topicTitle: 'Syntax-Directed Definitions & Translation',
    difficulty: 'Medium',
    type: 'mcq',
    question: 'An SDD is classified as S-Attributed if:',
    options: [
      'It contains both inherited and synthesized attributes',
      'Every attribute is synthesized (computed strictly from child nodes)',
      'It requires multiple passes over the parse tree',
      'It is written in the C language',
    ],
    correctAnswerIndex: 1,
    explanation:
      'An S-attributed definition contains exclusively synthesized attributes, making it directly evaluable during bottom-up shift-reduce parsing.',
  },
  {
    id: 'q14',
    topicId: 'icg-tac',
    topicTitle: 'Intermediate Code Generation & TAC',
    difficulty: 'Easy',
    type: 'mcq',
    question: 'What is the maximum number of operators allowed on the right-hand side of a single Three-Address Code (TAC) statement?',
    options: [
      'Zero',
      'One',
      'Two',
      'Unlimited',
    ],
    correctAnswerIndex: 1,
    explanation:
      'By definition, TAC instructions have at most one operator on the right-hand side (e.g. x = y + z or x = -y).',
  },
  {
    id: 'q15',
    topicId: 'code-optimization',
    topicTitle: 'Code Optimization',
    difficulty: 'Medium',
    type: 'predict-output',
    question: 'Replacing the statement "x = 4 * 1024" with "x = 4096" at compile-time is an example of which optimization pass?',
    options: [
      'Dead Code Elimination',
      'Constant Folding',
      'Loop Invariant Code Motion',
      'Strength Reduction',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Constant Folding is the evaluation of operations with compile-time known constants directly during compilation, eliminating runtime CPU work.',
  },
  {
    id: 'q16',
    topicId: 'target-code-gen',
    topicTitle: 'Target Code Generation & Register Allocation',
    difficulty: 'Hard',
    type: 'mcq',
    question: 'Register allocation is mathematically modeled as which classic NP-complete problem?',
    options: [
      'Knapsack Problem',
      'Graph Coloring Problem',
      'Travelling Salesperson Problem',
      'Halting Problem',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Chaitin proved that assigning K hardware registers to variables whose live ranges overlap corresponds to K-coloring an interference graph.',
  },
  {
    id: 'q17',
    topicId: 'error-recovery',
    topicTitle: 'Compiler Error Detection & Recovery Strategies',
    difficulty: 'Medium',
    type: 'mcq',
    question: 'In Panic-Mode error recovery, what does the parser do upon encountering a syntax error?',
    options: [
      'Immediately halts the operating system',
      'Discards input tokens one by one until a designated synchronizing token is found',
      'Inserts random tokens until syntax matches',
      'Deletes the source code file from disk',
    ],
    correctAnswerIndex: 1,
    explanation:
      'Panic mode is the simplest, most robust recovery strategy: the parser skips input tokens until it encounters a synchronizing token (such as a semicolon or closing brace) to resume parsing.',
  },
];

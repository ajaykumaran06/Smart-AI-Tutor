// 17 Curated Compiler Design Topics with Pedagogical Structure

export interface PracticeQuestion {
  question: string;
  answer: string;
  explanation: string;
}

export interface TopicLesson {
  id: string;
  title: string;
  category: 'Front-End' | 'Parsing' | 'Semantic & Intermediate' | 'Back-End & Optimization';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  readTime: string;
  learningObjectives: string[];
  prerequisites: string[];
  simpleExplanation: string;
  formalDefinition: string;
  workedExample: {
    title: string;
    description: string;
    codeOrGrammar?: string;
    solutionSteps: string[];
  };
  commonMistakes: string[];
  practiceQuestions: PracticeQuestion[];
  relatedTopics: { id: string; title: string }[];
  recommendedTool?: 'workbench' | 'visualizer' | 'simulator' | 'pipeline' | 'tutor';
  presetGrammarId?: string;
}

export const TOPICS_DATA: TopicLesson[] = [
  {
    id: 'intro-compilers',
    title: '1. Introduction to Compilers & Interpreters',
    category: 'Front-End',
    difficulty: 'Easy',
    readTime: '6 min',
    learningObjectives: [
      'Differentiate between compilers, interpreters, and hybrid models (JIT).',
      'Understand the front-end (analysis) vs back-end (synthesis) division.',
      'Identify passes and cousin tools like preprocessors, linkers, and loaders.',
    ],
    prerequisites: ['Basic programming in C, C++, or Java', 'Data Structures (Trees, Hash Tables)'],
    simpleExplanation:
      'Imagine translating a book from Japanese to English. A translator who reads the whole book and writes an English copy is like a Compiler—it takes time up front, but the final English book can be read quickly anytime. An Interpreter is like a live conference interpreter who translates line-by-line in real time—faster to start, but slower for repeat runs.',
    formalDefinition:
      'A compiler is a computer program that translates computer code written in one programming language (source language) into another language (target machine or bytecode language) without altering program semantics.',
    workedExample: {
      title: 'Comparing Compilation vs Interpretation for a Loop',
      description: 'Consider a loop running 1,000,000 iterations: for(int i=0; i<1e6; i++) { sum += i; }',
      solutionSteps: [
        'Compiler: Translates the entire loop once into machine instructions. Executes natively at hardware clock speeds.',
        'Interpreter: Fetches, decodes, and interprets the loop body on every single iteration—taking up to 10-50x more runtime overhead.',
        'JIT (Just-In-Time) Hybrid: JVM or V8 engine detects hot loops and compiles them to machine code dynamically.',
      ],
    },
    commonMistakes: [
      'Assuming compilers execute user code during compilation (compilers only translate; execution happens at runtime).',
      'Thinking Java is purely interpreted (Java compiles to bytecode `.class`, which the JVM interprets and JIT-compiles).',
    ],
    practiceQuestions: [
      {
        question: 'What is the primary trade-off between pure interpretation and pure compilation?',
        answer: 'Start-up speed vs execution efficiency.',
        explanation: 'Interpreters start executing immediately without upfront compilation delay, but run slower inside loops compared to native compiled binaries.',
      },
    ],
    relatedTopics: [
      { id: 'compiler-phases', title: '2. Compiler Architecture & The 7 Phases' },
    ],
    recommendedTool: 'pipeline',
  },
  {
    id: 'compiler-phases',
    title: '2. Compiler Architecture & The 7 Phases',
    category: 'Front-End',
    difficulty: 'Easy',
    readTime: '8 min',
    learningObjectives: [
      'Name and sequence all 7 phases of a standard compiler.',
      'Distinguish Analysis (Scanner, Parser, Semantic) from Synthesis (ICG, Optimizer, Target Code).',
      'Understand how symbol tables and error handlers interact across all phases.',
    ],
    prerequisites: ['1. Introduction to Compilers & Interpreters'],
    simpleExplanation:
      'Think of an automotive assembly line. Phase 1 inspects raw metal bars into standardized nuts and bolts (Lexer). Phase 2 snaps them into a frame blueprint (Parser). Phase 3 tests if parts fit safety standards (Semantic). Phase 4 creates a universal chassis (Intermediate Code). Phase 5 removes excess weight (Optimizer). Phase 6 builds the final sports car for a specific country highway (Target Code).',
    formalDefinition:
      'Compiler architecture is divided into the Front-End (Source -> Lexer -> Parser -> Semantic -> ICG) which is machine-independent, and Back-End (Optimization -> Target Code -> Machine Code) which is machine-dependent.',
    workedExample: {
      title: 'Tracing "position = initial + rate * 60"',
      description: 'How this single line is transformed across phases:',
      solutionSteps: [
        'Lexical Analyzer: <id, 1> <=> <id, 2> <+> <id, 3> <*> <num, 60>',
        'Syntax Analyzer: Builds syntax tree with * binding rate and 60 first.',
        'Semantic Analyzer: Converts integer 60 into float 60.0 (type coercion).',
        'ICG (TAC): t1 = inttofloat(60); t2 = id3 * t1; t3 = id2 + t2; id1 = t3;',
        'Optimizer: t1 = id3 * 60.0; id1 = id2 + t1;',
        'Target Code: LDF R2, id3; MULF R2, R2, #60.0; LDF R1, id2; ADDF R1, R1, R2; STF id1, R1;',
      ],
    },
    commonMistakes: [
      'Confusing the role of Semantic Analysis with Syntax Analysis (Syntax verifies structure/grammar; Semantics verifies meaning/types).',
      'Thinking optimization is mandatory (a compiler works without optimization, but produces slower/larger code).',
    ],
    practiceQuestions: [
      {
        question: 'Which phase of the compiler generates the Symbol Table?',
        answer: 'Lexical analysis initiates it, and Semantic analysis enriches it with types and memory offsets.',
        explanation: 'All phases read and write to the central Symbol Table data structure.',
      },
    ],
    relatedTopics: [
      { id: 'lexical-analysis', title: '3. Lexical Analysis & Tokenization' },
      { id: 'syntax-analysis', title: '5. Syntax Analysis & CFGs' },
    ],
    recommendedTool: 'pipeline',
  },
  {
    id: 'lexical-analysis',
    title: '3. Lexical Analysis & Tokenization',
    category: 'Front-End',
    difficulty: 'Easy',
    readTime: '7 min',
    learningObjectives: [
      'Define Token, Pattern, and Lexeme with precise examples.',
      'Understand how regular expressions define token patterns.',
      'Handle buffer pairs, lookahead, and whitespace stripping.',
    ],
    prerequisites: ['2. Compiler Architecture & The 7 Phases'],
    simpleExplanation:
      'When reading English, your eyes scan letters: "c", "a", "t". You recognize "cat" as a single noun token, not three separate letters. A Lexical Analyzer (Scanner) reads raw source characters and groups them into meaningful programming vocabulary like keywords, variable names, and operators.',
    formalDefinition:
      'A Token is an abstract symbol (e.g., IDENTIFIER, NUMBER). A Pattern is the formal rule describing tokens (usually a Regular Expression). A Lexeme is the actual character sequence in the source code matching the pattern (e.g., "count", "3.14").',
    workedExample: {
      title: 'Tokenizing "if (x >= 10) return;"',
      description: 'Lexeme to Token matching:',
      solutionSteps: [
        '"if" -> Keyword Token <IF, ->',
        '"(" -> Delimiter Token <LPAREN, ->',
        '"x" -> Identifier Token <ID, "x">',
        '">=" -> Relational Operator Token <RELOP, GE>',
        '"10" -> Number Token <NUM, 10>',
        '")" -> Delimiter Token <RPAREN, ->',
        '"return" -> Keyword Token <RETURN, ->',
        '";" -> Punctuation Token <SEMICOLON, ->',
      ],
    },
    commonMistakes: [
      'Failing to handle the Maximal Munch (Longest Match) rule (e.g. "==" must be scanned as equality, not two separate "=").',
      'Confusing Lexeme with Token.',
    ],
    practiceQuestions: [
      {
        question: 'What is a lexeme in the statement "int total = 50;"?',
        answer: '"int", "total", "=", "50", and ";" are the individual lexemes.',
        explanation: 'Each concrete character sequence matching a token pattern is a lexeme.',
      },
    ],
    relatedTopics: [
      { id: 'regex-automata', title: '4. Regular Expressions & Finite Automata' },
    ],
    recommendedTool: 'pipeline',
  },
  {
    id: 'regex-automata',
    title: '4. Regular Expressions & Finite Automata',
    category: 'Front-End',
    difficulty: 'Medium',
    readTime: '9 min',
    learningObjectives: [
      'Convert regular expressions to Non-Deterministic Finite Automata (NFA) using Thompson\'s Construction.',
      'Convert NFAs to Deterministic Finite Automata (DFA) using Subset Construction.',
      'Minimize DFAs using Hopcroft\'s state partitioning algorithm.',
    ],
    prerequisites: ['3. Lexical Analysis & Tokenization'],
    simpleExplanation:
      'A regular expression is a formula (like `[a-z]+[0-9]*`). A Finite Automaton is a little machine with states and transitions that tests whether a string satisfies that formula step-by-step. NFAs can guess multiple paths; DFAs have exactly one unambiguous road from start to finish.',
    formalDefinition:
      'A DFA is a 5-tuple $(Q, \\Sigma, \\delta, q_0, F)$ where $\\delta: Q \\times \\Sigma \\to Q$ is a deterministic transition function with no $\\epsilon$-transitions.',
    workedExample: {
      title: 'Identifier Pattern Regex to DFA',
      description: 'Pattern: letter (letter | digit)*',
      solutionSteps: [
        'State 0 (Start): Read letter -> Transition to State 1.',
        'State 1 (Accepting): Read letter -> Stay in State 1.',
        'State 1 (Accepting): Read digit -> Stay in State 1.',
        'State 0: Read digit -> Reject (Identifiers cannot begin with a number).',
      ],
    },
    commonMistakes: [
      'Thinking DFAs can count nested parentheses (DFAs have finite memory; nested structures require Context-Free Grammars!).',
      'Forgetting that DFA states in subset construction represent sets of NFA states.',
    ],
    practiceQuestions: [
      {
        question: 'Why can regular expressions not recognize balanced parentheses like ((()))?',
        answer: 'Because finite automata have finite states and cannot maintain an unbounded counter.',
        explanation: 'Recognizing arbitrarily nested structures requires a pushdown automaton (Context-Free Grammar).',
      },
    ],
    relatedTopics: [
      { id: 'syntax-analysis', title: '5. Syntax Analysis & CFGs' },
    ],
    recommendedTool: 'tutor',
  },
  {
    id: 'syntax-analysis',
    title: '5. Syntax Analysis & Context-Free Grammars',
    category: 'Parsing',
    difficulty: 'Medium',
    readTime: '10 min',
    learningObjectives: [
      'Define a Context-Free Grammar (CFG) as a 4-tuple $(V, \\Sigma, R, S)$.',
      'Distinguish between Terminals and Non-Terminals.',
      'Understand Derivations: Leftmost Derivation (LMD) vs Rightmost Derivation (RMD).',
      'Detect Ambiguity in Grammars.',
    ],
    prerequisites: ['4. Regular Expressions & Finite Automata'],
    simpleExplanation:
      'While the Lexer checks spelling of individual words, the Parser checks sentence grammar. "Colorless green ideas sleep furiously" has correct syntax (Noun Adjective Noun Verb Adverb) even if nonsensical. A Context-Free Grammar is a set of substitution rules defining valid sentence structures.',
    formalDefinition:
      'A CFG is defined as $G = (V, \\Sigma, R, S)$ where $V$ is a finite set of non-terminals, $\\Sigma$ is a finite set of terminals disjoint from $V$, $R$ is a finite relation mapping $V \\to (V \\cup \\Sigma)^*$, and $S \\in V$ is the start symbol.',
    workedExample: {
      title: 'Proving Grammar Ambiguity',
      description: 'Grammar: E -> E + E | E * E | id. Input: id + id * id',
      solutionSteps: [
        'Derivation 1 (Addition first): E => E + E => id + E => id + E * E => id + id * id (Yields: (id + id) * id)',
        'Derivation 2 (Multiplication first): E => E * E => E + E * E => id + id * id (Yields: id + (id * id))',
        'Conclusion: Two distinct parse trees exist for the same input string, proving the grammar is AMBIGUOUS!',
      ],
    },
    commonMistakes: [
      'Assuming all ambiguous grammars can be parsed deterministically without disambiguation rules.',
      'Confusing Leftmost Derivation with Bottom-Up Parsing.',
    ],
    practiceQuestions: [
      {
        question: 'What makes a grammar ambiguous?',
        answer: 'When there exists at least one input string that produces more than one distinct parse tree.',
        explanation: 'Ambiguity causes conflicting interpretations of operator precedence or code logic.',
      },
    ],
    relatedTopics: [
      { id: 'left-recursion', title: '6. Left Recursion & Left Factoring' },
      { id: 'first-follow', title: '7. FIRST & FOLLOW Sets' },
    ],
    recommendedTool: 'visualizer',
    presetGrammarId: 'arithmetic-lr',
  },
  {
    id: 'left-recursion',
    title: '6. Left Recursion & Left Factoring',
    category: 'Parsing',
    difficulty: 'Medium',
    readTime: '9 min',
    learningObjectives: [
      'Detect Immediate (Direct) Left Recursion: $A \\to A\\alpha \\mid \\beta$.',
      'Apply the standard transformation to eliminate left recursion.',
      'Perform Left Factoring to eliminate common production prefixes.',
      'Explain why top-down parsers (LL) fail on left-recursive grammars.',
    ],
    prerequisites: ['5. Syntax Analysis & Context-Free Grammars'],
    simpleExplanation:
      'If you tell a robot: "To clean your room, first clean your room, then pick up toys," the robot will crash in an infinite loop without ever picking up a single toy! That is Left Recursion. Left factoring is like organizing a recipe so you don\'t buy ingredients twice before deciding what to cook.',
    formalDefinition:
      'A grammar is left-recursive if it has a non-terminal $A$ such that there is a derivation $A \\Rightarrow^+ A\\alpha$ for some string $\\alpha$. Top-down parsers loop infinitely on left-recursive rules.',
    workedExample: {
      title: 'Eliminating Left Recursion from E -> E + T | T',
      description: 'Here $\\alpha = + T$ and $\\beta = T$.',
      solutionSteps: [
        'Original: E -> E + T | T',
        'Identify: Non-recursive base case $\\beta = T$, recursive suffix $\\alpha = + T$.',
        'Create new non-terminal E\':',
        'New Rule 1: E -> T E\'',
        'New Rule 2: E\' -> + T E\' | ε',
        'Language generated remains identical, but recursion is now right-associative and safe for top-down parsing!',
      ],
    },
    commonMistakes: [
      'Forgetting the epsilon (ε) production in the newly created non-terminal $A\'$.',
      'Assuming left recursion affects Bottom-Up (LR) parsers (LR parsers handle left recursion naturally and efficiently!).',
    ],
    practiceQuestions: [
      {
        question: 'Transform A -> A b | c to eliminate immediate left recursion.',
        answer: 'A -> c A\', A\' -> b A\' | ε',
        explanation: 'The non-recursive choice "c" is placed first followed by tail recursion on A\'.',
      },
    ],
    relatedTopics: [
      { id: 'first-follow', title: '7. FIRST & FOLLOW Sets' },
      { id: 'll1-parsing', title: '8. LL(1) Parsing & Predictive Parsing Tables' },
    ],
    recommendedTool: 'workbench',
    presetGrammarId: 'arithmetic-lr',
  },
  {
    id: 'first-follow',
    title: '7. FIRST & FOLLOW Sets',
    category: 'Parsing',
    difficulty: 'Medium',
    readTime: '11 min',
    learningObjectives: [
      'Compute FIRST sets for any non-terminal and sequence of symbols.',
      'Understand propagation of epsilon (ε) across production symbols.',
      'Compute FOLLOW sets using the three fundamental rules.',
      'Explain why FOLLOW sets never contain epsilon.',
    ],
    prerequisites: ['6. Left Recursion & Left Factoring'],
    simpleExplanation:
      'FIRST(X) asks: "When I expand non-terminal X, what are all the possible first physical tokens I might see on paper?" FOLLOW(X) asks: "If I am standing right next to X, what tokens are allowed to wait immediately to my right across the entire universe of valid code?"',
    formalDefinition:
      '$FIRST(\\alpha)$ is the set of terminals that begin strings derived from $\\alpha$. $FOLLOW(A)$ is the set of terminals $a$ that can appear immediately to the right of $A$ in some sentential form: $S \\Rightarrow^* \\alpha A a \\beta$.',
    workedExample: {
      title: 'FIRST and FOLLOW for Expression Grammar',
      description: 'E -> T E\', E\' -> + T E\' | ε, T -> F T\', T\' -> * F T\' | ε, F -> ( E ) | id',
      solutionSteps: [
        'FIRST(F) = { (, id }',
        'FIRST(T) = FIRST(F) = { (, id }',
        'FIRST(E) = FIRST(T) = { (, id }',
        'FIRST(E\') = { +, ε }, FIRST(T\') = { *, ε }',
        'FOLLOW(E) = { $, ) } (Start symbol gets $, and from F -> ( E ))',
        'FOLLOW(E\') = FOLLOW(E) = { $, ) }',
        'FOLLOW(T) = (FIRST(E\') - {ε}) ∪ FOLLOW(E) = { +, $, ) }',
      ],
    },
    commonMistakes: [
      'Adding epsilon (ε) to a FOLLOW set (CRITICAL RULE: ε is NEVER in any FOLLOW set!).',
      'Forgetting to add $ to FOLLOW of the start symbol.',
      'Failing to propagate FOLLOW(A) to FOLLOW(B) when $A \\to \\alpha B$ or $\\beta \\Rightarrow^* \\epsilon$.',
    ],
    practiceQuestions: [
      {
        question: 'Can epsilon (ε) ever be an element of a FOLLOW set?',
        answer: 'No, never.',
        explanation: 'FOLLOW represents physical lookahead tokens that appear to the right of a non-terminal in a sentential form.',
      },
    ],
    relatedTopics: [
      { id: 'll1-parsing', title: '8. LL(1) Parsing & Predictive Parsing Tables' },
    ],
    recommendedTool: 'workbench',
    presetGrammarId: 'arithmetic-ll1',
  },
  {
    id: 'll1-parsing',
    title: '8. LL(1) Parsing & Predictive Parsing Tables',
    category: 'Parsing',
    difficulty: 'Hard',
    readTime: '12 min',
    learningObjectives: [
      'Construct an LL(1) Predictive Parsing Table using FIRST and FOLLOW sets.',
      'Identify LL(1) conflicts (First/First and First/Follow).',
      'Execute non-recursive predictive parsing with an explicit pushdown stack.',
      'Trace input matching, production expansion, and error detection.',
    ],
    prerequisites: ['7. FIRST & FOLLOW Sets'],
    simpleExplanation:
      'An LL(1) parser is like a train conductor with a timetable (the parsing table). Looking at the symbol on top of the stack and the next single upcoming station token (lookahead = 1), the conductor looks up the exact track switch to take without ever needing to back up or guess.',
    formalDefinition:
      'A grammar is LL(1) if and only if for every pair of productions $A \\to \\alpha \\mid \\beta$: 1. $FIRST(\\alpha) \\cap FIRST(\\beta) = \\emptyset$, and 2. If $\\alpha \\Rightarrow^* \\epsilon$, then $FIRST(\\beta) \\cap FOLLOW(A) = \\emptyset$.',
    workedExample: {
      title: 'Stack parsing "id + id $" with LL(1) table',
      description: 'Stack initialized with [$ E], Input initialized with [id + id $]',
      solutionSteps: [
        'Step 1: Top = E, Lookahead = id. Table M[E, id] = E -> T E\'. Pop E, push E\', T.',
        'Step 2: Top = T, Lookahead = id. Table M[T, id] = T -> F T\'. Pop T, push T\', F.',
        'Step 3: Top = F, Lookahead = id. Table M[F, id] = F -> id. Pop F, push id.',
        'Step 4: Top = id, Lookahead = id. MATCH! Pop id, consume id from input.',
        'Step 5: Top = T\', Lookahead = +. Table M[T\', +] = T\' -> ε. Pop T\'.',
        'Step 6: Top = E\', Lookahead = +. Table M[E\', +] = E\' -> + T E\'. Pop E\', push E\', T, +.',
        'Continue until Stack = [$] and Input = [$] => ACCEPT!',
      ],
    },
    commonMistakes: [
      'Pushing RHS symbols in forward order instead of reverse order onto the stack.',
      'Failing to detect a conflict when multiple productions claim the same table cell.',
    ],
    practiceQuestions: [
      {
        question: 'What does the (1) stand for in LL(1)?',
        answer: 'One token of lookahead.',
        explanation: 'The parser reads exactly one upcoming terminal token to make its deterministic decision.',
      },
    ],
    relatedTopics: [
      { id: 'bottom-up-parsing', title: '9. Bottom-Up Parsing Concepts' },
    ],
    recommendedTool: 'simulator',
    presetGrammarId: 'arithmetic-ll1',
  },
  {
    id: 'bottom-up-parsing',
    title: '9. Bottom-Up Parsing Concepts',
    category: 'Parsing',
    difficulty: 'Medium',
    readTime: '9 min',
    learningObjectives: [
      'Understand Bottom-Up parsing as constructing the parse tree from leaves to root.',
      'Define Handle and Handle Pruning.',
      'Master the 4 Shift-Reduce actions: Shift, Reduce, Accept, and Error.',
      'Identify Shift-Reduce and Reduce-Reduce conflicts.',
    ],
    prerequisites: ['8. LL(1) Parsing & Predictive Parsing Tables'],
    simpleExplanation:
      'Top-down parsing is like a sculptor carving down from a block of marble. Bottom-up parsing is like building with LEGO bricks from the ground up: you inspect the individual tokens (leaves), snap small sub-assemblies together (reduce to handles), and keep building upward until you have the complete castle (start symbol).',
    formalDefinition:
      'Bottom-up parsing reconstructs a Rightmost Derivation in Reverse. At each step, a substring matching the RHS of a production (the handle) is reduced to the LHS non-terminal.',
    workedExample: {
      title: 'Shift-Reduce trace for "id + id"',
      description: 'Grammar: E -> E + T | T, T -> id',
      solutionSteps: [
        'Action 1: Shift "id" onto stack. Stack: [id]',
        'Action 2: Reduce by T -> id. Stack: [T]',
        'Action 3: Reduce by E -> T. Stack: [E]',
        'Action 4: Shift "+". Stack: [E +]',
        'Action 5: Shift "id". Stack: [E + id]',
        'Action 6: Reduce by T -> id. Stack: [E + T]',
        'Action 7: Reduce by E -> E + T. Stack: [E]',
        'Action 8: End of input ($) reached with [E] on stack => ACCEPT!',
      ],
    },
    commonMistakes: [
      'Confusing a substring that matches a production RHS with a true Handle (a handle must also appear in a valid right sentential form!).',
      'Confusing Shift-Reduce conflicts with LL(1) First-Follow conflicts.',
    ],
    practiceQuestions: [
      {
        question: 'What is a Shift-Reduce conflict?',
        answer: 'A situation where the parser cannot decide whether to shift the next token or reduce the current stack symbols.',
        explanation: 'Often caused by ambiguity in expressions (operator precedence) or dangling else statements.',
      },
    ],
    relatedTopics: [
      { id: 'lr-parsing', title: '10. LR Parsing Fundamentals & LR(0) / SLR(1)' },
    ],
    recommendedTool: 'visualizer',
  },
  {
    id: 'lr-parsing',
    title: '10. LR Parsing Fundamentals & LR(0) / SLR(1)',
    category: 'Parsing',
    difficulty: 'Hard',
    readTime: '13 min',
    learningObjectives: [
      'Construct LR(0) items and the Canonical Collection of LR(0) items using CLOSURE and GOTO.',
      'Construct an SLR(1) parsing table using FOLLOW sets to resolve reductions.',
      'Differentiate LR(0), SLR(1), LALR(1), and Canonical LR(1) power hierarchy.',
    ],
    prerequisites: ['9. Bottom-Up Parsing Concepts'],
    simpleExplanation:
      'An LR item is a production rule with a dot `•` indicating our current progress. In `A -> X • Y`, the dot tells us: "We have already seen X on our stack, and we hope to see Y next." SLR(1) only allows reductions when the upcoming lookahead token is legally in FOLLOW(A).',
    formalDefinition:
      'LR(k) stands for Left-to-right scan, Rightmost derivation in reverse, using $k$ lookahead tokens. The power hierarchy is: $LR(0) \\subset SLR(1) \\subset LALR(1) \\subset LR(1)$.',
    workedExample: {
      title: 'Augmented Grammar & Item Closure',
      description: 'Original: S -> A A, A -> a A | b',
      solutionSteps: [
        'Step 1: Augment grammar with new start symbol: S\' -> S',
        'Step 2: State $I_0 = CLOSURE(\\{S\' \\to \\bullet S\\})$',
        'Since dot is before S: add $S \\to \\bullet A A$',
        'Since dot is before A: add $A \\to \\bullet a A$ and $A \\to \\bullet b$',
        'Step 3: Compute $GOTO(I_0, a)$ by shifting dot past "a" to create State $I_1$.',
      ],
    },
    commonMistakes: [
      'Applying reductions across all terminal columns in SLR(1) (reductions in SLR(1) ONLY go into columns in FOLLOW(A)!).',
      'Forgetting to augment the grammar with $S\' \\to S$.',
    ],
    practiceQuestions: [
      {
        question: 'Why is LALR(1) preferred over canonical LR(1) in production parsers like Yacc and Bison?',
        answer: 'LALR(1) merges states with identical core items, reducing table size by up to 90% without introducing shift-reduce conflicts.',
        explanation: 'LR(1) tables often have thousands of states; LALR(1) shrinks this to the same number of states as SLR(1).',
      },
    ],
    relatedTopics: [
      { id: 'sdd-sdt', title: '11. Syntax-Directed Definitions & Translation' },
    ],
    recommendedTool: 'tutor',
  },
  {
    id: 'sdd-sdt',
    title: '11. Syntax-Directed Definitions & Translation',
    category: 'Semantic & Intermediate',
    difficulty: 'Medium',
    readTime: '10 min',
    learningObjectives: [
      'Define Synthesized vs Inherited Attributes.',
      'Differentiate S-Attributed vs L-Attributed SDDs.',
      'Construct an Annotated Parse Tree with attribute evaluation order.',
    ],
    prerequisites: ['5. Syntax Analysis & Context-Free Grammars'],
    simpleExplanation:
      'A CFG gives the skeleton of a tree. SDD adds flesh and blood to the bones by attaching rules to productions, like: "When computing $E \\to E_1 + T$, set $E.val = E_1.val + T.val$". Synthesized attributes flow bottom-up (from children to parent). Inherited attributes flow top-down or sideways.',
    formalDefinition:
      'An SDD is a context-free grammar together with attributes and semantic rules. An S-attributed definition uses synthesized attributes only and can be evaluated during bottom-up parsing.',
    workedExample: {
      title: 'Desk Calculator SDD Evaluation for "3 * 5 + 4"',
      description: 'Evaluating expression value using synthesized attribute .val',
      solutionSteps: [
        'F -> num : F.val = num.lexval (F1.val = 3, F2.val = 5, F3.val = 4)',
        'T -> T * F : T.val = T.val * F.val (T1.val = 3 * 5 = 15)',
        'E -> E + T : E.val = E.val + T.val (E.val = 15 + 4 = 19)',
        'Root output attribute is 19.',
      ],
    },
    commonMistakes: [
      'Allowing cycles in dependency graphs (an attribute cannot depend on itself!).',
      'Trying to evaluate inherited attributes in a pure bottom-up S-attributed parser without restructuring.',
    ],
    practiceQuestions: [
      {
        question: 'Where can an inherited attribute get its value from?',
        answer: 'From its parent node or its left sibling nodes in the parse tree.',
        explanation: 'In L-attributed definitions, attributes never depend on right siblings or children.',
      },
    ],
    relatedTopics: [
      { id: 'icg-tac', title: '12. Intermediate Code Generation & TAC' },
    ],
    recommendedTool: 'visualizer',
  },
  {
    id: 'icg-tac',
    title: '12. Intermediate Code Generation & Three-Address Code',
    category: 'Semantic & Intermediate',
    difficulty: 'Medium',
    readTime: '8 min',
    learningObjectives: [
      'Explain the purpose of machine-independent Intermediate Representations (IR).',
      'Define Three-Address Code (TAC) constraints (at most one operator per instruction).',
      'Translate arithmetic, boolean, and control flow statements into TAC.',
    ],
    prerequisites: ['11. Syntax-Directed Definitions & Translation'],
    simpleExplanation:
      'Imagine translating 10 source languages (C, Rust, Go, Python...) into 5 hardware chips (x86, ARM, RISC-V, MIPS...). Without an intermediate representation, you need $10 \\times 5 = 50$ distinct translators! With TAC in the middle, you only need $10 + 5 = 15$ modules.',
    formalDefinition:
      'Three-Address Code (TAC) is an intermediate representation where each instruction has at most one operator on the right-hand side: $x = y \\text{ op } z$.',
    workedExample: {
      title: 'Translating "while (a < b) { a = a + 1; }"',
      description: 'Control flow translation with labels and conditional jumps:',
      solutionSteps: [
        'L1: if a >= b goto L2',
        '    t1 = a + 1',
        '    a = t1',
        '    goto L1',
        'L2: (continuation code)',
      ],
    },
    commonMistakes: [
      'Writing compound expressions like "t1 = a + b * c" in a single TAC instruction (TAC strictly allows only 1 operator per line!).',
      'Using the same temporary variable when life ranges overlap.',
    ],
    practiceQuestions: [
      {
        question: 'How many addresses appear in the TAC instruction: x = y + z?',
        answer: 'Three addresses: x, y, and z.',
        explanation: 'One destination address and two source operand addresses.',
      },
    ],
    relatedTopics: [
      { id: 'quadruples-triples', title: '13. Quadruples, Triples & Indirect Triples' },
    ],
    recommendedTool: 'pipeline',
  },
  {
    id: 'quadruples-triples',
    title: '13. Quadruples, Triples & Indirect Triples',
    category: 'Semantic & Intermediate',
    difficulty: 'Medium',
    readTime: '8 min',
    learningObjectives: [
      'Represent TAC using Quadruples: (op, arg1, arg2, result).',
      'Represent TAC using Triples: (op, arg1, arg2) referencing instruction positions.',
      'Compare memory efficiency and ease of code movement in optimization.',
    ],
    prerequisites: ['12. Intermediate Code Generation & TAC'],
    simpleExplanation:
      'A Quadruple is like an explicit receipt with 4 columns: Operation, Argument 1, Argument 2, and Named Container. A Triple saves paper by omitting the named container and referring to previous row numbers: e.g. "(+) row 0 and 5". Indirect triples add an array of pointers so you can reorder instructions during optimization without breaking row pointers.',
    formalDefinition:
      'A Quadruple has 4 fields: `op`, `arg1`, `arg2`, and `result`. A Triple has 3 fields: `op`, `arg1`, `arg2`, with results referenced by position index.',
    workedExample: {
      title: 'Quadruples for "a = b * -c + b * -c"',
      description: 'Quadruple representation table:',
      solutionSteps: [
        '(0) [uminus, c, -, t1]',
        '(1) [*, b, t1, t2]',
        '(2) [uminus, c, -, t3]',
        '(3) [*, b, t3, t4]',
        '(4) [+, t2, t4, t5]',
        '(5) [=, t5, -, a]',
      ],
    },
    commonMistakes: [
      'Moving rows in a Triples table without updating every positional reference in other rows.',
      'Putting variable names in the result field of Triples.',
    ],
    practiceQuestions: [
      {
        question: 'Why are Quadruples easier to optimize than Triples?',
        answer: 'Because moving instructions does not require changing explicit result names, unlike position indices in Triples.',
        explanation: 'Quadruples decouple instruction identity from physical table row indexing.',
      },
    ],
    relatedTopics: [
      { id: 'code-optimization', title: '15. Code Optimization' },
    ],
    recommendedTool: 'pipeline',
  },
  {
    id: 'runtime-symbol-tables',
    title: '14. Runtime Environments & Symbol Tables',
    category: 'Back-End & Optimization',
    difficulty: 'Medium',
    readTime: '10 min',
    learningObjectives: [
      'Understand memory layout: Code, Static Data, Heap, and Call Stack.',
      'Examine Activation Records (Stack Frames): return address, actual parameters, local variables, saved registers.',
      'Implement Symbol Table data structures (Hash tables with scope chaining).',
    ],
    prerequisites: ['2. Compiler Architecture & The 7 Phases'],
    simpleExplanation:
      'When your program runs, memory is like an apartment building. The ground floor stores static furniture (Global variables & machine code). The top floor is a stack of plates: every time a function is called, a new plate (activation frame) is placed on top. When the function returns, the plate is washed and thrown away.',
    formalDefinition:
      'An Activation Record (or Stack Frame) is a contiguous block of storage allocated on the runtime call stack each time a procedure or function is invoked.',
    workedExample: {
      title: 'Activation Record Components for "int foo(int x, int y)"',
      description: 'Stack frame contents from top to bottom:',
      solutionSteps: [
        '1. Actual parameters (x, y)',
        '2. Return address (Instruction pointer to resume caller)',
        '3. Control link (Dynamic link pointing to caller\'s frame pointer)',
        '4. Access link (Static link for nested lexical scoping)',
        '5. Saved machine registers',
        '6. Local variables allocated inside foo',
        '7. Temporary evaluation storage',
      ],
    },
    commonMistakes: [
      'Confusing dynamic links (who called me) with static links (where am I nested lexically).',
      'Thinking heap memory deallocates automatically when a function stack frame returns in C/C++.',
    ],
    practiceQuestions: [
      {
        question: 'What happens to local variables when a recursive function calls itself?',
        answer: 'A fresh activation record is pushed onto the stack with new independent copies of the local variables.',
        explanation: 'Each invocation maintains its own private stack frame memory.',
      },
    ],
    relatedTopics: [
      { id: 'target-code-gen', title: '16. Target Code Generation' },
    ],
    recommendedTool: 'pipeline',
  },
  {
    id: 'code-optimization',
    title: '15. Code Optimization',
    category: 'Back-End & Optimization',
    difficulty: 'Hard',
    readTime: '11 min',
    learningObjectives: [
      'Classify optimizations: Machine-Independent vs Machine-Dependent.',
      'Master Constant Folding and Constant Propagation.',
      'Eliminate Common Subexpressions and Dead Code.',
      'Perform Loop Optimizations: Loop Invariant Code Motion and Strength Reduction.',
      'Understand Basic Blocks and Control Flow Graphs (CFGs).',
    ],
    prerequisites: ['12. Intermediate Code Generation & TAC'],
    simpleExplanation:
      'Code optimization is like editing an essay to make it concise and punchy without altering its meaning. If a programmer writes `x = 2 * 3.14159 * r`, why calculate `2 * 3.14159` a billion times in a loop? The compiler computes `6.28318` once at compile time (Constant Folding)!',
    formalDefinition:
      'Program optimization is the process of modifying code to consume fewer resources (execution time, memory space, or battery power) while strictly preserving semantic program equivalence.',
    workedExample: {
      title: 'Optimizing a Loop with Strength Reduction and Code Motion',
      description: 'Original: for(i=0; i<N; i++) { x = 10 * y; arr[i] = i * 4; }',
      solutionSteps: [
        '1. Loop Invariant Code Motion: "x = 10 * y" does not depend on loop counter i. Move it before the loop!',
        '2. Strength Reduction: Replace expensive multiplication "i * 4" with an addition "temp += 4" on each iteration.',
        'Resulting loop runs up to 3x faster on standard CPU architectures.',
      ],
    },
    commonMistakes: [
      'Optimizing code in ways that alter floating-point rounding or trigger undefined behavior.',
      'Confusing constant folding (computing literals at compile time) with constant propagation (substituting known variable values).',
    ],
    practiceQuestions: [
      {
        question: 'What is a Basic Block in compiler optimization?',
        answer: 'A sequence of consecutive statements with single entry (at start) and single exit (at end), with no internal branches.',
        explanation: 'Basic blocks are the nodes of Control Flow Graphs (CFGs).',
      },
    ],
    relatedTopics: [
      { id: 'target-code-gen', title: '16. Target Code Generation' },
    ],
    recommendedTool: 'pipeline',
  },
  {
    id: 'target-code-gen',
    title: '16. Target Code Generation & Register Allocation',
    category: 'Back-End & Optimization',
    difficulty: 'Hard',
    readTime: '10 min',
    learningObjectives: [
      'Understand the role of the Instruction Selector and Register Allocator.',
      'Model Register Allocation using Graph Coloring (Chaitin\'s Algorithm).',
      'Generate code for Basic Blocks using DAGs.',
      'Manage register spills when CPU register count is exceeded.',
    ],
    prerequisites: ['15. Code Optimization'],
    simpleExplanation:
      'CPU registers are like the pockets of an apron: you only have 8 to 16 of them, but reaching into your pocket takes 1 nanosecond, while walking over to the refrigerator (RAM) takes 100 nanoseconds. The compiler must decide which variables get to live in pockets and which must be stored in the fridge.',
    formalDefinition:
      'Register allocation determines which program values reside in machine registers at each program point. Graph coloring models this as assigning $K$ register colors to an interference graph where nodes are variables and edges connect concurrently live variables.',
    workedExample: {
      title: 'Generating Assembly for "t1 = a + b; x = t1 * c"',
      description: 'Target: 2-address instruction set with registers R0, R1',
      solutionSteps: [
        'MOV R0, a       ; R0 = a',
        'ADD R0, b       ; R0 = R0 + b (now holds t1)',
        'MOV R1, c       ; R1 = c',
        'MUL R0, R1      ; R0 = R0 * R1',
        'MOV [x], R0     ; Store result into memory address of x',
      ],
    },
    commonMistakes: [
      'Attempting register allocation before determining variable liveness (live-range analysis).',
      'Forgetting that memory loads and stores incur high latency penalties (pipeline stalls).',
    ],
    practiceQuestions: [
      {
        question: 'What is a register spill?',
        answer: 'Moving a value from a CPU register into stack memory when all available physical registers are occupied.',
        explanation: 'Spilling preserves values at the cost of additional memory store and load instructions.',
      },
    ],
    relatedTopics: [
      { id: 'error-recovery', title: '17. Error Detection & Recovery Strategies' },
    ],
    recommendedTool: 'pipeline',
  },
  {
    id: 'error-recovery',
    title: '17. Compiler Error Detection & Recovery Strategies',
    category: 'Front-End',
    difficulty: 'Medium',
    readTime: '8 min',
    learningObjectives: [
      'Classify errors: Lexical, Syntactic, Semantic, and Logical.',
      'Understand Panic-Mode Error Recovery.',
      'Understand Phrase-Level Recovery and Error Productions.',
      'Prevent error avalanches / cascading false diagnostic messages.',
    ],
    prerequisites: ['5. Syntax Analysis & Context-Free Grammars', '8. LL(1) Parsing'],
    simpleExplanation:
      'If your compiler stopped dead at the very first missing semicolon and quit, you would hate it! Instead, when a compiler spots an error, it performs Panic Mode: it skips forward until it finds a safe synchronization token (like a semicolon or closing brace) and resumes parsing the rest of your file.',
    formalDefinition:
      'Error recovery strategies allow a compiler to continue syntax and semantic analysis after discovering a syntactic defect, so that as many genuine diagnostics as possible are reported in a single compilation run.',
    workedExample: {
      title: 'Panic Mode Recovery in an LL(1) Parser',
      description: 'Synchronizing set selection:',
      solutionSteps: [
        '1. When table cell M[A, a] is empty, signal syntax error.',
        '2. Define Synchronizing Tokens for A as elements of FOLLOW(A).',
        '3. Parser skips incoming input tokens until a token in FOLLOW(A) appears.',
        '4. Pop non-terminal A from the stack and continue parsing gracefully without crashing!',
      ],
    },
    commonMistakes: [
      'Confusing semantic errors (e.g. type mismatch) with syntax errors (e.g. missing paren).',
      'Failing to limit error message cascades (reporting 50 bogus errors triggered by 1 missing bracket).',
    ],
    practiceQuestions: [
      {
        question: 'What are synchronizing tokens in panic-mode parser error recovery?',
        answer: 'Tokens (typically delimiters like semicolons or closing braces) at which the parser can resume normal parsing.',
        explanation: 'They provide safe boundary points where sentential structure is reliably re-anchored.',
      },
    ],
    relatedTopics: [
      { id: 'syntax-analysis', title: '5. Syntax Analysis & CFGs' },
      { id: 'll1-parsing', title: '8. LL(1) Parsing & Predictive Parsing Tables' },
    ],
    recommendedTool: 'simulator',
  },
];

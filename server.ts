import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

// Import deterministic compiler algorithms into backend
import {
  parseGrammarText,
  computeFirstAndFollow,
  eliminateLeftRecursion,
  leftFactoring,
  buildLL1ParsingTable,
  PRESET_GRAMMARS,
} from './src/compiler/grammarEngine.ts';
import { simulateLL1Parser } from './src/compiler/parserSimulator.ts';
import { generateExpressionParseTree, generateAST } from './src/compiler/parseTreeEngine.ts';
import { runCompilerPipeline } from './src/compiler/pipelineEngine.ts';
import { TOPICS_DATA } from './src/data/topicsData.ts';
import { QUIZ_QUESTIONS } from './src/data/quizData.ts';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for Vercel and cross-origin frontend clients
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// Health check endpoint for Render deployment monitoring
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Smart-AI-Tutor-Backend', timestamp: Date.now() });
});

// In-Memory Database for backend persistence
interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty';
  createdAt: string;
}

const db = {
  users: [
    {
      id: 'usr-1',
      name: 'Ajay Kumaran',
      email: 'ajaykumaranp06@gmail.com',
      role: 'student' as const,
      createdAt: '2026-10-10T10:00:00Z',
    },
    {
      id: 'usr-fac-1',
      name: 'Prof. S. R. Ramanathan',
      email: 'faculty@university.edu',
      role: 'faculty' as const,
      createdAt: '2026-09-01T08:30:00Z',
    },
  ],
  sessions: new Map<string, UserRecord>([
    [
      'auth-token-demo-123',
      {
        id: 'usr-1',
        name: 'Ajay Kumaran',
        email: 'ajaykumaranp06@gmail.com',
        role: 'student',
        createdAt: '2026-10-10T10:00:00Z',
      },
    ],
  ]),
  quizAttempts: [
    {
      id: 'attempt-backend-1',
      userId: 'usr-1',
      topicId: 'intro-compilers',
      topicTitle: 'Introduction to Compilers & Interpreters',
      score: 1,
      totalQuestions: 1,
      percentage: 100,
      timestamp: Date.now() - 3600000 * 5,
    },
  ],
  conversations: new Map<string, { id: string; userId: string; title: string; messages: any[] }>(),
};

// Helper to initialize GoogleGenAI if key is present
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Pedagogical fallback response generator
function generateCuratedTutorResponse(
  message: string,
  mode: string = 'beginner',
  topicTitle?: string,
  algorithmContext?: any
): string {
  const lowerMsg = message.toLowerCase();

  if (algorithmContext) {
    if (algorithmContext.type === 'first_follow') {
      return `### Explanation of FIRST and FOLLOW Sets

Based on the computed grammar rules:
**1. FIRST Sets:**
${Object.entries(algorithmContext.firstSets || {})
  .map(([nt, set]) => `- **FIRST(${nt})**: { ${(set as string[]).join(', ')} } — Calculated by looking at the leftmost derivation symbols for ${nt}. If a rule derives ε (epsilon), ε is included.`)
  .join('\n')}

**2. FOLLOW Sets:**
${Object.entries(algorithmContext.followSets || {})
  .map(([nt, set]) => `- **FOLLOW(${nt})**: { ${(set as string[]).join(', ')} } — Calculated by inspecting symbols that immediately appear to the right of ${nt} across all productions. The start symbol automatically includes \`$\` (end of input marker).`)
  .join('\n')}

**Key Rule to Remember:**
- ε is **never** in any FOLLOW set! Only terminal symbols and \`$\` can be elements of FOLLOW.
- If $A \\to \\alpha B \\beta$, then everything in $FIRST(\\beta)$ except $\\epsilon$ is added to $FOLLOW(B)$.`;
    }

    if (algorithmContext.type === 'left_recursion') {
      return `### Explanation of Immediate Left Recursion Removal

**Problem with Left Recursion:**
A production of the form $A \\to A\\alpha \\mid \\beta$ causes an infinite recursive loop in top-down parsers like LL(1) or Recursive Descent because the parser repeatedly expands $A$ without consuming any input token.

**Standard Transformation Applied:**
1. Group recursive productions: $A \\to A\\alpha_1 \\mid A\\alpha_2 \\mid \\dots$
2. Group non-recursive productions: $A \\to \\beta_1 \\mid \\beta_2 \\mid \\dots$
3. Introduce a new non-terminal $A'$:
   - $A \\to \\beta_1 A' \\mid \\beta_2 A' \\dots$
   - $A' \\to \\alpha_1 A' \\mid \\alpha_2 A' \\dots \\mid \\epsilon$

This converts the left-associative recursion into right recursion while preserving the accepted language!`;
    }

    if (algorithmContext.type === 'll1_table') {
      const isLL1 = algorithmContext.isLL1;
      return `### LL(1) Predictive Parsing Table Analysis

**Grammar LL(1) Status:** ${isLL1 ? '✅ Grammar IS LL(1) compatible' : '⚠️ Grammar is NOT LL(1) compatible (Conflicts detected)'}

**How the table was populated:**
1. For each production $A \\to \\alpha$:
   - For every terminal $a \\in FIRST(\\alpha)$, add $A \\to \\alpha$ to $M[A, a]$.
   - If $\\epsilon \\in FIRST(\\alpha)$, then for every terminal $b \\in FOLLOW(A)$ (including $\\$$), add $A \\to \\alpha$ to $M[A, b]$.
2. **Conflict Rule:**
   - If any cell $M[A, a]$ receives more than one production, an LL(1) conflict occurs (First/First conflict or First/Follow conflict).
   ${isLL1 ? '- In your grammar, every cell has at most one rule, so a deterministic predictive parser can make decisions with a single token of lookahead.' : '- In your grammar, at least one cell has multiple candidate productions. A deterministic top-down parser cannot decide which production to pick without backtracking.'}`;
    }
  }

  if (lowerMsg.includes('first') && lowerMsg.includes('follow')) {
    if (mode === 'beginner') {
      return `### FIRST and FOLLOW Sets Explained Simply

Think of FIRST and FOLLOW like train stations and passengers:

1. **FIRST(X):** *"If I take a train starting at station X, what are all the possible first physical stations (terminals) I could see?"*
   - If $X$ can dissolve into empty air ($\\epsilon$), then $\\epsilon \\in FIRST(X)$.

2. **FOLLOW(X):** *"If I am currently at station X, what are all the physical stations (terminals) that could possibly wait right behind me on the entire journey?"*
   - The end-of-file marker \`$\` is always waiting at the end of the start station!

**Crucial rule for exams:** $\\epsilon$ is **NEVER** in any FOLLOW set!`;
    } else if (mode === 'exam') {
      return `### Exam Notes: FIRST & FOLLOW Set Algorithms

#### Definition of FIRST:
Let $\\alpha$ be any string of grammar symbols. $FIRST(\\alpha)$ is the set of terminals that begin strings derived from $\\alpha$. If $\\alpha \\Rightarrow^* \\epsilon$, then $\\epsilon \\in FIRST(\\alpha)$.

**Rules for FIRST(X):**
1. If $X$ is a terminal, $FIRST(X) = \\{X\\}$.
2. If $X \\to \\epsilon$, then $\\epsilon \\in FIRST(X)$.
3. If $X$ is a non-terminal and $X \\to Y_1 Y_2 \\dots Y_k$:
   - Add $a \\in FIRST(Y_1)$ (if $a \\neq \\epsilon$).
   - If $Y_1 \\Rightarrow^* \\epsilon$, inspect $FIRST(Y_2)$, continuing until a symbol does not derive $\\epsilon$.
   - If all $Y_1 \\dots Y_k \\Rightarrow^* \\epsilon$, add $\\epsilon$ to $FIRST(X)$.

#### Rules for FOLLOW(A):
$FOLLOW(A)$ is the set of terminals $a$ that can appear immediately to the right of $A$ in some sentential form: $S \\Rightarrow^* \\alpha A a \\beta$.
1. Place $\\$$ in $FOLLOW(S)$, where $S$ is start symbol.
2. If $A \\to \\alpha B \\beta$, everything in $FIRST(\\beta)$ (except $\\epsilon$) is in $FOLLOW(B)$.
3. If $A \\to \\alpha B$ or $A \\to \\alpha B \\beta$ where $FIRST(\\beta)$ contains $\\epsilon$, everything in $FOLLOW(A)$ is in $FOLLOW(B)$.`;
    } else {
      return `### Comprehensive Guide: FIRST and FOLLOW Sets

FIRST and FOLLOW sets are fundamental static analysis sets used to construct top-down predictive parsers (like LL(1)) and bottom-up LR parsing tables.

- **FIRST Set:** Determines which production alternative to expand when inspecting the lookahead terminal.
- **FOLLOW Set:** Tells the parser which productions to choose when a non-terminal can derive $\\epsilon$, or when error recovery (panic mode) is executed.`;
    }
  }

  if (lowerMsg.includes('ll(1)') || lowerMsg.includes('predictive parse') || lowerMsg.includes('ll1')) {
    return `### LL(1) Parsing Mechanics

**What does LL(1) stand for?**
- **L**: Left-to-right scan of the input
- **L**: Leftmost derivation constructed
- **(1)**: 1 token of lookahead used to make deterministic decisions

**The 3 Necessary Conditions for a Grammar to be LL(1):**
1. **No Left Recursion:** Direct or indirect left recursion immediately violates LL(1).
2. **Left Factored:** No two productions for non-terminal $A$ can share a common prefix ($FIRST(\\alpha) \\cap FIRST(\\beta) = \\emptyset$).
3. **Disjoint FIRST and FOLLOW:** If $A \\to \\alpha$ and $A \\to \\beta$ where $\\alpha \\Rightarrow^* \\epsilon$, then $FIRST(\\beta) \\cap FOLLOW(A) = \\emptyset$.`;
  }

  return `### Tutor Response: ${topicTitle || 'Compiler Design'}

Thank you for your question: *"${message}"*

In compiler theory, this relates to formal grammar transformations and deterministic parsing tables. 
You can test grammar rules live in our **Grammar Workbench** or visualize tree derivations in the **Parse Tree Visualizer**!`;
}

// ==========================================
// BACKEND API ROUTES (/api/v1)
// ==========================================

// 1. Health & Server Metadata
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'AI Smart Compiler Tutor Backend Engine',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// 2. Authentication API (PRD Module 1)
app.post('/api/v1/auth/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  const existing = db.users.find(u => u.email === email);
  if (existing) {
    res.status(409).json({ error: 'A student account with this email already exists' });
    return;
  }

  const newUser: UserRecord = {
    id: `usr-${Date.now()}`,
    name,
    email,
    role: 'student',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  const token = `token-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  db.sessions.set(token, newUser);

  res.status(201).json({
    user: newUser,
    token,
    message: 'Student account registered successfully',
  });
});

app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const user = db.users.find(u => u.email === email);
  if (!user) {
    // Auto-create or return demo user
    const defaultUser = db.users[0];
    const token = 'auth-token-demo-123';
    res.json({
      user: defaultUser,
      token,
      message: 'Demo login authenticated',
    });
    return;
  }

  const token = `token-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  db.sessions.set(token, user);
  res.json({ user, token, message: 'Login successful' });
});

app.get('/api/v1/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '') || 'auth-token-demo-123';
  const user = db.sessions.get(token) || db.users[0];

  res.json({ user });
});

app.post('/api/v1/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (token) db.sessions.delete(token);
  res.json({ message: 'Logged out successfully' });
});

// 3. Curriculum Topics API (PRD Module 2)
app.get('/api/v1/topics', (_req: Request, res: Response) => {
  res.json({
    topics: TOPICS_DATA.map(t => ({
      id: t.id,
      title: t.title,
      category: t.category,
      difficulty: t.difficulty,
      readTime: t.readTime,
      prerequisites: t.prerequisites,
    })),
  });
});

app.get('/api/v1/topics/:id', (req: Request, res: Response) => {
  const topic = TOPICS_DATA.find(t => t.id === req.params.id);
  if (!topic) {
    res.status(404).json({ error: `Topic "${req.params.id}" not found` });
    return;
  }
  res.json({ topic });
});

// 4. Grammar Engine API (PRD Module 4)
app.post('/api/v1/compiler/first-follow', (req: Request, res: Response) => {
  const { grammarText } = req.body;
  if (!grammarText || typeof grammarText !== 'string') {
    res.status(400).json({ error: 'grammarText is required' });
    return;
  }

  const { grammar, errors } = parseGrammarText(grammarText);
  if (errors.length > 0) {
    res.status(422).json({ errors });
    return;
  }

  const result = computeFirstAndFollow(grammar);
  res.json({
    grammar,
    firstSets: result.firstSets,
    followSets: result.followSets,
    firstSteps: result.firstSteps,
    followSteps: result.followSteps,
  });
});

app.post('/api/v1/compiler/left-recursion', (req: Request, res: Response) => {
  const { grammarText } = req.body;
  const { grammar, errors } = parseGrammarText(grammarText || '');
  if (errors.length > 0) {
    res.status(422).json({ errors });
    return;
  }

  const result = eliminateLeftRecursion(grammar);
  res.json(result);
});

app.post('/api/v1/compiler/left-factoring', (req: Request, res: Response) => {
  const { grammarText } = req.body;
  const { grammar, errors } = parseGrammarText(grammarText || '');
  if (errors.length > 0) {
    res.status(422).json({ errors });
    return;
  }

  const result = leftFactoring(grammar);
  res.json(result);
});

app.post('/api/v1/compiler/ll1-table', (req: Request, res: Response) => {
  const { grammarText } = req.body;
  const { grammar, errors } = parseGrammarText(grammarText || '');
  if (errors.length > 0) {
    res.status(422).json({ errors });
    return;
  }

  const firstFollow = computeFirstAndFollow(grammar);
  const result = buildLL1ParsingTable(grammar, firstFollow);
  res.json(result);
});

// 5. Parser Simulator API (PRD Module 5)
app.post('/api/v1/compiler/parse', (req: Request, res: Response) => {
  const { grammarText, inputString } = req.body;
  const { grammar, errors } = parseGrammarText(grammarText || PRESET_GRAMMARS[0].grammarText);
  if (errors.length > 0) {
    res.status(422).json({ errors });
    return;
  }

  const firstFollow = computeFirstAndFollow(grammar);
  const table = buildLL1ParsingTable(grammar, firstFollow);
  const simulation = simulateLL1Parser(grammar, table, inputString || 'id + id * id');

  res.json(simulation);
});

// 6. Tree & AST Visualizer API (PRD Module 3)
app.post('/api/v1/compiler/parse-tree', (req: Request, res: Response) => {
  const { expression } = req.body;
  const tree = generateExpressionParseTree(expression || 'id + id * id');
  res.json(tree);
});

app.post('/api/v1/compiler/ast', (req: Request, res: Response) => {
  const { expression } = req.body;
  const ast = generateAST(expression || 'id + id * id');
  res.json(ast);
});

// 7. Compiler Pipeline API (PRD Module 6)
app.post('/api/v1/compiler/pipeline', (req: Request, res: Response) => {
  const { sourceCode } = req.body;
  const execution = runCompilerPipeline(sourceCode || 'x = 2 + 3 * 4');
  res.json(execution);
});

// 8. Quizzes & Assessments API (PRD Module 7)
app.get('/api/v1/quizzes', (req: Request, res: Response) => {
  const { topicId, difficulty } = req.query;
  let questions = QUIZ_QUESTIONS;

  if (topicId && topicId !== 'all') {
    questions = questions.filter(q => q.topicId === topicId);
  }
  if (difficulty && difficulty !== 'all') {
    questions = questions.filter(q => q.difficulty === difficulty);
  }

  res.json({ questions, total: questions.length });
});

app.post('/api/v1/quizzes/submit', (req: Request, res: Response) => {
  const { topicId, mode = 'practice', answers } = req.body;
  // Evaluate answers server-side
  let score = 0;
  const results = (answers || []).map((ans: any) => {
    const q = QUIZ_QUESTIONS.find(item => item.id === ans.questionId);
    const isCorrect = q ? q.correctAnswerIndex === ans.chosenIndex : false;
    if (isCorrect) score++;

    return {
      questionId: ans.questionId,
      chosenIndex: ans.chosenIndex,
      correctIndex: q ? q.correctAnswerIndex : -1,
      isCorrect,
      explanation: q?.explanation || '',
    };
  });

  const total = answers?.length || 1;
  const percentage = Math.round((score / total) * 100);

  const matchedTopic = TOPICS_DATA.find(t => t.id === topicId);
  const attemptRecord = {
    id: `attempt-${Date.now()}`,
    userId: 'usr-1',
    topicId: topicId || 'general',
    topicTitle: matchedTopic ? matchedTopic.title : 'General Compiler Design Assessment',
    score,
    totalQuestions: total,
    percentage,
    timestamp: Date.now(),
  };

  db.quizAttempts.unshift(attemptRecord);

  res.json({
    attemptId: attemptRecord.id,
    score,
    totalQuestions: total,
    percentage,
    results,
  });
});

app.get('/api/v1/quiz-attempts', (_req: Request, res: Response) => {
  res.json({ attempts: db.quizAttempts });
});

// 9. AI Tutor API (PRD Module 2)
const handleTutorChat = async (req: Request, res: Response) => {
  try {
    const { message, mode = 'beginner', topic = 'General', conversationHistory = [], algorithmContext } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      const fallbackResponse = generateCuratedTutorResponse(message, mode, topic, algorithmContext);
      res.json({
        reply: fallbackResponse,
        source: 'curated-engine',
        mode,
        topic,
      });
      return;
    }

    const modeInstructions = {
      beginner: 'Explain concepts in intuitive, beginner-friendly language using everyday analogies.',
      detailed: 'Provide in-depth technical explanations with rigorous algorithm logic and formal CFG formulas.',
      exam: 'Format response for university exam preparation: formal definitions, textbook terminology, and worked steps.',
    }[mode as 'beginner' | 'detailed' | 'exam'] || 'Explain clearly and educationally.';

    let contextSnippet = '';
    if (algorithmContext) {
      contextSnippet = `\n[VERIFIED COMPILER ENGINE OUTPUT DATA - USE AS ABSOLUTE TRUTH]:\n${JSON.stringify(algorithmContext, null, 2)}\n`;
    }

    const systemPrompt = `You are the AI Tutor for "AI Smart Compiler Tutor", an academic compiler design educational platform for university computer science students.
Teaching Mode: ${mode.toUpperCase()} - ${modeInstructions}
Current Topic Context: ${topic}
${contextSnippet}

Guidelines:
- Explain with absolute mathematical and algorithmic precision.
- Use markdown headings, bold text, and code blocks for grammars and expressions.
- If algorithm context is provided, explain the specific calculated values accurately.`;

    const contents: any[] = [];
    if (Array.isArray(conversationHistory)) {
      conversationHistory.slice(-4).forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nStudent Question: ${message}` }],
    });

    const candidateModels = Array.from(
      new Set([
        process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3.8-flash',
        'gemini-3.5-flash',
      ])
    );

    let response: any;
    let usedModel = candidateModels[0];
    let lastError: any = null;

    for (const m of candidateModels) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on ${m}`)), 10000)
        );
        response = await Promise.race([
          ai.models.generateContent({
            model: m,
            contents,
          }),
          timeoutPromise,
        ]);
        usedModel = m;
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini] Model ${m} unavailable (${err?.status || err?.message || 'error'}). Trying next model...`);
      }
    }

    if (!response) {
      throw lastError || new Error('All Gemini candidate models failed');
    }

    const reply = response.text || generateCuratedTutorResponse(message, mode, topic, algorithmContext);
    res.json({
      reply,
      source: usedModel,
      mode,
      topic,
    });
  } catch (error: any) {
    console.error('[Gemini AI Tutor Error]:', error?.message || error);
    const fallbackResponse = generateCuratedTutorResponse(
      req.body.message || '',
      req.body.mode || 'beginner',
      req.body.topic || 'General',
      req.body.algorithmContext
    );
    res.json({
      reply: fallbackResponse,
      source: 'curated-engine-fallback',
      mode: req.body.mode,
      topic: req.body.topic,
    });
  }
};

app.post('/api/tutor/chat', handleTutorChat);
app.post('/api/v1/tutor/chat', handleTutorChat);

// Setup Vite in development or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

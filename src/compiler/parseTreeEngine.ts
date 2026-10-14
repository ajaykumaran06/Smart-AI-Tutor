// Parse Tree and Abstract Syntax Tree (AST) Generator & Visual Layout Engine

export interface TreeNode {
  id: string;
  label: string;
  type: 'root' | 'non-terminal' | 'terminal' | 'operator' | 'identifier' | 'number';
  ruleApplied?: string;
  depth: number;
  x: number;
  y: number;
  children: TreeNode[];
  stepIndex: number;
  explanation: string;
}

export interface TreeLayoutResult {
  root: TreeNode;
  allNodes: TreeNode[];
  edges: { from: string; to: string; fromPos: [number, number]; toPos: [number, number] }[];
  width: number;
  height: number;
  totalSteps: number;
}

// Token for expressions
interface ExprToken {
  type: 'id' | 'num' | 'op' | 'lparen' | 'rparen';
  value: string;
}

export function tokenizeExpression(expr: string): ExprToken[] {
  const tokens: ExprToken[] = [];
  const str = expr.trim();
  let i = 0;

  while (i < str.length) {
    const ch = str[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'lparen', value: '(' });
      i++;
    } else if (ch === ')') {
      tokens.push({ type: 'rparen', value: ')' });
      i++;
    } else if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      tokens.push({ type: 'op', value: ch });
      i++;
    } else if (/[0-9]/.test(ch)) {
      let num = '';
      while (i < str.length && /[0-9]/.test(str[i])) {
        num += str[i];
        i++;
      }
      tokens.push({ type: 'num', value: num });
    } else if (/[a-zA-Z_]/.test(ch)) {
      let id = '';
      while (i < str.length && /[a-zA-Z0-9_]/.test(str[i])) {
        id += str[i];
        i++;
      }
      tokens.push({ type: 'id', value: id });
    } else {
      tokens.push({ type: 'id', value: ch });
      i++;
    }
  }

  return tokens;
}

// Generate Parse Tree for Expression based on standard arithmetic CFG:
// E -> E + T | E - T | T
// T -> T * F | T / F | F
// F -> ( E ) | id | num
export function generateExpressionParseTree(exprStr: string): TreeLayoutResult {
  const tokens = tokenizeExpression(exprStr || 'id + id * id');
  let tokenIdx = 0;
  let nodeCounter = 0;
  let currentStep = 0;

  function peek(): ExprToken | undefined {
    return tokens[tokenIdx];
  }

  function consume(expected?: string): ExprToken {
    const t = tokens[tokenIdx];
    if (!t) {
      return { type: 'id', value: '?' };
    }
    if (expected && t.value !== expected) {
      // Still consume to allow recovery
    }
    tokenIdx++;
    return t;
  }

  // Parse F -> ( E ) | id | num
  function parseF(): TreeNode {
    const step = currentStep++;
    const fNode: TreeNode = {
      id: `node-${++nodeCounter}`,
      label: 'F',
      type: 'non-terminal',
      depth: 0,
      x: 0,
      y: 0,
      children: [],
      stepIndex: step,
      explanation: 'Factor (F): Smallest atomic syntactic unit, either an identifier, number, or parenthesized sub-expression.',
    };

    const next = peek();
    if (next && next.value === '(') {
      const lparen = consume('(');
      const lNode: TreeNode = {
        id: `node-${++nodeCounter}`,
        label: lparen.value,
        type: 'terminal',
        depth: 0,
        x: 0,
        y: 0,
        children: [],
        stepIndex: currentStep++,
        explanation: 'Terminal: Left parenthesis grouping',
      };

      const eChild = parseE();

      let rNode: TreeNode;
      if (peek() && peek()?.value === ')') {
        const rparen = consume(')');
        rNode = {
          id: `node-${++nodeCounter}`,
          label: rparen.value,
          type: 'terminal',
          depth: 0,
          x: 0,
          y: 0,
          children: [],
          stepIndex: currentStep++,
          explanation: 'Terminal: Right parenthesis closing',
        };
      } else {
        rNode = {
          id: `node-${++nodeCounter}`,
          label: ')',
          type: 'terminal',
          depth: 0,
          x: 0,
          y: 0,
          children: [],
          stepIndex: currentStep++,
          explanation: 'Terminal: Implicit right parenthesis',
        };
      }

      fNode.ruleApplied = 'F -> ( E )';
      fNode.children = [lNode, eChild, rNode];
    } else {
      const valToken = consume();
      const leafNode: TreeNode = {
        id: `node-${++nodeCounter}`,
        label: valToken ? valToken.value : 'id',
        type: valToken?.type === 'num' ? 'number' : 'identifier',
        depth: 0,
        x: 0,
        y: 0,
        children: [],
        stepIndex: currentStep++,
        explanation: `Terminal: Atomic token "${valToken ? valToken.value : 'id'}"`,
      };
      fNode.ruleApplied = `F -> ${leafNode.label}`;
      fNode.children = [leafNode];
    }

    return fNode;
  }

  // Parse T -> T * F | T / F | F
  function parseT(): TreeNode {
    let leftF = parseF();
    let currentTNode: TreeNode = {
      id: `node-${++nodeCounter}`,
      label: 'T',
      type: 'non-terminal',
      depth: 0,
      x: 0,
      y: 0,
      children: [leftF],
      stepIndex: currentStep++,
      ruleApplied: 'T -> F',
      explanation: 'Term (T): Handles higher precedence multiplication and division operations.',
    };

    while (peek() && (peek()?.value === '*' || peek()?.value === '/')) {
      const opToken = consume();
      const opNode: TreeNode = {
        id: `node-${++nodeCounter}`,
        label: opToken.value,
        type: 'operator',
        depth: 0,
        x: 0,
        y: 0,
        children: [],
        stepIndex: currentStep++,
        explanation: `Terminal: Multiplication/division operator "${opToken.value}"`,
      };

      const rightF = parseF();

      const newTNode: TreeNode = {
        id: `node-${++nodeCounter}`,
        label: 'T',
        type: 'non-terminal',
        depth: 0,
        x: 0,
        y: 0,
        children: [currentTNode, opNode, rightF],
        stepIndex: currentStep++,
        ruleApplied: `T -> T ${opToken.value} F`,
        explanation: `Multiplicative term derivation grouping "${opToken.value}" with tighter binding precedence than addition.`,
      };

      currentTNode = newTNode;
    }

    return currentTNode;
  }

  // Parse E -> E + T | E - T | T
  function parseE(): TreeNode {
    let leftT = parseT();
    let currentENode: TreeNode = {
      id: `node-${++nodeCounter}`,
      label: 'E',
      type: 'root',
      depth: 0,
      x: 0,
      y: 0,
      children: [leftT],
      stepIndex: currentStep++,
      ruleApplied: 'E -> T',
      explanation: 'Expression (E): Top-level expression node.',
    };

    while (peek() && (peek()?.value === '+' || peek()?.value === '-')) {
      const opToken = consume();
      const opNode: TreeNode = {
        id: `node-${++nodeCounter}`,
        label: opToken.value,
        type: 'operator',
        depth: 0,
        x: 0,
        y: 0,
        children: [],
        stepIndex: currentStep++,
        explanation: `Terminal: Additive operator "${opToken.value}"`,
      };

      const rightT = parseT();

      const newENode: TreeNode = {
        id: `node-${++nodeCounter}`,
        label: 'E',
        type: 'root',
        depth: 0,
        x: 0,
        y: 0,
        children: [currentENode, opNode, rightT],
        stepIndex: currentStep++,
        ruleApplied: `E -> E ${opToken.value} T`,
        explanation: `Additive expression node grouping left term with right term across "${opToken.value}".`,
      };

      currentENode = newENode;
    }

    return currentENode;
  }

  const root = parseE();
  return layoutTree(root, currentStep);
}

// Generate Abstract Syntax Tree (AST) - compact operator-centric representation
export function generateAST(exprStr: string): TreeLayoutResult {
  const tokens = tokenizeExpression(exprStr || 'id + id * id');
  let tokenIdx = 0;
  let nodeCounter = 0;
  let currentStep = 0;

  function peek(): ExprToken | undefined {
    return tokens[tokenIdx];
  }

  function consume(expected?: string): ExprToken {
    const t = tokens[tokenIdx];
    tokenIdx++;
    return t || { type: 'id', value: '?' };
  }

  function parsePrimary(): TreeNode {
    const next = peek();
    if (next && next.value === '(') {
      consume('(');
      const e = parseAdditive();
      if (peek() && peek()?.value === ')') consume(')');
      return e;
    }

    const t = consume();
    return {
      id: `ast-${++nodeCounter}`,
      label: t ? t.value : 'id',
      type: t?.type === 'num' ? 'number' : 'identifier',
      depth: 0,
      x: 0,
      y: 0,
      children: [],
      stepIndex: currentStep++,
      explanation: `AST Leaf: Operand value "${t ? t.value : 'id'}"`,
    };
  }

  function parseMultiplicative(): TreeNode {
    let left = parsePrimary();
    while (peek() && (peek()?.value === '*' || peek()?.value === '/')) {
      const op = consume();
      const right = parsePrimary();
      left = {
        id: `ast-${++nodeCounter}`,
        label: op.value,
        type: 'operator',
        depth: 0,
        x: 0,
        y: 0,
        children: [left, right],
        stepIndex: currentStep++,
        ruleApplied: `BinaryOp(${op.value})`,
        explanation: `AST Node: Multiplicative operator "${op.value}" applied to left and right operands.`,
      };
    }
    return left;
  }

  function parseAdditive(): TreeNode {
    let left = parseMultiplicative();
    while (peek() && (peek()?.value === '+' || peek()?.value === '-')) {
      const op = consume();
      const right = parseMultiplicative();
      left = {
        id: `ast-${++nodeCounter}`,
        label: op.value,
        type: 'operator',
        depth: 0,
        x: 0,
        y: 0,
        children: [left, right],
        stepIndex: currentStep++,
        ruleApplied: `BinaryOp(${op.value})`,
        explanation: `AST Node: Additive operator "${op.value}" applied to left and right subtrees.`,
      };
    }
    return left;
  }

  const root = parseAdditive();
  return layoutTree(root, currentStep);
}

// Compute 2D coordinates for interactive SVG rendering
function layoutTree(root: TreeNode, totalSteps: number): TreeLayoutResult {
  const allNodes: TreeNode[] = [];
  const edges: TreeLayoutResult['edges'] = [];

  // 1. Assign depths
  function assignDepths(node: TreeNode, depth: number) {
    node.depth = depth;
    for (const ch of node.children) {
      assignDepths(ch, depth + 1);
    }
  }
  assignDepths(root, 0);

  // 2. Leaf-based X positioning
  let leafCount = 0;
  const leafSpacing = 80;
  const levelHeight = 90;

  function positionX(node: TreeNode): number {
    if (node.children.length === 0) {
      node.x = leafCount * leafSpacing + 60;
      leafCount++;
      return node.x;
    }

    let sum = 0;
    for (const ch of node.children) {
      sum += positionX(ch);
    }
    node.x = sum / node.children.length;
    return node.x;
  }

  positionX(root);

  // 3. Assign Y based on depth
  function assignY(node: TreeNode) {
    node.y = node.depth * levelHeight + 60;
    allNodes.push(node);

    for (const ch of node.children) {
      assignY(ch);
      edges.push({
        from: node.id,
        to: ch.id,
        fromPos: [node.x, node.y],
        toPos: [ch.x, ch.y],
      });
    }
  }

  assignY(root);

  const maxX = Math.max(...allNodes.map(n => n.x), 400);
  const maxY = Math.max(...allNodes.map(n => n.y), 300);

  return {
    root,
    allNodes,
    edges,
    width: maxX + 100,
    height: maxY + 100,
    totalSteps,
  };
}

/**
 * NeuroSync Phase 0 - Knowledge Base
 *
 * Definitions, examples, and analogies for common technical terms
 */

const KnowledgeBase = {
  // React & Frontend
  'useState': {
    definition: 'A React Hook that lets you add state to function components.',
    example: 'const [count, setCount] = useState(0)',
    analogy: 'Think of it like a variable with a memory - it remembers its value between renders.',
    category: 'React',
    relatedTerms: ['useEffect', 'hooks', 'state']
  },

  'useEffect': {
    definition: 'A React Hook that runs code after your component renders.',
    example: 'useEffect(() => { document.title = `Count: ${count}` }, [count])',
    analogy: 'Like componentDidMount and componentDidUpdate combined - runs after the DOM updates.',
    category: 'React',
    relatedTerms: ['useState', 'hooks', 'lifecycle']
  },

  'hooks': {
    definition: 'Functions that let you use React features in function components.',
    example: 'useState, useEffect, useContext, useReducer are all hooks',
    analogy: 'Like plugins that add superpowers to your function components.',
    category: 'React',
    relatedTerms: ['useState', 'useEffect']
  },

  'props': {
    definition: 'Short for properties - data passed from parent to child components.',
    example: '<Button color="blue" onClick={handleClick} />',
    analogy: 'Like function arguments, but for components.',
    category: 'React',
    relatedTerms: ['state', 'component']
  },

  'component': {
    definition: 'A reusable piece of UI in React.',
    example: 'function Button({ text }) { return <button>{text}</button> }',
    analogy: 'Like a LEGO block - you build complex UIs by combining simple components.',
    category: 'React',
    relatedTerms: ['props', 'JSX']
  },

  // JavaScript
  'async': {
    definition: 'Marks a function as asynchronous, allowing use of await inside it.',
    example: 'async function fetchData() { const response = await fetch(url) }',
    analogy: 'Like saying "this function might take a while, so don\'t block everything else."',
    category: 'JavaScript',
    relatedTerms: ['await', 'Promise']
  },

  'await': {
    definition: 'Pauses execution until a Promise resolves, making async code read like sync code.',
    example: 'const data = await fetchData()',
    analogy: 'Like hitting pause until a task finishes, then continuing.',
    category: 'JavaScript',
    relatedTerms: ['async', 'Promise']
  },

  'Promise': {
    definition: 'An object representing a value that will be available in the future.',
    example: 'new Promise((resolve, reject) => { setTimeout(() => resolve("done"), 1000) })',
    analogy: 'Like an IOU - it promises to give you a value eventually.',
    category: 'JavaScript',
    relatedTerms: ['async', 'await']
  },

  'closure': {
    definition: 'A function that remembers variables from its outer scope.',
    example: 'function outer() { let x = 1; return function() { return x++ } }',
    analogy: 'Like a backpack - the inner function carries variables from the outer function.',
    category: 'JavaScript',
    relatedTerms: ['scope', 'function']
  },

  'callback': {
    definition: 'A function passed as an argument to another function.',
    example: 'setTimeout(() => console.log("done"), 1000)',
    analogy: 'Like leaving your phone number so someone can call you back later.',
    category: 'JavaScript',
    relatedTerms: ['Promise', 'async']
  },

  // Python
  'decorator': {
    definition: 'A function that wraps another function to modify its behavior.',
    example: '@app.route("/") \\ndef home(): return "Hello"',
    analogy: 'Like wrapping a gift - the decorator adds something to the function without changing what\'s inside.',
    category: 'Python',
    relatedTerms: ['function', 'wrapper']
  },

  'generator': {
    definition: 'A function that returns an iterator using yield.',
    example: 'def count(): \\n  i = 0\\n  while True: yield i; i += 1',
    analogy: 'Like a vending machine - gives you one item at a time when you ask for it.',
    category: 'Python',
    relatedTerms: ['yield', 'iterator']
  },

  'comprehension': {
    definition: 'A concise way to create lists, dicts, or sets.',
    example: '[x**2 for x in range(10) if x % 2 == 0]',
    analogy: 'Like a for-loop compressed into one line.',
    category: 'Python',
    relatedTerms: ['list', 'loop']
  },

  // Backend/API
  'REST': {
    definition: 'REpresentational State Transfer - an architectural style for APIs.',
    example: 'GET /users/123, POST /users, DELETE /users/123',
    analogy: 'Like standardized commands for talking to a server: GET (read), POST (create), PUT (update), DELETE (remove).',
    category: 'Backend',
    relatedTerms: ['API', 'HTTP']
  },

  'API': {
    definition: 'Application Programming Interface - a way for programs to talk to each other.',
    example: 'fetch("https://api.example.com/users")',
    analogy: 'Like a menu at a restaurant - it tells you what you can order (request) and what you\'ll get back (response).',
    category: 'Backend',
    relatedTerms: ['REST', 'endpoint']
  },

  'endpoint': {
    definition: 'A specific URL where an API can be accessed.',
    example: '/api/users - GET endpoint to retrieve users',
    analogy: 'Like a specific phone extension - each one does something different.',
    category: 'Backend',
    relatedTerms: ['API', 'REST']
  },

  'middleware': {
    definition: 'Functions that run between receiving a request and sending a response.',
    example: 'app.use((req, res, next) => { console.log(req.url); next() })',
    analogy: 'Like security checkpoints at an airport - every request goes through them.',
    category: 'Backend',
    relatedTerms: ['express', 'server']
  },

  // Database
  'schema': {
    definition: 'The structure/blueprint of a database table.',
    example: 'User table: id (int), name (string), email (string)',
    analogy: 'Like a template or form - defines what data can be stored and in what format.',
    category: 'Database',
    relatedTerms: ['database', 'model']
  },

  'migration': {
    definition: 'A script that changes the database structure.',
    example: 'Add "age" column to users table',
    analogy: 'Like remodeling a house - changes the structure without destroying the contents.',
    category: 'Database',
    relatedTerms: ['schema', 'database']
  },

  'query': {
    definition: 'A request to retrieve or modify data in a database.',
    example: 'SELECT * FROM users WHERE age > 18',
    analogy: 'Like asking a librarian to find specific books for you.',
    category: 'Database',
    relatedTerms: ['SQL', 'database']
  },

  'index': {
    definition: 'A data structure that speeds up database queries.',
    example: 'CREATE INDEX idx_email ON users(email)',
    analogy: 'Like the index at the back of a book - helps you find things quickly.',
    category: 'Database',
    relatedTerms: ['query', 'database']
  },

  // Git
  'commit': {
    definition: 'A snapshot of your code at a specific point in time.',
    example: 'git commit -m "Add login feature"',
    analogy: 'Like taking a save-point in a video game - you can always go back to it.',
    category: 'Git',
    relatedTerms: ['branch', 'merge']
  },

  'branch': {
    definition: 'A parallel version of your code.',
    example: 'git checkout -b feature-login',
    analogy: 'Like a parallel universe - you can experiment without affecting the main timeline.',
    category: 'Git',
    relatedTerms: ['commit', 'merge']
  },

  'merge': {
    definition: 'Combining changes from one branch into another.',
    example: 'git merge feature-login',
    analogy: 'Like zipping two roads together into one.',
    category: 'Git',
    relatedTerms: ['branch', 'conflict']
  },

  'rebase': {
    definition: 'Moving commits from one base to another, rewriting history.',
    example: 'git rebase main',
    analogy: 'Like editing a movie - rearranging scenes to tell a cleaner story.',
    category: 'Git',
    relatedTerms: ['merge', 'commit']
  },

  // DevOps
  'container': {
    definition: 'A lightweight, standalone package that includes everything needed to run software.',
    example: 'Docker container with Node.js + your app',
    analogy: 'Like a shipping container - everything inside works the same way no matter where you move it.',
    category: 'DevOps',
    relatedTerms: ['Docker', 'image']
  },

  'Docker': {
    definition: 'A platform for building, shipping, and running applications in containers.',
    example: 'docker run -p 3000:3000 myapp',
    analogy: 'Like a factory for shipping containers - standardizes how apps are packaged and deployed.',
    category: 'DevOps',
    relatedTerms: ['container', 'image']
  },

  'CI/CD': {
    definition: 'Continuous Integration/Continuous Deployment - automated testing and deployment.',
    example: 'GitHub Actions runs tests on every commit',
    analogy: 'Like an assembly line - code goes in one end, tested product comes out the other.',
    category: 'DevOps',
    relatedTerms: ['pipeline', 'deployment']
  },

  // General CS
  'algorithm': {
    definition: 'A step-by-step procedure for solving a problem.',
    example: 'Binary search: divide array in half repeatedly',
    analogy: 'Like a recipe - precise instructions to get from ingredients to finished dish.',
    category: 'Computer Science',
    relatedTerms: ['data structure', 'complexity']
  },

  'recursion': {
    definition: 'A function that calls itself.',
    example: 'function factorial(n) { return n <= 1 ? 1 : n * factorial(n-1) }',
    analogy: 'Like looking in a mirror that reflects another mirror - keeps going until it stops.',
    category: 'Computer Science',
    relatedTerms: ['function', 'base case']
  },

  'cache': {
    definition: 'Temporary storage for frequently accessed data.',
    example: 'Store API responses in Redis for 5 minutes',
    analogy: 'Like keeping your most-used tools on your desk instead of in the garage.',
    category: 'Computer Science',
    relatedTerms: ['memory', 'performance']
  },

  'hash': {
    definition: 'A function that converts data into a fixed-size value.',
    example: 'MD5("hello") → 5d41402abc4b2a76b9719d911017c592',
    analogy: 'Like a fingerprint - unique identifier for data.',
    category: 'Computer Science',
    relatedTerms: ['encryption', 'algorithm']
  }
};

/**
 * Get definition for a term
 */
function getDefinition(term) {
  const normalizedTerm = term.toLowerCase();
  return KnowledgeBase[normalizedTerm] || null;
}

/**
 * Search for terms by category
 */
function getTermsByCategory(category) {
  return Object.entries(KnowledgeBase)
    .filter(([_, data]) => data.category === category)
    .map(([term, _]) => term);
}

/**
 * Find related terms
 */
function getRelatedTerms(term) {
  const def = getDefinition(term);
  return def ? def.relatedTerms : [];
}

/**
 * Format definition for display
 */
function formatDefinition(term) {
  const def = getDefinition(term);
  if (!def) return null;

  return {
    term: term,
    definition: def.definition,
    example: def.example,
    analogy: def.analogy,
    category: def.category,
    relatedTerms: def.relatedTerms
  };
}

// Export for use in predictor
window.knowledgeBase = {
  getDefinition,
  getTermsByCategory,
  getRelatedTerms,
  formatDefinition,
  allTerms: Object.keys(KnowledgeBase)
};

console.log('[NeuroSync] Knowledge base loaded with', Object.keys(KnowledgeBase).length, 'terms');

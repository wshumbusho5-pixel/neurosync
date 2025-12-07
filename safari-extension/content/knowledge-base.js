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
  },

  // Database
  'sql': {
    definition: 'Structured Query Language - a language for managing relational databases.',
    example: 'SELECT * FROM users WHERE age > 18',
    analogy: 'Like asking a librarian for specific books using a structured request format.',
    category: 'Database',
    relatedTerms: ['database', 'query', 'nosql']
  },

  'nosql': {
    definition: 'Non-relational databases that store data in flexible formats (documents, key-value, graphs).',
    example: 'MongoDB stores data as JSON-like documents',
    analogy: 'Like storing files in folders vs. organizing everything in spreadsheet tables.',
    category: 'Database',
    relatedTerms: ['sql', 'mongodb', 'database']
  },

  'orm': {
    definition: 'Object-Relational Mapping - converts between database tables and code objects.',
    example: 'user = User.objects.get(id=1) # Instead of writing SQL',
    analogy: 'Like a translator that converts between two languages automatically.',
    category: 'Database',
    relatedTerms: ['sql', 'model', 'database']
  },

  'migration': {
    definition: 'A way to version control database schema changes.',
    example: 'python manage.py migrate # Apply database changes',
    analogy: 'Like Git commits, but for your database structure.',
    category: 'Database',
    relatedTerms: ['database', 'schema', 'version control']
  },

  'index': {
    definition: 'A database structure that speeds up data retrieval.',
    example: 'CREATE INDEX idx_email ON users(email)',
    analogy: 'Like the index in a book - helps you find information quickly without reading everything.',
    category: 'Database',
    relatedTerms: ['sql', 'performance', 'query']
  },

  'transaction': {
    definition: 'A sequence of database operations that either all succeed or all fail together.',
    example: 'BEGIN; UPDATE accounts SET balance = balance - 100; COMMIT;',
    analogy: 'Like an ATM withdrawal - either the full transaction completes or nothing happens.',
    category: 'Database',
    relatedTerms: ['database', 'acid', 'rollback']
  },

  // Git & Version Control
  'commit': {
    definition: 'A snapshot of your code changes with a message describing what changed.',
    example: 'git commit -m "Add user authentication"',
    analogy: 'Like saving a checkpoint in a video game - you can return to this exact state later.',
    category: 'Git',
    relatedTerms: ['git', 'branch', 'push']
  },

  'branch': {
    definition: 'A parallel version of your code where you can make changes independently.',
    example: 'git checkout -b feature/new-login',
    analogy: 'Like a parallel universe where you experiment without affecting the main timeline.',
    category: 'Git',
    relatedTerms: ['commit', 'merge', 'checkout']
  },

  'merge': {
    definition: 'Combining changes from one branch into another.',
    example: 'git merge feature/new-login',
    analogy: 'Like combining two edited versions of a document into one final version.',
    category: 'Git',
    relatedTerms: ['branch', 'conflict', 'rebase']
  },

  'rebase': {
    definition: 'Moving or combining commits to a new base, rewriting commit history.',
    example: 'git rebase main',
    analogy: 'Like rewriting a story to start from a different point, keeping the same events.',
    category: 'Git',
    relatedTerms: ['merge', 'commit', 'branch']
  },

  'pull request': {
    definition: 'A request to merge your code changes into another branch, with review.',
    example: 'Create PR: feature/login → main',
    analogy: 'Like submitting an essay for review before it gets published.',
    category: 'Git',
    relatedTerms: ['merge', 'branch', 'review']
  },

  'clone': {
    definition: 'Creating a local copy of a remote repository.',
    example: 'git clone https://github.com/user/repo.git',
    analogy: 'Like downloading a complete copy of a project to your computer.',
    category: 'Git',
    relatedTerms: ['repository', 'remote', 'fetch']
  },

  // Backend & API
  'api': {
    definition: 'Application Programming Interface - a way for programs to communicate.',
    example: 'fetch("https://api.example.com/users")',
    analogy: 'Like a menu at a restaurant - shows what you can order and how to ask for it.',
    category: 'Backend/API',
    relatedTerms: ['rest', 'endpoint', 'json']
  },

  'rest': {
    definition: 'RESTful API - uses HTTP methods (GET, POST, PUT, DELETE) to interact with resources.',
    example: 'GET /users/123, POST /users, DELETE /users/123',
    analogy: 'Like CRUD operations on files: read, create, update, delete.',
    category: 'Backend/API',
    relatedTerms: ['api', 'http', 'endpoint']
  },

  'endpoint': {
    definition: 'A specific URL path where an API can be accessed.',
    example: '/api/v1/users - endpoint for user data',
    analogy: 'Like different windows at a post office - each one handles specific requests.',
    category: 'Backend/API',
    relatedTerms: ['api', 'rest', 'route']
  },

  'json': {
    definition: 'JavaScript Object Notation - a lightweight data format for exchanging information.',
    example: '{"name": "John", "age": 30, "city": "Seattle"}',
    analogy: 'Like a standardized form that both humans and computers can easily read.',
    category: 'Backend/API',
    relatedTerms: ['api', 'object', 'serialization']
  },

  'authentication': {
    definition: 'Verifying the identity of a user or system.',
    example: 'Login with username/password, or OAuth token',
    analogy: 'Like showing your ID at airport security - proving you are who you say you are.',
    category: 'Backend/API',
    relatedTerms: ['authorization', 'jwt', 'session']
  },

  'authorization': {
    definition: 'Determining what an authenticated user is allowed to do.',
    example: 'Admin can delete users, regular users cannot',
    analogy: 'Like having a ticket to a concert (authentication) vs. having VIP access (authorization).',
    category: 'Backend/API',
    relatedTerms: ['authentication', 'permissions', 'role']
  },

  'middleware': {
    definition: 'Software that sits between requests and responses, processing or modifying them.',
    example: 'app.use(authMiddleware) - runs before route handlers',
    analogy: 'Like security checkpoints between different parts of an airport.',
    category: 'Backend/API',
    relatedTerms: ['express', 'api', 'server']
  },

  // DevOps
  'docker': {
    definition: 'A platform for packaging applications with their dependencies into containers.',
    example: 'docker run -p 8080:80 nginx',
    analogy: 'Like shipping containers - your app runs the same way everywhere.',
    category: 'DevOps',
    relatedTerms: ['container', 'deployment', 'image']
  },

  'container': {
    definition: 'A lightweight, isolated environment that packages code and dependencies together.',
    example: 'Docker container running Node.js app',
    analogy: 'Like a sealed lunchbox - everything you need is inside and isolated from the outside.',
    category: 'DevOps',
    relatedTerms: ['docker', 'kubernetes', 'image']
  },

  'ci/cd': {
    definition: 'Continuous Integration/Continuous Deployment - automated testing and deployment pipeline.',
    example: 'Push code → Tests run → Auto-deploy if tests pass',
    analogy: 'Like an assembly line that automatically checks and ships products.',
    category: 'DevOps',
    relatedTerms: ['pipeline', 'deployment', 'automation']
  },

  'environment': {
    definition: 'A separate instance of your application (development, staging, production).',
    example: 'NODE_ENV=production or NODE_ENV=development',
    analogy: 'Like rehearsal vs. opening night - same show, different settings.',
    category: 'DevOps',
    relatedTerms: ['deployment', 'config', 'production']
  },

  'deployment': {
    definition: 'The process of releasing code to a server where users can access it.',
    example: 'git push heroku main - deploy to Heroku',
    analogy: 'Like publishing a book - moving it from your desk to bookstores.',
    category: 'DevOps',
    relatedTerms: ['ci/cd', 'production', 'release']
  },

  // Additional React terms
  'jsx': {
    definition: 'JavaScript XML - syntax extension that lets you write HTML-like code in JavaScript.',
    example: 'const element = <h1>Hello, {name}!</h1>',
    analogy: 'Like writing HTML directly in your JavaScript, with superpowers.',
    category: 'React',
    relatedTerms: ['component', 'react', 'html']
  },

  'virtual dom': {
    definition: 'A lightweight copy of the real DOM that React uses to optimize updates.',
    example: 'React compares virtual DOM to real DOM and only updates what changed',
    analogy: 'Like sketching changes on paper before repainting a wall - more efficient.',
    category: 'React',
    relatedTerms: ['react', 'component', 'rendering']
  },

  // Additional JavaScript terms
  'event loop': {
    definition: 'JavaScript\'s mechanism for handling asynchronous operations without blocking.',
    example: 'setTimeout runs after synchronous code, even with 0ms delay',
    analogy: 'Like a chef who starts cooking multiple dishes and checks each one when ready.',
    category: 'JavaScript',
    relatedTerms: ['async', 'callback', 'promise']
  },

  // Additional Python terms
  'list comprehension': {
    definition: 'A concise way to create lists using a single line of code.',
    example: 'squares = [x**2 for x in range(10)]',
    analogy: 'Like a production line - applying the same operation to many items at once.',
    category: 'Python',
    relatedTerms: ['list', 'generator', 'lambda']
  },

  // Additional Database terms
  'schema': {
    definition: 'The structure and organization of a database - table definitions, relationships, constraints.',
    example: 'users table: id (int), email (varchar), created_at (timestamp)',
    analogy: 'Like a blueprint for a house - defines what rooms exist and how they connect.',
    category: 'Database',
    relatedTerms: ['migration', 'table', 'database']
  },

  // Additional Backend terms
  'webhook': {
    definition: 'A way for an app to send real-time data to other apps when an event happens.',
    example: 'Stripe sends webhook when payment succeeds',
    analogy: 'Like a doorbell - the server rings your app when something important happens.',
    category: 'Backend/API',
    relatedTerms: ['api', 'callback', 'event']
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

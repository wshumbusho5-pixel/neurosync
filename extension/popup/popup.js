/**
 * NeuroSync Popup Script
 * Handles user preferences and statistics display
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Setup tab navigation
  setupTabs();

  // Load current settings and stats
  await loadSettings();
  await loadStats();
  await loadUsageStats();

  // Setup event listeners
  document.getElementById('toggle-btn').addEventListener('click', toggleGlobalEnabled);
  document.getElementById('clear-btn').addEventListener('click', clearData);

  // Upgrade button
  const upgradeBtn = document.getElementById('upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', handleUpgrade);
  }

  // Pattern toggles
  document.getElementById('pattern-confusion').addEventListener('change', savePatternSettings);
  document.getElementById('pattern-search').addEventListener('change', savePatternSettings);
  document.getElementById('pattern-context').addEventListener('change', savePatternSettings);

  // Sensitivity sliders
  document.getElementById('confidence-threshold').addEventListener('input', updateThresholdDisplay);
  document.getElementById('confidence-threshold').addEventListener('change', saveSensitivitySettings);
  document.getElementById('prediction-cooldown').addEventListener('input', updateCooldownDisplay);
  document.getElementById('prediction-cooldown').addEventListener('change', saveSensitivitySettings);
});

/**
 * Setup tab navigation
 */
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show corresponding content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetTab) {
          content.classList.add('active');
        }
      });
    });
  });
}

/**
 * Load settings from storage
 */
async function loadSettings() {
  const result = await chrome.storage.local.get('settings');
  const settings = result.settings || getDefaultSettings();

  // Pattern toggles
  document.getElementById('pattern-confusion').checked = settings.patterns.confusion;
  document.getElementById('pattern-search').checked = settings.patterns.searchIntent;
  document.getElementById('pattern-context').checked = settings.patterns.contextLoss;

  // Sensitivity sliders
  document.getElementById('confidence-threshold').value = settings.confidenceThreshold * 100;
  document.getElementById('prediction-cooldown').value = settings.predictionCooldown / 1000;

  updateThresholdDisplay();
  updateCooldownDisplay();
}

/**
 * Default settings
 */
function getDefaultSettings() {
  return {
    enabled: true,
    patterns: {
      confusion: true,
      searchIntent: true,
      contextLoss: true
    },
    confidenceThreshold: 0.70,
    predictionCooldown: 30000 // 30 seconds in milliseconds
  };
}

/**
 * Load statistics
 */
async function loadStats() {
  const result = await chrome.storage.local.get(['predictions', 'feedback', 'settings']);

  const predictions = result.predictions || [];
  const feedback = result.feedback || [];
  const settings = result.settings || getDefaultSettings();

  // Calculate stats
  const totalPredictions = predictions.length;
  const helpfulCount = feedback.filter(f => f.helpful).length;
  const accuracy = totalPredictions > 0
    ? Math.round((helpfulCount / totalPredictions) * 100)
    : 0;

  // Update UI
  document.getElementById('total-predictions').textContent = totalPredictions;
  document.getElementById('helpful-count').textContent = helpfulCount;
  document.getElementById('accuracy').textContent = `${accuracy}%`;
  document.getElementById('status').textContent = settings.enabled ? 'Enabled' : 'Disabled';
  document.getElementById('status').style.color = settings.enabled ? '#34c759' : '#86868b';

  // Update toggle button
  const btn = document.getElementById('toggle-btn');
  btn.textContent = settings.enabled ? 'Disable' : 'Enable';
  btn.className = settings.enabled ? 'btn-primary' : 'btn-secondary';
}

/**
 * Load usage statistics (freemium)
 */
async function loadUsageStats() {
  try {
    // Get subscription status
    const subscription = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'get_subscription' }, resolve);
    });

    // Get today's usage
    const todayUsage = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'get_today_usage' }, resolve);
    });

    // Update plan tier
    const planTier = document.getElementById('plan-tier');
    if (subscription.isPro) {
      planTier.textContent = '✨ Pro';
      planTier.style.color = '#667eea';
      planTier.style.fontWeight = '600';

      // Hide usage limits for Pro users
      document.getElementById('usage-row').style.display = 'none';
      document.getElementById('reset-row').style.display = 'none';
      document.getElementById('upgrade-cta').style.display = 'none';
    } else {
      planTier.textContent = 'Free';
      planTier.style.color = '#86868b';

      // Show usage for Free users
      const usageText = `${todayUsage.predictionsToday} / 20`;
      document.getElementById('usage-today').textContent = usageText;

      // Calculate time until reset
      const resetTime = calculateTimeUntilReset(todayUsage.resetsAt);
      document.getElementById('reset-time').textContent = resetTime;

      // Show upgrade CTA if approaching or at limit
      if (todayUsage.predictionsToday >= 15) {
        document.getElementById('upgrade-cta').style.display = 'block';
      }
    }
  } catch (error) {
    console.error('[NeuroSync] Error loading usage stats:', error);
  }
}

/**
 * Calculate human-readable time until reset
 */
function calculateTimeUntilReset(resetsAt) {
  const now = Date.now();
  const msUntilReset = resetsAt - now;

  if (msUntilReset <= 0) {
    return 'Now';
  }

  const hours = Math.floor(msUntilReset / (1000 * 60 * 60));
  const minutes = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Handle upgrade to Pro
 */
function handleUpgrade() {
  // TODO: Integrate with Stripe
  alert('NeuroSync Pro upgrade coming soon! Stripe integration in progress.');

  // TODO: Open Stripe checkout
  // chrome.runtime.sendMessage({ type: 'start_checkout' });
}

/**
 * Toggle global enabled/disabled
 */
async function toggleGlobalEnabled() {
  const result = await chrome.storage.local.get('settings');
  const settings = result.settings || getDefaultSettings();

  settings.enabled = !settings.enabled;

  await chrome.storage.local.set({ settings });
  await loadStats();

  // Notify content scripts of settings change
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'settings_updated',
      settings
    }).catch(() => {
      // Tab might not have content script loaded
    });
  }
}

/**
 * Save pattern settings
 */
async function savePatternSettings() {
  const result = await chrome.storage.local.get('settings');
  const settings = result.settings || getDefaultSettings();

  settings.patterns = {
    confusion: document.getElementById('pattern-confusion').checked,
    searchIntent: document.getElementById('pattern-search').checked,
    contextLoss: document.getElementById('pattern-context').checked
  };

  await chrome.storage.local.set({ settings });

  // Notify content scripts
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'settings_updated',
      settings
    }).catch(() => {});
  }
}

/**
 * Save sensitivity settings
 */
async function saveSensitivitySettings() {
  const result = await chrome.storage.local.get('settings');
  const settings = result.settings || getDefaultSettings();

  settings.confidenceThreshold = parseFloat(document.getElementById('confidence-threshold').value) / 100;
  settings.predictionCooldown = parseInt(document.getElementById('prediction-cooldown').value) * 1000;

  await chrome.storage.local.set({ settings });

  // Notify content scripts
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'settings_updated',
      settings
    }).catch(() => {});
  }
}

/**
 * Update threshold display
 */
function updateThresholdDisplay() {
  const value = document.getElementById('confidence-threshold').value;
  document.getElementById('threshold-value').textContent = `${value}%`;
}

/**
 * Update cooldown display
 */
function updateCooldownDisplay() {
  const value = document.getElementById('prediction-cooldown').value;
  document.getElementById('cooldown-value').textContent = `${value}s`;
}

/**
 * Clear all data
 */
async function clearData() {
  if (confirm('Clear all prediction data and feedback? This cannot be undone.')) {
    await chrome.storage.local.set({
      predictions: [],
      feedback: []
    });

    await loadStats();
    showNotification('Data cleared successfully!');
  }
}

/**
 * Show notification
 */
function showNotification(message) {
  // Create temporary notification
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #34c759;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    z-index: 10000;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 2000);
}

/**
 * Glossary Functions
 */

// Initialize glossary when glossary tab is opened
document.addEventListener('DOMContentLoaded', () => {
  // Listen for glossary tab activation
  const glossaryTab = document.querySelector('[data-tab="glossary"]');
  if (glossaryTab) {
    glossaryTab.addEventListener('click', () => {
      setTimeout(() => initializeGlossary(), 100);
    });
  }
});

let allTerms = {};
let initialized = false;

async function initializeGlossary() {
  if (initialized) return;
  initialized = true;

  // Load knowledge base (we'll inline a copy here for the popup)
  allTerms = getKnowledgeBase();

  // Setup search
  const searchInput = document.getElementById('term-search');
  const backButton = document.getElementById('back-to-search');

  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('focus', () => {
      if (!searchInput.value) {
        showAllTerms();
      }
    });
  }

  if (backButton) {
    backButton.addEventListener('click', backToSearch);
  }

  // Load categories
  loadCategories();

  // Show all terms initially
  showAllTerms();
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();

  if (!query) {
    showAllTerms();
    return;
  }

  const results = Object.entries(allTerms).filter(([term, data]) => {
    return term.toLowerCase().includes(query) ||
           data.definition.toLowerCase().includes(query) ||
           data.category.toLowerCase().includes(query);
  });

  displaySearchResults(results);
}

function showAllTerms() {
  const allResults = Object.entries(allTerms);
  displaySearchResults(allResults);
}

function displaySearchResults(results) {
  const container = document.getElementById('search-results');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = '<div class="no-results">No terms found</div>';
    return;
  }

  container.innerHTML = results
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([term, data]) => `
      <div class="search-result-item" data-term="${term}">
        <div class="search-result-term">${term}</div>
        <div class="search-result-definition">${data.definition.substring(0, 100)}${data.definition.length > 100 ? '...' : ''}</div>
      </div>
    `).join('');

  // Add click handlers
  container.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const term = item.dataset.term;
      showTermDetails(term);
    });
  });
}

function showTermDetails(term) {
  const data = allTerms[term];
  if (!data) return;

  // Hide search and categories
  document.querySelector('.search-container').parentElement.style.display = 'none';
  document.getElementById('browse-categories').style.display = 'none';

  // Show term details
  const detailsContainer = document.getElementById('term-details');
  const displayContainer = document.getElementById('term-display');

  const categoryClass = getCategoryBadgeClass(data.category);

  displayContainer.innerHTML = `
    <div class="term-detail-header">
      <div class="term-detail-title">${term}</div>
      <div class="term-detail-category category-badge ${categoryClass}">${data.category}</div>
    </div>

    <div class="term-detail-content">
      <div class="term-detail-section">
        <div class="term-detail-label">Definition</div>
        <p>${data.definition}</p>
      </div>

      ${data.analogy ? `
        <div class="term-detail-section">
          <div class="term-detail-label">Analogy</div>
          <p>${data.analogy}</p>
        </div>
      ` : ''}

      ${data.example ? `
        <div class="term-detail-section">
          <div class="term-detail-label">Example</div>
          <div class="term-detail-example">${data.example}</div>
        </div>
      ` : ''}

      ${data.relatedTerms && data.relatedTerms.length > 0 ? `
        <div class="term-detail-section">
          <div class="term-detail-label">Related Terms</div>
          <div>
            ${data.relatedTerms.map(rt => `
              <span class="category-badge badge-${getCategoryBadgeClass(data.category)}"
                    style="cursor: pointer; margin: 4px;"
                    onclick="showTermDetails('${rt}')">${rt}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  detailsContainer.style.display = 'block';
}

function backToSearch() {
  document.querySelector('.search-container').parentElement.style.display = 'block';
  document.getElementById('browse-categories').style.display = 'block';
  document.getElementById('term-details').style.display = 'none';
  document.getElementById('term-search').value = '';
  showAllTerms();
}

function loadCategories() {
  const categories = {};

  Object.entries(allTerms).forEach(([term, data]) => {
    if (!categories[data.category]) {
      categories[data.category] = [];
    }
    categories[data.category].push(term);
  });

  const container = document.getElementById('category-list');
  if (!container) return;

  container.innerHTML = Object.entries(categories)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([category, terms]) => {
      const badgeClass = getCategoryBadgeClass(category);
      return `
        <div class="category-item" data-category="${category}">
          <span class="category-name">
            <span class="category-badge ${badgeClass}">${category}</span>
          </span>
          <span class="category-count">${terms.length} terms</span>
        </div>
      `;
    }).join('');

  // Add click handlers
  container.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
      const category = item.dataset.category;
      filterByCategory(category);
    });
  });
}

function filterByCategory(category) {
  const results = Object.entries(allTerms).filter(([_, data]) => data.category === category);
  displaySearchResults(results);
  document.getElementById('term-search').value = '';
  document.getElementById('term-search').focus();
}

function getCategoryBadgeClass(category) {
  const map = {
    'React': 'badge-react',
    'JavaScript': 'badge-js',
    'Python': 'badge-python',
    'Database': 'badge-database',
    'Git': 'badge-git',
    'DevOps': 'badge-devops',
    'Backend/API': 'badge-backend',
    'Computer Science': 'badge-cs'
  };
  return map[category] || 'badge-cs';
}

// Inline knowledge base for popup (simplified version)
function getKnowledgeBase() {
  return {
    'component': {
      definition: 'A reusable piece of UI in React.',
      example: 'function Button({ text }) { return <button>{text}</button> }',
      analogy: 'Like a LEGO block - you build complex UIs by combining simple components.',
      category: 'React',
      relatedTerms: ['props', 'jsx']
    },
    'props': {
      definition: 'Short for properties - data passed from parent to child components.',
      example: '<Button color="blue" onClick={handleClick} />',
      analogy: 'Like function arguments, but for components.',
      category: 'React',
      relatedTerms: ['state', 'component']
    },
    'state': {
      definition: 'Data that changes over time in a component.',
      example: 'const [count, setCount] = useState(0)',
      analogy: 'Like a variable that React watches - when it changes, the component re-renders.',
      category: 'React',
      relatedTerms: ['useState', 'props']
    },
    'hooks': {
      definition: 'Functions that let you use React features in function components.',
      example: 'useState, useEffect, useContext, useReducer are all hooks',
      analogy: 'Like plugins that add superpowers to your function components.',
      category: 'React',
      relatedTerms: ['useState', 'useEffect']
    },
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
      relatedTerms: ['useState', 'hooks']
    },
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
    'closure': {
      definition: 'A function that remembers variables from its outer scope.',
      example: 'function outer() { let x = 1; return function() { return x; } }',
      analogy: 'Like a backpack - the function carries its environment with it.',
      category: 'JavaScript',
      relatedTerms: ['scope', 'function']
    },
    'promise': {
      definition: 'An object representing eventual completion or failure of an async operation.',
      example: 'fetch(url).then(response => response.json()).then(data => console.log(data))',
      analogy: 'Like an IOU - a placeholder for a value that will come later.',
      category: 'JavaScript',
      relatedTerms: ['async', 'await', 'callback']
    },
    'async': {
      definition: 'A keyword that makes a function return a Promise.',
      example: 'async function getData() { return await fetch(url); }',
      analogy: 'Like saying "this will take some time" before you start.',
      category: 'JavaScript',
      relatedTerms: ['await', 'promise']
    },
    'callback': {
      definition: 'A function passed as an argument to another function.',
      example: 'setTimeout(() => console.log("Done!"), 1000)',
      analogy: 'Like leaving your phone number - "call me back when you\'re done".',
      category: 'JavaScript',
      relatedTerms: ['promise', 'async']
    },
    'event loop': {
      definition: 'JavaScript\'s mechanism for handling asynchronous operations without blocking.',
      example: 'setTimeout runs after synchronous code, even with 0ms delay',
      analogy: 'Like a chef who starts cooking multiple dishes and checks each one when ready.',
      category: 'JavaScript',
      relatedTerms: ['async', 'callback', 'promise']
    },
    'arrow function': {
      definition: 'A concise syntax for writing functions in JavaScript.',
      example: 'const add = (a, b) => a + b',
      analogy: 'Like shorthand notation - gets the same result with less writing.',
      category: 'JavaScript',
      relatedTerms: ['function', 'this']
    },
    'decorator': {
      definition: 'A function that modifies or wraps another function in Python.',
      example: '@login_required def view(): ...',
      analogy: 'Like gift wrapping - you add extra functionality around something.',
      category: 'Python',
      relatedTerms: ['function', 'wrapper']
    },
    'generator': {
      definition: 'A function that can pause execution and resume later.',
      example: 'def count(): yield 1; yield 2; yield 3',
      analogy: 'Like a streaming service - delivers one piece at a time instead of all at once.',
      category: 'Python',
      relatedTerms: ['yield', 'iterator']
    },
    'lambda': {
      definition: 'An anonymous inline function in Python.',
      example: 'sorted(items, key=lambda x: x.name)',
      analogy: 'Like a post-it note function - quick and disposable.',
      category: 'Python',
      relatedTerms: ['function', 'map']
    },
    'list comprehension': {
      definition: 'A concise way to create lists using a single line of code.',
      example: 'squares = [x**2 for x in range(10)]',
      analogy: 'Like a production line - applying the same operation to many items at once.',
      category: 'Python',
      relatedTerms: ['list', 'generator', 'lambda']
    },
    'sql': {
      definition: 'Structured Query Language - a language for managing relational databases.',
      example: 'SELECT * FROM users WHERE age > 18',
      analogy: 'Like asking a librarian for specific books using a structured request format.',
      category: 'Database',
      relatedTerms: ['database', 'query', 'nosql']
    },
    'nosql': {
      definition: 'Non-relational databases that store data in flexible formats.',
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
      relatedTerms: ['database', 'schema']
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
    'schema': {
      definition: 'The structure and organization of a database - table definitions, relationships, constraints.',
      example: 'users table: id (int), email (varchar), created_at (timestamp)',
      analogy: 'Like a blueprint for a house - defines what rooms exist and how they connect.',
      category: 'Database',
      relatedTerms: ['migration', 'table', 'database']
    },
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
    'webhook': {
      definition: 'A way for an app to send real-time data to other apps when an event happens.',
      example: 'Stripe sends webhook when payment succeeds',
      analogy: 'Like a doorbell - the server rings your app when something important happens.',
      category: 'Backend/API',
      relatedTerms: ['api', 'callback', 'event']
    },
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
    'recursion': {
      definition: 'A function that calls itself to solve a problem.',
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
    'algorithm': {
      definition: 'A step-by-step procedure for solving a problem or completing a task.',
      example: 'Binary search algorithm finds items in sorted lists',
      analogy: 'Like a recipe - specific steps to achieve a result.',
      category: 'Computer Science',
      relatedTerms: ['data structure', 'complexity']
    }
  };
}

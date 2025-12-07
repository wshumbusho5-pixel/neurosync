/**
 * NeuroSync Knowledge Base Tests
 * Tests the knowledge base functionality without browser
 */

// Load the knowledge base code
const fs = require('fs');
const path = require('path');

// Read and execute knowledge-base.js in a controlled environment
const knowledgeBaseCode = fs.readFileSync(
  path.join(__dirname, '../extension/content/knowledge-base.js'),
  'utf8'
);

// Create a mock window object
global.window = {
  knowledgeBase: null
};

// Execute the knowledge base code
eval(knowledgeBaseCode);

// Test suite
const tests = {
  passed: 0,
  failed: 0,
  results: []
};

function test(name, fn) {
  try {
    fn();
    tests.passed++;
    tests.results.push({ name, status: '✅ PASS' });
    console.log(`✅ ${name}`);
  } catch (error) {
    tests.failed++;
    tests.results.push({ name, status: '❌ FAIL', error: error.message });
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('\n🧪 Testing NeuroSync Knowledge Base\n');
console.log('═'.repeat(50));

// Test 1: Knowledge base initialization
test('Knowledge base initializes correctly', () => {
  assert(window.knowledgeBase !== null, 'Knowledge base should be initialized');
  assert(typeof window.knowledgeBase === 'object', 'Knowledge base should be an object');
});

// Test 2: Knowledge base has expected methods
test('Knowledge base has required methods', () => {
  const kb = window.knowledgeBase;
  assert(typeof kb.getDefinition === 'function', 'Should have getDefinition method');
  assert(typeof kb.formatDefinition === 'function', 'Should have formatDefinition method');
  assert(typeof kb.getTermsByCategory === 'function', 'Should have getTermsByCategory method');
  assert(typeof kb.getRelatedTerms === 'function', 'Should have getRelatedTerms method');
});

// Test 3: Knowledge base contains expected terms
test('Knowledge base contains React terms', () => {
  const kb = window.knowledgeBase;
  const component = kb.getDefinition('component');
  assert(component !== undefined, 'Should have "component" definition');
  assert(component.category === 'React', 'Component should be in React category');

  const props = kb.getDefinition('props');
  assert(props !== undefined, 'Should have "props" definition');

  const state = kb.getDefinition('state');
  assert(state !== undefined, 'Should have "state" definition');
});

// Test 4: Test JavaScript terms
test('Knowledge base contains JavaScript terms', () => {
  const kb = window.knowledgeBase;
  const closure = kb.getDefinition('closure');
  assert(closure !== undefined, 'Should have "closure" definition');
  assert(closure.category === 'JavaScript', 'Closure should be in JavaScript category');

  const promise = kb.getDefinition('promise');
  assert(promise !== undefined, 'Should have "promise" definition');
});

// Test 5: Test Python terms
test('Knowledge base contains Python terms', () => {
  const kb = window.knowledgeBase;
  const decorator = kb.getDefinition('decorator');
  assert(decorator !== undefined, 'Should have "decorator" definition');
  assert(decorator.category === 'Python', 'Decorator should be in Python category');

  const generator = kb.getDefinition('generator');
  assert(generator !== undefined, 'Should have "generator" definition');
});

// Test 6: Test term structure
test('Terms have required fields', () => {
  const kb = window.knowledgeBase;
  const component = kb.getDefinition('component');

  assert(component.definition, 'Term should have definition');
  assert(component.example, 'Term should have example');
  assert(component.analogy, 'Term should have analogy');
  assert(component.category, 'Term should have category');
  assert(Array.isArray(component.relatedTerms), 'Term should have relatedTerms array');
  assert(component.relatedTerms.length > 0, 'Term should have at least one related term');
});

// Test 7: Test getTermsByCategory
test('getTermsByCategory returns correct categories', () => {
  const kb = window.knowledgeBase;
  const reactTerms = kb.getTermsByCategory('React');
  assert(reactTerms.length > 0, 'Should have React terms');

  const jsTerms = kb.getTermsByCategory('JavaScript');
  assert(jsTerms.length > 0, 'Should have JavaScript terms');

  const pythonTerms = kb.getTermsByCategory('Python');
  assert(pythonTerms.length > 0, 'Should have Python terms');
});

// Test 8: Test getRelatedTerms
test('getRelatedTerms returns valid terms', () => {
  const kb = window.knowledgeBase;
  const related = kb.getRelatedTerms('component');

  assert(Array.isArray(related), 'Should return an array');
  assert(related.length > 0, 'Should have related terms');

  // Check that related terms exist in knowledge base
  related.forEach(term => {
    const def = kb.getDefinition(term);
    assert(def !== undefined, `Related term "${term}" should exist in knowledge base`);
  });
});

// Test 9: Test formatDefinition
test('formatDefinition returns formatted object', () => {
  const kb = window.knowledgeBase;
  const formatted = kb.formatDefinition('component');

  assert(typeof formatted === 'object', 'Should return an object');
  assert(formatted.term === 'component', 'Should include the term name');
  assert(formatted.definition, 'Should include definition');
  assert(formatted.example, 'Should include example');
  assert(formatted.analogy, 'Should include analogy');
});

// Test 10: Test case insensitivity
test('getDefinition is case insensitive', () => {
  const kb = window.knowledgeBase;
  const lower = kb.getDefinition('component');
  const upper = kb.getDefinition('Component');
  const mixed = kb.getDefinition('CoMpOnEnT');

  assert(lower !== undefined, 'Should find lowercase term');
  assert(upper !== undefined, 'Should find uppercase term');
  assert(mixed !== undefined, 'Should find mixed case term');
});

// Test 11: Test major categories have terms
test('Major categories have terms', () => {
  const kb = window.knowledgeBase;
  const categories = ['React', 'JavaScript', 'Python', 'Computer Science'];

  categories.forEach(category => {
    const terms = kb.getTermsByCategory(category);
    assert(terms.length > 0, `Category "${category}" should have at least one term`);
    console.log(`   ${category}: ${terms.length} terms`);
  });
});

// Test 12: Test term count
test('Knowledge base has 30+ terms', () => {
  const kb = window.knowledgeBase;
  const totalTerms = kb.allTerms.length;

  assert(totalTerms >= 30, `Should have at least 30 terms, found ${totalTerms}`);
  console.log(`   Found ${totalTerms} terms total`);
});

// Test 13: Test high-priority terms
test('High-priority terms are present', () => {
  const kb = window.knowledgeBase;
  const priorityTerms = [
    'component', 'props', 'state', 'hooks', 'jsx',
    'closure', 'promise', 'async', 'callback',
    'decorator', 'generator', 'lambda',
    'sql', 'nosql', 'orm',
    'commit', 'branch', 'merge',
    'api', 'rest', 'endpoint'
  ];

  priorityTerms.forEach(term => {
    const def = kb.getDefinition(term);
    assert(def !== undefined, `High-priority term "${term}" should be in knowledge base`);
  });

  console.log(`   All ${priorityTerms.length} priority terms found`);
});

// Test 14: Test definition quality
test('Definitions have meaningful content', () => {
  const kb = window.knowledgeBase;
  const component = kb.getDefinition('component');

  assert(component.definition.length > 20, 'Definition should be substantial');
  assert(component.example.length > 10, 'Example should be substantial');
  assert(component.analogy.length > 10, 'Analogy should be substantial');
});

// Test 15: Test invalid term handling
test('Returns null for non-existent terms', () => {
  const kb = window.knowledgeBase;
  const invalid = kb.getDefinition('thisTermDoesNotExist12345');

  assert(invalid === null, 'Should return null for non-existent terms');
});

console.log('\n' + '═'.repeat(50));
console.log('\n📊 Test Results Summary\n');
console.log(`✅ Passed: ${tests.passed}`);
console.log(`❌ Failed: ${tests.failed}`);
console.log(`📈 Success Rate: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(1)}%`);

if (tests.failed === 0) {
  console.log('\n🎉 All tests passed!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Review errors above.\n');
  process.exit(1);
}

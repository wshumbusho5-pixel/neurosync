/**
 * NeuroSync Predictor Tests
 * Tests the prediction pattern logic without browser
 */

const fs = require('fs');
const path = require('path');

// Mock browser APIs
global.window = {};
global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  querySelector: () => null
};
global.console = {
  log: () => {}, // Suppress extension logs during tests
  error: console.error
};

// Load predictor code
const predictorCode = fs.readFileSync(
  path.join(__dirname, '../extension/content/predictor.js'),
  'utf8'
);

// Execute predictor code
eval(predictorCode);

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

console.log('\n🧪 Testing NeuroSync Prediction Engine\n');
console.log('═'.repeat(50));

// Test 1: Predictor initialization
test('PredictionEngine initializes correctly', () => {
  const predictor = new PredictionEngine();
  assert(predictor !== null, 'Predictor should initialize');
  assert(Array.isArray(predictor.eventHistory), 'Should have eventHistory array');
  assert(predictor.lastPredictionTime !== undefined, 'Should have lastPredictionTime');
});

// Test 2: Add event method
test('Can add events to history', () => {
  const predictor = new PredictionEngine();
  const event = { type: 'scroll', timestamp: Date.now(), data: { speed: 'slow' } };

  predictor.addEvent(event);
  assert(predictor.eventHistory.length === 1, 'Should add event to history');
  assert(predictor.eventHistory[0].type === 'scroll', 'Event type should match');
});

// Test 3: Event history limit
test('Event history maintains maximum length', () => {
  const predictor = new PredictionEngine();

  // Add more than 50 events
  for (let i = 0; i < 60; i++) {
    predictor.addEvent({ type: 'scroll', timestamp: Date.now() + i });
  }

  assert(predictor.eventHistory.length <= 50, 'History should not exceed 50 events');
});

// Test 4: Confusion pattern detection - POSITIVE
test('Detects confusion pattern (pause + hover)', () => {
  const predictor = new PredictionEngine();
  const now = Date.now();

  // Create confusion pattern: pause + hover on technical term
  const events = [
    { type: 'pause', timestamp: now - 5000, data: { duration: 3500 } },
    { type: 'hover', timestamp: now - 1000, data: { text: 'component', duration: 800, isTechnical: true } }
  ];

  events.forEach(e => predictor.addEvent(e));
  const prediction = predictor.analyze();

  assert(prediction !== null, 'Should return a prediction');
  assert(prediction.pattern === 'confusion', 'Should detect confusion pattern');
  assert(prediction.confidence >= 0.7, `Confidence should be >= 0.7, got ${prediction.confidence}`);
  console.log(`   Confidence: ${prediction.confidence.toFixed(2)}`);
});

// Test 5: Confusion pattern - NEGATIVE (no pause)
test('Does not detect confusion without pause', () => {
  const predictor = new PredictionEngine();
  const now = Date.now();

  // Only hover, no pause
  const events = [
    { type: 'hover', timestamp: now, data: { text: 'component', duration: 800, isTechnical: true } }
  ];

  events.forEach(e => predictor.addEvent(e));
  const prediction = predictor.analyze();

  // Should not trigger confusion without pause
  if (prediction !== null) {
    assert(prediction.pattern !== 'confusion', 'Should not detect confusion without pause');
  }
});

// Test 6: Search intent pattern detection - POSITIVE
test('Detects search intent pattern (multiple pauses + hovers)', () => {
  const predictor = new PredictionEngine();
  const now = Date.now();

  // Create search intent pattern: multiple pauses + hovers
  const events = [
    { type: 'pause', timestamp: now - 10000, data: { duration: 3000 } },
    { type: 'hover', timestamp: now - 9000, data: { text: 'component', duration: 600, isTechnical: true } },
    { type: 'scroll', timestamp: now - 7000, data: { speed: 'slow' } },
    { type: 'pause', timestamp: now - 5000, data: { duration: 3500 } },
    { type: 'hover', timestamp: now - 4000, data: { text: 'props', duration: 700, isTechnical: true } },
    { type: 'scroll', timestamp: now - 2000, data: { speed: 'slow' } },
    { type: 'pause', timestamp: now - 1000, data: { duration: 3200 } }
  ];

  events.forEach(e => predictor.addEvent(e));
  const prediction = predictor.analyze();

  assert(prediction !== null, 'Should return a prediction');
  assert(prediction.pattern === 'search_intent', 'Should detect search intent pattern');
  assert(prediction.confidence >= 0.7, `Confidence should be >= 0.7, got ${prediction.confidence}`);
  console.log(`   Confidence: ${prediction.confidence.toFixed(2)}`);
});

// Test 7: Context loss pattern detection - POSITIVE
test('Detects context loss pattern (tab away + erratic scroll)', () => {
  const predictor = new PredictionEngine();
  const now = Date.now();
  const tenMinutesAgo = now - (10 * 60 * 1000 + 5000); // 10 min 5 sec ago

  // Create context loss pattern: long tab away + erratic scrolling
  const events = [
    { type: 'tab_inactive', timestamp: tenMinutesAgo, data: {} },
    { type: 'tab_active', timestamp: now - 5000, data: {} },
    { type: 'scroll', timestamp: now - 4000, data: { speed: 'fast', direction: 'down' } },
    { type: 'scroll', timestamp: now - 3500, data: { speed: 'fast', direction: 'up' } },
    { type: 'scroll', timestamp: now - 3000, data: { speed: 'medium', direction: 'down' } },
    { type: 'scroll', timestamp: now - 2500, data: { speed: 'fast', direction: 'up' } },
    { type: 'scroll', timestamp: now - 2000, data: { speed: 'medium', direction: 'down' } }
  ];

  events.forEach(e => predictor.addEvent(e));
  const prediction = predictor.analyze();

  assert(prediction !== null, 'Should return a prediction');
  assert(prediction.pattern === 'context_loss', 'Should detect context loss pattern');
  assert(prediction.confidence >= 0.6, `Confidence should be >= 0.6, got ${prediction.confidence}`);
  console.log(`   Confidence: ${prediction.confidence.toFixed(2)}`);
});

// Test 8: Context loss - NEGATIVE (short tab away)
test('Does not detect context loss with short tab away', () => {
  const predictor = new PredictionEngine();
  const now = Date.now();
  const twoMinutesAgo = now - (2 * 60 * 1000); // Only 2 minutes

  const events = [
    { type: 'tab_inactive', timestamp: twoMinutesAgo, data: {} },
    { type: 'tab_active', timestamp: now - 5000, data: {} },
    { type: 'scroll', timestamp: now - 4000, data: { speed: 'fast', direction: 'down' } },
    { type: 'scroll', timestamp: now - 3500, data: { speed: 'fast', direction: 'up' } }
  ];

  events.forEach(e => predictor.addEvent(e));
  const prediction = predictor.analyze();

  // Should not trigger context loss with < 10 min tab away
  if (prediction !== null) {
    assert(prediction.pattern !== 'context_loss', 'Should not detect context loss with short tab away');
  }
});

// Test 9: Prediction cooldown
test('Respects prediction cooldown period', () => {
  const predictor = new PredictionEngine();
  const now = Date.now();

  // Manually set last prediction time to recent
  predictor.lastPredictionTime = now - 15000; // 15 seconds ago

  // Try to trigger prediction
  const events = [
    { type: 'pause', timestamp: now - 5000, data: { duration: 3500 } },
    { type: 'hover', timestamp: now, data: { text: 'component', duration: 800, isTechnical: true } }
  ];

  events.forEach(e => predictor.addEvent(e));
  const prediction = predictor.analyze();

  // Should not predict due to cooldown (30 seconds required)
  assert(prediction === null, 'Should not predict during cooldown period');
});

// Test 10: Prediction after cooldown
test('Allows prediction after cooldown period', () => {
  const predictor = new PredictionEngine();
  const now = Date.now();

  // Set last prediction to 31 seconds ago (past cooldown)
  predictor.lastPredictionTime = now - 31000;

  const events = [
    { type: 'pause', timestamp: now - 5000, data: { duration: 3500 } },
    { type: 'hover', timestamp: now, data: { text: 'component', duration: 800, isTechnical: true } }
  ];

  events.forEach(e => predictor.addEvent(e));
  const prediction = predictor.analyze();

  assert(prediction !== null, 'Should allow prediction after cooldown');
  assert(prediction.pattern === 'confusion', 'Should detect pattern');
});

// Test 11: Confidence thresholds
test('Respects minimum confidence threshold', () => {
  const predictor = new PredictionEngine();

  // All predictions should have confidence >= 0.7
  const now = Date.now();

  // Weak pattern - only one pause, short hover
  const events = [
    { type: 'pause', timestamp: now - 5000, data: { duration: 3100 } },
    { type: 'hover', timestamp: now, data: { text: 'test', duration: 550, isTechnical: true } }
  ];

  events.forEach(e => predictor.addEvent(e));
  const prediction = predictor.analyze();

  if (prediction !== null) {
    assert(prediction.confidence >= 0.7, 'Confidence should meet minimum threshold');
  }
});

// Test 12: Recent events only
test('Only analyzes recent events', () => {
  const predictor = new PredictionEngine();
  const now = Date.now();

  // Add old events (should be ignored) and recent events
  const events = [
    // Old events (2 minutes ago)
    { type: 'pause', timestamp: now - 120000, data: { duration: 3500 } },
    { type: 'hover', timestamp: now - 119000, data: { text: 'old', duration: 800, isTechnical: true } },
    // Recent events
    { type: 'pause', timestamp: now - 5000, data: { duration: 3500 } },
    { type: 'hover', timestamp: now - 1000, data: { text: 'component', duration: 800, isTechnical: true } }
  ];

  events.forEach(e => predictor.addEvent(e));

  // Should only consider events from last minute
  assert(predictor.eventHistory.length === 4, 'Should store all events');

  const prediction = predictor.analyze();
  assert(prediction !== null, 'Should detect pattern from recent events only');
  assert(prediction.pattern === 'confusion', 'Should use recent events');
});

// Test 13: Multiple pattern detection
test('Prioritizes highest confidence pattern', () => {
  const predictor = new PredictionEngine();
  const now = Date.now();

  // Create events that could match multiple patterns
  const events = [
    { type: 'pause', timestamp: now - 10000, data: { duration: 3000 } },
    { type: 'hover', timestamp: now - 9000, data: { text: 'component', duration: 600, isTechnical: true } },
    { type: 'pause', timestamp: now - 7000, data: { duration: 3500 } },
    { type: 'hover', timestamp: now - 6000, data: { text: 'props', duration: 700, isTechnical: true } },
    { type: 'pause', timestamp: now - 4000, data: { duration: 3200 } },
    { type: 'hover', timestamp: now - 1000, data: { text: 'state', duration: 800, isTechnical: true } }
  ];

  events.forEach(e => predictor.addEvent(e));
  const prediction = predictor.analyze();

  assert(prediction !== null, 'Should return prediction');
  // Should pick the pattern with highest confidence
  assert(['confusion', 'search_intent'].includes(prediction.pattern), 'Should detect one of the patterns');
});

console.log('\n' + '═'.repeat(50));
console.log('\n📊 Test Results Summary\n');
console.log(`✅ Passed: ${tests.passed}`);
console.log(`❌ Failed: ${tests.failed}`);
console.log(`📈 Success Rate: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(1)}%`);

if (tests.failed === 0) {
  console.log('\n🎉 All prediction tests passed!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Review errors above.\n');
  process.exit(1);
}

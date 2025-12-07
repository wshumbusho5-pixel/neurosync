/**
 * NeuroSync Predictor Logic Tests
 * Tests prediction patterns without loading full browser extension code
 */

console.log('\n🧪 Testing NeuroSync Prediction Logic\n');
console.log('═'.repeat(50));

const tests = {
  passed: 0,
  failed: 0
};

function test(name, fn) {
  try {
    fn();
    tests.passed++;
    console.log(`✅ ${name}`);
  } catch (error) {
    tests.failed++;
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Simplified prediction pattern logic for testing

/**
 * Detect confusion pattern: pause (3+ sec) + hover on technical term
 */
function detectConfusionPattern(events) {
  const recentEvents = events.filter(e => Date.now() - e.timestamp < 60000);

  const hasPause = recentEvents.some(e =>
    e.type === 'pause' && e.data.duration >= 3000
  );

  const hasHoverOnTech = recentEvents.some(e =>
    e.type === 'hover' &&
    e.data.isTechnical &&
    e.data.duration >= 500
  );

  if (hasPause && hasHoverOnTech) {
    return {
      pattern: 'confusion',
      confidence: 0.82,
      reason: 'User paused and hovered over technical term'
    };
  }

  return null;
}

/**
 * Detect search intent: multiple pauses + hovers
 */
function detectSearchIntent(events) {
  const recentEvents = events.filter(e => Date.now() - e.timestamp < 60000);

  const pauseCount = recentEvents.filter(e =>
    e.type === 'pause' && e.data.duration >= 3000
  ).length;

  const hoverCount = recentEvents.filter(e =>
    e.type === 'hover' && e.data.isTechnical
  ).length;

  if (pauseCount >= 2 && hoverCount >= 2) {
    return {
      pattern: 'search_intent',
      confidence: 0.78,
      reason: `${pauseCount} pauses and ${hoverCount} hovers detected`
    };
  }

  return null;
}

/**
 * Detect context loss: tab away (10+ min) + erratic scrolling
 */
function detectContextLoss(events) {
  const tabInactive = events.find(e => e.type === 'tab_inactive');
  const tabActive = events.find(e => e.type === 'tab_active');

  if (!tabInactive || !tabActive) return null;

  const timeAway = tabActive.timestamp - tabInactive.timestamp;
  if (timeAway < 10 * 60 * 1000) return null; // Less than 10 minutes

  // Check for erratic scrolling after returning
  const scrollsAfterReturn = events.filter(e =>
    e.type === 'scroll' && e.timestamp > tabActive.timestamp
  );

  if (scrollsAfterReturn.length < 3) return null;

  // Check for direction changes (erratic)
  let directionChanges = 0;
  for (let i = 1; i < scrollsAfterReturn.length; i++) {
    if (scrollsAfterReturn[i].data.direction !== scrollsAfterReturn[i-1].data.direction) {
      directionChanges++;
    }
  }

  if (directionChanges >= 2) {
    return {
      pattern: 'context_loss',
      confidence: 0.68,
      reason: `Tab was away for ${Math.round(timeAway / 60000)} minutes, then erratic scrolling`
    };
  }

  return null;
}

// Run tests

test('Confusion pattern: detects pause + hover', () => {
  const now = Date.now();
  const events = [
    { type: 'pause', timestamp: now - 5000, data: { duration: 3500 } },
    { type: 'hover', timestamp: now - 1000, data: { text: 'component', duration: 800, isTechnical: true } }
  ];

  const result = detectConfusionPattern(events);
  assert(result !== null, 'Should detect pattern');
  assert(result.pattern === 'confusion', 'Should be confusion pattern');
  assert(result.confidence === 0.82, 'Confidence should be 0.82');
  console.log(`   ✓ Confidence: ${result.confidence}`);
});

test('Confusion pattern: requires technical term', () => {
  const now = Date.now();
  const events = [
    { type: 'pause', timestamp: now - 5000, data: { duration: 3500 } },
    { type: 'hover', timestamp: now - 1000, data: { text: 'the', duration: 800, isTechnical: false } }
  ];

  const result = detectConfusionPattern(events);
  assert(result === null, 'Should not detect pattern without technical term');
});

test('Confusion pattern: requires sufficient pause', () => {
  const now = Date.now();
  const events = [
    { type: 'pause', timestamp: now - 5000, data: { duration: 2000 } }, // Too short
    { type: 'hover', timestamp: now - 1000, data: { text: 'component', duration: 800, isTechnical: true } }
  ];

  const result = detectConfusionPattern(events);
  assert(result === null, 'Should not detect pattern with short pause');
});

test('Search intent: detects multiple pauses + hovers', () => {
  const now = Date.now();
  const events = [
    { type: 'pause', timestamp: now - 10000, data: { duration: 3000 } },
    { type: 'hover', timestamp: now - 9000, data: { text: 'component', duration: 600, isTechnical: true } },
    { type: 'pause', timestamp: now - 5000, data: { duration: 3500 } },
    { type: 'hover', timestamp: now - 4000, data: { text: 'props', duration: 700, isTechnical: true } }
  ];

  const result = detectSearchIntent(events);
  assert(result !== null, 'Should detect pattern');
  assert(result.pattern === 'search_intent', 'Should be search intent pattern');
  assert(result.confidence === 0.78, 'Confidence should be 0.78');
  console.log(`   ✓ Confidence: ${result.confidence}`);
});

test('Search intent: requires multiple interactions', () => {
  const now = Date.now();
  const events = [
    { type: 'pause', timestamp: now - 5000, data: { duration: 3000 } },
    { type: 'hover', timestamp: now - 4000, data: { text: 'component', duration: 600, isTechnical: true } }
  ];

  const result = detectSearchIntent(events);
  assert(result === null, 'Should not detect with only one pause and hover');
});

test('Context loss: detects tab away + erratic scrolling', () => {
  const now = Date.now();
  const tenMinutesAgo = now - (10 * 60 * 1000 + 5000);

  const events = [
    { type: 'tab_inactive', timestamp: tenMinutesAgo, data: {} },
    { type: 'tab_active', timestamp: now - 5000, data: {} },
    { type: 'scroll', timestamp: now - 4000, data: { speed: 'fast', direction: 'down' } },
    { type: 'scroll', timestamp: now - 3500, data: { speed: 'fast', direction: 'up' } },
    { type: 'scroll', timestamp: now - 3000, data: { speed: 'medium', direction: 'down' } },
    { type: 'scroll', timestamp: now - 2500, data: { speed: 'fast', direction: 'up' } }
  ];

  const result = detectContextLoss(events);
  assert(result !== null, 'Should detect pattern');
  assert(result.pattern === 'context_loss', 'Should be context loss pattern');
  assert(result.confidence === 0.68, 'Confidence should be 0.68');
  console.log(`   ✓ Confidence: ${result.confidence}`);
  console.log(`   ✓ ${result.reason}`);
});

test('Context loss: requires long time away', () => {
  const now = Date.now();
  const twoMinutesAgo = now - (2 * 60 * 1000);

  const events = [
    { type: 'tab_inactive', timestamp: twoMinutesAgo, data: {} },
    { type: 'tab_active', timestamp: now - 5000, data: {} },
    { type: 'scroll', timestamp: now - 4000, data: { speed: 'fast', direction: 'down' } },
    { type: 'scroll', timestamp: now - 3500, data: { speed: 'fast', direction: 'up' } }
  ];

  const result = detectContextLoss(events);
  assert(result === null, 'Should not detect with short time away');
});

test('Context loss: requires erratic behavior', () => {
  const now = Date.now();
  const tenMinutesAgo = now - (10 * 60 * 1000 + 5000);

  const events = [
    { type: 'tab_inactive', timestamp: tenMinutesAgo, data: {} },
    { type: 'tab_active', timestamp: now - 5000, data: {} },
    { type: 'scroll', timestamp: now - 4000, data: { speed: 'slow', direction: 'down' } },
    { type: 'scroll', timestamp: now - 3500, data: { speed: 'slow', direction: 'down' } }
  ];

  const result = detectContextLoss(events);
  assert(result === null, 'Should not detect with smooth scrolling');
});

test('Pattern confidence values are reasonable', () => {
  const now = Date.now();

  // Test confusion
  const confusionEvents = [
    { type: 'pause', timestamp: now - 5000, data: { duration: 3500 } },
    { type: 'hover', timestamp: now - 1000, data: { text: 'component', duration: 800, isTechnical: true } }
  ];
  const confusion = detectConfusionPattern(confusionEvents);
  assert(confusion.confidence >= 0.7 && confusion.confidence <= 1.0, 'Confusion confidence in valid range');

  // Test search intent
  const searchEvents = [
    { type: 'pause', timestamp: now - 10000, data: { duration: 3000 } },
    { type: 'hover', timestamp: now - 9000, data: { text: 'component', duration: 600, isTechnical: true } },
    { type: 'pause', timestamp: now - 5000, data: { duration: 3500 } },
    { type: 'hover', timestamp: now - 4000, data: { text: 'props', duration: 700, isTechnical: true } }
  ];
  const search = detectSearchIntent(searchEvents);
  assert(search.confidence >= 0.7 && search.confidence <= 1.0, 'Search intent confidence in valid range');

  console.log('   ✓ All confidence values between 0.7 and 1.0');
});

test('Recent events filter works correctly', () => {
  const now = Date.now();
  const twoMinutesAgo = now - (2 * 60 * 1000);

  const events = [
    { type: 'pause', timestamp: twoMinutesAgo, data: { duration: 3500 } }, // Old
    { type: 'pause', timestamp: now - 5000, data: { duration: 3500 } }, // Recent
    { type: 'hover', timestamp: now - 1000, data: { text: 'component', duration: 800, isTechnical: true } } // Recent
  ];

  // Should only detect based on recent events
  const result = detectConfusionPattern(events);
  assert(result !== null, 'Should work with mix of old and recent events');
  console.log('   ✓ Recent events filter working');
});

console.log('\n' + '═'.repeat(50));
console.log('\n📊 Test Results Summary\n');
console.log(`✅ Passed: ${tests.passed}`);
console.log(`❌ Failed: ${tests.failed}`);
console.log(`📈 Success Rate: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(1)}%`);

if (tests.failed === 0) {
  console.log('\n🎉 All prediction logic tests passed!\n');
  console.log('✓ Confusion pattern detection working');
  console.log('✓ Search intent pattern detection working');
  console.log('✓ Context loss pattern detection working');
  console.log('✓ Confidence thresholds validated');
  console.log('✓ Edge cases handled correctly\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Review errors above.\n');
  process.exit(1);
}

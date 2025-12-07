# NeuroSync Extension Testing Guide

## Setup Instructions

### 1. Load Extension in Chrome

1. Open Chrome and navigate to: `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Navigate to: `/Users/willyshumbusho/NeuroSync/extension`
5. Click "Select"

**Expected Result:** Extension should load without errors. You should see "NeuroSync" in your extensions list.

### 2. Verify Extension Loaded

1. Check the extensions page - NeuroSync should be listed
2. Click "Inspect views: service worker" to see background logs
3. Open any webpage and press F12 (DevTools)
4. In Console, you should see:
   ```
   [NeuroSync] Knowledge base loaded with X terms
   [NeuroSync] Tracker initialized
   [NeuroSync] Predictor initialized with 3 patterns
   [NeuroSync] UI initialized
   ```

## Test Scenarios

### Test 1: Knowledge Base Integration

**Goal:** Verify that technical term definitions from knowledge-base.js are displayed correctly.

**Steps:**
1. Open React documentation: https://react.dev/learn/thinking-in-react
2. Slowly scroll down the page
3. Hover over technical terms like "component", "props", or "state" for 1+ second
4. Right-click and select any technical term, then "Search Google for..."

**Expected Result:**
- Hovering should show rich tooltips with definition, analogy, example, and related terms
- The tooltip should use content from knowledge-base.js, not placeholder text

**Debug if fails:**
- Check DevTools console for errors
- Verify knowledge-base.js loaded before other scripts in manifest.json
- Check that `window.knowledgeBase` exists in console

### Test 2: Confusion Pattern Detection

**Goal:** Trigger the confusion detection pattern (pause + hover on technical term).

**Test Page:** https://react.dev/learn/managing-state

**Steps:**
1. Scroll to a section with technical terms (e.g., "Reducer")
2. Stop scrolling completely for 3+ seconds (don't move mouse)
3. After the pause, hover over "reducer" or another technical term for 1+ second

**Expected Result:**
- After hovering, NeuroSync should detect confusion pattern
- A prediction card should appear in bottom-right corner
- Card should show: "🧠 You might need: Definition of [term]"
- Confidence score should be ~0.82

**Debug if fails:**
- Open DevTools console
- Look for: `[NeuroSync] Prediction:` log message
- Check if pause was detected: `[NeuroSync] Pause detected`
- Verify hover duration was > 500ms

### Test 3: Search Intent Pattern

**Goal:** Trigger search intent pattern (multiple pauses + hovers).

**Test Page:** https://docs.python.org/3/tutorial/introduction.html

**Steps:**
1. Scroll slowly down the page
2. Pause for 3+ seconds
3. Hover over a technical term for 1+ second
4. Scroll a bit more
5. Pause again for 3+ seconds
6. Hover over another term

**Expected Result:**
- After second hover, search intent pattern should trigger
- Prediction card appears with confidence ~0.78
- Card shows relevant information based on hovers

**Debug if fails:**
- Check console for `[NeuroSync] Search intent detected`
- Verify at least 2 pause events and 2 hover events occurred
- Check that predictions aren't rate-limited (30s between predictions)

### Test 4: Context Loss Pattern

**Goal:** Trigger context loss pattern (tab switch + erratic scrolling).

**Test Page:** Any documentation page

**Steps:**
1. Open a documentation page (e.g., React docs)
2. Scroll down to middle of page
3. Switch to a different tab (e.g., open YouTube)
4. Wait 10+ minutes (or modify predictor.js to use shorter time for testing)
5. Return to the documentation tab
6. Scroll up and down rapidly (erratic pattern)

**Expected Result:**
- After erratic scrolling, context loss pattern should trigger
- Prediction card appears with confidence ~0.68
- Card suggests reviewing the section

**Debug if fails:**
- Check console for `[NeuroSync] Context loss detected`
- Verify tab was inactive for 10+ minutes
- Check for erratic scroll events (direction changes)

## Testing the Knowledge Base

### Verify All 50+ Terms Work

**Test these high-priority terms:**
- React: component, props, state, hooks, JSX, virtual DOM
- JavaScript: closure, promise, async/await, arrow function
- Python: decorator, list comprehension, generator, lambda
- Database: SQL, NoSQL, ORM, migration
- Git: commit, branch, merge, rebase

**Steps:**
1. Open any webpage
2. Open DevTools console
3. Type: `window.knowledgeBase.formatDefinition('component')`
4. Verify it returns formatted HTML with definition, analogy, example

**Test term categories:**
```javascript
window.knowledgeBase.getTermsByCategory('React')
window.knowledgeBase.getTermsByCategory('JavaScript')
window.knowledgeBase.getTermsByCategory('Python')
```

## Common Issues & Solutions

### Issue 1: Extension won't load
- **Cause:** Syntax error in one of the files
- **Fix:** Check DevTools Extensions page for error message
- **Verify:** All JSON files are valid (manifest.json)

### Issue 2: Knowledge base not loading
- **Symptom:** Console shows "undefined" for window.knowledgeBase
- **Cause:** knowledge-base.js not loaded first
- **Fix:** Check manifest.json - knowledge-base.js must be first in content_scripts array
- **Verify:** Reload extension and check console

### Issue 3: Predictions not triggering
- **Cause:** Events not being detected properly
- **Debug steps:**
  1. Check console for event logs (scroll, pause, hover)
  2. Verify tracker.js is logging events
  3. Check predictor.js is analyzing events
  4. Ensure 30s cooldown hasn't prevented new predictions
- **Fix:** Look at last prediction timestamp in console

### Issue 4: Tooltips showing placeholder text
- **Cause:** Knowledge base not integrated with UI
- **Fix:** Verify ui.js getDefinitionContent() is calling window.knowledgeBase
- **Check:** Line 244 in ui.js should have knowledge base integration code

### Issue 5: Predictions have low confidence
- **Cause:** Patterns not matching strongly enough
- **Expected:** Confusion ~0.82, Search ~0.78, Context loss ~0.68
- **Debug:** Check event history in console to see what's being detected

## Performance Monitoring

Watch for these in DevTools console:

**Good signs:**
- `[NeuroSync] Knowledge base loaded with 50+ terms`
- `[NeuroSync] Event: scroll` (when scrolling)
- `[NeuroSync] Pause detected` (after 3s pause)
- `[NeuroSync] Hover on technical term: [term]`
- `[NeuroSync] Prediction: [pattern] (confidence: 0.XX)`

**Warning signs:**
- `[NeuroSync] Error:` messages
- No event logs when interacting with page
- `undefined` when accessing knowledge base

## Next Steps After Testing

Once testing is complete:

1. **Document bugs found** - Create issues list
2. **Tune confidence thresholds** - If too many/few predictions
3. **Expand knowledge base** - Add more terms if needed
4. **Enhance patterns** - Improve prediction accuracy
5. **Add analytics** - Track prediction accuracy

## Quick Test Checklist

- [ ] Extension loads without errors
- [ ] Knowledge base accessible in console
- [ ] Scroll events are tracked
- [ ] Pause detection works (3s pause)
- [ ] Hover detection works on technical terms
- [ ] Tooltips show knowledge base definitions (not placeholders)
- [ ] Confusion pattern triggers (pause + hover)
- [ ] Search intent pattern triggers (multiple pauses + hovers)
- [ ] Context loss pattern triggers (tab switch + erratic scroll)
- [ ] Predictions show in bottom-right corner
- [ ] Confidence scores are reasonable (0.65-0.85)
- [ ] 30s cooldown between predictions works

## Test Results Template

```
### Test Session: [Date]

**Environment:**
- Chrome version:
- OS: macOS
- Test pages: React docs, Python docs, etc.

**Test 1: Knowledge Base**
- Status: ✅ / ❌
- Notes:

**Test 2: Confusion Pattern**
- Status: ✅ / ❌
- Confidence score:
- Notes:

**Test 3: Search Intent**
- Status: ✅ / ❌
- Confidence score:
- Notes:

**Test 4: Context Loss**
- Status: ✅ / ❌
- Confidence score:
- Notes:

**Bugs Found:**
1.
2.

**Next Actions:**
1.
2.
```

---

Ready to test! Start with loading the extension in Chrome and work through the test scenarios above.

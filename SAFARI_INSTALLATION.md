# NeuroSync Safari Extension Installation Guide

## Prerequisites

- macOS 11 (Big Sur) or later
- Safari 14 or later
- Allow Unsigned Extensions enabled (for development)

## Installation Steps

### Step 1: Enable Safari Developer Features

1. Open Safari
2. Go to **Safari** → **Settings** (or **Preferences**)
3. Click the **Advanced** tab
4. Check ✅ **"Show features for web developers"** (or "Show Develop menu in menu bar")

### Step 2: Enable Unsigned Extensions

Since we're loading a development extension (not from App Store):

1. In Safari, go to **Develop** menu (should now be visible in menu bar)
2. Select **Allow Unsigned Extensions**
3. You may need to enter your password to authorize this

### Step 3: Load the NeuroSync Extension

1. In Safari, go to **Develop** → **Show Web Extension Console**
   - Alternatively: **Safari** → **Settings** → **Extensions**

2. In the Extensions window, you should see an option to load unsigned extensions

3. Click the **"+"** button or **"Load Unsigned Extension"** button

4. Navigate to: `/Users/willyshumbusho/NeuroSync/safari-extension`

5. Click **Select**

### Step 4: Enable the Extension

1. In Safari Settings → Extensions, you should now see "NeuroSync - Phase 0"
2. Check the box to enable it
3. Click on the extension to configure permissions
4. Make sure "Allow on every website" is selected (or enable it for specific sites)

### Step 5: Verify Installation

1. Open a new Safari tab
2. Press **Cmd + Option + I** to open Web Inspector (Developer Console)
3. Go to the **Console** tab
4. Navigate to any webpage (e.g., https://react.dev)
5. You should see these messages in the console:
   ```
   [NeuroSync] Knowledge base loaded with 50+ terms
   [NeuroSync] Tracker initialized
   [NeuroSync] Predictor initialized with 3 patterns
   [NeuroSync] UI initialized
   ```

## Testing the Extension

### Quick Test: Hover Detection

1. Go to: https://react.dev/learn/thinking-in-react
2. Open Web Inspector (Cmd + Option + I)
3. Hover your mouse over technical terms like "component", "props", or "state"
4. You should see console logs: `[NeuroSync] Hover detected on: [term]`

### Test Pattern 1: Confusion Detection

**What triggers it:** Pause (3+ seconds) + hover on technical term

**Steps:**
1. Visit React documentation: https://react.dev/learn
2. Scroll down to a section with technical content
3. **Stop scrolling completely** for 3+ seconds
4. Then hover over a technical term (like "useState" or "component") for 1+ second
5. Watch console - should see: `[NeuroSync] Prediction: confusion pattern (confidence: 0.82)`
6. A tooltip/card should appear with the term definition

### Test Pattern 2: Search Intent

**What triggers it:** Multiple pauses + multiple hovers

**Steps:**
1. Visit any documentation page
2. Pause for 3+ seconds
3. Hover over a technical term
4. Scroll a bit
5. Pause again for 3+ seconds
6. Hover over another term
7. Should trigger: `[NeuroSync] Prediction: search intent (confidence: 0.78)`

### Test Pattern 3: Context Loss

**What triggers it:** Tab switch (10+ min) + erratic scrolling

**Steps:**
1. Open a documentation page
2. Switch to a different tab
3. Wait 10+ minutes (or modify predictor.js for testing to use shorter time)
4. Return to the documentation tab
5. Scroll up and down rapidly (change directions multiple times)
6. Should trigger: `[NeuroSync] Prediction: context loss (confidence: 0.68)`

## Troubleshooting

### Extension Not Showing Up

**Problem:** NeuroSync doesn't appear in Safari Extensions list

**Solutions:**
- Make sure "Allow Unsigned Extensions" is enabled (Develop menu)
- Try restarting Safari
- Check that you selected the correct folder: `/Users/willyshumbusho/NeuroSync/safari-extension`
- Verify all files are present in the directory

### No Console Logs Appearing

**Problem:** No `[NeuroSync]` messages in Web Inspector console

**Solutions:**
- Check that extension is enabled in Safari Settings → Extensions
- Make sure "Allow on every website" permission is granted
- Open Web Inspector AFTER navigating to a webpage
- Try refreshing the webpage (Cmd + R)
- Check Console filters - make sure "All" is selected, not just "Errors"

### Permission Errors

**Problem:** Extension asks for permission or doesn't work on certain sites

**Solutions:**
- In Safari Settings → Extensions → NeuroSync
- Change access level to "Allow on every website"
- Or manually grant access to specific domains you want to test on

### Knowledge Base Not Loading

**Problem:** Console shows "undefined" for knowledge base or definitions don't appear

**Solutions:**
- Check console for errors when loading knowledge-base.js
- Verify knowledge-base.js is first in the manifest content_scripts array
- Try disabling and re-enabling the extension
- Check Web Inspector Sources tab to see if knowledge-base.js loaded

### Predictions Not Triggering

**Problem:** Patterns detected but no prediction card appears

**Debug steps:**
1. Open Web Inspector Console
2. Check for these logs when you interact with the page:
   - `[NeuroSync] Event: scroll` (when scrolling)
   - `[NeuroSync] Pause detected` (after 3s pause)
   - `[NeuroSync] Hover detected on: [term]` (when hovering)
3. Verify confidence scores are above 0.7
4. Check that 30 seconds have passed since last prediction (cooldown period)

### Safari-Specific Issues

**Problem:** Extension works in Chrome but not Safari

**Known Safari limitations:**
- Some Chrome APIs may not be fully supported
- Background service worker behavior might differ
- Check console for any API compatibility errors

**Solutions:**
- Check Safari Web Inspector for specific error messages
- Some features might need Safari-specific implementations
- Verify manifest.json has `"persistent": false` for background worker

## Performance Monitoring

### Expected Console Output

When everything is working correctly, you should see:

**On page load:**
```
[NeuroSync] Knowledge base loaded with 50+ terms
[NeuroSync] Tracker initialized
[NeuroSync] Predictor initialized with 3 patterns
[NeuroSync] UI initialized
```

**When scrolling:**
```
[NeuroSync] Event: scroll (speed: fast/medium/slow)
```

**After pausing:**
```
[NeuroSync] Pause detected (duration: 3500ms)
```

**When hovering on technical terms:**
```
[NeuroSync] Hover detected on: component
[NeuroSync] Technical term identified: component
```

**When pattern triggers:**
```
[NeuroSync] Analyzing 15 recent events...
[NeuroSync] Prediction: confusion (confidence: 0.82)
[NeuroSync] Showing prediction for: component
```

## Testing Checklist

Use this to verify everything works:

- [ ] Safari Develop menu is visible
- [ ] "Allow Unsigned Extensions" is enabled
- [ ] NeuroSync appears in Extensions list
- [ ] Extension is enabled with "Allow on every website" permission
- [ ] Web Inspector console shows initialization messages
- [ ] Scroll events are logged
- [ ] Pause detection works (after 3s pause)
- [ ] Hover detection works on technical terms
- [ ] Knowledge base terms return proper definitions (not "undefined")
- [ ] Confusion pattern triggers (pause + hover)
- [ ] Prediction card appears in browser
- [ ] Related terms show in prediction card

## Recommended Test Pages

Best pages for testing NeuroSync:

1. **React Documentation**
   - https://react.dev/learn
   - https://react.dev/reference/react
   - Lots of technical terms: component, props, state, hooks, JSX

2. **Python Documentation**
   - https://docs.python.org/3/tutorial/
   - Terms: decorator, generator, lambda, comprehension

3. **MDN Web Docs**
   - https://developer.mozilla.org/en-US/docs/Web/JavaScript
   - Terms: closure, promise, async, callback

4. **Git Documentation**
   - https://git-scm.com/docs
   - Terms: commit, branch, merge, rebase

## Alternative: Converting to Signed Safari App (Optional)

If you want to distribute NeuroSync or avoid the "unsigned extension" warnings:

### Option A: Install Full Xcode

1. Download Xcode from Mac App Store (~15GB)
2. After installation, run:
   ```bash
   xcrun safari-web-extension-converter /Users/willyshumbusho/NeuroSync/safari-extension --app-name NeuroSync --macos-only
   ```
3. This creates a proper Safari app bundle that can be signed

### Option B: Keep Using Unsigned (Fine for Development)

- The current setup works perfectly for development and testing
- No need to convert to signed app unless distributing to others
- Just remember to keep "Allow Unsigned Extensions" enabled

## Next Steps After Installation

Once the extension is installed and working:

1. **Test all three patterns** using the test scenarios above
2. **Document any bugs** you find
3. **Check prediction accuracy** - are the patterns detecting the right situations?
4. **Verify knowledge base** - do definitions make sense?
5. **Note Safari-specific issues** - anything that works differently than expected?

## Uninstalling

To remove NeuroSync:

1. Go to **Safari** → **Settings** → **Extensions**
2. Find "NeuroSync - Phase 0"
3. Uncheck to disable, or click "Uninstall" to remove completely

---

**Extension Location:** `/Users/willyshumbusho/NeuroSync/safari-extension`

**For issues or bugs:** Check console logs first, then refer to troubleshooting section above.

Ready to test! Follow the steps above and let me know what happens.

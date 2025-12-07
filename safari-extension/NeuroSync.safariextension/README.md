# NeuroSync Browser Extension - Phase 0

**The AI that predicts your information needs by understanding how you read**

---

## 🚀 Installation (Developer Mode)

### Chrome/Edge

1. Open `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. The NeuroSync icon should appear in your toolbar

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from the `extension` folder
4. Extension is now active

---

## 🎯 What Phase 0 Does

### Behavioral Tracking

- **Reading speed** - Detects if you're scanning, focused, or confused
- **Pause patterns** - Identifies when you stop to think
- **Mouse hovers** - Sees what terms you're examining
- **Text selections** - Notes what you're highlighting
- **Context switches** - Tracks tab changes

### Predictive Patterns

**Pattern 1: Confusion on Technical Term**
- You pause 3+ seconds on a technical term
- NeuroSync shows a simple definition

**Pattern 2: Search Intent**
- Multiple pauses + long hovers detected
- NeuroSync predicts what you're about to Google
- Shows the answer before you search

**Pattern 3: Context Loss**
- You return after 10+ minutes away
- Erratic scrolling detected
- NeuroSync offers a recap

---

## 📊 How It Works

```
User reads content
       ↓
Tracker observes behavior
       ↓
Predictor analyzes patterns
       ↓
UI shows suggestion (if confident)
       ↓
User gives feedback (helpful/dismiss)
       ↓
System learns from feedback
```

---

## 🔒 Privacy

- **All processing happens locally** in your browser
- No data sent to external servers
- No tracking of personal information
- You can delete all data anytime from the popup

---

## 🧪 Testing

### Manual Testing

1. Open any technical documentation (React, Python, AWS, etc.)
2. Read normally
3. When you encounter a confusing term:
   - Pause for 3+ seconds
   - Hover over the term
4. NeuroSync should show a prediction tooltip

### Debug Mode

Open browser console and look for:
```
[NeuroSync] Reading behavior tracker initialized
[NeuroSync] Prediction engine initialized
[NeuroSync] UI initialized
[NeuroSync] Event: pause {duration: 3200, ...}
[NeuroSync] Prediction: {type: 'confusion', ...}
```

---

## 📈 View Stats

Click the NeuroSync icon in your toolbar to see:
- Total predictions shown
- How many were marked "helpful"
- Prediction accuracy percentage

---

## ⚙️ Settings

Currently in Phase 0:
- Enable/disable predictions
- Clear all data

Coming in Phase 1:
- Confidence threshold adjustment
- Prediction frequency control
- Whitelist/blacklist websites

---

## 🐛 Known Limitations

Phase 0 is a **proof of concept**:

- Limited definition database (only 5 terms hardcoded)
- No ML model yet (rule-based only)
- No real-time learning (feedback stored but not used for training)
- No cross-device sync
- English only

---

## 🔮 What's Next

### Phase 1 (Coming Soon)

- Add biometric integration (smartwatch data)
- Train ML model on user feedback
- Expand definition database
- Cross-device synchronization
- Real-time learning from feedback

### Phase 2

- Desktop app (beyond browser)
- Mobile version
- EEG sensor integration
- Full NeuroSync experience

---

## 📝 Development

### File Structure

```
extension/
├── manifest.json          # Extension configuration
├── background/
│   └── service-worker.js  # Background processes
├── content/
│   ├── tracker.js         # Behavioral tracking
│   ├── predictor.js       # Prediction engine
│   └── ui.js              # UI components
├── popup/
│   ├── popup.html         # Extension popup
│   └── popup.js           # Popup logic
└── assets/
    ├── icons/             # Extension icons
    └── styles/            # Stylesheets
```

### Key Classes

- `ReadingBehaviorTracker` - Observes user behavior
- `PredictionEngine` - Analyzes patterns and predicts needs
- `NeuroSyncUI` - Displays predictions to user

---

## 🤝 Contributing

Phase 0 is an early prototype. Feedback welcome!

Report issues or suggestions:
- GitHub: https://github.com/wshumbusho5-pixel/neurosync
- Email: [your email]

---

## 📄 License

[TBD]

---

**NeuroSync Phase 0**

*Proving behavioral prediction works*

*Before we add the neuro part*

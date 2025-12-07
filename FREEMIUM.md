# NeuroSync Freemium System

## Overview

NeuroSync uses a freemium business model with two tiers:

### Free Tier
- **Daily Limit**: 20 predictions per day
- **Knowledge Base**: 52 technical terms
- **Reset**: Midnight local time
- **Price**: Free forever

### Pro Tier
- **Predictions**: Unlimited
- **Knowledge Base**: 200+ technical terms (coming soon)
- **Analytics**: Advanced pattern insights
- **Support**: Priority support
- **Price**: $4.99/month

## Architecture

### Usage Tracking (`usage-tracker.js`)

The `UsageTracker` class manages all subscription and usage logic:

```javascript
class UsageTracker {
  DAILY_LIMIT_FREE = 20

  async canPredict()           // Check if user can make prediction
  async recordPrediction()     // Increment daily usage
  async recordFeedback()       // Track helpful/dismissed
  async getSubscriptionStatus() // Get Pro status
  async upgradeToPro()         // Activate Pro subscription
  async getAnalytics()         // Get Pro analytics data
}
```

### Data Structure

#### Storage Keys

**`usage`**: Daily usage data (keyed by date YYYY-MM-DD)
```json
{
  "2025-12-07": {
    "predictions": 15,
    "helpful": 12,
    "dismissed": 3,
    "patterns": {
      "confusion": 8,
      "search_intent": 5,
      "context_loss": 2
    }
  }
}
```

**`allTimeStats`**: Aggregate statistics
```json
{
  "totalPredictions": 450,
  "totalHelpful": 380,
  "firstUsed": 1701907200000
}
```

**`subscription`**: Subscription status
```json
{
  "isPro": false,
  "tier": "free",
  "startDate": null,
  "endDate": null,
  "stripeCustomerId": null
}
```

### Message API

The service worker handles these message types:

| Message Type | Purpose | Response |
|-------------|---------|----------|
| `check_can_predict` | Check if prediction allowed | `{ allowed: boolean, reason: string, remaining?: number }` |
| `record_prediction` | Log prediction shown | `void` |
| `record_feedback` | Log user feedback | `void` |
| `get_subscription` | Get subscription status | `{ isPro: boolean, tier: string, ... }` |
| `upgrade_to_pro` | Activate Pro subscription | `{ isPro: true, ... }` |
| `get_analytics` | Get Pro analytics | `{ allTime: {...}, weekly: [...], patterns: {...} }` |
| `get_today_usage` | Get today's usage stats | `{ predictionsToday: number, resetsAt: timestamp }` |

## User Flows

### Free User Journey

1. **Install Extension**
   - Popup shows "Free" tier
   - Usage: 0 / 20

2. **Use Extension**
   - Each prediction increments counter
   - Popup updates in real-time

3. **Approach Limit (15+)**
   - Upgrade CTA appears in popup
   - "✨ Upgrade to Pro" button shown

4. **Hit Limit (20)**
   - Paywall modal appears
   - Shows time until reset
   - Upgrade button prominent

5. **Midnight Reset**
   - Usage counter resets to 0
   - Can use 20 more predictions

### Pro User Journey

1. **Upgrade to Pro**
   - Click upgrade button
   - Complete Stripe checkout (TODO)
   - Subscription activated

2. **Unlimited Usage**
   - No daily limits
   - No paywall ever shown

3. **Advanced Analytics**
   - Pattern breakdown
   - Weekly trends
   - Accuracy insights

## Implementation Flow

### Prediction Request

```
1. User triggers pattern (e.g., pauses on technical term)
2. predictor.js → checkCanPredict()
3. service-worker.js → usageTracker.canPredict()
4. Check subscription status
5a. If Pro: Allow prediction
5b. If Free: Check daily limit
    - If under 20: Allow prediction, return remaining count
    - If at 20: Deny, return reset time
6. If allowed:
   - Show prediction tooltip
   - recordPrediction()
7. If denied:
   - Show paywall modal
```

### Feedback Recording

```
1. User clicks "Helpful" or "Dismiss"
2. ui.js → storeFeedback()
3. Send message to service worker
4. usageTracker.recordFeedback(helpful, pattern)
5. Update daily usage stats
6. Update all-time stats
```

### Subscription Management

```
1. User clicks "Upgrade to Pro"
2. ui.js → handleUpgrade() (placeholder)
3. TODO: Open Stripe Checkout
4. On success:
   - service-worker.js receives webhook
   - usageTracker.upgradeToPro(customerId, endDate)
   - Update subscription in storage
5. Popup shows "✨ Pro" tier
```

## Paywall UI

### Design
- **Position**: Fixed right side, vertically centered
- **Style**: Purple gradient (brand colors)
- **Animation**: Slide in from right
- **Auto-dismiss**: 60 seconds

### Content
- **Icon**: 🚀 rocket emoji
- **Title**: "Daily Limit Reached"
- **Limit Display**: "20/day" in large text
- **Reset Timer**: "Resets in Xh Ym"
- **Features List**:
  - ✨ Unlimited predictions
  - 📚 Expanded knowledge base
  - 📊 Advanced analytics
  - 🎯 Priority support
- **CTA**: "Upgrade to Pro - $4.99/month"
- **Dismiss**: "Maybe later" button

### Code Location
- Styles: `extension/content/ui.js` (line 210-338)
- Display logic: `extension/content/ui.js` (line 920-1023)

## Popup Integration

### Usage Display (Free Tier)

```
┌─────────────────────────────┐
│ Plan              Free      │
│ Today's usage     15 / 20   │
│ Resets in         8h 23m    │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ✨ Upgrade to Pro - $4.99/mo│
└─────────────────────────────┘
```

### Usage Display (Pro Tier)

```
┌─────────────────────────────┐
│ Plan              ✨ Pro    │
└─────────────────────────────┘
```

(Usage rows hidden for Pro users)

### Code Location
- HTML: `extension/popup/popup.html` (line 465-485)
- JavaScript: `extension/popup/popup.js` (line 132-207)

## Analytics (Pro Only)

Pro users get access to advanced analytics:

### All-Time Stats
- Total predictions
- Total helpful marks
- First use date
- Overall accuracy

### Weekly Trends
- Last 7 days breakdown
- Predictions per day
- Helpful vs dismissed per day

### Pattern Breakdown
- Confusion detections
- Search intent detections
- Context loss detections

### Access
```javascript
chrome.runtime.sendMessage(
  { type: 'get_analytics' },
  (analytics) => {
    console.log(analytics.allTime);
    console.log(analytics.weekly);
    console.log(analytics.patterns);
    console.log(analytics.accuracy);
  }
);
```

## Data Cleanup

Old usage data is automatically cleaned:

- **Retention**: 30 days
- **Frequency**: On demand via `cleanupOldData()`
- **Location**: `usage-tracker.js` (line 275-292)

## Next Steps (TODO)

### Stripe Integration

1. **Setup Stripe Account**
   - Create Stripe account
   - Get API keys (test + live)
   - Create product ($4.99/month)

2. **Add Stripe Checkout**
   - Create checkout session
   - Redirect user to Stripe
   - Handle success/cancel URLs

3. **Webhook Handler**
   - Listen for `checkout.session.completed`
   - Activate Pro subscription
   - Store customer ID

4. **Subscription Management**
   - Handle cancellations
   - Handle payment failures
   - Handle renewals

### Pro Features

1. **Expanded Knowledge Base**
   - Add 150+ more terms
   - Lock behind Pro tier
   - Show "Upgrade to unlock" for Pro terms

2. **Analytics Dashboard**
   - Create analytics tab in popup
   - Show weekly charts
   - Show pattern breakdown
   - Export data option

3. **Priority Support**
   - Add support email
   - Create support ticket system
   - Prioritize Pro users

## Testing

### Test Free Tier

```javascript
// Simulate 20 predictions
for (let i = 0; i < 20; i++) {
  await chrome.runtime.sendMessage({ type: 'record_prediction' });
}

// Try 21st prediction
const canPredict = await chrome.runtime.sendMessage({
  type: 'check_can_predict'
});
console.log(canPredict); // { allowed: false, reason: 'limit_reached', ... }
```

### Test Pro Upgrade

```javascript
// Activate Pro (manual, for testing)
await chrome.runtime.sendMessage({
  type: 'upgrade_to_pro',
  stripeCustomerId: 'cus_test123',
  endDate: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year
});

// Verify unlimited predictions
for (let i = 0; i < 100; i++) {
  const canPredict = await chrome.runtime.sendMessage({
    type: 'check_can_predict'
  });
  console.log(canPredict); // { allowed: true, reason: 'pro' }
}
```

### Test Daily Reset

```javascript
// Set usage to 20
await chrome.runtime.sendMessage({ type: 'record_prediction' });
// ... repeat 19 more times

// Check tomorrow
// (Usage should reset to 0)
```

## Metrics to Track

1. **Conversion Rate**
   - % of free users who upgrade
   - Upgrade trigger (at limit vs before limit)

2. **Engagement**
   - Average predictions per day (free users)
   - % of users hitting daily limit
   - Time to first upgrade

3. **Retention**
   - Monthly churn rate (Pro users)
   - Reactivation rate (churned users)

4. **Revenue**
   - Monthly Recurring Revenue (MRR)
   - Average Revenue Per User (ARPU)
   - Customer Lifetime Value (LTV)

## Pricing Rationale

**$4.99/month** was chosen because:

1. **Psychological**: Under $5 feels like an impulse buy
2. **Value**: 20 free predictions/day = ~600/month, Pro = unlimited
3. **Market**: Comparable to other productivity tools
4. **Conversion**: Low enough to encourage trials, high enough to be sustainable

## Revenue Projections

Assuming:
- 10,000 active users
- 5% conversion to Pro (500 users)
- $4.99/month per Pro user

**Monthly Revenue**: 500 × $4.99 = **$2,495**
**Annual Revenue**: $2,495 × 12 = **$29,940**

## License & Legal

- **Terms of Service**: TODO
- **Privacy Policy**: TODO (mention usage tracking)
- **Refund Policy**: 7-day money-back guarantee
- **Cancellation**: Cancel anytime, no questions asked

---

Built with ❤️ by the NeuroSync team

# NeuroSync Stripe Integration Setup Guide

This guide will help you set up Stripe payments for NeuroSync Pro subscriptions.

---

## Overview

NeuroSync uses Stripe for payment processing with the following architecture:

1. **Extension** (Frontend) - Triggers checkout, displays UI
2. **Node.js Server** (Backend) - Handles Stripe API calls and webhooks
3. **Stripe** - Payment processing and subscription management

---

## Prerequisites

- Node.js 18.0 or higher
- A Stripe account (free to create)
- NeuroSync extension installed in Chrome/Safari

---

## Part 1: Stripe Account Setup

### 1. Create Stripe Account

1. Go to https://stripe.com and sign up
2. Complete account verification
3. Switch to **Test Mode** (toggle in top right)

### 2. Get API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Save these keys (you'll need them in Part 3)

### 3. Create Product & Price

1. Go to https://dashboard.stripe.com/test/products
2. Click **+ Add product**
3. Fill in:
   - **Name**: NeuroSync Pro
   - **Description**: Unlimited predictions, expanded knowledge base, and advanced analytics
   - **Pricing model**: Standard pricing
   - **Price**: $4.99
   - **Billing period**: Monthly
4. Click **Save product**
5. Copy the **Price ID** (starts with `price_`) from the product page

### 4. Set Up Webhook

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **+ Add endpoint**
3. Fill in:
   - **Endpoint URL**: `http://localhost:3000/webhook` (for local testing)
   - **Description**: NeuroSync webhook handler
   - **Events to send**:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_`)

---

## Part 2: Server Setup

### 1. Install Dependencies

```bash
cd /Users/willyshumbusho/NeuroSync/server
npm install
```

This will install:
- `express` - Web server
- `stripe` - Stripe SDK
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `body-parser` - Request parsing

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Stripe keys:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Stripe Price ID (from Part 1, Step 3)
STRIPE_PRICE_ID=price_YOUR_PRICE_ID_HERE

# Server Configuration
PORT=3000
NODE_ENV=development

# Extension ID (get from chrome://extensions)
EXTENSION_ID=your_extension_id_here

# Success/Cancel URLs (update with your actual extension ID)
SUCCESS_URL=chrome-extension://YOUR_EXTENSION_ID/popup/success.html
CANCEL_URL=chrome-extension://YOUR_EXTENSION_ID/popup/popup.html
```

**How to get your Extension ID:**
1. Open Chrome
2. Go to `chrome://extensions`
3. Enable "Developer mode" (top right)
4. Find NeuroSync extension
5. Copy the ID (long string of letters)

### 3. Start Server

```bash
npm start
```

You should see:
```
[NeuroSync] Stripe server running on port 3000
[NeuroSync] Environment: development
[NeuroSync] Stripe configured: true
```

### 4. Test Server Health

In a new terminal:
```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-12-07T...",
  "stripe": true
}
```

---

## Part 3: Extension Configuration

### 1. Update Extension Manifest

The extension needs permission to connect to your server.

Edit `/Users/willyshumbusho/NeuroSync/extension/manifest.json`:

```json
{
  "host_permissions": [
    "http://localhost:3000/*"
  ]
}
```

For production, add your deployed server URL:
```json
{
  "host_permissions": [
    "http://localhost:3000/*",
    "https://your-server.com/*"
  ]
}
```

### 2. Update Server URL (if needed)

If you deploy the server to production, update the server URL:

Edit `/Users/willyshumbusho/NeuroSync/extension/background/stripe-client.js`:

```javascript
constructor() {
  // this.serverUrl = 'http://localhost:3000'; // Development
  this.serverUrl = 'https://your-server.com'; // Production
}
```

### 3. Reload Extension

1. Go to `chrome://extensions`
2. Find NeuroSync
3. Click the refresh icon

---

## Part 4: Testing the Integration

### Test 1: Health Check

1. Open NeuroSync extension popup
2. Open browser console (F12)
3. Run:
```javascript
chrome.runtime.sendMessage({ type: 'check_server_health' }, console.log)
```

Should return: `{ status: 'ok', stripe: true, ... }`

### Test 2: Create Checkout Session

1. Use the extension normally until you hit the 20 prediction limit
2. When the paywall appears, click "Upgrade to Pro"
3. A new tab should open with Stripe Checkout

### Test 3: Complete Test Payment

1. In the Stripe Checkout page, use test card:
   - **Card number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)
2. Click "Subscribe"
3. You should be redirected to the success page
4. Your Pro subscription should activate automatically

### Test 4: Verify Pro Status

1. Open NeuroSync extension popup
2. You should see "Plan: ✨ Pro"
3. No usage limits displayed
4. Try making predictions - should be unlimited

### Test 5: Webhook Verification

After completing a test payment, check your server logs:

```
[Stripe] Webhook event received: checkout.session.completed
[Stripe] Checkout completed: cs_test_...
  Customer ID: cus_...
  Subscription ID: sub_...
  User ID: user_...
```

---

## Part 5: Subscription Management

### Cancel Subscription

Users can cancel from the Stripe customer portal:

1. Go to https://dashboard.stripe.com/test/customers
2. Find the customer
3. Click on their subscription
4. Click "Cancel subscription"

Or programmatically:
```javascript
chrome.runtime.sendMessage({
  type: 'cancel_subscription',
  subscriptionId: 'sub_...'
}, console.log)
```

### Reactivate Subscription

```javascript
chrome.runtime.sendMessage({
  type: 'reactivate_subscription',
  subscriptionId: 'sub_...'
}, console.log)
```

---

## Part 6: Production Deployment

### 1. Deploy Server

Deploy to any Node.js hosting:
- **Heroku**: Free tier available
- **Railway**: Easy deployment
- **Vercel**: Serverless functions
- **AWS/GCP/Azure**: Full control

Example (Heroku):
```bash
cd server
git init
heroku create neurosync-payments
git add .
git commit -m "Initial commit"
git push heroku main
```

### 2. Update Webhook URL

1. Go to https://dashboard.stripe.com/webhooks
2. Click your webhook endpoint
3. Update URL to your production server:
   - Old: `http://localhost:3000/webhook`
   - New: `https://your-server.com/webhook`

### 3. Switch to Live Mode

1. In Stripe Dashboard, toggle "Test Mode" → "Live Mode"
2. Get new API keys from https://dashboard.stripe.com/apikeys
3. Update server `.env` with live keys
4. Create new product/price in live mode
5. Update webhook with live signing secret

### 4. Update Extension

1. Update `stripe-client.js` with production server URL
2. Update `manifest.json` with production host permissions
3. Rebuild extension
4. Submit to Chrome Web Store / Safari Extensions

---

## Troubleshooting

### Server won't start

**Error**: `STRIPE_SECRET_KEY is not set`
- Check `.env` file exists in `/server` directory
- Verify all environment variables are set
- No spaces around `=` in `.env`

### Checkout fails to open

**Error**: `Failed to create checkout session`
- Verify server is running (`npm start`)
- Check server URL in `stripe-client.js`
- Check `manifest.json` has correct `host_permissions`
- Check browser console for errors

### Webhook not receiving events

1. Verify webhook URL is correct
2. Check server is publicly accessible (use ngrok for local testing)
3. Verify webhook signing secret matches `.env`
4. Check server logs for webhook errors

### Payment succeeds but Pro not activated

1. Check browser console on success page
2. Verify `session_id` in URL
3. Check server logs for activation errors
4. Manually activate:
```javascript
chrome.runtime.sendMessage({
  type: 'activate_pro',
  sessionId: 'cs_test_...'
}, console.log)
```

---

## Testing with Stripe CLI

For local webhook testing, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/webhook

# Copy the webhook signing secret and add to .env
# STRIPE_WEBHOOK_SECRET=whsec_...

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
```

---

## Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use environment variables** - Don't hardcode keys
3. **Validate webhook signatures** - Already implemented
4. **Use HTTPS in production** - Required by Stripe
5. **Rotate keys regularly** - In Stripe Dashboard
6. **Monitor failed payments** - Set up Stripe alerts
7. **Log all transactions** - Already implemented

---

## Cost & Pricing

### Stripe Fees (per successful charge)
- **2.9% + $0.30** per transaction
- For $4.99 subscription: **~$0.45 fee** (you keep $4.54)

### Example Revenue
- 100 Pro users: $499/month revenue, ~$45 fees = **$454 net**
- 500 Pro users: $2,495/month revenue, ~$225 fees = **$2,270 net**
- 1,000 Pro users: $4,990/month revenue, ~$450 fees = **$4,540 net**

---

## Support

### Stripe Support
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com

### NeuroSync Issues
- Check server logs
- Check browser console
- Review this guide
- Contact: support@neurosync.app

---

## Next Steps

1. ✅ Complete all 4 test scenarios above
2. Add subscription management UI to popup
3. Implement customer portal link
4. Add Pro-only features (200+ term knowledge base)
5. Build analytics dashboard for Pro users
6. Deploy to production

---

**That's it!** Your Stripe integration is now complete and ready for testing.

For production deployment, follow Part 6 of this guide.

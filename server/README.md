# NeuroSync Stripe Payment Server

Node.js backend server for handling Stripe payments and subscriptions for NeuroSync Pro.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Then edit `.env` and add your Stripe keys (see [STRIPE_SETUP.md](../STRIPE_SETUP.md) for detailed instructions).

### 3. Start Server

```bash
npm start
```

Server will run on `http://localhost:3000`

### 4. Test Health

```bash
curl http://localhost:3000/health
```

## API Endpoints

### POST /create-checkout-session

Creates a Stripe Checkout session for subscribing to NeuroSync Pro.

**Request:**
```json
{
  "userId": "user_abc123"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/..."
}
```

### GET /session/:sessionId

Get details about a checkout session.

**Response:**
```json
{
  "status": "paid",
  "customerEmail": "user@example.com",
  "customerId": "cus_...",
  "subscriptionId": "sub_..."
}
```

### GET /subscription/:subscriptionId

Get subscription details.

**Response:**
```json
{
  "id": "sub_...",
  "status": "active",
  "currentPeriodEnd": 1701907200,
  "cancelAtPeriodEnd": false,
  "customerId": "cus_..."
}
```

### POST /cancel-subscription

Cancel a subscription at period end.

**Request:**
```json
{
  "subscriptionId": "sub_..."
}
```

**Response:**
```json
{
  "success": true,
  "cancelAtPeriodEnd": true,
  "currentPeriodEnd": 1701907200
}
```

### POST /reactivate-subscription

Reactivate a cancelled subscription.

**Request:**
```json
{
  "subscriptionId": "sub_..."
}
```

**Response:**
```json
{
  "success": true,
  "status": "active"
}
```

### POST /webhook

Stripe webhook endpoint for payment events.

**Events Handled:**
- `checkout.session.completed` - Subscription created
- `customer.subscription.created` - Subscription activated
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment processed
- `invoice.payment_failed` - Payment failed

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-07T...",
  "stripe": true
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Stripe secret API key | ✅ Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | ✅ Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | ✅ Yes |
| `STRIPE_PRICE_ID` | Stripe price ID for Pro subscription | ✅ Yes |
| `PORT` | Server port (default: 3000) | ❌ No |
| `NODE_ENV` | Environment (development/production) | ❌ No |
| `EXTENSION_ID` | Chrome extension ID | ❌ No |
| `SUCCESS_URL` | Post-payment success URL | ❌ No |
| `CANCEL_URL` | Payment cancelled URL | ❌ No |

## Development

### Run in Development Mode

```bash
npm run dev
```

This uses `nodemon` to auto-reload on file changes.

### Test Webhook Locally

Use Stripe CLI to forward webhooks to localhost:

```bash
stripe listen --forward-to localhost:3000/webhook
```

### Test Payment Flow

1. Start server: `npm start`
2. Open NeuroSync extension
3. Trigger paywall (make 20 predictions)
4. Click "Upgrade to Pro"
5. Use test card: `4242 4242 4242 4242`

## Production Deployment

### Deploy to Heroku

```bash
heroku create neurosync-payments
git push heroku main
```

### Deploy to Railway

```bash
railway login
railway init
railway up
```

### Environment Setup

1. Add environment variables to hosting platform
2. Update webhook URL in Stripe Dashboard
3. Switch Stripe to Live Mode
4. Update extension with production server URL

## Security

- ✅ Webhook signature verification enabled
- ✅ CORS configured for extension origins only
- ✅ Environment variables for sensitive data
- ✅ No API keys in code
- ✅ HTTPS required in production

## Troubleshooting

### Server won't start

Check that `.env` file exists and has all required variables.

### Webhook not receiving events

1. Verify webhook URL is publicly accessible
2. Use `stripe listen` for local testing
3. Check webhook signing secret matches `.env`

### Payment succeeds but webhook fails

Check server logs for errors. Stripe will retry failed webhooks automatically.

## Support

See [STRIPE_SETUP.md](../STRIPE_SETUP.md) for detailed setup instructions.

## License

Proprietary - NeuroSync

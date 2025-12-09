/**
 * NeuroSync Stripe Payment Server
 *
 * Handles Stripe checkout sessions and webhook events
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for extension
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from Chrome/Safari extensions
    if (!origin || origin.startsWith('chrome-extension://') || origin.startsWith('safari-extension://')) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      callback(null, true); // Allow all origins in development
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Body parser middleware (skip for webhook endpoint)
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

/**
 * Create Checkout Session
 * POST /create-checkout-session
 */
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      client_reference_id: userId, // Store extension user ID
      metadata: {
        userId: userId,
        product: 'neurosync_pro',
      },
      success_url: process.env.SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.CANCEL_URL,
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    });

    console.log('[Stripe] Checkout session created:', session.id);
    res.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('[Stripe] Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Session Details
 * GET /session/:sessionId
 */
app.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      customerId: session.customer,
      subscriptionId: session.subscription,
    });

  } catch (error) {
    console.error('[Stripe] Error retrieving session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Subscription Details
 * GET /subscription/:subscriptionId
 */
app.get('/subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    res.json({
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      customerId: subscription.customer,
    });

  } catch (error) {
    console.error('[Stripe] Error retrieving subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Cancel Subscription
 * POST /cancel-subscription
 */
app.post('/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'subscriptionId is required' });
    }

    // Cancel at period end (don't immediately revoke access)
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    console.log('[Stripe] Subscription cancelled:', subscriptionId);
    res.json({
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end,
    });

  } catch (error) {
    console.error('[Stripe] Error cancelling subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Reactivate Subscription
 * POST /reactivate-subscription
 */
app.post('/reactivate-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'subscriptionId is required' });
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    console.log('[Stripe] Subscription reactivated:', subscriptionId);
    res.json({
      success: true,
      status: subscription.status,
    });

  } catch (error) {
    console.error('[Stripe] Error reactivating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Stripe Webhook Handler
 * POST /webhook
 */
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Stripe] Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('[Stripe] Webhook event received:', event.type);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;

    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * Webhook Event Handlers
 */

async function handleCheckoutComplete(session) {
  console.log('[Stripe] Checkout completed:', session.id);
  console.log('  Customer ID:', session.customer);
  console.log('  Subscription ID:', session.subscription);
  console.log('  User ID:', session.client_reference_id);

  // TODO: Store this in a database
  // For now, the extension will handle activation via the success page
}

async function handleSubscriptionCreated(subscription) {
  console.log('[Stripe] Subscription created:', subscription.id);
  console.log('  Customer ID:', subscription.customer);
  console.log('  Status:', subscription.status);
  console.log('  Current period end:', new Date(subscription.current_period_end * 1000));

  // TODO: Store in database and notify extension
}

async function handleSubscriptionUpdated(subscription) {
  console.log('[Stripe] Subscription updated:', subscription.id);
  console.log('  Status:', subscription.status);
  console.log('  Cancel at period end:', subscription.cancel_at_period_end);

  // TODO: Update database and notify extension if needed
}

async function handleSubscriptionDeleted(subscription) {
  console.log('[Stripe] Subscription deleted:', subscription.id);
  console.log('  Customer ID:', subscription.customer);

  // TODO: Revoke Pro access in database
}

async function handlePaymentSucceeded(invoice) {
  console.log('[Stripe] Payment succeeded:', invoice.id);
  console.log('  Subscription ID:', invoice.subscription);
  console.log('  Amount paid:', invoice.amount_paid / 100, invoice.currency.toUpperCase());

  // TODO: Record payment in database
}

async function handlePaymentFailed(invoice) {
  console.log('[Stripe] Payment failed:', invoice.id);
  console.log('  Subscription ID:', invoice.subscription);
  console.log('  Attempt count:', invoice.attempt_count);

  // TODO: Notify user about failed payment
}

/**
 * Health Check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stripe: !!process.env.STRIPE_SECRET_KEY,
  });
});

/**
 * Start Server
 */
app.listen(PORT, () => {
  console.log(`[NeuroSync] Stripe server running on port ${PORT}`);
  console.log(`[NeuroSync] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[NeuroSync] Stripe configured: ${!!process.env.STRIPE_SECRET_KEY}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[NeuroSync] Server shutting down...');
  process.exit(0);
});

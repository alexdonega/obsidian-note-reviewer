// Stripe Webhook Handler
// Processes all Stripe webhook events

import { Router } from 'express';
import type { Request, Response } from 'express';
import { stripeService, type Stripe } from '../../lib/stripe';
import { supabase } from '../../lib/supabase-admin';
import { log } from '../../lib/logger';

const router = Router();

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// ============================================================================
// WEBHOOK ENDPOINT
// ============================================================================

router.post('/stripe', async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'No signature found' });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripeService.constructWebhookEvent(
      req.body,
      signature,
      WEBHOOK_SECRET
    );
  } catch (error) {
    log.error('Webhook signature verification failed', error);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Log event
  log.info('Stripe webhook received', {
    type: event.type,
    id: event.id,
  });

  // Store webhook event
  await storeWebhookEvent(event);

  // Process event
  try {
    await processWebhookEvent(event);

    // Mark as processed
    await markWebhookProcessed(event.id);

    res.json({ received: true });
  } catch (error) {
    log.error('Webhook processing failed', { eventId: event.id, error });

    // Store error
    await storeWebhookError(event.id, error);

    // Still return 200 to prevent Stripe retries for unrecoverable errors
    res.json({ received: true, error: 'Processing failed' });
  }
});

// ============================================================================
// EVENT PROCESSORS
// ============================================================================

async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    // Checkout
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'checkout.session.expired':
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
      break;

    // Subscriptions
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.trial_will_end':
      await handleTrialWillEnd(event.data.object as Stripe.Subscription);
      break;

    // Invoices
    case 'invoice.created':
      await handleInvoiceCreated(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.updated':
      await handleInvoiceUpdated(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_action_required':
      await handleInvoiceActionRequired(event.data.object as Stripe.Invoice);
      break;

    // Payment Methods
    case 'payment_method.attached':
      await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
      break;
    case 'payment_method.detached':
      await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);
      break;

    // Customer
    case 'customer.updated':
      await handleCustomerUpdated(event.data.object as Stripe.Customer);
      break;
    case 'customer.deleted':
      await handleCustomerDeleted(event.data.object as Stripe.Customer);
      break;

    default:
      log.info('Unhandled webhook event type', { type: event.type });
  }
}

// ============================================================================
// CHECKOUT HANDLERS
// ============================================================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.client_reference_id || session.metadata?.userId;

  if (!userId) {
    throw new Error('No userId found in checkout session');
  }

  log.info('Checkout completed', {
    sessionId: session.id,
    userId,
    subscriptionId: session.subscription,
  });

  // Subscription will be created via subscription.created event
  // Just log for now
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session): Promise<void> {
  log.info('Checkout session expired', { sessionId: session.id });
}

// ============================================================================
// SUBSCRIPTION HANDLERS
// ============================================================================

async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata.userId;
  const organizationId = subscription.metadata.organizationId || null;

  if (!userId) {
    throw new Error('No userId in subscription metadata');
  }

  const planTier = subscription.metadata.planTier || 'pro';
  const priceId = subscription.items.data[0]?.price.id;
  const interval = subscription.items.data[0]?.price.recurring?.interval;

  // Create subscription record
  const { error } = await supabase.from('subscriptions').insert({
    user_id: userId,
    organization_id: organizationId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan_tier: planTier,
    billing_interval: interval,
    status: subscription.status,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000),
    cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    metadata: subscription.metadata,
  });

  if (error) {
    throw error;
  }

  log.info('Subscription created in database', {
    subscriptionId: subscription.id,
    userId,
    planTier,
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const priceId = subscription.items.data[0]?.price.id;
  const interval = subscription.items.data[0]?.price.recurring?.interval;

  const { error } = await supabase
    .from('subscriptions')
    .update({
      stripe_price_id: priceId,
      billing_interval: interval,
      status: subscription.status,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
      metadata: subscription.metadata,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    throw error;
  }

  log.info('Subscription updated in database', { subscriptionId: subscription.id });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      ended_at: new Date(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    throw error;
  }

  log.info('Subscription deleted', { subscriptionId: subscription.id });

  // TODO: Send cancellation email
}

async function handleTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select('user_id, trial_end')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!subscriptionData) {
    log.error('Subscription not found for trial end warning', { subscriptionId: subscription.id });
    return;
  }

  log.info('Trial will end soon', {
    subscriptionId: subscription.id,
    userId: subscriptionData.user_id,
    trialEnd: subscriptionData.trial_end,
  });

  // TODO: Send trial ending email
}

// ============================================================================
// INVOICE HANDLERS
// ============================================================================

async function handleInvoiceCreated(invoice: Stripe.Invoice): Promise<void> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (!subscription) {
    log.warn('No subscription found for invoice', { invoiceId: invoice.id });
    return;
  }

  const { error } = await supabase.from('invoices').insert({
    subscription_id: subscription.id,
    user_id: subscription.user_id,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: invoice.payment_intent as string | null,
    invoice_number: invoice.number,
    status: invoice.status,
    amount_due: invoice.amount_due,
    amount_paid: invoice.amount_paid,
    amount_remaining: invoice.amount_remaining,
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
    currency: invoice.currency,
    period_start: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
    period_end: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
    due_date: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
    invoice_pdf: invoice.invoice_pdf,
    hosted_invoice_url: invoice.hosted_invoice_url,
    description: invoice.description,
    metadata: invoice.metadata,
  });

  if (error) {
    throw error;
  }

  log.info('Invoice created in database', { invoiceId: invoice.id });
}

async function handleInvoiceUpdated(invoice: Stripe.Invoice): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .update({
      status: invoice.status,
      amount_paid: invoice.amount_paid,
      amount_remaining: invoice.amount_remaining,
      paid_at: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : null,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
    })
    .eq('stripe_invoice_id', invoice.id);

  if (error) {
    throw error;
  }

  log.info('Invoice updated in database', { invoiceId: invoice.id });
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      amount_paid: invoice.amount_paid,
      amount_remaining: 0,
      paid_at: new Date(),
    })
    .eq('stripe_invoice_id', invoice.id);

  if (error) {
    throw error;
  }

  log.info('Invoice marked as paid', { invoiceId: invoice.id });

  // TODO: Send payment confirmation email
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (!subscriptionData) {
    log.error('Subscription not found for failed payment', { invoiceId: invoice.id });
    return;
  }

  log.error('Invoice payment failed', {
    invoiceId: invoice.id,
    userId: subscriptionData.user_id,
    amount: invoice.amount_due,
  });

  // TODO: Send payment failure email
  // TODO: Update subscription status to past_due
}

async function handleInvoiceActionRequired(invoice: Stripe.Invoice): Promise<void> {
  log.info('Invoice requires payment action', { invoiceId: invoice.id });

  // TODO: Send action required email
}

// ============================================================================
// PAYMENT METHOD HANDLERS
// ============================================================================

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', paymentMethod.customer as string)
    .single();

  if (!subscription) {
    log.warn('No subscription found for payment method', { paymentMethodId: paymentMethod.id });
    return;
  }

  const { error } = await supabase.from('payment_methods').insert({
    user_id: subscription.user_id,
    stripe_payment_method_id: paymentMethod.id,
    stripe_customer_id: paymentMethod.customer as string,
    type: paymentMethod.type,
    card_brand: paymentMethod.card?.brand,
    card_last4: paymentMethod.card?.last4,
    card_exp_month: paymentMethod.card?.exp_month,
    card_exp_year: paymentMethod.card?.exp_year,
  });

  if (error && error.code !== '23505') {
    // Ignore duplicate key errors
    throw error;
  }

  log.info('Payment method attached', { paymentMethodId: paymentMethod.id });
}

async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('stripe_payment_method_id', paymentMethod.id);

  if (error) {
    throw error;
  }

  log.info('Payment method detached', { paymentMethodId: paymentMethod.id });
}

// ============================================================================
// CUSTOMER HANDLERS
// ============================================================================

async function handleCustomerUpdated(customer: Stripe.Customer): Promise<void> {
  log.info('Customer updated', { customerId: customer.id });
}

async function handleCustomerDeleted(customer: Stripe.Customer): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      ended_at: new Date(),
    })
    .eq('stripe_customer_id', customer.id);

  if (error) {
    throw error;
  }

  log.info('Customer deleted', { customerId: customer.id });
}

// ============================================================================
// HELPERS
// ============================================================================

async function storeWebhookEvent(event: Stripe.Event): Promise<void> {
  await supabase.from('stripe_webhook_events').insert({
    stripe_event_id: event.id,
    type: event.type,
    data: event.data as any,
  });
}

async function markWebhookProcessed(eventId: string): Promise<void> {
  await supabase
    .from('stripe_webhook_events')
    .update({
      processed: true,
      processed_at: new Date().toISOString(),
    })
    .eq('stripe_event_id', eventId);
}

async function storeWebhookError(eventId: string, error: any): Promise<void> {
  await supabase
    .from('stripe_webhook_events')
    .update({
      error: error.message || String(error),
    })
    .eq('stripe_event_id', eventId);
}

export default router;

// Subscription Management API
// Handles subscription creation, upgrades, downgrades, and cancellations

import { Router } from 'express';
import type { Request, Response } from 'express';
import { stripeService } from '../lib/stripe';
import { supabase } from '../lib/supabase-admin';
import { authenticate } from '../middleware/auth';
import { PLANS, getPlan, getStripePriceId, calculateProration, type PlanTier, type BillingInterval } from '@shared/pricing';
import { log } from '../lib/logger';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================================================
// GET CURRENT SUBSCRIPTION
// ============================================================================

router.get('/current', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabase.rpc('get_subscription_summary', {
      p_user_id: userId,
    });

    if (error) throw error;

    res.json(data || {});
  } catch (error) {
    log.error('Failed to get subscription', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// ============================================================================
// CREATE CHECKOUT SESSION
// ============================================================================

router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const email = req.user!.email!;
    const { planTier, interval, successUrl, cancelUrl } = req.body;

    if (!planTier || !interval || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const plan = getPlan(planTier);

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan tier' });
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession({
      userId,
      email,
      planTier,
      interval,
      successUrl,
      cancelUrl,
      trialDays: plan.trialDays,
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    log.error('Failed to create checkout session', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ============================================================================
// CREATE BILLING PORTAL SESSION
// ============================================================================

router.post('/portal', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { returnUrl } = req.body;

    if (!returnUrl) {
      return res.status(400).json({ error: 'returnUrl is required' });
    }

    // Get customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Create portal session
    const session = await stripeService.createPortalSession({
      customerId: subscription.stripe_customer_id,
      returnUrl,
    });

    res.json({
      url: session.url,
    });
  } catch (error) {
    log.error('Failed to create portal session', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// ============================================================================
// UPGRADE/DOWNGRADE SUBSCRIPTION
// ============================================================================

router.post('/change-plan', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { newPlanTier, newInterval } = req.body;

    if (!newPlanTier || !newInterval) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Get new price ID
    const newPriceId = getStripePriceId(newPlanTier, newInterval);

    if (!newPriceId) {
      return res.status(400).json({ error: 'Invalid plan configuration' });
    }

    // Calculate proration
    const currentPeriodEnd = new Date(subscription.current_period_end);
    const now = new Date();
    const daysRemaining = Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const prorationAmount = calculateProration(
      subscription.plan_tier,
      newPlanTier,
      newInterval,
      daysRemaining
    );

    // Update subscription in Stripe
    const updatedSubscription = await stripeService.changeSubscriptionPlan(
      subscription.stripe_subscription_id,
      newPriceId,
      true // with proration
    );

    // Update in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan_tier: newPlanTier,
        billing_interval: newInterval,
        stripe_price_id: newPriceId,
      })
      .eq('id', subscription.id);

    if (updateError) throw updateError;

    res.json({
      subscription: updatedSubscription,
      prorationAmount,
      message: 'Plan changed successfully',
    });
  } catch (error) {
    log.error('Failed to change plan', error);
    res.status(500).json({ error: 'Failed to change plan' });
  }
});

// ============================================================================
// CANCEL SUBSCRIPTION
// ============================================================================

router.post('/cancel', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { immediately = false } = req.body;

    // Get current subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel in Stripe
    const canceledSubscription = await stripeService.cancelSubscription(
      subscription.stripe_subscription_id,
      immediately
    );

    // Update in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at: immediately ? new Date().toISOString() : canceledSubscription.cancel_at ? new Date(canceledSubscription.cancel_at * 1000).toISOString() : null,
        canceled_at: new Date().toISOString(),
        status: immediately ? 'canceled' : 'active',
      })
      .eq('id', subscription.id);

    if (updateError) throw updateError;

    res.json({
      message: immediately
        ? 'Subscription canceled immediately'
        : 'Subscription will cancel at period end',
      canceledAt: immediately ? new Date() : canceledSubscription.cancel_at ? new Date(canceledSubscription.cancel_at * 1000) : null,
    });
  } catch (error) {
    log.error('Failed to cancel subscription', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// ============================================================================
// RESUME SUBSCRIPTION
// ============================================================================

router.post('/resume', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get subscription marked for cancellation
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .not('cancel_at', 'is', null)
      .single();

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found to resume' });
    }

    // Resume in Stripe
    await stripeService.resumeSubscription(subscription.stripe_subscription_id);

    // Update in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at: null,
      })
      .eq('id', subscription.id);

    if (updateError) throw updateError;

    res.json({
      message: 'Subscription resumed successfully',
    });
  } catch (error) {
    log.error('Failed to resume subscription', error);
    res.status(500).json({ error: 'Failed to resume subscription' });
  }
});

// ============================================================================
// GET INVOICES
// ============================================================================

router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json(invoices || []);
  } catch (error) {
    log.error('Failed to get invoices', error);
    res.status(500).json({ error: 'Failed to get invoices' });
  }
});

// ============================================================================
// GET UPCOMING INVOICE
// ============================================================================

router.get('/upcoming-invoice', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Get upcoming invoice from Stripe
    const upcomingInvoice = await stripeService.getUpcomingInvoice(
      subscription.stripe_customer_id
    );

    res.json(upcomingInvoice || null);
  } catch (error) {
    log.error('Failed to get upcoming invoice', error);
    res.status(500).json({ error: 'Failed to get upcoming invoice' });
  }
});

// ============================================================================
// GET USAGE
// ============================================================================

router.get('/usage', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get active subscription
    const { data: subscriptionData } = await supabase.rpc('get_active_subscription', {
      p_user_id: userId,
    });

    if (!subscriptionData || subscriptionData.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscription = subscriptionData[0];

    // Get usage records for current period
    const { data: usageRecords, error } = await supabase
      .from('usage_records')
      .select('*')
      .eq('subscription_id', subscription.subscription_id)
      .gte('period_start', subscription.current_period_start)
      .lte('period_end', subscription.current_period_end);

    if (error) throw error;

    // Aggregate by metric
    const usage = (usageRecords || []).reduce((acc, record) => {
      if (!acc[record.metric]) {
        acc[record.metric] = 0;
      }
      acc[record.metric] += record.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Get plan limits
    const plan = getPlan(subscription.plan_tier);

    res.json({
      current: usage,
      limits: {
        maxNotes: plan.features.maxNotes,
        maxStorageGB: plan.features.maxStorageGB,
        maxTeamMembers: plan.features.maxTeamMembers,
        rateLimit: plan.features.rateLimit,
      },
      period: {
        start: subscription.current_period_start,
        end: subscription.current_period_end,
      },
    });
  } catch (error) {
    log.error('Failed to get usage', error);
    res.status(500).json({ error: 'Failed to get usage' });
  }
});

// ============================================================================
// CHECK FEATURE ACCESS
// ============================================================================

router.post('/check-feature', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { feature } = req.body;

    if (!feature) {
      return res.status(400).json({ error: 'Feature name is required' });
    }

    // Get active subscription
    const { data: subscriptionData } = await supabase.rpc('get_active_subscription', {
      p_user_id: userId,
    });

    if (!subscriptionData || subscriptionData.length === 0) {
      // No subscription, use free plan
      const freePlan = getPlan('free');
      const hasAccess = freePlan.features[feature as keyof typeof freePlan.features];

      return res.json({
        hasAccess: !!hasAccess,
        plan: 'free',
      });
    }

    const subscription = subscriptionData[0];
    const plan = getPlan(subscription.plan_tier);
    const hasAccess = plan.features[feature as keyof typeof plan.features];

    res.json({
      hasAccess: !!hasAccess,
      plan: subscription.plan_tier,
    });
  } catch (error) {
    log.error('Failed to check feature access', error);
    res.status(500).json({ error: 'Failed to check feature access' });
  }
});

// ============================================================================
// RECORD USAGE (Internal use)
// ============================================================================

router.post('/record-usage', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { metric, quantity } = req.body;

    if (!metric || quantity === undefined) {
      return res.status(400).json({ error: 'Metric and quantity are required' });
    }

    await supabase.rpc('record_usage', {
      p_user_id: userId,
      p_metric: metric,
      p_quantity: quantity,
    });

    res.json({ success: true });
  } catch (error) {
    log.error('Failed to record usage', error);
    res.status(500).json({ error: 'Failed to record usage' });
  }
});

export default router;

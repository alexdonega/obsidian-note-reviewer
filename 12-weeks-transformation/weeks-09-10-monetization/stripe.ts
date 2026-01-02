// Stripe Integration Service
// Handles all Stripe API interactions

import Stripe from 'stripe';
import { log } from './logger';
import { PLANS, getStripePriceId, type PlanTier, type BillingInterval } from '@shared/pricing';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
  appInfo: {
    name: 'Obsidian Note Reviewer',
    version: '1.0.0',
    url: 'https://notereviewer.com',
  },
});

export interface CreateCheckoutSessionParams {
  userId: string;
  email: string;
  planTier: PlanTier;
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}

export interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  // ============================================================================
  // CUSTOMER MANAGEMENT
  // ============================================================================

  async createCustomer(params: {
    email: string;
    userId: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: params.email,
        name: params.name,
        metadata: {
          userId: params.userId,
          ...params.metadata,
        },
      });

      log.info('Stripe customer created', { customerId: customer.id, userId: params.userId });
      return customer;
    } catch (error) {
      log.error('Failed to create Stripe customer', error);
      throw error;
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);

      if (customer.deleted) {
        return null;
      }

      return customer as Stripe.Customer;
    } catch (error) {
      log.error('Failed to get Stripe customer', error);
      return null;
    }
  }

  async updateCustomer(
    customerId: string,
    params: Stripe.CustomerUpdateParams
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.update(customerId, params);
      log.info('Stripe customer updated', { customerId });
      return customer;
    } catch (error) {
      log.error('Failed to update Stripe customer', error);
      throw error;
    }
  }

  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await this.stripe.customers.del(customerId);
      log.info('Stripe customer deleted', { customerId });
    } catch (error) {
      log.error('Failed to delete Stripe customer', error);
      throw error;
    }
  }

  // ============================================================================
  // CHECKOUT SESSIONS
  // ============================================================================

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
    try {
      const priceId = getStripePriceId(params.planTier, params.interval);

      if (!priceId) {
        throw new Error(`No price ID found for ${params.planTier} ${params.interval}`);
      }

      const session = await this.stripe.checkout.sessions.create({
        customer_email: params.email,
        client_reference_id: params.userId,
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        subscription_data: {
          trial_period_days: params.trialDays,
          metadata: {
            userId: params.userId,
            planTier: params.planTier,
            ...params.metadata,
          },
        },
        metadata: {
          userId: params.userId,
          planTier: params.planTier,
          ...params.metadata,
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        tax_id_collection: {
          enabled: true,
        },
      });

      log.info('Checkout session created', {
        sessionId: session.id,
        userId: params.userId,
        planTier: params.planTier,
      });

      return session;
    } catch (error) {
      log.error('Failed to create checkout session', error);
      throw error;
    }
  }

  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      log.error('Failed to get checkout session', error);
      return null;
    }
  }

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================

  async createSubscription(params: CreateSubscriptionParams): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: params.customerId,
        items: [{ price: params.priceId }],
        trial_period_days: params.trialDays,
        metadata: params.metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      log.info('Subscription created', { subscriptionId: subscription.id });
      return subscription;
    } catch (error) {
      log.error('Failed to create subscription', error);
      throw error;
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      log.error('Failed to get subscription', error);
      return null;
    }
  }

  async updateSubscription(
    subscriptionId: string,
    params: Stripe.SubscriptionUpdateParams
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, params);
      log.info('Subscription updated', { subscriptionId });
      return subscription;
    } catch (error) {
      log.error('Failed to update subscription', error);
      throw error;
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    immediately = false
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately,
      });

      if (immediately) {
        await this.stripe.subscriptions.cancel(subscriptionId);
      }

      log.info('Subscription cancelled', { subscriptionId, immediately });
      return subscription;
    } catch (error) {
      log.error('Failed to cancel subscription', error);
      throw error;
    }
  }

  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      log.info('Subscription resumed', { subscriptionId });
      return subscription;
    } catch (error) {
      log.error('Failed to resume subscription', error);
      throw error;
    }
  }

  // Change subscription plan
  async changeSubscriptionPlan(
    subscriptionId: string,
    newPriceId: string,
    proration: boolean = true
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: proration ? 'create_prorations' : 'none',
      });

      log.info('Subscription plan changed', { subscriptionId, newPriceId });
      return updatedSubscription;
    } catch (error) {
      log.error('Failed to change subscription plan', error);
      throw error;
    }
  }

  // ============================================================================
  // BILLING PORTAL
  // ============================================================================

  async createPortalSession(params: CreatePortalSessionParams): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: params.customerId,
        return_url: params.returnUrl,
      });

      log.info('Portal session created', { customerId: params.customerId });
      return session;
    } catch (error) {
      log.error('Failed to create portal session', error);
      throw error;
    }
  }

  // ============================================================================
  // INVOICES
  // ============================================================================

  async getUpcomingInvoice(customerId: string): Promise<Stripe.Invoice | null> {
    try {
      return await this.stripe.invoices.retrieveUpcoming({
        customer: customerId,
      });
    } catch (error) {
      log.error('Failed to get upcoming invoice', error);
      return null;
    }
  }

  async listInvoices(
    customerId: string,
    limit: number = 10
  ): Promise<Stripe.Invoice[]> {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
        limit,
      });

      return invoices.data;
    } catch (error) {
      log.error('Failed to list invoices', error);
      return [];
    }
  }

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice | null> {
    try {
      return await this.stripe.invoices.retrieve(invoiceId);
    } catch (error) {
      log.error('Failed to get invoice', error);
      return null;
    }
  }

  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================

  async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      log.error('Failed to list payment methods', error);
      return [];
    }
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await this.stripe.paymentMethods.detach(paymentMethodId);
      log.info('Payment method detached', { paymentMethodId });
    } catch (error) {
      log.error('Failed to detach payment method', error);
      throw error;
    }
  }

  // ============================================================================
  // USAGE & METERING
  // ============================================================================

  async createUsageRecord(
    subscriptionItemId: string,
    quantity: number,
    timestamp?: number
  ): Promise<Stripe.SubscriptionItem.UsageRecord> {
    try {
      const usageRecord = await this.stripe.subscriptionItems.createUsageRecord(
        subscriptionItemId,
        {
          quantity,
          timestamp: timestamp || Math.floor(Date.now() / 1000),
          action: 'increment',
        }
      );

      log.info('Usage record created', { subscriptionItemId, quantity });
      return usageRecord;
    } catch (error) {
      log.error('Failed to create usage record', error);
      throw error;
    }
  }

  async listUsageRecordSummaries(
    subscriptionItemId: string
  ): Promise<Stripe.SubscriptionItem.UsageRecordSummary[]> {
    try {
      const summaries = await this.stripe.subscriptionItems.listUsageRecordSummaries(
        subscriptionItemId
      );

      return summaries.data;
    } catch (error) {
      log.error('Failed to list usage record summaries', error);
      return [];
    }
  }

  // ============================================================================
  // WEBHOOKS
  // ============================================================================

  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      log.error('Failed to construct webhook event', error);
      throw error;
    }
  }

  // ============================================================================
  // PRODUCTS & PRICES
  // ============================================================================

  async listProducts(): Promise<Stripe.Product[]> {
    try {
      const products = await this.stripe.products.list({
        active: true,
      });

      return products.data;
    } catch (error) {
      log.error('Failed to list products', error);
      return [];
    }
  }

  async listPrices(productId?: string): Promise<Stripe.Price[]> {
    try {
      const prices = await this.stripe.prices.list({
        product: productId,
        active: true,
      });

      return prices.data;
    } catch (error) {
      log.error('Failed to list prices', error);
      return [];
    }
  }

  // ============================================================================
  // PROMOTIONAL CODES
  // ============================================================================

  async createPromotionCode(params: {
    couponId: string;
    code: string;
    maxRedemptions?: number;
    expiresAt?: number;
  }): Promise<Stripe.PromotionCode> {
    try {
      const promotionCode = await this.stripe.promotionCodes.create({
        coupon: params.couponId,
        code: params.code,
        max_redemptions: params.maxRedemptions,
        expires_at: params.expiresAt,
      });

      log.info('Promotion code created', { code: params.code });
      return promotionCode;
    } catch (error) {
      log.error('Failed to create promotion code', error);
      throw error;
    }
  }

  async createCoupon(params: {
    percentOff?: number;
    amountOff?: number;
    currency?: string;
    duration: 'once' | 'repeating' | 'forever';
    durationInMonths?: number;
  }): Promise<Stripe.Coupon> {
    try {
      const coupon = await this.stripe.coupons.create(params);
      log.info('Coupon created', { couponId: coupon.id });
      return coupon;
    } catch (error) {
      log.error('Failed to create coupon', error);
      throw error;
    }
  }

  // ============================================================================
  // REFUNDS
  // ============================================================================

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason,
      });

      log.info('Refund created', { refundId: refund.id, amount });
      return refund;
    } catch (error) {
      log.error('Failed to create refund', error);
      throw error;
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();

// Export Stripe instance for advanced usage
export { stripe };

// Export types
export type { Stripe };

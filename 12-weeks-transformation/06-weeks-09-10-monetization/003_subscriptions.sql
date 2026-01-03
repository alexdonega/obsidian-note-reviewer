-- Subscription & Billing Tables
-- Manages user subscriptions, payments, and usage tracking

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused'
);

CREATE TYPE plan_tier AS ENUM ('free', 'pro', 'enterprise');

CREATE TYPE billing_interval AS ENUM ('month', 'year');

CREATE TYPE invoice_status AS ENUM (
  'draft',
  'open',
  'paid',
  'uncollectible',
  'void'
);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User & Organization
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,

  -- Stripe IDs
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,

  -- Plan Details
  plan_tier plan_tier NOT NULL DEFAULT 'free',
  billing_interval billing_interval,

  -- Status
  status subscription_status NOT NULL DEFAULT 'active',

  -- Dates
  trial_start timestamptz,
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  ended_at timestamptz,

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT valid_dates CHECK (
    (trial_start IS NULL OR trial_end IS NULL OR trial_start < trial_end) AND
    (current_period_start IS NULL OR current_period_end IS NULL OR current_period_start < current_period_end)
  )
);

-- Indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan_tier);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe
  stripe_invoice_id text UNIQUE NOT NULL,
  stripe_payment_intent_id text,

  -- Invoice Details
  invoice_number text,
  status invoice_status NOT NULL DEFAULT 'draft',

  -- Amounts (in cents)
  amount_due bigint NOT NULL DEFAULT 0,
  amount_paid bigint NOT NULL DEFAULT 0,
  amount_remaining bigint NOT NULL DEFAULT 0,
  subtotal bigint NOT NULL DEFAULT 0,
  tax bigint,
  total bigint NOT NULL DEFAULT 0,

  -- Currency
  currency text NOT NULL DEFAULT 'usd',

  -- Dates
  period_start timestamptz,
  period_end timestamptz,
  due_date timestamptz,
  paid_at timestamptz,

  -- PDF & URLs
  invoice_pdf text,
  hosted_invoice_url text,

  -- Metadata
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- USAGE TRACKING TABLE
-- ============================================================================

CREATE TABLE usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,

  -- Usage Type
  metric text NOT NULL, -- 'notes', 'storage', 'api_requests', 'ai_requests', etc.

  -- Quantity
  quantity bigint NOT NULL DEFAULT 0,

  -- Aggregation period
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT valid_period CHECK (period_start < period_end),
  CONSTRAINT valid_quantity CHECK (quantity >= 0)
);

-- Indexes
CREATE INDEX idx_usage_subscription ON usage_records(subscription_id);
CREATE INDEX idx_usage_user ON usage_records(user_id);
CREATE INDEX idx_usage_org ON usage_records(organization_id);
CREATE INDEX idx_usage_metric ON usage_records(metric);
CREATE INDEX idx_usage_period ON usage_records(period_start, period_end);

-- RLS
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_records FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- PAYMENT METHODS TABLE
-- ============================================================================

CREATE TABLE payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe
  stripe_payment_method_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,

  -- Card Details (for display)
  type text NOT NULL DEFAULT 'card',
  card_brand text,
  card_last4 text,
  card_exp_month integer,
  card_exp_year integer,

  -- Status
  is_default boolean DEFAULT false,

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_stripe ON payment_methods(stripe_payment_method_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(user_id, is_default) WHERE is_default = true;

-- RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- WEBHOOK EVENTS TABLE (for debugging)
-- ============================================================================

CREATE TABLE stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Stripe Event
  stripe_event_id text UNIQUE NOT NULL,
  type text NOT NULL,

  -- Status
  processed boolean DEFAULT false,
  processed_at timestamptz,
  error text,

  -- Data
  data jsonb NOT NULL,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_webhook_events_type ON stripe_webhook_events(type);
CREATE INDEX idx_webhook_events_processed ON stripe_webhook_events(processed);
CREATE INDEX idx_webhook_events_created ON stripe_webhook_events(created_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Get active subscription for user
CREATE OR REPLACE FUNCTION get_active_subscription(p_user_id uuid)
RETURNS TABLE (
  subscription_id uuid,
  plan_tier plan_tier,
  status subscription_status,
  trial_end timestamptz,
  current_period_end timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.plan_tier,
    s.status,
    s.trial_end,
    s.current_period_end
  FROM subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status IN ('trialing', 'active')
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get usage for current period
CREATE OR REPLACE FUNCTION get_current_usage(
  p_subscription_id uuid,
  p_metric text
)
RETURNS bigint AS $$
DECLARE
  v_total bigint;
  v_period_start timestamptz;
  v_period_end timestamptz;
BEGIN
  -- Get current period from subscription
  SELECT current_period_start, current_period_end
  INTO v_period_start, v_period_end
  FROM subscriptions
  WHERE id = p_subscription_id;

  -- Sum usage for current period
  SELECT COALESCE(SUM(quantity), 0)
  INTO v_total
  FROM usage_records
  WHERE subscription_id = p_subscription_id
    AND metric = p_metric
    AND period_start >= v_period_start
    AND period_end <= v_period_end;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has exceeded limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id uuid,
  p_metric text,
  p_limit bigint
)
RETURNS boolean AS $$
DECLARE
  v_subscription_id uuid;
  v_current_usage bigint;
BEGIN
  -- Get active subscription
  SELECT subscription_id
  INTO v_subscription_id
  FROM get_active_subscription(p_user_id);

  IF v_subscription_id IS NULL THEN
    RETURN false; -- No active subscription, deny
  END IF;

  -- Get current usage
  v_current_usage := get_current_usage(v_subscription_id, p_metric);

  -- Check if within limit (-1 means unlimited)
  RETURN p_limit = -1 OR v_current_usage < p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record usage
CREATE OR REPLACE FUNCTION record_usage(
  p_user_id uuid,
  p_metric text,
  p_quantity bigint
)
RETURNS void AS $$
DECLARE
  v_subscription_id uuid;
  v_organization_id uuid;
  v_period_start timestamptz;
  v_period_end timestamptz;
BEGIN
  -- Get active subscription
  SELECT subscription_id
  INTO v_subscription_id
  FROM get_active_subscription(p_user_id);

  IF v_subscription_id IS NULL THEN
    RAISE EXCEPTION 'No active subscription found for user';
  END IF;

  -- Get subscription details
  SELECT
    organization_id,
    current_period_start,
    current_period_end
  INTO v_organization_id, v_period_start, v_period_end
  FROM subscriptions
  WHERE id = v_subscription_id;

  -- Insert usage record
  INSERT INTO usage_records (
    subscription_id,
    user_id,
    organization_id,
    metric,
    quantity,
    period_start,
    period_end
  ) VALUES (
    v_subscription_id,
    p_user_id,
    v_organization_id,
    p_metric,
    p_quantity,
    v_period_start,
    v_period_end
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get subscription summary
CREATE OR REPLACE FUNCTION get_subscription_summary(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'subscription', row_to_json(s.*),
    'usage', (
      SELECT jsonb_object_agg(metric, total_quantity)
      FROM (
        SELECT
          metric,
          SUM(quantity) as total_quantity
        FROM usage_records
        WHERE subscription_id = s.id
          AND period_start >= s.current_period_start
          AND period_end <= s.current_period_end
        GROUP BY metric
      ) usage_agg
    ),
    'upcoming_invoice', (
      SELECT row_to_json(i.*)
      FROM invoices i
      WHERE i.subscription_id = s.id
        AND i.status = 'open'
      ORDER BY i.due_date ASC
      LIMIT 1
    )
  )
  INTO v_result
  FROM subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status IN ('trialing', 'active')
  ORDER BY s.created_at DESC
  LIMIT 1;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create webhook event types for reference
COMMENT ON TABLE stripe_webhook_events IS '
Stripe Webhook Events:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- customer.subscription.trial_will_end
- invoice.created
- invoice.updated
- invoice.paid
- invoice.payment_failed
- payment_method.attached
- payment_method.detached
- checkout.session.completed
- checkout.session.expired
';

-- Grant permissions
GRANT SELECT ON subscriptions TO authenticated;
GRANT SELECT ON invoices TO authenticated;
GRANT SELECT ON usage_records TO authenticated;
GRANT SELECT ON payment_methods TO authenticated;

GRANT EXECUTE ON FUNCTION get_active_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_usage TO authenticated;
GRANT EXECUTE ON FUNCTION check_usage_limit TO authenticated;
GRANT EXECUTE ON FUNCTION record_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_summary TO authenticated;

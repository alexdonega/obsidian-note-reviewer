# Weeks 9-10: Monetization

## Objetivos
- Integração completa com Stripe
- 3 planos (Free, Pro, Enterprise)
- Checkout, billing portal, invoices
- Webhooks e sincronização automática
- Usage metering e proration

## Arquivos

### Pricing
- **pricing.ts** - Configuração central de pricing
  - 3 plans: Free ($0), Pro ($12/mo), Enterprise (custom)
  - Features, limits, trials

### Stripe Integration
- **stripe.ts** - Stripe service (700 linhas)
  - Checkout sessions
  - Subscriptions CRUD
  - Billing portal
  - Webhooks
  - Usage metering
  - Proration

### API Routes
- **subscriptions.ts** - API de subscriptions (12 endpoints)
- **webhooks/** - Stripe webhooks
  - Handlers para 20+ eventos

### Database
- **003_subscriptions.sql** - Schema PostgreSQL
  - 5 tables: subscriptions, invoices, usage_records, payment_methods, webhook_events
  - 6 enums: status, plan_tier, billing_interval
  - 8 functions: get_subscription_summary, record_usage, etc.

### UI
- **Pricing.tsx** - Página de pricing (450 linhas)
- **BillingSettings.tsx** - Dashboard de billing (350 linhas)

## Modelo de Negócio

| Plan | Price | Trial | Features |
|------|-------|-------|----------|
| Free | $0 | - | 100 notes, 1GB, basic |
| Pro | $12/mo | 14 days | 10K notes, 50GB, AI, collaboration |
| Enterprise | Custom | 30 days | Unlimited, SSO, SLA, support |

## Resultados
- ✅ Stripe live mode ready
- ✅ Checkout completo
- ✅ Billing portal funcional
- ✅ Webhooks sincronizados
- ✅ Usage metering implementado
- ✅ Trial de 14/30 dias

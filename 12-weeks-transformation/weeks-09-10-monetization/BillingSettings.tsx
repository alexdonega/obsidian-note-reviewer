// Billing & Subscription Settings
// Manage subscription, view invoices, and usage

import { useEffect, useState } from 'react';
import {
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { PLANS, type PlanTier } from '@shared/pricing';
import { log } from '../lib/logger';

interface Subscription {
  id: string;
  plan_tier: PlanTier;
  status: string;
  current_period_end: string;
  cancel_at: string | null;
  trial_end: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
}

interface Usage {
  current: Record<string, number>;
  limits: {
    maxNotes: number;
    maxStorageGB: number;
    maxTeamMembers: number;
  };
  period: {
    start: string;
    end: string;
  };
}

export default function BillingSettings() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load subscription
      const subRes = await fetch('/api/subscriptions/current');
      const subData = await subRes.json();
      setSubscription(subData.subscription || null);

      // Load invoices
      const invRes = await fetch('/api/subscriptions/invoices?limit=10');
      const invData = await invRes.json();
      setInvoices(invData || []);

      // Load usage
      const usageRes = await fetch('/api/subscriptions/usage');
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
      }
    } catch (error) {
      log.error('Failed to load billing data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/subscriptions/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      log.error('Failed to open billing portal', error);
      alert('Failed to open billing portal');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ immediately: false }),
      });

      alert('Subscription cancelled. You will have access until the end of your billing period.');
      loadData();
    } catch (error) {
      log.error('Failed to cancel subscription', error);
      alert('Failed to cancel subscription');
    }
  };

  const handleResumeSubscription = async () => {
    try {
      await fetch('/api/subscriptions/resume', { method: 'POST' });
      alert('Subscription resumed successfully!');
      loadData();
    } catch (error) {
      log.error('Failed to resume subscription', error);
      alert('Failed to resume subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  const plan = subscription ? PLANS[subscription.plan_tier] : PLANS.free;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & Subscription</h1>

      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
            <p className="mt-1 text-3xl font-bold text-indigo-600">{plan.name}</p>
            <p className="mt-1 text-sm text-gray-600">{plan.description}</p>

            {subscription && (
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>
                  Status:{' '}
                  <span className={`font-medium ${subscription.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {subscription.status}
                  </span>
                </p>
                {subscription.trial_end && new Date(subscription.trial_end) > new Date() && (
                  <p>
                    Trial ends: {new Date(subscription.trial_end).toLocaleDateString()}
                  </p>
                )}
                {subscription.current_period_end && (
                  <p>
                    {subscription.cancel_at ? 'Access until' : 'Renews on'}:{' '}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
                {subscription.cancel_at && (
                  <p className="text-yellow-600 font-medium">
                    Subscription will cancel on {new Date(subscription.cancel_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={handleManageBilling}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
            >
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Manage Billing
            </button>

            {subscription && !subscription.cancel_at && subscription.plan_tier !== 'free' && (
              <button
                onClick={handleCancelSubscription}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel Subscription
              </button>
            )}

            {subscription?.cancel_at && (
              <button
                onClick={handleResumeSubscription}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-500"
              >
                Resume Subscription
              </button>
            )}

            {(!subscription || subscription.plan_tier === 'free') && (
              <a
                href="/pricing"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
              >
                Upgrade Plan
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      {usage && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-indigo-600" />
            Current Usage
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Notes</p>
              <div className="mt-2">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900">
                    {usage.current.notes || 0}
                  </span>
                  {usage.limits.maxNotes !== -1 && (
                    <span className="ml-2 text-sm text-gray-500">
                      / {usage.limits.maxNotes.toLocaleString()}
                    </span>
                  )}
                </div>
                {usage.limits.maxNotes !== -1 && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((usage.current.notes || 0) / usage.limits.maxNotes) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Storage</p>
              <div className="mt-2">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900">
                    {((usage.current.storage_bytes || 0) / 1024 / 1024 / 1024).toFixed(2)}
                  </span>
                  {usage.limits.maxStorageGB !== -1 && (
                    <span className="ml-2 text-sm text-gray-500">
                      / {usage.limits.maxStorageGB} GB
                    </span>
                  )}
                </div>
                {usage.limits.maxStorageGB !== -1 && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (((usage.current.storage_bytes || 0) / 1024 / 1024 / 1024) / usage.limits.maxStorageGB) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <div className="mt-2">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900">
                    {usage.current.team_members || 1}
                  </span>
                  {usage.limits.maxTeamMembers !== -1 && (
                    <span className="ml-2 text-sm text-gray-500">
                      / {usage.limits.maxTeamMembers}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Billing period: {new Date(usage.period.start).toLocaleDateString()} -{' '}
            {new Date(usage.period.end).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Invoices */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <DocumentTextIcon className="h-6 w-6 mr-2 text-indigo-600" />
          Invoices
        </h2>

        {invoices.length === 0 ? (
          <p className="text-sm text-gray-500">No invoices yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Invoice
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {invoice.invoice_number || invoice.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ${(invoice.total / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {invoice.invoice_pdf && (
                        <a
                          href={invoice.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          Download PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

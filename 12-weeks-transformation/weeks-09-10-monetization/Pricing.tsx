// Pricing Page Component
// Beautiful pricing cards with feature comparison

import { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PLANS, FEATURE_COMPARISON, type PlanTier, type BillingInterval } from '@shared/pricing';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { log } from '../lib/logger';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interval, setInterval] = useState<BillingInterval>('month');

  const handleSelectPlan = async (planTier: PlanTier) => {
    if (planTier === 'free') {
      // Free plan - just sign up
      navigate('/signup');
      return;
    }

    if (!user) {
      // Need to sign in first
      navigate('/login', {
        state: { from: `/pricing?plan=${planTier}&interval=${interval}` },
      });
      return;
    }

    try {
      // Create checkout session
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planTier,
          interval,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      log.error('Failed to create checkout session', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for you. All plans include a free trial.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${interval === 'month' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              type="button"
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
                ${interval === 'year' ? 'bg-indigo-600' : 'bg-gray-200'}
              `}
              onClick={() => setInterval(interval === 'month' ? 'year' : 'month')}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                  transition duration-200 ease-in-out
                  ${interval === 'year' ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
            <span className={`text-sm font-medium ${interval === 'year' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-1 inline-block px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                Save 17%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {(Object.keys(PLANS) as PlanTier[]).map((tier) => {
            const plan = PLANS[tier];
            const price = interval === 'month' ? plan.price.monthly : plan.price.yearlyMonthly;
            const billedPrice = interval === 'month' ? plan.price.monthly : plan.price.yearly;

            return (
              <div
                key={tier}
                className={`
                  relative flex flex-col rounded-2xl shadow-xl
                  ${plan.popular
                    ? 'border-2 border-indigo-600 bg-white ring-2 ring-indigo-600'
                    : 'border border-gray-200 bg-white'
                  }
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                    <span className="inline-block px-4 py-1 text-sm font-semibold text-white bg-indigo-600 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{plan.description}</p>

                  <div className="mt-8">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-900">
                        ${price}
                      </span>
                      {price > 0 && (
                        <span className="ml-2 text-base text-gray-500">/month</span>
                      )}
                    </div>
                    {interval === 'year' && billedPrice > 0 && (
                      <p className="mt-1 text-sm text-gray-500">
                        Billed ${billedPrice}/year
                      </p>
                    )}
                  </div>

                  {plan.trialDays > 0 && (
                    <p className="mt-2 text-sm text-indigo-600 font-medium">
                      {plan.trialDays}-day free trial
                    </p>
                  )}

                  <button
                    onClick={() => handleSelectPlan(tier)}
                    className={`
                      mt-8 w-full rounded-lg px-4 py-3 text-sm font-semibold shadow-sm
                      transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                      ${plan.popular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
                        : 'bg-gray-900 text-white hover:bg-gray-800 focus-visible:outline-gray-900'
                      }
                    `}
                  >
                    {tier === 'free' ? 'Get Started' : `Start ${plan.trialDays}-day trial`}
                  </button>
                </div>

                {/* Features */}
                <div className="border-t border-gray-200 p-8 pt-6">
                  <p className="text-sm font-semibold text-gray-900">What's included:</p>
                  <ul className="mt-4 space-y-3">
                    {/* Key features */}
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <span className="ml-3 text-sm text-gray-700">
                        {plan.features.maxNotes === -1 ? 'Unlimited' : plan.features.maxNotes.toLocaleString()} notes
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <span className="ml-3 text-sm text-gray-700">
                        {plan.features.maxStorageGB === -1 ? 'Unlimited' : `${plan.features.maxStorageGB} GB`} storage
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <span className="ml-3 text-sm text-gray-700">
                        {plan.features.maxTeamMembers === -1 ? 'Unlimited' : plan.features.maxTeamMembers} team {plan.features.maxTeamMembers === 1 ? 'member' : 'members'}
                      </span>
                    </li>
                    {plan.features.advancedSearch && (
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        <span className="ml-3 text-sm text-gray-700">Advanced search</span>
                      </li>
                    )}
                    {plan.features.realtimeCollaboration && (
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        <span className="ml-3 text-sm text-gray-700">Real-time collaboration</span>
                      </li>
                    )}
                    {plan.features.aiSummaries && (
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        <span className="ml-3 text-sm text-gray-700">AI summaries & suggestions</span>
                      </li>
                    )}
                    {plan.features.sso && (
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        <span className="ml-3 text-sm text-gray-700">SSO & SAML</span>
                      </li>
                    )}
                    {plan.features.prioritySupport && (
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        <span className="ml-3 text-sm text-gray-700">Priority support</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Compare all features
          </h2>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Features
                  </th>
                  {(Object.keys(PLANS) as PlanTier[]).map((tier) => (
                    <th key={tier} className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      {PLANS[tier].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {FEATURE_COMPARISON.map((category, categoryIdx) => (
                  <>
                    <tr key={`category-${categoryIdx}`} className="bg-gray-50">
                      <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-900">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature, featureIdx) => (
                      <tr key={`feature-${categoryIdx}-${featureIdx}`}>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {feature.name}
                          {feature.tooltip && (
                            <span className="ml-2 text-gray-400" title={feature.tooltip}>
                              ⓘ
                            </span>
                          )}
                        </td>
                        {(['free', 'pro', 'enterprise'] as PlanTier[]).map((tier) => (
                          <td key={tier} className="px-6 py-4 text-center">
                            {typeof feature[tier] === 'boolean' ? (
                              feature[tier] ? (
                                <CheckIcon className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <XMarkIcon className="h-5 w-5 text-gray-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-gray-700">{feature[tier]}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently asked questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan later?</h3>
              <p className="text-sm text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes are prorated.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How does the free trial work?</h3>
              <p className="text-sm text-gray-600">
                Start your trial with no credit card required. You'll only be charged after the trial ends.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-gray-600">
                We accept all major credit cards, debit cards, and ACH transfers for Enterprise plans.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-gray-600">
                Absolutely. Cancel anytime, no questions asked. You'll have access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of users organizing their notes with ease.
          </p>
          <button
            onClick={() => handleSelectPlan('pro')}
            className="inline-flex items-center px-8 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-500 transition-colors"
          >
            Start your free trial
          </button>
        </div>
      </div>
    </div>
  );
}

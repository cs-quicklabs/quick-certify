'use client';

/**
 * Billing Information Page
 *
 * Placeholder for billing plan management and invoices.
 * Based on design: https://designs.quicklabs.in/quick-certify/settings/account/billing-information
 */
export default function BillingInformationPage() {
  return (
    <div>
      <h1 className="form-title">Billing Information</h1>
      <p className="form-subtitle">Manage your billing plan and invoices</p>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <h3 className="mt-4 text-sm font-medium text-gray-900">No billing information</h3>
        <p className="mt-2 text-sm text-gray-500">
          Billing features will be available soon. Stay tuned!
        </p>
      </div>
    </div>
  );
}


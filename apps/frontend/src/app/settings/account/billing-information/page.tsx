'use client';

import { CreditCard } from "lucide-react";

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
        <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-sm font-medium text-gray-900">No billing information</h3>
        <p className="mt-2 text-sm text-gray-500">
          Billing features will be available soon. Stay tuned!
        </p>
      </div>
    </div>
  );
}

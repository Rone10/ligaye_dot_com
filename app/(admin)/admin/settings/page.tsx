import { Metadata } from 'next';
import { PricingForm } from './_components/PricingForm';
import { PricingHistory } from './_components/PricingHistory';
import { getActivePricing, getAllPricingHistory } from './_queries';

export const metadata: Metadata = {
  title: 'Settings - Admin Dashboard',
  description: 'Manage system settings and configuration',
};

export default async function AdminSettingsPage() {
  const [activePricing, pricingHistory] = await Promise.all([
    getActivePricing(),
    getAllPricingHistory(),
  ]);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage system configuration and pricing
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <PricingForm currentPricing={activePricing} />
        </div>
        <div>
          <PricingHistory pricingHistory={pricingHistory} />
        </div>
      </div>
    </div>
  );
}
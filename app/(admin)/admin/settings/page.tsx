import { Metadata } from 'next';
import { PricingForm } from './_components/PricingForm';
import { PricingHistory } from './_components/PricingHistory';
import { FreePostingForm } from './_components/FreePostingForm';
import { CachePurgeCard } from './_components/CachePurgeCard';
import { getActivePricing, getAllPricingHistory, getCurrentFreePostingConfig } from './_queries';

export const metadata: Metadata = {
  title: 'Settings - Admin Dashboard',
  description: 'Manage system settings and configuration',
};

// Force dynamic rendering to avoid database calls during build
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const [activePricing, pricingHistory, freePostingConfig] = await Promise.all([
    getActivePricing(),
    getAllPricingHistory(),
    getCurrentFreePostingConfig(),
  ]);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage system configuration, pricing, and campaigns
        </p>
      </div>

      <div className="space-y-8">
        {/* Cache Management Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Maintenance</h2>
          <CachePurgeCard />
        </div>

        {/* Campaign Settings Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Campaign Settings</h2>
          <FreePostingForm currentConfig={freePostingConfig} />
        </div>

        {/* Pricing Settings Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Pricing Settings</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <PricingForm currentPricing={activePricing} />
            </div>
            <div>
              <PricingHistory pricingHistory={pricingHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
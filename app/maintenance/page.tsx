import { Construction, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Maintenance | Ligaye',
  description: 'Site under maintenance',
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--bg-gradient-from))] to-[hsl(var(--bg-gradient-to))] flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Construction className="h-20 w-20 text-primary-blue" />
              <Clock className="h-8 w-8 text-primary-orange absolute -bottom-1 -right-1 bg-background rounded-full p-1" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-theme-dark mb-3">
            Under Maintenance
          </h1>

          <p className="text-theme-gray-dark text-lg mb-4">
            We&apos;re currently performing scheduled maintenance to improve your experience.
          </p>

          <p className="text-theme-gray text-sm">
            We&apos;ll be back shortly. Thank you for your patience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

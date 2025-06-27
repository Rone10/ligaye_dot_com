'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { updatePricing } from '../_actions';
import { bututsToDalasi, formatPrice } from '@/lib/utils/pricing-client';
import type { PricingConfig } from '@/lib/db/schema';

interface PricingFormProps {
  currentPricing: PricingConfig | null;
}

export function PricingForm({ currentPricing }: PricingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [price, setPrice] = useState(
    currentPricing ? bututsToDalasi(currentPricing.pricePerMonth).toString() : '3500'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    startTransition(async () => {
      const result = await updatePricing(priceValue);
      
      if (result.success) {
        toast.success('Pricing updated successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update pricing');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Posting Pricing</CardTitle>
        <CardDescription>
          Set the monthly price for job postings in Gambian Dalasi (GMD)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price per Month (GMD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                D
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-8"
                placeholder="3500"
                disabled={isPending}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This price will be charged for each month of job posting duration
            </p>
          </div>

          {currentPricing && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Current Pricing</p>
              <p className="text-2xl font-bold">
                {formatPrice(currentPricing.pricePerMonth)} per month
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date(currentPricing.updatedAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Pricing
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
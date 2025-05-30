'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { initiateDocumentPurchaseAction } from '../_actions';

const purchaseSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
});

type PurchaseSchemaType = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
  tender: {
    id: string;
    title: string;
    documentPrice: number;
    documentCurrency: string;
  };
}

export function PurchaseForm({ tender }: PurchaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PurchaseSchemaType>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: PurchaseSchemaType) => {
    setIsSubmitting(true);

    try {
      const result = await initiateDocumentPurchaseAction({
        tenderId: tender.id,
        purchaserInfo: data,
      });

      if (result.success && result.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.checkoutUrl;
      } else {
        toast.error(result.error || 'Failed to initiate purchase');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Purchase error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchaser Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-theme-light rounded-lg p-lg">
              <div className="flex justify-between items-center mb-md">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-primary-blue">
                  {tender.documentCurrency} {tender.documentPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-theme-gray-dark">
                You will be redirected to Stripe to complete your payment securely.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 
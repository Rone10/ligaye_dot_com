'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils/pricing-client';
import type { PricingConfig } from '@/lib/db/schema';

interface PricingHistoryProps {
  pricingHistory: PricingConfig[];
}

export function PricingHistory({ pricingHistory }: PricingHistoryProps) {
  if (pricingHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pricing History</CardTitle>
          <CardDescription>No pricing history available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing History</CardTitle>
        <CardDescription>
          View all historical pricing changes for job postings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Price per Month</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricingHistory.map((config) => (
              <TableRow key={config.id}>
                <TableCell className="font-medium">
                  {formatPrice(config.pricePerMonth)}
                </TableCell>
                <TableCell>{config.currency}</TableCell>
                <TableCell>
                  <Badge variant={config.active ? 'default' : 'secondary'}>
                    {config.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(config.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
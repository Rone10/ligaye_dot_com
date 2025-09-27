'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { updateFreePostingSettings } from '../_actions';
import { format, formatDistanceToNow } from 'date-fns';

interface FreePostingConfig {
  enabled: boolean;
  isCurrentlyActive: boolean;
  startDate: string | null;
  endDate: string | null;
  reason: string | null;
  enabledBy: string | null;
  timeRemaining: number | null;
}

interface FreePostingFormProps {
  currentConfig: FreePostingConfig | null;
}

export function FreePostingForm({ currentConfig }: FreePostingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [enabled, setEnabled] = useState(currentConfig?.enabled || false);
  const [startDate, setStartDate] = useState(
    currentConfig?.startDate ? new Date(currentConfig.startDate).toISOString().slice(0, 16) : ''
  );
  const [endDate, setEndDate] = useState(
    currentConfig?.endDate ? new Date(currentConfig.endDate).toISOString().slice(0, 16) : ''
  );
  const [reason, setReason] = useState(currentConfig?.reason || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (enabled) {
      if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        toast.error('End date must be after start date');
        return;
      }
    }

    startTransition(async () => {
      let result;
      try {
        result = await updateFreePostingSettings({
          enabled,
          startDate: startDate || null,
          endDate: endDate || null,
          reason: reason || null,
        });
      } catch (error) {
        toast.error('Failed to communicate with server');
        return;
      }

      if (result.success) {
        toast.success(
          enabled
            ? 'Free posting enabled successfully'
            : 'Free posting disabled successfully'
        );
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update free posting settings');
      }
    });
  };

  const getStatusBadge = () => {
    if (!currentConfig) return null;

    if (currentConfig.enabled && currentConfig.isCurrentlyActive) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          Active Campaign
        </div>
      );
    }

    if (currentConfig.enabled && !currentConfig.isCurrentlyActive) {
      const now = new Date();
      const start = currentConfig.startDate ? new Date(currentConfig.startDate) : null;
      const end = currentConfig.endDate ? new Date(currentConfig.endDate) : null;

      if (start && now < start) {
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Scheduled
          </div>
        );
      }

      if (end && now > end) {
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
            <AlertTriangle className="h-4 w-4" />
            Expired
          </div>
        );
      }
    }

    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
        <AlertTriangle className="h-4 w-4" />
        Inactive
      </div>
    );
  };

  const getTimeRemainingText = () => {
    if (!currentConfig?.timeRemaining || currentConfig.timeRemaining <= 0) return null;

    const endDate = new Date(Date.now() + currentConfig.timeRemaining);
    return `Ends ${formatDistanceToNow(endDate, { addSuffix: true })}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Free Job Posting Campaign</CardTitle>
            <CardDescription>
              Enable free job postings for promotional campaigns
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Toggle Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="free-posting-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
              disabled={isPending}
            />
            <Label htmlFor="free-posting-enabled" className="text-sm font-medium">
              Enable free job posting
            </Label>
          </div>

          {enabled && (
            <>
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date (Optional)</Label>
                  <Input
                    id="start-date"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to start immediately
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date (Optional)</Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for indefinite campaign
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Campaign Reason/Description (Optional)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., New Year promotion, Job fair event..."
                  disabled={isPending}
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Current Campaign Info */}
          {currentConfig && currentConfig.enabled && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Current Campaign Status</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {currentConfig.startDate && (
                  <p>Started: {format(new Date(currentConfig.startDate), 'PPp')}</p>
                )}
                {currentConfig.endDate && (
                  <p>Ends: {format(new Date(currentConfig.endDate), 'PPp')}</p>
                )}
                {getTimeRemainingText() && (
                  <p className="font-medium text-foreground">{getTimeRemainingText()}</p>
                )}
                {currentConfig.reason && (
                  <p>Reason: {currentConfig.reason}</p>
                )}
              </div>
            </div>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {enabled ? 'Enable Free Posting' : 'Disable Free Posting'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
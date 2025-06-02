'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Editor } from '@/components/RichTextEditor/editor';
import { LocationSelector } from '@/components/ui/location-selector';
import { updateTenderSchema, type UpdateTenderSchemaType } from '../_utils/validation';
import { updateTenderAction } from '../_actions';
import { getLocationById } from '../_queries';
import type { Tender, Sector } from '@/lib/db/schema';
import type { LocationSelection } from '@/lib/types/locations';
import { tenderTypeEnum, tenderStatusEnum } from '@/lib/db/schema';

interface EditTenderFormProps {
  tender: Tender;
  sectors: Sector[];
}

export function EditTenderForm({ tender, sectors }: EditTenderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const router = useRouter();

  const form = useForm<UpdateTenderSchemaType>({
    resolver: zodResolver(updateTenderSchema),
    defaultValues: {
      id: tender.id,
      title: tender.title,
      description: tender.description,
      organizationName: tender.organizationName,
      tenderType: tender.tenderType,
      sectorId: tender.sectorId || '',
      locationId: tender.locationId || '',
      deadline: tender.deadline || undefined,
      budgetRange: tender.budgetRange || '',
      contactInformation: tender.contactInformation || '',
      externalLink: tender.externalLink || '',
      status: tender.status,
    },
  });

  // Helper function to get the most specific location ID from selection
  const getLocationIdFromSelection = (selection: LocationSelection): string => {
    return selection.cityId || selection.districtId || selection.regionId || '';
  };

  // Handle location selection change
  const handleLocationChange = (selection: LocationSelection) => {
    console.log('Location selection changed:', selection);
    setLocationSelection(selection);
    const locationId = getLocationIdFromSelection(selection);
    form.setValue('locationId', locationId, { shouldDirty: true });
  };

  // Initialize location selection from existing tender data
  useEffect(() => {
    const initializeLocation = async () => {
      if (tender.locationId) {
        setIsLoadingLocation(true);
        try {
          const location = await getLocationById(tender.locationId);
          if (location) {
            // Reconstruct the full LocationSelection object with display names
            const fullLocationSelection: LocationSelection = {
              cityId: location.id,
              city: location.city || undefined,
              district: location.district || undefined,
              region: location.region || undefined,
              // Note: We don't have districtId and regionId from the current schema
              // This is a limitation of the current approach, but the component should still work
            };
            console.log('Initialized location selection:', fullLocationSelection);
            setLocationSelection(fullLocationSelection);
          }
        } catch (error) {
          console.error('Error fetching location details:', error);
          // Fall back to just the ID if we can't fetch details
          setLocationSelection({
            cityId: tender.locationId,
          });
        } finally {
          setIsLoadingLocation(false);
        }
      }
    };

    initializeLocation();
  }, [tender.locationId]);

  const onSubmit = async (data: UpdateTenderSchemaType) => {
    console.log('Form submitted with data:', data);
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateTenderAction(tender.id, data);
      
      if (result.success) {
        // Show success toast
        toast.success('Tender updated successfully!');
        // Navigate back to the tender detail page
        router.push(`/tenders/${tender.id}`);
      } else if (result.error) {
        // Show error toast
        toast.error(result.error);
        setError(result.error);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred';
      toast.error(errorMessage);
      setError(errorMessage);
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/tenders/${tender.id}`);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Edit Tender</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tender title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Organization Name */}
            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter organization name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tender Type */}
            <FormField
              control={form.control}
              name="tenderType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tender Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tender type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tenderTypeEnum.enumValues.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sector */}
            <FormField
              control={form.control}
              name="sectorId"
              render={({ field }) => {
                const handleSectorChange = (value: string) => {
                  field.onChange(value === 'none' ? '' : value);
                };

                return (
                  <FormItem>
                    <FormLabel>Sector</FormLabel>
                    <Select onValueChange={handleSectorChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No sector</SelectItem>
                        {sectors.map((sector) => (
                          <SelectItem key={sector.id} value={sector.id}>
                            {sector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Location - New LocationSelector */}
            <FormField
              control={form.control}
              name="locationId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div onClick={(e) => e.stopPropagation()}>
                      <LocationSelector
                        value={locationSelection}
                        onChange={handleLocationChange}
                        placeholder={isLoadingLocation ? "Loading current location..." : "Select location (optional)"}
                        error={fieldState.error?.message}
                        showSearch={true}
                        allowClear={true}
                        disabled={isLoadingLocation}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deadline */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget Range */}
            <FormField
              control={form.control}
              name="budgetRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Range</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., GMD 100,000 - 500,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Editor
                      value={field.value}
                      onChange={field.onChange}
                      height="auto"
                      minHeight={350}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Information */}
            <FormField
              control={form.control}
              name="contactInformation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter contact details (email, phone, address, etc.)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* External Link */}
            <FormField
              control={form.control}
              name="externalLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example.com or https://example.com/tender-details"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tenderStatusEnum.enumValues.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Updating...' : 'Update Tender'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 
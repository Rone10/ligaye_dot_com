'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Editor } from '@/components/RichTextEditor/editor';
import { LocationSelector } from '@/components/ui/location-selector';
import { newTenderSchema, type NewTenderSchemaType } from '../_utils/validation';
import { createTenderWithDocumentsAction } from '../_actions';
import { FileUpload } from './FileUpload';
import type { Sector } from '@/lib/db/schema';
import type { LocationSelection } from '@/lib/types/locations';
import { tenderTypeEnum } from '@/lib/db/schema';

interface NewTenderFormProps {
  sectors: Sector[];
}

export function NewTenderForm({ sectors }: NewTenderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentsArePaid, setDocumentsArePaid] = useState(false);
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({});
  const router = useRouter();

  const form = useForm<NewTenderSchemaType>({
    resolver: zodResolver(newTenderSchema),
    defaultValues: {
      title: '',
      description: '',
      organizationName: '',
      tenderType: 'TENDER',
      sectorId: '',
      locationId: '',
      budgetRange: '',
      contactInformation: '',
      externalLink: '',
      documentsArePaid: false,
      documentPrice: undefined,
      documentCurrency: 'GMD',
      agreeToCommissionTerms: false,
    },
  });

  // Helper function to get the most specific location ID from selection
  const getLocationIdFromSelection = (selection: LocationSelection): string => {
    return selection.cityId || selection.districtId || selection.regionId || '';
  };

  // Handle location selection change
  const handleLocationChange = (selection: LocationSelection) => {
    setLocationSelection(selection);
    const locationId = getLocationIdFromSelection(selection);
    form.setValue('locationId', locationId);
  };

  const onSubmit = async (data: NewTenderSchemaType) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData to include files
      const formData = new FormData();
      
      // Add form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'deadline' && value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add files
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const result = await createTenderWithDocumentsAction(formData);
      
      if (result.success && result.tenderId) {
        // Show success toast
        toast.success('Tender saved as draft successfully! It will be reviewed by administrators.');
        // Navigate to the tender detail page
        router.push(`/tenders/${result.tenderId}`);
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

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create New Tender</CardTitle>
        <p className="text-theme-gray-dark mt-xs">
          Your tender will be saved as a draft and manually reviewed by administrators before being published.
        </p>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <LocationSelector
                      value={locationSelection}
                      onChange={handleLocationChange}
                      placeholder="Select location (optional)"
                      error={fieldState.error?.message}
                      showSearch={true}
                      allowClear={true}
                    />
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
                      rows={3}
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

            {/* Document Upload Section */}
            <div className="space-y-lg border-t border-theme-gray pt-lg">
              <h3 className="text-xl font-semibold text-theme-dark">Document Upload</h3>
              
              <FileUpload
                files={selectedFiles}
                onFilesChange={setSelectedFiles}
                maxFiles={5}
                maxSize={25 * 1024 * 1024} // 25MB
              />
              
              {/* Document Payment Settings */}
              <div className="space-y-md">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="documentsArePaid"
                    checked={documentsArePaid}
                    onCheckedChange={(checked) => {
                      setDocumentsArePaid(checked as boolean);
                      form.setValue('documentsArePaid', checked as boolean);
                      // Reset terms agreement when unchecked
                      if (!checked) {
                        form.setValue('agreeToCommissionTerms', false);
                      }
                    }}
                  />
                  <label htmlFor="documentsArePaid" className="text-sm font-medium">
                    Charge for document access
                  </label>
                </div>
                
                {documentsArePaid && (
                  <div className="space-y-lg">
                    <div className="grid grid-cols-2 gap-md">
                      <FormField
                        control={form.control}
                        name="documentPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Price *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="documentCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="GMD">GMD (Gambian Dalasi)</SelectItem>
                                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Commission Terms Agreement */}
                    <FormField
                      control={form.control}
                      name="agreeToCommissionTerms"
                      render={({ field }) => (
                        <FormItem>
                          <div className="glass-card p-lg rounded-lg border border-primary-blue/20 bg-primary-blue/5">
                            <div className="flex items-start space-x-md">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="mt-xxs flex-shrink-0"
                                />
                              </FormControl>
                              <div className="space-y-sm flex-1">
                                <FormLabel className="text-sm font-semibold text-theme-dark leading-normal cursor-pointer">
                                  Commission Terms Agreement *
                                </FormLabel>
                                <div className="text-sm text-theme-gray-dark leading-relaxed">
                                  <p className="mb-sm">
                                    By checking this box, I acknowledge and agree to the following terms:
                                  </p>
                                  <ul className="space-y-xs pl-md">
                                    <li className="flex items-start">
                                      <span className="text-primary-blue mr-xs mt-xxs flex-shrink-0">•</span>
                                      <span>
                                        <strong className="text-theme-dark">10% Platform Commission:</strong> Ligaye.com will retain 10% of every document sale as a platform commission fee.
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="text-primary-blue mr-xs mt-xxs flex-shrink-0">•</span>
                                      <span>
                                        <strong className="text-theme-dark">Automatic Deduction:</strong> The commission will be automatically deducted from each transaction before funds are transferred to my account.
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="text-primary-blue mr-xs mt-xxs flex-shrink-0">•</span>
                                      <span>
                                        <strong className="text-theme-dark">Payment Processing:</strong> I understand that payment processing may take 3-5 business days after a successful purchase.
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="text-primary-blue mr-xs mt-xxs flex-shrink-0">•</span>
                                      <span>
                                        <strong className="text-theme-dark">Terms Acceptance:</strong> I agree to comply with all platform terms and conditions for paid document distribution.
                                      </span>
                                    </li>
                                  </ul>
                                  <p className="mt-sm text-xs text-theme-gray-dark italic">
                                    Example: If a document is sold for GMD 100, you will receive GMD 90 and Ligaye.com will retain GMD 10 as commission.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Saving Draft...' : 'Save as Draft'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
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
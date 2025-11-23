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
import { Checkbox } from '@/components/ui/checkbox';
import { Editor } from '@/components/RichTextEditor/editor';
import { LocationSelector } from '@/components/ui/location-selector';
import { updateTenderSchema, type UpdateTenderSchemaType } from '../_utils/validation';
import { updateTenderAction, updateTenderWithDocumentsAction } from '../_actions';
import { getLocationById } from '../_queries';
import { FileUpload } from './FileUpload';
import { ExistingDocuments } from './ExistingDocuments';
import type { Tender, Sector, TenderDocument } from '@/lib/db/schema';
import type { LocationSelection } from '@/lib/types/locations';
import { tenderTypeEnum, tenderStatusEnum } from '@/lib/db/schema';

interface EditTenderFormProps {
  tender: Tender;
  sectors: Sector[];
  initialDocuments: TenderDocument[];
}

export function EditTenderForm({ tender, sectors, initialDocuments }: EditTenderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [documentsArePaid, setDocumentsArePaid] = useState(tender.documentsArePaid || false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<TenderDocument[]>(initialDocuments);
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
      documentsArePaid: tender.documentsArePaid || false,
      documentPrice: tender.documentPrice || undefined,
      documentCurrency: tender.documentCurrency || 'GMD',
      agreeToCommissionTerms: false, // Reset this for editing
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

  // Handle document deletion
  const handleDocumentDeleted = (documentId: string) => {
    setExistingDocuments(prev => prev.filter(doc => doc.id !== documentId));
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

    // Validate document requirements for paid access
    if (data.documentsArePaid && existingDocuments.length === 0 && selectedFiles.length === 0) {
      const errorMessage = 'You must upload at least one document to charge for document access';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitting(false);
      return;
    }

    try {
      let result;

      // If there are files to upload, use the FormData approach
      if (selectedFiles.length > 0) {
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

        result = await updateTenderWithDocumentsAction(tender.id, formData);
      } else {
        // No files, use regular update
        result = await updateTenderAction(tender.id, data);
      }
      
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

            {/* Document Payment Settings */}
            <div className="space-y-lg border-t border-theme-gray pt-lg">
              <h3 className="text-xl font-semibold text-theme-dark">Document Access Settings</h3>
              
              <div className="space-y-md">
                <div className="flex items-center justify-between">
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
                  {documentsArePaid && existingDocuments.length === 0 && selectedFiles.length === 0 && (
                    <div className="px-sm py-xxs bg-red-100 border border-red-200 rounded-md">
                      <span className="text-xs font-medium text-red-600">
                        ⚠️ Documents required
                      </span>
                    </div>
                  )}
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
                            <Select onValueChange={field.onChange} value={field.value}>
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
                                        <strong className="text-theme-dark">10% Platform Commission:</strong> Ligaye will retain 10% of every document sale as a platform commission fee.
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
                                    Example: If a document is sold for GMD 100, you will receive GMD 90 and Ligaye will retain GMD 10 as commission.
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
              
              {/* Document Upload Section */}
              <div className="space-y-lg">
                {/* Existing Documents */}
                <div className="space-y-md">
                  <h4 className="text-lg font-semibold text-theme-dark">Current Documents</h4>
                  <ExistingDocuments 
                    documents={existingDocuments}
                    tenderId={tender.id}
                    onDocumentDeleted={handleDocumentDeleted}
                  />
                </div>

                {/* New Document Upload */}
                <div className="space-y-md">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-theme-dark">Upload New Documents</h4>
                    {documentsArePaid && (
                      <div className="px-sm py-xxs bg-secondary-green/10 border border-secondary-green/20 rounded-md">
                        <span className="text-xs font-medium text-secondary-green">
                          ⚠️ Documents can be uploaded to update paid content
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <FileUpload
                    files={selectedFiles}
                    onFilesChange={setSelectedFiles}
                    maxFiles={5}
                    maxSize={25 * 1024 * 1024} // 25MB
                  />
                  
                  {documentsArePaid && selectedFiles.length === 0 && existingDocuments.length === 0 && (
                    <div className="p-sm bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700">
                        <strong>⚠️ Required:</strong> You must upload at least one document to charge for document access. 
                        Please upload documents or uncheck "Charge for document access".
                      </p>
                    </div>
                  )}

                  {selectedFiles.length === 0 && existingDocuments.length > 0 && (
                    <div className="p-sm bg-gray-50 border border-gray-200 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Note:</strong> No new documents selected. Current documents will remain unchanged.
                        Upload new documents to add to the current set.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
                disabled={
                  isSubmitting || 
                  (documentsArePaid && existingDocuments.length === 0 && selectedFiles.length === 0)
                }
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
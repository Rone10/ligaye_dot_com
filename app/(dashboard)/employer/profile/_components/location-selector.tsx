'use client'

// @ts-ignore - useFormStatus is available in React 19 but TypeScript definitions may be outdated
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Location } from '@/lib/db/schema';

interface LocationSelectorProps {
  form: any;
  locations: Location[];
}

// Separate Submit Button component
function SubmitButton() {
  // @ts-ignore - Using useFormStatus hook from React 19
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Location'}
    </Button>
  );
}

export default function LocationSelector({ form, locations }: LocationSelectorProps) {
  // Group locations by region for better organization
  const locationsByRegion = locations.reduce<Record<string, Location[]>>((acc, location) => {
    if (!acc[location.region]) {
      acc[location.region] = [];
    }
    acc[location.region].push(location);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="max-w-md mx-auto">
        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your company location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(locationsByRegion).map(([region, locs]) => (
                    <div key={region}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                        {region}
                      </div>
                      {locs.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.city ? `${location.city}, ${location.district || ''}` : location.district}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <Input type="hidden" name="locationId" value={field.value || ""} />
              <FormDescription>
                Select the location of your company&apos;s main office.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="hqAddressDisplay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Address</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter a detailed address (optional)"
                />
              </FormControl>
              <FormDescription>
                Provide a more detailed address for your headquarters if needed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="mt-8 flex justify-end">
          <SubmitButton />
        </div>
      </div>
    </div>
  );
} 
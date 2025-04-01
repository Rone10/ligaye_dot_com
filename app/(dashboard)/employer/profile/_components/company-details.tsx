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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { companySizeEnum } from '@/lib/db/schema';

interface CompanyDetailsProps {
  form: any;
}

function SubmitButton() {
  // @ts-ignore - Using useFormStatus hook from React 19
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Company Details'}
    </Button>
  );
}

export default function CompanyDetails({ form }: CompanyDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your company name" /> 
              </FormControl>
              <FormDescription>
                The official name of your organization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="companySize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Size</FormLabel>
              <Select 
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companySizeEnum.enumValues.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="hidden" name="companySize" value={field.value || ""} />
              <FormDescription>
                The approximate number of employees in your organization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="companyDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Description</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Describe your company..."
                className="min-h-[120px]"
              />
            </FormControl>
            <FormDescription>
              A brief description of your company, its mission, and values.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Website</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                placeholder="https://www.yourcompany.com" 
                type="url"
              />
            </FormControl>
            <FormDescription>
              Your company's official website address.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </div>
  );
} 
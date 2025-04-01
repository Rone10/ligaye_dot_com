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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Industry } from '@/lib/db/schema';
import { Input } from '@/components/ui/input';

interface IndustrySelectorProps {
  form: any;
  industries: Industry[];
}

function SubmitButton() {
  // @ts-ignore - Using useFormStatus hook from React 19
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Industry'}
    </Button>
  );
}

export default function IndustrySelector({ form, industries }: IndustrySelectorProps) {
  return (
    <div className="space-y-6">
      <div className="max-w-md mx-auto">
        <FormField
          control={form.control}
          name="industryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry.id} value={industry.id}>
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="hidden" name="industryId" value={field.value || ""} />
              <FormDescription>
                Select the industry that best describes your company.
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
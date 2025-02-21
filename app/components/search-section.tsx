'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchSchema } from '@/app/lib/validations/search';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

export function SearchSection() {
  const form = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      keyword: '',
      location: '',
      filters: {
        jobType: [],
        workLocation: [],
        experienceLevel: [],
        salaryRange: { min: 0, max: 200000 },
        datePosted: 'any',
      },
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto p-4"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-0 md:flex md:space-x-2">
          <FormField
            control={form.control}
            name="keyword"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Job title, keywords, or company"
                      className="pl-9 h-12 text-base"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="City, state, or zip code"
                      className="pl-9 h-12 text-base"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full md:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-700 text-base">
            Search Jobs
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
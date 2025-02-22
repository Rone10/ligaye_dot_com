'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Building2, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { TenderType, TenderStatus, Tender } from '../types/tender';

// Mock data
const mockTenders: Tender[] = [
  {
    id: '1',
    title: 'Construction of Municipal Office Building',
    organization: 'City Development Authority',
    location: 'Chicago, IL',
    type: 'Construction',
    deadline: 'March 15, 2025',
    description: 'The City Development Authority is seeking qualified contractors for the construction of a new municipal office building...',
    budget: {
      min: 5000000,
      max: 7000000,
      currency: 'USD',
    },
    status: 'Published',
  },
  {
    id: '2',
    title: 'IT Infrastructure Upgrade Project',
    organization: 'State Technology Department',
    location: 'Austin, TX',
    type: 'IT Services',
    deadline: 'April 1, 2025',
    description: 'Seeking qualified IT service providers for a comprehensive infrastructure upgrade project...',
    budget: {
      min: 2000000,
      max: 3000000,
      currency: 'USD',
    },
    status: 'Published',
  },
];

export default function TendersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<TenderType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<TenderStatus[]>([]);
  const [budgetRange, setBudgetRange] = useState([0, 1000000]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4"
      >
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search tenders by keyword, organization, or location..."
            className="pl-10 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 space-y-6">
            {/* Tender Type */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-medium mb-3">Tender Type</h3>
              <div className="space-y-2">
                {['Construction', 'IT Services', 'Consulting'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={selectedTypes.includes(type as TenderType)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTypes([...selectedTypes, type as TenderType]);
                        } else {
                          setSelectedTypes(selectedTypes.filter(t => t !== type));
                        }
                      }}
                    />
                    <label htmlFor={type} className="text-sm text-gray-600">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-medium mb-3">Status</h3>
              <div className="space-y-2">
                {['Published', 'Closed', 'Canceled'].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={status}
                      checked={selectedStatuses.includes(status as TenderStatus)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStatuses([...selectedStatuses, status as TenderStatus]);
                        } else {
                          setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                        }
                      }}
                    />
                    <label htmlFor={status} className="text-sm text-gray-600">
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sector */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-medium mb-3">Sector</h3>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-medium mb-3">Location</h3>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="chicago">Chicago, IL</SelectItem>
                  <SelectItem value="austin">Austin, TX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deadline */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-medium mb-3">Deadline</h3>
              <Input type="date" />
            </div>

            {/* Budget Range */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-medium mb-3">Budget Range</h3>
              <Slider
                defaultValue={[0, 1000000]}
                max={1000000}
                step={10000}
                value={budgetRange}
                onValueChange={setBudgetRange}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>${budgetRange[0].toLocaleString()}</span>
                <span>${budgetRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Tenders List */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Tenders</h2>
              <Select defaultValue="latest">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {mockTenders.map((tender) => (
                <div key={tender.id} className="bg-white rounded-lg border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-blue-600">
                          <a href={`/tenders/${tender.id}`} className="hover:underline">
                            {tender.title}
                          </a>
                        </h3>
                        <Badge variant="secondary" className="bg-green-50 text-green-600">
                          {tender.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{tender.organization}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{tender.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span>{tender.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {tender.deadline}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {tender.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-gray-600">
                      Budget: ${tender.budget.min.toLocaleString()} - ${tender.budget.max.toLocaleString()} {tender.budget.currency}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Save
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        View Tender
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8 gap-1">
              <Button variant="outline" className="text-gray-600">Previous</Button>
              <Button variant="outline" className="bg-blue-600 text-white">1</Button>
              <Button variant="outline" className="text-gray-600">2</Button>
              <Button variant="outline" className="text-gray-600">3</Button>
              <Button variant="outline" className="text-gray-600">Next</Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
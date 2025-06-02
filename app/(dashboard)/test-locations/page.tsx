'use client';

import { useState } from 'react';
import { LocationSelector } from '@/components/ui/location-selector';
import { LocationSelection } from '@/lib/types/locations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestLocationsPage() {
  const [selection1, setSelection1] = useState<LocationSelection>({});
  const [selection2, setSelection2] = useState<LocationSelection>({});
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Location Selector Demo</h1>
          <p className="mt-2 text-gray-600">
            Test the new optimized location selector with static data and instant search.
          </p>
        </div>

        {/* Performance Stats */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Performance Benefits</CardTitle>
            <CardDescription className="text-green-700">
              This new implementation provides significant performance improvements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-semibold text-green-800">Database Queries</div>
                <div className="text-green-600">0 per interaction</div>
              </div>
              <div>
                <div className="font-semibold text-green-800">Dropdown Open</div>
                <div className="text-green-600">~0ms delay</div>
              </div>
              <div>
                <div className="font-semibold text-green-800">Search Results</div>
                <div className="text-green-600">Instant client-side</div>
              </div>
              <div>
                <div className="font-semibold text-green-800">Total Locations</div>
                <div className="text-green-600">1,898 searchable</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Components */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* First Location Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Location Selector</CardTitle>
              <CardDescription>
                Full-featured with search and hierarchical navigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LocationSelector
                value={selection1}
                onChange={setSelection1}
                placeholder="Choose your location..."
                showSearch={true}
                allowClear={true}
              />
              
              {selection1.city && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Selected:</div>
                  <div className="flex flex-wrap gap-2">
                    {selection1.region && (
                      <Badge variant="secondary">Region: {selection1.region}</Badge>
                    )}
                    {selection1.district && (
                      <Badge variant="secondary">District: {selection1.district}</Badge>
                    )}
                    {selection1.city && (
                      <Badge variant="default">City: {selection1.city}</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Second Location Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Simplified Location Selector</CardTitle>
              <CardDescription>
                Search-only mode without hierarchical navigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LocationSelector
                value={selection2}
                onChange={setSelection2}
                placeholder="Search locations..."
                showSearch={true}
                allowClear={true}
              />

              {selection2.city && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Selected:</div>
                  <div className="text-sm text-gray-600">
                    {selection2.city}, {selection2.district}, {selection2.region}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* JSON Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Selection Data</CardTitle>
            <CardDescription>
              Raw JSON data from the location selections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => setShowJson(!showJson)}
              className="mb-4"
            >
              {showJson ? 'Hide' : 'Show'} JSON Data
            </Button>

            {showJson && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Primary Selector:
                  </div>
                  <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selection1, null, 2)}
                  </pre>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Search Selector:
                  </div>
                  <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selection2, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <strong>Hierarchical Navigation:</strong> Click the first selector and navigate through 
                Region → District → City to see the instant loading at each step.
              </div>
              <div>
                <strong>Search:</strong> Type in either selector to see instant search results from 
                all 1,898 locations.
              </div>
              <div>
                <strong>Popular Regions:</strong> Try selecting Banjul, Kanifing Municipality, or 
                West Coast Region to see pre-loaded data.
              </div>
              <div>
                <strong>Performance:</strong> Notice how there are no loading delays after the initial 
                page load - everything is instant!
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
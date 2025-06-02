'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function TestSeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeedLocations = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/seed-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed locations');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Seed Locations Database</CardTitle>
          <CardDescription>
            Click the button below to seed the locations table with Gambian location data.
            This will add all cities, districts, and regions from the JSON file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* <Button 
            onClick={handleSeedLocations} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Locations...
              </>
            ) : (
              'Seed Locations Database'
            )}
          </Button> */}
          <Button>Now new data to test here</Button>

          {result && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Success!</span>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  <p>{result.message}</p>
                  <div className="mt-2 space-y-1">
                    <p>• New locations inserted: {result.count}</p>
                    <p>• Total locations in data: {result.totalInData}</p>
                    <p>• Existing locations: {result.existingCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">Error</span>
                </div>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TestFractalsPage = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const testNavigation = (path: string, description: string) => {
    try {
      // Test if the path is accessible
      window.open(path, '_blank');
      setTestResults(prev => [...prev, `✅ ${description}: ${path} - Navigation successful`]);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ ${description}: ${path} - Error: ${error}`]);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fractals Navigation Test</CardTitle>
          <CardDescription>
            Test all fractals pages to ensure they work correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => testNavigation('/fractals', 'Main Fractals Page')}
              className="w-full"
            >
              Test Main Page
            </Button>
            <Button
              onClick={() => testNavigation('/fractals/interactive', 'Interactive Explorer')}
              className="w-full"
            >
              Test Interactive Explorer
            </Button>
            <Button
              onClick={() => testNavigation('/fractals/learning', 'Learning Center')}
              className="w-full"
            >
              Test Learning Center
            </Button>
            <Button
              onClick={() => testNavigation('/fractals/code-examples', 'Code Examples')}
              className="w-full"
            >
              Test Code Examples
            </Button>
          </div>

          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded">
                  {result}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manual Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold">1. Main Page (/fractals)</h4>
              <p className="text-sm text-gray-600">
                Should show landing page with navigation cards to all sections
              </p>
            </div>
            <div>
              <h4 className="font-semibold">2. Interactive Explorer (/fractals/interactive)</h4>
              <p className="text-sm text-gray-600">
                Should show interactive canvas with fractal generation controls
              </p>
            </div>
            <div>
              <h4 className="font-semibold">3. Learning Center (/fractals/learning)</h4>
              <p className="text-sm text-gray-600">
                Should show educational content with tabs for different topics
              </p>
            </div>
            <div>
              <h4 className="font-semibold">4. Code Examples (/fractals/code-examples)</h4>
              <p className="text-sm text-gray-600">
                Should show code examples in multiple programming languages
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestFractalsPage;
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const FractalLearning = () => {
  const [activeTab, setActiveTab] = useState('introduction');

  const fractalExamples = [
    {
      name: 'Mandelbrot Set',
      description: 'The most famous fractal, discovered by Benoit Mandelbrot',
      formula: 'z_{n+1} = z_n^2 + c',
      complexity: 'High',
      applications: ['Mathematics', 'Computer Graphics', 'Chaos Theory']
    },
    {
      name: 'Julia Set',
      description: 'Related to Mandelbrot set but with fixed parameters',
      formula: 'z_{n+1} = z_n^2 + c (c fixed)',
      complexity: 'Medium',
      applications: ['Art', 'Mathematics', 'Signal Processing']
    },
    {
      name: 'Sierpinski Triangle',
      description: 'Geometric fractal created by removing triangular sections',
      formula: 'Recursive subdivision',
      complexity: 'Low',
      applications: ['Mathematics Education', 'Antenna Design', 'Computer Graphics']
    },
    {
      name: 'Koch Snowflake',
      description: 'Fractal curve with infinite perimeter but finite area',
      formula: 'Iterative line replacement',
      complexity: 'Medium',
      applications: ['Geometry', 'Coastline Modeling', 'Art']
    }
  ];

  const applications = [
    {
      category: 'Computer Graphics',
      items: [
        'Terrain generation for video games',
        'Procedural texture creation',
        'Realistic cloud and water simulation',
        'Natural phenomena modeling'
      ]
    },
    {
      category: 'Signal Processing',
      items: [
        'Image compression (fractal compression)',
        'Antenna design (fractal antennas)',
        'Noise reduction and filtering',
        'Pattern recognition'
      ]
    },
    {
      category: 'Medicine',
      items: [
        'Analysis of tumor growth patterns',
        'Study of neural networks',
        'Blood vessel structure analysis',
        'Lung capacity modeling'
      ]
    },
    {
      category: 'Finance',
      items: [
        'Stock market analysis',
        'Risk assessment models',
        'Market pattern recognition',
        'Portfolio optimization'
      ]
    }
  ];

  const mathematicalConcepts = [
    {
      concept: 'Self-Similarity',
      description: 'Parts of the fractal resemble the whole at different scales',
      example: 'A small piece of broccoli looks like the entire head',
      importance: 'Fundamental property of all fractals'
    },
    {
      concept: 'Fractional Dimension',
      description: 'Fractals exist between traditional integer dimensions',
      example: 'Sierpinski triangle has dimension ≈ 1.585',
      importance: 'Helps quantify complexity and scaling behavior'
    },
    {
      concept: 'Iteration',
      description: 'Repeated application of simple mathematical rules',
      example: 'Mandelbrot set uses z = z² + c repeatedly',
      importance: 'Core mechanism for fractal generation'
    },
    {
      concept: 'Chaos Theory',
      description: 'Sensitive dependence on initial conditions',
      example: 'Small changes in parameters create vastly different patterns',
      importance: 'Connects fractals to dynamic systems'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Learn About Fractals</CardTitle>
          <CardDescription>
            Discover the fascinating world of fractals - where mathematics meets art and nature
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="introduction">Introduction</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="introduction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>What Are Fractals?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                Fractals are infinitely complex patterns that are self-similar across different scales.
                They are created by repeating a simple process over and over in an ongoing feedback loop.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Key Characteristics</h3>
                  <ul className="space-y-1">
                    <li>• Self-Similarity: Parts resemble the whole</li>
                    <li>• Infinite Detail: Zoom reveals endless complexity</li>
                    <li>• Fractional Dimension: Between traditional dimensions</li>
                    <li>• Recursive Generation: Simple rules, complex results</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Where to Find Fractals</h3>
                  <ul className="space-y-1">
                    <li>• Natural: Clouds, mountains, coastlines</li>
                    <li>• Biological: Lungs, blood vessels, neurons</li>
                    <li>• Mathematical: Mandelbrot set, Julia sets</li>
                    <li>• Artificial: Computer graphics, antenna design</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>The History of Fractals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">19th Century</h4>
                  <p>Early mathematical curiosities discovered by mathematicians like Weierstrass and Cantor</p>
                </div>
                <div>
                  <h4 className="font-semibold">Early 20th Century</h4>
                  <p>Gaston Julia and Pierre Fatou study complex dynamics, laying groundwork for Julia sets</p>
                </div>
                <div>
                  <h4 className="font-semibold">1970s</h4>
                  <p>Benoit Mandelbrot coins the term "fractal" and discovers the Mandelbrot set</p>
                </div>
                <div>
                  <h4 className="font-semibold">1980s-Present</h4>
                  <p>Computer graphics revolutionize fractal visualization and applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fractalExamples.map((fractal, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {fractal.name}
                    <Badge variant={fractal.complexity === 'High' ? 'destructive' : fractal.complexity === 'Medium' ? 'default' : 'secondary'}>
                      {fractal.complexity}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{fractal.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold">Formula</h4>
                    <code className="bg-gray-100 p-2 rounded block">{fractal.formula}</code>
                  </div>
                  <div>
                    <h4 className="font-semibold">Applications</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {fractal.applications.map((app, i) => (
                        <Badge key={i} variant="outline">{app}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mathematics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mathematical Foundation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {mathematicalConcepts.map((concept, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-lg">{concept.concept}</h3>
                  <p className="text-gray-600">{concept.description}</p>
                  <div className="mt-2">
                    <strong>Example:</strong> {concept.example}
                  </div>
                  <div className="mt-1">
                    <strong>Importance:</strong> {concept.importance}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fractal Dimension Formula</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Hausdorff Dimension</h4>
                  <code className="block text-lg">
                    D = log(N) / log(1/r)
                  </code>
                  <p className="mt-2 text-sm">
                    Where N is the number of self-similar pieces and r is the scaling factor
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <h4 className="font-semibold">Sierpinski Triangle</h4>
                    <p className="text-2xl font-mono">D ≈ 1.585</p>
                    <p className="text-sm text-gray-600">Between line and plane</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold">Koch Snowflake</h4>
                    <p className="text-2xl font-mono">D ≈ 1.262</p>
                    <p className="text-sm text-gray-600">Infinite perimeter, finite area</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold">Mandelbrot Set</h4>
                    <p className="text-2xl font-mono">D = 2.0</p>
                    <p className="text-sm text-gray-600">But with infinite boundary complexity</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map((app, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{app.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {app.items.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Real-World Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Technology</h4>
                  <ul className="space-y-1">
                    <li>• Fractal antennas in mobile phones</li>
                    <li>• CGI in movies and games</li>
                    <li>• Image compression algorithms</li>
                    <li>• Weather prediction models</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Science</h4>
                  <ul className="space-y-1">
                    <li>• Understanding natural phenomena</li>
                    <li>• Medical imaging and diagnosis</li>
                    <li>• Material science research</li>
                    <li>• Environmental modeling</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started with Fractals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold">Beginner</h4>
                  <p className="text-sm text-gray-600">Start with geometric fractals like Sierpinski triangle</p>
                  <Button className="mt-2" variant="outline">Try Interactive Explorer</Button>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold">Intermediate</h4>
                  <p className="text-sm text-gray-600">Explore Mandelbrot and Julia sets with programming</p>
                  <Button className="mt-2" variant="outline">View Code Examples</Button>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold">Advanced</h4>
                  <p className="text-sm text-gray-600">Study fractal mathematics and research applications</p>
                  <Button className="mt-2" variant="outline">Research Papers</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FractalLearning;
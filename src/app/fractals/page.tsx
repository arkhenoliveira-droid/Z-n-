'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FractalsHomePage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl">Fractals Explorer</CardTitle>
          <CardDescription className="text-lg">
            Discover the infinite beauty and mathematical complexity of fractals
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Interactive Explorer
              <Badge variant="default">Live Demo</Badge>
            </CardTitle>
            <CardDescription>
              Explore fractals in real-time with our interactive visualization tool
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">Interactive Canvas</span>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Features:</h4>
              <ul className="text-sm space-y-1">
                <li>• Real-time fractal generation</li>
                <li>• Zoom and pan controls</li>
                <li>• Multiple fractal types</li>
                <li>• Adjustable parameters</li>
              </ul>
            </div>
            <Button className="w-full" onClick={() => window.location.href = '/fractals/interactive'}>
              Start Exploring
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Learning Center
              <Badge variant="secondary">Educational</Badge>
            </CardTitle>
            <CardDescription>
              Comprehensive guide to understanding fractals and their mathematics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">Educational Content</span>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Topics Covered:</h4>
              <ul className="text-sm space-y-1">
                <li>• Introduction to fractals</li>
                <li>• Mathematical foundations</li>
                <li>• Types and examples</li>
                <li>• Real-world applications</li>
              </ul>
            </div>
            <Button className="w-full" variant="outline" onClick={() => window.location.href = '/fractals/learning'}>
              Start Learning
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Code Examples
              <Badge variant="outline">Developer</Badge>
            </CardTitle>
            <CardDescription>
              Complete code examples for generating fractals in multiple languages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">Code Repository</span>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Languages:</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">JavaScript</Badge>
                <Badge variant="secondary">Python</Badge>
                <Badge variant="secondary">C++</Badge>
              </div>
              <h4 className="font-semibold mt-2">Fractals:</h4>
              <ul className="text-sm space-y-1">
                <li>• Mandelbrot Set</li>
                <li>• Julia Sets</li>
                <li>• Sierpinski Triangle</li>
                <li>• Koch Snowflake</li>
              </ul>
            </div>
            <Button className="w-full" variant="outline" onClick={() => window.location.href = '/fractals/code-examples'}>
              View Code
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What Are Fractals?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            Fractals are infinitely complex patterns that are self-similar across different scales.
            They are created by repeating a simple process over and over in an ongoing feedback loop.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Key Characteristics</h3>
              <ul className="space-y-1">
                <li>• <strong>Self-Similarity:</strong> Parts resemble the whole</li>
                <li>• <strong>Infinite Detail:</strong> Zoom reveals endless complexity</li>
                <li>• <strong>Fractional Dimension:</strong> Between traditional dimensions</li>
                <li>• <strong>Recursive Generation:</strong> Simple rules, complex results</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Where to Find Fractals</h3>
              <ul className="space-y-1">
                <li>• <strong>Natural:</strong> Clouds, mountains, coastlines</li>
                <li>• <strong>Biological:</strong> Lungs, blood vessels, neurons</li>
                <li>• <strong>Mathematical:</strong> Mandelbrot set, Julia sets</li>
                <li>• <strong>Artificial:</strong> Computer graphics, antenna design</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular Fractal Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="aspect-square bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">Mandelbrot</span>
              </div>
              <h4 className="font-semibold">Mandelbrot Set</h4>
              <p className="text-sm text-gray-600">The most famous fractal with infinite complexity</p>
            </div>

            <div className="text-center space-y-2">
              <div className="aspect-square bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">Julia</span>
              </div>
              <h4 className="font-semibold">Julia Sets</h4>
              <p className="text-sm text-gray-600">Beautiful variations with different parameters</p>
            </div>

            <div className="text-center space-y-2">
              <div className="aspect-square bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">Sierpinski</span>
              </div>
              <h4 className="font-semibold">Sierpinski Triangle</h4>
              <p className="text-sm text-gray-600">Classic geometric fractal pattern</p>
            </div>

            <div className="text-center space-y-2">
              <div className="aspect-square bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">Koch</span>
              </div>
              <h4 className="font-semibold">Koch Snowflake</h4>
              <p className="text-sm text-gray-600">Infinite perimeter, finite area</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications of Fractals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600">Computer Graphics</h4>
              <ul className="text-sm space-y-1">
                <li>• Terrain generation</li>
                <li>• Procedural textures</li>
                <li>• Natural phenomena</li>
                <li>• Movie special effects</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">Science & Medicine</h4>
              <ul className="text-sm space-y-1">
                <li>• Tumor growth analysis</li>
                <li>• Neural network studies</li>
                <li>• Blood vessel modeling</li>
                <li>• Material science</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-purple-600">Technology</h4>
              <ul className="text-sm space-y-1">
                <li>• Antenna design</li>
                <li>• Image compression</li>
                <li>• Signal processing</li>
                <li>• Financial modeling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold">Interactive Explorer</h4>
              <p className="text-sm text-gray-600">Start with the visual explorer to understand fractal behavior</p>
              <Button size="sm" onClick={() => window.location.href = '/fractals/interactive'}>
                Try Now
              </Button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold">Learn the Math</h4>
              <p className="text-sm text-gray-600">Understand the mathematical principles behind fractals</p>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/fractals/learning'}>
                Learn More
              </Button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold">Code Your Own</h4>
              <p className="text-sm text-gray-600">Implement fractals in your preferred programming language</p>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/fractals/code-examples'}>
                View Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FractalsHomePage;
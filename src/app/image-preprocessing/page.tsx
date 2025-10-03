'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImageVariant {
  type: string;
  description: string;
  resolution: string;
  purpose: string;
}

interface ProcessingResult {
  original: string;
  variants: ImageVariant[];
  confidence: number;
  processingTime: number;
}

const ImagePreprocessingDemo = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageVariants: ImageVariant[] = [
    {
      type: 'original',
      description: 'Original uploaded image',
      resolution: 'Native',
      purpose: 'Primary reference'
    },
    {
      type: 'pyramid_256',
      description: 'Low-resolution pyramid level',
      resolution: '256px',
      purpose: 'Global structure analysis'
    },
    {
      type: 'pyramid_512',
      description: 'Medium-resolution pyramid level',
      resolution: '512px',
      purpose: 'Balanced detail analysis'
    },
    {
      type: 'grayscale_normalized',
      description: 'Grayscale with contrast normalization',
      resolution: 'Native',
      purpose: 'Luminance-focused analysis'
    },
    {
      type: 'saliency_crop',
      description: 'Saliency-based crop',
      resolution: 'Variable',
      purpose: 'Focus on attention regions'
    },
    {
      type: 'face_crop',
      description: 'Face detection crop',
      resolution: 'Variable',
      purpose: 'Facial feature analysis'
    },
    {
      type: 'text_crop',
      description: 'Text region extraction',
      resolution: 'Variable',
      purpose: 'Text content analysis'
    }
  ];

  const simulateProcessing = async (file: File) => {
    setProcessing(true);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result: ProcessingResult = {
      original: file.name,
      variants: imageVariants,
      confidence: 0.87,
      processingTime: 1.5
    };

    setResults(result);
    setProcessing(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      simulateProcessing(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      simulateProcessing(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Anti-Hallucination Image Preprocessing</CardTitle>
          <CardDescription className="text-lg">
            Multi-resolution preprocessing pipeline for robust image analysis
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Upload an image to see the preprocessing pipeline in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="space-y-2">
                <div className="text-4xl">📁</div>
                <p className="text-lg font-medium">Drop image here or click to upload</p>
                <p className="text-sm text-gray-500">Supports JPG, PNG, WebP</p>
              </div>
            </div>

            {selectedFile && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="font-medium">Selected: {selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
            <CardDescription>
              Real-time analysis of preprocessing pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processing ? (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p>Processing image variants...</p>
              </div>
            ) : results ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{results.confidence * 100}%</p>
                    <p className="text-sm text-gray-600">Confidence Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{results.processingTime}s</p>
                    <p className="text-sm text-gray-600">Processing Time</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Generated Variants:</h4>
                  <div className="space-y-1">
                    {results.variants.map((variant, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{variant.type}</span>
                          <p className="text-sm text-gray-600">{variant.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{variant.resolution}</Badge>
                          <p className="text-xs text-gray-500">{variant.purpose}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Upload an image to see processing results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technical Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pipeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline" className="space-y-4">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">Step 1: Multi-Resolution Pyramid</h4>
                  <p className="text-gray-600">
                    Generate 256px and 512px versions using efficient downsampling
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">Step 2: Grayscale + Normalization</h4>
                  <p className="text-gray-600">
                    Convert to grayscale and apply contrast normalization
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold">Step 3: Smart Cropping</h4>
                  <p className="text-gray-600">
                    Extract regions based on saliency, faces, and text detection
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold">Step 4: Manifest Generation</h4>
                  <p className="text-gray-600">
                    Create metadata bundle for model consumption
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="variants" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imageVariants.map((variant, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{variant.type}</CardTitle>
                      <CardDescription>{variant.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Resolution:</span>
                          <Badge>{variant.resolution}</Badge>
                        </div>
                        <div>
                          <span className="font-medium">Purpose:</span>
                          <p className="text-sm text-gray-600">{variant.purpose}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="benefits" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Cost Efficiency</h4>
                  <ul className="space-y-1">
                    <li>• Only 5-6 cheap transforms per image</li>
                    <li>• No multiple heavy model passes</li>
                    <li>• Preprocessing done once, reused</li>
                    <li>• Local processing possible</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Robustness</h4>
                  <ul className="space-y-1">
                    <li>• Multiple perspectives of same image</li>
                    <li>• Self-flagging low confidence</li>
                    <li>• Consistency checking across variants</li>
                    <li>• Reduced hallucination risk</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">User Experience</h4>
                  <ul className="space-y-1">
                    <li>• Simple file upload</li>
                    <li>• Automatic variant generation</li>
                    <li>• Transparent processing</li>
                    <li>• Confidence feedback</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Privacy</h4>
                  <ul className="space-y-1">
                    <li>• Local preprocessing option</li>
                    <li>• Minimal data transmission</li>
                    <li>• No external API calls</li>
                    <li>• User control over data</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="implementation" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Core Components</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <pre className="text-sm">
{`// Preprocessing Pipeline
class ImagePreprocessor {
  async processImage(image) {
    const variants = [];

    // Multi-resolution pyramid
    variants.push(this.createPyramid(image, 256));
    variants.push(this.createPyramid(image, 512));

    // Grayscale + normalization
    variants.push(this.createGrayscaleNormalized(image));

    // Smart crops
    variants.push(this.createSaliencyCrop(image));
    variants.push(this.createFaceCrop(image));
    variants.push(this.createTextCrop(image));

    return this.createManifest(variants);
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold">Confidence Scoring</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <pre className="text-sm">
{`// Confidence Calculation
function calculateConfidence(analysisResults) {
  const scores = analysisResults.map(result => result.score);
  const variance = calculateVariance(scores);
  const consistency = 1 - variance;

  // Lower variance = higher confidence
  return Math.max(0, Math.min(1, consistency));
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImagePreprocessingDemo;
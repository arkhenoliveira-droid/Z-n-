'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const ImagePreprocessingAlgorithms = () => {
  const [activeTab, setActiveTab] = useState('saliency');

  const algorithms = {
    saliency: {
      title: 'Saliency Detection',
      description: 'Identify visually important regions using computational attention models',
      complexity: 'Medium',
      accuracy: 'High',
      speed: 'Fast',
      code: `// Saliency-based cropping using spectral residual
class SaliencyDetector {
  constructor() {
    this.kernelSize = 3;
    this.sigma = 1.5;
  }

  async detectSaliency(imageData) {
    // Convert to grayscale
    const grayscale = this.toGrayscale(imageData);

    // Compute spectral residual
    const amplitude = this.computeFFT(grayscale);
    const logAmplitude = this.logTransform(amplitude);
    const spectralResidual = amplitude - logAmplitude;

    // Inverse FFT to get saliency map
    const saliencyMap = this.inverseFFT(spectralResidual);

    // Apply Gaussian smoothing
    const smoothed = this.gaussianBlur(saliencyMap);

    // Find salient regions
    const regions = this.findSalientRegions(smoothed);

    return regions;
  }

  toGrayscale(imageData) {
    const grayscale = new Uint8ClampedArray(imageData.width * imageData.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const gray = 0.299 * imageData.data[i] +
                   0.587 * imageData.data[i + 1] +
                   0.114 * imageData.data[i + 2];
      grayscale[i / 4] = gray;
    }
    return grayscale;
  }

  computeFFT(grayscale) {
    // Simplified FFT implementation
    // In practice, use optimized FFT library
    const width = Math.sqrt(grayscale.length);
    const fft = new Float32Array(grayscale.length);

    // FFT computation logic here
    return fft;
  }

  findSalientRegions(saliencyMap) {
    const regions = [];
    const threshold = this.calculateThreshold(saliencyMap);

    // Find connected components above threshold
    const visited = new Array(saliencyMap.length).fill(false);

    for (let i = 0; i < saliencyMap.length; i++) {
      if (saliencyMap[i] > threshold && !visited[i]) {
        const region = this.floodFill(saliencyMap, visited, i);
        if (region.size > 100) { // Minimum region size
          regions.push(region);
        }
      }
    }

    return regions.sort((a, b) => b.salience - a.salience).slice(0, 3);
  }
}`,
      useCases: [
        'General purpose image analysis',
        'Automatic cropping for thumbnails',
        'Focus region identification',
        'Visual attention prediction'
      ],
      advantages: [
        'Computationally efficient',
        'No training required',
        'Works on any image type',
        'Biologically inspired'
      ],
      limitations: [
        'May miss semantic importance',
        'Sensitive to noise',
        'Limited to visual saliency'
      ]
    },

    face: {
      title: 'Face Detection',
      description: 'Detect and crop facial regions using lightweight ML models',
      complexity: 'High',
      accuracy: 'Very High',
      speed: 'Medium',
      code: `// Lightweight face detection using MobileNet SSD
class FaceDetector {
  constructor() {
    this.model = null;
    this.confidenceThreshold = 0.5;
    this.nmsThreshold = 0.3;
  }

  async loadModel() {
    // Load pre-trained MobileNet SSD model
    this.model = await tf.loadLayersModel('models/facedetection/model.json');
  }

  async detectFaces(imageData) {
    if (!this.model) {
      await this.loadModel();
    }

    // Preprocess image
    const tensor = this.preprocessImage(imageData);

    // Run inference
    const predictions = await this.model.predict(tensor);

    // Post-process results
    const detections = this.postProcess(predictions);

    // Apply Non-Maximum Suppression
    const finalDetections = this.applyNMS(detections);

    return finalDetections.map(detection => ({
      bbox: detection.bbox,
      confidence: detection.confidence,
      landmarks: detection.landmarks
    }));
  }

  preprocessImage(imageData) {
    // Convert to tensor and normalize
    const tensor = tf.browser.fromPixels(imageData)
      .resizeNearestNeighbor([300, 300])
      .toFloat()
      .div(255.0)
      .expandDims();

    return tensor;
  }

  postProcess(predictions) {
    // Convert model output to detection format
    const boxes = predictions.slice([0, 0, 0], [-1, -1, 4]);
    const scores = predictions.slice([0, 0, 4], [-1, -1, 1]);

    // Apply sigmoid to scores
    const probabilities = tf.sigmoid(scores);

    // Filter by confidence threshold
    const mask = probabilities.greater(this.confidenceThreshold);
    const validBoxes = tf.booleanMask(boxes, mask);
    const validScores = tf.booleanMask(probabilities, mask);

    return {
      boxes: validBoxes.arraySync(),
      scores: validScores.arraySync()
    };
  }

  applyNMS(detections) {
    // Non-Maximum Suppression implementation
    const indices = tf.image.nonMaxSuppression(
      detections.boxes,
      detections.scores,
      100, // maxDetections
      this.nmsThreshold,
      0.5 // scoreThreshold
    );

    return indices.arraySync().map(i => ({
      bbox: detections.boxes[i],
      confidence: detections.scores[i][0]
    }));
  }

  cropFace(imageData, bbox) {
    const [x, y, width, height] = bbox;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(
      imageData,
      x, y, width, height,
      0, 0, width, height
    );

    return canvas;
  }
}`,
      useCases: [
        'Portrait photography',
        'Video conferencing',
        'Identity verification',
        'Emotion analysis'
      ],
      advantages: [
        'High accuracy',
        'Real-time performance',
        'Provides facial landmarks',
        'Robust to lighting changes'
      ],
      limitations: [
        'Requires model loading',
        'Higher computational cost',
        'Limited to frontal faces',
        'Privacy concerns'
      ]
    },

    text: {
      title: 'Text Region Detection',
      description: 'Extract text-containing regions using edge detection and ML',
      complexity: 'Medium',
      accuracy: 'High',
      speed: 'Fast',
      code: `// Text region detection using hybrid approach
class TextDetector {
  constructor() {
    this.edgeThreshold = 50;
    this.textThreshold = 0.3;
    this.minTextSize = 10;
  }

  async detectTextRegions(imageData) {
    // Step 1: Edge detection
    const edges = this.detectEdges(imageData);

    // Step 2: Connected component analysis
    const components = this.findConnectedComponents(edges);

    // Step 3: Text region classification
    const textRegions = await this.classifyTextRegions(components, imageData);

    // Step 4: Merge nearby regions
    const mergedRegions = this.mergeNearbyRegions(textRegions);

    return mergedRegions;
  }

  detectEdges(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const edges = new Uint8ClampedArray(width * height);

    // Sobel edge detection
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let pixelX = 0, pixelY = 0;

        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) {
            const idx = ((y + j) * width + (x + i)) * 4;
            const gray = 0.299 * imageData.data[idx] +
                         0.587 * imageData.data[idx + 1] +
                         0.114 * imageData.data[idx + 2];

            pixelX += gray * sobelX[(j + 1) * 3 + (i + 1)];
            pixelY += gray * sobelY[(j + 1) * 3 + (i + 1)];
          }
        }

        const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
        edges[y * width + x] = magnitude > this.edgeThreshold ? 255 : 0;
      }
    }

    return edges;
  }

  findConnectedComponents(edges) {
    const width = Math.sqrt(edges.length);
    const height = width;
    const visited = new Array(edges.length).fill(false);
    const components = [];

    for (let i = 0; i < edges.length; i++) {
      if (edges[i] === 255 && !visited[i]) {
        const component = this.floodFill(edges, visited, i, width, height);
        if (component.size > this.minTextSize) {
          components.push(component);
        }
      }
    }

    return components;
  }

  async classifyTextRegions(components, imageData) {
    const textRegions = [];

    for (const component of components) {
      const features = this.extractFeatures(component, imageData);
      const isText = await this.classifyFeatures(features);

      if (isText > this.textThreshold) {
        textRegions.push({
          bbox: component.bbox,
          confidence: isText,
          features: features
        });
      }
    }

    return textRegions;
  }

  extractFeatures(component, imageData) {
    // Extract geometric and texture features
    const aspectRatio = component.width / component.height;
    const density = component.size / (component.width * component.height);
    const strokeWidth = this.estimateStrokeWidth(component, imageData);

    return {
      aspectRatio,
      density,
      strokeWidth,
      area: component.size,
      perimeter: component.perimeter
    };
  }

  async classifyFeatures(features) {
    // Simple rule-based classification
    // In practice, use ML model
    let score = 0;

    // Text-like aspect ratio
    if (features.aspectRatio > 0.1 && features.aspectRatio < 10) {
      score += 0.3;
    }

    // Appropriate density
    if (features.density > 0.1 && features.density < 0.9) {
      score += 0.3;
    }

    // Stroke width consistency
    if (features.strokeWidth > 1 && features.strokeWidth < 20) {
      score += 0.4;
    }

    return Math.min(1, score);
  }

  mergeNearbyRegions(regions) {
    const merged = [];
    const used = new Array(regions.length).fill(false);

    for (let i = 0; i < regions.length; i++) {
      if (!used[i]) {
        let group = [regions[i]];
        used[i] = true;

        for (let j = i + 1; j < regions.length; j++) {
          if (!used[j] && this.areNearby(regions[i], regions[j])) {
            group.push(regions[j]);
            used[j] = true;
          }
        }

        merged.push(this.mergeGroup(group));
      }
    }

    return merged;
  }
}`,
      useCases: [
        'Document analysis',
        'Sign detection',
        'OCR preprocessing',
        'Content moderation'
      ],
      advantages: [
        'Language independent',
        'Fast processing',
        'Works on various fonts',
        'No training data needed'
      ],
      limitations: [
        'May miss artistic text',
        'Sensitive to image quality',
        'Limited to horizontal text',
        'False positives on textures'
      ]
    },

    depth: {
      title: 'Monocular Depth Estimation',
      description: 'Estimate depth information from single images for 3D context',
      complexity: 'High',
      accuracy: 'Medium',
      speed: 'Slow',
      code: `// Lightweight monocular depth estimation
class DepthEstimator {
  constructor() {
    this.model = null;
    this.minDepth = 0.1;
    this.maxDepth = 10.0;
  }

  async loadModel() {
    // Load lightweight depth estimation model
    this.model = await tf.loadLayersModel('models/depthestimation/model.json');
  }

  async estimateDepth(imageData) {
    if (!this.model) {
      await this.loadModel();
    }

    // Preprocess image
    const tensor = this.preprocessImage(imageData);

    // Run depth estimation
    const depthMap = await this.model.predict(tensor);

    // Post-process depth map
    const processedDepth = this.postProcessDepth(depthMap);

    // Generate depth-based crops
    const depthCrops = this.generateDepthCrops(processedDepth);

    return {
      depthMap: processedDepth,
      crops: depthCrops
    };
  }

  preprocessImage(imageData) {
    // Resize and normalize for depth model
    const tensor = tf.browser.fromPixels(imageData)
      .resizeBilinear([256, 256])
      .toFloat()
      .div(255.0)
      .expandDims();

    return tensor;
  }

  postProcessDepth(depthMap) {
    // Convert to depth values
    const depth = depthMap.squeeze();

    // Apply median filtering for noise reduction
    const filtered = this.medianFilter(depth);

    // Normalize depth range
    const normalized = this.normalizeDepth(filtered);

    return normalized;
  }

  medianFilter(depth) {
    // Apply 3x3 median filter
    const width = depth.shape[1];
    const height = depth.shape[0];
    const filtered = tf.zerosLike(depth);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const window = depth.slice(
          [y - 1, x - 1], [3, 3]
        ).flatten();

        const median = this.calculateMedian(window);
        filtered.buffer().set(
          new Float32Array([median]),
          (y * width + x) * 4
        );
      }
    }

    return filtered;
  }

  normalizeDepth(depth) {
    // Normalize to [0, 1] range
    const min = depth.min();
    const max = depth.max();
    const normalized = depth.sub(min).div(max.sub(min));

    return normalized;
  }

  generateDepthCrops(depthMap) {
    const crops = [];
    const width = depthMap.shape[1];
    const height = depthMap.shape[0];

    // Find regions of interest based on depth
    const depthRegions = this.findDepthRegions(depthMap);

    // Generate crops for different depth layers
    for (const region of depthRegions) {
      const crop = {
        bbox: region.bbox,
        depth: region.avgDepth,
        type: this.getDepthType(region.avgDepth),
        confidence: region.confidence
      };

      crops.push(crop);
    }

    return crops;
  }

  findDepthRegions(depthMap) {
    const regions = [];
    const depthArray = depthMap.arraySync();

    // Simple region growing based on depth similarity
    const visited = new Array(depthArray.length).fill(false);

    for (let i = 0; i < depthArray.length; i++) {
      if (!visited[i]) {
        const region = this.growRegion(depthArray, visited, i, depthMap.shape[1]);
        if (region.size > 100) {
          regions.push(region);
        }
      }
    }

    return regions;
  }

  getDepthType(depth) {
    if (depth < 0.3) return 'foreground';
    if (depth < 0.7) return 'midground';
    return 'background';
  }

  calculateMedian(array) {
    const sorted = Array.from(array).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }
}`,
      useCases: [
        '3D scene understanding',
        'Autonomous driving',
        'Robotics navigation',
        'AR/VR applications'
      ],
      advantages: [
        'Provides 3D context',
        'Single image solution',
        'No additional hardware',
        'Rich spatial information'
      ],
      limitations: [
        'Computationally expensive',
        'Limited accuracy',
        'Requires training data',
        'Sensitive to lighting'
      ]
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Smart Cropping Algorithms</CardTitle>
          <CardDescription className="text-lg">
            Technical implementation of intelligent image region extraction
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="saliency">Saliency</TabsTrigger>
          <TabsTrigger value="face">Face Detection</TabsTrigger>
          <TabsTrigger value="text">Text Detection</TabsTrigger>
          <TabsTrigger value="depth">Depth Estimation</TabsTrigger>
        </TabsList>

        {Object.entries(algorithms).map(([key, algorithm]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {algorithm.title}
                  <div className="flex gap-2">
                    <Badge variant={algorithm.complexity === 'Low' ? 'secondary' :
                                  algorithm.complexity === 'Medium' ? 'default' : 'destructive'}>
                      {algorithm.complexity}
                    </Badge>
                    <Badge variant={algorithm.accuracy === 'High' ? 'default' :
                                  algorithm.accuracy === 'Very High' ? 'destructive' : 'secondary'}>
                      {algorithm.accuracy}
                    </Badge>
                    <Badge variant={algorithm.speed === 'Fast' ? 'default' :
                                  algorithm.speed === 'Medium' ? 'secondary' : 'destructive'}>
                      {algorithm.speed}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>{algorithm.description}</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Implementation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                    <pre className="text-sm whitespace-pre-wrap">
                      <code>{algorithm.code}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Use Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {algorithm.useCases.map((useCase, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Advantages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {algorithm.advantages.map((advantage, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Limitations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {algorithm.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">⚠</span>
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Algorithm Selection Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">When to Use Each Algorithm</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-blue-600">Saliency Detection</h5>
                  <p className="text-sm text-gray-600">
                    Best for general purpose images where you want to find visually important regions
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-green-600">Face Detection</h5>
                  <p className="text-sm text-gray-600">
                    Ideal for portraits, social media, and applications involving people
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-purple-600">Text Detection</h5>
                  <p className="text-sm text-gray-600">
                    Perfect for documents, signs, and images containing textual information
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-orange-600">Depth Estimation</h5>
                  <p className="text-sm text-gray-600">
                    Useful for 3D understanding and spatial analysis of scenes
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Performance Comparison</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Fastest</span>
                  <Badge>Saliency</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Most Accurate</span>
                  <Badge>Face Detection</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Most Versatile</span>
                  <Badge>Text Detection</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Most Information</span>
                  <Badge>Depth Estimation</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImagePreprocessingAlgorithms;
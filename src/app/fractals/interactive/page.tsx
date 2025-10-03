'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface FractalPoint {
  x: number;
  y: number;
  iterations: number;
}

const FractalExplorer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fractalType, setFractalType] = useState<'mandelbrot' | 'julia' | 'burning-ship'>('mandelbrot');
  const [maxIterations, setMaxIterations] = useState([100]);
  const [zoom, setZoom] = useState([1]);
  const [offsetX, setOffsetX] = useState([0]);
  const [offsetY, setOffsetY] = useState([0]);
  const [isRendering, setIsRendering] = useState(false);
  const [renderTime, setRenderTime] = useState(0);

  const mandelbrot = (x: number, y: number, maxIter: number): FractalPoint => {
    let zx = 0, zy = 0;
    let iteration = 0;

    while (zx * zx + zy * zy < 4 && iteration < maxIter) {
      const temp = zx * zx - zy * zy + x;
      zy = 2 * zx * zy + y;
      zx = temp;
      iteration++;
    }

    return { x, y, iterations: iteration };
  };

  const julia = (x: number, y: number, maxIter: number): FractalPoint => {
    let zx = x, zy = y;
    const cx = -0.7, cy = 0.27015;
    let iteration = 0;

    while (zx * zx + zy * zy < 4 && iteration < maxIter) {
      const temp = zx * zx - zy * zy + cx;
      zy = 2 * zx * zy + cy;
      zx = temp;
      iteration++;
    }

    return { x, y, iterations: iteration };
  };

  const burningShip = (x: number, y: number, maxIter: number): FractalPoint => {
    let zx = 0, zy = 0;
    let iteration = 0;

    while (zx * zx + zy * zy < 4 && iteration < maxIter) {
      const temp = zx * zx - zy * zy + x;
      zy = Math.abs(2 * zx * zy) + y;
      zx = Math.abs(temp);
      iteration++;
    }

    return { x, y, iterations: iteration };
  };

  const getColor = (iterations: number, maxIterations: number): string => {
    if (iterations === maxIterations) {
      return '#000000';
    }

    const hue = (iterations / maxIterations) * 360;
    const saturation = 100;
    const lightness = iterations === maxIterations ? 0 : 50;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const renderFractal = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRendering(true);
    const startTime = performance.now();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const scale = 4 / (zoom[0] * Math.min(width, height));
    const centerX = -0.5 + offsetX[0];
    const centerY = 0 + offsetY[0];

    for (let px = 0; px < width; px++) {
      for (let py = 0; py < height; py++) {
        const x = (px - width / 2) * scale + centerX;
        const y = (py - height / 2) * scale + centerY;

        let point: FractalPoint;
        switch (fractalType) {
          case 'mandelbrot':
            point = mandelbrot(x, y, maxIterations[0]);
            break;
          case 'julia':
            point = julia(x, y, maxIterations[0]);
            break;
          case 'burning-ship':
            point = burningShip(x, y, maxIterations[0]);
            break;
        }

        const color = getColor(point.iterations, maxIterations[0]);
        const rgb = color.match(/\d+/g);

        if (rgb) {
          const index = (py * width + px) * 4;
          data[index] = parseInt(rgb[0]);     // Red
          data[index + 1] = parseInt(rgb[1]); // Green
          data[index + 2] = parseInt(rgb[2]); // Blue
          data[index + 3] = 255;              // Alpha
        }
      }

      // Allow UI to update during rendering
      if (px % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const endTime = performance.now();
    setRenderTime(endTime - startTime);
    setIsRendering(false);
  };

  useEffect(() => {
    renderFractal();
  }, [fractalType, maxIterations, zoom, offsetX, offsetY]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const scale = 4 / (zoom[0] * Math.min(width, height));

    const newOffsetX = offsetX[0] + (x - width / 2) * scale;
    const newOffsetY = offsetY[0] + (y - height / 2) * scale;

    setOffsetX([newOffsetX]);
    setOffsetY([newOffsetY]);
    setZoom([zoom[0] * 2]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Fractal Explorer</CardTitle>
          <CardDescription>
            Explore the infinite complexity of fractals. Click on the fractal to zoom in!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Fractal Type</label>
              <Select value={fractalType} onValueChange={(value: any) => setFractalType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mandelbrot">Mandelbrot Set</SelectItem>
                  <SelectItem value="julia">Julia Set</SelectItem>
                  <SelectItem value="burning-ship">Burning Ship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Iterations: {maxIterations[0]}</label>
              <Slider
                value={maxIterations}
                onValueChange={setMaxIterations}
                max={500}
                min={10}
                step={10}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Zoom: {zoom[0].toFixed(2)}x</label>
              <Slider
                value={zoom}
                onValueChange={setZoom}
                max={1000}
                min={0.1}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setZoom([1]);
                  setOffsetX([0]);
                  setOffsetY([0]);
                }}
                disabled={isRendering}
              >
                Reset View
              </Button>
            </div>
          </div>

          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border rounded-lg cursor-crosshair w-full max-w-full"
              onClick={handleCanvasClick}
            />
            {isRendering && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white">Rendering... {renderTime.toFixed(0)}ms</div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            <p>• Click anywhere on the fractal to zoom in at that point</p>
            <p>• Higher iterations reveal more detail but take longer to render</p>
            <p>• Different fractal types show unique mathematical patterns</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FractalExplorer;
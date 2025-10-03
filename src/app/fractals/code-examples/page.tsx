'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FractalCodeExamples = () => {
  const [activeTab, setActiveTab] = useState('mandelbrot');
  const [copiedCode, setCopiedCode] = useState('');

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const codeExamples = {
    mandelbrot: {
      title: 'Mandelbrot Set',
      description: 'The most famous fractal - discover infinite complexity in simple mathematics',
      languages: {
        javascript: `// JavaScript Mandelbrot Set Generator
function mandelbrot(cx, cy, maxIterations) {
    let zx = 0, zy = 0;
    let iteration = 0;

    while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
        const temp = zx * zx - zy * zy + cx;
        zy = 2 * zx * zy + cy;
        zx = temp;
        iteration++;
    }

    return iteration;
}

function generateMandelbrot(width, height, maxIterations) {
    const imageData = new ImageData(width, height);
    const data = imageData.data;

    for (let px = 0; px < width; px++) {
        for (let py = 0; py < height; py++) {
            const x = (px - width / 2) * 4 / width;
            const y = (py - height / 2) * 4 / height;

            const iterations = mandelbrot(x, y, maxIterations);
            const color = getColor(iterations, maxIterations);

            const index = (py * width + px) * 4;
            data[index] = color.r;
            data[index + 1] = color.g;
            data[index + 2] = color.b;
            data[index + 3] = 255;
        }
    }

    return imageData;
}

function getColor(iterations, maxIterations) {
    if (iterations === maxIterations) {
        return { r: 0, g: 0, b: 0 };
    }

    const hue = (iterations / maxIterations) * 360;
    return hslToRgb(hue, 100, 50);
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;

    let r, g, b;

    if (h < 1/6) { r = c; g = x; b = 0; }
    else if (h < 2/6) { r = x; g = c; b = 0; }
    else if (h < 3/6) { r = 0; g = c; b = x; }
    else if (h < 4/6) { r = 0; g = x; b = c; }
    else if (h < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}`,
        python: `# Python Mandelbrot Set Generator
import numpy as np
import matplotlib.pyplot as plt

def mandelbrot(cx, cy, max_iterations):
    zx, zy = 0, 0
    iteration = 0

    while zx * zx + zy * zy < 4 and iteration < max_iterations:
        temp = zx * zx - zy * zy + cx
        zy = 2 * zx * zy + cy
        zx = temp
        iteration += 1

    return iteration

def generate_mandelbrot(width, height, max_iterations):
    x = np.linspace(-2, 2, width)
    y = np.linspace(-2, 2, height)
    X, Y = np.meshgrid(x, y)

    iterations = np.zeros((height, width))

    for i in range(height):
        for j in range(width):
            iterations[i, j] = mandelbrot(X[i, j], Y[i, j], max_iterations)

    return iterations

def plot_mandelbrot(iterations, max_iterations):
    plt.figure(figsize=(10, 10))
    plt.imshow(iterations, cmap='hot', extent=[-2, 2, -2, 2])
    plt.colorbar(label='Iterations')
    plt.title('Mandelbrot Set')
    plt.xlabel('Real')
    plt.ylabel('Imaginary')
    plt.show()

# Generate and plot
width, height = 800, 800
max_iterations = 100
iterations = generate_mandelbrot(width, height, max_iterations)
plot_mandelbrot(iterations, max_iterations)`,
        cpp: `// C++ Mandelbrot Set Generator
#include <iostream>
#include <vector>
#include <complex>
#include <fstream>
#include <cmath>

struct RGB {
    unsigned char r, g, b;
};

int mandelbrot(std::complex<double> c, int maxIterations) {
    std::complex<double> z(0, 0);
    int iteration = 0;

    while (std::abs(z) < 2 && iteration < maxIterations) {
        z = z * z + c;
        iteration++;
    }

    return iteration;
}

RGB getColor(int iterations, int maxIterations) {
    if (iterations == maxIterations) {
        return {0, 0, 0};
    }

    double hue = (double)iterations / maxIterations * 360;
    return hslToRgb(hue, 100, 50);
}

RGB hslToRgb(double h, double s, double l) {
    h /= 360;
    s /= 100;
    l /= 100;

    double c = (1 - std::abs(2 * l - 1)) * s;
    double x = c * (1 - std::abs(std::fmod(h * 6, 2) - 1));
    double m = l - c / 2;

    double r, g, b;

    if (h < 1.0/6) { r = c; g = x; b = 0; }
    else if (h < 2.0/6) { r = x; g = c; b = 0; }
    else if (h < 3.0/6) { r = 0; g = c; b = x; }
    else if (h < 4.0/6) { r = 0; g = x; b = c; }
    else if (h < 5.0/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return {
        static_cast<unsigned char>((r + m) * 255),
        static_cast<unsigned char>((g + m) * 255),
        static_cast<unsigned char>((b + m) * 255)
    };
}

void generateMandelbrot(int width, int height, int maxIterations) {
    std::vector<RGB> imageData(width * height);

    for (int py = 0; py < height; py++) {
        for (int px = 0; px < width; px++) {
            double x = (px - width / 2.0) * 4.0 / width;
            double y = (py - height / 2.0) * 4.0 / height;

            std::complex<double> c(x, y);
            int iterations = mandelbrot(c, maxIterations);
            RGB color = getColor(iterations, maxIterations);

            imageData[py * width + px] = color;
        }
    }

    // Save as PPM file
    std::ofstream file("mandelbrot.ppm");
    file << "P3\n" << width << " " << height << "\n255\n";
    for (const auto& pixel : imageData) {
        file << (int)pixel.r << " " << (int)pixel.g << " " << (int)pixel.b << " ";
    }
    file.close();
}

int main() {
    int width = 800, height = 800;
    int maxIterations = 100;

    generateMandelbrot(width, height, maxIterations);
    std::cout << "Mandelbrot set generated as mandelbrot.ppm" << std::endl;

    return 0;
}`
      }
    },
    julia: {
      title: 'Julia Set',
      description: 'Beautiful fractals related to the Mandelbrot set with fixed parameters',
      languages: {
        javascript: `// JavaScript Julia Set Generator
function julia(zx, zy, cx, cy, maxIterations) {
    let iteration = 0;

    while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
        const temp = zx * zx - zy * zy + cx;
        zy = 2 * zx * zy + cy;
        zx = temp;
        iteration++;
    }

    return iteration;
}

function generateJulia(width, height, cx, cy, maxIterations) {
    const imageData = new ImageData(width, height);
    const data = imageData.data;

    for (let px = 0; px < width; px++) {
        for (let py = 0; py < height; py++) {
            const x = (px - width / 2) * 4 / width;
            const y = (py - height / 2) * 4 / height;

            const iterations = julia(x, y, cx, cy, maxIterations);
            const color = getColor(iterations, maxIterations);

            const index = (py * width + px) * 4;
            data[index] = color.r;
            data[index + 1] = color.g;
            data[index + 2] = color.b;
            data[index + 3] = 255;
        }
    }

    return imageData;
}

// Different Julia set parameters
const juliaParams = [
    { cx: -0.7, cy: 0.27015, name: "Classic Julia" },
    { cx: -0.8, cy: 0.156, name: "Spiral Julia" },
    { cx: -0.4, cy: 0.6, name: "Dendrite Julia" },
    { cx: 0.285, cy: 0.01, name: "Dragon Julia" }
];

// Generate different Julia sets
juliaParams.forEach(params => {
    const juliaImage = generateJulia(400, 400, params.cx, params.cy, 100);
    // Display or save the image
    console.log(\`Generated \${params.name} Julia set\`);
});`,
        python: `# Python Julia Set Generator
import numpy as np
import matplotlib.pyplot as plt

def julia(zx, zy, cx, cy, max_iterations):
    iteration = 0

    while zx * zx + zy * zy < 4 and iteration < max_iterations:
        temp = zx * zx - zy * zy + cx
        zy = 2 * zx * zy + cy
        zx = temp
        iteration += 1

    return iteration

def generate_julia(width, height, cx, cy, max_iterations):
    x = np.linspace(-2, 2, width)
    y = np.linspace(-2, 2, height)
    X, Y = np.meshgrid(x, y)

    iterations = np.zeros((height, width))

    for i in range(height):
        for j in range(width):
            iterations[i, j] = julia(X[i, j], Y[i, j], cx, cy, max_iterations)

    return iterations

def plot_julia(iterations, max_iterations, title):
    plt.figure(figsize=(8, 8))
    plt.imshow(iterations, cmap='hot', extent=[-2, 2, -2, 2])
    plt.colorbar(label='Iterations')
    plt.title(title)
    plt.xlabel('Real')
    plt.ylabel('Imaginary')
    plt.show()

# Different Julia set parameters
julia_params = [
    {'cx': -0.7, 'cy': 0.27015, 'name': 'Classic Julia'},
    {'cx': -0.8, 'cy': 0.156, 'name': 'Spiral Julia'},
    {'cx': -0.4, 'cy': 0.6, 'name': 'Dendrite Julia'},
    {'cx': 0.285, 'cy': 0.01, 'name': 'Dragon Julia'}
]

# Generate and plot different Julia sets
width, height = 400, 400
max_iterations = 100

for params in julia_params:
    iterations = generate_julia(width, height, params['cx'], params['cy'], max_iterations)
    plot_julia(iterations, max_iterations, params['name'])`,
        cpp: `// C++ Julia Set Generator
#include <iostream>
#include <vector>
#include <complex>
#include <fstream>
#include <cmath>

struct RGB {
    unsigned char r, g, b;
};

int julia(std::complex<double> z, std::complex<double> c, int maxIterations) {
    int iteration = 0;

    while (std::abs(z) < 2 && iteration < maxIterations) {
        z = z * z + c;
        iteration++;
    }

    return iteration;
}

RGB getColor(int iterations, int maxIterations) {
    if (iterations == maxIterations) {
        return {0, 0, 0};
    }

    double hue = (double)iterations / maxIterations * 360;
    return hslToRgb(hue, 100, 50);
}

RGB hslToRgb(double h, double s, double l) {
    h /= 360;
    s /= 100;
    l /= 100;

    double c = (1 - std::abs(2 * l - 1)) * s;
    double x = c * (1 - std::abs(std::fmod(h * 6, 2) - 1));
    double m = l - c / 2;

    double r, g, b;

    if (h < 1.0/6) { r = c; g = x; b = 0; }
    else if (h < 2.0/6) { r = x; g = c; b = 0; }
    else if (h < 3.0/6) { r = 0; g = c; b = x; }
    else if (h < 4.0/6) { r = 0; g = x; b = c; }
    else if (h < 5.0/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return {
        static_cast<unsigned char>((r + m) * 255),
        static_cast<unsigned char>((g + m) * 255),
        static_cast<unsigned char>((b + m) * 255)
    };
}

void generateJulia(int width, int height, double cx, double cy, int maxIterations) {
    std::vector<RGB> imageData(width * height);
    std::complex<double> c(cx, cy);

    for (int py = 0; py < height; py++) {
        for (int px = 0; px < width; px++) {
            double x = (px - width / 2.0) * 4.0 / width;
            double y = (py - height / 2.0) * 4.0 / height;

            std::complex<double> z(x, y);
            int iterations = julia(z, c, maxIterations);
            RGB color = getColor(iterations, maxIterations);

            imageData[py * width + px] = color;
        }
    }

    // Save as PPM file
    std::string filename = "julia_" + std::to_string(cx) + "_" + std::to_string(cy) + ".ppm";
    std::ofstream file(filename);
    file << "P3\\n" << width << " " << height << "\\n255\\n";
    for (const auto& pixel : imageData) {
        file << (int)pixel.r << " " << (int)pixel.g << " " << (int)pixel.b << " ";
    }
    file.close();
}

int main() {
    int width = 400, height = 400;
    int maxIterations = 100;

    // Different Julia set parameters
    std::vector<std::pair<double, double>> juliaParams = {
        {-0.7, 0.27015},
        {-0.8, 0.156},
        {-0.4, 0.6},
        {0.285, 0.01}
    };

    for (const auto& params : juliaParams) {
        generateJulia(width, height, params.first, params.second, maxIterations);
        std::cout << "Generated Julia set with c = " << params.first << " + " << params.second << "i" << std::endl;
    }

    return 0;
}`
      }
    },
    sierpinski: {
      title: 'Sierpinski Triangle',
      description: 'Classic geometric fractal created through recursive subdivision',
      languages: {
        javascript: `// JavaScript Sierpinski Triangle Generator
function drawSierpinskiTriangle(ctx, x, y, size, depth) {
    if (depth === 0) {
        // Draw a triangle
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size / 2, y - size * Math.sqrt(3) / 2);
        ctx.closePath();
        ctx.fill();
        return;
    }

    const halfSize = size / 2;
    const height = size * Math.sqrt(3) / 2;

    // Draw three smaller triangles
    drawSierpinskiTriangle(ctx, x, y, halfSize, depth - 1);
    drawSierpinskiTriangle(ctx, x + halfSize, y, halfSize, depth - 1);
    drawSierpinskiTriangle(ctx, x + halfSize / 2, y - height / 2, halfSize, depth - 1);
}

// Canvas setup
const canvas = document.getElementById('sierpinskiCanvas');
const ctx = canvas.getContext('2d');
const size = 400;
const depth = 6;

// Set canvas size
canvas.width = size;
canvas.height = size * Math.sqrt(3) / 2;

// Set fill color
ctx.fillStyle = '#3498db';

// Draw the Sierpinski triangle
drawSierpinskiTriangle(ctx, 0, size * Math.sqrt(3) / 2, size, depth);

// Alternative: Chaos Game method
function chaosGameSierpinski(ctx, width, height, iterations) {
    const vertices = [
        { x: width / 2, y: 20 },
        { x: 20, y: height - 20 },
        { x: width - 20, y: height - 20 }
    ];

    let currentPoint = { x: width / 2, y: height / 2 };

    ctx.fillStyle = 'rgba(52, 152, 219, 0.5)';

    for (let i = 0; i < iterations; i++) {
        const randomVertex = vertices[Math.floor(Math.random() * 3)];

        currentPoint.x = (currentPoint.x + randomVertex.x) / 2;
        currentPoint.y = (currentPoint.y + randomVertex.y) / 2;

        ctx.fillRect(currentPoint.x, currentPoint.y, 1, 1);
    }
}

// Use chaos game method
const chaosCanvas = document.getElementById('chaosCanvas');
const chaosCtx = chaosCanvas.getContext('2d');
chaosCanvas.width = 400;
chaosCanvas.height = 350;
chaosGameSierpinski(chaosCtx, 400, 350, 50000);`,
        python: `# Python Sierpinski Triangle Generator
import numpy as np
import matplotlib.pyplot as plt
import random

def draw_sierpinski_triangle(ax, x, y, size, depth):
    if depth == 0:
        # Draw a triangle
        triangle = plt.Polygon([
            [x, y],
            [x + size, y],
            [x + size / 2, y - size * np.sqrt(3) / 2]
        ], color='blue')
        ax.add_patch(triangle)
        return

    half_size = size / 2
    height = size * np.sqrt(3) / 2

    # Draw three smaller triangles
    draw_sierpinski_triangle(ax, x, y, half_size, depth - 1)
    draw_sierpinski_triangle(ax, x + half_size, y, half_size, depth - 1)
    draw_sierpinski_triangle(ax, x + half_size / 2, y - height / 2, half_size, depth - 1)

# Create figure and axis
fig, ax = plt.subplots(1, 1, figsize=(8, 8))
ax.set_xlim(0, 400)
ax.set_ylim(0, 350)
ax.set_aspect('equal')

# Draw the Sierpinski triangle
draw_sierpinski_triangle(ax, 0, 0, 400, 6)
plt.title('Sierpinski Triangle')
plt.show()

# Alternative: Chaos Game method
def chaos_game_sierpinski(width, height, iterations):
    vertices = np.array([
        [width / 2, 20],
        [20, height - 20],
        [width - 20, height - 20]
    ])

    current_point = np.array([width / 2, height / 2])
    points = []

    for _ in range(iterations):
        random_vertex = vertices[random.randint(0, 2)]
        current_point = (current_point + random_vertex) / 2
        points.append(current_point.copy())

    return np.array(points)

# Generate and plot using chaos game
fig, ax = plt.subplots(1, 1, figsize=(8, 8))
points = chaos_game_sierpinski(400, 350, 50000)
ax.scatter(points[:, 0], points[:, 1], s=0.1, c='blue', alpha=0.5)
ax.set_xlim(0, 400)
ax.set_ylim(0, 350)
ax.set_aspect('equal')
plt.title('Sierpinski Triangle (Chaos Game)')
plt.show()`,
        cpp: `// C++ Sierpinski Triangle Generator
#include <iostream>
#include <vector>
#include <cmath>
#include <random>
#include <fstream>

struct Point {
    double x, y;
};

void drawSierpinskiTriangle(std::ofstream& file, double x, double y, double size, int depth) {
    if (depth == 0) {
        // Draw a triangle (output as SVG path)
        double height = size * sqrt(3) / 2;
        file << "M " << x << "," << y << " ";
        file << "L " << x + size << "," << y << " ";
        file << "L " << x + size / 2 << "," << y - height << " ";
        file << "Z ";
        return;
    }

    double halfSize = size / 2;
    double height = size * sqrt(3) / 2;

    // Draw three smaller triangles
    drawSierpinskiTriangle(file, x, y, halfSize, depth - 1);
    drawSierpinskiTriangle(file, x + halfSize, y, halfSize, depth - 1);
    drawSierpinskiTriangle(file, x + halfSize / 2, y - height / 2, halfSize, depth - 1);
}

void chaosGameSierpinski(std::ofstream& file, int width, int height, int iterations) {
    std::vector<Point> vertices = {
        {width / 2.0, 20.0},
        {20.0, height - 20.0},
        {width - 20.0, height - 20.0}
    };

    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, 2);

    Point currentPoint = {width / 2.0, height / 2.0};

    file << "<g fill='blue'>";

    for (int i = 0; i < iterations; i++) {
        Point randomVertex = vertices[dis(gen)];

        currentPoint.x = (currentPoint.x + randomVertex.x) / 2;
        currentPoint.y = (currentPoint.y + randomVertex.y) / 2;

        file << "<circle cx='" << currentPoint.x << "' cy='" << currentPoint.y << "' r='0.5'/>";
    }

    file << "</g>";
}

int main() {
    int width = 400, height = 350;
    int depth = 6;

    // Generate recursive Sierpinski triangle
    std::ofstream svgFile("sierpinski.svg");
    svgFile << "<svg width='" << width << "' height='" << height << "' xmlns='http://www.w3.org/2000/svg'>";
    svgFile << "<g fill='none' stroke='blue' stroke-width='1'>";

    drawSierpinskiTriangle(svgFile, 0, height - 20, width - 40, depth);

    svgFile << "</g></svg>";
    svgFile.close();

    std::cout << "Sierpinski triangle generated as sierpinski.svg" << std::endl;

    // Generate chaos game version
    std::ofstream chaosFile("chaos_sierpinski.svg");
    chaosFile << "<svg width='" << width << "' height='" << height << "' xmlns='http://www.w3.org/2000/svg'>";

    chaosGameSierpinski(chaosFile, width, height, 50000);

    chaosFile << "</svg>";
    chaosFile.close();

    std::cout << "Chaos game Sierpinski triangle generated as chaos_sierpinski.svg" << std::endl;

    return 0;
}`
      }
    },
    koch: {
      title: 'Koch Snowflake',
      description: 'Fractal curve with infinite perimeter but finite area',
      languages: {
        javascript: `// JavaScript Koch Snowflake Generator
function kochLine(x1, y1, x2, y2, depth) {
    if (depth === 0) {
        return [{x: x1, y: y1}, {x: x2, y: y2}];
    }

    const dx = x2 - x1;
    const dy = y2 - y1;

    // Calculate the four points
    const p1 = {x: x1, y: y1};
    const p2 = {x: x1 + dx / 3, y: y1 + dy / 3};
    const p4 = {x: x1 + 2 * dx / 3, y: y1 + 2 * dy / 3};
    const p5 = {x: x2, y: y2};

    // Calculate the peak point
    const angle = Math.PI / 3; // 60 degrees
    const p3 = {
        x: p2.x + (p4.x - p2.x) * Math.cos(angle) - (p4.y - p2.y) * Math.sin(angle),
        y: p2.y + (p4.x - p2.x) * Math.sin(angle) + (p4.y - p2.y) * Math.cos(angle)
    };

    // Recursively process each segment
    const segment1 = kochLine(p1.x, p1.y, p2.x, p2.y, depth - 1);
    const segment2 = kochLine(p2.x, p2.y, p3.x, p3.y, depth - 1);
    const segment3 = kochLine(p3.x, p3.y, p4.x, p4.y, depth - 1);
    const segment4 = kochLine(p4.x, p4.y, p5.x, p5.y, depth - 1);

    // Combine all segments
    return [...segment1.slice(0, -1), ...segment2.slice(0, -1), ...segment3.slice(0, -1), ...segment4];
}

function drawKochSnowflake(ctx, centerX, centerY, size, depth) {
    // Calculate the three vertices of the equilateral triangle
    const height = size * Math.sqrt(3) / 2;
    const vertices = [
        {x: centerX, y: centerY - height * 2/3},
        {x: centerX - size/2, y: centerY + height * 1/3},
        {x: centerX + size/2, y: centerY + height * 1/3}
    ];

    ctx.beginPath();

    // Generate Koch curve for each side
    for (let i = 0; i < 3; i++) {
        const v1 = vertices[i];
        const v2 = vertices[(i + 1) % 3];

        const points = kochLine(v1.x, v1.y, v2.x, v2.y, depth);

        if (i === 0) {
            ctx.moveTo(points[0].x, points[0].y);
        }

        for (let j = 1; j < points.length; j++) {
            ctx.lineTo(points[j].x, points[j].y);
        }
    }

    ctx.closePath();
    ctx.stroke();
}

// Canvas setup
const canvas = document.getElementById('kochCanvas');
const ctx = canvas.getContext('2d');
const size = 300;
const depth = 4;

canvas.width = 400;
canvas.height = 400;

ctx.strokeStyle = '#2c3e50';
ctx.lineWidth = 1;

// Draw the Koch snowflake
drawKochSnowflake(ctx, 200, 200, size, depth);

// Calculate and display properties
function calculateKochProperties(initialSideLength, depth) {
    const numberOfSides = 3 * Math.pow(4, depth);
    const sideLength = initialSideLength / Math.pow(3, depth);
    const perimeter = numberOfSides * sideLength;

    // Area calculation (approximate)
    const area = (Math.sqrt(3) / 4) * initialSideLength * initialSideLength *
                 (1 + (1/3) * (1 - Math.pow(4/9, depth)) / (1 - 4/9));

    return { numberOfSides, sideLength, perimeter, area };
}

const properties = calculateKochProperties(size, depth);
console.log('Koch Snowflake Properties:');
console.log('Number of sides:', properties.numberOfSides);
console.log('Side length:', properties.sideLength);
console.log('Perimeter:', properties.perimeter);
console.log('Area:', properties.area);`,
        python: `# Python Koch Snowflake Generator
import numpy as np
import matplotlib.pyplot as plt

def koch_line(x1, y1, x2, y2, depth):
    if depth == 0:
        return [(x1, y1), (x2, y2)]

    dx = x2 - x1
    dy = y2 - y1

    # Calculate the four points
    p1 = (x1, y1)
    p2 = (x1 + dx/3, y1 + dy/3)
    p4 = (x1 + 2*dx/3, y1 + 2*dy/3)
    p5 = (x2, y2)

    # Calculate the peak point
    angle = np.pi/3  # 60 degrees
    p3 = (
        p2[0] + (p4[0] - p2[0]) * np.cos(angle) - (p4[1] - p2[1]) * np.sin(angle),
        p2[1] + (p4[0] - p2[0]) * np.sin(angle) + (p4[1] - p2[1]) * np.cos(angle)
    )

    # Recursively process each segment
    segment1 = koch_line(p1[0], p1[1], p2[0], p2[1], depth - 1)
    segment2 = koch_line(p2[0], p2[1], p3[0], p3[1], depth - 1)
    segment3 = koch_line(p3[0], p3[1], p4[0], p4[1], depth - 1)
    segment4 = koch_line(p4[0], p4[1], p5[0], p5[1], depth - 1)

    # Combine all segments
    return segment1[:-1] + segment2[:-1] + segment3[:-1] + segment4

def draw_koch_snowflake(ax, center_x, center_y, size, depth):
    # Calculate the three vertices of the equilateral triangle
    height = size * np.sqrt(3) / 2
    vertices = [
        (center_x, center_y - height * 2/3),
        (center_x - size/2, center_y + height * 1/3),
        (center_x + size/2, center_y + height * 1/3)
    ]

    all_points = []

    # Generate Koch curve for each side
    for i in range(3):
        v1 = vertices[i]
        v2 = vertices[(i + 1) % 3]

        points = koch_line(v1[0], v1[1], v2[0], v2[1], depth)
        all_points.extend(points[:-1])  # Exclude the last point to avoid duplication

    all_points.append(vertices[0])  # Close the snowflake

    # Extract x and y coordinates
    x_coords = [p[0] for p in all_points]
    y_coords = [p[1] for p in all_points]

    ax.plot(x_coords, y_coords, 'b-', linewidth=1)
    ax.fill(x_coords, y_coords, alpha=0.3, color='lightblue')

def calculate_koch_properties(initial_side_length, depth):
    number_of_sides = 3 * (4 ** depth)
    side_length = initial_side_length / (3 ** depth)
    perimeter = number_of_sides * side_length

    # Area calculation (approximate)
    area = (np.sqrt(3) / 4) * initial_side_length * initial_side_length * \\
           (1 + (1/3) * (1 - (4/9)**depth) / (1 - 4/9))

    return {
        'number_of_sides': number_of_sides,
        'side_length': side_length,
        'perimeter': perimeter,
        'area': area
    }

# Create figure and axis
fig, ax = plt.subplots(1, 1, figsize=(8, 8))
ax.set_aspect('equal')
ax.set_xlim(-200, 200)
ax.set_ylim(-200, 200)

# Draw the Koch snowflake
size = 300
depth = 4
draw_koch_snowflake(ax, 0, 0, size, depth)

plt.title('Koch Snowflake')
plt.grid(True, alpha=0.3)
plt.show()

# Calculate and display properties
properties = calculate_koch_properties(size, depth)
print('Koch Snowflake Properties:')
print(f'Number of sides: {properties["number_of_sides"]}')
print(f'Side length: {properties["side_length"]:.6f}')
print(f'Perimeter: {properties["perimeter"]:.6f}')
print(f'Area: {properties["area"]:.6f}')

# Show how perimeter grows with depth
depths = range(0, 7)
perimeters = [calculate_koch_properties(size, d)['perimeter'] for d in depths]

fig, ax = plt.subplots(1, 1, figsize=(10, 6))
ax.plot(depths, perimeters, 'bo-')
ax.set_xlabel('Depth')
ax.set_ylabel('Perimeter')
ax.set_title('Koch Snowflake Perimeter Growth')
ax.grid(True, alpha=0.3)
plt.show()`,
        cpp: `// C++ Koch Snowflake Generator
#include <iostream>
#include <vector>
#include <cmath>
#include <fstream>

struct Point {
    double x, y;
};

std::vector<Point> kochLine(double x1, double y1, double x2, double y2, int depth) {
    if (depth == 0) {
        return {{x1, y1}, {x2, y2}};
    }

    double dx = x2 - x1;
    double dy = y2 - y1;

    // Calculate the four points
    Point p1 = {x1, y1};
    Point p2 = {x1 + dx / 3, y1 + dy / 3};
    Point p4 = {x1 + 2 * dx / 3, y1 + 2 * dy / 3};
    Point p5 = {x2, y2};

    // Calculate the peak point
    double angle = M_PI / 3; // 60 degrees
    Point p3 = {
        p2.x + (p4.x - p2.x) * cos(angle) - (p4.y - p2.y) * sin(angle),
        p2.y + (p4.x - p2.x) * sin(angle) + (p4.y - p2.y) * cos(angle)
    };

    // Recursively process each segment
    auto segment1 = kochLine(p1.x, p1.y, p2.x, p2.y, depth - 1);
    auto segment2 = kochLine(p2.x, p2.y, p3.x, p3.y, depth - 1);
    auto segment3 = kochLine(p3.x, p3.y, p4.x, p4.y, depth - 1);
    auto segment4 = kochLine(p4.x, p4.y, p5.x, p5.y, depth - 1);

    // Combine all segments
    std::vector<Point> result = segment1;
    result.insert(result.end(), segment2.begin() + 1, segment2.end());
    result.insert(result.end(), segment3.begin() + 1, segment3.end());
    result.insert(result.end(), segment4.begin() + 1, segment4.end());

    return result;
}

void drawKochSnowflake(std::ofstream& file, double centerX, double centerY, double size, int depth) {
    // Calculate the three vertices of the equilateral triangle
    double height = size * sqrt(3) / 2;
    std::vector<Point> vertices = {
        {centerX, centerY - height * 2/3},
        {centerX - size/2, centerY + height * 1/3},
        {centerX + size/2, centerY + height * 1/3}
    };

    file << "<g fill='none' stroke='blue' stroke-width='1'>";

    // Generate Koch curve for each side
    for (int i = 0; i < 3; i++) {
        Point v1 = vertices[i];
        Point v2 = vertices[(i + 1) % 3];

        std::vector<Point> points = kochLine(v1.x, v1.y, v2.x, v2.y, depth);

        file << "<path d='M " << points[0].x << " " << points[0].y;
        for (size_t j = 1; j < points.size(); j++) {
            file << " L " << points[j].x << " " << points[j].y;
        }
        file << "'/>";
    }

    file << "</g>";
}

struct KochProperties {
    int numberOfSides;
    double sideLength;
    double perimeter;
    double area;
};

KochProperties calculateKochProperties(double initialSideLength, int depth) {
    KochProperties props;
    props.numberOfSides = 3 * pow(4, depth);
    props.sideLength = initialSideLength / pow(3, depth);
    props.perimeter = props.numberOfSides * props.sideLength;

    // Area calculation (approximate)
    props.area = (sqrt(3) / 4) * initialSideLength * initialSideLength *
                 (1 + (1.0/3.0) * (1 - pow(4.0/9.0, depth)) / (1 - 4.0/9.0));

    return props;
}

int main() {
    double centerX = 200, centerY = 200;
    double size = 300;
    int depth = 4;

    // Generate SVG
    std::ofstream svgFile("koch_snowflake.svg");
    svgFile << "<svg width='400' height='400' xmlns='http://www.w3.org/2000/svg'>";
    svgFile << "<rect width='400' height='400' fill='white'/>";

    drawKochSnowflake(svgFile, centerX, centerY, size, depth);

    svgFile << "</svg>";
    svgFile.close();

    std::cout << "Koch snowflake generated as koch_snowflake.svg" << std::endl;

    // Calculate and display properties
    KochProperties props = calculateKochProperties(size, depth);
    std::cout << "\\nKoch Snowflake Properties:" << std::endl;
    std::cout << "Number of sides: " << props.numberOfSides << std::endl;
    std::cout << "Side length: " << props.sideLength << std::endl;
    std::cout << "Perimeter: " << props.perimeter << std::endl;
    std::cout << "Area: " << props.area << std::endl;

    // Generate multiple depths for comparison
    for (int d = 0; d <= 6; d++) {
        KochProperties dProps = calculateKochProperties(size, d);
        std::cout << "Depth " << d << ": Perimeter = " << dProps.perimeter << std::endl;
    }

    return 0;
}`
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Fractal Code Examples</CardTitle>
          <CardDescription>
            Learn to generate fractals with code in multiple programming languages
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mandelbrot">Mandelbrot</TabsTrigger>
          <TabsTrigger value="julia">Julia Set</TabsTrigger>
          <TabsTrigger value="sierpinski">Sierpinski</TabsTrigger>
          <TabsTrigger value="koch">Koch Snowflake</TabsTrigger>
        </TabsList>

        {Object.entries(codeExamples).map(([key, fractal]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{fractal.title}</CardTitle>
                <CardDescription>{fractal.description}</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {Object.entries(fractal.languages).map(([lang, code]) => (
                <Card key={lang}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{lang}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(code)}
                      >
                        {copiedCode === code ? 'Copied!' : 'Copy'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                      <pre className="text-sm whitespace-pre-wrap">
                        <code>{code}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>How to Run These Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">JavaScript</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Run in browser console</li>
                      <li>• Use HTML5 Canvas</li>
                      <li>• Node.js with canvas package</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Python</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Install: pip install numpy matplotlib</li>
                      <li>• Run: python fractal.py</li>
                      <li>• Interactive with Jupyter</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">C++</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Compile: g++ fractal.cpp -o fractal</li>
                      <li>• Run: ./fractal</li>
                      <li>• Output: SVG/PPM files</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FractalCodeExamples;
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dataType = searchParams.get('dataType');

    // Build query based on filters
    let where: any = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    // Get nodes from database
    const nodes = await db.harmonicNode.findMany({
      where,
      orderBy: [
        { coherence: 'desc' },
        { name: 'asc' }
      ]
    });

    // Filter by data type if specified
    let filteredNodes = nodes;
    if (dataType) {
      filteredNodes = nodes.filter(node => {
        const supportedTypes = JSON.parse(node.supportedTypes || '[]');
        return supportedTypes.includes(dataType);
      });
    }

    // Transform nodes for response
    const transformedNodes = filteredNodes.map(node => ({
      id: node.id,
      name: node.name,
      status: node.status.toLowerCase(),
      location: node.location,
      coherence: node.coherence,
      lastSync: node.lastSync || new Date().toISOString(),
      dataTypes: JSON.parse(node.supportedTypes || '[]'),
      metadata: node.metadata ? JSON.parse(node.metadata) : null
    }));

    return NextResponse.json({
      success: true,
      nodes: transformedNodes,
      count: transformedNodes.length
    });

  } catch (error) {
    console.error('Failed to fetch harmonic nodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch harmonic nodes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, location, supportedTypes, coherence = 0.8 } = body;

    // Validate required fields
    if (!name || !location || !supportedTypes || !Array.isArray(supportedTypes)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new harmonic node
    const node = await db.harmonicNode.create({
      data: {
        name,
        location,
        coherence,
        supportedTypes: JSON.stringify(supportedTypes),
        status: 'ACTIVE',
        metadata: JSON.stringify({
          createdAt: new Date().toISOString(),
          version: '1.0'
        })
      }
    });

    return NextResponse.json({
      success: true,
      node: {
        id: node.id,
        name: node.name,
        status: node.status.toLowerCase(),
        location: node.location,
        coherence: node.coherence,
        lastSync: node.lastSync,
        dataTypes: supportedTypes,
        metadata: JSON.parse(node.metadata || '{}')
      }
    });

  } catch (error) {
    console.error('Failed to create harmonic node:', error);
    return NextResponse.json(
      { error: 'Failed to create harmonic node' },
      { status: 500 }
    );
  }
}
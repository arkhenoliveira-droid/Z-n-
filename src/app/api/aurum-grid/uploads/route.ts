import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const author = searchParams.get('author');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query based on filters
    let where: any = {};

    if (author) {
      where.author = author;
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    // Get uploads from database
    const [uploads, totalCount] = await Promise.all([
      db.aurumUpload.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: offset,
        take: limit
      }),
      db.aurumUpload.count({ where })
    ]);

    // Transform uploads for response
    const transformedUploads = uploads.map(upload => ({
      id: upload.id,
      name: upload.name,
      type: upload.type.toLowerCase(),
      format: upload.format,
      size: formatFileSize(upload.size),
      status: upload.status.toLowerCase(),
      coherence: upload.coherence,
      resonance: upload.resonance,
      author: upload.author,
      description: upload.description,
      timestamp: upload.timestamp,
      nodeId: upload.nodeId,
      metadata: upload.metadata ? JSON.parse(upload.metadata) : null
    }));

    return NextResponse.json({
      success: true,
      uploads: transformedUploads,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Failed to fetch uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
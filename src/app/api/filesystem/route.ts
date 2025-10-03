import { NextRequest, NextResponse } from 'next/server'

export interface FileSystemEntry {
  path: string
  name: string
  type: 'file' | 'directory' | 'symlink'
  size: number
  modified: Date
  permissions: string
  owner: string
  group: string
  temporalVersions: number
  contentHash?: string
  symlinkTarget?: string
  isHidden: boolean
  metadata: {
    created: Date
    accessed: Date
    attributes: Record<string, any>
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path') || '/'
    const includeHidden = searchParams.get('includeHidden') === 'true'
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Simulate filesystem data
    const entries: FileSystemEntry[] = [
      {
        path: '/home',
        name: 'home',
        type: 'directory',
        size: 4096,
        modified: new Date(),
        permissions: 'drwxr-xr-x',
        owner: 'root',
        group: 'root',
        temporalVersions: 1,
        isHidden: false,
        metadata: {
          created: new Date(Date.now() - 86400000),
          accessed: new Date(),
          attributes: {}
        }
      },
      {
        path: '/etc',
        name: 'etc',
        type: 'directory',
        size: 4096,
        modified: new Date(),
        permissions: 'drwxr-xr-x',
        owner: 'root',
        group: 'root',
        temporalVersions: 5,
        isHidden: false,
        metadata: {
          created: new Date(Date.now() - 86400000),
          accessed: new Date(),
          attributes: {}
        }
      },
      {
        path: '/var',
        name: 'var',
        type: 'directory',
        size: 4096,
        modified: new Date(),
        permissions: 'drwxr-xr-x',
        owner: 'root',
        group: 'root',
        temporalVersions: 3,
        isHidden: false,
        metadata: {
          created: new Date(Date.now() - 86400000),
          accessed: new Date(),
          attributes: {}
        }
      },
      {
        path: '/tmp',
        name: 'tmp',
        type: 'directory',
        size: 4096,
        modified: new Date(),
        permissions: 'drwxrwxrwt',
        owner: 'root',
        group: 'root',
        temporalVersions: 10,
        isHidden: false,
        metadata: {
          created: new Date(Date.now() - 86400000),
          accessed: new Date(),
          attributes: {}
        }
      },
      {
        path: '/usr',
        name: 'usr',
        type: 'directory',
        size: 4096,
        modified: new Date(),
        permissions: 'drwxr-xr-x',
        owner: 'root',
        group: 'root',
        temporalVersions: 2,
        isHidden: false,
        metadata: {
          created: new Date(Date.now() - 86400000),
          accessed: new Date(),
          attributes: {}
        }
      },
      {
        path: '/bin',
        name: 'bin',
        type: 'directory',
        size: 4096,
        modified: new Date(),
        permissions: 'drwxr-xr-x',
        owner: 'root',
        group: 'root',
        temporalVersions: 1,
        isHidden: false,
        metadata: {
          created: new Date(Date.now() - 86400000),
          accessed: new Date(),
          attributes: {}
        }
      },
      {
        path: '/sbin',
        name: 'sbin',
        type: 'directory',
        size: 4096,
        modified: new Date(),
        permissions: 'drwxr-xr-x',
        owner: 'root',
        group: 'root',
        temporalVersions: 1,
        isHidden: false,
        metadata: {
          created: new Date(Date.now() - 86400000),
          accessed: new Date(),
          attributes: {}
        }
      },
      {
        path: '/lib',
        name: 'lib',
        type: 'directory',
        size: 4096,
        modified: new Date(),
        permissions: 'drwxr-xr-x',
        owner: 'root',
        group: 'root',
        temporalVersions: 1,
        isHidden: false,
        metadata: {
          created: new Date(Date.now() - 86400000),
          accessed: new Date(),
          attributes: {}
        }
      },
      {
        path: '/opt',
        name: 'opt',
        type: 'directory',
        size: 4096,
        modified: new Date(),
        permissions: 'drwxr-xr-x',
        owner: 'root',
        group: 'root',
        temporalVersions: 1,
        isHidden: false,
        metadata: {
          created: new Date(Date.now() - 86400000),
          accessed: new Date(),
          attributes: {}
        }
      },
      {
        path: '/root',
        name: 'root',
        type: 'directory',
        size: 4096,
        modified: new Date(),
        permissions: 'drwx------',
        owner: 'root',
        group: 'root',
        temporalVersions: 8,
        isHidden: false,
        metadata: {
          created: new Date(Date.now() - 86400000),
          accessed: new Date(),
          attributes: {}
        }
      },
      {
        path: '/.hidden',
        name: '.hidden',
        type: 'file',
        size: 1024,
        modified: new Date(),
        permissions: '-rw-r--r--',
        owner: 'root',
        group: 'root',
        temporalVersions: 3,
        contentHash: '0x' + Math.random().toString(16).substr(2, 64),
        isHidden: true,
        metadata: {
          created: new Date(Date.now() - 3600000),
          accessed: new Date(),
          attributes: {}
        }
      },
      {
        path: '/system.log',
        name: 'system.log',
        type: 'file',
        size: 51200,
        modified: new Date(),
        permissions: '-rw-r--r--',
        owner: 'root',
        group: 'root',
        temporalVersions: 100,
        contentHash: '0x' + Math.random().toString(16).substr(2, 64),
        isHidden: false,
        metadata: {
          created: new Date(Date.now() - 86400000),
          accessed: new Date(),
          attributes: {}
        }
      }
    ]

    // Filter hidden files if not requested
    let filteredEntries = entries
    if (!includeHidden) {
      filteredEntries = entries.filter(entry => !entry.isHidden)
    }

    // Sort entries
    filteredEntries.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'modified':
          comparison = a.modified.getTime() - b.modified.getTime()
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return NextResponse.json({
      data: filteredEntries,
      path,
      total: filteredEntries.length
    })
  } catch (error) {
    console.error('Error fetching filesystem:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filesystem' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, type, content, permissions } = body

    // Simulate file/directory creation
    const newEntry: FileSystemEntry = {
      path: path,
      name: path.split('/').pop() || '',
      type: type,
      size: content ? content.length : 4096,
      modified: new Date(),
      permissions: permissions || (type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--'),
      owner: 'current-user',
      group: 'current-user',
      temporalVersions: 1,
      contentHash: content ? '0x' + Math.random().toString(16).substr(2, 64) : undefined,
      isHidden: false,
      metadata: {
        created: new Date(),
        accessed: new Date(),
        attributes: {}
      }
    }

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    console.error('Error creating filesystem entry:', error)
    return NextResponse.json(
      { error: 'Failed to create filesystem entry' },
      { status: 500 }
    )
  }
}
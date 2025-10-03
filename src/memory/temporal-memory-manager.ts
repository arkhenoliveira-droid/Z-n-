/**
 * Temporal Memory Manager
 *
 * Manages memory allocation with temporal attributes and historical access capabilities
 * in TimeKeeper OS.
 */

import { EventEmitter } from 'events';
import { ChrononManager } from '../temporal/chronon';
import * as crypto from 'crypto';

export interface TemporalMemoryConfig {
  totalMemory: number;
  chrononManager: ChrononManager;
}

export interface TemporalMemoryBlock {
  id: string;
  address: number;
  size: number;
  allocationChronon: number;
  expirationChronon?: number;
  accessPattern: AccessPattern;
  provenance: MemoryProvenance;
  security: MemorySecurity;
  data: Buffer;
  isFree: boolean;
  processId?: string;
}

export interface AccessPattern {
  lastAccess: number;
  accessCount: number;
  accessFrequency: number;
  temporalLocality: number;
}

export interface MemoryProvenance {
  creatorProcess: string;
  creationReason: string;
  modificationHistory: MemoryModification[];
  accessHistory: MemoryAccess[];
}

export interface MemoryModification {
  chronon: number;
  processId: string;
  operation: 'allocate' | 'write' | 'free';
  size: number;
  checksum: string;
}

export interface MemoryAccess {
  chronon: number;
  processId: string;
  operation: 'read' | 'write';
  address: number;
  size: number;
}

export interface MemorySecurity {
  encryptionKey?: string;
  accessPermissions: AccessPermission[];
  integrityChecksum: string;
  isEncrypted: boolean;
}

export interface AccessPermission {
  processId: string;
  permissions: 'read' | 'write' | 'execute';
  temporalConstraints: {
    startChronon?: number;
    endChronon?: number;
  };
}

export interface MemoryMetrics {
  allocationRate: number;
  fragmentation: number;
  cacheHitRate: number;
  totalAllocated: number;
  totalFree: number;
  averageAccessTime: number;
  evictionRate: number;
}

/**
 * Temporal Memory Manager Implementation
 */
export class TemporalMemoryManager extends EventEmitter {
  private config: TemporalMemoryConfig;
  private memoryBlocks: Map<string, TemporalMemoryBlock> = new Map();
  private freeBlocks: TemporalMemoryBlock[] = [];
  private allocatedBlocks: Set<string> = new Set();
  private memoryMetrics: MemoryMetrics;
  private nextAddress: number = 0;
  private isRunning: boolean = false;
  private garbageCollector: NodeJS.Timeout | null = null;

  constructor(config: TemporalMemoryConfig) {
    super();
    this.config = config;
    this.memoryMetrics = this.initializeMetrics();
  }

  /**
   * Initialize the memory manager
   */
  public async initialize(): Promise<void> {
    console.log('Initializing Temporal Memory Manager...');

    // Create initial free block
    this.createInitialFreeBlock();

    // Start garbage collector
    this.startGarbageCollector();

    // Setup chronon listener
    this.config.chrononManager.on('chronon', (chronon: number) => {
      this.handleChrononAdvance(chronon);
    });

    this.isRunning = true;
    console.log('Temporal Memory Manager initialized successfully');
  }

  /**
   * Initialize memory metrics
   */
  private initializeMetrics(): MemoryMetrics {
    return {
      allocationRate: 0,
      fragmentation: 0,
      cacheHitRate: 0,
      totalAllocated: 0,
      totalFree: this.config.totalMemory,
      averageAccessTime: 0,
      evictionRate: 0
    };
  }

  /**
   * Create initial free block
   */
  private createInitialFreeBlock(): void {
    const initialBlock: TemporalMemoryBlock = {
      id: this.generateBlockId(),
      address: 0,
      size: this.config.totalMemory,
      allocationChronon: this.config.chrononManager.getCurrentChronon(),
      accessPattern: {
        lastAccess: 0,
        accessCount: 0,
        accessFrequency: 0,
        temporalLocality: 0
      },
      provenance: {
        creatorProcess: 'system',
        creationReason: 'initial_allocation',
        modificationHistory: [],
        accessHistory: []
      },
      security: {
        accessPermissions: [],
        integrityChecksum: '',
        isEncrypted: false
      },
      data: Buffer.alloc(this.config.totalMemory),
      isFree: true
    };

    this.memoryBlocks.set(initialBlock.id, initialBlock);
    this.freeBlocks.push(initialBlock);
  }

  /**
   * Allocate memory block
   */
  public async allocate(
    size: number,
    processId: string,
    expirationChronon?: number,
    security?: Partial<MemorySecurity>
  ): Promise<TemporalMemoryBlock> {
    // Find suitable free block
    const freeBlock = this.findSuitableFreeBlock(size);
    if (!freeBlock) {
      throw new Error('Insufficient memory available');
    }

    // Split block if necessary
    if (freeBlock.size > size) {
      this.splitBlock(freeBlock, size);
    }

    // Allocate the block
    const allocatedBlock = this.memoryBlocks.get(freeBlock.id);
    if (!allocatedBlock) {
      throw new Error('Block not found');
    }

    allocatedBlock.isFree = false;
    allocatedBlock.processId = processId;
    allocatedBlock.expirationChronon = expirationChronon;
    allocatedBlock.allocationChronon = this.config.chrononManager.getCurrentChronon();

    // Apply security settings
    if (security) {
      allocatedBlock.security = { ...allocatedBlock.security, ...security };
    }

    // Update provenance
    allocatedBlock.provenance.modificationHistory.push({
      chronon: allocatedBlock.allocationChronon,
      processId,
      operation: 'allocate',
      size,
      checksum: this.calculateChecksum(allocatedBlock.data)
    });

    // Update metrics
    this.memoryMetrics.totalAllocated += size;
    this.memoryMetrics.totalFree -= size;
    this.memoryMetrics.allocationRate++;

    // Remove from free blocks
    const freeIndex = this.freeBlocks.findIndex(b => b.id === freeBlock.id);
    if (freeIndex !== -1) {
      this.freeBlocks.splice(freeIndex, 1);
    }

    // Add to allocated blocks
    this.allocatedBlocks.add(allocatedBlock.id);

    this.emit('memoryAllocated', allocatedBlock.id, size);
    console.log(`Allocated ${size} bytes for process ${processId}`);

    return allocatedBlock;
  }

  /**
   * Find suitable free block using first-fit algorithm
   */
  private findSuitableFreeBlock(size: number): TemporalMemoryBlock | null {
    for (const block of this.freeBlocks) {
      if (block.size >= size) {
        return block;
      }
    }
    return null;
  }

  /**
   * Split a memory block
   */
  private splitBlock(block: TemporalMemoryBlock, size: number): void {
    if (block.size <= size + 64) { // Don't split if remaining space is too small
      return;
    }

    // Create new free block from remaining space
    const newBlock: TemporalMemoryBlock = {
      id: this.generateBlockId(),
      address: block.address + size,
      size: block.size - size,
      allocationChronon: this.config.chrononManager.getCurrentChronon(),
      accessPattern: {
        lastAccess: 0,
        accessCount: 0,
        accessFrequency: 0,
        temporalLocality: 0
      },
      provenance: {
        creatorProcess: 'system',
        creationReason: 'block_split',
        modificationHistory: [],
        accessHistory: []
      },
      security: {
        accessPermissions: [],
        integrityChecksum: '',
        isEncrypted: false
      },
      data: block.data.slice(size),
      isFree: true
    };

    // Update original block
    block.size = size;
    block.data = block.data.slice(0, size);

    // Add new block to memory
    this.memoryBlocks.set(newBlock.id, newBlock);
    this.freeBlocks.push(newBlock);
  }

  /**
   * Free memory block
   */
  public async free(blockId: string, processId: string): Promise<boolean> {
    const block = this.memoryBlocks.get(blockId);
    if (!block) {
      return false;
    }

    if (block.isFree) {
      return true; // Already free
    }

    // Check permissions
    if (!this.hasAccessPermission(block, processId, 'write')) {
      throw new Error('Access denied');
    }

    // Free the block
    block.isFree = true;
    block.processId = undefined;

    // Update provenance
    block.provenance.modificationHistory.push({
      chronon: this.config.chrononManager.getCurrentChronon(),
      processId,
      operation: 'free',
      size: block.size,
      checksum: this.calculateChecksum(block.data)
    });

    // Update metrics
    this.memoryMetrics.totalAllocated -= block.size;
    this.memoryMetrics.totalFree += block.size;

    // Remove from allocated blocks
    this.allocatedBlocks.delete(blockId);

    // Add to free blocks
    this.freeBlocks.push(block);

    // Try to merge with adjacent free blocks
    this.mergeAdjacentBlocks(block);

    this.emit('memoryFreed', blockId, block.size);
    console.log(`Freed ${block.size} bytes from process ${processId}`);

    return true;
  }

  /**
   * Merge adjacent free blocks
   */
  private mergeAdjacentBlocks(block: TemporalMemoryBlock): void {
    const adjacentBlocks = this.findAdjacentBlocks(block);

    for (const adjacent of adjacentBlocks) {
      if (adjacent.isFree) {
        // Merge blocks
        block.size += adjacent.size;
        block.data = Buffer.concat([block.data, adjacent.data]);

        // Remove adjacent block
        this.memoryBlocks.delete(adjacent.id);
        const freeIndex = this.freeBlocks.findIndex(b => b.id === adjacent.id);
        if (freeIndex !== -1) {
          this.freeBlocks.splice(freeIndex, 1);
        }

        // Update provenance
        block.provenance.modificationHistory.push({
          chronon: this.config.chrononManager.getCurrentChronon(),
          processId: 'system',
          operation: 'allocate',
          size: block.size,
          checksum: this.calculateChecksum(block.data)
        });
      }
    }
  }

  /**
   * Find adjacent blocks
   */
  private findAdjacentBlocks(block: TemporalMemoryBlock): TemporalMemoryBlock[] {
    const adjacent: TemporalMemoryBlock[] = [];

    for (const otherBlock of this.memoryBlocks.values()) {
      if (otherBlock.id === block.id) continue;

      // Check if blocks are adjacent
      if (otherBlock.address === block.address + block.size ||
          block.address === otherBlock.address + otherBlock.size) {
        adjacent.push(otherBlock);
      }
    }

    return adjacent;
  }

  /**
   * Read from memory block
   */
  public async read(
    blockId: string,
    offset: number,
    size: number,
    processId: string
  ): Promise<Buffer> {
    const block = this.memoryBlocks.get(blockId);
    if (!block) {
      throw new Error('Block not found');
    }

    // Check permissions
    if (!this.hasAccessPermission(block, processId, 'read')) {
      throw new Error('Access denied');
    }

    // Check bounds
    if (offset + size > block.size) {
      throw new Error('Read out of bounds');
    }

    // Update access pattern
    this.updateAccessPattern(block, processId, 'read');

    // Read data
    const data = block.data.slice(offset, offset + size);

    // Update provenance
    block.provenance.accessHistory.push({
      chronon: this.config.chrononManager.getCurrentChronon(),
      processId,
      operation: 'read',
      address: block.address + offset,
      size
    });

    this.emit('memoryRead', blockId, offset, size);

    return data;
  }

  /**
   * Write to memory block
   */
  public async write(
    blockId: string,
    offset: number,
    data: Buffer,
    processId: string
  ): Promise<void> {
    const block = this.memoryBlocks.get(blockId);
    if (!block) {
      throw new Error('Block not found');
    }

    // Check permissions
    if (!this.hasAccessPermission(block, processId, 'write')) {
      throw new Error('Access denied');
    }

    // Check bounds
    if (offset + data.length > block.size) {
      throw new Error('Write out of bounds');
    }

    // Write data
    data.copy(block.data, offset);

    // Update access pattern
    this.updateAccessPattern(block, processId, 'write');

    // Update provenance
    block.provenance.modificationHistory.push({
      chronon: this.config.chrononManager.getCurrentChronon(),
      processId,
      operation: 'write',
      size: data.length,
      checksum: this.calculateChecksum(block.data)
    });

    block.provenance.accessHistory.push({
      chronon: this.config.chrononManager.getCurrentChronon(),
      processId,
      operation: 'write',
      address: block.address + offset,
      size: data.length
    });

    // Update security checksum
    block.security.integrityChecksum = this.calculateChecksum(block.data);

    this.emit('memoryWritten', blockId, offset, data.length);
  }

  /**
   * Check access permissions
   */
  private hasAccessPermission(
    block: TemporalMemoryBlock,
    processId: string,
    permission: 'read' | 'write' | 'execute'
  ): boolean {
    const currentChronon = this.config.chrononManager.getCurrentChronon();

    for (const perm of block.security.accessPermissions) {
      if (perm.processId === processId && perm.permissions === permission) {
        // Check temporal constraints
        if (perm.temporalConstraints.startChronon &&
            currentChronon < perm.temporalConstraints.startChronon) {
          return false;
        }

        if (perm.temporalConstraints.endChronon &&
            currentChronon > perm.temporalConstraints.endChronon) {
          return false;
        }

        return true;
      }
    }

    return false;
  }

  /**
   * Update access pattern
   */
  private updateAccessPattern(
    block: TemporalMemoryBlock,
    processId: string,
    operation: 'read' | 'write'
  ): void {
    const currentChronon = this.config.chrononManager.getCurrentChronon();

    block.accessPattern.lastAccess = currentChronon;
    block.accessPattern.accessCount++;

    // Calculate access frequency
    const recentAccesses = block.provenance.accessHistory.filter(
      access => currentChronon - access.chronon < 1000
    );
    block.accessPattern.accessFrequency = recentAccesses.length;

    // Calculate temporal locality
    if (block.provenance.accessHistory.length > 0) {
      const lastAccess = block.provenance.accessHistory[block.provenance.accessHistory.length - 1];
      block.accessPattern.temporalLocality = currentChronon - lastAccess.chronon;
    }
  }

  /**
   * Calculate checksum
   */
  private calculateChecksum(data: Buffer): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  /**
   * Generate block ID
   */
  private generateBlockId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle chronon advance
   */
  private handleChrononAdvance(chronon: number): void {
    // Check for expired blocks
    this.checkExpiredBlocks(chronon);

    // Update memory metrics
    this.updateMemoryMetrics();
  }

  /**
   * Check for expired blocks
   */
  private checkExpiredBlocks(chronon: number): void {
    const expiredBlocks: string[] = [];

    for (const [blockId, block] of this.memoryBlocks) {
      if (block.expirationChronon && chronon >= block.expirationChronon) {
        expiredBlocks.push(blockId);
      }
    }

    // Free expired blocks
    for (const blockId of expiredBlocks) {
      this.free(blockId, 'system').catch(error => {
        console.error(`Failed to free expired block ${blockId}:`, error);
      });
    }
  }

  /**
   * Update memory metrics
   */
  private updateMemoryMetrics(): void {
    // Calculate fragmentation
    const totalBlocks = this.freeBlocks.length;
    const largestBlock = this.freeBlocks.reduce((max, block) =>
      Math.max(max, block.size), 0);
    const totalFree = this.freeBlocks.reduce((sum, block) => sum + block.size, 0);

    this.memoryMetrics.fragmentation = totalFree > 0 ?
      1 - (largestBlock / totalFree) : 0;

    // Calculate cache hit rate (simplified)
    const totalAccesses = Array.from(this.memoryBlocks.values())
      .reduce((sum, block) => sum + block.accessPattern.accessCount, 0);

    if (totalAccesses > 0) {
      const cacheHits = Array.from(this.memoryBlocks.values())
        .reduce((sum, block) => sum + Math.min(block.accessPattern.accessFrequency, 1), 0);
      this.memoryMetrics.cacheHitRate = cacheHits / totalAccesses;
    }
  }

  /**
   * Start garbage collector
   */
  private startGarbageCollector(): void {
    this.garbageCollector = setInterval(() => {
      this.collectGarbage();
    }, 5000); // Run every 5 seconds
  }

  /**
   * Collect garbage
   */
  private collectGarbage(): void {
    // Merge adjacent free blocks
    const mergedBlocks = new Set<string>();

    for (const block of this.freeBlocks) {
      if (!mergedBlocks.has(block.id)) {
        this.mergeAdjacentBlocks(block);
        mergedBlocks.add(block.id);
      }
    }

    // Update metrics
    this.updateMemoryMetrics();

    this.emit('garbageCollected');
  }

  /**
   * Get memory block by ID
   */
  public getMemoryBlock(blockId: string): TemporalMemoryBlock | null {
    return this.memoryBlocks.get(blockId) || null;
  }

  /**
   * Get all memory blocks
   */
  public getAllMemoryBlocks(): TemporalMemoryBlock[] {
    return Array.from(this.memoryBlocks.values());
  }

  /**
   * Get memory metrics
   */
  public getMemoryMetrics(): MemoryMetrics {
    return { ...this.memoryMetrics };
  }

  /**
   * Get memory statistics
   */
  public getMemoryStatistics(): {
    totalMemory: number;
    usedMemory: number;
    freeMemory: number;
    fragmentation: number;
    blockCount: number;
    averageBlockSize: number;
  } {
    const totalMemory = this.config.totalMemory;
    const usedMemory = this.memoryMetrics.totalAllocated;
    const freeMemory = this.memoryMetrics.totalFree;
    const blockCount = this.memoryBlocks.size;
    const averageBlockSize = blockCount > 0 ? totalMemory / blockCount : 0;

    return {
      totalMemory,
      usedMemory,
      freeMemory,
      fragmentation: this.memoryMetrics.fragmentation,
      blockCount,
      averageBlockSize
    };
  }

  /**
   * Get historical memory state
   */
  public getHistoricalMemoryState(chronon: number): {
    blocks: TemporalMemoryBlock[];
    totalAllocated: number;
    totalFree: number;
  } {
    const blocksAtChronon: TemporalMemoryBlock[] = [];
    let totalAllocated = 0;
    let totalFree = 0;

    for (const block of this.memoryBlocks.values()) {
      // Check if block existed at this chronon
      if (block.allocationChronon <= chronon) {
        const blockCopy = { ...block };

        // Apply modifications up to this chronon
        const modifications = block.provenance.modificationHistory
          .filter(mod => mod.chronon <= chronon);

        if (modifications.length > 0) {
          const lastMod = modifications[modifications.length - 1];
          if (lastMod.operation === 'free') {
            blockCopy.isFree = true;
            blockCopy.processId = undefined;
          }
        }

        blocksAtChronon.push(blockCopy);

        if (blockCopy.isFree) {
          totalFree += blockCopy.size;
        } else {
          totalAllocated += blockCopy.size;
        }
      }
    }

    return {
      blocks: blocksAtChronon,
      totalAllocated,
      totalFree
    };
  }

  /**
   * Shutdown the memory manager
   */
  public async shutdown(): Promise<void> {
    console.log('Shutting down Temporal Memory Manager...');

    this.isRunning = false;

    // Stop garbage collector
    if (this.garbageCollector) {
      clearInterval(this.garbageCollector);
      this.garbageCollector = null;
    }

    // Free all allocated blocks
    const allocatedIds = Array.from(this.allocatedBlocks);
    for (const blockId of allocatedIds) {
      this.free(blockId, 'system').catch(error => {
        console.error(`Failed to free block ${blockId} during shutdown:`, error);
      });
    }

    console.log('Temporal Memory Manager shutdown completed');
  }

  /**
   * Test memory manager functionality
   */
  public async test(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Testing Temporal Memory Manager...');

      // Test memory allocation
      const block1 = await this.allocate(1024, 'test_process');
      if (!block1 || block1.size !== 1024) {
        return { success: false, error: 'Memory allocation failed' };
      }

      // Test memory write
      const testData = Buffer.from('test data', 'utf8');
      await this.write(block1.id, 0, testData, 'test_process');

      // Test memory read
      const readData = await this.read(block1.id, 0, testData.length, 'test_process');
      if (!readData.equals(testData)) {
        return { success: false, error: 'Memory read/write failed' };
      }

      // Test memory free
      const freed = await this.free(block1.id, 'test_process');
      if (!freed) {
        return { success: false, error: 'Memory free failed' };
      }

      // Test memory statistics
      const stats = this.getMemoryStatistics();
      if (stats.totalMemory !== this.config.totalMemory) {
        return { success: false, error: 'Memory statistics failed' };
      }

      // Test historical state
      const currentChronon = this.config.chrononManager.getCurrentChronon();
      const historical = this.getHistoricalMemoryState(currentChronon);
      if (historical.blocks.length === 0) {
        return { success: false, error: 'Historical state failed' };
      }

      console.log('Temporal Memory Manager test completed successfully');
      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
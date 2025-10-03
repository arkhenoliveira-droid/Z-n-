/**
 * Chronon Manager
 *
 * Manages TimeChain chronons - the fundamental temporal units of the TimeChain protocol.
 * Each chronon represents a discrete unit of time that is agreed upon through consensus.
 */

import { EventEmitter } from 'events';
import { VDF } from '../crypto/vdf';
import * as crypto from 'crypto';

export interface ChrononManagerConfig {
  interval: number; // Duration of one chronon in milliseconds
  vdf: VDF;
}

export interface ChrononInfo {
  number: number;
  timestamp: number;
  hash: string;
  previousHash: string;
  vdfChallenge: any;
  vdfProof: any;
  transactions: any[];
}

export interface SynchronizationMetrics {
  deviation: number;
  lastSync: number;
  syncAttempts: number;
  syncSuccess: number;
}

/**
 * Chronon Manager Implementation
 */
export class ChrononManager extends EventEmitter {
  private config: ChrononManagerConfig;
  private currentChronon: number = 0;
  private chronons: Map<number, ChrononInfo> = new Map();
  private isRunning: boolean = false;
  private chrononTimer: NodeJS.Timeout | null = null;
  private syncMetrics: SynchronizationMetrics;

  constructor(config: ChrononManagerConfig) {
    super();
    this.config = config;
    this.syncMetrics = {
      deviation: 0,
      lastSync: Date.now(),
      syncAttempts: 0,
      syncSuccess: 0
    };
  }

  /**
   * Initialize the chronon manager
   */
  public async initialize(): Promise<void> {
    console.log('Initializing Chronon Manager...');

    // Create genesis chronon
    await this.createGenesisChronon();

    // Start chronon advancement
    this.startChrononAdvancement();

    this.isRunning = true;
    console.log('Chronon Manager initialized successfully');
  }

  /**
   * Create the genesis chronon
   */
  private async createGenesisChronon(): Promise<void> {
    const genesisChronon: ChrononInfo = {
      number: 0,
      timestamp: Date.now(),
      hash: this.generateGenesisHash(),
      previousHash: '0'.repeat(64),
      vdfChallenge: null,
      vdfProof: null,
      transactions: []
    };

    this.chronons.set(0, genesisChronon);
    this.currentChronon = 0;

    this.emit('chrononCreated', genesisChronon);
  }

  /**
   * Generate genesis hash
   */
  private generateGenesisHash(): string {
    const genesisData = {
      timestamp: Date.now(),
      message: 'TimeChain Genesis Chronon',
      version: '1.0'
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(genesisData))
      .digest('hex');
  }

  /**
   * Start chronon advancement
   */
  private startChrononAdvancement(): void {
    this.chrononTimer = setInterval(() => {
      this.advanceChronon();
    }, this.config.interval);
  }

  /**
   * Advance to the next chronon
   */
  public async advanceChronon(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      const previousChronon = this.chronons.get(this.currentChronon);
      if (!previousChronon) {
        throw new Error(`Previous chronon ${this.currentChronon} not found`);
      }

      // Generate VDF challenge
      const vdfChallenge = this.config.vdf.generateChallenge();

      // Compute VDF proof
      const vdfProof = await this.config.vdf.compute(vdfChallenge);

      // Create new chronon
      const newChronon: ChrononInfo = {
        number: this.currentChronon + 1,
        timestamp: Date.now(),
        hash: this.generateChrononHash(previousChronon, vdfProof),
        previousHash: previousChronon.hash,
        vdfChallenge,
        vdfProof,
        transactions: []
      };

      // Store chronon
      this.chronons.set(newChronon.number, newChronon);
      this.currentChronon = newChronon.number;

      // Emit events
      this.emit('chronon', newChronon.number);
      this.emit('chrononCreated', newChronon);

      // Update synchronization metrics
      this.updateSyncMetrics(true);

    } catch (error) {
      console.error('Failed to advance chronon:', error);
      this.updateSyncMetrics(false);
      this.emit('chrononError', error);
    }
  }

  /**
   * Generate chronon hash
   */
  private generateChrononHash(previousChronon: ChrononInfo, vdfProof: any): string {
    const chrononData = {
      number: previousChronon.number + 1,
      timestamp: Date.now(),
      previousHash: previousChronon.hash,
      vdfOutput: vdfProof.output.toString('hex'),
      vdfProof: vdfProof.proof.toString('hex')
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(chrononData))
      .digest('hex');
  }

  /**
   * Get current chronon number
   */
  public getCurrentChronon(): number {
    return this.currentChronon;
  }

  /**
   * Get chronon info by number
   */
  public getChrononInfo(chrononNumber: number): ChrononInfo | null {
    return this.chronons.get(chrononNumber) || null;
  }

  /**
   * Get recent chronons
   */
  public getRecentChronons(count: number = 10): ChrononInfo[] {
    const recent: ChrononInfo[] = [];
    const start = Math.max(0, this.currentChronon - count + 1);

    for (let i = start; i <= this.currentChronon; i++) {
      const chronon = this.chronons.get(i);
      if (chronon) {
        recent.push(chronon);
      }
    }

    return recent.reverse();
  }

  /**
   * Get chronon range
   */
  public getChrononRange(start: number, end: number): ChrononInfo[] {
    const range: ChrononInfo[] = [];

    for (let i = start; i <= end && i <= this.currentChronon; i++) {
      const chronon = this.chronons.get(i);
      if (chronon) {
        range.push(chronon);
      }
    }

    return range;
  }

  /**
   * Add transaction to current chronon
   */
  public addTransactionToChronon(transaction: any): boolean {
    const currentChronon = this.chronons.get(this.currentChronon);
    if (!currentChronon) {
      return false;
    }

    currentChronon.transactions.push(transaction);
    this.emit('transactionAdded', transaction);

    return true;
  }

  /**
   * Get transactions from chronon
   */
  public getChrononTransactions(chrononNumber: number): any[] {
    const chronon = this.chronons.get(chrononNumber);
    return chronon ? chronon.transactions : [];
  }

  /**
   * Synchronize with external time source
   */
  public async synchronize(externalTime: number): Promise<boolean> {
    this.syncMetrics.syncAttempts++;

    try {
      const internalTime = Date.now();
      const deviation = Math.abs(externalTime - internalTime);

      // Update metrics
      this.syncMetrics.deviation = deviation;
      this.syncMetrics.lastSync = internalTime;

      // Check if deviation is within acceptable bounds
      const maxDeviation = this.config.interval * 0.1; // 10% of chronon interval
      if (deviation > maxDeviation) {
        console.warn(`Time deviation detected: ${deviation}ms (max: ${maxDeviation}ms)`);

        // Adjust chronon timing if necessary
        await this.adjustChrononTiming(deviation);
      }

      this.syncMetrics.syncSuccess++;
      this.emit('synchronized', { deviation, externalTime, internalTime });

      return true;

    } catch (error) {
      console.error('Synchronization failed:', error);
      this.emit('synchronizationError', error);
      return false;
    }
  }

  /**
   * Adjust chronon timing based on deviation
   */
  private async adjustChrononTiming(deviation: number): Promise<void> {
    // Stop current timer
    if (this.chrononTimer) {
      clearInterval(this.chrononTimer);
      this.chrononTimer = null;
    }

    // Calculate adjustment
    const adjustment = deviation > 0 ? -deviation / 2 : deviation / 2;
    const adjustedInterval = this.config.interval + adjustment;

    console.log(`Adjusting chronon interval from ${this.config.interval}ms to ${adjustedInterval}ms`);

    // Restart timer with adjusted interval
    this.chrononTimer = setInterval(() => {
      this.advanceChronon();
    }, adjustedInterval);

    // Schedule return to normal interval
    setTimeout(() => {
      if (this.chrononTimer) {
        clearInterval(this.chrononTimer);
        this.chrononTimer = setInterval(() => {
          this.advanceChronon();
        }, this.config.interval);
        console.log('Chronon interval restored to normal');
      }
    }, 60000); // After 1 minute
  }

  /**
   * Update synchronization metrics
   */
  private updateSyncMetrics(success: boolean): void {
    if (success) {
      this.syncMetrics.syncSuccess++;
    }
    this.syncMetrics.lastSync = Date.now();
  }

  /**
   * Get synchronization metrics
   */
  public getSynchronizationMetrics(): SynchronizationMetrics {
    return { ...this.syncMetrics };
  }

  /**
   * Get chronon statistics
   */
  public getChrononStatistics(): {
    totalChronons: number;
    averageBlockTime: number;
    transactionsPerChronon: number;
    hashRate: number;
  } {
    const totalChronons = this.chronons.size;
    const recentChronons = this.getRecentChronons(100);

    // Calculate average block time
    let totalBlockTime = 0;
    for (let i = 1; i < recentChronons.length; i++) {
      totalBlockTime += recentChronons[i - 1].timestamp - recentChronons[i].timestamp;
    }
    const averageBlockTime = recentChronons.length > 1 ? totalBlockTime / (recentChronons.length - 1) : 0;

    // Calculate transactions per chronon
    const totalTransactions = recentChronons.reduce((sum, chronon) => sum + chronon.transactions.length, 0);
    const transactionsPerChronon = recentChronons.length > 0 ? totalTransactions / recentChronons.length : 0;

    // Calculate hash rate (simplified)
    const hashRate = averageBlockTime > 0 ? 1000 / averageBlockTime : 0;

    return {
      totalChronons,
      averageBlockTime,
      transactionsPerChronon,
      hashRate
    };
  }

  /**
   * Validate chronon chain
   */
  public validateChrononChain(): boolean {
    if (this.chronons.size === 0) {
      return false;
    }

    // Check genesis chronon
    const genesis = this.chronons.get(0);
    if (!genesis || genesis.number !== 0 || genesis.previousHash !== '0'.repeat(64)) {
      return false;
    }

    // Validate chain continuity
    for (let i = 1; i <= this.currentChronon; i++) {
      const current = this.chronons.get(i);
      const previous = this.chronons.get(i - 1);

      if (!current || !previous) {
        return false;
      }

      if (current.previousHash !== previous.hash) {
        return false;
      }

      if (current.number !== i) {
        return false;
      }
    }

    return true;
  }

  /**
   * Shutdown the chronon manager
   */
  public async shutdown(): Promise<void> {
    console.log('Shutting down Chronon Manager...');

    this.isRunning = false;

    if (this.chrononTimer) {
      clearInterval(this.chrononTimer);
      this.chrononTimer = null;
    }

    console.log('Chronon Manager shutdown completed');
  }

  /**
   * Test chronon manager functionality
   */
  public async test(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Testing Chronon Manager...');

      // Test chronon creation
      if (this.currentChronon !== 0) {
        return { success: false, error: 'Genesis chronon not created' };
      }

      // Test chronon advancement
      await this.advanceChronon();
      if (this.currentChronon !== 1) {
        return { success: false, error: 'Chronon advancement failed' };
      }

      // Test chronon retrieval
      const chronon = this.getChrononInfo(1);
      if (!chronon || chronon.number !== 1) {
        return { success: false, error: 'Chronon retrieval failed' };
      }

      // Test recent chronons
      const recent = this.getRecentChronons(5);
      if (recent.length === 0) {
        return { success: false, error: 'Recent chronons retrieval failed' };
      }

      // Test transaction addition
      const testTransaction = { type: 'test', data: 'test' };
      const added = this.addTransactionToChronon(testTransaction);
      if (!added) {
        return { success: false, error: 'Transaction addition failed' };
      }

      // Test transaction retrieval
      const transactions = this.getChrononTransactions(this.currentChronon);
      if (!transactions.includes(testTransaction)) {
        return { success: false, error: 'Transaction retrieval failed' };
      }

      // Test chain validation
      const isValid = this.validateChrononChain();
      if (!isValid) {
        return { success: false, error: 'Chain validation failed' };
      }

      console.log('Chronon Manager test completed successfully');
      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
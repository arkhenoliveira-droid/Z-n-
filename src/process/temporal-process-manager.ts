/**
 * Temporal Process Manager
 *
 * Manages processes in TimeKeeper OS with temporal scheduling and execution capabilities.
 * Processes can be scheduled for specific chronons and have temporal constraints.
 */

import { EventEmitter } from 'events';
import { ChrononManager } from '../temporal/chronon';

export interface TemporalProcessConfig {
  maxProcesses: number;
  chrononManager: ChrononManager;
}

export interface TemporalProcess {
  id: string;
  name: string;
  command: string;
  args: string[];
  pid: number;
  state: 'created' | 'ready' | 'running' | 'blocked' | 'terminated';
  priority: number;
  creationChronon: number;
  executionChronon?: number;
  terminationChronon?: number;
  temporalConstraints: TemporalConstraints;
  resourceUsage: ResourceUsage;
  parent?: string;
  children: string[];
  exitCode?: number;
  stdout: string[];
  stderr: string[];
}

export interface TemporalConstraints {
  executeAfter?: number;  // Execute after this chronon
  executeBefore?: number; // Execute before this chronon
  timeout?: number;       // Timeout in chronons
  dependencies?: string[]; // Process dependencies
  recurring?: {
    interval: number;
    endTime?: number;
  };
}

export interface ResourceUsage {
  cpuTime: number;
  memoryUsage: number;
  diskIO: number;
  networkIO: number;
}

export interface SchedulingMetrics {
  latency: number;
  throughput: number;
  contextSwitches: number;
  queueLength: number;
}

/**
 * Temporal Process Manager Implementation
 */
export class TemporalProcessManager extends EventEmitter {
  private config: TemporalProcessConfig;
  private processes: Map<string, TemporalProcess> = new Map();
  private readyQueue: string[] = [];
  private runningProcesses: Set<string> = new Set();
  private blockedProcesses: Set<string> = new Set();
  private schedulingMetrics: SchedulingMetrics;
  private nextPid: number = 1;
  private isRunning: boolean = false;
  private schedulerTimer: NodeJS.Timeout | null = null;

  constructor(config: TemporalProcessConfig) {
    super();
    this.config = config;
    this.schedulingMetrics = {
      latency: 0,
      throughput: 0,
      contextSwitches: 0,
      queueLength: 0
    };
  }

  /**
   * Initialize the process manager
   */
  public async initialize(): Promise<void> {
    console.log('Initializing Temporal Process Manager...');

    // Setup chronon listener
    this.config.chrononManager.on('chronon', (chronon: number) => {
      this.handleChrononAdvance(chronon);
    });

    // Start scheduler
    this.startScheduler();

    this.isRunning = true;
    console.log('Temporal Process Manager initialized successfully');
  }

  /**
   * Create a new temporal process
   */
  public async createProcess(
    command: string,
    args: string[],
    constraints: TemporalConstraints = {}
  ): Promise<TemporalProcess> {
    if (this.processes.size >= this.config.maxProcesses) {
      throw new Error('Maximum process limit reached');
    }

    const processId = this.generateProcessId();
    const pid = this.nextPid++;

    const process: TemporalProcess = {
      id: processId,
      name: this.extractProcessName(command),
      command,
      args,
      pid,
      state: 'created',
      priority: 0,
      creationChronon: this.config.chrononManager.getCurrentChronon(),
      temporalConstraints: constraints,
      resourceUsage: {
        cpuTime: 0,
        memoryUsage: 0,
        diskIO: 0,
        networkIO: 0
      },
      children: [],
      stdout: [],
      stderr: []
    };

    this.processes.set(processId, process);

    // Check if process can be scheduled immediately
    if (this.canExecuteNow(process)) {
      this.readyQueue.push(processId);
      process.state = 'ready';
    } else {
      this.blockedProcesses.add(processId);
      process.state = 'blocked';
    }

    this.emit('processCreated', processId);
    console.log(`Created process ${processId} (${process.name})`);

    return process;
  }

  /**
   * Extract process name from command
   */
  private extractProcessName(command: string): string {
    const parts = command.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Generate unique process ID
   */
  private generateProcessId(): string {
    return `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if process can be executed now
   */
  private canExecuteNow(process: TemporalProcess): boolean {
    const currentChronon = this.config.chrononManager.getCurrentChronon();

    // Check execution time constraints
    if (process.temporalConstraints.executeAfter &&
        currentChronon < process.temporalConstraints.executeAfter) {
      return false;
    }

    if (process.temporalConstraints.executeBefore &&
        currentChronon > process.temporalConstraints.executeBefore) {
      return false;
    }

    // Check dependencies
    if (process.temporalConstraints.dependencies) {
      for (const depId of process.temporalConstraints.dependencies) {
        const depProcess = this.processes.get(depId);
        if (!depProcess || depProcess.state !== 'terminated') {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Handle chronon advance
   */
  private handleChrononAdvance(chronon: number): void {
    // Check blocked processes for readiness
    const toUnblock: string[] = [];

    for (const processId of this.blockedProcesses) {
      const process = this.processes.get(processId);
      if (process && this.canExecuteNow(process)) {
        toUnblock.push(processId);
      }
    }

    // Unblock processes
    for (const processId of toUnblock) {
      this.blockedProcesses.delete(processId);
      this.readyQueue.push(processId);
      const process = this.processes.get(processId);
      if (process) {
        process.state = 'ready';
      }
    }

    // Check for timeouts
    this.checkProcessTimeouts(chronon);

    // Handle recurring processes
    this.handleRecurringProcesses(chronon);
  }

  /**
   * Check for process timeouts
   */
  private checkProcessTimeouts(chronon: number): void {
    for (const [processId, process] of this.processes) {
      if (process.temporalConstraints.timeout) {
        const executionDuration = chronon - (process.executionChronon || process.creationChronon);

        if (executionDuration > process.temporalConstraints.timeout) {
          this.terminateProcess(processId, 'timeout');
        }
      }
    }
  }

  /**
   * Handle recurring processes
   */
  private handleRecurringProcesses(chronon: number): void {
    for (const [processId, process] of this.processes) {
      if (process.state === 'terminated' && process.temporalConstraints.recurring) {
        const recurring = process.temporalConstraints.recurring;

        if (chronon >= process.terminationChronon! + recurring.interval) {
          if (!recurring.endTime || chronon <= recurring.endTime) {
            // Create new instance of recurring process
            this.createProcess(process.command, process.args, {
              ...process.temporalConstraints,
              executeAfter: chronon
            });
          }
        }
      }
    }
  }

  /**
   * Start the scheduler
   */
  private startScheduler(): void {
    this.schedulerTimer = setInterval(() => {
      this.scheduleProcesses();
    }, 100); // Schedule every 100ms
  }

  /**
   * Schedule processes for execution
   */
  private scheduleProcesses(): void {
    if (this.readyQueue.length === 0) {
      return;
    }

    // Sort ready queue by priority
    this.readyQueue.sort((a, b) => {
      const processA = this.processes.get(a);
      const processB = this.processes.get(b);
      return (processB?.priority || 0) - (processA?.priority || 0);
    });

    // Execute processes
    while (this.readyQueue.length > 0 &&
           this.runningProcesses.size < this.config.maxProcesses) {
      const processId = this.readyQueue.shift()!;
      this.executeProcess(processId);
    }

    // Update metrics
    this.schedulingMetrics.queueLength = this.readyQueue.length;
  }

  /**
   * Execute a process
   */
  private async executeProcess(processId: string): Promise<void> {
    const process = this.processes.get(processId);
    if (!process) {
      return;
    }

    process.state = 'running';
    process.executionChronon = this.config.chrononManager.getCurrentChronon();
    this.runningProcesses.add(processId);

    this.emit('processStarted', processId);

    try {
      // Simulate process execution
      await this.simulateProcessExecution(process);

      // Process completed successfully
      process.state = 'terminated';
      process.terminationChronon = this.config.chrononManager.getCurrentChronon();
      process.exitCode = 0;

      this.emit('processCompleted', processId);

    } catch (error) {
      // Process failed
      process.state = 'terminated';
      process.terminationChronon = this.config.chrononManager.getCurrentChronon();
      process.exitCode = 1;
      process.stderr.push(`Process failed: ${error.message}`);

      this.emit('processFailed', processId, error);
    }

    this.runningProcesses.delete(processId);
    this.schedulingMetrics.contextSwitches++;
  }

  /**
   * Simulate process execution
   */
  private async simulateProcessExecution(process: TemporalProcess): Promise<void> {
    return new Promise((resolve, reject) => {
      // Simulate work with random duration
      const duration = Math.random() * 2000 + 500; // 0.5-2.5 seconds

      setTimeout(() => {
        // Simulate output
        process.stdout.push(`Process ${process.name} executed successfully`);
        process.resourceUsage.cpuTime += duration;
        process.resourceUsage.memoryUsage += Math.random() * 1024 * 1024; // Random memory usage

        // Random failure rate (5%)
        if (Math.random() < 0.05) {
          reject(new Error('Simulated process failure'));
        } else {
          resolve();
        }
      }, duration);
    });
  }

  /**
   * Terminate a process
   */
  public terminateProcess(processId: string, reason: string): boolean {
    const process = this.processes.get(processId);
    if (!process) {
      return false;
    }

    if (process.state === 'terminated') {
      return true; // Already terminated
    }

    process.state = 'terminated';
    process.terminationChronon = this.config.chrononManager.getCurrentChronon();
    process.exitCode = -1;
    process.stderr.push(`Process terminated: ${reason}`);

    // Remove from running processes
    this.runningProcesses.delete(processId);

    // Remove from ready queue
    const readyIndex = this.readyQueue.indexOf(processId);
    if (readyIndex !== -1) {
      this.readyQueue.splice(readyIndex, 1);
    }

    // Remove from blocked processes
    this.blockedProcesses.delete(processId);

    this.emit('processTerminated', processId, reason);
    console.log(`Terminated process ${processId} (${process.name}): ${reason}`);

    return true;
  }

  /**
   * Get process by ID
   */
  public getProcess(processId: string): TemporalProcess | null {
    return this.processes.get(processId) || null;
  }

  /**
   * Get all processes
   */
  public getAllProcesses(): TemporalProcess[] {
    return Array.from(this.processes.values());
  }

  /**
   * Get processes by state
   */
  public getProcessesByState(state: TemporalProcess['state']): TemporalProcess[] {
    return Array.from(this.processes.values()).filter(p => p.state === state);
  }

  /**
   * Get process children
   */
  public getProcessChildren(parentId: string): TemporalProcess[] {
    const parent = this.processes.get(parentId);
    if (!parent) {
      return [];
    }

    return parent.children.map(childId => this.processes.get(childId)).filter(Boolean) as TemporalProcess[];
  }

  /**
   * Get scheduling metrics
   */
  public getSchedulingMetrics(): SchedulingMetrics {
    return { ...this.schedulingMetrics };
  }

  /**
   * Get process statistics
   */
  public getProcessStatistics(): {
    totalProcesses: number;
    runningProcesses: number;
    readyProcesses: number;
    blockedProcesses: number;
    terminatedProcesses: number;
    averageExecutionTime: number;
    totalCpuTime: number;
    totalMemoryUsage: number;
  } {
    const processes = Array.from(this.processes.values());

    const running = processes.filter(p => p.state === 'running').length;
    const ready = processes.filter(p => p.state === 'ready').length;
    const blocked = processes.filter(p => p.state === 'blocked').length;
    const terminated = processes.filter(p => p.state === 'terminated').length;

    const terminatedProcesses = processes.filter(p => p.state === 'terminated' && p.terminationChronon);
    const totalExecutionTime = terminatedProcesses.reduce((sum, p) =>
      sum + (p.terminationChronon! - (p.executionChronon || p.creationChronon)), 0);
    const averageExecutionTime = terminatedProcesses.length > 0 ? totalExecutionTime / terminatedProcesses.length : 0;

    const totalCpuTime = processes.reduce((sum, p) => sum + p.resourceUsage.cpuTime, 0);
    const totalMemoryUsage = processes.reduce((sum, p) => sum + p.resourceUsage.memoryUsage, 0);

    return {
      totalProcesses: processes.length,
      runningProcesses: running,
      readyProcesses: ready,
      blockedProcesses: blocked,
      terminatedProcesses: terminated,
      averageExecutionTime,
      totalCpuTime,
      totalMemoryUsage
    };
  }

  /**
   * Kill all processes
   */
  public killAllProcesses(): void {
    const processIds = Array.from(this.processes.keys());

    for (const processId of processIds) {
      this.terminateProcess(processId, 'system shutdown');
    }
  }

  /**
   * Shutdown the process manager
   */
  public async shutdown(): Promise<void> {
    console.log('Shutting down Temporal Process Manager...');

    this.isRunning = false;

    // Stop scheduler
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    // Kill all processes
    this.killAllProcesses();

    console.log('Temporal Process Manager shutdown completed');
  }

  /**
   * Test process manager functionality
   */
  public async test(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Testing Temporal Process Manager...');

      // Test process creation
      const process = await this.createProcess('test', ['arg1', 'arg2']);
      if (!process || process.state !== 'ready') {
        return { success: false, error: 'Process creation failed' };
      }

      // Test process retrieval
      const retrieved = this.getProcess(process.id);
      if (!retrieved || retrieved.id !== process.id) {
        return { success: false, error: 'Process retrieval failed' };
      }

      // Test process state filtering
      const readyProcesses = this.getProcessesByState('ready');
      if (!readyProcesses.includes(process)) {
        return { success: false, error: 'Process state filtering failed' };
      }

      // Test process termination
      const terminated = this.terminateProcess(process.id, 'test');
      if (!terminated) {
        return { success: false, error: 'Process termination failed' };
      }

      // Test process statistics
      const stats = this.getProcessStatistics();
      if (stats.totalProcesses === 0) {
        return { success: false, error: 'Process statistics failed' };
      }

      // Test scheduling metrics
      const metrics = this.getSchedulingMetrics();
      if (typeof metrics.latency !== 'number') {
        return { success: false, error: 'Scheduling metrics failed' };
      }

      console.log('Temporal Process Manager test completed successfully');
      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
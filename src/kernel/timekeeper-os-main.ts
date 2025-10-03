/**
 * TimeKeeper OS Main Entry Point
 *
 * Main entry point for TimeKeeper OS, demonstrating the complete kernel
 * and system initialization.
 */

import { TimeChainKernel } from './timechain_kernel';
import { KernelConfig } from './timechain_kernel';

/**
 * TimeKeeper OS Main Class
 */
export class TimeKeeperOS {
  private kernel: TimeChainKernel;
  private isRunning: boolean = false;

  constructor() {
    this.kernel = this.createKernel();
  }

  /**
   * Create kernel with default configuration
   */
  private createKernel(): TimeChainKernel {
    const config: KernelConfig = {
      chrononInterval: 1000, // 1 second per chronon
      vdfDifficulty: 10,     // Medium difficulty
      maxProcesses: 100,     // Maximum concurrent processes
      memorySize: 1024 * 1024 * 1024, // 1GB memory
      networkEnabled: true,   // Enable networking
      securityLevel: 'enhanced' // Enhanced security
    };

    return new TimeChainKernel(config);
  }

  /**
   * Start TimeKeeper OS
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('TimeKeeper OS is already running');
      return;
    }

    console.log('🚀 Starting TimeKeeper OS...');
    console.log('='.repeat(50));

    try {
      // Start kernel
      await this.kernel.start();

      // Setup event listeners
      this.setupEventListeners();

      this.isRunning = true;

      console.log('✅ TimeKeeper OS started successfully');
      console.log('='.repeat(50));
      console.log('📊 System Status:');
      this.printSystemStatus();
      console.log('='.repeat(50));

      // Run demonstration
      await this.runDemonstration();

    } catch (error) {
      console.error('❌ Failed to start TimeKeeper OS:', error);
      throw error;
    }
  }

  /**
   * Stop TimeKeeper OS
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('TimeKeeper OS is not running');
      return;
    }

    console.log('🛑 Stopping TimeKeeper OS...');

    try {
      await this.kernel.stop();
      this.isRunning = false;

      console.log('✅ TimeKeeper OS stopped successfully');

    } catch (error) {
      console.error('❌ Failed to stop TimeKeeper OS:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Kernel events
    this.kernel.on('started', () => {
      console.log('🔧 Kernel started');
    });

    this.kernel.on('stopped', () => {
      console.log('🔧 Kernel stopped');
    });

    this.kernel.on('chronon', (chronon: number) => {
      if (chronon % 10 === 0) { // Print every 10 chronons
        console.log(`⏰ Chronon ${chronon}`);
      }
    });

    this.kernel.on('processCreated', (processId: string) => {
      console.log(`📝 Process created: ${processId}`);
    });

    this.kernel.on('processTerminated', (processId: string) => {
      console.log(`📝 Process terminated: ${processId}`);
    });

    this.kernel.on('memoryAllocated', (size: number) => {
      console.log(`💾 Memory allocated: ${size} bytes`);
    });

    this.kernel.on('memoryFreed', (size: number) => {
      console.log(`💾 Memory freed: ${size} bytes`);
    });

    this.kernel.on('networkConnected', () => {
      console.log('🌐 Network connected');
    });

    this.kernel.on('networkDisconnected', () => {
      console.log('🌐 Network disconnected');
    });

    this.kernel.on('securityAlert', (alert: any) => {
      console.log(`🔒 Security alert [${alert.severity}]: ${alert.description}`);
    });

    this.kernel.on('metrics', (metrics: any) => {
      // Update metrics display periodically
      if (metrics.chrononSynchronization.lastSync % 5000 < 1000) {
        this.printMetrics(metrics);
      }
    });
  }

  /**
   * Print system status
   */
  private printSystemStatus(): void {
    const state = this.kernel.getState();
    const config = this.kernel.getConfig();

    console.log(`   Current Chronon: ${state.currentChronon}`);
    console.log(`   System Uptime: ${Math.floor((Date.now() - state.uptime) / 1000)}s`);
    console.log(`   Active Processes: ${state.processCount}`);
    console.log(`   Memory Usage: ${Math.round(state.memoryUsage / 1024 / 1024)}MB`);
    console.log(`   Network Status: ${state.networkStatus}`);
    console.log(`   Security Status: ${state.securityStatus}`);
    console.log('');
    console.log('⚙️  Configuration:');
    console.log(`   Chronon Interval: ${config.chrononInterval}ms`);
    console.log(`   VDF Difficulty: ${config.vdfDifficulty}`);
    console.log(`   Max Processes: ${config.maxProcesses}`);
    console.log(`   Total Memory: ${Math.round(config.memorySize / 1024 / 1024)}MB`);
    console.log(`   Network Enabled: ${config.networkEnabled}`);
    console.log(`   Security Level: ${config.securityLevel}`);
  }

  /**
   * Print system metrics
   */
  private printMetrics(metrics: any): void {
    console.log('📊 System Metrics:');
    console.log(`   Chronon Sync Deviation: ${metrics.chrononSynchronization.deviation}ms`);
    console.log(`   Process Scheduling Latency: ${metrics.processScheduling.latency}ms`);
    console.log(`   Process Throughput: ${metrics.processScheduling.throughput}/s`);
    console.log(`   Memory Allocation Rate: ${metrics.memoryManagement.allocationRate}/s`);
    console.log(`   Memory Fragmentation: ${Math.round(metrics.memoryManagement.fragmentation * 100)}%`);
    console.log(`   File System Operations: ${metrics.fileSystem.operationsPerSecond}/s`);
    console.log(`   Network Packets: ${metrics.networking.packetsPerSecond}/s`);
    console.log(`   Security Events: ${metrics.security.threatsDetected} threats detected`);
  }

  /**
   * Run system demonstration
   */
  private async runDemonstration(): Promise<void> {
    console.log('🎭 Running TimeKeeper OS Demonstration...');
    console.log('='.repeat(50));

    try {
      // Demonstrate process management
      await this.demonstrateProcessManagement();

      // Demonstrate memory management
      await this.demonstrateMemoryManagement();

      // Demonstrate file system
      await this.demonstrateFileSystem();

      // Demonstrate networking
      await this.demonstrateNetworking();

      // Demonstrate security
      await this.demonstrateSecurity();

      // Run system self-test
      await this.runSystemSelfTest();

      console.log('✅ Demonstration completed successfully');

    } catch (error) {
      console.error('❌ Demonstration failed:', error);
    }
  }

  /**
   * Demonstrate process management
   */
  private async demonstrateProcessManagement(): Promise<void> {
    console.log('📝 Demonstrating Process Management...');

    // Create some test processes
    const process1 = await this.kernel.executeCommand('create-process', [
      'test-app-1',
      ['--mode', 'demo']
    ]);

    const process2 = await this.kernel.executeCommand('create-process', [
      'test-app-2',
      ['--mode', 'background']
    ]);

    console.log(`   Created processes: ${process1.id}, ${process2.id}`);

    // Wait a bit for processes to run
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get process statistics
    const stats = this.kernel.getProcessManager().getProcessStatistics();
    console.log(`   Process Statistics:`);
    console.log(`     Total Processes: ${stats.totalProcesses}`);
    console.log(`     Running Processes: ${stats.runningProcesses}`);
    console.log(`     Average Execution Time: ${stats.averageExecutionTime} chronons`);
  }

  /**
   * Demonstrate memory management
   */
  private async demonstrateMemoryManagement(): Promise<void> {
    console.log('💾 Demonstrating Memory Management...');

    // Allocate some memory blocks
    const alloc1 = await this.kernel.executeCommand('allocate-memory', [
      1024,  // 1KB
      'test-process-1'
    ]);

    const alloc2 = await this.kernel.executeCommand('allocate-memory', [
      2048,  // 2KB
      'test-process-2'
    ]);

    console.log(`   Allocated memory blocks: ${alloc1.id}, ${alloc2.id}`);

    // Get memory statistics
    const stats = this.kernel.getMemoryManager().getMemoryStatistics();
    console.log(`   Memory Statistics:`);
    console.log(`     Total Memory: ${Math.round(stats.totalMemory / 1024 / 1024)}MB`);
    console.log(`     Used Memory: ${Math.round(stats.usedMemory / 1024)}KB`);
    console.log(`     Free Memory: ${Math.round(stats.freeMemory / 1024)}KB`);
    console.log(`     Fragmentation: ${Math.round(stats.fragmentation * 100)}%`);
  }

  /**
   * Demonstrate file system
   */
  private async demonstrateFileSystem(): Promise<void> {
    console.log('📁 Demonstrating File System...');

    // Create a test file
    const testFile = await this.kernel.executeCommand('create-file', [
      '/tmp/test.txt',
      'Hello, TimeKeeper OS!'
    ]);

    console.log(`   Created file: ${testFile.path}`);

    // Create a test directory
    const testDir = await this.kernel.executeCommand('create-file', [
      '/tmp/testdir'
    ]);

    console.log(`   Created directory: ${testDir.path}`);

    // Get file system statistics
    const stats = this.kernel.getFileSystem().getFilesystemStatistics();
    console.log(`   File System Statistics:`);
    console.log(`     Total Files: ${stats.totalFiles}`);
    console.log(`     Total Directories: ${stats.totalDirectories}`);
    console.log(`     Total Size: ${Math.round(stats.totalSize / 1024)}KB`);
    console.log(`     Total Versions: ${stats.totalVersions}`);
  }

  /**
   * Demonstrate networking
   */
  private async demonstrateNetworking(): Promise<void> {
    console.log('🌐 Demonstrating Networking...');

    // Create a test socket
    const protocol = { name: 'http', version: '1.1', port: 80, handler: async () => {} };
    const socket = await this.kernel.executeCommand('network-connect', [
      '127.0.0.1:80'
    ]);

    console.log(`   Created network socket: ${socket.id}`);

    // Get network statistics
    const stats = this.kernel.getNetworkStack().getNetworkStatistics();
    console.log(`   Network Statistics:`);
    console.log(`     Total Sockets: ${stats.totalSockets}`);
    console.log(`     Connected Sockets: ${stats.connectedSockets}`);
    console.log(`     Average Latency: ${stats.averageLatency}ms`);
    console.log(`     Bandwidth Usage: ${Math.round(stats.bandwidthUsage / 1024)}KB`);
  }

  /**
   * Demonstrate security
   */
  private async demonstrateSecurity(): Promise<void> {
    console.log('🔒 Demonstrating Security...');

    // Authenticate as admin
    const auth = await this.kernel.executeCommand('authenticate', [
      'admin',
      'admin123'
    ]);

    console.log(`   Admin authentication: ${auth.success ? '✅ Success' : '❌ Failed'}`);

    if (auth.success) {
      console.log(`   Session ID: ${auth.session.id}`);
    }

    // Get security metrics
    const metrics = this.kernel.getSecurityManager().getSecurityMetrics();
    console.log(`   Security Metrics:`);
    console.log(`     Authentication Attempts: ${metrics.authenticationAttempts}`);
    console.log(`     Access Violations: ${metrics.accessViolations}`);
    console.log(`     Threats Detected: ${metrics.threatsDetected}`);
    console.log(`     Alerts Generated: ${metrics.alertsGenerated}`);
  }

  /**
   * Run system self-test
   */
  private async runSystemSelfTest(): Promise<void> {
    console.log('🧪 Running System Self-Test...');

    const testResult = await this.kernel.selfTest();

    if (testResult) {
      console.log('✅ System self-test passed');
    } else {
      console.log('❌ System self-test failed');
    }
  }

  /**
   * Get system status
   */
  public getSystemStatus(): any {
    return {
      isRunning: this.isRunning,
      kernelState: this.kernel.getState(),
      kernelMetrics: this.kernel.getMetrics(),
      config: this.kernel.getConfig()
    };
  }

  /**
   * Execute kernel command
   */
  public async executeCommand(command: string, args: any[]): Promise<any> {
    if (!this.isRunning) {
      throw new Error('TimeKeeper OS is not running');
    }

    return await this.kernel.executeCommand(command, args);
  }
}

/**
 * Main function - Entry point for TimeKeeper OS
 */
export async function main(): Promise<void> {
  const timeKeeperOS = new TimeKeeperOS();

  try {
    // Start the OS
    await timeKeeperOS.start();

    // Keep the OS running for demonstration
    console.log('⏱️  TimeKeeper OS is running. Press Ctrl+C to stop...');

    // Set up graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT, shutting down gracefully...');
      await timeKeeperOS.stop();
      process.exit(0);
    });

    // Keep the process alive
    await new Promise(() => {}); // Never resolves

  } catch (error) {
    console.error('💥 TimeKeeper OS failed to start:', error);
    process.exit(1);
  }
}

// Export for use in other modules
export { TimeKeeperOS as default };

// Run if this is the main module
if (require.main === module) {
  main().catch(console.error);
}
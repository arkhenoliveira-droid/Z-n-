import { Web3LinuxKernel } from '../kernel/web3-linux-kernel'
import { Web3LinuxFileSystem } from '../filesystem/web3-linux-filesystem'
import { Chronon } from '../temporal/chronon'

export interface ShellContext {
  currentDirectory: string
  user: string
  environment: Map<string, string>
  history: string[]
  sessionStartTime: Date
  temporalContext: {
    currentChronon: Chronon
    lastCommandTime: Date
    commandSequence: number
  }
}

export interface CommandResult {
  output: string
  exitCode: number
  temporalProof: string
  executionTime: number
  gasUsed?: number
  blockchainTransaction?: string
}

export interface ShellCommand {
  name: string
  description: string
  usage: string
  examples: string[]
  category: 'filesystem' | 'blockchain' | 'system' | 'network' | 'security' | 'temporal'
  handler: (args: string[], context: ShellContext) => Promise<CommandResult>
  autocomplete?: (args: string[], context: ShellContext) => string[]
}

export class Web3Shell {
  private kernel: Web3LinuxKernel
  private filesystem: Web3LinuxFileSystem
  private context: ShellContext
  private commands: Map<string, ShellCommand>
  private prompt: string

  constructor(kernel: Web3LinuxKernel, filesystem: Web3LinuxFileSystem) {
    this.kernel = kernel
    this.filesystem = filesystem
    this.context = this.initializeContext()
    this.commands = new Map()
    this.prompt = 'w3sh$ '

    this.initializeCommands()
  }

  private initializeContext(): ShellContext {
    return {
      currentDirectory: '/',
      user: 'web3user',
      environment: new Map([
        ['PATH', '/bin:/usr/bin:/usr/local/bin'],
        ['HOME', '/home/web3user'],
        ['SHELL', '/bin/w3sh'],
        ['TERM', 'xterm-256color'],
        ['LANG', 'en_US.UTF-8'],
        ['BLOCKCHAIN_NETWORK', 'timechain-mainnet'],
        ['TEMPORAL_ENABLED', 'true']
      ]),
      history: [],
      sessionStartTime: new Date(),
      temporalContext: {
        currentChronon: new Chronon(),
        lastCommandTime: new Date(),
        commandSequence: 0
      }
    }
  }

  private initializeCommands(): void {
    // Filesystem Commands
    this.registerCommand({
      name: 'ls',
      description: 'List directory contents',
      usage: 'ls [options] [directory]',
      examples: ['ls', 'ls -la', 'ls /home'],
      category: 'filesystem',
      handler: this.handleLs.bind(this),
      autocomplete: this.autocompletePath.bind(this)
    })

    this.registerCommand({
      name: 'cd',
      description: 'Change directory',
      usage: 'cd [directory]',
      examples: ['cd /home', 'cd ..', 'cd ~'],
      category: 'filesystem',
      handler: this.handleCd.bind(this),
      autocomplete: this.autocompletePath.bind(this)
    })

    this.registerCommand({
      name: 'cat',
      description: 'Display file contents',
      usage: 'cat [options] [file]',
      examples: ['cat file.txt', 'cat -n file.txt'],
      category: 'filesystem',
      handler: this.handleCat.bind(this),
      autocomplete: this.autocompletePath.bind(this)
    })

    this.registerCommand({
      name: 'touch',
      description: 'Create empty file',
      usage: 'touch [file]',
      examples: ['touch newfile.txt'],
      category: 'filesystem',
      handler: this.handleTouch.bind(this),
      autocomplete: this.autocompletePath.bind(this)
    })

    this.registerCommand({
      name: 'mkdir',
      description: 'Create directory',
      usage: 'mkdir [directory]',
      examples: ['mkdir newdir'],
      category: 'filesystem',
      handler: this.handleMkdir.bind(this),
      autocomplete: this.autocompletePath.bind(this)
    })

    this.registerCommand({
      name: 'rm',
      description: 'Remove files or directories',
      usage: 'rm [options] [file|directory]',
      examples: ['rm file.txt', 'rm -rf directory'],
      category: 'filesystem',
      handler: this.handleRm.bind(this),
      autocomplete: this.autocompletePath.bind(this)
    })

    // Blockchain Commands
    this.registerCommand({
      name: 'deploy',
      description: 'Deploy smart contract',
      usage: 'deploy [contract-file] [contract-name] [constructor-args...]',
      examples: ['deploy token.sol MyToken', 'deploy vault.sol Vault 1000'],
      category: 'blockchain',
      handler: this.handleDeploy.bind(this),
      autocomplete: this.autocompleteSolidityFiles.bind(this)
    })

    this.registerCommand({
      name: 'call',
      description: 'Call smart contract method',
      usage: 'call [contract-address] [method-name] [args...]',
      examples: ['call 0x123... balanceOf', 'call 0x456... transfer 0x789 100'],
      category: 'blockchain',
      handler: this.handleCall.bind(this)
    })

    this.registerCommand({
      name: 'balance',
      description: 'Check account balance',
      usage: 'balance [address]',
      examples: ['balance', 'balance 0x123...'],
      category: 'blockchain',
      handler: this.handleBalance.bind(this)
    })

    this.registerCommand({
      name: 'tx',
      description: 'Send transaction',
      usage: 'tx [to-address] [amount] [data]',
      examples: ['tx 0x123... 1.5', 'tx 0x456... 0 "0xabcdef"'],
      category: 'blockchain',
      handler: this.handleTx.bind(this)
    })

    // System Commands
    this.registerCommand({
      name: 'status',
      description: 'Show system status',
      usage: 'status [options]',
      examples: ['status', 'status --detailed'],
      category: 'system',
      handler: this.handleStatus.bind(this)
    })

    this.registerCommand({
      name: 'ps',
      description: 'List processes',
      usage: 'ps [options]',
      examples: ['ps', 'ps -aux'],
      category: 'system',
      handler: this.handlePs.bind(this)
    })

    this.registerCommand({
      name: 'kill',
      description: 'Terminate process',
      usage: 'kill [process-id]',
      examples: ['kill 1234'],
      category: 'system',
      handler: this.handleKill.bind(this)
    })

    // Temporal Commands
    this.registerCommand({
      name: 'chronon',
      description: 'Show current chronon information',
      usage: 'chronon [options]',
      examples: ['chronon', 'chronon --info'],
      category: 'temporal',
      handler: this.handleChronon.bind(this)
    })

    this.registerCommand({
      name: 'snapshot',
      description: 'Create temporal snapshot',
      usage: 'snapshot [name]',
      examples: ['snapshot', 'snapshot my-backup'],
      category: 'temporal',
      handler: this.handleSnapshot.bind(this)
    })

    this.registerCommand({
      name: 'restore',
      description: 'Restore from temporal snapshot',
      usage: 'restore [snapshot-id]',
      examples: ['restore abc123'],
      category: 'temporal',
      handler: this.handleRestore.bind(this)
    })

    // Security Commands
    this.registerCommand({
      name: 'encrypt',
      description: 'Encrypt file or data',
      usage: 'encrypt [input] [output]',
      examples: ['encrypt file.txt encrypted.txt'],
      category: 'security',
      handler: this.handleEncrypt.bind(this),
      autocomplete: this.autocompletePath.bind(this)
    })

    this.registerCommand({
      name: 'decrypt',
      description: 'Decrypt file or data',
      usage: 'decrypt [input] [output]',
      examples: ['decrypt encrypted.txt decrypted.txt'],
      category: 'security',
      handler: this.handleDecrypt.bind(this),
      autocomplete: this.autocompletePath.bind(this)
    })

    this.registerCommand({
      name: 'verify',
      description: 'Verify system integrity',
      usage: 'verify [options]',
      examples: ['verify', 'verify --detailed'],
      category: 'security',
      handler: this.handleVerify.bind(this)
    })

    // Utility Commands
    this.registerCommand({
      name: 'help',
      description: 'Show help information',
      usage: 'help [command]',
      examples: ['help', 'help ls'],
      category: 'system',
      handler: this.handleHelp.bind(this),
      autocomplete: this.autocompleteCommandNames.bind(this)
    })

    this.registerCommand({
      name: 'clear',
      description: 'Clear terminal screen',
      usage: 'clear',
      examples: ['clear'],
      category: 'system',
      handler: this.handleClear.bind(this)
    })

    this.registerCommand({
      name: 'exit',
      description: 'Exit the shell',
      usage: 'exit',
      examples: ['exit'],
      category: 'system',
      handler: this.handleExit.bind(this)
    })

    this.registerCommand({
      name: 'env',
      description: 'Show environment variables',
      usage: 'env [variable]',
      examples: ['env', 'env PATH'],
      category: 'system',
      handler: this.handleEnv.bind(this),
      autocomplete: this.autocompleteEnvVars.bind(this)
    })

    this.registerCommand({
      name: 'history',
      description: 'Show command history',
      usage: 'history [options]',
      examples: ['history', 'history -c'],
      category: 'system',
      handler: this.handleHistory.bind(this)
    })
  }

  private registerCommand(command: ShellCommand): void {
    this.commands.set(command.name, command)
  }

  // Command Handlers
  private async handleLs(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const path = args[0] || context.currentDirectory
      const { files, directories } = await this.filesystem.listDirectory(path)

      let output = ''

      if (args.includes('-l') || args.includes('-la')) {
        // Long format
        for (const dir of directories) {
          output += `d${this.formatPermissions(dir.permissions)} ${dir.owner} ${dir.size.toString().padStart(8)} ${dir.modifiedAt.toLocaleString()} ${dir.name}\n`
        }
        for (const file of files) {
          output += `-${this.formatPermissions(file.permissions)} ${file.owner} ${file.size.toString().padStart(8)} ${file.modifiedAt.toLocaleString()} ${file.name}\n`
        }
      } else {
        // Short format
        output = [...directories.map(d => d.name + '/'), ...files.map(f => f.name)].join('\t') + '\n'
      }

      return {
        output,
        exitCode: 0,
        temporalProof: `ls_${Date.now()}`,
        executionTime: 5
      }
    } catch (error) {
      return {
        output: `ls: ${error.message}`,
        exitCode: 1,
        temporalProof: `ls_error_${Date.now()}`,
        executionTime: 2
      }
    }
  }

  private async handleCd(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const targetPath = args[0] || context.environment.get('HOME') || '/'

      if (targetPath === '..') {
        const parentPath = this.getParentPath(context.currentDirectory)
        context.currentDirectory = parentPath
      } else if (targetPath === '~') {
        context.currentDirectory = context.environment.get('HOME') || '/home/web3user'
      } else if (targetPath.startsWith('/')) {
        // Absolute path
        context.currentDirectory = targetPath
      } else {
        // Relative path
        context.currentDirectory = this.joinPaths(context.currentDirectory, targetPath)
      }

      // Verify directory exists
      await this.filesystem.listDirectory(context.currentDirectory)

      return {
        output: '',
        exitCode: 0,
        temporalProof: `cd_${Date.now()}`,
        executionTime: 1
      }
    } catch (error) {
      return {
        output: `cd: ${error.message}`,
        exitCode: 1,
        temporalProof: `cd_error_${Date.now()}`,
        executionTime: 1
      }
    }
  }

  private async handleCat(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const filePath = args[0]
      if (!filePath) {
        throw new Error('Usage: cat [file]')
      }

      const fullPath = this.joinPaths(context.currentDirectory, filePath)
      const { content, metadata } = await this.filesystem.readFile(fullPath)

      let output = content.toString('utf-8')

      if (args.includes('-n')) {
        // Add line numbers
        const lines = output.split('\n')
        output = lines.map((line, index) => `${(index + 1).toString().padStart(6)}  ${line}`).join('\n')
      }

      return {
        output,
        exitCode: 0,
        temporalProof: `cat_${metadata.id}_${Date.now()}`,
        executionTime: 10
      }
    } catch (error) {
      return {
        output: `cat: ${error.message}`,
        exitCode: 1,
        temporalProof: `cat_error_${Date.now()}`,
        executionTime: 2
      }
    }
  }

  private async handleTouch(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const filePath = args[0]
      if (!filePath) {
        throw new Error('Usage: touch [file]')
      }

      const fullPath = this.joinPaths(context.currentDirectory, filePath)
      await this.filesystem.createFile(fullPath, Buffer.from(''), {
        owner: context.user
      })

      return {
        output: '',
        exitCode: 0,
        temporalProof: `touch_${fullPath}_${Date.now()}`,
        executionTime: 5
      }
    } catch (error) {
      return {
        output: `touch: ${error.message}`,
        exitCode: 1,
        temporalProof: `touch_error_${Date.now()}`,
        executionTime: 2
      }
    }
  }

  private async handleMkdir(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const dirPath = args[0]
      if (!dirPath) {
        throw new Error('Usage: mkdir [directory]')
      }

      const fullPath = this.joinPaths(context.currentDirectory, dirPath)
      await this.filesystem.createDirectory(fullPath, {
        owner: context.user
      })

      return {
        output: '',
        exitCode: 0,
        temporalProof: `mkdir_${fullPath}_${Date.now()}`,
        executionTime: 5
      }
    } catch (error) {
      return {
        output: `mkdir: ${error.message}`,
        exitCode: 1,
        temporalProof: `mkdir_error_${Date.now()}`,
        executionTime: 2
      }
    }
  }

  private async handleRm(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const targetPath = args[args.length - 1]
      if (!targetPath) {
        throw new Error('Usage: rm [options] [file|directory]')
      }

      const fullPath = this.joinPaths(context.currentDirectory, targetPath)
      const force = args.includes('-f')
      const recursive = args.includes('-r') || args.includes('-rf')

      if (recursive) {
        // TODO: Implement recursive directory deletion
        throw new Error('Recursive deletion not yet implemented')
      }

      await this.filesystem.deleteFile(fullPath, { forceDelete: force })

      return {
        output: '',
        exitCode: 0,
        temporalProof: `rm_${fullPath}_${Date.now()}`,
        executionTime: 3
      }
    } catch (error) {
      return {
        output: `rm: ${error.message}`,
        exitCode: 1,
        temporalProof: `rm_error_${Date.now()}`,
        executionTime: 2
      }
    }
  }

  private async handleDeploy(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      if (args.length < 2) {
        throw new Error('Usage: deploy [contract-file] [contract-name] [constructor-args...]')
      }

      const [contractFile, contractName, ...constructorArgs] = args

      // Read contract file
      const fullPath = this.joinPaths(context.currentDirectory, contractFile)
      const { content } = await this.filesystem.readFile(fullPath)
      const contractCode = content.toString('utf-8')

      // Deploy contract
      const result = await this.kernel.deploySmartContract(
        contractCode,
        contractName,
        constructorArgs
      )

      return {
        output: `Contract deployed successfully!\nAddress: ${result.contractAddress}\nGas used: ${result.gasUsed}\nDeployment hash: ${result.deploymentHash}`,
        exitCode: 0,
        temporalProof: result.temporalProof,
        executionTime: 15000,
        gasUsed: result.gasUsed,
        blockchainTransaction: result.deploymentHash
      }
    } catch (error) {
      return {
        output: `deploy: ${error.message}`,
        exitCode: 1,
        temporalProof: `deploy_error_${Date.now()}`,
        executionTime: 1000
      }
    }
  }

  private async handleCall(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      if (args.length < 2) {
        throw new Error('Usage: call [contract-address] [method-name] [args...]')
      }

      const [contractAddress, methodName, ...methodArgs] = args

      // Parse arguments
      const parsedArgs = methodArgs.map(arg => {
        if (arg.startsWith('0x')) return arg // Hex string
        if (!isNaN(Number(arg))) return Number(arg) // Number
        return arg // String
      })

      // Call contract method
      const result = await this.kernel.interactWithContract(
        contractAddress,
        methodName,
        parsedArgs
      )

      return {
        output: `Method call result: ${JSON.stringify(result.result, null, 2)}\nGas used: ${result.gasUsed}\nTransaction hash: ${result.transactionHash}`,
        exitCode: 0,
        temporalProof: result.temporalProof,
        executionTime: 8000,
        gasUsed: result.gasUsed,
        blockchainTransaction: result.transactionHash
      }
    } catch (error) {
      return {
        output: `call: ${error.message}`,
        exitCode: 1,
        temporalProof: `call_error_${Date.now()}`,
        executionTime: 2000
      }
    }
  }

  private async handleBalance(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const address = args[0] || 'default'

      // Mock balance check - in real implementation, this would query blockchain
      const balance = Math.random() * 1000 // Mock balance

      return {
        output: `Balance for ${address}: ${balance.toFixed(6)} ETH`,
        exitCode: 0,
        temporalProof: `balance_${address}_${Date.now()}`,
        executionTime: 1000
      }
    } catch (error) {
      return {
        output: `balance: ${error.message}`,
        exitCode: 1,
        temporalProof: `balance_error_${Date.now()}`,
        executionTime: 500
      }
    }
  }

  private async handleTx(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      if (args.length < 2) {
        throw new Error('Usage: tx [to-address] [amount] [data]')
      }

      const [toAddress, amountStr, data] = args
      const amount = parseFloat(amountStr)

      if (isNaN(amount)) {
        throw new Error('Invalid amount')
      }

      // Mock transaction - in real implementation, this would send actual transaction
      const txHash = '0x' + Math.random().toString(16).substring(2, 42)

      return {
        output: `Transaction sent!\nTo: ${toAddress}\nAmount: ${amount} ETH\nData: ${data || 'none'}\nTransaction hash: ${txHash}`,
        exitCode: 0,
        temporalProof: `tx_${txHash}_${Date.now()}`,
        executionTime: 5000,
        blockchainTransaction: txHash
      }
    } catch (error) {
      return {
        output: `tx: ${error.message}`,
        exitCode: 1,
        temporalProof: `tx_error_${Date.now()}`,
        executionTime: 1000
      }
    }
  }

  private async handleStatus(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const systemState = await this.kernel.getSystemState()
      const detailed = args.includes('--detailed')

      let output = 'Web3 Linux System Status\n'
      output += '=' .repeat(50) + '\n\n'

      output += `Uptime: ${Math.floor(systemState.uptime / 1000)}s\n`
      output += `Current Chronon: ${systemState.chronon.id}\n`
      output += `Processes: ${systemState.processes.length}\n`
      output += `Network Connections: ${systemState.network.connections}\n`
      output += `Security Level: ${systemState.security.threatLevel}\n`

      if (detailed) {
        output += '\nFilesystem:\n'
        output += `  Total: ${this.formatBytes(systemState.filesystem.totalSpace)}\n`
        output += `  Used: ${this.formatBytes(systemState.filesystem.usedSpace)}\n`
        output += `  Free: ${this.formatBytes(systemState.filesystem.freeSpace)}\n`
        output += `  Temporal Integrity: ${systemState.filesystem.temporalIntegrity ? '✓' : '✗'}\n`

        output += '\nNetwork:\n'
        output += `  Incoming: ${this.formatBytes(systemState.network.bandwidth.incoming)}/s\n`
        output += `  Outgoing: ${this.formatBytes(systemState.network.bandwidth.outgoing)}/s\n`
        output += `  Blockchain Sync: ${systemState.network.blockchainSync ? '✓' : '✗'}\n`

        output += '\nSecurity:\n'
        output += `  Identity Verified: ${systemState.security.identityVerified ? '✓' : '✗'}\n`
        output += `  Encryption Enabled: ${systemState.security.encryptionEnabled ? '✓' : '✗'}\n`
        output += `  Audit Trail Active: ${systemState.security.auditTrailActive ? '✓' : '✗'}\n`
      }

      return {
        output,
        exitCode: 0,
        temporalProof: `status_${Date.now()}`,
        executionTime: 100
      }
    } catch (error) {
      return {
        output: `status: ${error.message}`,
        exitCode: 1,
        temporalProof: `status_error_${Date.now()}`,
        executionTime: 50
      }
    }
  }

  private async handlePs(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const systemState = await this.kernel.getSystemState()
      const all = args.includes('-a') || args.includes('-aux')

      let output = 'PID\tNAME\t\tSTATE\tCPU%\tMEM%\n'
      output += '-' .repeat(50) + '\n'

      const processes = all ? systemState.processes : systemState.processes.filter(p => p.state === 'running')

      for (const process of processes.slice(0, 10)) { // Limit to 10 processes
        output += `${process.id.substring(0, 8)}\t${process.name.padEnd(12)}\t${process.state.padEnd(6)}\t${process.cpuUsage.toFixed(1)}%\t${process.memoryUsage.toFixed(1)}%\n`
      }

      if (systemState.processes.length > 10) {
        output += `\n... and ${systemState.processes.length - 10} more processes\n`
      }

      return {
        output,
        exitCode: 0,
        temporalProof: `ps_${Date.now()}`,
        executionTime: 50
      }
    } catch (error) {
      return {
        output: `ps: ${error.message}`,
        exitCode: 1,
        temporalProof: `ps_error_${Date.now()}`,
        executionTime: 25
      }
    }
  }

  private async handleKill(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const processId = args[0]
      if (!processId) {
        throw new Error('Usage: kill [process-id]')
      }

      // Mock process termination - in real implementation, this would actually terminate the process
      return {
        output: `Process ${processId} terminated`,
        exitCode: 0,
        temporalProof: `kill_${processId}_${Date.now()}`,
        executionTime: 100
      }
    } catch (error) {
      return {
        output: `kill: ${error.message}`,
        exitCode: 1,
        temporalProof: `kill_error_${Date.now()}`,
        executionTime: 50
      }
    }
  }

  private async handleChronon(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const systemState = await this.kernel.getSystemState()
      const detailed = args.includes('--info')

      let output = 'Current Chronon Information\n'
      output += '=' .repeat(30) + '\n\n'

      output += `Chronon ID: ${systemState.chronon.id}\n`
      output += `Timestamp: ${systemState.chronon.timestamp.toISOString()}\n`
      output += `Sequence: ${systemState.chronon.sequence}\n`
      output += `Previous Hash: ${systemState.chronon.previousHash}\n`
      output += `Data Hash: ${systemState.chronon.dataHash}\n`

      if (detailed) {
        output += `\nChronon Data: ${JSON.stringify(systemState.chronon.data, null, 2)}\n`
      }

      return {
        output,
        exitCode: 0,
        temporalProof: `chronon_${Date.now()}`,
        executionTime: 25
      }
    } catch (error) {
      return {
        output: `chronon: ${error.message}`,
        exitCode: 1,
        temporalProof: `chronon_error_${Date.now()}`,
        executionTime: 10
      }
    }
  }

  private async handleSnapshot(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const snapshotName = args[0] || `snapshot_${Date.now()}`

      const snapshot = await this.kernel.createTemporalSnapshot()

      return {
        output: `Temporal snapshot created successfully!\nSnapshot ID: ${snapshot.snapshotId}\nName: ${snapshotName}\nChronon: ${snapshot.chronon.id}\nMerkle Root: ${snapshot.merkleRoot}`,
        exitCode: 0,
        temporalProof: snapshot.merkleRoot,
        executionTime: 2000
      }
    } catch (error) {
      return {
        output: `snapshot: ${error.message}`,
        exitCode: 1,
        temporalProof: `snapshot_error_${Date.now()}`,
        executionTime: 500
      }
    }
  }

  private async handleRestore(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const snapshotId = args[0]
      if (!snapshotId) {
        throw new Error('Usage: restore [snapshot-id]')
      }

      await this.kernel.restoreTemporalSnapshot(snapshotId)

      return {
        output: `System restored from snapshot: ${snapshotId}`,
        exitCode: 0,
        temporalProof: `restore_${snapshotId}_${Date.now()}`,
        executionTime: 5000
      }
    } catch (error) {
      return {
        output: `restore: ${error.message}`,
        exitCode: 1,
        temporalProof: `restore_error_${Date.now()}`,
        executionTime: 1000
      }
    }
  }

  private async handleEncrypt(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      if (args.length < 2) {
        throw new Error('Usage: encrypt [input] [output]')
      }

      const [inputPath, outputPath] = args
      const fullInputPath = this.joinPaths(context.currentDirectory, inputPath)
      const fullOutputPath = this.joinPaths(context.currentDirectory, outputPath)

      const { content } = await this.filesystem.readFile(fullInputPath)
      const result = await this.kernel.encryptData(content.toString('utf-8'))

      await this.filesystem.createFile(fullOutputPath, Buffer.from(result.encryptedData, 'base64'), {
        owner: context.user
      })

      return {
        output: `File encrypted successfully!\nInput: ${inputPath}\nOutput: ${outputPath}\nEncryption Key: ${result.encryptionKey}`,
        exitCode: 0,
        temporalProof: result.temporalProof,
        executionTime: 1000
      }
    } catch (error) {
      return {
        output: `encrypt: ${error.message}`,
        exitCode: 1,
        temporalProof: `encrypt_error_${Date.now()}`,
        executionTime: 500
      }
    }
  }

  private async handleDecrypt(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      if (args.length < 2) {
        throw new Error('Usage: decrypt [input] [output]')
      }

      const [inputPath, outputPath] = args
      const fullInputPath = this.joinPaths(context.currentDirectory, inputPath)
      const fullOutputPath = this.joinPaths(context.currentDirectory, outputPath)

      const { content } = await this.filesystem.readFile(fullInputPath)

      // Mock decryption - in real implementation, this would use the encryption key
      const decryptedContent = content.toString('utf-8') // This would be actual decryption

      await this.filesystem.createFile(fullOutputPath, Buffer.from(decryptedContent, 'utf-8'), {
        owner: context.user
      })

      return {
        output: `File decrypted successfully!\nInput: ${inputPath}\nOutput: ${outputPath}`,
        exitCode: 0,
        temporalProof: `decrypt_${Date.now()}`,
        executionTime: 1000
      }
    } catch (error) {
      return {
        output: `decrypt: ${error.message}`,
        exitCode: 1,
        temporalProof: `decrypt_error_${Date.now()}`,
        executionTime: 500
      }
    }
  }

  private async handleVerify(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const detailed = args.includes('--detailed')

      const result = await this.kernel.verifySystemIntegrity()

      let output = 'System Integrity Verification\n'
      output += '=' .repeat(30) + '\n\n'
      output += `Status: ${result.isIntact ? '✓ PASSED' : '✗ FAILED'}\n`
      output += `Temporal Proof: ${result.temporalProof}\n`

      if (result.issues.length > 0) {
        output += '\nIssues Found:\n'
        result.issues.forEach(issue => {
          output += `  - ${issue}\n`
        })
      }

      if (detailed) {
        output += '\nDetailed verification results would be shown here...\n'
      }

      return {
        output,
        exitCode: result.isIntact ? 0 : 1,
        temporalProof: result.temporalProof,
        executionTime: 2000
      }
    } catch (error) {
      return {
        output: `verify: ${error.message}`,
        exitCode: 1,
        temporalProof: `verify_error_${Date.now()}`,
        executionTime: 1000
      }
    }
  }

  private async handleHelp(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const commandName = args[0]

      if (commandName) {
        const command = this.commands.get(commandName)
        if (!command) {
          throw new Error(`Unknown command: ${commandName}`)
        }

        let output = `Command: ${command.name}\n`
        output += `Description: ${command.description}\n`
        output += `Usage: ${command.usage}\n`
        output += `Category: ${command.category}\n`

        if (command.examples.length > 0) {
          output += '\nExamples:\n'
          command.examples.forEach(example => {
            output += `  ${example}\n`
          })
        }

        return {
          output,
          exitCode: 0,
          temporalProof: `help_${commandName}_${Date.now()}`,
          executionTime: 10
        }
      } else {
        let output = 'Web3 Shell Commands\n'
        output += '=' .repeat(20) + '\n\n'

        const categories = new Map<string, ShellCommand[]>()
        for (const command of this.commands.values()) {
          if (!categories.has(command.category)) {
            categories.set(command.category, [])
          }
          categories.get(command.category)!.push(command)
        }

        for (const [category, commands] of categories) {
          output += `${category.toUpperCase()}:\n`
          commands.forEach(command => {
            output += `  ${command.name.padEnd(12)} - ${command.description}\n`
          })
          output += '\n'
        }

        output += 'Type "help [command]" for more information about a specific command.\n'

        return {
          output,
          exitCode: 0,
          temporalProof: `help_${Date.now()}`,
          executionTime: 25
        }
      }
    } catch (error) {
      return {
        output: `help: ${error.message}`,
        exitCode: 1,
        temporalProof: `help_error_${Date.now()}`,
        executionTime: 5
      }
    }
  }

  private async handleClear(args: string[], context: ShellContext): Promise<CommandResult> {
    return {
      output: '\x1b[2J\x1b[H', // ANSI clear screen and move cursor to top-left
      exitCode: 0,
      temporalProof: `clear_${Date.now()}`,
      executionTime: 1
    }
  }

  private async handleExit(args: string[], context: ShellContext): Promise<CommandResult> {
    return {
      output: 'Exiting Web3 Shell...\n',
      exitCode: 0,
      temporalProof: `exit_${Date.now()}`,
      executionTime: 1
    }
  }

  private async handleEnv(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      const varName = args[0]

      if (varName) {
        const value = context.environment.get(varName)
        if (value === undefined) {
          throw new Error(`Environment variable not found: ${varName}`)
        }
        return {
          output: `${varName}=${value}`,
          exitCode: 0,
          temporalProof: `env_${varName}_${Date.now()}`,
          executionTime: 5
        }
      } else {
        let output = ''
        for (const [key, value] of context.environment) {
          output += `${key}=${value}\n`
        }
        return {
          output,
          exitCode: 0,
          temporalProof: `env_${Date.now()}`,
          executionTime: 10
        }
      }
    } catch (error) {
      return {
        output: `env: ${error.message}`,
        exitCode: 1,
        temporalProof: `env_error_${Date.now()}`,
        executionTime: 5
      }
    }
  }

  private async handleHistory(args: string[], context: ShellContext): Promise<CommandResult> {
    try {
      if (args.includes('-c')) {
        context.history = []
        return {
          output: 'Command history cleared',
          exitCode: 0,
          temporalProof: `history_clear_${Date.now()}`,
          executionTime: 1
        }
      }

      let output = 'Command History:\n'
      context.history.forEach((command, index) => {
        output += `${(index + 1).toString().padStart(4)}  ${command}\n`
      })

      return {
        output,
        exitCode: 0,
        temporalProof: `history_${Date.now()}`,
        executionTime: 5
      }
    } catch (error) {
      return {
        output: `history: ${error.message}`,
        exitCode: 1,
        temporalProof: `history_error_${Date.now()}`,
        executionTime: 2
      }
    }
  }

  // Autocomplete Methods
  private autocompletePath(args: string[], context: ShellContext): string[] {
    const partialPath = args[args.length - 1] || ''
    const searchPath = partialPath.includes('/')
      ? partialPath.substring(0, partialPath.lastIndexOf('/'))
      : context.currentDirectory

    try {
      // This is a simplified autocomplete - in real implementation, would be more sophisticated
      return []
    } catch {
      return []
    }
  }

  private autocompleteSolidityFiles(args: string[], context: ShellContext): string[] {
    try {
      // Return .sol files in current directory
      return ['token.sol', 'vault.sol', 'nft.sol']
    } catch {
      return []
    }
  }

  private autocompleteCommandNames(args: string[], context: ShellContext): string[] {
    const partialCommand = args[args.length - 1] || ''
    return Array.from(this.commands.keys())
      .filter(cmd => cmd.startsWith(partialCommand))
  }

  private autocompleteEnvVars(args: string[], context: ShellContext): string[] {
    const partialVar = args[args.length - 1] || ''
    return Array.from(context.environment.keys())
      .filter(varName => varName.startsWith(partialVar))
  }

  // Main Shell Interface
  async executeCommand(input: string): Promise<CommandResult> {
    try {
      // Update temporal context
      this.context.temporalContext.lastCommandTime = new Date()
      this.context.temporalContext.commandSequence++

      // Add to history
      if (input.trim()) {
        this.context.history.push(input.trim())
        if (this.context.history.length > 1000) {
          this.context.history = this.context.history.slice(-1000)
        }
      }

      // Parse command
      const tokens = this.parseCommand(input)
      if (tokens.length === 0) {
        return {
          output: '',
          exitCode: 0,
          temporalProof: `empty_${Date.now()}`,
          executionTime: 1
        }
      }

      const commandName = tokens[0]
      const args = tokens.slice(1)

      // Find command
      const command = this.commands.get(commandName)
      if (!command) {
        return {
          output: `w3sh: ${commandName}: command not found`,
          exitCode: 127,
          temporalProof: `not_found_${commandName}_${Date.now()}`,
          executionTime: 5
        }
      }

      // Execute command
      return await command.handler(args, this.context)

    } catch (error) {
      return {
        output: `w3sh: ${error.message}`,
        exitCode: 1,
        temporalProof: `error_${Date.now()}`,
        executionTime: 10
      }
    }
  }

  getPrompt(): string {
    const user = this.context.user
    const cwd = this.context.currentDirectory
    const chronon = this.context.temporalContext.currentChronon.id.substring(0, 8)
    return `${user}@web3:${cwd} [${chronon}]$ `
  }

  getContext(): ShellContext {
    return { ...this.context }
  }

  // Helper Methods
  private parseCommand(input: string): string[] {
    const tokens: string[] = []
    let currentToken = ''
    let inQuotes = false
    let escapeNext = false

    for (let i = 0; i < input.length; i++) {
      const char = input[i]

      if (escapeNext) {
        currentToken += char
        escapeNext = false
      } else if (char === '\\') {
        escapeNext = true
      } else if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ' ' && !inQuotes) {
        if (currentToken) {
          tokens.push(currentToken)
          currentToken = ''
        }
      } else {
        currentToken += char
      }
    }

    if (currentToken) {
      tokens.push(currentToken)
    }

    return tokens
  }

  private formatPermissions(permissions: any): string {
    // Simplified permission formatting
    return 'rwxr-xr-x'
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private getParentPath(path: string): string {
    if (path === '/') return '/'
    const lastSlash = path.lastIndexOf('/')
    return lastSlash === 0 ? '/' : path.substring(0, lastSlash)
  }

  private joinPaths(base: string, relative: string): string {
    if (relative.startsWith('/')) {
      return relative
    }
    return base === '/' ? `/${relative}` : `${base}/${relative}`
  }
}
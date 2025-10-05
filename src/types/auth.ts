export interface Web3Identity {
  id: string;
  address: string;
  username: string;
  email?: string;
  publicKey: string;
  encryptedPrivateKey: string;
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
  role: 'user' | 'admin' | 'developer';
  permissions: string[];
  temporalProof: string;
  chronon: number;
  metadata: {
    avatar?: string;
    bio?: string;
    website?: string;
    social?: Record<string, string>;
    preferences?: Record<string, any>;
  };
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  isActive: boolean;
  ipAddress: string;
  userAgent: string;
  temporalProof: string;
  chronon: number;
}

export interface AuthChallenge {
  id: string;
  address: string;
  challenge: string;
  expiresAt: Date;
  createdAt: Date;
  isUsed: boolean;
}
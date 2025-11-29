import { v4 as uuidv4 } from 'uuid';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  tenantId: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
}

class IdentityService {
  private currentUser: UserProfile | null = null;
  private token: string | null = null;

  constructor() {
    // Try to load from local storage on init
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('axiom_user');
      const storedToken = localStorage.getItem('axiom_token');
      if (storedUser && storedToken) {
        this.currentUser = JSON.parse(storedUser);
        this.token = storedToken;
      }
    }
  }

  // Mock Login
  async login(walletAddress: string): Promise<UserProfile> {
    // In a real app, we would sign a message and verify with backend
    console.log('🔐 Authenticating wallet:', walletAddress);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock User Generation based on wallet
    const mockUser: UserProfile = {
      id: uuidv4(),
      username: `Agent_${walletAddress.slice(0, 6)}`,
      email: `${walletAddress.slice(0, 6)}@axiom.network`,
      tenantId: uuidv4(), // Generate a unique Tenant ID for this session
      role: 'ADMIN'
    };

    const mockToken = `mock_jwt_${uuidv4()}`;

    this.currentUser = mockUser;
    this.token = mockToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('axiom_user', JSON.stringify(mockUser));
      localStorage.setItem('axiom_token', mockToken);
    }

    console.log('✅ Login Successful. Tenant ID:', mockUser.tenantId);
    return mockUser;
  }

  logout() {
    this.currentUser = null;
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('axiom_user');
      localStorage.removeItem('axiom_token');
    }
    console.log('👋 Logged out');
  }

  getUser(): UserProfile | null {
    return this.currentUser;
  }

  getTenantId(): string | null {
    return this.currentUser?.tenantId || null;
  }

  // Get headers for API calls (Context Propagation)
  getAuthHeaders(): HeadersInit {
    if (!this.token || !this.currentUser) {
      return {};
    }
    return {
      'Authorization': `Bearer ${this.token}`,
      'X-Tenant-ID': this.currentUser.tenantId,
      'X-User-ID': this.currentUser.id
    };
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const identityService = new IdentityService();

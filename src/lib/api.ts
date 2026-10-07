import type {
  User,
  EHRRecord,
  ConsentRecord,
  AccessRequest,
  AuditLogEntry,
  FabricBlock,
  IPFSFileMetadata
} from '../types.js';

export const TOKEN_STORAGE_KEY = 'medtrust_session_token';

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (e) {
    console.error('Could not save auth token to localStorage', e);
  }
};

export const removeAuthToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    console.error('Could not remove auth token from localStorage', e);
  }
};

export const authFetch = async (url: string, options: RequestInit = {}, retries = 1): Promise<Response> => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('x-session-token', token);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });
    return res;
  } catch (err: any) {
    if (retries > 0 && (err.name === 'TypeError' || err.message?.includes('fetch'))) {
      // Brief pause for dev server restart or temporary gateway reconnect
      await new Promise(resolve => setTimeout(resolve, 400));
      return authFetch(url, options, retries - 1);
    }
    throw new Error(err.message === 'Failed to fetch'
      ? 'Unable to connect to the MedTrust Gateway service. Please ensure the server is running and try again.'
      : err.message
    );
  }
};

export const api = {
  // Authentication & Session
  async login(credentials: { emailOrId: string; password?: string }): Promise<{ token: string; user: User; message: string }> {
    const identifier = (credentials.emailOrId || '').trim();
    const payload = {
      email: identifier,
      emailOrId: identifier,
      id: identifier,
      username: identifier,
      password: credentials.password || 'password123'
    };

    let res: Response;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (netErr: any) {
      // Retry once after brief pause if gateway connection dropped
      await new Promise(r => setTimeout(r, 400));
      try {
        res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch {
        throw new Error('Could not connect to MedTrust authentication gateway. Please retry in a moment.');
      }
    }

    const contentType = res.headers.get('content-type') || '';
    let data: any = {};
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(text || 'Unexpected gateway response format');
    }

    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed. Please check your credentials.');
    }

    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async register(userData: {
    name: string;
    email: string;
    password?: string;
    role: 'patient' | 'doctor';
    dob?: string;
    bloodGroup?: string;
    phone?: string;
    specialty?: string;
    hospital?: string;
    licenseNumber?: string;
  }): Promise<{ token: string; user: User; message: string }> {
    let res: Response;
    try {
      res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
    } catch (netErr: any) {
      await new Promise(r => setTimeout(r, 400));
      try {
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
      } catch {
        throw new Error('Could not connect to MedTrust consortium enrollment node. Please retry in a moment.');
      }
    }

    const contentType = res.headers.get('content-type') || '';
    let data: any = {};
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(text || 'Registration service unavailable');
    }

    if (!res.ok) {
      const err = new Error(data.error || 'Registration failed');
      (err as any).code = data.code;
      (err as any).email = data.email || userData.email;
      throw err;
    }

    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async getMe(): Promise<{ user: User } | null> {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const res = await authFetch('/api/auth/me');
      if (!res.ok) {
        if (res.status === 401) {
          removeAuthToken();
        }
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout endpoint call error', e);
    } finally {
      removeAuthToken();
    }
  },

  async updateProfile(profileData: Partial<User>): Promise<{ success: boolean; user: User }> {
    const res = await authFetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await authFetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
    return data;
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await authFetch('/api/users');
    const data = await res.json();
    return data.users;
  },

  // Records
  async getRecords(patientId?: string): Promise<EHRRecord[]> {
    const url = patientId ? `/api/records?patientId=${patientId}` : '/api/records';
    const res = await authFetch(url);
    const data = await res.json();
    return data.records || [];
  },

  async uploadRecord(payload: {
    patientId: string;
    title: string;
    recordType: string;
    facility?: string;
    doctorAuthor?: string;
    diagnosis: string;
    clinicalNotes: string;
    structuredData?: Record<string, any>;
    rawFileContent?: string;
    photoUrl?: string;
    isPhotoReport?: boolean;
    mimeType?: string;
    fileSize?: string;
  }): Promise<{ record: EHRRecord; txId: string; blockNumber: number }> {
    const res = await authFetch('/api/records/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  // Consent
  async getConsents(patientId?: string, doctorId?: string): Promise<ConsentRecord[]> {
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId);
    if (doctorId) params.append('doctorId', doctorId);
    const res = await authFetch(`/api/consent?${params.toString()}`);
    const data = await res.json();
    return data.consents || [];
  },

  async grantConsent(payload: {
    patientId: string;
    doctorId: string;
    recordId: string;
    scope: string;
    specificRecordIds?: string[];
    purpose: string;
    validDays: number;
  }): Promise<{ consent: ConsentRecord; txId: string; blockNumber: number }> {
    const res = await authFetch('/api/consent/grant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Grant consent failed');
    }

    return data;
  },

  async revokeConsent(consentId: string, patientId?: string, reason?: string): Promise<{ success: boolean; txId: string; blockNumber: number }> {
    const res = await authFetch('/api/consent/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consentId, patientId, reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Revocation failed');
    return data;
  },

  // Doctor Access
  async accessRecord(doctorId: string, recordId: string, purpose?: string): Promise<{
    authorized: boolean;
    record?: EHRRecord;
    consentUsed?: ConsentRecord;
    txId?: string;
    blockNumber?: number;
    error?: string;
    reason?: string;
    ipfsGatewayPayload?: any;
  }> {
    const res = await authFetch('/api/doctor/access-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId, recordId, purpose })
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        authorized: false,
        error: data.error || 'Access denied',
        reason: data.reason
      };
    }
    return data;
  },

  // Requests
  async getAccessRequests(patientId?: string, doctorId?: string): Promise<AccessRequest[]> {
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId);
    if (doctorId) params.append('doctorId', doctorId);
    const res = await authFetch(`/api/requests?${params.toString()}`);
    const data = await res.json();
    return data.requests || [];
  },

  async createAccessRequest(payload: {
    doctorId: string;
    patientId: string;
    recordId?: string;
    scope: string;
    purpose: string;
    urgency: string;
  }): Promise<AccessRequest> {
    const res = await authFetch('/api/requests/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create access request');
    return data.request;
  },

  // Blockchain
  async getBlocks(): Promise<FabricBlock[]> {
    const res = await authFetch('/api/blockchain/blocks');
    const data = await res.json();
    return data.blocks || [];
  },

  async getAuditLogs(patientId?: string, actorId?: string): Promise<AuditLogEntry[]> {
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId);
    if (actorId) params.append('actorId', actorId);
    const res = await authFetch(`/api/blockchain/audit?${params.toString()}`);
    const data = await res.json();
    return data.auditLogs || data.logs || [];
  },

  async verifyLedgerIntegrity(): Promise<{
    ledgerValid: boolean;
    totalBlocksVerified: number;
    totalTransactionsVerified: number;
    verificationChain: Array<{ blockNumber: number; valid: boolean; hash: string }>;
    tamperEvidence: string;
  }> {
    const res = await authFetch('/api/blockchain/verify-integrity');
    return await res.json();
  },

  // IPFS
  async inspectIpfsCid(cid: string): Promise<{ ipfsMetadata: IPFSFileMetadata; record?: EHRRecord }> {
    const res = await authFetch(`/api/ipfs/inspect/${cid}`);
    return await res.json();
  },

  // AI Helpers
  async summarizeEHR(payload: { title: string; diagnosis: string; clinicalNotes: string; structuredData?: any }): Promise<string> {
    const res = await authFetch('/api/ai/summarize-ehr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.summary;
  },

  async explainTerm(term: string, context?: string): Promise<string> {
    const res = await authFetch('/api/ai/explain-term', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term, context })
    });
    const data = await res.json();
    return data.explanation;
  },

  async analyzeConsent(payload: { doctorName: string; hospital: string; specialty: string; purpose: string; scope: string }): Promise<string> {
    const res = await authFetch('/api/ai/analyze-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.analysis;
  },

  async getClinicalInsights(payload: { recordTitle: string; diagnosis: string; clinicalNotes: string; structuredData?: any }): Promise<string> {
    const res = await authFetch('/api/ai/clinical-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.insights;
  }
};

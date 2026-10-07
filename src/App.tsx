/**
 * MedTrust: Blockchain-Based Secure EHR Sharing and Consent Management System
 * Individual Account Authentication & Sovereign RBAC
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.js';
import { PatientDashboard } from './components/PatientDashboard.js';
import { DoctorDashboard } from './components/DoctorDashboard.js';
import { ConsentManager } from './components/ConsentManager.js';
import { BlockchainExplorer } from './components/BlockchainExplorer.js';
import { AuditTrail } from './components/AuditTrail.js';
import { IPFSExplorer } from './components/IPFSExplorer.js';
import { ProjectDocs } from './components/ProjectDocs.js';
import { PresentationLanding } from './components/PresentationLanding.js';
import { LoginPage } from './components/LoginPage.js';
import { RegisterPage } from './components/RegisterPage.js';
import { UserProfileModal } from './components/UserProfileModal.js';

import { UploadEHRModal } from './components/UploadEHRModal.js';
import { EHRViewerModal } from './components/EHRViewerModal.js';
import {
  AISummaryModal,
  AITermExplainerModal,
  AIConsentAdvisorModal
} from './components/AIHelperModals.js';

import { api, authFetch, getAuthToken, setAuthToken, removeAuthToken } from './lib/api.js';
import type { User, EHRRecord, ConsentRecord, AccessRequest, FabricBlock, AuditLogEntry } from './types.js';

export default function App() {
  // Application Data States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<EHRRecord[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [blocks, setBlocks] = useState<FabricBlock[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Navigation & View States
  const [mainView, setMainView] = useState<'presentation' | 'prototype'>('presentation');
  const [authScreen, setAuthScreen] = useState<'app' | 'login' | 'register'>('app');
  const [loginInitialEmail, setLoginInitialEmail] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('workspace');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'security'>('profile');

  // Operational Modal States
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [viewingRecord, setViewingRecord] = useState<EHRRecord | null>(null);
  const [aiSummaryRecord, setAiSummaryRecord] = useState<EHRRecord | null>(null);
  const [explainingTerm, setExplainingTerm] = useState<string | undefined>(undefined);
  const [isTermExplainerOpen, setIsTermExplainerOpen] = useState<boolean>(false);
  const [analyzingRequest, setAnalyzingRequest] = useState<AccessRequest | null>(null);

  const safeAuthFetchJson = async <T,>(url: string, defaultValue: T): Promise<T> => {
    try {
      const res = await authFetch(url);
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        return defaultValue;
      }
      return await res.json();
    } catch {
      return defaultValue;
    }
  };

  // Fetch initial system data based on the authenticated user session
  const fetchData = useCallback(async () => {
    try {
      const [usersRes, recordsRes, consentsRes, requestsRes, blocksRes, auditRes] = await Promise.all([
        safeAuthFetchJson<{ users: User[] }>('/api/users', { users: [] }),
        safeAuthFetchJson<{ records: EHRRecord[] }>('/api/records', { records: [] }),
        safeAuthFetchJson<{ consents: ConsentRecord[] }>('/api/consents', { consents: [] }),
        safeAuthFetchJson<{ requests: AccessRequest[] }>('/api/access-requests', { requests: [] }),
        safeAuthFetchJson<{ blocks: FabricBlock[] }>('/api/blockchain/blocks', { blocks: [] }),
        safeAuthFetchJson<{ logs: AuditLogEntry[] }>('/api/audit-logs', { logs: [] })
      ]);

      setAllUsers(usersRes.users || []);
      setRecords(recordsRes.records || []);
      setConsents(consentsRes.consents || []);
      setAccessRequests(requestsRes.requests || []);
      setBlocks(blocksRes.blocks || []);
      setAuditLogs(auditRes.logs || []);
    } catch (err) {
      console.error('Error fetching MedTrust data:', err);
    }
  }, []);

  // Initialize session on startup
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const token = getAuthToken();
        if (token) {
          const meData = await api.getMe();
          if (meData?.user) {
            setCurrentUser(meData.user);
            setAuthScreen('app');
          } else {
            // Token expired or invalid
            removeAuthToken();
            setCurrentUser(null);
          }
        }
      } catch (e) {
        console.warn('Initial session validation error', e);
        removeAuthToken();
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // When currentUser changes or is restored, refresh isolated data
  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  // Auth Handlers
  const handleLoginSuccess = (user: User, token: string) => {
    setAuthToken(token);
    setCurrentUser(user);
    setAuthScreen('app');
    setMainView('prototype');
    setActiveTab('workspace');
  };

  const handleRegisterSuccess = (user: User, token: string) => {
    setAuthToken(token);
    setCurrentUser(user);
    setAuthScreen('app');
    setMainView('prototype');
    setActiveTab('workspace');
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      removeAuthToken();
      setCurrentUser(null);
      setRecords([]);
      setConsents([]);
      setAccessRequests([]);
      setAuthScreen('login');
      setIsProfileModalOpen(false);
    }
  };

  // Operational Handlers with authFetch
  const handleGrantConsent = async (payload: {
    patientId: string;
    doctorId: string;
    recordId: string;
    scope: string;
    specificRecordIds?: string[];
    purpose: string;
    validDays: number;
  }) => {
    // Find a real EHR record if recordId was not supplied
    const resolvedRecordId =
      payload.recordId ||
      payload.specificRecordIds?.[0] ||
      records.find(
        r => r.patientId === payload.patientId
      )?.recordId;

    console.log('[App] Grant consent payload:', payload);
    console.log('[App] Resolved recordId:', resolvedRecordId);

    if (!resolvedRecordId) {
      throw new Error(
        `No EHR record found for patient ${payload.patientId}`
      );
    }

    const res = await authFetch('/api/consent/grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: payload.patientId,
        doctorId: payload.doctorId,
        recordId: resolvedRecordId,
        scope: payload.scope,
        specificRecordIds: payload.specificRecordIds || [],
        purpose: payload.purpose,
        validDays: payload.validDays,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error || 'Failed to grant consent'
      );
    }

    await fetchData();

    return data;
  };

  const handleRevokeConsent = async (consentId: string, reason?: string) => {
    const res = await authFetch('/api/consent/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consentId,
        patientId: currentUser?.id,
        reason: reason || 'Revoked by patient from dashboard'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to revoke consent');
    await fetchData();
    return data;
  };

  const handleDoctorRequestAccess = async (payload: {
    patientId: string;
    recordId?: string;
    scope: string;
    purpose: string;
    urgency: string;
  }) => {
    // Find the patient's real EHR record if recordId was not supplied
    const resolvedRecordId =
      payload.recordId ||
      records.find(
        (record) => record.patientId === payload.patientId
      )?.recordId;

    console.log('[App] Access request payload:', payload);
    console.log('[App] Resolved recordId:', resolvedRecordId);

    if (!resolvedRecordId) {
      throw new Error(
        `No EHR record found for patient ${payload.patientId}. Please create/upload an EHR record first.`
      );
    }

    const res = await authFetch('/api/access-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: payload.patientId,
        recordId: resolvedRecordId,
        scope: payload.scope,
        purpose: payload.purpose,
        urgency: payload.urgency,
        doctorId: currentUser?.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error || 'Failed to submit request'
      );
    }

    await fetchData();

    return data;
  };

  const handleApproveAccessRequest = async (requestId: string, validDays: number = 30) => {
    const res = await authFetch(`/api/requests/${requestId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ validDays })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve access request');
    await fetchData();
    return data;
  };

  const handleRejectAccessRequest = async (requestId: string, reason?: string) => {
    const res = await authFetch(`/api/requests/${requestId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason || 'Declined by patient' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to decline access request');
    await fetchData();
    return data;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 space-y-4 font-sans">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-xl shadow-blue-500/20 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-blue-400 text-2xl">
            ✚
          </div>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-white text-base" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            MedTrust System
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Verifying cryptographic identity & MSP certificates...
          </p>
        </div>
      </div>
    );
  }

  // Explicit Authentication Screens (Login / Register)
  if (authScreen === 'login') {
    return (
      <LoginPage
        initialEmail={loginInitialEmail}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthScreen('register')}
        onExplorePublic={() => {
          setAuthScreen('app');
          setMainView('presentation');
        }}
      />
    );
  }

  if (authScreen === 'register') {
    return (
      <RegisterPage
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={(email) => {
          if (email) setLoginInitialEmail(email);
          setAuthScreen('login');
        }}
      />
    );
  }

  const patientPendingRequestsCount = accessRequests.filter(
    r => r.patientId === currentUser?.id && r.status === 'PENDING'
  ).length;

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white ${mainView === 'presentation' ? 'bg-white text-slate-800' : 'bg-slate-950 text-slate-100'
      }`}>

      {/* Top Main Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingRequestsCount={patientPendingRequestsCount}
        mainView={mainView}
        onSelectMainView={(view) => {
          if (view === 'prototype' && !currentUser) {
            setAuthScreen('login');
          } else {
            setMainView(view);
          }
        }}
        onOpenProfile={(tab) => {
          setProfileModalTab(tab || 'profile');
          setIsProfileModalOpen(true);
        }}
        onLogout={handleLogout}
        onLoginClick={() => setAuthScreen('login')}
      />

      {/* Main Content Area */}
      {mainView === 'presentation' ? (
        <PresentationLanding
          currentUser={currentUser || {
            id: 'guest',
            name: 'Guest Evaluator',
            email: 'guest@medtrust.health',
            role: 'patient',
            organization: 'Public Health MSP',
            mspId: 'PublicMSP',
            publicKey: '0x0000000000000000000000000000000000000000',
            did: 'did:medtrust:guest',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          }}
          records={records}
          consents={consents}
          blocks={blocks}
          auditLogs={auditLogs}
          onLaunchPrototype={(tab) => {
            if (!currentUser) {
              setAuthScreen('login');
            } else {
              if (tab) setActiveTab(tab);
              setMainView('prototype');
            }
          }}
        />
      ) : !currentUser ? (
        // Fallback guard: If someone lands in prototype view without an active session
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
          <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center font-bold text-xl">
              ✚
            </div>
            <h3 className="text-xl font-bold text-white">Authentication Required</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The MedTrust prototype requires individual account credentials to access role-isolated EHR data, IPFS records, and consent policies.
            </p>
            <button
              onClick={() => setAuthScreen('login')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all cursor-pointer"
            >
              Sign In to MedTrust Portal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col">
          {/* Prototype Header Sub-bar */}
          <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-300">Live Fabric Node:</span>
              <span className="font-mono text-cyan-400 font-semibold">peer0.org1.medtrust.health:7051</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 hidden sm:inline">User DID: <span className="text-slate-200 font-mono truncate max-w-xs">{currentUser.did}</span></span>
            </div>
            <button
              onClick={() => setMainView('presentation')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline cursor-pointer"
            >
              ← Back to Project Presentation
            </button>
          </div>

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'workspace' && (
              currentUser.role === 'patient' ? (
                <PatientDashboard
                  currentUser={currentUser}
                  records={records}
                  consents={consents}
                  accessRequests={accessRequests}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  onViewRecord={(rec) => setViewingRecord(rec)}
                  onOpenAISummary={(rec) => setAiSummaryRecord(rec)}
                  onOpenGrantConsent={() => setActiveTab('consent')}
                  onRevokeConsent={(cId) => handleRevokeConsent(cId)}
                  onOpenTermExplainer={(term) => {
                    setExplainingTerm(term);
                    setIsTermExplainerOpen(true);
                  }}
                  onOpenConsentAdvisor={(req) => setAnalyzingRequest(req)}
                  onApproveRequest={handleApproveAccessRequest}
                  onRejectRequest={handleRejectAccessRequest}
                  onRefresh={fetchData}
                />
              ) : (
                <DoctorDashboard
                  currentUser={currentUser}
                  allPatients={allUsers.filter(u => u.role === 'patient')}
                  records={records}
                  consents={consents}
                  onViewRecord={(rec) => setViewingRecord(rec)}
                  onRequestAccess={handleDoctorRequestAccess}
                  onRefresh={fetchData}
                />
              )
            )}

            {activeTab === 'consent' && (
              <ConsentManager
                currentUser={currentUser}
                allUsers={allUsers}
                records={records}
                consents={consents}
                onGrantConsent={handleGrantConsent}
                onRevokeConsent={handleRevokeConsent}
                onRefresh={fetchData}
              />
            )}

            {activeTab === 'blockchain' && (
              <BlockchainExplorer
                blocks={blocks}
                onRefresh={fetchData}
              />
            )}

            {activeTab === 'audit' && (
              <AuditTrail
                logs={auditLogs}
                currentUser={currentUser}
                onRefresh={fetchData}
              />
            )}

            {activeTab === 'ipfs' && (
              <IPFSExplorer
                records={records}
                onViewRecord={(rec) => setViewingRecord(rec)}
              />
            )}

            {activeTab === 'docs' && (
              <ProjectDocs />
            )}
          </main>
        </div>
      )}

      {/* User Profile & Security Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUserUpdated={(updatedUser) => {
            setCurrentUser(updatedUser);
            fetchData();
          }}
          onLogout={handleLogout}
        />
      )}

      {/* Upload EHR Modal */}
      {currentUser && (
        <UploadEHRModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          currentUser={currentUser}
          onRecordUploaded={() => fetchData()}
        />
      )}

      {/* Medical Document Viewer Modal */}
      {currentUser && (
        <EHRViewerModal
          isOpen={!!viewingRecord}
          onClose={() => setViewingRecord(null)}
          record={viewingRecord}
          currentUser={currentUser}
          onOpenAISummary={(rec) => setAiSummaryRecord(rec)}
          onOpenShareConsent={() => {
            setViewingRecord(null);
            setActiveTab('consent');
          }}
          onExplainTerm={(term) => {
            setExplainingTerm(term);
            setIsTermExplainerOpen(true);
          }}
        />
      )}

      {/* AI Plain Language Summary Modal */}
      <AISummaryModal
        isOpen={!!aiSummaryRecord}
        onClose={() => setAiSummaryRecord(null)}
        record={aiSummaryRecord}
      />

      {/* AI Medical Term Glossary Explainer */}
      <AITermExplainerModal
        isOpen={isTermExplainerOpen}
        onClose={() => setIsTermExplainerOpen(false)}
        initialTerm={explainingTerm}
      />

      {/* AI Consent Risk & Rationale Advisor */}
      <AIConsentAdvisorModal
        isOpen={!!analyzingRequest}
        onClose={() => setAnalyzingRequest(null)}
        request={analyzingRequest}
        onApprove={async () => {
          if (analyzingRequest) {
            await handleApproveAccessRequest(analyzingRequest.requestId);
          }
          setAnalyzingRequest(null);
        }}
      />

    </div>
  );
}

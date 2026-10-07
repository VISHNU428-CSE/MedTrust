import React, { useState } from 'react';
import { 
  Plus, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Share2, 
  Lock, 
  Eye, 
  Clock, 
  UserCheck, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Trash2,
  BookOpen,
  Activity,
  Heart,
  Fingerprint,
  RefreshCw,
  Camera,
  Check,
  History,
  XCircle,
  FileCheck
} from 'lucide-react';
import type { EHRRecord, ConsentRecord, AccessRequest, User } from '../types.js';
import confetti from 'canvas-confetti';

interface PatientDashboardProps {
  currentUser: User;
  records: EHRRecord[];
  consents: ConsentRecord[];
  accessRequests: AccessRequest[];
  onOpenUpload: () => void;
  onViewRecord: (record: EHRRecord) => void;
  onOpenAISummary: (record: EHRRecord) => void;
  onOpenGrantConsent: (record?: EHRRecord) => void;
  onRevokeConsent: (consentId: string) => void;
  onOpenTermExplainer: (term?: string) => void;
  onOpenConsentAdvisor: (request: AccessRequest) => void;
  onApproveRequest: (requestId: string) => Promise<any>;
  onRejectRequest: (requestId: string, reason?: string) => Promise<any>;
  onRefresh: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentUser,
  records,
  consents,
  accessRequests,
  onOpenUpload,
  onViewRecord,
  onOpenAISummary,
  onOpenGrantConsent,
  onRevokeConsent,
  onOpenTermExplainer,
  onOpenConsentAdvisor,
  onApproveRequest,
  onRejectRequest,
  onRefresh
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ id: string; type: 'approved' | 'declined'; text: string } | null>(null);
  const [showResolvedRequests, setShowResolvedRequests] = useState<boolean>(false);

  const myRecords = records.filter(r => r.patientId === currentUser.id);
  const myConsents = consents.filter(c => c.patientId === currentUser.id);
  const activeConsents = myConsents.filter(c => c.status === 'ACTIVE');
  const myPendingRequests = accessRequests.filter(r => r.patientId === currentUser.id && r.status === 'PENDING');
  const myResolvedRequests = accessRequests.filter(r => r.patientId === currentUser.id && r.status !== 'PENDING');

  const filteredRecords = myRecords.filter(r => {
    if (filterType === 'ALL') return true;
    if (filterType === 'photo') return Boolean(r.isPhotoReport || r.photoUrl);
    return r.recordType === filterType;
  });

  const handleApprove = async (req: AccessRequest) => {
    setProcessingRequestId(req.requestId);
    setFeedbackMessage(null);
    try {
      await onApproveRequest(req.requestId);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setFeedbackMessage({
        id: req.requestId,
        type: 'approved',
        text: `Access consent granted to ${req.doctorName}! Smart contract consent policy signed & committed to Hyperledger Fabric.`
      });
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (req: AccessRequest) => {
    setProcessingRequestId(req.requestId);
    setFeedbackMessage(null);
    try {
      await onRejectRequest(req.requestId, 'Declined by patient via portal');
      setFeedbackMessage({
        id: req.requestId,
        type: 'declined',
        text: `Access request from ${req.doctorName} was declined.`
      });
    } catch (err: any) {
      alert(err.message || 'Failed to decline request');
    } finally {
      setProcessingRequestId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Patient Profile & Sovereign Ownership Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/50 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500/40 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Sovereign Identity
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400 font-mono">
                <span>DID: <span className="text-slate-300">{currentUser.did}</span></span>
                <span>•</span>
                <span>Blood: <span className="text-sky-400 font-bold">{currentUser.bloodGroup || 'O+'}</span></span>
                <span>•</span>
                <span>MSP: <span className="text-indigo-400">{currentUser.mspId}</span></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenTermExplainer()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Medical Glossary</span>
            </button>

            <button
              id="upload-new-record-btn"
              onClick={onOpenUpload}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white text-xs font-medium shadow-lg shadow-sky-900/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New EHR / Photo</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Total EHRs Pinned</span>
              <Database className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-xl font-bold text-white mt-1">{myRecords.length}</p>
            <p className="text-[10px] text-slate-400">IPFS Off-Chain Storage</p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Active Consents</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-white mt-1">{activeConsents.length}</p>
            <p className="text-[10px] text-slate-400">Doctors Authorized</p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Access Requests</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-white mt-1">{myPendingRequests.length}</p>
            <p className="text-[10px] text-slate-400">Awaiting Decision</p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Ledger Security</span>
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>
            <p className="text-xl font-bold text-white mt-1">100% Valid</p>
            <p className="text-[10px] text-slate-400">Tamper-Proof Audit</p>
          </div>
        </div>
      </div>

      {/* Confirmation Feedback Toast */}
      {feedbackMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs text-emerald-200 flex items-center justify-between gap-3 shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">{feedbackMessage.text}</p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                The doctor's access request has been officially updated and synchronized on the ledger.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setFeedbackMessage(null)} 
            className="p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/50 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pending Doctor Access Requests Banner */}
      {myPendingRequests.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Incoming Doctor Access Request ({myPendingRequests.length})
                </h3>
                <p className="text-xs text-slate-400">
                  A physician is requesting cryptographic consent to view your health records. Click "Grant Consent" to authorize.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {myPendingRequests.map((req) => (
              <div
                key={req.requestId}
                className="bg-slate-900/90 border border-slate-700 hover:border-slate-600 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 text-sm">{req.doctorName}</span>
                    <span className="text-slate-400">({req.doctorHospital})</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      Scope: {req.scope}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Status: PENDING DECISION
                    </span>
                  </div>
                  <p className="text-slate-300">
                    <span className="text-slate-400">Clinical Purpose: </span>{req.purpose}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onOpenConsentAdvisor(req)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 flex items-center gap-1.5 transition-colors font-medium text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Risk Advisor</span>
                  </button>

                  <button
                    onClick={() => handleReject(req)}
                    disabled={processingRequestId === req.requestId}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors font-medium text-xs disabled:opacity-50"
                  >
                    Decline
                  </button>

                  <button
                    onClick={() => handleApprove(req)}
                    disabled={processingRequestId === req.requestId}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-medium text-xs shadow-md shadow-emerald-950/40 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {processingRequestId === req.requestId ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Issuing Policy...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Grant Consent</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Access Requests History (Toggleable) */}
      {myResolvedRequests.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowResolvedRequests(!showResolvedRequests)}
              className="flex items-center gap-2 text-slate-300 hover:text-white font-medium transition-colors"
            >
              <History className="w-4 h-4 text-sky-400" />
              <span>Doctor Access Requests History ({myResolvedRequests.length} resolved)</span>
              <span className="text-[11px] text-sky-400 font-normal underline ml-1">
                {showResolvedRequests ? 'Hide History' : 'Show Granted / Declined Requests'}
              </span>
            </button>
          </div>

          {showResolvedRequests && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              {myResolvedRequests.map(req => (
                <div 
                  key={req.requestId}
                  className="p-3 rounded-xl bg-slate-850/80 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{req.doctorName}</span>
                      <span className="text-slate-400">({req.doctorHospital})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'APPROVED' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {req.status === 'APPROVED' ? '✓ CONSENT GRANTED' : '✕ DECLINED'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Purpose: {req.purpose} • Scope: {req.scope}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {req.requestId}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area: EHR Records Grid & Active Consents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: My EHR Records */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold text-white">My Electronic Health Records</h2>
              <span className="text-xs text-slate-400">({filteredRecords.length})</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
              {[
                { id: 'ALL', label: 'All Records' },
                { id: 'photo', label: '📷 Scanned Photos' },
                { id: 'diagnostic_report', label: 'Diagnostic' },
                { id: 'cardiology_ecg', label: 'Cardiology' },
                { id: 'lab_result', label: 'Lab Panels' },
                { id: 'radiology_scan', label: 'Radiology/MRI' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap text-xs ${
                    filterType === f.id
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Records List */}
          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-medium text-slate-300">No records found for this category</p>
                <button
                  onClick={onOpenUpload}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium inline-flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Your First Record or Photo</span>
                </button>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div
                  key={record.recordId}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{record.title}</span>
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {record.recordId}
                        </span>
                        {record.photoUrl && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            Photo Attached
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{record.facility}</span>
                        <span>•</span>
                        <span>{record.doctorAuthor}</span>
                        <span>•</span>
                        <span>{record.dateOfRecord}</span>
                      </p>
                    </div>

                    <span className="px-2 py-1 rounded-md text-[10px] font-medium uppercase bg-sky-950/80 text-sky-300 border border-sky-800/60">
                      {record.recordType.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Scanned Photo Thumbnail Preview if attached */}
                  {record.photoUrl && (
                    <div 
                      onClick={() => onViewRecord(record)}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-sky-500/30 cursor-pointer transition-all group"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex-shrink-0">
                        <img 
                          src={record.photoUrl} 
                          alt="Report Scan Preview" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                      </div>
                      <div className="text-xs flex-1">
                        <span className="font-semibold text-sky-300 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-sky-400" />
                          Decrypted Medical Report Photo Attachment
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Symmetrically encrypted on IPFS • Click to view full resolution
                        </span>
                      </div>
                      <span className="text-xs text-sky-400 group-hover:translate-x-0.5 transition-transform">
                        Inspect →
                      </span>
                    </div>
                  )}

                  {/* Diagnosis Quote */}
                  <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-400">Diagnosis:</strong> {record.diagnosis}</span>
                  </div>

                  {/* IPFS and Fabric Proof Pills */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 truncate max-w-[280px]">
                      <Database className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                      <span className="truncate">CID: {record.ipfsCid}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenAISummary(record)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-colors text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>AI Summary</span>
                      </button>

                      <button
                        onClick={() => onViewRecord(record)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        <span>View Document</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Active Consents & Privacy Management */}
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Active Doctor Consents</h2>
            </div>
            <button
              onClick={() => onOpenGrantConsent()}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              + Grant New
            </button>
          </div>

          <div className="space-y-3">
            {activeConsents.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-2">
                <Lock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No active doctor permissions currently granted.</p>
                <p className="text-[11px] text-slate-500">Your records remain locked and 100% private.</p>
              </div>
            ) : (
              activeConsents.map((consent) => (
                <div
                  key={consent.consentId}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{consent.doctorName}</span>
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{consent.doctorHospital}</p>
                    </div>
                    
                    <button
                      onClick={() => onRevokeConsent(consent.consentId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Revoke Permission Immediately"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/60 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scope:</span>
                      <span className="font-mono text-sky-400 font-semibold">{consent.scope}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Purpose:</span>
                      <span className="text-slate-300 truncate max-w-[170px]">{consent.purpose}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expires:</span>
                      <span className="font-mono text-slate-300">{(consent.validUntil || consent.validFrom || '').split('T')[0] || '30 Days'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                    <span className="truncate max-w-[160px]">Tx: {consent.txId}</span>
                    <span className="text-emerald-400 font-semibold">Block #{consent.blockNumber}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

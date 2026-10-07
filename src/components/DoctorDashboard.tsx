import React, { useState } from 'react';
import { 
  Stethoscope, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  FileText, 
  Send, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Activity, 
  Database, 
  Eye, 
  Clock,
  RefreshCw,
  Hospital,
  AlertTriangle,
  Camera
} from 'lucide-react';
import type { User, EHRRecord, ConsentRecord, AccessRequest } from '../types.js';
import { authFetch } from '../lib/api.js';

interface DoctorDashboardProps {
  currentUser: User;
  allPatients: User[];
  records: EHRRecord[];
  consents: ConsentRecord[];
  onViewRecord: (record: EHRRecord) => void;
  onRequestAccess: (payload: { patientId: string; recordId?: string; scope: string; purpose: string; urgency: string }) => void;
  onRefresh: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  currentUser,
  allPatients,
  records,
  consents,
  onViewRecord,
  onRequestAccess,
  onRefresh
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(allPatients[0]?.id || 'pat-101');
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [requestScope, setRequestScope] = useState<string>('ALL_RECORDS');
  const [requestPurpose, setRequestPurpose] = useState<string>('Diagnostic Consultation & Cardiology Evaluation');
  const [urgency, setUrgency] = useState<string>('routine');
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  // Access Retrieval State
  const [accessingRecordId, setAccessingRecordId] = useState<string | null>(null);
  const [retrievedRecord, setRetrievedRecord] = useState<EHRRecord | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [clinicalInsights, setClinicalInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);
  const [requestStatusMessage, setRequestStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedPatient = allPatients.find(p => p.id === selectedPatientId);
  const patientRecords = records.filter(r => r.patientId === selectedPatientId);

  // Check if doctor has active consent for this patient
  const activeConsentForPatient = consents.find(
    c => c.patientId === selectedPatientId && c.doctorId === currentUser.id && c.status === 'ACTIVE'
  );

  const handleRequestAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !requestPurpose) return;

    setIsRequesting(true);
    setRequestStatusMessage(null);
    try {
      await onRequestAccess({
        patientId: selectedPatientId,
        recordId: selectedRecordId || undefined,
        scope: requestScope,
        purpose: requestPurpose,
        urgency
      });
      setRequestPurpose('');
      setRequestStatusMessage({
        type: 'success',
        text: 'Access request submitted and anchored to Hyperledger Fabric channel. The patient has been notified.'
      });
    } catch (err: any) {
      setRequestStatusMessage({
        type: 'error',
        text: `Error submitting request: ${err.message}`
      });
    } finally {
      setIsRequesting(false);
    }
  };

  // Perform server-side consent verification & retrieval
  const handleFetchRecord = async (record: EHRRecord) => {
    setAccessingRecordId(record.recordId);
    setAccessError(null);
    setRetrievedRecord(null);
    setClinicalInsights(null);

    try {
      const res = await authFetch('/api/doctor/access-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: currentUser.id,
          recordId: record.recordId,
          purpose: 'Clinical Review & Diagnosis'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.authorized) {
        setAccessError(data.error || 'ACCESS REJECTED: No active consent found on Hyperledger Fabric ledger.');
      } else {
        setRetrievedRecord(data.record);
        // Automatically fetch Gemini AI clinical decision support insights
        fetchClinicalInsights(data.record);
      }
    } catch (err: any) {
      setAccessError(err.message || 'Network error communicating with Fabric Gateway');
    } finally {
      setAccessingRecordId(null);
    }
  };

  const fetchClinicalInsights = async (record: EHRRecord) => {
    setIsLoadingInsights(true);
    try {
      const res = await authFetch('/api/ai/clinical-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordTitle: record.title,
          diagnosis: record.diagnosis,
          clinicalNotes: record.clinicalNotes,
          structuredData: record.structuredData
        })
      });
      const data = await res.json();
      setClinicalInsights(data.insights);
    } catch (err) {
      setClinicalInsights('Unable to generate AI clinical insights.');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Doctor Identity Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500/40 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {currentUser.specialty}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400 font-mono">
                <span>License: <span className="text-slate-300">{currentUser.licenseNumber}</span></span>
                <span>•</span>
                <span>Facility: <span className="text-slate-300">{currentUser.hospital}</span></span>
                <span>•</span>
                <span>MSP: <span className="text-indigo-400">{currentUser.mspId}</span></span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs space-y-1">
            <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">
              Enforcement Protocol
            </span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>FastAPI Server-Side Consent Verification</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Patient Selector & Clinical Retrieval Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Patient Selector & Request Form */}
        <div className="space-y-6">
          
          {/* Patient Directory */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-sky-400" />
                <span>Select Target Patient</span>
              </h2>
            </div>

            <div className="space-y-2">
              {allPatients.map((patient) => {
                const hasConsent = consents.some(
                  c => c.patientId === patient.id && c.doctorId === currentUser.id && c.status === 'ACTIVE'
                );

                return (
                  <button
                    key={patient.id}
                    id={`doctor-select-patient-${patient.id}`}
                    onClick={() => {
                      setSelectedPatientId(patient.id);
                      setRetrievedRecord(null);
                      setAccessError(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      selectedPatientId === patient.id
                        ? 'bg-sky-950/50 border-sky-500/80 text-white shadow-sm'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={patient.avatar} alt={patient.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <p className="text-xs font-semibold">{patient.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{patient.did}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      hasConsent 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {hasConsent ? 'CONSENT ACTIVE' : 'NO CONSENT'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Request Access Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" />
              <span>Request EHR Access</span>
            </h2>

            <form onSubmit={handleRequestAccessSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Patient</label>
                <input
                  type="text"
                  disabled
                  value={selectedPatient?.name || ''}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Requested Scope</label>
                <select
                  value={requestScope}
                  onChange={(e) => setRequestScope(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL_RECORDS">ALL_RECORDS (Full Medical History)</option>
                  <option value="DIAGNOSTIC_ONLY">DIAGNOSTIC_ONLY (Diagnostics & Labs)</option>
                  <option value="LAB_RESULTS">LAB_RESULTS (Blood Work Panels)</option>
                  <option value="EMERGENCY_ONLY">EMERGENCY_ONLY (Critical Data)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Clinical Purpose *</label>
                <textarea
                  rows={2}
                  required
                  value={requestPurpose}
                  onChange={(e) => setRequestPurpose(e.target.value)}
                  placeholder="Specify clinical rationale for record access..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {requestStatusMessage && (
                <div className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                  requestStatusMessage.type === 'success'
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                }`}>
                  <span>{requestStatusMessage.text}</span>
                  <button
                    type="button"
                    onClick={() => setRequestStatusMessage(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isRequesting}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Blockchain Access Request</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right 2 Cols: Patient Records & Live Retrieval Simulation */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Patient Header & Active Consent Status Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Records for {selectedPatient?.name}</h2>
                <span className="text-xs text-slate-400 font-mono">({patientRecords.length} records on ledger)</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Every retrieval attempt executes a smart contract query against Fabric to enforce patient consent.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeConsentForPatient ? (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Consent: {activeConsentForPatient.scope} (Exp: {(activeConsentForPatient.validUntil || '').split('T')[0] || 'Active'})</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>No Active Consent</span>
                </div>
              )}
            </div>
          </div>

          {/* Record Retrieval Cards */}
          <div className="space-y-3">
            {patientRecords.map((record) => (
              <div
                key={record.recordId}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{record.title}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {record.recordId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {record.facility} • {record.dateOfRecord} • IPFS: <span className="font-mono text-sky-400">{record.ipfsCid.slice(0, 16)}...</span>
                    </p>
                  </div>

                  <button
                    id={`fetch-record-${record.recordId}`}
                    onClick={() => handleFetchRecord(record)}
                    disabled={accessingRecordId === record.recordId}
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-all shadow flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
                  >
                    {accessingRecordId === record.recordId ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying Consent...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Retrieve & Decrypt EHR</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ACCESS DENIED ALERT BANNER (If doctor tried to fetch without active consent) */}
          {accessError && (
            <div className="p-5 bg-rose-950/40 border border-rose-500/50 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>Zero-Trust Security Enforcement: Access Denied (HTTP 403)</span>
              </div>
              <p className="text-xs text-rose-200 leading-relaxed font-sans">
                {accessError}
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-rose-900/60 flex items-center justify-between">
                <span>Tamper-evident audit event recorded on Hyperledger Fabric:</span>
                <span className="text-rose-400 font-bold">ACCESS_DENIED_UNAUTHORIZED</span>
              </div>
            </div>
          )}

          {/* AUTHORIZED RETRIEVED RECORD VIEW & AI CLINICAL INSIGHTS */}
          {retrievedRecord && (
            <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 space-y-5 shadow-2xl animate-in fade-in">
              
              {/* Authorized Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">{retrievedRecord.title}</h3>
                    <p className="text-xs text-emerald-400 font-medium">
                      ✓ Consent Verified by FastAPI Gateway • Decrypted from IPFS
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onViewRecord(retrievedRecord)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Full Inspector</span>
                </button>
              </div>

              {/* Clinical Data Display */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    Diagnosis
                  </span>
                  <p className="text-sm font-semibold text-white">{retrievedRecord.diagnosis}</p>
                </div>

                <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-1">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    Physician Clinical Notes
                  </span>
                  <p className="text-slate-200 leading-relaxed">{retrievedRecord.clinicalNotes}</p>
                </div>

                {retrievedRecord.photoUrl && (
                  <div className="p-3.5 bg-slate-850 rounded-xl border border-sky-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-sky-400" />
                        Decrypted Medical Report Photo Attachment
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">IPFS Decrypted</span>
                    </div>
                    <div 
                      onClick={() => onViewRecord(retrievedRecord)}
                      className="max-h-60 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center p-2 cursor-pointer group"
                    >
                      <img
                        src={retrievedRecord.photoUrl}
                        alt={retrievedRecord.title}
                        className="max-h-56 w-auto object-contain rounded group-hover:scale-[1.02] transition-transform"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 text-center">Click image or Full Inspector to open high-resolution lightbox</p>
                  </div>
                )}
              </div>

              {/* Gemini AI Clinical Decision Support */}
              <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-sky-950/40 to-slate-900 rounded-xl border border-indigo-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Gemini AI Clinical Decision Support</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Model: gemini-3.8-flash</span>
                </div>

                {isLoadingInsights ? (
                  <div className="py-4 text-center text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Synthesizing clinical indicators and risk factors...</span>
                  </div>
                ) : (
                  <div className="text-slate-200 leading-relaxed whitespace-pre-wrap pt-1 font-sans">
                    {clinicalInsights}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

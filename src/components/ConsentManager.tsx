import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  UserCheck,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Search,
  Key,
  RefreshCw,
  Fingerprint,
  Info
} from 'lucide-react';
import type { ConsentRecord, User, EHRRecord } from '../types.js';
import confetti from 'canvas-confetti';

interface ConsentManagerProps {
  currentUser: User;
  allUsers: User[];
  records: EHRRecord[];
  consents: ConsentRecord[];
  onGrantConsent: (payload: {
    patientId: string;
    doctorId: string;
    recordId: string;
    scope: string;
    specificRecordIds?: string[];
    purpose: string;
    validDays: number;
  }) => Promise<any>;
  onRevokeConsent: (consentId: string, reason?: string) => Promise<any>;
  onRefresh: () => void;
}

export const ConsentManager: React.FC<ConsentManagerProps> = ({
  currentUser,
  allUsers,
  records,
  consents,
  onGrantConsent,
  onRevokeConsent,
  onRefresh
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    currentUser.role === 'patient' ? currentUser.id : 'pat-101'
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('doc-201');
  const [scope, setScope] = useState<string>('ALL_RECORDS');
  const [validDays, setValidDays] = useState<number>(30);
  const [purpose, setPurpose] = useState<string>('Comprehensive Medical Consultation & Clinical Review');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REVOKED'>('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [revokingConsent, setRevokingConsent] = useState<ConsentRecord | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>('Patient requested immediate revocation from portal');
  const [isRevoking, setIsRevoking] = useState<boolean>(false);

  const patients = allUsers.filter(u => u.role === 'patient');
  const doctors = allUsers.filter(u => u.role === 'doctor');

  const filteredConsents = consents.filter(c => {
    if (currentUser.role === 'patient' && c.patientId !== currentUser.id) return false;
    if (currentUser.role === 'doctor' && c.doctorId !== currentUser.id) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    return true;
  });

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId || !purpose) return;

    setIsSubmitting(true);
    setNotification(null);
    try {
      const patientId =
        currentUser.role === 'patient'
          ? currentUser.id
          : selectedPatientId;
      console.log('[DEBUG] patientId:', patientId);
      console.log('[DEBUG] records:', records);
      console.log(
        '[DEBUG] record patientIds:',
        records.map(r => ({
          recordId: r.recordId,
          patientId: r.patientId
        }))
      );

      const selectedRecordId =
        records.find(record => record.patientId === patientId)?.recordId;

      if (!selectedRecordId) {
        throw new Error(
          'No EHR record found for this patient. Please create/upload an EHR record first.'
        );
      }

      console.log('[ConsentManager] Granting consent for record:', selectedRecordId);
      console.log('[ConsentManager] FINAL selectedRecordId:', selectedRecordId);
      console.log('[ConsentManager] FINAL patientId:', patientId);
      await onGrantConsent({
        patientId,
        doctorId: selectedDoctorId,
        recordId: selectedRecordId,
        scope,
        purpose,
        validDays
      });

      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch (e) { }

      setNotification({
        type: 'success',
        message: 'Consent policy immutably recorded on Hyperledger Fabric ledger and signed by endorsement peers.'
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Error granting consent: ${err.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokingConsent) return;
    setIsRevoking(true);
    setNotification(null);
    try {
      await onRevokeConsent(revokingConsent.consentId, revokeReason);
      setNotification({
        type: 'success',
        message: `Consent #${revokingConsent.consentId} revoked immediately. Hyperledger Fabric state database updated to REVOKED.`
      });
      setRevokingConsent(null);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Error revoking consent: ${err.message}`
      });
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Lock className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white">Cryptographic Consent Governance Center</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Fine-grained, time-bounded, and immediately revocable patient permissions anchored to Hyperledger Fabric.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fabric Chaincode: GrantConsent / RevokeConsent</span>
            </span>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150 ${notification.type === 'success'
          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
          : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
          }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Policy Creator & Live Consent Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Col: Grant Consent Policy Creator (Enabled for Patient / Admin) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Key className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-white">Create New Consent Policy</h2>
          </div>

          <form onSubmit={handleGrant} className="space-y-4 text-xs">
            {/* Patient Selector */}
            {currentUser.role !== 'patient' ? (
              <div>
                <label className="block text-slate-400 mb-1">Select Patient (Data Owner)</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.did})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-slate-400 mb-1">Patient (You)</label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.name} (${currentUser.did})`}
                  className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-300 font-medium"
                />
              </div>
            )}

            {/* Doctor Selector */}
            <div>
              <label className="block text-slate-400 mb-1">Target Healthcare Provider *</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.hospital} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>

            {/* Scope Selection */}
            <div>
              <label className="block text-slate-400 mb-1">Permitted Record Scope</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
              >
                <option value="ALL_RECORDS">ALL_RECORDS (Full Historical Health Records)</option>
                <option value="DIAGNOSTIC_ONLY">DIAGNOSTIC_ONLY (Diagnostics, Labs & Scans)</option>
                <option value="LAB_RESULTS">LAB_RESULTS (Blood Work Panels Only)</option>
                <option value="EMERGENCY_ONLY">EMERGENCY_ONLY (Critical Allergies & Vitals)</option>
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-slate-400 mb-1">Validity Duration</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { days: 7, label: '7 Days' },
                  { days: 30, label: '30 Days' },
                  { days: 90, label: '90 Days' },
                  { days: 365, label: '1 Year' }
                ].map(d => (
                  <button
                    key={d.days}
                    type="button"
                    onClick={() => setValidDays(d.days)}
                    className={`py-1.5 rounded-lg border text-center font-medium transition-all ${validDays === d.days
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clinical Purpose */}
            <div>
              <label className="block text-slate-400 mb-1">Purpose of Disclosure *</label>
              <input
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Cardiology Second Opinion Consultation"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Protocol Notice */}
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>ECDSA Digital Signature</span>
              </div>
              <p>
                Transaction is cryptographically signed by the patient's private key before being ordered into a Fabric block.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Anchor Consent to Blockchain</span>
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Consent Policies Table & Revocation Actions */}
        <div className="lg:col-span-2 space-y-4">

          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Active & Historical Consents</h2>
              <span className="text-xs text-slate-400 font-mono">({filteredConsents.length})</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {(['ALL', 'ACTIVE', 'REVOKED'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg transition-colors font-medium ${statusFilter === status
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Consents List */}
          <div className="space-y-3">
            {filteredConsents.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center space-y-2">
                <Lock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No consent policies matching this filter.</p>
              </div>
            ) : (
              filteredConsents.map((consent) => (
                <div
                  key={consent.consentId}
                  className={`bg-slate-900 border rounded-xl p-4 space-y-3 transition-all ${consent.status === 'ACTIVE'
                    ? 'border-slate-800 hover:border-slate-700'
                    : 'border-rose-950/60 bg-slate-900/60 opacity-80'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{consent.doctorName}</span>
                        <span className="text-slate-400 text-xs">({consent.doctorHospital})</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${consent.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                          {consent.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Patient: <strong className="text-slate-300">{consent.patientName}</strong> • Policy ID: <span className="font-mono text-sky-400">{consent.consentId}</span>
                      </p>
                    </div>

                    {consent.status === 'ACTIVE' && (
                      <button
                        onClick={() => {
                          setRevokingConsent(consent);
                          setRevokeReason('Patient requested immediate revocation from portal');
                        }}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Revoke Immediately</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/60 font-sans">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Scope:</span>
                      <span className="font-mono text-sky-300 font-semibold">{consent.scope}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Valid Until:</span>
                      <span className="text-slate-200">{(consent.validUntil || consent.validFrom || '').split('T')[0] || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Fabric Block / Tx:</span>
                      <span className="font-mono text-slate-300 truncate block">#{consent.blockNumber} ({consent.txId.slice(0, 10)}...)</span>
                    </div>
                  </div>

                  {consent.status === 'REVOKED' && (
                    <div className="text-[11px] text-rose-300 bg-rose-950/30 p-2 rounded border border-rose-900/50">
                      <strong>Revocation Recorded:</strong> {consent.revocationReason || 'Patient revoked permission'} (Timestamp: {consent.revokedAt})
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Revocation Confirmation Modal */}
      {revokingConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Revoke Consent Policy</h3>
                <p className="text-xs text-slate-400">Immutably invalidate access on Hyperledger Fabric</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <p className="text-slate-300">
                You are revoking access for <strong className="text-white">{revokingConsent.doctorName}</strong> ({revokingConsent.doctorHospital}).
              </p>
              <p className="text-slate-400 font-mono text-[11px]">
                Policy ID: {revokingConsent.consentId} • Scope: {revokingConsent.scope}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Revocation Reason (recorded on ledger):
              </label>
              <input
                type="text"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Treatment complete or patient requested revocation"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevokingConsent(null)}
                disabled={isRevoking}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                disabled={isRevoking}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {isRevoking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing Transaction...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm & Invalidate Key</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

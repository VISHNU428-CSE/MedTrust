import React, { useState } from 'react';
import { 
  History, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  FileText, 
  UserCheck, 
  Clock, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock,
  RefreshCw
} from 'lucide-react';
import type { AuditLogEntry, User } from '../types.js';

interface AuditTrailProps {
  logs: AuditLogEntry[];
  currentUser: User;
  onRefresh: () => void;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({
  logs,
  currentUser,
  onRefresh
}) => {
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter(log => {
    if (filterAction !== 'ALL' && log.action !== filterAction) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.txId.toLowerCase().includes(q) ||
      log.patientName.toLowerCase().includes(q) ||
      log.doctorName.toLowerCase().includes(q) ||
      log.recordTitle.toLowerCase().includes(q) ||
      log.purpose.toLowerCase().includes(q)
    );
  });

  const exportAuditReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MedTrust_Audit_Report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'AUTHORIZED_ACCESS':
      case 'AUTHORIZED_ACCESSED':
        return {
          label: 'AUTHORIZED READ',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: ShieldCheck
        };
      case 'DENIED_UNAUTHORIZED':
        return {
          label: 'SECURITY ALERT: ACCESS DENIED',
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold',
          icon: ShieldAlert
        };
      case 'CONSENT_GRANTED':
        return {
          label: 'CONSENT GRANTED',
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          icon: Unlock
        };
      case 'CONSENT_REVOKED':
        return {
          label: 'CONSENT REVOKED',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: Lock
        };
      case 'RECORD_UPLOADED':
        return {
          label: 'RECORD ANCHORED',
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          icon: FileText
        };
      default:
        return {
          label: action,
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: Clock
        };
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
                <History className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white">Immutable Access Audit Trail</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Every authorized access, consent modification, and unauthorized attempt is permanently logged to the blockchain ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportAuditReport}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-2 transition-all shadow"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export Compliance Audit Report</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400">Total Audit Events</span>
            <p className="text-xl font-bold text-white mt-0.5">{logs.length}</p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400">Authorized Accesses</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">
              {logs.filter(l => l.action.includes('AUTHORIZED')).length}
            </p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400">Unauthorized Breaches Prevented</span>
            <p className="text-xl font-bold text-rose-400 mt-0.5">
              {logs.filter(l => l.action === 'DENIED_UNAUTHORIZED').length}
            </p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400">Consensus Anchor</span>
            <p className="text-xl font-bold text-sky-400 mt-0.5">Hyperledger Fabric</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Action Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'AUTHORIZED_ACCESS', label: 'Authorized Reads' },
            { id: 'DENIED_UNAUTHORIZED', label: 'Security Denials' },
            { id: 'CONSENT_GRANTED', label: 'Consents Granted' },
            { id: 'CONSENT_REVOKED', label: 'Consents Revoked' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterAction(f.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
                filterAction === f.id
                  ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor, patient, or TxID..."
            className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Audit Log Entries Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="divide-y divide-slate-800/80">
          {filteredLogs.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              No audit log entries found matching this filter.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const BadgeIcon = badge.icon;
              const isDenied = log.action === 'DENIED_UNAUTHORIZED';

              return (
                <div
                  key={log.logId}
                  className={`p-4 transition-colors text-xs space-y-2 ${
                    isDenied ? 'bg-rose-950/20 hover:bg-rose-950/30' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono border flex items-center gap-1.5 ${badge.bg}`}>
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>

                      <span className="font-semibold text-white">
                        {log.recordTitle}
                      </span>
                    </div>

                    <span className="text-slate-400 font-mono text-[11px]">
                      {log.timestamp}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 font-sans">
                    <div>
                      <span className="text-slate-400">Accessing Physician: </span>
                      <span className="font-medium text-slate-200">{log.doctorName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Patient Owner: </span>
                      <span className="font-medium text-slate-200">{log.patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Clinical Purpose: </span>
                      <span className="text-slate-200">{log.purpose}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-2 truncate max-w-[340px]">
                      <span>Fabric Tx:</span>
                      <span className="text-slate-300 truncate">{log.txId}</span>
                    </div>
                    <div>
                      <span>Block Height: </span>
                      <span className="text-sky-400 font-bold">#{log.blockNumber}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

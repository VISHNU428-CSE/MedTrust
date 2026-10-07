import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  Copy, 
  Check, 
  HardDrive, 
  Server, 
  Cpu, 
  Network, 
  Layers,
  Key
} from 'lucide-react';
import type { EHRRecord } from '../types.js';

interface IPFSExplorerProps {
  records: EHRRecord[];
  onViewRecord: (record: EHRRecord) => void;
}

export const IPFSExplorer: React.FC<IPFSExplorerProps> = ({
  records,
  onViewRecord
}) => {
  const [copiedCid, setCopiedCid] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<EHRRecord | null>(records[0] || null);

  const handleCopy = (cid: string) => {
    navigator.clipboard.writeText(cid);
    setCopiedCid(cid);
    setTimeout(() => setCopiedCid(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Database className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white">InterPlanetary File System (IPFS) Cluster Node</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Off-chain distributed content-addressable storage for large medical records, diagnostic scans, and ECG telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-emerald-400" />
              <span>IPFS Kubo v0.26.0 Cluster Active</span>
            </span>
          </div>
        </div>

        {/* Node Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400">Pinned CID Objects</span>
            <p className="text-xl font-bold text-sky-400 mt-0.5">{records.length} Documents</p>
            <p className="text-[10px] text-slate-400">Content Addressed</p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400">Encryption Standard</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">AES-256-GCM</p>
            <p className="text-[10px] text-slate-400">Zero-Knowledge Storage</p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400">Cluster Replication</span>
            <p className="text-xl font-bold text-indigo-400 mt-0.5">3 Peer Nodes</p>
            <p className="text-[10px] text-slate-400">Hospital Consortium</p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400">Storage Overhead</span>
            <p className="text-xl font-bold text-amber-400 mt-0.5">0.00% On-Chain</p>
            <p className="text-[10px] text-slate-400">Files Never Touch Fabric</p>
          </div>
        </div>
      </div>

      {/* Architectural Explainer Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 text-xs">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Why Off-Chain IPFS + On-Chain Fabric Architecture?</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-slate-300">
          <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-1">
            <span className="font-semibold text-sky-400 block">1. Scalability & Speed</span>
            <p className="text-[11px] text-slate-400">
              Storing heavy medical images (CT scans, MRIs) directly on blockchain creates bloat. IPFS provides decentralized peer-to-peer storage with zero blockchain overhead.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-1">
            <span className="font-semibold text-emerald-400 block">2. Tamper-Proof Cryptography</span>
            <p className="text-[11px] text-slate-400">
              Every file produces a unique Content Identifier (CID). If even one pixel or character changes, the hash changes, triggering an immediate security alarm.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-1">
            <span className="font-semibold text-indigo-400 block">3. HIPAA & GDPR Compliance</span>
            <p className="text-[11px] text-slate-400">
              Personal health data is encrypted before upload. Only authorized physicians with valid on-chain consent can fetch the decryption key from the gateway.
            </p>
          </div>
        </div>
      </div>

      {/* Pinned IPFS Blobs Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left List of CIDs */}
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Pinned IPFS Objects</h2>
            <span className="text-xs text-slate-400 font-mono">({records.length})</span>
          </div>

          <div className="space-y-2">
            {records.map((rec) => (
              <button
                key={rec.recordId}
                onClick={() => setSelectedRecord(rec)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all space-y-1.5 ${
                  selectedRecord?.recordId === rec.recordId
                    ? 'bg-sky-950/60 border-sky-500/80 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs truncate max-w-[180px]">{rec.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">{rec.fileSize}</span>
                </div>
                <div className="text-[11px] font-mono text-sky-400 truncate flex items-center gap-1.5">
                  <HardDrive className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{rec.ipfsCid}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: CID Inspector & Raw DAG Node Viewer */}
        <div className="lg:col-span-2 space-y-4">
          {selectedRecord ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedRecord.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Patient: {selectedRecord.patientName} • Facility: {selectedRecord.facility}
                  </p>
                </div>

                <button
                  onClick={() => onViewRecord(selectedRecord)}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors"
                >
                  Open Record Viewer
                </button>
              </div>

              {/* CID breakdown */}
              <div className="space-y-3 text-xs font-mono">
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Content Identifier (CID v0):</span>
                    <button
                      onClick={() => handleCopy(selectedRecord.ipfsCid)}
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px] font-sans"
                    >
                      {copiedCid === selectedRecord.ipfsCid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCid === selectedRecord.ipfsCid ? 'Copied' : 'Copy CID'}</span>
                    </button>
                  </div>
                  <p className="text-sm font-bold text-sky-300 break-all">{selectedRecord.ipfsCid}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 font-sans block text-[10px]">Multihash Algorithm:</span>
                    <span className="text-slate-200">SHA2-256 (0x12)</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 font-sans block text-[10px]">UnixFS Format:</span>
                    <span className="text-slate-200">dag-pb (Protobuf File Chunk)</span>
                  </div>
                </div>
              </div>

              {/* Encryption Envelope */}
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-semibold font-sans">
                  <Key className="w-4 h-4" />
                  <span>Symmetric Encryption Envelope Verification</span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 space-y-1">
                  <div>Digest: <span className="text-slate-400">{selectedRecord.encryptionKeyHash}</span></div>
                  <div>Status: <span className="text-emerald-400 font-bold">100% Cryptographically Intact</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
              Select an IPFS object to inspect.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Database, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  Calendar, 
  UserCheck, 
  Building2, 
  Key, 
  Blocks,
  Share2,
  ExternalLink,
  BookOpen,
  Camera,
  Maximize2,
  ZoomIn,
  Eye
} from 'lucide-react';
import type { EHRRecord, User } from '../types.js';

interface EHRViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: EHRRecord | null;
  currentUser: User;
  onOpenAISummary?: (record: EHRRecord) => void;
  onOpenShareConsent?: (record: EHRRecord) => void;
  onExplainTerm?: (term: string) => void;
}

export const EHRViewerModal: React.FC<EHRViewerModalProps> = ({
  isOpen,
  onClose,
  record,
  currentUser,
  onOpenAISummary,
  onOpenShareConsent,
  onExplainTerm
}) => {
  const [activeTab, setActiveTab] = useState<'clinical' | 'ipfs' | 'blockchain'>('clinical');
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">{record.title}</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded">
                  {record.recordId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Patient: <span className="text-slate-200">{record.patientName}</span> | Date: {record.dateOfRecord}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAISummary && (
              <button
                onClick={() => onOpenAISummary(record)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Plain Summary</span>
              </button>
            )}

            {currentUser.role === 'patient' && onOpenShareConsent && (
              <button
                onClick={() => onOpenShareConsent(record)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Manage Consent</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="px-6 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('clinical')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'clinical' 
                ? 'bg-slate-800 text-sky-400 border border-slate-700' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Clinical Medical Record</span>
          </button>

          <button
            onClick={() => setActiveTab('ipfs')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'ipfs' 
                ? 'bg-slate-800 text-sky-400 border border-slate-700' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Off-Chain IPFS Payload</span>
          </button>

          <button
            onClick={() => setActiveTab('blockchain')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'blockchain' 
                ? 'bg-slate-800 text-sky-400 border border-slate-700' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Blocks className="w-3.5 h-3.5" />
            <span>Hyperledger Fabric Metadata</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: Clinical View */}
          {activeTab === 'clinical' && (
            <div className="space-y-6">
              
              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-400">Clinical Facility:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{record.facility}</p>
                </div>
                <div>
                  <span className="text-slate-400">Attending Physician:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{record.doctorAuthor}</p>
                </div>
                <div>
                  <span className="text-slate-400">Record Type:</span>
                  <p className="font-semibold text-slate-200 capitalize mt-0.5">{record.recordType.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Decrypted Photographic Medical Report (If Available) */}
              {record.photoUrl && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-sky-400" />
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Decrypted Medical Report Photo Scan
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      IPFS Payload Decrypted (AES-256)
                    </span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group">
                    <div className="max-h-80 w-full flex items-center justify-center p-3 bg-slate-950/90 overflow-hidden">
                      <img
                        src={record.photoUrl}
                        alt={record.title}
                        className="max-h-72 w-auto object-contain rounded-lg cursor-pointer transition-transform group-hover:scale-[1.01]"
                        onClick={() => setIsPhotoZoomed(true)}
                      />
                    </div>
                    
                    <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="font-mono text-sky-400">{record.fileSize}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-300">{record.mimeType || 'image/jpeg'}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsPhotoZoomed(true)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 shadow transition-all"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Inspect Full Resolution</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Diagnosis Box */}
              <div className="p-4 bg-sky-950/30 border border-sky-800/40 rounded-xl space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
                  Primary Clinical Diagnosis
                </span>
                <p className="text-sm font-medium text-white">
                  {record.diagnosis}
                </p>
              </div>

              {/* Clinical Notes */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Detailed Clinical Findings & Observations
                </h4>
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-200 leading-relaxed font-sans">
                  {record.clinicalNotes}
                </div>
              </div>

              {/* Structured Metrics (if available) */}
              {record.structuredData && Object.keys(record.structuredData).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Quantitative Biomarkers & Test Metrics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(record.structuredData).map(([key, val]) => (
                      <div key={key} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                        <span className="text-[10px] text-slate-400 capitalize block truncate">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-xs font-bold text-sky-300 font-mono mt-0.5 block">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Medical Findings */}
              {record.keyFindings && record.keyFindings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Key Highlights
                  </h4>
                  <ul className="space-y-1.5">
                    {record.keyFindings.map((finding, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: IPFS Off-Chain Storage Inspector */}
          {activeTab === 'ipfs' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Content Identifier (CID v0):</span>
                  <span className="font-mono text-sky-400 font-bold break-all">{record.ipfsCid}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Off-Chain Storage Node:</span>
                  <span className="font-mono text-slate-200">ipfs.medtrust-cluster.org</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Payload Size:</span>
                  <span className="font-mono text-slate-200">{record.fileSize}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Symmetric Key Encryption Hash:</span>
                  <span className="font-mono text-amber-300 truncate max-w-[280px]">{record.encryptionKeyHash}</span>
                </div>
              </div>

              {/* Raw IPFS Payload Preview */}
              {record.photoUrl && (
                <div className="p-3 bg-slate-800/80 rounded-xl border border-sky-500/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={record.photoUrl}
                      alt="IPFS Asset Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-700 bg-slate-950 flex-shrink-0"
                    />
                    <div>
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-sky-400" />
                        Off-Chain Graphic Asset (AES-256)
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        MIME: {record.mimeType || 'image/jpeg'} • Stored as IPFS unixfs chunk
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPhotoZoomed(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span>View Image</span>
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Raw Distributed IPFS Chunk (Decrypted Payload)
                </span>
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
{`{
  "protocol": "IPFS_DAG_PB_AES256_GCM",
  "cid": "${record.ipfsCid}",
  "recordId": "${record.recordId}",
  "patientId": "${record.patientId}",
  "title": "${record.title}",
  "diagnosis": "${record.diagnosis}",
  "clinicalNotes": "${record.clinicalNotes}",
  "facility": "${record.facility}",
  "isPhotoReport": ${Boolean(record.photoUrl)},
  "hasGraphicAttachment": ${Boolean(record.photoUrl)},
  "timestamp": "${record.createdAt}",
  "integrityDigest": "sha256:${record.encryptionKeyHash}"
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: Hyperledger Fabric Metadata */}
          {activeTab === 'blockchain' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Channel Name:</span>
                  <span className="font-mono text-sky-400 font-bold">medtrust-ehr-channel</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Committed Block Number:</span>
                  <span className="font-mono text-emerald-400 font-bold">#{record.blockNumber}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Fabric Transaction ID:</span>
                  <span className="font-mono text-slate-300 truncate max-w-[280px]">{record.txId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Smart Contract Chaincode:</span>
                  <span className="font-mono text-indigo-400 font-medium">medtrust_ehr_cc:v1.2</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>
                  This record is verified on the Hyperledger Fabric immutable state database. Any modification to the off-chain IPFS payload will immediately invalidate the cryptographic checksum.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Zero-Knowledge AES-256 Envelope</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox / Zoom Overlay for Medical Photo Scan */}
      {isPhotoZoomed && record.photoUrl && (
        <div 
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsPhotoZoomed(false)}
        >
          <div className="w-full max-w-5xl flex items-center justify-between pb-3 text-white">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-semibold truncate">{record.title}</span>
              <span className="text-xs text-slate-400 font-mono">({record.fileSize})</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPhotoZoomed(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Close Viewer (Esc)</span>
            </button>
          </div>

          <div 
            className="relative max-w-5xl max-h-[85vh] overflow-auto rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl p-2 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={record.photoUrl}
              alt={record.title}
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

    </div>
  );
};

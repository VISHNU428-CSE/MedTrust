import React, { useState } from 'react';
import { 
  Code2, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  ShieldCheck, 
  Server, 
  Database, 
  Blocks, 
  Cpu, 
  ArrowRight,
  BookOpen,
  Award,
  Lock
} from 'lucide-react';
import { EXPORTABLE_CODEBASE, type CodeFile } from '../data/codebaseExport.js';

export const ProjectDocs: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(EXPORTABLE_CODEBASE[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'codebase' | 'architecture' | 'viva'>('architecture');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const zipContent = EXPORTABLE_CODEBASE.map(f => `=== FILE: ${f.filename} ===\n\n${f.content}\n\n`).join('\n');
    const blob = new Blob([zipContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MedTrust_Production_Codebase_Export.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Code2 className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white">System Architecture & Production Codebase</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Industrial Final-Year Project Specification: FastAPI Gateway, Go Hyperledger Chaincode, IPFS, and Docker Orchestration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-lg shadow-indigo-900/30 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Code Package</span>
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 text-xs font-medium">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'architecture'
                ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Interactive Architecture & Sequence Flows</span>
          </button>

          <button
            onClick={() => setActiveTab('codebase')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'codebase'
                ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Production Code Files (FastAPI / Chaincode)</span>
          </button>

          <button
            onClick={() => setActiveTab('viva')}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'viva'
                ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Project Viva & Defense Guide</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Architecture Diagrams & Flow Visualizers */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          
          {/* Dual-Layer Architecture Diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                <span>MedTrust Dual-Layer Security Architecture</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Zero-Trust separation between off-chain sensitive payload storage and on-chain permissioned smart contract governance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Layer 1: Client Frontends */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-sky-400 font-semibold">
                  <Cpu className="w-4 h-4" />
                  <span>Layer 1: Presentation & Roles</span>
                </div>
                <ul className="space-y-2 text-slate-300">
                  <li className="p-2.5 bg-slate-800 rounded-lg border border-slate-700/60">
                    <strong className="text-white block">Patient Portal</strong>
                    Sovereign record ownership, granular consent granting, instant revocation.
                  </li>
                  <li className="p-2.5 bg-slate-800 rounded-lg border border-slate-700/60">
                    <strong className="text-white block">Doctor Clinical Console</strong>
                    Access requests, server-side consent validation, AI decision insights.
                  </li>
                  <li className="p-2.5 bg-slate-800 rounded-lg border border-slate-700/60">
                    <strong className="text-white block">Auditor Dashboard</strong>
                    Real-time compliance monitoring & tamper prevention logs.
                  </li>
                </ul>
              </div>

              {/* Layer 2: FastAPI Gateway Mediator */}
              <div className="bg-slate-800/60 border border-indigo-500/40 rounded-xl p-5 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <Server className="w-4 h-4" />
                  <span>Layer 2: FastAPI Zero-Trust Gateway</span>
                </div>
                <ul className="space-y-2 text-slate-300">
                  <li className="p-2.5 bg-slate-800 rounded-lg border border-slate-700/60">
                    <strong className="text-white block">Server-Side Consent Enforcement</strong>
                    No record is ever released without querying chaincode consent state.
                  </li>
                  <li className="p-2.5 bg-slate-800 rounded-lg border border-slate-700/60">
                    <strong className="text-white block">AES-256 Symmetric Envelope</strong>
                    Encrypts files prior to IPFS distribution; guards key release.
                  </li>
                  <li className="p-2.5 bg-slate-800 rounded-lg border border-slate-700/60">
                    <strong className="text-white block">Gemini 3.8 Flash AI Layer</strong>
                    Plain-language summarization & clinical terminology translator.
                  </li>
                </ul>
              </div>

              {/* Layer 3: Decentralized Storage & Ledger */}
              <div className="bg-slate-800/60 border border-emerald-500/40 rounded-xl p-5 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Database className="w-4 h-4" />
                  <span>Layer 3: IPFS & Hyperledger Fabric</span>
                </div>
                <ul className="space-y-2 text-slate-300">
                  <li className="p-2.5 bg-slate-800 rounded-lg border border-slate-700/60">
                    <strong className="text-white block">IPFS Distributed Storage</strong>
                    Large medical payloads stored off-chain as immutable content-addressed chunks (CID).
                  </li>
                  <li className="p-2.5 bg-slate-800 rounded-lg border border-slate-700/60">
                    <strong className="text-white block">Hyperledger Fabric v2.5</strong>
                    Permissioned blockchain ledger storing consent policies, CIDs, and audit logs.
                  </li>
                  <li className="p-2.5 bg-slate-800 rounded-lg border border-slate-700/60">
                    <strong className="text-white block">CouchDB State Database</strong>
                    Supports rich queries for active consent validation.
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Sequence Flows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Authorized Record Retrieval Flow</span>
              </h3>
              <ol className="space-y-2 text-slate-300 list-decimal list-inside bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60 font-sans">
                <li>Doctor requests record via <code className="text-sky-300">POST /api/doctor/access-record</code>.</li>
                <li>FastAPI Gateway invokes smart contract <code className="text-indigo-300">CheckConsent(recordId, doctorId)</code> on Fabric.</li>
                <li>Fabric validates active status and non-expired timestamp.</li>
                <li>Gateway retrieves encrypted payload from IPFS using stored CID.</li>
                <li>Gateway records <code className="text-emerald-300">AUTHORIZED_ACCESS</code> on Fabric ledger.</li>
                <li>Record is decrypted and returned to physician.</li>
              </ol>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Unauthorized Attempt Prevention Flow</span>
              </h3>
              <ol className="space-y-2 text-slate-300 list-decimal list-inside bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60 font-sans">
                <li>Doctor without consent calls <code className="text-sky-300">POST /api/doctor/access-record</code>.</li>
                <li>FastAPI queries Fabric chaincode <code className="text-indigo-300">CheckConsent()</code>.</li>
                <li>Smart contract returns authorization failure (<code className="text-rose-400">NO_ACTIVE_CONSENT</code>).</li>
                <li>Gateway commits <code className="text-rose-400">DENIED_UNAUTHORIZED</code> security audit event to Fabric.</li>
                <li>Gateway rejects request with HTTP 403 Forbidden.</li>
                <li>No medical payload or IPFS CID is ever revealed.</li>
              </ol>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: Production Codebase Inspector */}
      {activeTab === 'codebase' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* File selector sidebar */}
          <div className="space-y-2">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs">
              <span className="font-semibold text-white block">Project Source Files</span>
              <span className="text-[11px] text-slate-400">Select file to inspect & copy</span>
            </div>

            <div className="space-y-1">
              {EXPORTABLE_CODEBASE.map((file) => (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                    selectedFile.filename === file.filename
                      ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <p className="font-medium font-mono text-[11px] truncate">{file.filename}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{file.category}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* File Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-sky-400 font-bold">{selectedFile.filename}</span>
                <p className="text-[11px] text-slate-400">{selectedFile.description}</p>
              </div>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="p-5 bg-slate-950 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200">
              <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: Viva & Defense Guide */}
      {activeTab === 'viva' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-xs">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Project Viva Defense & Examiner Q&A Guide</span>
            </h2>
            <p className="text-slate-400 mt-1">
              Top questions university evaluators and industry examiners ask about blockchain EHR systems.
            </p>
          </div>

          <div className="space-y-4 text-slate-300">
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                Q1: Why use Hyperledger Fabric instead of public blockchains like Ethereum or Solana?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong>Answer:</strong> Healthcare requires strict HIPAA/GDPR compliance, identity management, and predictable latency without volatile gas fees. Hyperledger Fabric is a <em>permissioned</em> blockchain with Membership Service Providers (MSPs) and private channels, ensuring only licensed hospitals and patients can participate.
              </p>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                Q2: What happens if a patient revokes consent while a doctor is viewing their dashboard?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong>Answer:</strong> The revocation is committed to Fabric state within milliseconds. The next time the doctor's application requests record retrieval or updates, the FastAPI Gateway executes a live <code className="text-sky-300">CheckConsent()</code> query on Fabric, immediately terminating access and logging an unauthorized attempt.
              </p>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1.5">
              <h4 className="font-bold text-white text-sm">
                Q3: How does the system handle "The Right to be Forgotten" (GDPR Article 17)?
              </h4>
              <p className="text-slate-300 leading-relaxed">
                <strong>Answer:</strong> Because the medical files reside off-chain in IPFS and are protected by symmetric encryption keys, deleting the off-chain IPFS pin and cryptographic key renders the data permanently unrecoverable, fulfilling GDPR while maintaining the integrity of the blockchain audit log.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

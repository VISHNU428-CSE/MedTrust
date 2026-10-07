import React from 'react';
import { 
  Shield, 
  ArrowRight, 
  Lock, 
  UserCheck, 
  History, 
  Check, 
  Cpu, 
  Play, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Database,
  Blocks,
  FileText,
  Stethoscope,
  Activity,
  ShieldCheck,
  Key,
  Server,
  Network,
  GitBranch,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  FileCode2,
  Layers
} from 'lucide-react';
import type { User, EHRRecord, ConsentRecord, AccessRequest, FabricBlock, AuditLogEntry } from '../types.js';

interface PresentationLandingProps {
  currentUser: User;
  records: EHRRecord[];
  consents: ConsentRecord[];
  blocks: FabricBlock[];
  auditLogs: AuditLogEntry[];
  onLaunchPrototype: (tab?: string) => void;
  onSelectUserRole: (role: 'patient' | 'doctor' | 'admin') => void;
}

export const PresentationLanding: React.FC<PresentationLandingProps> = ({
  currentUser,
  records,
  consents,
  blocks,
  auditLogs,
  onLaunchPrototype,
  onSelectUserRole
}) => {
  const activeConsentsCount = consents.filter(c => c.status === 'ACTIVE').length;
  const latestBlock = blocks.length > 0 ? blocks[blocks.length - 1] : null;

  return (
    <div className="w-full bg-white text-slate-800 font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 via-white to-white" id="home">
        {/* Subtle background glow accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-12 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Mission & Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Hyperledger Fabric &bull; IPFS Decentralized Architecture</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                Trust your health data with <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">MedTrust.</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                A patient-centric Electronic Health Record (EHR) sharing and consent management platform.
                Combines permissioned blockchain smart contracts with decentralized off-chain storage to guarantee
                confidentiality, granular patient sovereignty, and immutable auditability.
              </p>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="hero-launch-live-prototype-btn"
                  onClick={() => onLaunchPrototype('workspace')}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  <span>Launch Live Prototype</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#methodology"
                  className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 transition-all flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>System Architecture</span>
                </a>

                <a
                  href="#comparison"
                  className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span>Feature Comparison</span>
                </a>
              </div>

              {/* Enterprise Consensus Tag */}
              <div className="pt-4 flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Enterprise Consent Governance &bull; Zero Gas-Fee Consortium Ledger</span>
              </div>

            </div>

            {/* Right Column: Live Node Simulator Card */}
            <div className="lg:col-span-5">
              <div 
                onClick={() => onLaunchPrototype('blockchain')}
                className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl border border-slate-800 text-white cursor-pointer group hover:border-blue-500/50 transition-all duration-300"
              >
                {/* Status Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-300">peer0.org1.medtrust.health</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    RAFT CONSENSUS OK
                  </span>
                </div>

                {/* Central Emblem & Ledger Health */}
                <div className="py-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                    ✚
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-white tracking-tight" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                    Hyperledger Fabric Consortium
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Channel: ehr-channel &bull; MSP: HospitalOrg1MSP
                  </p>
                </div>

                {/* Live Real-time Stat Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="bg-slate-800/80 rounded-xl p-3 text-center border border-slate-700/60">
                    <p className="text-xl font-bold text-white font-mono">
                      {records.length > 0 ? String(records.length).padStart(2, '0') : '24'}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Records</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-3 text-center border border-slate-700/60">
                    <p className="text-xl font-bold text-cyan-400 font-mono">
                      {activeConsentsCount > 0 ? String(activeConsentsCount).padStart(2, '0') : '08'}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Consents</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-3 text-center border border-slate-700/60">
                    <p className="text-xl font-bold text-emerald-400 font-mono">
                      100%
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Audited</p>
                  </div>
                </div>

                {/* Bottom Ledger Height Pill */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px] text-cyan-300 flex items-center gap-1.5">
                    <Blocks className="w-3.5 h-3.5" />
                    Block Height #{latestBlock ? latestBlock.blockNumber : '106'}
                  </span>
                  <span className="font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1 text-[11px]">
                    Inspect Ledger <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE SIMULATION TEST BAR */}
      <section className="bg-slate-50 border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Interactive Prototype Workflow Simulator
                </h4>
                <p className="text-xs text-slate-500">
                  Jump directly into any identity role or protocol module to test real smart-contract behavior
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  onSelectUserRole('patient');
                  onLaunchPrototype('workspace');
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Patient Portal</span>
              </button>

              <button
                onClick={() => {
                  onSelectUserRole('doctor');
                  onLaunchPrototype('workspace');
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
                <span>Doctor Console</span>
              </button>

              <button
                onClick={() => onLaunchPrototype('consent')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Consent Manager</span>
              </button>

              <button
                onClick={() => onLaunchPrototype('blockchain')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Blocks className="w-3.5 h-3.5 text-blue-600" />
                <span>Fabric Ledger</span>
              </button>

              <button
                onClick={() => onLaunchPrototype('audit')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <History className="w-3.5 h-3.5 text-emerald-600" />
                <span>Audit Trail</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION / CORE PILLARS */}
      <section className="py-20 bg-white" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              Healthcare Data, Secured by Cryptographic Trust
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Traditional healthcare information systems suffer from siloed vendor lock-in, centralized vulnerabilities,
              unauthorized data brokering, and an absence of genuine patient ownership. MedTrust reimagines health record
              sharing through decentralized consensus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                Privacy-Preserving Access
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Medical records remain fully encrypted using AES-256-GCM. Decryption keys and view permissions are strictly
                governed by patient-issued authorization tokens verified at runtime by Hyperledger smart contracts.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-6">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                Sovereign Patient Ownership
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Patients act as the sole administrative authority over their clinical records. They selectively approve,
                customize time-bounds, configure granular scopes, or revoke clinician access instantly with zero friction.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                Tamper-Evident Audit Trails
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every file upload, doctor access request, patient approval, document retrieval, and policy revocation
                is immutably committed to the blockchain, creating a non-repudiable audit history compliant with HIPAA and GDPR.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. OBJECTIVES SECTION */}
      <section className="py-20 bg-slate-50 border-y border-slate-200" id="objectives">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              Project Objectives & Scope
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Formulated to address the fundamental security and interoperability shortcomings of contemporary electronic health records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {[
              {
                title: 'Patient-Centric EHR Portal',
                desc: 'Develop a modern, responsive web application enabling patients to manage their medical history autonomously.'
              },
              {
                title: 'IPFS Distributed Storage',
                desc: 'Store clinical documents, diagnostic scans, and lab reports off-chain with cryptographic content addressing.'
              },
              {
                title: 'Hyperledger Fabric Ledger',
                desc: 'Deploy a permissioned consortium blockchain to manage identity, access policies, and consensus without gas fees.'
              },
              {
                title: 'Granular Consent Policies',
                desc: 'Implement smart contract-enforced consent rules governing specific records, time windows, and clinicians.'
              },
              {
                title: 'Access Request Lifecycle',
                desc: 'Provide an interactive workflow for doctors to request records and patients to approve, reject, or negotiate.'
              },
              {
                title: 'Dynamic Access Revocation',
                desc: 'Allow patients to instantly invalidate previously granted permissions, immediately terminating file decryption keys.'
              },
              {
                title: 'Tamper-Evident Audit Logging',
                desc: 'Log every interaction into immutable ledger blocks with SHA-256 cryptographic linkage for legal compliance.'
              },
              {
                title: 'AI Medical Glossaries',
                desc: 'Integrate patient-friendly AI translation of complex clinical terminology, prescriptions, and lab values.'
              }
            ].map((obj, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </span>
                  <h4 className="text-base font-bold text-slate-900" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                    {obj.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {obj.desc}
                </p>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* 5. METHODOLOGY & ARCHITECTURE SECTION */}
      <section className="py-20 bg-white" id="methodology">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              System Methodology & Architecture
            </h2>
            <p className="mt-4 text-base text-slate-600">
              MedTrust utilizes a hybrid architecture pairing off-chain peer-to-peer storage with on-chain permissioned smart contracts.
            </p>
          </div>

          {/* Architecture Diagram Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            
            <div className="p-6 rounded-2xl bg-blue-50/80 border border-blue-200 text-center relative group">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white mx-auto flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">Tier 1 &bull; Presentation</span>
              <h4 className="text-base font-bold text-slate-900 mt-1">React UI Clients</h4>
              <p className="text-xs text-slate-600 mt-2">Patient Dashboard, Clinical Console, Consent Governance Manager</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center relative group">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-white mx-auto flex items-center justify-center mb-3 shadow-md">
                <Server className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Tier 2 &bull; API Gateway</span>
              <h4 className="text-base font-bold text-slate-900 mt-1">FastAPI Backend</h4>
              <p className="text-xs text-slate-600 mt-2">Fabric Gateway SDK, Client Encryption, IPFS Cluster Client, RBAC Proxy</p>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-center relative group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white mx-auto flex items-center justify-center mb-3 shadow-md shadow-indigo-500/20">
                <Blocks className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-mono">Tier 3 &bull; Consensus</span>
              <h4 className="text-base font-bold text-slate-900 mt-1">Hyperledger Fabric</h4>
              <p className="text-xs text-slate-600 mt-2">Chaincode Smart Contracts, Raft Ordering, World State CouchDB, MSP Auth</p>
            </div>

            <div className="p-6 rounded-2xl bg-cyan-50/80 border border-cyan-200 text-center relative group">
              <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white mx-auto flex items-center justify-center mb-3 shadow-md shadow-cyan-500/20">
                <Database className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 font-mono">Tier 4 &bull; Storage</span>
              <h4 className="text-base font-bold text-slate-900 mt-1">IPFS Swarm</h4>
              <p className="text-xs text-slate-600 mt-2">Decentralized Content-Addressed Hash Blobs, AES-256 Encrypted EHR Data</p>
            </div>

          </div>

          {/* 5-Step Operational Flow */}
          <div className="mt-16">
            <h3 className="text-xl font-bold text-slate-900 mb-8 text-center" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              End-to-End Operational Lifecycle
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">MSP Authentication</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Doctor or patient logs in. X.509 cryptographic certificate and Membership Service Provider (MSP) identity validated.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">EHR Upload & IPFS</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Medical records are encrypted with symmetric keys and pinned to IPFS nodes, producing a unique immutable CID.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                  3
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Ledger Anchoring</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Metadata (CID, hash, patient ID, timestamp) is committed to Hyperledger Fabric state through chaincode invocation.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                  4
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Patient Consent</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  When a doctor requests access, the patient receives a prompt and cryptographically approves, bounds, or rejects it.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                  5
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Audited Decryption</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Chaincode verifies active consent, authorizes decryption, and permanently commits the view event to the audit ledger.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6. COMPARISON MATRIX SECTION */}
      <section className="py-20 bg-slate-50 border-y border-slate-200" id="comparison">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              MedTrust vs. Traditional Healthcare Systems
            </h2>
            <p className="mt-4 text-base text-slate-600">
              A detailed comparative analysis highlighting how decentralized consent solves architectural vulnerabilities in centralized EHRs.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">Evaluation Criteria</th>
                    <th className="py-4 px-6 text-slate-400">Traditional Centralized EHR</th>
                    <th className="py-4 px-6 text-cyan-400">MedTrust (Fabric + IPFS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">Data Architecture</td>
                    <td className="py-4 px-6 text-slate-600 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Single centralized hospital database (SPOF vulnerability)</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-blue-700 bg-blue-50/40">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Decentralized IPFS storage + consortium blockchain state</span>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">Access Control Model</td>
                    <td className="py-4 px-6 text-slate-600 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Static hospital RBAC without patient intervention</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-blue-700 bg-blue-50/40">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Dynamic smart contract consent policies issued by patient</span>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">Patient Autonomy</td>
                    <td className="py-4 px-6 text-slate-600 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Zero visibility into third-party sharing or access logs</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-blue-700 bg-blue-50/40">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Sovereign ownership: patient approves, scopes, or rejects every request</span>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">Access Revocation</td>
                    <td className="py-4 px-6 text-slate-600 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Manual, bureaucratic, or non-existent in legacy databases</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-blue-700 bg-blue-50/40">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Instant cryptographic revocation via chaincode invalidation</span>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">Audit History Integrity</td>
                    <td className="py-4 px-6 text-slate-600 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Mutable application log files subject to internal tampering</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-blue-700 bg-blue-50/40">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Immutable ledger blocks with SHA-256 cryptographic linkage</span>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">Interoperability</td>
                    <td className="py-4 px-6 text-slate-600 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Fragmented proprietary systems across hospital networks</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-blue-700 bg-blue-50/40">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Consortium chaincode standardized across participating healthcare orgs</span>
                      </div>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 7. TECHNOLOGY STACK SECTION */}
      <section className="py-20 bg-white" id="technology">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              Engineered with Enterprise Standards
            </h2>
            <p className="mt-4 text-base text-slate-600">
              A production-grade technology matrix chosen for confidentiality, zero gas-fee operation, and high transaction throughput.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-center hover:bg-white hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center font-bold text-sm mb-2">
                ⚛
              </div>
              <h4 className="text-sm font-bold text-slate-900">React 18</h4>
              <p className="text-[11px] text-slate-500 mt-1">TypeScript &bull; Tailwind</p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-center hover:bg-white hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-bold text-sm mb-2">
                ⚡
              </div>
              <h4 className="text-sm font-bold text-slate-900">FastAPI</h4>
              <p className="text-[11px] text-slate-500 mt-1">Python 3.11 Backend</p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-center hover:bg-white hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center font-bold text-sm mb-2">
                ⛓
              </div>
              <h4 className="text-sm font-bold text-slate-900">Fabric 2.5</h4>
              <p className="text-[11px] text-slate-500 mt-1">Permissioned Ledger</p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-center hover:bg-white hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 mx-auto flex items-center justify-center font-bold text-sm mb-2">
                📦
              </div>
              <h4 className="text-sm font-bold text-slate-900">IPFS</h4>
              <p className="text-[11px] text-slate-500 mt-1">Decentralized Storage</p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-center hover:bg-white hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 mx-auto flex items-center justify-center font-bold text-sm mb-2">
                🐳
              </div>
              <h4 className="text-sm font-bold text-slate-900">Docker</h4>
              <p className="text-[11px] text-slate-500 mt-1">Containers &bull; Swarm</p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-center hover:bg-white hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 mx-auto flex items-center justify-center font-bold text-sm mb-2">
                📜
              </div>
              <h4 className="text-sm font-bold text-slate-900">Chaincode</h4>
              <p className="text-[11px] text-slate-500 mt-1">Go / Node Smart Contracts</p>
            </div>

          </div>

        </div>
      </section>

      {/* 8. CALL TO ACTION SECTION */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            Ready to test the live prototype?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Experience the complete end-to-end workflow: upload encrypted medical records to IPFS, request clinical access as a doctor,
            manage consent policies as a patient, and verify ledger blocks in real time.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onLaunchPrototype('workspace')}
              className="px-8 py-4 rounded-xl font-bold text-sm bg-blue-500 hover:bg-blue-600 text-white shadow-xl shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Interactive Prototype</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#home"
              className="px-6 py-4 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all"
            >
              Back to Top ↑
            </a>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="py-8 bg-slate-950 text-slate-400 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">✚</span>
            <span className="font-bold text-slate-200 font-sans">MedTrust</span>
            <span>&bull; Decentralized EHR Sharing & Consent Management Platform</span>
          </div>
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} MedTrust. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};

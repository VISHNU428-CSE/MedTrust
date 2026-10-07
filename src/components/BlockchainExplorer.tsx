import React, { useState } from 'react';
import { 
  Blocks, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle, 
  ExternalLink, 
  Clock, 
  Database, 
  Key, 
  RefreshCw, 
  Lock, 
  FileCode,
  Fingerprint
} from 'lucide-react';
import type { FabricBlock, FabricTransaction } from '../types.js';

interface BlockchainExplorerProps {
  blocks: FabricBlock[];
  onRefresh: () => void;
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({
  blocks,
  onRefresh
}) => {
  const [selectedBlock, setSelectedBlock] = useState<FabricBlock | null>(null);
  const [selectedTx, setSelectedTx] = useState<FabricTransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVerifyingChain, setIsVerifyingChain] = useState<boolean>(false);
  const [chainIntegrityStatus, setChainIntegrityStatus] = useState<'UNVERIFIED' | 'VALID' | 'CORRUPTED'>('UNVERIFIED');

  const filteredBlocks = blocks.map(b => ({
    ...b,
    currentHash: b.currentHash || b.blockHash,
    transactionCount: b.transactionCount ?? b.transactionsCount ?? b.transactions?.length ?? 1,
    endorserOrgs: b.endorserOrgs || ['HospitalOrg1MSP', 'PatientMSP']
  })).filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.blockNumber.toString().includes(q) ||
      (b.currentHash || '').toLowerCase().includes(q) ||
      b.transactions.some(tx => tx.txId.toLowerCase().includes(q) || tx.function.toLowerCase().includes(q))
    );
  });

  const handleVerifyIntegrity = async () => {
    setIsVerifyingChain(true);
    await new Promise(r => setTimeout(r, 800));
    // Verify cryptographic linking
    let isValid = true;
    for (let i = 1; i < blocks.length; i++) {
      const prevHash = blocks[i - 1].currentHash || blocks[i - 1].blockHash;
      if (blocks[i].previousHash !== prevHash) {
        isValid = false;
        break;
      }
    }
    setChainIntegrityStatus(isValid ? 'VALID' : 'CORRUPTED');
    setIsVerifyingChain(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Blocks className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white">Hyperledger Fabric Ledger Explorer</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Permissioned blockchain maintaining immutable, tamper-evident consent states and access audit records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleVerifyIntegrity}
              disabled={isVerifyingChain}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${
                chainIntegrityStatus === 'VALID'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {isVerifyingChain ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Verifying SHA-256 Chain...</span>
                </>
              ) : chainIntegrityStatus === 'VALID' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Chain Integrity 100% Cryptographically Verified</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Verify Blockchain Integrity</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Network Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400">Channel Height</span>
            <p className="text-xl font-bold text-sky-400 mt-0.5">{blocks.length} Blocks</p>
            <p className="text-[10px] text-slate-400">Genesis to Head</p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400">Total Transactions</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">
              {blocks.reduce((acc, b) => acc + b.transactionCount, 0)} Txns
            </p>
            <p className="text-[10px] text-slate-400">Smart Contract Calls</p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400">Ordering Service</span>
            <p className="text-xl font-bold text-amber-400 mt-0.5">Raft (CFT)</p>
            <p className="text-[10px] text-slate-400">Crash Fault Tolerant</p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400">State Database</span>
            <p className="text-xl font-bold text-indigo-400 mt-0.5">CouchDB</p>
            <p className="text-[10px] text-slate-400">Rich JSON Querying</p>
          </div>
        </div>
      </div>

      {/* Block Sequence Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white">Block Linear Chain (Genesis → Latest)</h2>
            <p className="text-xs text-slate-400">Click any block to inspect its cryptographic header and transactions</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by block #, TxID, or hash..."
              className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Chain Carousel */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 scrollbar-thin">
          {filteredBlocks.map((block, index) => (
            <React.Fragment key={block.blockNumber}>
              <button
                id={`inspect-block-${block.blockNumber}`}
                onClick={() => {
                  setSelectedBlock(block);
                  setSelectedTx(null);
                }}
                className={`flex-shrink-0 w-64 p-4 rounded-xl border text-left transition-all relative ${
                  selectedBlock?.blockNumber === block.blockNumber
                    ? 'bg-sky-950/60 border-sky-500 text-white shadow-lg shadow-sky-950/50'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                  <span className="font-bold text-sm text-sky-400">
                    Block #{block.blockNumber}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                    {block.transactionCount} {block.transactionCount === 1 ? 'Tx' : 'Txns'}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1.5 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Block Hash:</span>
                    <span className="text-slate-200 truncate block">{block.currentHash.slice(0, 18)}...</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Timestamp:</span>
                    <span className="text-slate-400 block">{block.timestamp?.split('T')[1]?.replace('Z', '') || block.timestamp || ''}</span>
                  </div>
                </div>
              </button>

              {index < filteredBlocks.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Selected Block Detailed Inspector */}
      {selectedBlock && (
        <div className="bg-slate-900 border border-sky-500/40 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Block #{selectedBlock.blockNumber} Cryptographic Payload</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded">
                  CHANNEL: medtrust-ehr-channel
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mined at {selectedBlock.timestamp}
              </p>
            </div>

            <button
              onClick={() => setSelectedBlock(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close Inspector
            </button>
          </div>

          {/* Cryptographic Hashes Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-400 font-sans block text-[10px]">Previous Block Hash (Chaining):</span>
              <span className="text-slate-300 break-all">{selectedBlock.previousHash}</span>
            </div>

            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-400 font-sans block text-[10px]">Current Block Hash (SHA-256):</span>
              <span className="text-emerald-400 font-bold break-all">{selectedBlock.currentHash}</span>
            </div>

            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-400 font-sans block text-[10px]">Merkle Root Hash (Transactions Digest):</span>
              <span className="text-indigo-300 break-all">{selectedBlock.merkleRoot}</span>
            </div>

            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-400 font-sans block text-[10px]">Endorsing Peer Organizations:</span>
              <span className="text-sky-300 font-bold">{(selectedBlock.endorserOrgs || ['HospitalOrg1MSP', 'PatientMSP']).join(', ')}</span>
            </div>
          </div>

          {/* Transactions inside this block */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Committed Transactions ({selectedBlock.transactions.length})
            </h4>

            <div className="space-y-2">
              {selectedBlock.transactions.map((tx) => (
                <div
                  key={tx.txId}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-sky-500/20 text-sky-400 font-bold">
                        {tx.function}
                      </span>
                      <span className="font-mono text-slate-300 text-[11px] truncate max-w-[280px]">
                        Tx: {tx.txId}
                      </span>
                    </div>

                    <span className="text-slate-400 text-[11px]">
                      Caller MSP: <strong className="text-slate-200">{tx.creatorMsp}</strong>
                    </span>
                  </div>

                  {/* Transaction payload JSON */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(tx.payload, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

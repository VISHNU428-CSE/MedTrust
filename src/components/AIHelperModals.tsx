import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCw, 
  HelpCircle,
  Copy,
  Check,
  Send,
  MessageSquare,
  Camera
} from 'lucide-react';
import type { EHRRecord, AccessRequest } from '../types.js';
import { GLOSSARY_TERMS } from '../data/mockData.js';

// ----------------------------------------------------
// 1. AI Plain-Language EHR Summary Modal
// ----------------------------------------------------
interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: EHRRecord | null;
}

export const AISummaryModal: React.FC<AISummaryModalProps> = ({
  isOpen,
  onClose,
  record
}) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && record) {
      fetchSummary();
    }
  }, [isOpen, record]);

  const fetchSummary = async () => {
    if (!record) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/summarize-ehr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: record.title,
          diagnosis: record.diagnosis,
          clinicalNotes: record.clinicalNotes,
          structuredData: record.structuredData
        })
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-900/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">AI Medical Translation & Summary</h2>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Translating clinical terminology into plain, compassionate English
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 text-xs">
            <span className="text-slate-400">Analyzing Record: </span>
            <span className="font-semibold text-sky-300">{record.title}</span>
            <p className="text-slate-400 mt-0.5">Primary Diagnosis: {record.diagnosis}</p>
          </div>

          {record.photoUrl && (
            <div className="flex items-center gap-3 p-2.5 bg-slate-800/40 rounded-xl border border-sky-500/30 text-xs">
              <img 
                src={record.photoUrl} 
                alt="Report Scan" 
                className="w-12 h-12 rounded-lg object-cover border border-slate-700 bg-slate-950 flex-shrink-0" 
              />
              <div>
                <span className="text-sky-300 font-semibold flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                  Medical Report Photo Analyzed
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Gemini multimodal vision synthesized clinical indicators directly from the scanned document image.
                </p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-sky-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Synthesizing clinical findings into patient-friendly insights...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-5 bg-slate-800/90 rounded-xl border border-slate-700 text-xs text-slate-200 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                {summary}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
          <button
            onClick={fetchSummary}
            disabled={isLoading}
            className="text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate Analysis</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};


// ----------------------------------------------------
// 2. AI Medical Term Explainer Modal
// ----------------------------------------------------
interface AITermExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTerm?: string;
}

export const AITermExplainerModal: React.FC<AITermExplainerModalProps> = ({
  isOpen,
  onClose,
  initialTerm = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialTerm || 'Sinus Bradycardia');
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialTerm) {
      setSearchTerm(initialTerm);
      handleExplain(initialTerm);
    } else if (isOpen) {
      handleExplain(searchTerm);
    }
  }, [isOpen, initialTerm]);

  const handleExplain = async (termToExplain: string) => {
    if (!termToExplain) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/explain-term', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: termToExplain,
          context: 'Electronic Health Record patient portal'
        })
      });
      const data = await res.json();
      setExplanation(data.explanation);
    } catch (err) {
      setExplanation('Unable to fetch definition.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Medical Glossary Explainer</h2>
              <p className="text-xs text-slate-400">Instant plain-English definitions of complex clinical terms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Search Box */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExplain(searchTerm)}
              placeholder="Enter any medical phrase or lab acronym..."
              className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleExplain(searchTerm)}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explain</span>
            </button>
          </div>

          {/* Quick Popular Term Pills */}
          <div>
            <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Common EHR Terms:</span>
            <div className="flex flex-wrap gap-1.5">
              {GLOSSARY_TERMS.slice(0, 6).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchTerm(item.term);
                    handleExplain(item.term);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 transition-colors"
                >
                  {item.term}
                </button>
              ))}
            </div>
          </div>

          {/* Explanation Output */}
          {isLoading ? (
            <div className="py-8 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Consulting MedTrust AI clinical model...</p>
            </div>
          ) : (
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {explanation || 'Select or enter a term above to get a clear definition.'}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};


// ----------------------------------------------------
// 3. AI Consent Request Risk & Clarity Advisor Modal
// ----------------------------------------------------
interface AIConsentAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AccessRequest | null;
  onApprove: () => void;
}

export const AIConsentAdvisorModal: React.FC<AIConsentAdvisorModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove
}) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && request) {
      fetchAnalysis();
    }
  }, [isOpen, request]);

  const fetchAnalysis = async () => {
    if (!request) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: request.doctorName,
          hospital: request.doctorHospital,
          specialty: request.doctorSpecialty,
          purpose: request.purpose,
          scope: request.scope
        })
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setAnalysis('Unable to analyze request.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI Consent Request Privacy Advisor</h2>
              <p className="text-xs text-slate-400">
                Evaluating doctor's clinical rationale & scope before granting blockchain consent
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Request summary box */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <span className="text-slate-400">Requesting Physician:</span>
              <span className="font-semibold text-white">{request.doctorName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <span className="text-slate-400">Hospital / Facility:</span>
              <span className="text-slate-200">{request.doctorHospital} ({request.doctorSpecialty})</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <span className="text-slate-400">Requested Scope:</span>
              <span className="font-mono text-sky-400 font-bold">{request.scope}</span>
            </div>
            <div>
              <span className="text-slate-400">Stated Purpose:</span>
              <p className="text-slate-200 mt-0.5">{request.purpose}</p>
            </div>
          </div>

          {/* AI Analysis */}
          {isLoading ? (
            <div className="py-8 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Analyzing clinical necessity and privacy implications...</p>
            </div>
          ) : (
            <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {analysis}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Decline for Now
          </button>

          <button
            onClick={() => {
              onApprove();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Proceed to Grant Consent</span>
          </button>
        </div>

      </div>
    </div>
  );
};

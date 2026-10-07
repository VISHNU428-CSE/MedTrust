import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  ArrowRight, 
  AlertCircle, 
  UserCheck, 
  Stethoscope, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Sparkles,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Fingerprint
} from 'lucide-react';
import { api } from '../lib/api.js';
import type { User } from '../types.js';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  onSwitchToRegister: () => void;
  onExplorePublic?: () => void;
  initialEmail?: string;
}

const PRESET_ACCOUNTS = [
  {
    name: 'Sarah Chen',
    role: 'patient',
    email: 'sarah.chen@medtrust.health',
    id: 'pat-101',
    label: 'Patient (Primary Record Owner)',
    badgeColor: 'emerald',
    org: 'Patient Sovereign MSP',
    description: '4 EHR Records, active consents with Dr. Vance'
  },
  {
    name: 'David Miller',
    role: 'patient',
    email: 'david.miller@medtrust.health',
    id: 'pat-102',
    label: 'Patient (Isolated Data Owner)',
    badgeColor: 'emerald',
    org: 'Patient Sovereign MSP',
    description: 'Isolated records (Sarah cannot see David\'s records)'
  },
  {
    name: 'Dr. Alexander Vance',
    role: 'doctor',
    email: 'alexander.vance@metrohealth.org',
    id: 'doc-201',
    label: 'Cardiologist (Consortium Provider)',
    badgeColor: 'sky',
    org: 'MetroHealthMSP',
    description: 'Active consent for Sarah Chen\'s cardiology records'
  },
  {
    name: 'Dr. Elena Rostova',
    role: 'doctor',
    email: 'elena.rostova@stjudes.org',
    id: 'doc-202',
    label: 'Neurologist (Specialist)',
    badgeColor: 'sky',
    org: 'StJudesMSP',
    description: 'Requires patient consent prior to retrieving EHRs'
  },
  {
    name: 'Dr. Marcus Thorne',
    role: 'doctor',
    email: 'marcus.thorne@johnshopkins.edu',
    id: 'doc-203',
    label: 'Emergency Physician',
    badgeColor: 'purple',
    org: 'HopkinsMSP',
    description: 'Emergency access role with audit logging'
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onSwitchToRegister,
  onExplorePublic,
  initialEmail
}) => {
  const [emailOrId, setEmailOrId] = useState(initialEmail || '');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(true);

  React.useEffect(() => {
    if (initialEmail) {
      setEmailOrId(initialEmail);
      setErrorMessage(null);
    }
  }, [initialEmail]);

  // Auto-detect role hint based on input
  const detectedPreset = PRESET_ACCOUNTS.find(
    p => p.email.toLowerCase() === emailOrId.toLowerCase().trim() || 
         p.id.toLowerCase() === emailOrId.toLowerCase().trim()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = emailOrId.trim();
    const trimmedPassword = password.trim();

    if (!trimmedId) {
      setErrorMessage('Please enter your email or consortium user ID');
      return;
    }

    if (!trimmedPassword) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.login({
        emailOrId: trimmedId,
        password: trimmedPassword
      });

      onLoginSuccess(res.user, res.token);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_ACCOUNTS[0]) => {
    setEmailOrId(preset.email);
    setPassword('password123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background cryptographic grid styling */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      
      {/* Subtle glowing ambient accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 p-0.5 shadow-xl shadow-blue-500/20 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-blue-400 text-2xl">
              ✚
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            MedTrust Portal
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Unified Healthcare Access &bull; Patient & Doctor Authentication
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400">
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Hyperledger Fabric MSP &bull; PBKDF2 Encrypted</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="mt-6 bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 sm:p-8">
          {errorMessage && (
            <div 
              id="login-error-banner"
              className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Authentication Failed</p>
                <p className="text-rose-400/90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / ID Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Consortium Email or Member ID
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email-input"
                  type="text"
                  value={emailOrId}
                  onChange={(e) => setEmailOrId(e.target.value)}
                  placeholder="e.g. sarah.chen@medtrust.health or pat-101"
                  required
                  autoComplete="username"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              {/* Role Detected Notification */}
              {detectedPreset && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>Detected Role:</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${
                    detectedPreset.role === 'patient' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80' 
                      : 'bg-sky-950 text-sky-400 border border-sky-800/80'
                  }`}>
                    {detectedPreset.role} &bull; {detectedPreset.name}
                  </span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-500">
                  Default test: <code className="text-slate-400 font-mono">medtrust2026</code>
                </span>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Notice */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                <span>Persist session token</span>
              </label>

              <span className="text-slate-500 text-[11px]">
                RBAC Isolated
              </span>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Fabric MSP Identity...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Sovereign Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Credentials Accordion for Testing */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Quick-Fill Evaluator Accounts (Single Portal)</span>
              </div>
              {showPresets ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showPresets && (
              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                {PRESET_ACCOUNTS.map((preset) => {
                  const isSelected = emailOrId.toLowerCase() === preset.email.toLowerCase() || 
                                     emailOrId.toLowerCase() === preset.id.toLowerCase();
                  return (
                    <div
                      key={preset.id}
                      id={`preset-btn-${preset.id}`}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-600/15 border-blue-500/50 text-white' 
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            preset.role === 'patient' ? 'bg-emerald-400' : 'bg-sky-400'
                          }`} />
                          <span className="text-xs font-semibold text-slate-200">{preset.name}</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                          preset.role === 'patient'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : 'bg-sky-950/80 text-sky-400 border border-sky-800/60'
                        }`}>
                          {preset.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span className="font-mono text-[10px] text-slate-400">{preset.email}</span>
                        <span className="text-[10px] text-slate-500">{preset.id}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 italic">
                        {preset.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Switch to Registration */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Need a new medical consortium account?
            </span>
            <button
              id="goto-register-btn"
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors underline"
            >
              Register New Account →
            </button>
          </div>
        </div>

        {/* Public Project Overview Alternative */}
        {onExplorePublic && (
          <div className="mt-6 text-center">
            <button
              onClick={onExplorePublic}
              className="text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
            >
              ← View MedTrust Architecture & Project Documentation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

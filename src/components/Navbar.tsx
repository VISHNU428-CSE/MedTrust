import React, { useState } from 'react';
import { 
  Shield, 
  UserCheck, 
  Stethoscope, 
  FileText, 
  Blocks, 
  Database, 
  History, 
  Code2, 
  ChevronDown, 
  Lock,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Play,
  User as UserIcon,
  LogOut,
  Key,
  Fingerprint
} from 'lucide-react';
import type { User } from '../types.js';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingRequestsCount: number;
  mainView: 'presentation' | 'prototype';
  onSelectMainView: (view: 'presentation' | 'prototype') => void;
  onOpenProfile: (tab?: 'profile' | 'security') => void;
  onLogout: () => void;
  onLoginClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  pendingRequestsCount,
  mainView,
  onSelectMainView,
  onOpenProfile,
  onLogout,
  onLoginClick
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const prototypeTabs = [
    {
      id: 'workspace',
      label: currentUser?.role === 'patient' ? 'Patient Portal' : currentUser?.role === 'doctor' ? 'Clinical Console' : 'Workspace',
      icon: currentUser?.role === 'patient' ? UserCheck : currentUser?.role === 'doctor' ? Stethoscope : Shield
    },
    {
      id: 'consent',
      label: 'Consent Manager',
      icon: Lock
    },
    {
      id: 'blockchain',
      label: 'Fabric Ledger',
      icon: Blocks
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: History
    },
    {
      id: 'ipfs',
      label: 'IPFS Storage',
      icon: Database
    },
    {
      id: 'docs',
      label: 'Architecture',
      icon: Code2
    }
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-colors duration-200 ${
      mainView === 'presentation' 
        ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800' 
        : 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <div 
              id="brand-logo"
              onClick={() => onSelectMainView('presentation')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                ✚
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-lg sm:text-xl font-bold tracking-tight ${
                    mainView === 'presentation' ? 'text-slate-900' : 'text-white'
                  }`} style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                    MedTrust
                  </span>
                  <span className="hidden md:inline text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wide">
                    v2.5
                  </span>
                </div>
                <p className={`text-[10px] sm:text-[11px] leading-tight ${
                  mainView === 'presentation' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Hyperledger Fabric &bull; IPFS
                </p>
              </div>
            </div>

            {/* Mode Switcher Segmented Control */}
            <div className={`hidden lg:flex items-center p-1 rounded-xl text-xs font-semibold border ${
              mainView === 'presentation'
                ? 'bg-slate-100 border-slate-200 text-slate-600'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}>
              <button
                id="toggle-presentation-view"
                onClick={() => onSelectMainView('presentation')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  mainView === 'presentation'
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Project Overview</span>
              </button>
              <button
                id="toggle-prototype-view"
                onClick={() => onSelectMainView('prototype')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  mainView === 'prototype'
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'hover:text-blue-600'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Live Prototype</span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {mainView === 'presentation' ? (
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              <a 
                href="#about" 
                className="text-xs lg:text-sm font-medium text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                About
              </a>
              <a 
                href="#objectives" 
                className="text-xs lg:text-sm font-medium text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Objectives
              </a>
              <a 
                href="#methodology" 
                className="text-xs lg:text-sm font-medium text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Methodology
              </a>
              <a 
                href="#architecture" 
                className="text-xs lg:text-sm font-medium text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Architecture
              </a>
              <a 
                href="#comparison" 
                className="text-xs lg:text-sm font-medium text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Comparison
              </a>

              {currentUser ? (
                <button
                  id="navbar-launch-prototype-btn"
                  onClick={() => onSelectMainView('prototype')}
                  className="ml-3 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Portal ({currentUser.name?.split(' ')[0] || currentUser.name || 'User'})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="navbar-login-btn"
                  onClick={onLoginClick}
                  className="ml-3 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Prototype Navigation Tabs */
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => onSelectMainView('presentation')}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-950/40 border border-sky-800/40 hover:bg-sky-900/40 transition-colors mr-1"
                title="Return to Research Presentation"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>

              {prototypeTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => onSelectTab(item.id)}
                    className={`text-xs font-semibold px-2.5 lg:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.id === 'workspace' && currentUser?.role === 'patient' && pendingRequestsCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-bold rounded-full text-[10px]">
                        {pendingRequestsCount}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Individual Account Profile & Logout Menu */}
              {currentUser ? (
                <div className="relative ml-2 pl-2 border-l border-slate-800">
                  <button
                    id="user-account-menu-btn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-all text-left"
                    aria-label="User account menu"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-600"
                    />
                    <div className="hidden xl:block">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200 leading-none">{currentUser.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          currentUser.role === 'patient'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-sky-950 text-sky-300 border border-sky-800'
                        }`}>
                          {currentUser.role}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Account Dropdown Menu */}
                  {dropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setDropdownOpen(false)} 
                      />
                      <div 
                        id="user-account-dropdown"
                        className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      >
                        {/* User Identity Header */}
                        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={currentUser.avatar}
                              alt={currentUser.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                            </div>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                            <span className="font-mono text-cyan-400 flex items-center gap-1">
                              <Fingerprint className="w-3 h-3" />
                              {currentUser.mspId}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                              currentUser.role === 'patient'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-sky-950 text-sky-400 border border-sky-800'
                            }`}>
                              {currentUser.role}
                            </span>
                          </div>
                        </div>

                        {/* Account Actions */}
                        <div className="p-1.5 space-y-0.5 text-xs">
                          <button
                            id="menu-open-profile-btn"
                            onClick={() => {
                              setDropdownOpen(false);
                              onOpenProfile('profile');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                          >
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            <span>Account Details & Profile</span>
                          </button>

                          <button
                            id="menu-change-password-btn"
                            onClick={() => {
                              setDropdownOpen(false);
                              onOpenProfile('security');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                          >
                            <Key className="w-4 h-4 text-slate-400" />
                            <span>Change Password & Security</span>
                          </button>
                        </div>

                        {/* Sign Out Action */}
                        <div className="pt-1.5 border-t border-slate-800 px-1.5 pb-1">
                          <button
                            id="menu-logout-btn"
                            onClick={() => {
                              setDropdownOpen(false);
                              onLogout();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out of MedTrust</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="ml-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Sign In
                </button>
              )}
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onSelectMainView(mainView === 'presentation' ? 'prototype' : 'presentation')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white"
            >
              {mainView === 'presentation' ? 'Prototype' : 'Overview'}
            </button>

            <button 
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg border ${
                mainView === 'presentation'
                  ? 'border-slate-200 text-slate-700 bg-slate-50'
                  : 'border-slate-800 text-slate-200 bg-slate-800'
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t px-4 py-4 space-y-3 ${
          mainView === 'presentation'
            ? 'bg-white border-slate-200 text-slate-700'
            : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          {mainView === 'presentation' ? (
            <div className="flex flex-col space-y-2">
              <a 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100"
              >
                About
              </a>
              <a 
                href="#objectives" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100"
              >
                Objectives
              </a>
              <a 
                href="#methodology" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100"
              >
                Methodology & Architecture
              </a>
              <a 
                href="#comparison" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100"
              >
                Comparison Matrix
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSelectMainView('prototype');
                }}
                className="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-blue-600 text-white flex items-center justify-center gap-2"
              >
                <span>Launch Interactive Prototype</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {prototypeTabs.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Account Details & Logout */}
              {currentUser && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{currentUser.role.toUpperCase()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenProfile('profile');
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold px-2 py-1 bg-blue-500/10 rounded-lg"
                    >
                      Profile
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

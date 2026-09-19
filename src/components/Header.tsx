import React, { useState } from "react";
import { 
  Building2, 
  ShieldCheck, 
  RefreshCw, 
  Bot, 
  Sparkles, 
  Wallet, 
  Globe2,
  CheckCircle2,
  Menu,
  X,
  ArrowRight
} from "lucide-react";
import { BusinessType, Currency } from "../types";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  businessType: BusinessType;
  setBusinessType: (type: BusinessType) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  isSyncing: boolean;
  onSync: () => void;
  onOpenCfoChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  businessType,
  setBusinessType,
  currency,
  setCurrency,
  isSyncing,
  onSync,
  onOpenCfoChat,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navTabs = [
    { id: "dashboard", label: "Executive Dashboard", badge: "KPIs" },
    { id: "banking", label: "Modul 1: Banking & Open Finance", badge: "24/7 Sync" },
    { id: "accounting", label: "Modul 2: Accounting & Smart Ledger", badge: "Double-Entry" },
    { id: "tax", label: "Modul 3: Autonomous Tax Copilot", badge: "DJP RAG" },
    { id: "cfo", label: "Modul 4: Conversational AI CFO", badge: "Advisory" },
    { id: "showcase", label: "Public Landing & SEO Showcase", badge: "SSG/SSR" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div 
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-lg tracking-tight shrink-0">
            <ShieldCheck className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-mono">
                FinTax<span className="text-emerald-400">.AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase tracking-wider">
                Enterprise v2.4
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-slate-800/80 text-slate-300 rounded-full border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                DJP Tax RAG Live
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-400 truncate max-w-xs md:max-w-sm lg:max-w-md">
              The Autonomous CFO & Tax Copilot for Modern Freelancers and SMEs
            </p>
          </div>
        </div>

        {/* Desktop Global Controls & Status */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* Business Entity Profile Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value as BusinessType)}
              className="bg-transparent text-slate-200 font-medium py-1 px-1.5 focus:outline-none cursor-pointer"
              title="Pilih Entitas Usaha"
            >
              <option value="FREELANCER_INDIVIDUAL" className="bg-slate-900 text-slate-200">
                Freelancer Pro (PPh Final / OP)
              </option>
              <option value="CREATIVE_AGENCY_PT" className="bg-slate-900 text-slate-200">
                Creative Agency (PT / PKP)
              </option>
              <option value="UMKM_GROWING" className="bg-slate-900 text-slate-200">
                UMKM Berkembang (CV / EMKM)
              </option>
            </select>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <Globe2 className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-transparent text-slate-200 font-medium py-1 px-1.5 focus:outline-none cursor-pointer font-mono"
              title="Pilih Mata Uang Tampilan"
            >
              <option value="IDR" className="bg-slate-900 text-slate-200">IDR (Rp)</option>
              <option value="USD" className="bg-slate-900 text-slate-200">USD ($)</option>
              <option value="EUR" className="bg-slate-900 text-slate-200">EUR (€)</option>
              <option value="SGD" className="bg-slate-900 text-slate-200">SGD (S$)</option>
            </select>
          </div>

          {/* Bank Sync Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            title="Tarik mutasi rekening bank 24/7 via Open Finance"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Sinkronisasi..." : "Sync Bank"}</span>
          </button>

          {/* AI CFO Quick Action */}
          <button
            onClick={onOpenCfoChat || (() => setActiveTab("cfo"))}
            className="min-h-[38px] flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI CFO Chat</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </button>
        </div>

        {/* Mobile Actions: Fast Sync & Hamburger Drawer Toggle (Pillar 1 Ergonomics) */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={onSync}
            disabled={isSyncing}
            aria-label="Sinkronisasi Bank"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Suite Module Navigation - 100% VISIBLE ON ALL SCREENS, NO HORIZONTAL SCROLL */}
      <nav 
        aria-label="Module Navigation"
        className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-800/70"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2 w-full">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full min-h-[46px] p-2 rounded-xl text-left flex flex-col justify-between transition-all cursor-pointer border ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                    : "bg-slate-900/70 text-slate-300 border-slate-800/80 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-start justify-between gap-1 w-full">
                  <span className="text-xs font-bold leading-tight line-clamp-2">
                    {tab.label}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 tracking-tight ${
                      isActive
                        ? "bg-emerald-500/25 text-emerald-200 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700/60"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Slide-Over Hamburger Drawer (Pillar 1) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-slate-800/80 space-y-4 animate-in slide-in-from-top-3 duration-200">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Entitas Bisnis & Mata Uang
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-2">
                <Building2 className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <select
                  value={businessType}
                  onChange={(e) => {
                    setBusinessType(e.target.value as BusinessType);
                  }}
                  className="w-full bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="FREELANCER_INDIVIDUAL" className="bg-slate-900">Freelancer Pro (OP / PP 55)</option>
                  <option value="CREATIVE_AGENCY_PT" className="bg-slate-900">Creative Agency (PT / PKP)</option>
                  <option value="UMKM_GROWING" className="bg-slate-900">UMKM Berkembang (CV / SAK EMKM)</option>
                </select>
              </div>

              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-2">
                <Globe2 className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <select
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value as Currency);
                  }}
                  className="w-full bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer font-mono"
                >
                  <option value="IDR" className="bg-slate-900">IDR (Rupiah)</option>
                  <option value="USD" className="bg-slate-900">USD ($)</option>
                  <option value="EUR" className="bg-slate-900">EUR (€)</option>
                  <option value="SGD" className="bg-slate-900">SGD (S$)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Navigasi Modul FinTax AI
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all ${
                    activeTab === tab.id
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-900 bg-slate-950/60 border border-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{tab.label}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {tab.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


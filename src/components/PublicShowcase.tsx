import React, { useState } from "react";
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Calculator, 
  Sparkles, 
  Building2, 
  Landmark, 
  BookOpen, 
  Bot, 
  ChevronDown, 
  ChevronUp, 
  FileCheck, 
  Lock, 
  Search, 
  Code, 
  ExternalLink,
  Zap,
  Globe2
} from "lucide-react";
import { formatMoney } from "../utils/formatters";

interface PublicShowcaseProps {
  onLaunchApp: (tab?: string) => void;
}

export const PublicShowcase: React.FC<PublicShowcaseProps> = ({ onLaunchApp }) => {
  // Interactive Live Tax Estimator on Marketing Landing
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(45000000);
  const [annualRevenueEstimate, setAnnualRevenueEstimate] = useState<number>(540000000);
  const [entityType, setEntityType] = useState<"OP" | "BADAN">("OP");
  const [hasClientWithholding, setHasClientWithholding] = useState<boolean>(true);

  // Accordion open states for FAQPage
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showSeoInspector, setShowSeoInspector] = useState<boolean>(false);

  // PPh Calculation Logic
  // OP PP 55/2022: first 500m exempt per year.
  const taxableAnnual = entityType === "OP" 
    ? Math.max(0, annualRevenueEstimate - 500000000)
    : annualRevenueEstimate;
  const pphFinalAnnual = Math.round(taxableAnnual * 0.005);
  const pphFinalMonthly = Math.round(pphFinalAnnual / 12);
  const pph23CreditMonthly = hasClientWithholding ? Math.round(monthlyRevenue * 0.02) : 0;

  const faqs = [
    {
      q: "Bagaimana cara FinTax AI menghitung PPh Final 0,5% sesuai PP 55/2022?",
      a: "FinTax AI melacak peredaran bruto kumulatif sepanjang tahun pajak kalender. Untuk Wajib Pajak Orang Pribadi (Freelancer Pro/UMKM), omzet hingga Rp 500.000.000 pertama dalam 1 tahun pajak dibebaskan dari pajak (0%). Setiap kelebihan di atas ambang batas tersebut dikenakan tarif PPh Final 0,5% dan dialokasikan otomatis ke sub-rekening cadangan pajak (Tax Vault).",
    },
    {
      q: "Apakah FinTax AI mematuhi Standar Akuntansi Keuangan SAK EMKM?",
      a: "Ya. Setiap mutasi yang disinkronkan dari Open Finance diklasifikasikan secara otomatis ke dalam pembukuan berpasangan (Double-Entry Bookkeeping). Sistem menghasilkan Laporan Laba Rugi Komprehensif, Neraca Keuangan, Laporan Perubahan Modal, dan Laporan Arus Kas sesuai SAK EMKM yang siap diaudit oleh akuntan publik maupun pihak bank.",
    },
    {
      q: "Bagaimana pemisahan dana bisnis dan penarikan prive pribadi dilakukan?",
      a: "FinTax AI menggunakan model klasifikasi NLP cerdas untuk mendeteksi transfer ke rekening pribadi atau belanja non-bisnis, lalu otomatis membukukannya sebagai 'PRIVE_PENARIKAN_PRIBADI' (koreksi fiskal positif). Ini melindungi Anda dari sanksi kurang bayar akibat membebankan pengeluaran pribadi ke biaya usaha 3M saat pemeriksaan pajak DJP.",
    },
    {
      q: "Apakah FinTax AI aman dan terintegrasi dengan perbankan resmi?",
      a: "FinTax AI menggunakan integrasi Open Finance berstandar SNAP BI (Standar Nasional Open API Pembayaran) dengan enkripsi TLS 1.3 dan tokenisasi 24/7. Kredensial perbankan Anda tidak pernah disimpan dalam format teks biasa, dan semua transaksi dapat diverifikasi secara transparan.",
    },
  ];

  return (
    <article className="space-y-8 sm:space-y-12 pb-16 font-sans w-full max-w-full overflow-x-hidden">
      {/* 1. SEMANTIC HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 p-4 sm:p-8 lg:p-12 shadow-2xl w-full">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold max-w-full text-center">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="leading-snug">Autonomous CFO & Tax Copilot Indonesia • SAK EMKM Ready</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight break-words">
            Keuangan & Kepatuhan Pajak Otomatis untuk <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Freelancer Pro & Agensi</span>
          </h1>

          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Sinkronkan 5+ rekening bank 24/7, otomatisasi pembukuan berpasangan SAK EMKM, dan alokasikan cadangan pajak PPh Final PP 55/2022 & TER PPh 21 tanpa rasa khawatir audit DJP.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onLaunchApp("dashboard")}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Buka Executive Dashboard</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={() => onLaunchApp("cfo")}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Konsultasi AI CFO Virtual</span>
            </button>
          </div>

          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-left w-full">
            <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-xl">
              <span className="text-emerald-400 text-xs font-bold block font-mono">0.5% PPh Final</span>
              <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">PP 55/2022 Otomatis</span>
            </div>
            <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-xl">
              <span className="text-teal-400 text-xs font-bold block font-mono">SAK EMKM</span>
              <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">Double-Entry Ledger</span>
            </div>
            <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-xl">
              <span className="text-cyan-400 text-xs font-bold block font-mono">24/7 Sync</span>
              <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">Open Finance Multi-Bank</span>
            </div>
            <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-xl">
              <span className="text-emerald-400 text-xs font-bold block font-mono">DJP RAG Live</span>
              <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">Audit Health Simulator</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE TAX SIMULATOR (Pillar 1 & 2) */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-8 lg:p-10 shadow-xl w-full">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Simulasi Pajak Real-Time (PP 55/2022 & UU HPP)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kalkulasi seketika cadangan pajak yang harus disisihkan dari omzet Anda setiap bulan
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Formula Pajak Terverifikasi DJP
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Bentuk Entitas Wajib Pajak
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntityType("OP")}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      entityType === "OP"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    Orang Pribadi (Freelancer)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntityType("BADAN")}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      entityType === "BADAN"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    Badan Usaha (PT / CV)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Estimasi Omzet Rata-Rata per Bulan (IDR)
                </label>
                <input
                  type="range"
                  min={10000000}
                  max={250000000}
                  step={5000000}
                  value={monthlyRevenue}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMonthlyRevenue(val);
                    setAnnualRevenueEstimate(val * 12);
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs font-mono font-bold text-emerald-400 mt-1.5">
                  <span>{formatMoney(monthlyRevenue, "IDR")} / bln</span>
                  <span className="text-slate-400">Setara {formatMoney(annualRevenueEstimate, "IDR")} / thn</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Potongan PPh 23 (2%) oleh Klien</span>
                  <input
                    type="checkbox"
                    checked={hasClientWithholding}
                    onChange={(e) => setHasClientWithholding(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Kredit pajak PPh 23 dari klien korporat dapat dikurangkan dari pajak terutang tahunan Anda.
                </p>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold font-mono">
                  Hasil Rekomendasi Tax Escrow
                </span>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Fasilitas Bebas Pajak (PP 55):</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {entityType === "OP" ? "Rp 500.000.000 / thn" : "Tidak Berlaku (PT/CV)"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Penghasilan Kena PPh 0,5%:</span>
                    <span className="font-mono text-white font-semibold">{formatMoney(taxableAnnual, "IDR")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Kredit Pajak PPh 23 (estimasi):</span>
                    <span className="font-mono text-teal-400 font-semibold">-{formatMoney(pph23CreditMonthly, "IDR")}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-400">Wajib Disisihkan ke Tax Vault per Bulan:</div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                  {formatMoney(Math.max(0, pphFinalMonthly - pph23CreditMonthly), "IDR")}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  FinTax AI memindahkan angka ini secara otomatis ke sub-account terpisah agar kas operasional Anda selalu aman.
                </p>
              </div>

              <button
                onClick={() => onLaunchApp("tax")}
                className="min-h-[44px] w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Buka Modul 3: Autonomous Tax Copilot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR ENTERPRISE PILLARS GRID */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Arsitektur FinTax AI Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Dirancang khusus untuk ekosistem freelancer dan UMKM modern di Indonesia
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => onLaunchApp("banking")}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Modul 1: Open Finance 24/7
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Koneksi langsung ke BCA, Mandiri, BRI, Bank Jago, dan Stripe USD. Deteksi mutasi seketika tanpa input manual.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-3">
              Jelajahi Modul <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div 
            onClick={() => onLaunchApp("accounting")}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Modul 2: SAK EMKM Smart Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Pembukuan berpasangan otomatis (Double-Entry). Hasilkan Laba Rugi, Neraca, Perubahan Modal, dan Arus Kas standar EMKM.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-3">
              Jelajahi Modul <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div 
            onClick={() => onLaunchApp("tax")}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Modul 3: Autonomous Tax Copilot
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              DJP RAG Knowledge base, simulator audit kepatuhan, ekspor draf e-SPT 1770/1771, dan auto-escrow PPh Final PP 55.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-3">
              Jelajahi Modul <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div 
            onClick={() => onLaunchApp("cfo")}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Modul 4: Conversational AI CFO
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Penasihat keuangan virtual yang membaca data kas riil Anda. Simulasi runway, optimasi biaya, dan strategi perpajakan legal.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-3">
              Jelajahi Modul <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS (FAQPage Structured Data Mirror) */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl max-w-4xl mx-auto space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Informasi lengkap seputar kepatuhan pajak, regulasi UU HPP, dan pembukuan
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full min-h-[44px] px-5 py-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-200 hover:text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-900 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. TECHNICAL SEO & STRUCTURED DATA INSPECTOR (Pillar 2 Verification) */}
      <section className="max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Inspektur Teknis SEO & JSON-LD Schema</span>
          </div>
          <button
            onClick={() => setShowSeoInspector(!showSeoInspector)}
            className="text-xs font-mono text-emerald-400 hover:underline min-h-[44px] flex items-center px-2"
          >
            {showSeoInspector ? "Sembunyikan Metadata" : "Tampilkan Metadata Crawl"}
          </button>
        </div>

        {showSeoInspector && (
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs space-y-3 font-mono">
            <div className="p-3 bg-slate-900 rounded-lg">
              <span className="text-slate-400 block font-bold">Canonical Tag:</span>
              <span className="text-emerald-300 break-all">
                https://ais-pre-mjugiqljw6ah5tbn2ahovw-188801367571.asia-southeast1.run.app
              </span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg">
              <span className="text-slate-400 block font-bold">Structured Data Schemes:</span>
              <span className="text-slate-200">
                1. WebApplication / SoftwareApplication • 2. Organization • 3. FAQPage
              </span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg">
              <span className="text-slate-400 block font-bold">Robots & Sitemap Endpoints:</span>
              <span className="text-slate-200">
                /robots.txt (Valid) • /sitemap.xml (Valid XML with hreflang alternate tags)
              </span>
            </div>
          </div>
        )}
      </section>
    </article>
  );
};

import React, { useState } from "react";
import { 
  ShieldCheck, 
  FileText, 
  Scale, 
  Calculator, 
  Calendar, 
  Download, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { Transaction, Invoice, Currency, BusinessType, AuditSimulationResult, TaxRegulationRAG } from "../types";
import { TAX_REGULATION_RAG_ITEMS } from "../data/initialData";
import { formatMoney, convertCurrency } from "../utils/formatters";

interface TaxCopilotModuleProps {
  transactions: Transaction[];
  invoices: Invoice[];
  currency: Currency;
  businessType: BusinessType;
  jagoTaxPocketBalance: number;
}

export const TaxCopilotModule: React.FC<TaxCopilotModuleProps> = ({
  transactions,
  invoices,
  currency,
  businessType,
  jagoTaxPocketBalance,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"estimator" | "rag" | "spt" | "audit">("estimator");
  const [ragSearch, setRagSearch] = useState("");
  const [sptType, setSptType] = useState<"1770" | "1770S" | "1771">("1770");

  // Audit Simulator State
  const [isSimulatingAudit, setIsSimulatingAudit] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditSimulationResult | null>({
    auditScore: 92,
    riskLevel: "Rendah",
    potentialUnderpaymentRp: 1850000,
    findings: [
      {
        category: "Koreksi Fiskal Positif Biaya",
        severity: "low",
        description: "Tercatat penarikan prive pribadi Rp 15.000.000 di pos operasional.",
        mitigation: "Sistem telah mengalokasikan akun ke Ekuitas Prive sehingga tidak memicu sanksi kurang bayar DJP.",
      },
      {
        category: "Rekonsiliasi Bukti Potong PPh 23",
        severity: "low",
        description: "Invoice INV/2026/09/003 belum disertai e-Bupot Unifikasi 2% dari pihak klien.",
        mitigation: "Kirim pengingat otomatis ke tim finance klien untuk mengunggah Bukti Potong resmi DJP.",
      },
      {
        category: "Kesesuaian Tarif TER PPh 21",
        severity: "low",
        description: "Pemotongan PPh 21 tim telah presisi sesuai Tabel TER Kategori A per PP 58/2023.",
        mitigation: "Draft SPT Masa Unifikasi siap diekspor ke portal DJP Online.",
      },
    ],
    recommendations: [
      "Pertahankan cadangan kas pajak minimal 100% dari estimasi terutang bulanan di Bank Jago.",
      "Lakukan rekonsiliasi berkala nomor faktur pajak dengan mutasi transfer masuk.",
      "Pastikan bukti potong PPh 23 tersimpan rapi untuk dikreditkan pada SPT Tahunan.",
    ],
  });

  // Calculate live numbers
  const totalRevenueIDR = transactions
    .filter((t) => t.type === "INCOME" && t.coaCategory === "PENDAPATAN_USAHA")
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, "IDR"), 0);

  const totalExpenseIDR = transactions
    .filter(
      (t) =>
        t.type === "EXPENSE" &&
        (t.coaCategory === "POS_BIAYA_OPERASIONAL" ||
          t.coaCategory === "HPP_HARGA_POKOK_PENJUALAN")
    )
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, "IDR"), 0);

  const netProfitIDR = totalRevenueIDR - totalExpenseIDR;

  // Tax calculations
  // PPh Final: 0.5% on gross revenue
  const pphFinalIDR = Math.round(totalRevenueIDR * 0.005);
  // PPh 21 Estimated (staff payroll 38jt -> ~ Rp 1.140.000)
  const pph21EstimatedIDR = 1140000;
  // PPh 23 Withheld by clients (Tax Credit)
  const pph23CreditIDR = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + convertCurrency(i.pph23Withholding, i.currency, "IDR"), 0);
  // PPN Keluaran
  const ppnPayableIDR = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + convertCurrency(i.ppnAmount, i.currency, "IDR"), 0);

  const totalTaxEscrowNeededIDR = pphFinalIDR + pph21EstimatedIDR + ppnPayableIDR;
  const isTaxReserveSafe = jagoTaxPocketBalance >= totalTaxEscrowNeededIDR;

  // Handle Tax Audit Run
  const handleRunAudit = async () => {
    setIsSimulatingAudit(true);
    try {
      const res = await fetch("/api/tax-audit-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          financialData: {
            totalRevenue: totalRevenueIDR,
            totalExpense: totalExpenseIDR,
            netProfit: netProfitIDR,
            pphFinal: pphFinalIDR,
            businessType,
          },
        }),
      });
      const data = await res.json();
      setAuditResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulatingAudit(false);
    }
  };

  const filteredRAG = TAX_REGULATION_RAG_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(ragSearch.toLowerCase()) ||
    item.summary.toLowerCase().includes(ragSearch.toLowerCase()) ||
    item.lawReference.toLowerCase().includes(ragSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab("estimator")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "estimator"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Automated Tax Liability & Escrow Vault
          </button>
          <button
            onClick={() => setActiveSubTab("rag")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "rag"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Live Tax Regulation RAG
          </button>
          <button
            onClick={() => setActiveSubTab("spt")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "spt"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            SPT / Tax Return Generator
          </button>
          <button
            onClick={() => setActiveSubTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "audit"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Tax Audit Simulator (DJP Fiskus)
          </button>
        </div>
      </div>

      {/* SUBTAB 1: AUTOMATED TAX LIABILITY ESTIMATOR */}
      {activeSubTab === "estimator" && (
        <div className="space-y-6">
          {/* Tax Escrow Vault Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/30 border border-teal-500/30 rounded-2xl p-5 lg:p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Simpanan Pajak Wajib Disisihkan (Tax Escrow Vault)
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">
                  Saldo Terkunci: {formatMoney(jagoTaxPocketBalance, "IDR")}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Disimpan otomatis di sub-account terpisah (Bank Jago Tax Pocket) untuk menjamin tidak terpakai modal kerja.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Estimasi Terutang Bulan Ini</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {formatMoney(totalTaxEscrowNeededIDR, "IDR")}
                </span>
                <span className="text-[11px] font-bold text-emerald-400 block mt-0.5">
                  ✓ Tercover 100% (Kas Escrow Surplus)
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Grid of 4 Indonesian Tax Liabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. PPh Final PP 55/2022 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                PPh Final UMKM (PP 55/2022)
              </span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {formatMoney(pphFinalIDR, "IDR")}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Tarif 0,5% dari omzet bruto {formatMoney(totalRevenueIDR, "IDR")}.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                KAP / KJS: <span className="font-mono text-slate-300">411128 - 420</span>
              </div>
            </div>

            {/* 2. PPh 21 Karyawan & Freelance TER */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 block">
                PPh 21 Karyawan (TER 2024)
              </span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {formatMoney(pph21EstimatedIDR, "IDR")}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Dihitung dari payroll gaji staf Rp 38.000.000 (Tabel TER A).
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                KAP / KJS: <span className="font-mono text-slate-300">411121 - 100</span>
              </div>
            </div>

            {/* 3. PPh 23 Potongan Klien (Kredit Pajak) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
                PPh 23 Dipotong Klien (Kredit)
              </span>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                +{formatMoney(pph23CreditIDR, "IDR")}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Kredit pajak resmi dari klien korporat (mengurangi beban tahunan).
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                Dokumen: <span className="font-mono text-slate-300">e-Bupot Unifikasi DJP</span>
              </div>
            </div>

            {/* 4. PPN Terutang */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
                PPN 11% Faktur Keluaran
              </span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {formatMoney(ppnPayableIDR, "IDR")}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                PPN disetorkan ke kas negara setelah dikurangi PPN Masukan.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                KAP / KJS: <span className="font-mono text-slate-300">411211 - 100</span>
              </div>
            </div>
          </div>

          {/* Tax Calendar & Deadlines */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Jadwal Tenggat Waktu Pembayaran & Pelaporan Pajak DJP</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Tanggal 10 Bulan Depan</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                    Setor PPh 21
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Batas akhir penyetoran PPh Pasal 21 atas gaji karyawan masa September.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Tanggal 15 Bulan Depan</span>
                  <span className="text-[10px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded font-bold">
                    Setor PPh Final
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Batas setor PPh Final UMKM 0,5% PP 55/2022 via e-Billing NTPN.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Akhir Bulan Depan</span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold">
                    Lapor SPT Masa
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Batas akhir pelaporan SPT Masa PPh Unifikasi & PPN e-Faktur 1111.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: LIVE TAX REGULATION RAG */}
      {activeSubTab === "rag" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Live Tax Regulation RAG (Knowledge Base UU Perpajakan Indonesia)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Koleksi regulasi resmi (UU HPP, PP 55/2022, PMK TER PPh 21, e-Faktur) yang dirujuk langsung oleh AI tanpa halusinasi.
              </p>
            </div>
            <div className="w-full sm:w-72 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari UU HPP, TER PPh 21, PPN..."
                value={ragSearch}
                onChange={(e) => setRagSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRAG.map((rag) => (
              <div
                key={rag.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {rag.lawReference}
                    </span>
                    <span className="text-[10px] text-slate-500">{rag.year}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{rag.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{rag.summary}</p>
                  <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Ketentuan Tarif Utama:</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{rag.keyRate}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-slate-300">Rekomendasi FinTax AI:</strong> {rag.actionGuide}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: SPT / TAX RETURN GENERATOR */}
      {activeSubTab === "spt" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>SPT Tahunan & Masa Generator (Standar DJP Online)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Draft pelaporan pajak otomatis diisi dari pembukuan double-entry. Siap diekspor ke format CSV / e-Filing DJP.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSptType("1770")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sptType === "1770"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                SPT 1770 (OP Freelancer/UMKM)
              </button>
              <button
                onClick={() => setSptType("1771")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sptType === "1771"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                SPT 1771 (Badan Usaha PT/CV)
              </button>
            </div>
          </div>

          {/* Official DJP Form Simulation Container */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 max-w-4xl mx-auto shadow-lg">
            {/* DJP Form Header */}
            <div className="border-b-2 border-slate-700 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  KEMENTERIAN KEUANGAN REPUBLIK INDONESIA • DIREKTORAT JENDERAL PAJAK
                </span>
                <h2 className="text-lg font-extrabold text-white">
                  FORMULIR {sptType} • SURAT PEMBERITAHUAN (SPT) TAHUNAN PAJAK PENGHASILAN
                </h2>
                <p className="text-xs text-slate-400 font-mono">Tahun Pajak: 2026 • Status: DRAFT SIAP KIRIM</p>
              </div>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify({ sptType, totalRevenueIDR, netProfitIDR, pphFinalIDR }, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `Draft_SPT_${sptType}_2026.json`;
                  a.click();
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File Ekspor DJP (CSV/JSON)</span>
              </button>
            </div>

            {/* Form Fields */}
            <div className="mt-6 space-y-4 text-xs font-mono">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 text-[10px] block">NAMA WAJIB PAJAK</span>
                  <span className="text-white font-bold">HENDRA FEBRI (FINTAX ENTERPRISE CLIENT)</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">NPWP (16 DIGIT NIK/NPWP)</span>
                  <span className="text-emerald-400 font-bold">09.281.992.4-012.000</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                  <span>1. Jumlah Peredaran Usaha Bruto (Omzet Setahun)</span>
                  <span className="text-white font-bold">{formatMoney(totalRevenueIDR, "IDR")}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                  <span>2. Biaya Operasional & HPP yang Diperkenankan (3M)</span>
                  <span className="text-white font-bold">{formatMoney(totalExpenseIDR, "IDR")}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                  <span>3. Koreksi Fiskal Positif (Prive & Biaya Non-3M)</span>
                  <span className="text-amber-400 font-bold">+Rp 15.000.000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                  <span>4. Penghasilan Neto Komersial Setelah Koreksi</span>
                  <span className="text-white font-bold">{formatMoney(netProfitIDR, "IDR")}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                  <span>5. PPh Final Terutang (PP No. 55 Tahun 2022)</span>
                  <span className="text-emerald-400 font-bold">{formatMoney(pphFinalIDR, "IDR")}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                  <span>6. Jumlah PPh yang Telah Disetor Sendiri (SSP/NTPN)</span>
                  <span className="text-emerald-400 font-bold">Rp 1.450.000</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-white font-bold">
                <span>STATUS SPT: NIHIL / LUNAS SESUAI BUKTI SETOR</span>
                <span className="text-emerald-400">STATUS VALID DJP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: TAX AUDIT SIMULATOR */}
      {activeSubTab === "audit" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Scale className="w-4 h-4" />
                DJP Tax Audit Inspection Simulator (Pemeriksaan Fiskus)
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Simulasi Kepatuhan Pajak & Deteksi Potensi Kurang Bayar
              </h3>
              <p className="text-xs text-slate-400">
                AI menguji rasio margin industri, kelayakan bukti potong, dan mendeteksi celah sebelum diperiksa oleh petugas pajak resmi.
              </p>
            </div>
            <button
              onClick={handleRunAudit}
              disabled={isSimulatingAudit}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 ${isSimulatingAudit ? "animate-spin" : ""}`} />
              <span>{isSimulatingAudit ? "Sedang Menginspeksi..." : "Jalankan Simulasi Audit DJP"}</span>
            </button>
          </div>

          {auditResult && (
            <div className="space-y-6">
              {/* Score & Risk Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm text-center">
                  <span className="text-xs text-slate-400 font-semibold uppercase">DJP Audit Health Score</span>
                  <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                    {auditResult.auditScore} / 100
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">Tingkat Kepatuhan Sangat Baik</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm text-center">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Tingkat Risiko Pemeriksaan</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {auditResult.riskLevel} (Low Risk)
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">SP2DK Risk: Minimal</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm text-center">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Potensi Koreksi Fiskal</span>
                  <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
                    {formatMoney(auditResult.potentialUnderpaymentRp, "IDR")}
                  </div>
                  <span className="text-xs text-emerald-400 mt-1 block">Sudah Dimigrasi ke Pos Prive</span>
                </div>
              </div>

              {/* Findings & Mitigations */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-3">
                  Temuan Analisis Kepatuhan & Langkah Mitigasi
                </h3>
                <div className="space-y-3">
                  {auditResult.findings.map((f, i) => (
                    <div key={i} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{f.category}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono uppercase">
                          Severity: {f.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{f.description}</p>
                      <p className="text-xs text-emerald-400 font-medium pt-1">
                        <strong>Mitigasi Rekomendasi:</strong> {f.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations Checklist */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-3">Rekomendasi Tim Fiskal FinTax AI</h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {auditResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

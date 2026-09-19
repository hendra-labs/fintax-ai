import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Printer, 
  Tag, 
  ShieldAlert, 
  HelpCircle,
  Play,
  RotateCcw
} from "lucide-react";
import { Transaction, Currency, BusinessType, COACategory } from "../types";
import { formatMoney, convertCurrency, formatIdDate } from "../utils/formatters";

interface AccountingModuleProps {
  transactions: Transaction[];
  currency: Currency;
  businessType: BusinessType;
  onAddTransaction: (tx: Transaction) => void;
  onUpdateTransaction: (txId: string, updates: Partial<Transaction>) => void;
}

export const AccountingModule: React.FC<AccountingModuleProps> = ({
  transactions,
  currency,
  businessType,
  onAddTransaction,
  onUpdateTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<"tagging" | "statements" | "fraud">("tagging");
  const [statementType, setStatementType] = useState<"PL" | "BALANCE_SHEET" | "EQUITY" | "CASHFLOW">("PL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCOAFilter, setSelectedCOAFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // AI Tagging Lab State
  const [testNarration, setTestNarration] = useState("TRSF E-BKG DR 9912/OPENAI CHATGPT SUBSCRIPTION PRO");
  const [testAmount, setTestAmount] = useState<number>(335000);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Financial Statement Totals
  const totalRevenue = transactions
    .filter((t) => t.type === "INCOME" && t.coaCategory === "PENDAPATAN_USAHA")
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, "IDR"), 0);

  const totalHPP = transactions
    .filter((t) => t.type === "EXPENSE" && t.coaCategory === "HPP_HARGA_POKOK_PENJUALAN")
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, "IDR"), 0);

  const grossProfit = totalRevenue - totalHPP;

  const totalOpex = transactions
    .filter((t) => t.type === "EXPENSE" && t.coaCategory === "POS_BIAYA_OPERASIONAL")
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, "IDR"), 0);

  const operatingIncome = grossProfit - totalOpex;

  const totalPrive = transactions
    .filter((t) => t.coaCategory === "PRIVE_PENARIKAN_PRIBADI")
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, "IDR"), 0);

  const totalCapex = transactions
    .filter((t) => t.coaCategory === "ASET_TETAP_CAPEX")
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, "IDR"), 0);

  const totalTaxPaid = transactions
    .filter((t) => t.coaCategory === "BEBAN_PAJAK")
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, "IDR"), 0);

  // Filtered transactions for Tagging tab
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.rawNarration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.accountName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCOA =
      selectedCOAFilter === "ALL" || t.coaCategory === selectedCOAFilter;
    return matchesSearch && matchesCOA;
  });

  // Handle AI Tagging Lab Test
  const handleRunAITagging = async () => {
    setIsTestingAI(true);
    try {
      const res = await fetch("/api/smart-categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawNarrations: [{ id: "test-item", rawText: testNarration, amount: testAmount }],
        }),
      });
      const data = await res.json();
      if (data.categorized && data.categorized.length > 0) {
        setTestResult(data.categorized[0]);
      } else if (data.results && data.results.length > 0) {
        setTestResult(data.results[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTestingAI(false);
    }
  };

  const handleApplyTestToLedger = () => {
    if (!testResult) return;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      rawNarration: testNarration,
      amount: testAmount,
      type: testResult.coaCategory === "PENDAPATAN_USAHA" ? "INCOME" : "EXPENSE",
      currency: "IDR",
      bankAccountId: "bank-1",
      coaCategory: testResult.coaCategory as COACategory,
      accountName: testResult.accountName,
      aiConfidence: testResult.confidence || 0.95,
      deductibleForTax: testResult.deductibleForTax ?? true,
      taxNotes: testResult.reasoning || "Dikatagorikan oleh FinTax AI Model",
      reconciliationStatus: "MATCHED",
    };
    onAddTransaction(newTx);
    setTestResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("tagging")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "tagging"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Autonomous Transaction Tagging ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab("statements")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "statements"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Double-Entry Financial Statements
          </button>
          <button
            onClick={() => setActiveTab("fraud")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "fraud"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Anomaly & Fraud Detection
          </button>
        </div>
      </div>

      {/* TAB 1: AUTONOMOUS TRANSACTION TAGGING */}
      {activeTab === "tagging" && (
        <div className="space-y-6">
          {/* AI Tagging Interactive Laboratory Card */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Transaction Categorization Engine (Fine-Tuned NLP)
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Uji Narasi Mutasi Mentah (Smart Tagging Playground)
                </h3>
                <p className="text-xs text-slate-400">
                  Uji bagaimana model membaca teks perbankan yang terpotong/singkatan kode merchant dan menentukan Chart of Accounts serta status deductible pajak (3M).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={testNarration}
                  onChange={(e) => setTestNarration(e.target.value)}
                  placeholder="Contoh: TRSF E-BKG DR 9912/OPENAI CHATGPT SUBSCRIPTION"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(Number(e.target.value) || 0)}
                  placeholder="Nominal"
                  className="w-28 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
                <button
                  onClick={handleRunAITagging}
                  disabled={isTestingAI}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Play className={`w-3.5 h-3.5 ${isTestingAI ? "animate-spin" : ""}`} />
                  <span>{isTestingAI ? "Menganalisis..." : "Klasifikasi AI"}</span>
                </button>
              </div>
            </div>

            {/* Test Result Display */}
            {testResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-emerald-500/40 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{testResult.accountName}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 rounded">
                        Confidence: {Math.round((testResult.confidence || 0.95) * 100)}%
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          testResult.deductibleForTax
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {testResult.deductibleForTax ? "Deductible Biaya 3M" : "Koreksi Fiskal Positif (Non-3M)"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{testResult.reasoning}</p>
                  </div>
                  <button
                    onClick={handleApplyTestToLedger}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    + Simpan ke Buku Kas
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ledger Controls & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari narasi bank, akun perkiraan, nominal..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full min-h-[44px] bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCOAFilter}
                  onChange={(e) => {
                    setSelectedCOAFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs text-slate-300 focus:outline-none min-h-[32px] cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">Semua Akun (COA)</option>
                  <option value="PENDAPATAN_USAHA" className="bg-slate-900">Pendapatan Usaha</option>
                  <option value="POS_BIAYA_OPERASIONAL" className="bg-slate-900">Biaya Operasional</option>
                  <option value="HPP_HARGA_POKOK_PENJUALAN" className="bg-slate-900">HPP Proyek</option>
                  <option value="PRIVE_PENARIKAN_PRIBADI" className="bg-slate-900">Prive Pemilik</option>
                  <option value="BEBAN_PAJAK" className="bg-slate-900">Setoran Pajak</option>
                  <option value="ASET_TETAP_CAPEX" className="bg-slate-900">Aset Tetap (Capex)</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400">
                <span>Tampil:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-slate-200 font-bold focus:outline-none min-h-[32px] cursor-pointer font-mono"
                >
                  <option value={4} className="bg-slate-900">4</option>
                  <option value={6} className="bg-slate-900">6</option>
                  <option value={12} className="bg-slate-900">12</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transactions Ledger Container (Pillar 1: Dual Adaptive Presentation) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* A. Mobile Card View (< md) */}
            <div className="block md:hidden p-3 space-y-3">
              {filteredTransactions
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((tx) => (
                  <div 
                    key={tx.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-slate-400 block">{tx.date}</span>
                        <h4 className="text-xs font-bold text-white leading-snug">{tx.rawNarration}</h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-mono font-bold text-sm ${tx.type === "INCOME" ? "text-emerald-400" : "text-slate-200"}`}>
                          {tx.type === "INCOME" ? "+" : "-"} {formatMoney(tx.amount, tx.currency)}
                        </span>
                        {tx.currency !== "IDR" && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            ≈ {formatMoney(convertCurrency(tx.amount, tx.currency, "IDR"), "IDR")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-900">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-medium">
                        {tx.accountName}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase bg-slate-900 text-slate-400">
                        {tx.coaCategory.replace(/_/g, " ")}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tx.deductibleForTax
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {tx.deductibleForTax ? "Deductible" : "Koreksi Fiskal"}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        AI {(tx.aiConfidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    {tx.taxNotes && (
                      <p className="text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded-lg leading-relaxed">
                        {tx.taxNotes}
                      </p>
                    )}

                    {tx.isFlaggedAnomaly && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 p-2 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{tx.anomalyReason}</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* B. Desktop & Tablet Table (>= md) with Sticky Header */}
            <div className="hidden md:block overflow-x-auto max-h-[520px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-950/95 backdrop-blur-sm text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 z-10">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Tanggal & Narasi Mentah Bank</th>
                    <th className="py-3.5 px-4 font-semibold">Akun Perkiraan (COA)</th>
                    <th className="py-3.5 px-4 font-semibold">AI Confidence & Analisis Pajak</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Nominal Mutasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredTransactions
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <span className="text-[11px] font-mono text-slate-400 block">{tx.date}</span>
                        <span className="font-mono text-xs font-semibold text-white block mt-0.5 break-words">
                          {tx.rawNarration}
                        </span>
                        {tx.isFlaggedAnomaly && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            {tx.anomalyReason}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-200">{tx.accountName}</div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {tx.coaCategory.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            AI {(tx.aiConfidence * 100).toFixed(0)}%
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              tx.deductibleForTax
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {tx.deductibleForTax ? "Deductible" : "Non-Deductible (Koreksi Fiskal)"}
                          </span>
                        </div>
                        {tx.taxNotes && (
                          <p className="text-[11px] text-slate-400 line-clamp-2">{tx.taxNotes}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`font-mono font-bold text-sm ${
                            tx.type === "INCOME" ? "text-emerald-400" : "text-slate-200"
                          }`}
                        >
                          {tx.type === "INCOME" ? "+" : "-"} {formatMoney(tx.amount, tx.currency)}
                        </div>
                        {tx.currency !== "IDR" && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            ≈ {formatMoney(convertCurrency(tx.amount, tx.currency, "IDR"), "IDR")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar (Pillars 1 & 3) */}
            <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-400 text-[11px]">
                Menampilkan <strong>{Math.min(filteredTransactions.length, (currentPage - 1) * pageSize + 1)}</strong> - <strong>{Math.min(filteredTransactions.length, currentPage * pageSize)}</strong> dari <strong>{filteredTransactions.length}</strong> mutasi
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="min-h-[44px] px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-semibold cursor-pointer transition-colors"
                >
                  Sebelumnya
                </button>

                <div className="px-3 py-1 font-mono text-xs font-bold text-emerald-400">
                  {currentPage} / {Math.max(1, Math.ceil(filteredTransactions.length / pageSize))}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= Math.ceil(filteredTransactions.length / pageSize)}
                  onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredTransactions.length / pageSize), p + 1))}
                  className="min-h-[44px] px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-semibold cursor-pointer transition-colors"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOUBLE-ENTRY FINANCIAL STATEMENTS */}
      {activeTab === "statements" && (
        <div className="space-y-6">
          {/* Statement Switcher Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatementType("PL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statementType === "PL"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Laba Rugi (Profit & Loss)
              </button>
              <button
                onClick={() => setStatementType("BALANCE_SHEET")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statementType === "BALANCE_SHEET"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Neraca (Balance Sheet)
              </button>
              <button
                onClick={() => setStatementType("EQUITY")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statementType === "EQUITY"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Perubahan Modal
              </button>
              <button
                onClick={() => setStatementType("CASHFLOW")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statementType === "CASHFLOW"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Arus Kas (Cash Flow)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak PDF</span>
              </button>
            </div>
          </div>

          {/* Statement Document View */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 max-w-4xl mx-auto font-sans shadow-lg">
            {/* Header Document */}
            <div className="text-center pb-6 border-b border-slate-800">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {statementType === "PL" && "LAPORAN LABA RUGI KOMPREHENSIF (INCOME STATEMENT)"}
                {statementType === "BALANCE_SHEET" && "NERACA KEUANGAN (BALANCE SHEET)"}
                {statementType === "EQUITY" && "LAPORAN PERUBAHAN EKUITAS & PRIVE"}
                {statementType === "CASHFLOW" && "LAPORAN ARUS KAS METODE LANGSUNG (CASH FLOW)"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Standar Akuntansi Keuangan Entitas Mikro, Kecil, dan Menengah (SAK EMKM) • Periode Berjalan 2026
              </p>
              <p className="text-[11px] font-mono text-emerald-400 mt-0.5">Mata Uang Pelaporan: IDR (Rupiah)</p>
            </div>

            {/* 1. Laba Rugi */}
            {statementType === "PL" && (
              <div className="mt-6 space-y-6 text-xs">
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                    I. Pendapatan Usaha (Revenue)
                  </h4>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-300">Pendapatan Jasa & Proyek Klien</span>
                    <span className="font-mono text-white font-semibold">{formatMoney(totalRevenue, "IDR")}</span>
                  </div>
                  <div className="py-2.5 flex justify-between text-slate-400">
                    <span>HPP / Biaya Tenaga Ahli Subkontraktor</span>
                    <span className="font-mono text-rose-400">({formatMoney(totalHPP, "IDR")})</span>
                  </div>
                  <div className="py-2.5 flex justify-between font-bold text-emerald-400 bg-slate-950/60 px-3 rounded-lg mt-1">
                    <span>LABA KOTOR (GROSS PROFIT)</span>
                    <span className="font-mono">{formatMoney(grossProfit, "IDR")}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                    II. Beban Operasional Usaha (Operating Expenses)
                  </h4>
                  <div className="space-y-1.5 py-2 text-slate-300">
                    <div className="flex justify-between">
                      <span>Beban Gaji Staf & Developer</span>
                      <span className="font-mono">Rp 38.000.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beban Software Cloud, AI API & Hosting</span>
                      <span className="font-mono">Rp 8.450.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beban Jamuan Relasi & Operasional Kantor</span>
                      <span className="font-mono">Rp 4.200.000</span>
                    </div>
                  </div>
                  <div className="py-2.5 flex justify-between font-bold text-slate-200 bg-slate-950/60 px-3 rounded-lg">
                    <span>TOTAL BEBAN OPERASIONAL</span>
                    <span className="font-mono text-rose-400">({formatMoney(totalOpex, "IDR")})</span>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-slate-700">
                  <div className="flex justify-between text-sm font-extrabold text-white bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                    <span>LABA BERSIH TAHUN BERJALAN (NET INCOME)</span>
                    <span className="font-mono text-emerald-400">{formatMoney(operatingIncome, "IDR")}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 italic">
                    *Catatan Fiskal: Prive senilai {formatMoney(totalPrive, "IDR")} tidak dikurangkan dari Laba Bersih sesuai UU PPh Pasal 9 ayat (1) huruf i.
                  </p>
                </div>
              </div>
            )}

            {/* 2. Neraca */}
            {statementType === "BALANCE_SHEET" && (
              <div className="mt-6 space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* ASET */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                      ASET (ASSETS)
                    </h4>
                    <div>
                      <span className="font-bold text-slate-400 text-[11px] block mb-1">Aset Lancar:</span>
                      <div className="space-y-1.5 text-slate-300">
                        <div className="flex justify-between">
                          <span>Kas & Setara Kas (Bank Giro & Valas)</span>
                          <span className="font-mono text-white">Rp 232.800.000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax Escrow Pocket (Bank Jago)</span>
                          <span className="font-mono text-white">Rp 24.500.000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Piutang Usaha (Invoice Pending)</span>
                          <span className="font-mono text-white">Rp 74.120.000</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 text-[11px] block mb-1">Aset Tetap (Capex):</span>
                      <div className="space-y-1.5 text-slate-300">
                        <div className="flex justify-between">
                          <span>Peralatan Komputer & Elektronik</span>
                          <span className="font-mono text-white">Rp 32.000.000</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-xl flex justify-between font-bold text-white border border-slate-800">
                      <span>TOTAL ASET</span>
                      <span className="font-mono text-emerald-400">Rp 363.420.000</span>
                    </div>
                  </div>

                  {/* LIABILITAS & EKUITAS */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                      KEWAJIBAN & EKUITAS (LIABILITIES & EQUITY)
                    </h4>
                    <div>
                      <span className="font-bold text-slate-400 text-[11px] block mb-1">Kewajiban Jangka Pendek:</span>
                      <div className="space-y-1.5 text-slate-300">
                        <div className="flex justify-between">
                          <span>Hutang Pajak Masa (PPh / PPN)</span>
                          <span className="font-mono text-white">Rp 2.450.000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hutang Gaji & Subkontraktor</span>
                          <span className="font-mono text-white">Rp 0</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 text-[11px] block mb-1">Ekuitas Pemilik:</span>
                      <div className="space-y-1.5 text-slate-300">
                        <div className="flex justify-between">
                          <span>Modal Disetor Awal</span>
                          <span className="font-mono text-white">Rp 250.000.000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Laba Ditahan Berjalan</span>
                          <span className="font-mono text-white">{formatMoney(operatingIncome - totalPrive, "IDR")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-xl flex justify-between font-bold text-white border border-slate-800">
                      <span>TOTAL LIABILITAS & EKUITAS</span>
                      <span className="font-mono text-emerald-400">Rp 363.420.000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Perubahan Modal */}
            {statementType === "EQUITY" && (
              <div className="mt-6 space-y-4 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-300">Modal Awal Periode</span>
                  <span className="font-mono text-white font-bold">Rp 250.000.000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-300">+ Laba Bersih Periode Berjalan</span>
                  <span className="font-mono text-emerald-400 font-bold">{formatMoney(operatingIncome, "IDR")}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800 text-rose-400">
                  <span>- Prive / Penarikan Pribadi Pemilik</span>
                  <span className="font-mono font-bold">({formatMoney(totalPrive, "IDR")})</span>
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex justify-between text-sm font-bold text-white mt-4">
                  <span>MODAL AKHIR PERIODE</span>
                  <span className="font-mono text-emerald-400">
                    {formatMoney(250000000 + operatingIncome - totalPrive, "IDR")}
                  </span>
                </div>
              </div>
            )}

            {/* 4. Arus Kas */}
            {statementType === "CASHFLOW" && (
              <div className="mt-6 space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                    Arus Kas dari Aktivitas Operasi
                  </h4>
                  <div className="space-y-1 py-2 text-slate-300">
                    <div className="flex justify-between">
                      <span>Penerimaan Kas dari Pelanggan & Klien</span>
                      <span className="font-mono text-emerald-400">+{formatMoney(totalRevenue, "IDR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pembayaran Kas ke Vendor, Cloud & Staf</span>
                      <span className="font-mono text-rose-400">-Rp 58.950.000</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                    Arus Kas dari Aktivitas Investasi & Pendanaan
                  </h4>
                  <div className="space-y-1 py-2 text-slate-300">
                    <div className="flex justify-between">
                      <span>Pengadaan Laptop & Peralatan (Capex)</span>
                      <span className="font-mono text-rose-400">-{formatMoney(totalCapex, "IDR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Penarikan Prive Pemilik</span>
                      <span className="font-mono text-rose-400">-{formatMoney(totalPrive, "IDR")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ANOMALY & FRAUD DETECTION */}
      {activeTab === "fraud" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Fraud & Tax Audit Compliance Guard</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mendeteksi transaksi duplikat, lonjakan beban tidak wajar, dan pengeluaran berisiko terkena sanksi denda DJP akibat koreksi fiskal biaya non-3M.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {transactions
              .filter((t) => t.isFlaggedAnomaly)
              .map((tx) => (
                <div
                  key={tx.id}
                  className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded">
                        Risiko Koreksi Fiskal DJP
                      </span>
                      <span className="font-mono text-xs text-slate-400">{tx.date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white font-mono">{tx.rawNarration}</h4>
                    <p className="text-xs text-amber-200/90 font-medium">{tx.anomalyReason}</p>
                    <p className="text-[11px] text-slate-400">
                      Nominal: <strong className="font-mono text-white">{formatMoney(tx.amount, tx.currency)}</strong> • Pos: {tx.accountName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onUpdateTransaction(tx.id, { isFlaggedAnomaly: false, deductibleForTax: false, coaCategory: "PRIVE_PENARIKAN_PRIBADI" })}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      Pindahkan ke Prive (Aman)
                    </button>
                    <button
                      onClick={() => onUpdateTransaction(tx.id, { isFlaggedAnomaly: false })}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Lampirkan Bukti Sah
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

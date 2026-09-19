import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  ShieldCheck, 
  Wallet, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  PieChart as PieChartIcon
} from "lucide-react";
import { BankAccount, Transaction, Invoice, Currency, BusinessType } from "../types";
import { formatMoney, convertCurrency } from "../utils/formatters";

interface DashboardOverviewProps {
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  invoices: Invoice[];
  currency: Currency;
  businessType: BusinessType;
  onNavigateTab: (tabId: string) => void;
  onOpenNewInvoice: () => void;
  onOpenCfoAdvisor: () => void;
  onOpenAuditSimulator: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  bankAccounts,
  transactions,
  invoices,
  currency,
  businessType,
  onNavigateTab,
  onOpenNewInvoice,
  onOpenCfoAdvisor,
  onOpenAuditSimulator,
}) => {
  // 1. Calculate Consolidated Cash
  const totalCashIDR = bankAccounts
    .filter((b) => b.accountType === "BUSINESS")
    .reduce((sum, b) => sum + convertCurrency(b.balance, b.currency, "IDR"), 0);

  const personalCashIDR = bankAccounts
    .filter((b) => b.accountType === "PERSONAL")
    .reduce((sum, b) => sum + convertCurrency(b.balance, b.currency, "IDR"), 0);

  // 2. Revenue & Expenses
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

  const netOperatingIncomeIDR = totalRevenueIDR - totalExpenseIDR;

  // 3. Tax Reserve Calculation:
  // If Freelancer OP: 0.5% PPh Final PP 55 (after 500m exempt) or simple 0.5% reserve
  // If Agency PT: 22% on Net Profit or PPh Final + PPh 21 + PPN
  const estimatedTaxLiabilityIDR =
    businessType === "FREELANCER_INDIVIDUAL"
      ? Math.round(totalRevenueIDR * 0.005)
      : Math.round(netOperatingIncomeIDR > 0 ? netOperatingIncomeIDR * 0.11 : 0);

  // Jago Tax Vault Pocket Balance
  const jagoTaxPocket = bankAccounts.find((b) => b.bankCode === "JAGO");
  const actualTaxReserveLockedIDR = jagoTaxPocket
    ? convertCurrency(jagoTaxPocket.balance, jagoTaxPocket.currency, "IDR")
    : 0;

  const isTaxEscrowSafe = actualTaxReserveLockedIDR >= estimatedTaxLiabilityIDR;
  const taxCoveragePct = estimatedTaxLiabilityIDR > 0
    ? Math.min(100, Math.round((actualTaxReserveLockedIDR / estimatedTaxLiabilityIDR) * 100))
    : 100;

  // 4. Burn Rate & Runway
  const monthlyBurnRateIDR = totalExpenseIDR > 0 ? totalExpenseIDR : 45000000;
  const runwayMonths = totalCashIDR > 0 ? (totalCashIDR / monthlyBurnRateIDR).toFixed(1) : "0";

  // 5. Unpaid Invoices
  const pendingInvoices = invoices.filter((i) => i.status === "PENDING");
  const pendingInvoicesTotalIDR = pendingInvoices.reduce(
    (sum, i) => sum + convertCurrency(i.totalPayable, i.currency, "IDR"),
    0
  );

  // 6. Anomalies count
  const anomalyCount = transactions.filter((t) => t.isFlaggedAnomaly).length;

  return (
    <div className="space-y-6">
      {/* Early Warning & Executive Notice Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 lg:p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  AI Financial Health Score
                </span>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 rounded-md">
                  94 / 100 (Optimal)
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-0.5">
                Likuiditas sangat prima ({runwayMonths} bulan runway). Saldo cadangan pajak di Bank Jago siap 100% untuk jatuh tempo SSP PPh Final tgl 15.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenCfoAdvisor}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Konsultasi AI CFO
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Consolidated Cash */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Kas Bisnis</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatMoney(convertCurrency(totalCashIDR, "IDR", currency), currency)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Personal Vault: <strong className="text-slate-300">{formatMoney(convertCurrency(personalCashIDR, "IDR", currency), currency)}</strong>
            </span>
            <span className="text-emerald-400 font-medium flex items-center">
              +14.2% MoM
            </span>
          </div>
        </div>

        {/* Metric 2: Monthly Net Operating Income */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Laba Bersih Operasional</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatMoney(convertCurrency(netOperatingIncomeIDR, "IDR", currency), currency)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
            <span>Omzet: {formatMoney(convertCurrency(totalRevenueIDR, "IDR", currency), currency)}</span>
            <span className="text-teal-400 font-medium">Margin 46%</span>
          </div>
        </div>

        {/* Metric 3: Tax Liability & Reserve Vault */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cadangan Pajak (Escrow)</span>
            <div className={`p-2 rounded-lg ${isTaxEscrowSafe ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatMoney(convertCurrency(actualTaxReserveLockedIDR, "IDR", currency), currency)}
          </div>
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Estimasi Terutang: {formatMoney(convertCurrency(estimatedTaxLiabilityIDR, "IDR", currency), currency)}</span>
              <span className={isTaxEscrowSafe ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                {taxCoveragePct}% Terpenuhi
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isTaxEscrowSafe ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${taxCoveragePct}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Metric 4: Cash Runway & Burn Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Safe Runway</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {runwayMonths} <span className="text-base font-normal text-slate-400 font-sans">Bulan</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
            <span>Burn: {formatMoney(convertCurrency(monthlyBurnRateIDR, "IDR", currency), currency)}/bln</span>
            <span className="text-cyan-400 font-medium">Likuiditas Tinggi</span>
          </div>
        </div>
      </div>

      {/* Interactive Charts & Financial Health Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Cash Flow In vs Out (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Arus Kas & Margin Bersih (Cash Flow Dynamics)</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  Real-time Double Entry
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Perbandingan arus kas masuk (Inflow) vs beban operasional dan HPP proyek
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                <span className="text-slate-300">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500"></span>
                <span className="text-slate-300">Pengeluaran</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-teal-400"></span>
                <span className="text-slate-300">Pajak Disisihkan</span>
              </div>
            </div>
          </div>

          {/* SVG Interactive Multi-Bar & Area Simulation Chart */}
          <div className="relative pt-4">
            <div className="h-60 flex items-end justify-between gap-3 sm:gap-6 px-2 border-b border-slate-800 pb-2">
              {[
                { month: "Mei", in: 78000000, out: 34000000, tax: 390000 },
                { month: "Jun", in: 92000000, out: 41000000, tax: 460000 },
                { month: "Jul", in: 115000000, out: 52000000, tax: 575000 },
                { month: "Agt", in: 138000000, out: 61000000, tax: 690000 },
                { month: "Sep (Berjalan)", in: totalRevenueIDR, out: totalExpenseIDR, tax: estimatedTaxLiabilityIDR },
              ].map((bar, idx) => {
                const maxVal = 160000000;
                const inHeight = Math.min(100, Math.round((bar.in / maxVal) * 100));
                const outHeight = Math.min(100, Math.round((bar.out / maxVal) * 100));
                const taxHeight = Math.max(8, Math.round((bar.tax / maxVal) * 100 * 8)); // scale for visibility

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-16 opacity-0 group-hover:opacity-100 pointer-events-none transition-all bg-slate-950 text-white border border-slate-700 text-[11px] rounded-lg p-2 z-20 shadow-xl whitespace-nowrap">
                      <div className="font-bold text-emerald-400">{bar.month}</div>
                      <div>In: {formatMoney(convertCurrency(bar.in, "IDR", currency), currency)}</div>
                      <div>Out: {formatMoney(convertCurrency(bar.out, "IDR", currency), currency)}</div>
                    </div>

                    <div className="w-full flex items-end justify-center gap-1.5 h-48">
                      {/* Inflow bar */}
                      <div 
                        className="w-full max-w-[20px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 hover:brightness-110"
                        style={{ height: `${inHeight}%` }}
                      ></div>
                      {/* Outflow bar */}
                      <div 
                        className="w-full max-w-[20px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-500 hover:brightness-110"
                        style={{ height: `${outHeight}%` }}
                      ></div>
                      {/* Tax Reserve bar */}
                      <div 
                        className="w-full max-w-[10px] bg-teal-400/80 rounded-t-sm transition-all duration-500"
                        style={{ height: `${taxHeight}%` }}
                        title="Cadangan Pajak Disisihkan"
                      ></div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium mt-3">{bar.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
              <span>Rp 0</span>
              <span>Rp 80 Jt</span>
              <span>Rp 160 Jt+</span>
            </div>
          </div>
        </div>

        {/* Breakdown & Action Shortcuts (1 Col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <PieChartIcon className="w-4 h-4 text-emerald-400" />
              <span>Komposisi Pengeluaran (COA)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Pengelompokan otomatis oleh FinTax AI
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Gaji Tim & Payroll</span>
                  <span className="font-mono text-slate-200">Rp 38.000.000 (48%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "48%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">HPP Subkontraktor Desain</span>
                  <span className="font-mono text-slate-200">Rp 12.500.000 (16%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: "16%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Cloud, AI API & SaaS</span>
                  <span className="font-mono text-slate-200">Rp 8.450.000 (11%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "11%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Prive Pemilik (Non-Deductible)</span>
                  <span className="font-mono text-slate-200">Rp 15.000.000 (19%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: "19%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Aksi Cepat Enterprise
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenNewInvoice}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Buat Invoice</span>
              </button>
              <button
                onClick={onOpenAuditSimulator}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulasi Audit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Pending Invoices & Anomaly Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Invoices & Payment Link Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Invoice Aktif & Payment Link</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                  {pendingInvoices.length} Menunggu Pembayaran
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total piutang berjalan: <strong>{formatMoney(convertCurrency(pendingInvoicesTotalIDR, "IDR", currency), currency)}</strong>
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("banking")}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Kelola Semua
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {invoices.slice(0, 3).map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{inv.invoiceNumber}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {inv.status === "PAID" ? "Lunas (Reconciled)" : "Menunggu Bayar"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">{inv.clientName}</p>
                  <p className="text-[11px] text-slate-400">Jatuh Tempo: {inv.dueDate}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-white">
                    {formatMoney(inv.totalPayable, inv.currency)}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {inv.ppnAmount > 0 ? "Inc. PPN 11%" : "Non-PPN"} • PPh 23: {formatMoney(inv.pph23Withholding, inv.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly & Compliance Radar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Deteksi Anomali & Fraud AI</span>
                {anomalyCount > 0 ? (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {anomalyCount} Perlu Perhatian
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Bebas Risiko
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pemeriksaan otomatis transaksi berisiko koreksi fiskal DJP
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("accounting")}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Lihat Jurnal
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {transactions
              .filter((t) => t.isFlaggedAnomaly)
              .map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300 font-mono">
                        {formatMoney(tx.amount, tx.currency)}
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-medium">
                        Koreksi Fiskal Positif
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium">{tx.rawNarration}</p>
                    <p className="text-[11px] text-amber-400/90">{tx.anomalyReason}</p>
                  </div>
                  <button 
                    onClick={() => onNavigateTab("accounting")}
                    className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 rounded-lg text-xs font-medium shrink-0 transition-colors"
                  >
                    Tinjau
                  </button>
                </div>
              ))}

            {/* Tax Calendar Quick Countdown */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Jatuh Tempo Pajak Masa PPh Final 0,5%</p>
                  <p className="text-[11px] text-slate-400">Batas setor tgl 15 bulan depan • Kode Akun Pajak 411128-420</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-md">
                Aman 100%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

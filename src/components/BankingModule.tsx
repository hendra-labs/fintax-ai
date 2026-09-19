import React, { useState } from "react";
import { 
  Building, 
  CreditCard, 
  RefreshCw, 
  Plus, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  DollarSign, 
  Globe2, 
  Lock, 
  FileText,
  Copy,
  Check,
  Send
} from "lucide-react";
import { BankAccount, Invoice, Currency, Transaction } from "../types";
import { formatMoney, convertCurrency, formatIdDate } from "../utils/formatters";

interface BankingModuleProps {
  bankAccounts: BankAccount[];
  invoices: Invoice[];
  currency: Currency;
  isSyncing: boolean;
  onSync: () => void;
  onOpenCreateInvoice: () => void;
  onSimulateClientPayment: (invoiceId: string) => void;
}

export const BankingModule: React.FC<BankingModuleProps> = ({
  bankAccounts,
  invoices,
  currency,
  isSyncing,
  onSync,
  onOpenCreateInvoice,
  onSimulateClientPayment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"accounts" | "invoices" | "fx">("accounts");
  const [accountFilter, setAccountFilter] = useState<"ALL" | "BUSINESS" | "PERSONAL">("ALL");
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showConnectBankModal, setShowConnectBankModal] = useState(false);

  // FX Converter interactive state
  const [fxInputAmount, setFxInputAmount] = useState<number>(1000);
  const [fxInputCurrency, setFxInputCurrency] = useState<Currency>("USD");

  const filteredAccounts = bankAccounts.filter((b) => {
    if (accountFilter === "ALL") return true;
    return b.accountType === accountFilter;
  });

  const totalBusinessCashIDR = bankAccounts
    .filter((b) => b.accountType === "BUSINESS")
    .reduce((sum, b) => sum + convertCurrency(b.balance, b.currency, "IDR"), 0);

  const totalPersonalCashIDR = bankAccounts
    .filter((b) => b.accountType === "PERSONAL")
    .reduce((sum, b) => sum + convertCurrency(b.balance, b.currency, "IDR"), 0);

  const handleCopyPaymentLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("accounts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "accounts"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Direct Bank Feeds & Multi-Account
          </button>
          <button
            onClick={() => setActiveSubTab("invoices")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "invoices"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Invoicing & Payment Gateway ({invoices.length})
          </button>
          <button
            onClick={() => setActiveSubTab("fx")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "fx"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Multi-Currency & Kurs Valas
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {activeSubTab === "accounts" && (
            <button
              onClick={() => setShowConnectBankModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tautkan Bank Baru</span>
            </button>
          )}
          {activeSubTab === "invoices" && (
            <button
              onClick={onOpenCreateInvoice}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Invoice Pajak</span>
            </button>
          )}
        </div>
      </div>

      {/* SUBTAB 1: DIRECT BANK FEEDS & MULTI-ACCOUNT */}
      {activeSubTab === "accounts" && (
        <div className="space-y-6">
          {/* Summary & Boundary Alert */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Kas Bisnis (Konsolidasi)
              </span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {formatMoney(convertCurrency(totalBusinessCashIDR, "IDR", currency), currency)}
              </div>
              <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                4 Akun Terhubung via Open Finance API
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Rekening Pribadi (Prive Boundary)
              </span>
              <div className="text-2xl font-bold font-mono text-slate-300 mt-1">
                {formatMoney(convertCurrency(totalPersonalCashIDR, "IDR", currency), currency)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Dipisahkan secara otomatis agar terhindar dari koreksi fiskal biaya non-3M
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Open Finance Sync Engine
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-sm font-bold text-slate-200">24/7 Real-Time Polling</span>
                </div>
              </div>
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="mt-2 w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Menarik Mutasi Perbankan..." : "Paksa Sinkronisasi Sekarang"}</span>
              </button>
            </div>
          </div>

          {/* Account Filter Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Filter Tampilan:</span>
            <button
              onClick={() => setAccountFilter("ALL")}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                accountFilter === "ALL"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Semua ({bankAccounts.length})
            </button>
            <button
              onClick={() => setAccountFilter("BUSINESS")}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                accountFilter === "BUSINESS"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Rekening Bisnis & Escrow
            </button>
            <button
              onClick={() => setAccountFilter("PERSONAL")}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                accountFilter === "PERSONAL"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Rekening Pribadi Pemilik
            </button>
          </div>

          {/* Bank Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-white text-xs shadow-md"
                      style={{ backgroundColor: account.iconColor }}
                    >
                      {account.bankCode}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">{account.name}</h4>
                      <p className="font-mono text-xs text-slate-400">{account.accountNumber}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                      account.accountType === "BUSINESS"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    }`}
                  >
                    {account.accountType === "BUSINESS" ? "Bisnis" : "Pribadi"}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-end justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Saldo Tersedia
                    </span>
                    <span className="text-lg font-bold font-mono text-white">
                      {formatMoney(account.balance, account.currency)}
                    </span>
                    {account.currency !== "IDR" && (
                      <span className="text-[11px] text-slate-400 block font-mono">
                        ≈ {formatMoney(convertCurrency(account.balance, account.currency, "IDR"), "IDR")}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Status API</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Aktif
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Sinkronisasi: {account.lastSynced}</span>
                  <span className="font-mono text-[10px] text-slate-400">{account.currency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: MULTI-CHANNEL INVOICING & PAYMENT GATEWAY */}
      {activeSubTab === "invoices" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Smart Invoicing Berstandar Pajak & Payment Link</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Otomatis menghitung PPN 11%, Bukti Potong PPh 23 (2%), dan rekonsiliasi otomatis saat klien membayar via QRIS/Virtual Account.
              </p>
            </div>
            <button
              onClick={onOpenCreateInvoice}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Invoice Baru</span>
            </button>
          </div>

          {/* Invoices Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">No. Invoice & Klien</th>
                    <th className="py-3.5 px-4 font-semibold">Tanggal & Jatuh Tempo</th>
                    <th className="py-3.5 px-4 font-semibold">Subtotal & Pajak</th>
                    <th className="py-3.5 px-4 font-semibold">Total Tagihan</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Aksi & Payment Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-white">{inv.invoiceNumber}</div>
                        <div className="text-slate-300 font-medium">{inv.clientName}</div>
                        {inv.clientNpwp && (
                          <div className="text-[10px] text-slate-500 font-mono">NPWP: {inv.clientNpwp}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div>Terbit: {inv.issueDate}</div>
                        <div className="text-slate-400">Tempo: {inv.dueDate}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>DPP: {formatMoney(inv.subtotal, inv.currency)}</div>
                        <div className="text-[11px] text-slate-400">
                          {inv.ppnAmount > 0 ? `+ PPN 11%: ${formatMoney(inv.ppnAmount, inv.currency)}` : "Tarif PPN 0%"}
                        </div>
                        {inv.pph23Withholding > 0 && (
                          <div className="text-[11px] text-teal-400">
                            - Potongan PPh 23: {formatMoney(inv.pph23Withholding, inv.currency)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-sm text-white">
                          {formatMoney(inv.totalPayable, inv.currency)}
                        </div>
                        {inv.currency !== "IDR" && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            ≈ {formatMoney(convertCurrency(inv.totalPayable, inv.currency, "IDR"), "IDR")}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full border inline-flex items-center gap-1 ${
                            inv.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {inv.status === "PAID" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Lunas & Rekonsiliasi
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              Menunggu Bayar
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedInvoiceForPayment(inv)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-700"
                            title="Buka Payment Link & QRIS"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Payment Link</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: MULTI-CURRENCY & FX RATES */}
      {activeSubTab === "fx" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Exchange Rate Matrix */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <span>Kurs Konversi Real-Time (KMK & Bank Indonesia)</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Pencatatan pendapatan valas otomatis dikonversi ke Rupiah untuk pelaporan SPT Pajak
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                      USD
                    </span>
                    <div>
                      <span className="text-xs text-slate-200 font-bold block">1 USD to IDR</span>
                      <span className="text-[11px] text-slate-400">United States Dollar</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">Rp 15.850</span>
                    <span className="text-[10px] text-emerald-400 block">+0.18%</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      EUR
                    </span>
                    <div>
                      <span className="text-xs text-slate-200 font-bold block">1 EUR to IDR</span>
                      <span className="text-[11px] text-slate-400">Euro Member Countries</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">Rp 17.200</span>
                    <span className="text-[10px] text-emerald-400 block">+0.05%</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs">
                      SGD
                    </span>
                    <div>
                      <span className="text-xs text-slate-200 font-bold block">1 SGD to IDR</span>
                      <span className="text-[11px] text-slate-400">Singapore Dollar</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">Rp 11.800</span>
                    <span className="text-[10px] text-slate-400 block">Stabil</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Freelancer FX Revenue Calculator */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Kalkulator Penerimaan Valas & Pajak Ekspor Jasa</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Hitung estimasi penerimaan bersih dalam Rupiah dan porsi PPh yang wajib disisihkan
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nominal Remitansi Klien Asing
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={fxInputAmount}
                      onChange={(e) => setFxInputAmount(Number(e.target.value) || 0)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                    <select
                      value={fxInputCurrency}
                      onChange={(e) => setFxInputCurrency(e.target.value as Currency)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="SGD">SGD (S$)</option>
                    </select>
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Nilai dalam IDR:</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {formatMoney(convertCurrency(fxInputAmount, fxInputCurrency, "IDR"), "IDR")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Tarif PPN Ekspor Jasa (PMK):</span>
                    <span className="font-mono font-semibold text-emerald-400">0% (Bebas PPN)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Cadangan PPh Final 0,5% Disisihkan:</span>
                    <span className="font-mono font-semibold text-teal-300">
                      {formatMoney(convertCurrency(fxInputAmount, fxInputCurrency, "IDR") * 0.005, "IDR")}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-bold">
                    <span className="text-slate-200">Net Safe-to-Spend:</span>
                    <span className="font-mono text-emerald-400 text-sm">
                      {formatMoney(convertCurrency(fxInputAmount, fxInputCurrency, "IDR") * 0.995, "IDR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PAYMENT LINK & QRIS VIEWER WITH AUTO-RECONCILIATION SIMULATOR */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  FinTax AI Checkout & Payment Gateway
                </span>
                <h3 className="text-base font-bold text-white">
                  Invoice {selectedInvoiceForPayment.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Recipient & Amount */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-400">Total Pembayaran Tagihan</p>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {formatMoney(selectedInvoiceForPayment.totalPayable, selectedInvoiceForPayment.currency)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ditagihkan kepada: <strong className="text-slate-200">{selectedInvoiceForPayment.clientName}</strong>
                </p>
              </div>

              {/* QRIS / VA Options */}
              <div className="space-y-3">
                <div className="p-4 bg-white text-slate-950 rounded-2xl flex flex-col items-center justify-center">
                  <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">
                    QRIS Standar Bank Indonesia & ASPI
                  </div>
                  {/* Simulated High-Res QRIS Code Graphic */}
                  <div className="w-44 h-44 bg-slate-950 p-2 rounded-xl flex items-center justify-center relative">
                    <div className="w-full h-full border-4 border-dashed border-emerald-400 rounded-lg flex flex-col items-center justify-center text-emerald-400 text-center p-2">
                      <QrCode className="w-16 h-16 mb-1 text-emerald-400 stroke-[1.5]" />
                      <span className="text-[10px] font-mono font-bold">NMID: ID102026881920</span>
                      <span className="text-[9px] text-slate-400">BCA • Mandiri • GoPay • OVO</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium mt-2">
                    Dapat di-scan dengan seluruh aplikasi M-Banking & E-Wallet
                  </span>
                </div>

                {/* Virtual Account Details */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">BCA Virtual Account:</span>
                    <span className="font-mono font-bold text-white">88029-9182-3901</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mandiri Virtual Account:</span>
                    <span className="font-mono font-bold text-white">8910-1289-4019</span>
                  </div>
                </div>

                {/* Shareable Link */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={selectedInvoiceForPayment.paymentLinkUrl}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopyPaymentLink(selectedInvoiceForPayment.paymentLinkUrl)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? "Tersalin!" : "Salin Link"}</span>
                  </button>
                </div>
              </div>

              {/* Instant Client Payment Simulation Trigger */}
              <div className="pt-2">
                {selectedInvoiceForPayment.status === "PENDING" ? (
                  <button
                    onClick={() => {
                      onSimulateClientPayment(selectedInvoiceForPayment.id);
                      setSelectedInvoiceForPayment(null);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulasi: Klien Bayar Sekarang (Trigger AI Reconciliation)</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-400 font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Invoice ini telah lunas & terekonsiliasi ke buku kas.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONNECT NEW BANK AGGREGATOR */}
      {showConnectBankModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Tautkan Akun Open Finance</h3>
              <button
                onClick={() => setShowConnectBankModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-400">
                Pilih agregator Open Finance berlisensi untuk menghubungkan mutasi perbankan secara aman dengan enkripsi TLS 1.3 & AES-256:
              </p>

              <div className="space-y-2.5">
                {[
                  { name: "BCA Corporate API / KlikBCA Bisnis", badge: "Direct Official", desc: "Integrasi mutasi giro & VA otomatis" },
                  { name: "Bank Mandiri Kopra Open API", badge: "Direct Official", desc: "Integrasi rekening operasional & payroll" },
                  { name: "Finverse / Brankas Open Banking", badge: "Bank Aggregator", desc: "Mendukung BRI, BNI, Permata, CIMB Niaga" },
                  { name: "Stripe Connect / PayPal API", badge: "Global Gateway", desc: "Tarik pembayaran klien internasional USD/EUR" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setShowConnectBankModal(false);
                      onSync();
                    }}
                    className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                          {item.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{item.desc}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

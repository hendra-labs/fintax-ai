import React, { useState } from "react";
import { 
  Header 
} from "./components/Header";
import { 
  DashboardOverview 
} from "./components/DashboardOverview";
import { 
  BankingModule 
} from "./components/BankingModule";
import { 
  AccountingModule 
} from "./components/AccountingModule";
import { 
  TaxCopilotModule 
} from "./components/TaxCopilotModule";
import { 
  CfoAdvisorModule 
} from "./components/CfoAdvisorModule";
import { 
  PublicShowcase 
} from "./components/PublicShowcase";
import { 
  MobileBottomNav 
} from "./components/MobileBottomNav";
import { 
  CreateInvoiceModal 
} from "./components/CreateInvoiceModal";
import { 
  INITIAL_BANK_ACCOUNTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_INVOICES 
} from "./data/initialData";
import { 
  BankAccount, 
  Transaction, 
  Invoice, 
  Currency, 
  BusinessType 
} from "./types";
import { 
  LayoutDashboard, 
  Landmark, 
  BookOpen, 
  FileSpreadsheet, 
  Bot, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  X
} from "lucide-react";
import { convertCurrency, formatMoney } from "./utils/formatters";

export function App() {
  // Navigation & Core States with URL Query Param Detection (Technical SEO deep-linking)
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") || params.get("view");
      if (tabParam && ["dashboard", "banking", "accounting", "tax", "cfo", "showcase"].includes(tabParam)) {
        return tabParam;
      }
    }
    return "dashboard";
  });
  const [businessType, setBusinessType] = useState<BusinessType>("CREATIVE_AGENCY_PT");
  const [currency, setCurrency] = useState<Currency>("IDR");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  // Financial Domain States
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  // Reconciliation Toast Notification
  const [reconciliationToast, setReconciliationToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    amount?: number;
  }>({ show: false, title: "", message: "" });

  // Bank Jago Tax Escrow balance
  const jagoAccount = bankAccounts.find((b) => b.id === "bank-3");
  const jagoTaxPocketBalance = jagoAccount ? jagoAccount.balance : 24500000;

  // Handle Bank Sync (Open Finance 24/7 Integration simulation)
  const handleSyncBankFeeds = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const currentTime = "Hari ini, " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      setBankAccounts((prev) =>
        prev.map((acc) => ({ ...acc, lastSynced: currentTime }))
      );
      setReconciliationToast({
        show: true,
        title: "Open Finance Sync Selesai",
        message: "5 Rekening terhubung telah disinkronkan tanpa selisih rekonsiliasi.",
      });
      setTimeout(() => setReconciliationToast((t) => ({ ...t, show: false })), 4000);
    }, 1200);
  };

  // Handle Client Payment Simulation (Autonomous Reconciliation Trigger)
  const handleSimulateClientPayment = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    // 1. Mark invoice as PAID
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: "PAID" } : i))
    );

    const receivedIDR = convertCurrency(inv.totalPayable, inv.currency, "IDR");
    const taxToReserve = Math.round(receivedIDR * 0.005); // 0.5% PPh Final

    // 2. Auto-generate matching transaction in Ledger (Autonomous Reconciliation Engine)
    const newTx: Transaction = {
      id: `tx-rec-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      rawNarration: `QRIS SETTLEMENT/TRSF E-BKG DARI ${inv.clientName.toUpperCase()} REF-${inv.invoiceNumber}`,
      amount: inv.totalPayable,
      type: "INCOME",
      currency: inv.currency,
      bankAccountId: "bank-1", // BCA Giro
      coaCategory: "PENDAPATAN_USAHA",
      accountName: "Pendapatan Usaha Jasa Klien",
      aiConfidence: 0.99,
      deductibleForTax: true,
      taxNotes: `Rekonsiliasi otomatis atas pelunasan ${inv.invoiceNumber}. PPh 23 kredit pajak: ${formatMoney(inv.pph23Withholding, inv.currency)} dicatat pada e-Bupot.`,
      reconciliationStatus: "MATCHED",
    };

    setTransactions((prev) => [newTx, ...prev]);

    // 3. Update BCA Giro balance & Bank Jago Tax Escrow
    setBankAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === "bank-1") {
          return { ...acc, balance: acc.balance + receivedIDR };
        }
        if (acc.id === "bank-3") {
          return { ...acc, balance: acc.balance + taxToReserve };
        }
        return acc;
      })
    );

    // 4. Show success alert
    setReconciliationToast({
      show: true,
      title: `⚡ Pembayaran ${inv.invoiceNumber} Lunas & Terekonsiliasi!`,
      message: `Penerimaan ${formatMoney(inv.totalPayable, inv.currency)} otomatis dibukukan ke Laba Rugi, dan cadangan pajak ${formatMoney(taxToReserve, "IDR")} otomatis disisihkan ke Bank Jago Pocket.`,
      amount: inv.totalPayable,
    });

    setTimeout(() => {
      setReconciliationToast((t) => ({ ...t, show: false }));
    }, 6000);
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    setReconciliationToast({
      show: true,
      title: "Mutasi Berhasil Ditambahkan",
      message: `${newTx.rawNarration} telah diklasifikasikan ke ${newTx.accountName}.`,
    });
    setTimeout(() => setReconciliationToast((t) => ({ ...t, show: false })), 4000);
  };

  const handleUpdateTransaction = (txId: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, ...updates } : tx))
    );
    setReconciliationToast({
      show: true,
      title: "Status Transaksi Diperbarui",
      message: "Data buku kas dan audit checklist telah disesuaikan.",
    });
    setTimeout(() => setReconciliationToast((t) => ({ ...t, show: false })), 3000);
  };

  const handleAddInvoice = (newInv: Invoice) => {
    setInvoices((prev) => [newInv, ...prev]);
    setReconciliationToast({
      show: true,
      title: `Invoice ${newInv.invoiceNumber} Diterbitkan!`,
      message: `Payment Link QRIS & Virtual Account siap dikirimkan kepada ${newInv.clientName}.`,
    });
    setTimeout(() => setReconciliationToast((t) => ({ ...t, show: false })), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300 w-full overflow-x-hidden">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        businessType={businessType}
        setBusinessType={setBusinessType}
        currency={currency}
        setCurrency={setCurrency}
        isSyncing={isSyncing}
        onSync={handleSyncBankFeeds}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-6 w-full overflow-x-hidden">
        {/* VIEW 0: PUBLIC LANDING & TECHNICAL SEO SHOWCASE */}
        {activeTab === "showcase" && (
          <PublicShowcase onLaunchApp={(tab) => setActiveTab(tab || "dashboard")} />
        )}

        {/* VIEW 1: EXECUTIVE DASHBOARD */}
        {activeTab === "dashboard" && (
          <DashboardOverview
            bankAccounts={bankAccounts}
            transactions={transactions}
            invoices={invoices}
            currency={currency}
            businessType={businessType}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenNewInvoice={() => setIsCreateInvoiceOpen(true)}
            onOpenCfoAdvisor={() => setActiveTab("cfo")}
            onOpenAuditSimulator={() => setActiveTab("tax")}
          />
        )}

        {/* VIEW 2: MODUL 1 - BANKING & OPEN FINANCE */}
        {activeTab === "banking" && (
          <BankingModule
            bankAccounts={bankAccounts}
            invoices={invoices}
            currency={currency}
            isSyncing={isSyncing}
            onSync={handleSyncBankFeeds}
            onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
            onSimulateClientPayment={handleSimulateClientPayment}
          />
        )}

        {/* VIEW 3: MODUL 2 - ACCOUNTING & DOUBLE-ENTRY LEDGER */}
        {activeTab === "accounting" && (
          <AccountingModule
            transactions={transactions}
            currency={currency}
            businessType={businessType}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
          />
        )}

        {/* VIEW 4: MODUL 3 - TAX COPILOT & AUDIT SIMULATOR */}
        {activeTab === "tax" && (
          <TaxCopilotModule
            transactions={transactions}
            invoices={invoices}
            currency={currency}
            businessType={businessType}
            jagoTaxPocketBalance={jagoTaxPocketBalance}
          />
        )}

        {/* VIEW 5: MODUL 4 - CONVERSATIONAL AI CFO */}
        {activeTab === "cfo" && (
          <CfoAdvisorModule
            bankAccounts={bankAccounts}
            transactions={transactions}
            invoices={invoices}
            businessType={businessType}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION (Pillar 1 Ergonomics) */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* RECONCILIATION TOAST NOTIFICATION */}
      {reconciliationToast.show && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl shadow-emerald-500/10 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-white leading-tight">
              {reconciliationToast.title}
            </h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              {reconciliationToast.message}
            </p>
          </div>
          <button
            onClick={() => setReconciliationToast((t) => ({ ...t, show: false }))}
            className="text-slate-500 hover:text-slate-300 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        onSubmit={handleAddInvoice}
      />
    </div>
  );
}

export default App;

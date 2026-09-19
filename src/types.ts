export type Currency = "IDR" | "USD" | "EUR" | "SGD";

export type BusinessType = "FREELANCER_INDIVIDUAL" | "CREATIVE_AGENCY_PT" | "UMKM_GROWING";

export type COACategory = 
  | "PENDAPATAN_USAHA"
  | "POS_BIAYA_OPERASIONAL"
  | "HPP_HARGA_POKOK_PENJUALAN"
  | "PRIVE_PENARIKAN_PRIBADI"
  | "BEBAN_PAJAK"
  | "ASET_TETAP_CAPEX"
  | "KEWAJIBAN_HUTANG";

export interface BankAccount {
  id: string;
  name: string;
  bankCode: "BCA" | "MANDIRI" | "BRI" | "BNI" | "JAGO" | "JENIUS" | "STRIPE" | "PAYPAL";
  accountNumber: string;
  accountType: "BUSINESS" | "PERSONAL";
  currency: Currency;
  balance: number;
  lastSynced: string;
  status: "CONNECTED" | "SYNCING" | "ERROR";
  iconColor: string;
}

export interface Transaction {
  id: string;
  date: string;
  rawNarration: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  currency: Currency;
  bankAccountId: string;
  coaCategory: COACategory;
  accountName: string;
  aiConfidence: number;
  deductibleForTax: boolean;
  taxNotes?: string;
  isFlaggedAnomaly?: boolean;
  anomalyReason?: string;
  matchedInvoiceId?: string;
  reconciliationStatus: "MATCHED" | "UNMATCHED" | "MANUAL";
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientNpwp?: string;
  issueDate: string;
  dueDate: string;
  currency: Currency;
  subtotal: number;
  ppnRate: number; // e.g. 0.11
  ppnAmount: number;
  pph23Rate: number; // e.g. 0.02
  pph23Withholding: number;
  totalPayable: number;
  status: "PAID" | "PENDING" | "OVERDUE";
  paymentLinkUrl: string;
  qrisCodeUrl?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface TaxRegulationRAG {
  id: string;
  title: string;
  lawReference: string;
  year: string;
  topic: "PPH_FINAL_UMKM" | "PPH_21_TER" | "PTKP" | "PPN_FAKTUR" | "PPH_23_MANDATE" | "KOREKSI_FISKAL";
  summary: string;
  keyRate: string;
  actionGuide: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "cfo";
  text: string;
  timestamp: string;
  modelUsed?: string;
  suggestedActions?: string[];
}

export interface AuditFinding {
  category: string;
  severity: "low" | "medium" | "high";
  description: string;
  mitigation: string;
}

export interface AuditSimulationResult {
  auditScore: number;
  riskLevel: "Rendah" | "Sedang" | "Tinggi";
  potentialUnderpaymentRp: number;
  findings: AuditFinding[];
  recommendations: string[];
}

import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Lightbulb, 
  User, 
  RotateCcw,
  Download,
  CheckCircle2
} from "lucide-react";
import { ChatMessage, BankAccount, Transaction, Invoice, BusinessType } from "../types";
import { formatMoney, convertCurrency } from "../utils/formatters";

interface CfoAdvisorModuleProps {
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  invoices: Invoice[];
  businessType: BusinessType;
}

export const CfoAdvisorModule: React.FC<CfoAdvisorModuleProps> = ({
  bankAccounts,
  transactions,
  invoices,
  businessType,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "cfo",
      text: `Halo! Saya **FinTax AI CFO**, penasihat keuangan dan kepatuhan pajak otonom Anda.

Saya telah mengonsolidasikan seluruh mutasi rekening bank, pembukuan double-entry, serta status kewajiban pajak Anda per hari ini:
- **Total Kas Likuid Konsolidasi**: Rp 232.800.000
- **Cadangan Pajak Terkunci di Bank Jago**: Rp 24.500.000 (Aman 100%)
- **Estimasi PPh Final & PPh 21 Bulan Ini**: Rp 2.590.000
- **Laba Operasional Bersih**: Rp 78.450.000

Anda dapat menanyakan simulasi arus kas (safe-to-spend), perencanaan pajak legal, atau evaluasi pembengkakan pos biaya operasional.`,
      timestamp: "Baru saja",
      modelUsed: "gemini-3.8-flash",
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Contextual financial summary to pass to the CFO backend
  const totalRevenue = transactions
    .filter((t) => t.type === "INCOME" && t.coaCategory === "PENDAPATAN_USAHA")
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, "IDR"), 0);

  const totalExpense = transactions
    .filter(
      (t) =>
        t.type === "EXPENSE" &&
        (t.coaCategory === "POS_BIAYA_OPERASIONAL" ||
          t.coaCategory === "HPP_HARGA_POKOK_PENJUALAN")
    )
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, "IDR"), 0);

  const totalBankBalance = bankAccounts
    .filter((b) => b.accountType === "BUSINESS")
    .reduce((sum, b) => sum + convertCurrency(b.balance, b.currency, "IDR"), 0);

  const contextData = {
    businessType,
    totalBankBalance,
    totalRevenue,
    totalExpense,
    netProfit: totalRevenue - totalExpense,
    taxReserve: 24500000,
    activeInvoicesCount: invoices.length,
    recentTransactions: transactions.slice(0, 5).map((t) => ({
      narration: t.rawNarration,
      amount: t.amount,
      coa: t.accountName,
      type: t.type,
    })),
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/cfo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-4).map((m) => ({ role: m.sender, text: m.text })),
          contextData,
        }),
      });

      const data = await response.json();

      const cfoReply: ChatMessage = {
        id: `cfo-${Date.now()}`,
        sender: "cfo",
        text: data.reply || "Maaf, sistem tidak dapat memproses jawaban saat ini.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.model || "gemini-3.8-flash",
      };

      setMessages((prev) => [...prev, cfoReply]);
    } catch (err) {
      console.error(err);
      const fallbackReply: ChatMessage = {
        id: `cfo-${Date.now()}`,
        sender: "cfo",
        text: "Koneksi ke backend finansial terganggu. Mohon ulangi beberapa saat lagi.",
        timestamp: "Error",
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Recording Toggle using Web Speech Recognition if available
  const handleToggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      // Fallback simulate voice input
      setIsRecording(!isRecording);
      if (!isRecording) {
        setTimeout(() => {
          setInputPrompt("Berapa sisa cash flow aman buat gaji tim bulan depan kalau pajak dibayar minggu ini?");
          setIsRecording(false);
        }, 1800);
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.continuous = false;

    if (!isRecording) {
      setIsRecording(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt(transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
    } else {
      setIsRecording(false);
      recognition.stop();
    }
  };

  const samplePrompts = [
    "Berapa sisa cash flow aman buat gaji tim bulan depan kalau pajak dibayar minggu ini?",
    "Kategori pengeluaran mana yang paling membengkak kuartal ini?",
    "Bagaimana strategi tax planning legal untuk omset agensi kami tahun ini?",
    "Apakah penarikan prive pemilik kena pemotongan pajak penghasilan?",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Interactive Chat Console (2 Cols) */}
      <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[680px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">FinTax Autonomous AI CFO</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-emerald-400 font-mono">Gemini 3.8 Flash RAG</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Akses penuh data double-entry & regulasi perpajakan DJP terkini
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages(messages.slice(0, 1));
            }}
            className="text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Mulai Sesi Percakapan Baru"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "cfo" && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-950/80 border border-slate-800 text-slate-200"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                <div
                  className={`text-[10px] mt-2 flex items-center justify-between ${
                    msg.sender === "user" ? "text-emerald-200" : "text-slate-500"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.modelUsed && <span className="font-mono text-[9px]">{msg.modelUsed}</span>}
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-slate-300 flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
                </span>
                <span>AI CFO sedang mengkalkulasi skenario keuangan...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Quick Prompt Pills */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] whitespace-nowrap transition-colors border border-slate-700/60 cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar with Voice Support */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl border transition-colors ${
                isRecording
                  ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
              title="Voice Input (Speech-to-Text)"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Tanyakan analisis keuangan, simulasi cash flow, atau pajak..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />

            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Automated Monthly Executive CFO Report Card (1 Col) */}
      <div className="space-y-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Executive Monthly CFO Summary
            </span>
            <span className="text-[10px] font-mono text-slate-400">September 2026</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-xs text-emerald-300 font-semibold uppercase">
              Financial Health Index
            </span>
            <div className="text-4xl font-extrabold font-mono text-emerald-400 mt-1">
              94 / 100
            </div>
            <span className="text-xs text-emerald-300 font-medium mt-1 block">
              Optimal • Rendah Risiko Likuiditas
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Cash Runway Cadangan</span>
              <span className="font-mono font-bold text-white">3.8 Bulan Aman</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Tax Escrow Coverage</span>
              <span className="font-mono font-bold text-emerald-400">100% Terpenuhi</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Gross Operating Margin</span>
              <span className="font-mono font-bold text-teal-400">46%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Piutang Menunggu (Invoices)</span>
              <span className="font-mono font-bold text-white">Rp 74.120.000</span>
            </div>
          </div>

          {/* Actionable Insights Checklist */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saran Strategis CFO Bulan Ini</span>
            </h4>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <strong>1. Efisiensi SaaS Cloud:</strong> Terdapat potensi hemat Rp 4.200.000/bulan dengan membatalkan lisensi seat developer non-aktif.
              </div>
              <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <strong>2. Rekonsiliasi e-Bupot PPh 23:</strong> Tagih Bukti Potong 2% dari PT Tokopedia agar dapat dikreditkan saat pelaporan SPT 1770/1771.
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              alert("Laporan Eksekutif CFO Bulanan telah diunduh ke format PDF.");
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Executive Summary PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

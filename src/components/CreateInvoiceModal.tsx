import React, { useState } from "react";
import { X, Plus, Trash2, FileText, CheckCircle2, DollarSign } from "lucide-react";
import { Invoice, Currency } from "../types";
import { formatMoney } from "../utils/formatters";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: Invoice) => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [clientName, setClientName] = useState("");
  const [clientNpwp, setClientNpwp] = useState("");
  const [currency, setCurrency] = useState<Currency>("IDR");
  const [applyPpn, setApplyPpn] = useState(true);
  const [applyPph23, setApplyPph23] = useState(true);
  const [dueDate, setDueDate] = useState("2026-10-15");

  const [items, setItems] = useState<Array<{ id: string; description: string; quantity: number; unitPrice: number }>>([
    {
      id: "item-1",
      description: "Jasa Konsultasi UI/UX & Fullstack Software Engineering",
      quantity: 1,
      unitPrice: 25000000,
    },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: "Layanan Pengembangan Fitur Tambahan",
        quantity: 1,
        unitPrice: 5000000,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const ppnAmount = applyPpn ? Math.round(subtotal * 0.11) : 0;
  const pph23Withholding = applyPph23 ? Math.round(subtotal * 0.02) : 0;
  const totalPayable = subtotal + ppnAmount - pph23Withholding;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV/2026/09/${Math.floor(100 + Math.random() * 900)}`,
      clientName,
      clientEmail: `finance@${clientName.toLowerCase().replace(/[^a-z0-9]/g, "") || "client"}.com`,
      clientNpwp: clientNpwp || undefined,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate,
      currency,
      subtotal,
      ppnRate: applyPpn ? 0.11 : 0,
      ppnAmount,
      pph23Rate: applyPph23 ? 0.02 : 0,
      pph23Withholding,
      totalPayable,
      status: "PENDING",
      paymentLinkUrl: `https://pay.fintax.ai/checkout/inv-${Date.now()}`,
      items: items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    };

    onSubmit(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Buat Invoice Pajak & Payment Link</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Klien / Perusahaan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PT Kreatif Digital Nusantara"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                NPWP / NIK Klien (Untuk e-Faktur/e-Bupot)
              </label>
              <input
                type="text"
                placeholder="Contoh: 01.382.910.4-012.000"
                value={clientNpwp}
                onChange={(e) => setClientNpwp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mata Uang Pembayaran
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none font-mono"
              >
                <option value="IDR">IDR (Rupiah Indonesia)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="SGD">SGD (Singapore Dollar)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tanggal Jatuh Tempo
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Rincian Layanan / Jasa
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>
            </div>

            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Deskripsi jasa..."
                  value={item.description}
                  onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                  className="flex-1 bg-transparent border-b border-slate-700 sm:border-none px-2 py-1 text-xs text-white focus:outline-none"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, "quantity", Number(e.target.value))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono"
                  />
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleUpdateItem(item.id, "unitPrice", Number(e.target.value))}
                    className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono text-right"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tax Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={applyPpn}
                onChange={(e) => setApplyPpn(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold text-white block">Tambahkan PPN 11%</span>
                <span className="text-[10px] text-slate-400">Terbit Faktur Pajak Resmi DJP</span>
              </div>
            </label>

            <label className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={applyPph23}
                onChange={(e) => setApplyPph23(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold text-white block">Potongan PPh 23 (2%)</span>
                <span className="text-[10px] text-slate-400">Klien setor bukti potong e-Bupot</span>
              </div>
            </label>
          </div>

          {/* Totals Breakdown */}
          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal (DPP):</span>
              <span className="font-mono text-white">{formatMoney(subtotal, currency)}</span>
            </div>
            {applyPpn && (
              <div className="flex justify-between text-slate-400">
                <span>+ PPN 11%:</span>
                <span className="font-mono text-emerald-400">{formatMoney(ppnAmount, currency)}</span>
              </div>
            )}
            {applyPph23 && (
              <div className="flex justify-between text-slate-400">
                <span>- Pemotongan PPh 23 (2% Kredit Pajak):</span>
                <span className="font-mono text-teal-400">({formatMoney(pph23Withholding, currency)})</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
              <span>Total Tagihan Bersih Dibayar Klien:</span>
              <span className="font-mono text-emerald-400">{formatMoney(totalPayable, currency)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Terbitkan Invoice & Payment Link</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

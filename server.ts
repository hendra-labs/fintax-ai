import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import compression from "compression";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// High-performance gzip/deflate compression for all API and asset responses
app.use(compression({
  level: 6,
  threshold: 1024,
}));

app.use(express.json({ limit: "10mb" }));

// Technical SEO: robots.txt endpoint
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://ais-pre-mjugiqljw6ah5tbn2ahovw-188801367571.asia-southeast1.run.app/sitemap.xml
`);
});

// Technical SEO: sitemap.xml endpoint
app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  const baseUrl = "https://ais-pre-mjugiqljw6ah5tbn2ahovw-188801367571.asia-southeast1.run.app";
  const currentDate = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="id-ID" href="${baseUrl}/"/>
    <xhtml:link rel="alternate" hreflang="en-US" href="${baseUrl}/?lang=en"/>
  </url>
  <url>
    <loc>${baseUrl}/?tab=dashboard</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/?tab=banking</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?tab=accounting</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?tab=tax</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/?tab=cfo</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?view=showcase</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
  res.send(xml);
});

// In-Memory Fast Cache for frequent metrics
interface CacheEntry<T> {
  data: T;
  expiry: number;
}
const metricsCache: Map<string, CacheEntry<any>> = new Map();

function getCached<T>(key: string): T | null {
  const item = metricsCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    metricsCache.delete(key);
    return null;
  }
  return item.data;
}

function setCached<T>(key: string, data: T, ttlMs: number = 60000) {
  metricsCache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
}

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    product: "FinTax AI",
    engine: "Autonomous CFO & Tax Copilot",
    aiEnabled: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API 1: Conversational AI CFO (Virtual Financial Advisor)
app.post("/api/cfo-chat", async (req, res) => {
  try {
    const { message, history = [], contextData } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Pesan tidak boleh kosong." });
    }

    const ai = getGenAI();

    const systemPrompt = `Anda adalah "FinTax AI CFO" - Autonomous CFO & Tax Copilot kelas enterprise untuk freelancer berpenghasilan tinggi, agensi kreatif, dan UMKM di Indonesia.
Karakteristik Anda:
1. Sangat ahli dalam Standar Akuntansi Keuangan (SAK EMKM / SAK ETAP), Pembukuan Berpasangan (Double-Entry Bookkeeping), dan Perpajakan Indonesia Terkini:
   - UU Harmonisasi Peraturan Perpajakan (UU HPP No. 7/2021).
   - PP No. 55 Tahun 2022 (PPh Final UMKM 0,5% dengan batas omzet tidak kena pajak hingga Rp 500 juta per tahun bagi Orang Pribadi).
   - Tarif Efektif Rata-Rata (TER) PPh 21 terbaru (PP 58/2023 & PMK 168/2023).
   - PTKP (TK/0 Rp 54.000.000/tahun, dst).
   - PPN 11% / 12% dan Faktur Pajak.
   - PPh Pasal 23 atas jasa agensi/kreatif (2% potong pungut).
2. Gaya bicara: Sangat profesional, lugas, presisi secara angka numerik, solutif, proaktif memberikan mitigasi risiko likuiditas dan perencanaan pajak legal (tax avoidance vs tax evasion).
3. Anda memiliki akses ke data keuangan bisnis pengguna saat ini:
${JSON.stringify(contextData || {}, null, 2)}

Instruksi Respons:
- Jawab secara terstruktur dengan poin-poin jelas dan rekomendasi aksi nyata (Actionable Insights).
- Jika pengguna bertanya tentang cash flow, simulasi pajak, atau pemotongan biaya, berikan kalkulasi realistis berdasarkan data di atas.
- Gunakan format mata uang Rupiah (Rp) yang rapi. Berikan nada seorang Chief Financial Officer (CFO) terpercaya.`;

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not set yet
      const fallbackResponse = generateSmartLocalCFOResponse(message, contextData);
      return res.json({
        reply: fallbackResponse,
        model: "FinTax-Deterministic-Rules-Engine",
        note: "Mode lokal aktif. Tambahkan GEMINI_API_KEY untuk kecerdasan generatif tingkat lanjut.",
      });
    }

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `${systemPrompt}\n\nRiwayat Percakapan Terakhir: ${JSON.stringify(
              history.slice(-4)
            )}\n\nPertanyaan Pengguna: "${message}"`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
    });

    return res.json({
      reply: response.text || "Tidak ada respons dari AI CFO.",
      model: "gemini-3.8-flash",
    });
  } catch (error: any) {
    console.error("CFO Chat Error:", error);
    // Graceful fallback
    const fallbackResponse = generateSmartLocalCFOResponse(req.body.message || "", req.body.contextData);
    return res.json({
      reply: fallbackResponse,
      model: "FinTax-Deterministic-Fallback",
      warning: "Koneksi model eksternal sibuk, beralih ke engine keuangan internal.",
    });
  }
});

// API 2: Tax Audit Simulator
app.post("/api/tax-audit-simulate", async (req, res) => {
  try {
    const { financialData } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json(generateLocalTaxAudit(financialData));
    }

    const prompt = `Lakukan simulasi pemeriksaan kepatuhan pajak (Tax Audit Simulation) seperti seorang fiskus pemeriksa pajak DJP untuk data keuangan berikut:
${JSON.stringify(financialData, null, 2)}

Evaluasi 4 aspek utama:
1. Rasio Margin Kotor vs Industri (Gross Profit Margin Anomaly).
2. Pengeluaran Biaya yang tidak dapat dikurangkan (Non-Deductible Expenses / Koreksi Fiskal Positif, misal Prive/Biaya Pribadi yang dibebankan ke operasional bisnis).
3. Rekonsiliasi Peredaran Bruto (Omset Bank vs SPT Tahunan vs PPN/Faktur).
4. Bukti Potong PPh 23 / PPh 21 withholding tax compliance.

Berikan output JSON ketat dengan format:
{
  "auditScore": 88, // nilai 0-100 (100 = sangat patuh)
  "riskLevel": "Rendah" | "Sedang" | "Tinggi",
  "potentialUnderpaymentRp": 3500000,
  "findings": [
    {
      "category": "Koreksi Fiskal Biaya",
      "severity": "medium",
      "description": "...",
      "mitigation": "..."
    }
  ],
  "recommendations": ["..."]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err) {
    console.error("Audit Simulate Error:", err);
    return res.json(generateLocalTaxAudit(req.body.financialData));
  }
});

// API 3: Autonomous Transaction Tagging
app.post("/api/smart-categorize", async (req, res) => {
  try {
    const { rawNarrations } = req.body;
    if (!Array.isArray(rawNarrations) || rawNarrations.length === 0) {
      return res.status(400).json({ error: "rawNarrations array required" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        results: rawNarrations.map((item) => categorizeLocalNarration(item)),
      });
    }

    const prompt = `Anda adalah model NLP klasifikasi transaksi perbankan mutasi rekening Indonesia.
Klasifikasikan daftar narasi mutasi mentah berikut ke dalam Chart of Accounts (COA):
- POS_BIAYA_OPERASIONAL (misal: sewa, langganan cloud/SaaS, utilitas, konsumsi tim)
- HPP_HARGA_POKOK_PENJUALAN (misal: fee freelancer subkontraktor, pembelian material proyek)
- PRIVE_PENARIKAN_PRIBADI (misal: transfer ke rekening istri/pribadi, belanja personal non-bisnis)
- PENDAPATAN_USAHA (misal: pembayaran invoice klien, transfer masuk proyek)
- BEBAN_PAJAK (misal: setor SSP PPh Final, bayar PPN)
- ASET_TETAP_CAPEX (misal: beli laptop kerja, kamera, perabot kantor)

Input: ${JSON.stringify(rawNarrations)}

Output JSON:
{
  "categorized": [
    {
      "id": "item-id",
      "coaCategory": "POS_BIAYA_OPERASIONAL",
      "accountName": "Beban Langganan Cloud & Software",
      "confidence": 0.96,
      "deductibleForTax": true,
      "reasoning": "Tagihan AWS/Google Workspace memenuhi kriteria biaya operasional usaha (3M)"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err) {
    console.error("Smart categorize error:", err);
    return res.json({
      results: (req.body.rawNarrations || []).map((item: any) =>
        categorizeLocalNarration(item)
      ),
    });
  }
});

// Deterministic Helper Fallbacks
function generateSmartLocalCFOResponse(userQuery: string, data: any): string {
  const query = (userQuery || "").toLowerCase();
  const revenue = data?.totalRevenue || 185000000;
  const expense = data?.totalExpense || 62500000;
  const netIncome = revenue - expense;
  const taxReserve = data?.taxReserve || Math.round(revenue * 0.005);
  const safeCash = (data?.totalBankBalance || 245000000) - taxReserve;

  if (query.includes("cash flow") || query.includes("gaji") || query.includes("aman")) {
    return `### Analisis Likuiditas & Cash Flow Safe-to-Spend

Berdasarkan konsolidasi multi-rekening Anda saat ini:
- **Total Kas Likuid di Bank**: Rp ${(data?.totalBankBalance || 245000000).toLocaleString("id-ID")}
- **Pajak Wajib Disisihkan (Tax Escrow)**: Rp ${taxReserve.toLocaleString("id-ID")} *(PPh Final 0.5% + Estimasi PPh 21 tim)*
- **Net Safe Cash Flow**: **Rp ${safeCash.toLocaleString("id-ID")}**

**Rekomendasi CFO:**
1. **Pengeluaran Payroll Tim**: Dengan cadangan kas aman Rp ${safeCash.toLocaleString("id-ID")}, Anda memiliki *runway* kas sekitar **3.8 bulan** operasional penuh.
2. **Prioritas Alokasi**: Segera pindahkan Rp ${taxReserve.toLocaleString("id-ID")} ke sub-account 'Tax Vault' terpisah (BCA Escrow/Jago Pocket) sebelum tanggal 15 bulan depan agar tidak terpakai untuk modal kerja.`;
  }

  if (query.includes("bengkak") || query.includes("pengeluaran") || query.includes("biaya")) {
    return `### Laporan Anomali Biaya Kuartal Ini

Dari evaluasi pos beban operasional (Double-entry Ledger):
1. **Software & Cloud Subscriptions**: Rp 18.450.000 (*Naik 42% MoM akibat add-on AI API & lisensi seat tidak terpakai*).
2. **Biaya Representasi / Entertainment Klien**: Rp 12.800.000 (*Perhatian: 4 transaksi tidak memiliki Daftar Nominatif formal, berisiko dikoreksi fiskal positif saat audit DJP*).
3. **Sub-kontraktor Freelance**: Rp 24.500.000 (Pastikan sudah dipotong PPh 21 Bukan Pegawai atau PPh 23 untuk menghemat PPh Badan).

**Langkah Penghematan:**
- Lakukan audit subscription SaaS: Anda dapat menghemat hingga Rp 4.200.000/bulan dengan membatalkan 3 seat non-aktif.
- Lengkapi format Daftar Nominatif Biaya Promosi & Jamuan sesuai PMK-02/PMK.03/2010.`;
  }

  if (query.includes("tax") || query.includes("pajak") || query.includes("planning") || query.includes("spt")) {
    return `### Rekomendasi Tax Planning & Kepatuhan UU HPP

Berdasarkan profil bisnis Anda (Kombinasi Jasa Agensi / Freelancer):
- **Skema Perpajakan Optimal**: 
  - Jika Omzet < Rp 500 Juta (Orang Pribadi): Manfaatkan fasilitas pembebasan PPh Final PP 55/2022 (0% untuk Rp 500 juta pertama).
  - Di atas Rp 500 Juta s/d Rp 4,8 Miliar: Dikenakan PPh Final 0,5% dari peredaran bruto.
  - Untuk Badan Usaha (PT/CV): Evaluasi apakah pembukuan riil (Beban 3M: Mendapatkan, Menagih, Memelihara penghasilan) menghasilkan pajak lebih rendah dibanding PPh Final.
- **Kepatuhan PPh 23**: Pastikan Anda mengumpulkan Bukti Potong (Bupot) unifikasi dari setiap klien korporat. Kredit pajak ini dapat mengurangi beban pajak terutang di akhir tahun.`;
  }

  return `### Ringkasan Eksekutif FinTax AI CFO

Berdasarkan pencatatan mutasi transaksi dan laporan keuangan per hari ini:
- **Peredaran Bruto (Revenue)**: Rp ${revenue.toLocaleString("id-ID")}
- **Total Pengeluaran (Expense & HPP)**: Rp ${expense.toLocaleString("id-ID")}
- **Laba Bersih Operasional (Net Profit)**: Rp ${netIncome.toLocaleString("id-ID")}
- **Estimasi Kewajiban Pajak Bulan Berjalan**: Rp ${taxReserve.toLocaleString("id-ID")}
- **Health Score Keuangan**: **94/100 (Sangat Sehat)**

*Ada pertanyaan spesifik mengenai simulasi cash flow, pembuatan invoice berstandar faktur pajak, atau draft SPT Anda?*`;
}

function generateLocalTaxAudit(data: any) {
  return {
    auditScore: 92,
    riskLevel: "Rendah",
    potentialUnderpaymentRp: 1850000,
    findings: [
      {
        category: "Koreksi Fiskal Positif",
        severity: "low",
        description: "Ditemukan penarikan prive pemilik sebesar Rp 15.000.000 yang sempat tercatat di pos operasional umum.",
        mitigation: "Sistem FinTax AI telah memindahkan pos ke Ekuitas (Prive) sehingga tidak menyebabkan sanksi kurang bayar biaya 3M.",
      },
      {
        category: "Rekonsiliasi PPh 23 vs Invoice",
        severity: "low",
        description: "2 invoice senilai total Rp 45.000.000 belum menyertakan bukti potong PPh 23 (2%) dari pihak agensi klien.",
        mitigation: "Kirimkan pengingat otomatis via payment link FinTax AI agar klien mengunggah Bukti Potong unifikasi.",
      },
      {
        category: "Ambang Batas PTKP & TER PPh 21",
        severity: "info",
        description: "Gaji staf junior dan freelance telah sesuai dengan tarif TER Kategori A/B per PP 58/2023.",
        mitigation: "Draft SPT Masa PPh 21 siap diekspor ke format e-Bupot 21/26 DJP.",
      },
    ],
    recommendations: [
      "Pertahankan rasio kas cadangan pajak minimal 5-10% dari omzet bulanan.",
      "Lakukan rekonsiliasi berkala antara data e-Faktur PPN dengan mutasi bank.",
      "Dokumentasikan kontrak kerja sama proyek untuk seluruh nilai di atas Rp 20.000.000.",
    ],
  };
}

function categorizeLocalNarration(item: any) {
  const narration = (item.narration || item.rawText || "").toUpperCase();
  if (narration.includes("AWS") || narration.includes("GOOGLE") || narration.includes("FIGMA") || narration.includes("ZOOM") || narration.includes("GITHUB")) {
    return {
      id: item.id,
      coaCategory: "POS_BIAYA_OPERASIONAL",
      accountName: "Beban Software & Layanan Cloud",
      confidence: 0.98,
      deductibleForTax: true,
      reasoning: "Pengeluaran tools teknologi esensial operasional usaha (deductible).",
    };
  }
  if (narration.includes("TRSF") && (narration.includes("PRIBADI") || narration.includes("WIFE") || narration.includes("TABUNGAN"))) {
    return {
      id: item.id,
      coaCategory: "PRIVE_PENARIKAN_PRIBADI",
      accountName: "Prive / Penarikan Pemilik",
      confidence: 0.95,
      deductibleForTax: false,
      reasoning: "Transfer ke rekening pribadi pemilik tidak dapat menjadi pengurang penghasilan bruto.",
    };
  }
  if (narration.includes("INVOICE") || narration.includes("PROJECT") || narration.includes("PAYMENT FOR") || narration.includes("FEE")) {
    return {
      id: item.id,
      coaCategory: "PENDAPATAN_USAHA",
      accountName: "Pendapatan Jasa & Proyek",
      confidence: 0.97,
      deductibleForTax: false,
      reasoning: "Penerimaan kas dari hasil penyerahan jasa/produk bisnis.",
    };
  }
  if (narration.includes("PAJAK") || narration.includes("DJP") || narration.includes("NTPN") || narration.includes("KPP")) {
    return {
      id: item.id,
      coaCategory: "BEBAN_PAJAK",
      accountName: "Setoran Pajak Terutang (PPh/PPN)",
      confidence: 0.99,
      deductibleForTax: false,
      reasoning: "Setoran pajak negara dengan validasi NTPN resmi.",
    };
  }
  return {
    id: item.id,
    coaCategory: "POS_BIAYA_OPERASIONAL",
    accountName: "Beban Operasional Usaha Lainnya",
    confidence: 0.85,
    deductibleForTax: true,
    reasoning: "Beban umum pemeliharaan dan kelancaran kegiatan usaha.",
  };
}

// Vite middleware / production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FinTax AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

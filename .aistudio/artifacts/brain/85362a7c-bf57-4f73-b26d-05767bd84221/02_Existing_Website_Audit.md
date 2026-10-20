# P01 --- Existing Website Audit

## 1. Status Dokumen
- **Dokumen ID:** P01
- **Judul:** Existing Website Audit: Gann-Lunar Architect Stack & Architecture Verification
- **Status:** `APPROVED_VERIFIED`
- **Tanggal:** 2026-10-19
- **Versi:** 2.0.0
- **Coding Authorization:** **BLOCKED / NOT AUTHORIZED** (Mapping-First Phase)

---

## 2. Bukti Faktual Repositori (VERIFIED FACT)
Audit dilakukan langsung terhadap artefak repositori yang tersedia di workspace root:
- **Manifest / Package File:** `package.json`
- **Backend Entry Point:** `server.ts`
- **Frontend Entry & Routing:** `index.html`, `src/App.tsx`
- **State & Hooks:** `src/hooks/useMarketState.ts`
- **UI Components & Tabs:** `src/components/`, `src/components/tabs/`
- **Utility Modules:** `src/utils/gann.ts`, `src/utils/indicators.ts`, `src/utils/backtest.ts`

---

## 3. Rincian Temuan Audit Website Eksisting

### A. Frontend Stack & UI Architecture
- **Framework & Build:** React 19 (`react`, `react-dom`) dengan Vite (`vite`, `@vitejs/plugin-react`).
- **Styling Engine:** Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss`).
- **State Management & Routing:** Navigasi berbasis tab (*single-page application tab switcher*) yang dikelola melalui custom hook pusat `src/hooks/useMarketState.ts`.
- **Code-Splitting:** Komponen tab utama dimuat secara dinamis menggunakan `React.lazy` dan dibungkus `<Suspense>` untuk optimalisasi ukuran bundle.

### B. Backend Stack & Service Layer
- **Runtime / Server:** Node.js dengan kerangka kerja Express (`express`, `dotenv`, dijalankan dengan `tsx` di mode development).
- **API Endpoints Eksisting (`server.ts`):**
  1. `POST /api/gann/analyze` — Endpoint analisis Gann Square of 9 menggunakan Google GenAI SDK (`@google/genai`) model `gemini-3.8-flash`.
  2. `POST /api/oracle/analyze` — Endpoint keputusan eksekutif 4D Market Oracle (Harga, Waktu, Ruang, Psikologi) menggunakan model `gemini-3.8-flash`.
  3. `GET /api/market/live-prices` — Endpoint polling harga live/fallback dengan penanda sumber data (`source: 'live' | 'fallback'`).
- **Kunci API & Keamanan:** Kunci rahasia API (`GEMINI_API_KEY`) diisolasi di sisi server melalui variabel lingkungan (`.env.example`), tidak pernah terekspos di client-side bundle.

### C. Penyimpanan & Data Persistence
- **Client-Side Storage:** Menggunakan `localStorage` untuk menyimpan riwayat buffer harga (`gann_price_history_v2`) dan jurnal trading (*market snapshots*).
- **Server-Side Database:** Belum ada database relasional/NoSQL server-side yang terkonfigurasi saat ini (*stateless backend* untuk endpoint AI & polling harga).

---

## 4. Analisis Titik Integrasi (Integration Boundaries)
Untuk menyematkan **Quantitative Fundamental Analysis Engine** ke dalam website eksisting tanpa merusak fungsionalitas yang ada, titik integrasi dirancang sebagai berikut:
1. **Tab Baru (`FundamentalTab.tsx`):** Ditambahkan ke dalam direktori `src/components/tabs/`, di-register ke tipe `TabType`, dan di-load via `React.lazy` di `src/App.tsx`.
2. **Backend Services & Routes Baru:** Menambahkan modul backend di `server.ts` atau router terpisah untuk mengelola fetch data makro (FOMC, NFP, CPI, PPI), perhitungan *economic surprise*, dan endpoint *AI grounding explanation*.
3. **Penyimpanan Data Fundamental:** Mengingat arsitektur saat ini belum memiliki database server-side, spesifikasi teknis di P03 dan P07 harus mendefinisikan skema penyimpanan persistensi data makro (misal: JSON file store atau integrasi database masa depan) untuk menjaga integritas histori rilis.

---

## 5. Status Verifikasi & Kesenjangan (NOT VERIFIED / OPEN FOR P02)
- Kalender ekonomi historis tier-1 beserta stempel waktu pra-rilis konsensus belum tersedia di repositori eksisting (harus dispesifikasikan pada P03 - Data Specification).

---

## 6. Approval Gate P01
- **Status Gate:** `APPROVED`
- **Pemberi Persetujuan:** Project Owner / Stakeholder
- **Catatan:** Audit website telah diverifikasi berdasarkan bukti faktual kode aktual. Lanjutkan ke fase P02 (`03_Product_Requirements.md`).

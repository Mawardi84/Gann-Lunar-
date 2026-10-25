# 🏛️ Gann-Lunar Architect: Executive 4D Trading Platform

![Gann-Lunar Architect](public/pwa-512x512.png)

**Gann-Lunar Architect** adalah platform trading algoritmik tingkat eksekutif yang memetakan probabilitas pasar menggunakan **Sinkronisasi Matriks 4 Dimensi**:
1. **Harga (Price)**: W.D. Gann Square of 9 & Level Fibonacci Retracement ($0.5, 0.618$).
2. **Waktu (Time)**: Siklus Lunar astronomis (Metode Conway/Meeus) & Jendela Volatilitas Bulan Baru / Purnama.
3. **Ruang (Space)**: Vektor pergerakan harga Pythagoras & Sudut Harmonis Gann ($30^\circ, 45^\circ, 60^\circ$).
4. **Psikologi (Psychology)**: Pola Candlestick Munehisa Homma (Pin Bar, Engulfing) & **AI Behavioral Bias Analysis** (Gemini 3.8 Flash).

---

## 🌟 Fitur Utama (Key Features)

### 1. 🔮 4D Oracle Decision Engine
- Saringan 4 dimensi otomatis dengan rekomendasi eksekusi bi-directional (**BUY / LONG** & **SELL / SHORT**).
- Penempatan Stop Loss dan multi-tier Take Profit (TP1, TP2, TP3) berbasis level matematis Gann Square of 9.
- Integrasi analisis skenario pasar mendalam bertenaga **Gemini 3.8 Flash**.

### 2. 🧠 AI Trading Psychology & Behavioral Sentiment Analysis
- **Diagnostik Bias Otomatis**: Mendeteksi kebiasaan *Over-Trading*, *FOMO*, *Revenge Trading*, dan *Loss Aversion* dari catatan jurnal pengguna.
- **Skor Kesehatan Psikologis (0-100)**: Evaluasi tingkat kedisiplinan dan kontrol emosi trader.
- **Laporan Aksionabel**: Langkah perbaikan konkret secara personal untuk meningkatkan performa trading.

### 3. 📖 Executive Trading Journal & Performance Analytics
- Fitur pencatatan transaksi ganda: *Entries List View* & *Summary Analytics View*.
- Rapor performa real-time: **Win/Loss Ratio**, **Win Rate %**, **Profit Factor**, **Expectancy**, & **Average Win/Loss**.
- **Fitur Ekspor JSON Backup**: Pengunduhan lokal data jurnal secara aman dengan satu klik.

### 4. 📅 Kalender Ekonomi & Nowcast Inflasi Real-Time
- Integrasi API NASDAQ Economic Calendar & Cleveland Fed Inflation Nowcast.
- Countdown event makro utama (CPI, NFP, FOMC) dengan indikator blackout volatilitas Gann.

### 5. 📱 Progressive Web App (PWA) Support
- **Installable Desktop & Mobile App**: Install langsung ke Layar Utama (*Home Screen*) Android, iOS (Safari), dan Desktop Chromium.
- **Offline Caching & Service Worker**: Didukung oleh `vite-plugin-pwa` & `workbox` untuk akses instan di koneksi rendah/offline.
- **In-App Install Prompt**: Tombol instalasi otomatis di header aplikasi (`PWAInstallButton`).

---

## 🛠️ Arsitektur Teknikal (Technical Stack)

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4.
- **Design System**: Flat Terminal Aesthetic (`rounded-md`, `border-slate-800`, `font-mono tabular-nums`).
- **AI Engine**: `@google/genai` TypeScript SDK (Server-Side integration via `gemini-3.8-flash`).
- **Backend Proxy**: Node.js Express server (`server.ts`).
- **Unit Testing**: Node test runner (`node:test`) dengan 100% pass rate di seluruh suite pengujian.
- **PWA Tooling**: `vite-plugin-pwa` dengan Service Worker precaching & Web App Manifest.

---

## 🚀 Jalankan Aplikasi Secara Lokal (Local Development)

### Prerequisites
- Node.js v18+ dan `npm`

### Langkah Instalasi
```bash
# 1. Clone repository
git clone https://github.com/user/gann-lunar-architect.git
cd gann-lunar-architect

# 2. Install dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev
```

Aplikasi akan berjalan pada `http://localhost:3000`.

### Perintah Penting
- `npm run dev`: Jalankan server dev Express + Vite middleware.
- `npm run build`: Build aplikasi untuk produksi.
- `npm run lint`: Jalankan linter strict TypeScript (`tsc --noEmit`).
- `npm test`: Jalankan seluruh suite unit test.

---

## 📄 Lisensi
Di bawah lisensi **Apache-2.0**.

# P08 --- Validation & Backtest Plan

## 1. Status Dokumen
- **Dokumen ID:** P08
- **Judul:** Validation & Backtest Plan: Quantitative Fundamental Analysis Engine
- **Status:** `IN_REVIEW`
- **Tanggal:** 2026-10-19
- **Versi:** 1.0.0
- **Coding Authorization:** **BLOCKED / NOT AUTHORIZED** (Mapping-First Phase)

---

## 2. Metodologi Event Study & Baseline
1. **Event Study Design:** Mengukur respons harga XAU/USD ($r_{t,h}$) di sekitar stempel waktu rilis event ($t_0$) pada horizon 15 menit, 1 jam, 4 jam, dan 1 hari.
2. **Baseline Comparison:** Membandingkan performa model prediksi berbasis $Z$-score terhadap *naive baseline* (rata-rata pergerakan historis tanpa informasi rilis makro).

---

## 3. Validasi Kronologis & Pengendalian Leakage
1. **Chronological Splits:** Pemisahan data historis secara ketat menjadi set pelatihan (*train*), validasi (*validation*), dan pengujian keluar sampel (*out-of-sample test*) secara kronologis.
2. **Leakage Audit:** Memeriksa bahwa tidak ada data konsensus atau nilai aktual pascarilis yang mencemari data pelatihan.

---

## 4. Penanganan Revisi dan Overlapping Events
1. **Revisied Data Handling:** Evaluasi menggunakan data awal rilis pertama (*real-time vintage data*) untuk menghindari keunggulan informasi dari revisi masa depan.
2. **Overlapping Events:** Jika dua event besar terjadi berdekatan (misalnya CPI dan FOMC dalam minggu yang sama), event dikategorikan sebagai *multi-event window* dan diberi bobot khusus atau pengecualian statistik agar efek masing-masing tidak saling mengaburkan.

---

## 5. Metrik Performa Out-of-Sample & Drift Monitoring
- **Metrik:** *Mean Absolute Error* (MAE), *Root Mean Square Error* (RMSE), serta akurasi arah (*directional accuracy*).
- **Drift Monitoring:** Pemantauan berkala terhadap kestabilan distribusi *economic surprise* untuk mendeteksi pergeseran rezim pasar (*data drift*).
- **Catatan Pelaporan:** Sesuai aturan, hasil backtest **tidak akan dilaporkan** sebelum pengujian benar-benar dijalankan pasca-otorisasi coding.

---

## 6. Approval Gate P08
- **Status Gate:** `PENDING_REVIEW`
- **Pemberi Persetujuan:** Project Owner / Stakeholder
- **Catatan:** Lanjutkan ke fase P09 (`10_Acceptance_Criteria.md`) setelah Validation & Backtest Plan ini disetujui.

# P02 --- Product Requirements

## 1. Status Dokumen
- **Dokumen ID:** P02
- **Judul:** Product Requirements Specification: Quantitative Fundamental Analysis Engine
- **Status:** `IN_REVIEW`
- **Tanggal:** 2026-10-19
- **Versi:** 1.0.0
- **Coding Authorization:** **BLOCKED / NOT AUTHORIZED** (Mapping-First Phase)

---

## 2. User Stories (MVP)
1. **Sebagai Quantitative Trader**, saya ingin melihat kalender ekonomi rilis tier-1 AS (FOMC, NFP, CPI, PPI) yang terstruktur dan dilengkapi stempel waktu UTC, sehingga saya dapat bersiap menghadapi volatilitas XAU/USD secara terjadwal.
2. **Sebagai Analis Pasar**, saya ingin membandingkan nilai *Actual*, *Consensus*, *Previous*, dan *Revised Previous* dari setiap rilis ekonomi untuk menghitung skor kejutan (*economic surprise*) secara objektif tanpa bias *look-ahead*.
3. **As a Professional Trader**, saya ingin melihat ringkasan konteks fundamental XAU/USD (faktor pendukung vs penekan emas) serta penjelasan AI yang bersumber langsung pada dokumen rilis resmi (*source-grounded*), sehingga analisis saya dapat diaudit.
4. **Sebagai Risk Manager**, saya ingin sistem mengenali kondisi data tidak lengkap (`INSUFFICIENT_DATA`, `MIXED`) dan menampilkan status kualitas data secara transparan alih-alih memaksakan sinyal palsu.

---

## 3. Alur Pengguna (Pre-Event, During-Event, Post-Event Workflows)

### A. Pre-Event (Sebelum Rilis)
- **Tampilan:** Kalender menampilkan event mendatang (misal: NFP dalam 2 jam). Kolom *Actual* bertuliskan `PENDING` atau `-`, sedangkan kolom *Consensus* menampilkan ekspektasi pasar (misal: 185K) dengan stempel waktu pra-rilis terverifikasi.
- **Tindakan Pengguna:** Pengguna dapat meninjau ekspektasi konsensus, nilai *previous*, dan revisi bulan lalu, serta membaca catatan analisis konteks makro sebelumnya.

### B. During-Event (Saat Rilis - Real-Time)
- **Tampilan:** Begitu data aktual dipublikasikan, sistem melakukan *ingestion*, memperbarui status menjadi `LIVE` atau `RELEASED`, dan mengisi nilai *Actual* (misal: 220K).
- **Kalkulasi Otomatis:** Sistem langsung menghitung *Surprise* ($S_t = A_t - F_t$) dan $Z$-score, serta memicu rangkuman AI grounded.

### C. Post-Event (Setelah Rilis)
- **Tampilan:** Menampilkan kartu hasil rilis, skor *economic surprise* (positif/negatif/netral), tabel konteks fundamental XAU/USD, grafik respons harga historis (horizon 15m, 1h, 4h, 1d), dan penjelasan AI dengan sitasi dokumen resmi.
- **Histori:** Data disimpan ke log histori analisis untuk referensi backtest event masa depan.

---

## 4. Spesifikasi Fungsional MVP
1. **Kalender & Detail Event:** Filter berdasarkan jenis event (FOMC, NFP, CPI, PPI) dan rentang waktu.
2. **Economic Surprise Engine:** Perhitungan matematis transparan ($A_t - F_t$ dan normalisasi deviasi).
3. **Analisis Dampak XAU/USD:** Pemetaan hubungan fundamental makro terhadap emas (contoh: NFP kuat -> inflasi tenaga kerja -> ekspektasi suku bunga tinggi -> tekanan bearish jangka pendek pada XAU, atau sebaliknya dengan konteks lindung nilai inflasi).
4. **AI Explanation (Grounded):** Menghasilkan penjelasan kualitatif yang merujuk pada dokumen resmi, tanpa mengubah angka mentah atau membuat prediksi harga mutlak.
5. **Manajemen State / UI States:**
   - **Loading State:** Indikator skeleton saat memuat data kalender atau menunggu respons AI.
   - **Error State:** Pesan kegagalan koneksi dengan tombol *Retry* otomatis/manual.
   - **Empty State:** Pemberitahuan jika tidak ada event dalam filter yang dipilih.
   - **Data Quality States:** Label `VERIFIED`, `ESTIMATED`, `DISPUTED`, atau `INSUFFICIENT_DATA`.

---

## 5. Fitur Lanjutan (Advanced Scope - Pasca MVP)
- Kalibrasi probabilitas arah pergerakan harga (*direction probability*) setelah out-of-sample backtest.
- Deteksi rezim makroekonomi (*macro regime detection*).
- Analisis lintas-aset interaktif (Treasury yields, real yields, DXY).
- Event-risk alerts dan monitoring *data drift*.

---

## 6. Acceptance-Level User Journeys
- **Journey 1 (Cek Kalender & Konsensus):** Pengguna membuka tab Fundamental, memilih event NFP, melihat konsensus pra-rilis dengan stempel waktu yang valid tanpa kontaminasi data pascarilis. (*Pass jika stempel waktu terverifikasi*).
- **Journey 2 (Evaluasi Surprise & AI Grounding):** Setelah rilis NFP aktual, pengguna melihat skor surprise, konteks dampak XAU/USD, dan teks penjelasan AI yang mencantumkan referensi dokumen resmi. (*Pass jika AI tidak berhalusinasi dan merujuk data aktual*).

---

## 7. Approval Gate P02
- **Status Gate:** `PENDING_REVIEW`
- **Pemberi Persetujuan:** Project Owner / Stakeholder
- **Catatan:** Lanjutkan ke fase P03 (`04_Data_Specification.md`) setelah Product Requirements ini disetujui.

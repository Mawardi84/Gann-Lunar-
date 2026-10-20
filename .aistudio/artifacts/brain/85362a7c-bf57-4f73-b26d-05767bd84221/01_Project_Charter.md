# P00 --- Project Charter & Scope (Revised)

## 1. Status Dokumen
- **Dokumen ID:** P00
- **Judul:** Project Charter & Scope: Quantitative Fundamental Analysis Engine (XAU/USD)
- **Status:** `REVISED_PENDING_APPROVAL`
- **Tanggal:** 2026-10-19
- **Versi:** 2.0.0
- **Coding Authorization:** **BLOCKED / NOT AUTHORIZED** (Mapping-First Phase)

---

## 2. Problem Statement
Pasar emas global (**XAU/USD**) sangat sensitif terhadap rilis data makroekonomi utama Amerika Serikat (FOMC, NFP, CPI, PPI). Trader dan analis sering menghadapi tantangan berikut:
1. **Fragmentasi Data:** Data aktual, konsensus pra-rilis, nilai sebelumnya, dan revisi historis tersebar di berbagai sumber dan sering terlambat atau tidak terdokumentasi secara terstruktur.
2. **Ketiadaan Auditabilitas Konsensus:** Banyak platform menampilkan angka konsensus tanpa validasi stempel waktu pra-rilis (risiko *look-ahead bias* / kebocoran informasi pascarilis).
3. **Analisis Sentimen Subjektif:** Penilaian dampak data terhadap emas sering bersifat spekulatif tanpa model statistik berbasis *economic surprise* yang terukur ($Z$-score) dan konteks multi-faktor (yields, DXY, real yields).
4. **Keterbatasan AI:** Model AI generatif sering berhalusinasi atau memberikan rekomendasi absolut tanpa landasan data (*source grounding*) dan pengakuan batas ketidakpastian (`NO_CLEAR_BIAS`, `INSUFFICIENT_DATA`).

---

## 3. Visi Produk
Menghadirkan mesin analisis kuantitatif fundamental dan AI hibrida yang **dapat diaudit sepenuhnya (*fully auditable*)**, bebas bias *look-ahead*, berbasis data historis resmi, dan menyajikan skor surprise, konteks fundamental, serta interpretasi terstruktur untuk instrumen XAU/USD tanpa klaim profit atau eksekusi otomatis.

---

## 4. Tujuan (Objectives)
1. Menyediakan kalender ekonomi terstruktur untuk event tier-1 AS: **FOMC, NFP, CPI, dan PPI**.
2. Menyimpan dan memvalidasi stempel waktu rilis aktual vs konsensus pra-rilis, nilai sebelumnya, serta revisi historis.
3. Menghitung *Economic Surprise* secara statistik standar ($S_t = A_t - F_t$, $Z$-score).
4. Menghasilkan interpretasi AI yang bersumber pada dokumen resmi (*source-grounded explanation*).
5. Menyediakan manajemen status data (*data-quality status*) dan riwayat analisis yang transparan pada aplikasi eksisting.

---

## 5. Pengguna dan Use Cases (Users & Use Cases)
- **Quantitative Trader / Analis:** Membutuhkan data aktual vs konsensus historis yang akurat dan terstruktur untuk pengujian strategi berbasis event.
- **Retail Trader Profesional:** Ingin memahami dampak makroekonomi dan sentimen fundamental XAU/USD secara objektif melalui skor surprise dan penjelasan AI yang grounded.
- **Risk Manager:** Memerlukan audit trail rilis data, batasan kepercayaan model (`model confidence`), dan penanganan kondisi data tidak lengkap (`INSUFFICIENT_DATA`, `MIXED`).

---

## 6. Ruang Lingkup MVP (Minimum Viable Product)
Versi pertama (MVP) mencakup komponen esensial berikut:
- Kalender event tier-1 (FOMC, NFP, CPI, PPI).
- Pencatatan terstruktur: *Actual* vs *Consensus* vs *Previous* vs *Revised Previous*.
- Perhitungan skor *Economic Surprise* ($A_t - F_t$ dan $Z$-score historis).
- Konteks fundamental makro XAU/USD (tabel rangkuman faktor pendukung/penekan).
- Evaluasi respons harga historis (horizon 15m, 1h, 4h, 1d).
- AI Explanation berbasis rangkuman dokumen resmi dengan sitasi (*source-grounded explanation*).
- Status kualitas data, timestamp UTC, dan log histori analisis.
- Penanganan status netral/abu-abu (`NO_CLEAR_BIAS`, `INSUFFICIENT_DATA`).

*Catatan Probabilitas:* Estimasi probabilitas arah pergerakan harga (*direction probability*) **tidak** dimasukkan dalam MVP kecuali model statistik telah diuji, divalidasi out-of-sample, dan kalibrasinya dievaluasi. Sebelum tahap tersebut, sistem hanya menampilkan skor surprise, arah kualitatif, atau klasifikasi berbasis aturan dengan label yang jelas.

---

## 7. Ruang Lingkup Advanced (Setelah Evaluasi MVP)
- Kalibrasi probabilitas arah pergerakan harga (*direction probability*) berbasis out-of-sample backtest.
- Deteksi rezim makroekonomi (*macro regime detection*).
- Automated walk-forward backtest engine.
- Analisis ekspektasi suku bunga dan lintas-aset (Treasury yields, real yields, DXY).
- Event-risk alerts dan monitoring *data drift*.

---

## 8. Di Luar Ruang Lingkup (Out-of-Scope)
- **Auto-trading dan eksekusi order otomatis** di bursa/broker.
- Jaminan profit atau sinyal trading absolut.
- Konstruksi ulang konsensus historis menggunakan data pascarilis.
- Penggantian framework atau arsitektur dasar website eksisting tanpa audit pendukung.

---

## 9. Asumsi dan Ketergantungan Stack (PENDING AUDIT — P01)
1. **Stack Teknologi:** Pilihan framework frontend, bahasa, dan backend (seperti React/TypeScript atau Node.js/Express) dinyatakan **PENDING AUDIT — P01** dan tidak boleh dianggap sebagai fakta sebelum audit di fase P01 menyajikan bukti nyata dari repositori/artefak website eksisting.
2. Sumber data eksternal untuk kalender ekonomi dan konsensus pra-rilis diasumsikan tersedia melalui API/provider berlisensi atau arsip terverifikasi.
3. Pengguna memahami bahwa analisis ini bersifat informatif dan analitis, bukan nasihat keuangan.

---

## 10. Batasan dan Manajemen Risiko Data Kritis
1. **Mapping-First:** Seluruh spesifikasi harus didokumentasikan (P00 hingga P10) sebelum ada baris kode implementasi yang ditulis.
2. **Kepatuhan Waktu & Konsensus (Risiko Look-Ahead Bias):** Konsensus historis **wajib** memiliki bukti bahwa nilainya tersedia dan dicatat *sebelum rilis*. Jika bukti stempel waktu pra-rilis tidak tersedia, event tersebut ditandai tidak layak (*ineligible*) untuk evaluasi *economic surprise* historis; sistem dilarang merekonstruksi forecast menggunakan informasi pascarilis.
3. **Bahasa & Standar:** Menggunakan bahasa Indonesia profesional dan format Markdown terstruktur.

---

## 11. Risiko Awal (Initial Risks)
- **Risiko Data Konsensus Hilang/Tidak Tercatat:** Beberapa rilis historis mungkin tidak memiliki arsip konsensus pra-rilis yang bersih. Mitigasi: Tandai sebagai *missing consensus* dan masukkan ke dalam status data tidak lengkap (`INSUFFICIENT_DATA`).
- **Konflik Faktor Makro:** Emas sering bereaksi berbeda terhadap kombinasi inflasi dan suku bunga. Mitigasi: Terapkan aturan logika `MIXED` dan larangan kepastian mutlak oleh AI.

---

## 12. Definisi Selesai (Definition of Done - P00)
Dokumen Project Charter P00 dianggap selesai dan sah apabila memenuhi kriteria berikut:
1. Dokumen charter lengkap, terstruktur, dan mencakup seluruh poin wajib.
2. Ruang lingkup MVP dan out-of-scope terdefinisi secara eksplisit.
3. Asumsi dipisahkan dengan jelas dari fakta terverifikasi (stack teknologi ditandai *PENDING AUDIT — P01*).
4. Risiko utama (khususnya *look-ahead bias* pada konsensus historis) tercatat beserta mitigasinya.
5. Mendapatkan persetujuan eksplisit (*approval*) dari pemilik proyek.

---

## 13. Approval Gate P00 (Revisi)
- **Status Gate:** `PENDING_REVIEW` (Menunggu persetujuan setelah revisi)
- **Pemberi Persetujuan:** Project Owner / Stakeholder
- **Catatan:** Setelah revisi ini disetujui, kita akan resmi melangkah ke fase P01 (`02_Existing_Website_Audit.md`) untuk mengaudit website eksisting berdasarkan bukti aktual (bukan asumsi).

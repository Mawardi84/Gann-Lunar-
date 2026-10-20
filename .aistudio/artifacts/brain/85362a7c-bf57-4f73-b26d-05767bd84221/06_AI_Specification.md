# P05 --- Hybrid AI Specification

## 1. Status Dokumen
- **Dokumen ID:** P05
- **Judul:** Hybrid AI Specification: Quantitative Fundamental Analysis Engine
- **Status:** `IN_REVIEW`
- **Tanggal:** 2026-10-19
- **Versi:** 1.0.0
- **Coding Authorization:** **BLOCKED / NOT AUTHORIZED** (Mapping-First Phase)

---

## 2. Peran AI yang Diizinkan vs Dilarang

### A. Tugas AI yang Diizinkan (Allowed Tasks)
1. **Rangkuman Dokumen Resmi:** Meringkas pernyataan FOMC, laporan BLS NFP/CPI, dan menit rapat bank sentral.
2. **Penjelasan Kontekstual:** Menjelaskan hasil perhitungan model kuantitatif ($Z$-score dan faktor makro) dengan bahasa yang terstruktur dan mudah dipahami.
3. **Sitasi & Grounding:** Menyertakan referensi dan tautan langsung ke dokumen resmi rilis lembaga terkait (*source grounding*).

### B. Tugas AI yang Dilarang (Forbidden Tasks)
1. **Modifikasi Data Mentah:** AI dilarang keras mengubah, mengoreksi, atau menimpa angka *Actual* atau *Consensus* mentah.
2. **Kalkulasi Diam-Diam:** AI dilarang menghitung ulang skor surprise atau regresi secara mandiri di luar mesin matematis yang telah ditentukan.
3. **Mengarang Angka / Halusinasi Angka:** AI dilarang menciptakan stempel waktu, revisi, atau angka statistik fiktif.
4. **Pembuatan Probabilitas Palsu:** AI dilarang mengklaim probabilitas arah harga tanpa hasil validasi dari model kuantitatif formal.

---

## 3. Output Schema & Hallucination Controls
- **Structured Output:** Seluruh respons AI wajib mengikuti skema terstruktur (JSON / Markdown sections) yang memisahkan: *(1) Fakta Rilis Resmi, (2) Skor Kejutan Kuantitatif, (3) Analisis Kontekstual Makro, (4) Batasan & Ketidakpastian (`MIXED` / `INSUFFICIENT_DATA`)*.
- **System Instructions:** Konfigurasi model menggunakan parameter deterministik (suhu rendah, misal `temperature: 0.2` hingga `0.3`) untuk meminimalkan kreativitas yang tidak berdasar.

---

## 4. Fallback, Konflik Sumber, dan Provider Abstraction
- **Provider Abstraction:** Integrasi AI diabstraksikan melalui modul layanan backend menggunakan Google GenAI SDK (`@google/genai`), memungkinkan penanganan kegagalan (*fallback*) jika API mengalami *rate limit* atau gangguan jaringan.
- **Fallback Behavior:** Jika AI gagal menghasilkan respons atau mengalami *timeout*, sistem menampilkan ringkasan data statistik murni (tanpa narasi AI) dengan label `AI_SYNTHESIS_UNAVAILABLE`.
- **Konflik Sumber:** Jika terdapat perbedaan antara rilis awal dan revisi, sistem mendahulukan data dari rilis resmi lembaga (*Primary Source*).

---

## 5. Logging, Privacy, dan Batasan Rate Limit
- **Privacy:** Tidak ada data pribadi pengguna (*PII*) yang dikirimkan ke model AI; prompt hanya berisi parameter data makro publik, instrumen XAU/USD, dan hasil hitungan statistik.
- **Rate Limits & Latency:** Mengimplementasikan penanganan antrean (*queue*) dan *retry with exponential backoff* untuk mengatasi batasan kuota API.

---

## 6. Approval Gate P05
- **Status Gate:** `PENDING_REVIEW`
- **Pemberi Persetujuan:** Project Owner / Stakeholder
- **Catatan:** Lanjutkan ke fase P06 (`07_Integration_Architecture.md`) setelah Hybrid AI Specification ini disetujui.

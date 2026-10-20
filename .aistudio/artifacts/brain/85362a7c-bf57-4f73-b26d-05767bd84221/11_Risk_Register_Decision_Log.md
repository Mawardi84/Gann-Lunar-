# P07 --- Risk Register & Decision Log

## 1. Status Dokumen
- **Dokumen ID:** P07 (Risk & Decisions)
- **Judul:** Risk Register & Decision Log: Quantitative Fundamental Analysis Engine
- **Status:** `IN_REVIEW`
- **Tanggal:** 2026-10-19
- **Versi:** 1.0.0
- **Coding Authorization:** **BLOCKED / NOT AUTHORIZED** (Mapping-First Phase)

---

## 2. Risk Register

| Risk ID | Risk Description | Severity | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | *Look-Ahead Bias* pada data konsensus historis | High | High | Wajib memverifikasi stempel waktu pra-rilis; jika tidak ada, tandai `INSUFFICIENT_DATA`. |
| **R-02** | Konflik faktor makro (misal: NFP kuat vs ekspektasi suku bunga) | Medium | High | Terapkan aturan logika `MIXED` dan hindari kepastian arah mutlak. |
| **R-03** | Halusinasi AI atau rekayasa angka statistik | High | Medium | Pisahkan perhitungan matematis di backend; AI hanya merangkum dengan suhu deterministik rendah. |
| **R-04** | Ketergantungan pada API penyedia data eksternal | Medium | Medium | Abstraksi provider dan mekanisme *fallback* data statistik lokal. |

---

## 3. Decision Log

| Decision ID | Date | Subject | Decision Summary | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **D-01** | 2026-10-19 | Mapping-First Approach | Menunda seluruh penulisan kode implementasi hingga fase P10 selesai dan disetujui. | Memastikan kualitas arsitektur, auditabilitas, dan persetujuan penuh pemilik proyek. |
| **D-02** | 2026-10-19 | Probability vs Score | Menunda estimasi probabilitas arah harga sampai model divalidasi out-of-sample. | Mencegah klaim probabilitas palsu (*pseudo-scientific certainty*). |

---

## 4. Approval Gate P07 (Risk & Decisions)
- **Status Gate:** `PENDING_REVIEW`
- **Pemberi Persetujuan:** Project Owner / Stakeholder
- **Catatan:** Lanjutkan ke fase P08 (`09_Validation_Backtest_Plan.md`) setelah Risk Register & Decision Log ini disetujui.

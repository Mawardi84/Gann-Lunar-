# P03 --- Data Specification & Data Dictionary

## 1. Status Dokumen
- **Dokumen ID:** P03
- **Judul:** Data Specification & Data Dictionary for Quantitative Fundamental Analysis Engine
- **Status:** `IN_REVIEW`
- **Tanggal:** 2026-10-19
- **Versi:** 1.0.0
- **Coding Authorization:** **BLOCKED / NOT AUTHORIZED** (Mapping-First Phase)

---

## 2. Cakupan Data Makroekonomi & Pasar

### A. FOMC (Federal Open Market Committee)
- **Indikator:** Keputusan Suku Bunga Fed Funds Rate (Target Rate High/Low), Statement FOMC, Economic Projections (SEP / Dot Plot), Konferensi Pers Ketua Fed.
- **Metadata Publikasi:** Waktu rilis resmi (2.00 PM EST), sumber (*Federal Reserve Board*).

### B. NFP (Non-Farm Payrolls)
- **Indikator:** Total Non-Farm Employment Change, Unemployment Rate, Average Hourly Earnings (MoM & YoY), Revisi 2 bulan sebelumnya (*revised previous*).
- **Metadata Publikasi:** Waktu rilis (8.30 AM EST, Jumat pertama setiap bulan), sumber (*U.S. Bureau of Labor Statistics - BLS*).

### C. CPI & PPI (Consumer & Producer Price Index)
- **Indikator:** Headline CPI (MoM & YoY), Core CPI (MoM & YoY), Headline PPI, Core PPI.
- **Metadata Publikasi:** Waktu rilis (8.30 AM EST), sumber (*BLS*).

### D. XAU/USD & Konteks Tambahan
- **XAU/USD Price Response:** Harga sebelum rilis ($t_0$), serta horizon harga 15 menit, 1 jam, 4 jam, dan 1 hari setelah rilis.
- **Konteks Tambahan (Advanced):** US 10Y Treasury Yield, US 10Y Real Yield (TIPS), DXY (US Dollar Index).

---

## 3. Data Dictionary (Minimum Required Fields)

Setiap record rilis fundamental wajib memuat field minimum berikut:

| Field Name | Data Type | Nullable | Description / Definition |
| :--- | :--- | :--- | :--- |
| `event_id` | UUID / String | No | Unique identifier event rilis makro |
| `event_type` | Enum | No | Kategori event (`FOMC`, `NFP`, `CPI`, `PPI`) |
| `indicator_code` | String | No | Kode spesifik indikator (misal: `NFP_CHANGE`, `CORE_CPI_YOY`) |
| `reporting_period` | String | No | Periode laporan (misal: `2026-03`, `Q1-2026`) |
| `actual_value` | Decimal / Float | Yes | Nilai aktual yang dirilis resmi oleh lembaga |
| `consensus_value` | Decimal / Float | Yes | Nilai ekspektasi konsensus pasar **yang dicatat sebelum rilis** |
| `previous_value` | Decimal / Float | Yes | Nilai periode sebelumnya sebelum revisi |
| `revised_previous` | Decimal / Float | Yes | Nilai periode sebelumnya setelah revisi resmi |
| `unit` | String | No | Satuan data (misal: `K` untuk ribuan, `%`, `USD`) |
| `release_time_utc` | Timestamp (UTC) | No | Waktu resmi rilis dijadwalkan / dipublikasikan |
| `source_published_at`| Timestamp (UTC)| Yes | Waktu stempel server sumber saat publikasi |
| `ingested_at` | Timestamp (UTC) | No | Waktu data masuk ke dalam sistem (*ingestion time*) |
| `source_name` | String | No | Nama penyedia/lembaga sumber (misal: `BLS`, `Federal Reserve`) |
| `source_reference`| String | Yes | URL atau nomor referensi dokumen resmi (*source grounding*) |
| `data_status` | Enum | No | Status kualitas data (`VERIFIED`, `ESTIMATED`, `DISPUTED`, `INSUFFICIENT_DATA`) |
| `revision_version` | Integer | No | Versi revisi data (default `1`, bertambah jika ada revisi resmi) |

---

## 4. Validasi, Timezone, dan Mitigasi Look-Ahead Bias

1. **Waktu & Timezone:** Seluruh perbandingan waktu dan penjadwalan menggunakan standar **UTC** (Coordinated Universal Time), serta memperhitungkan transisi Daylight Saving Time (DST) di AS.
2. **Mitigasi Risiko Konsensus (Look-Ahead Bias Protection):** 
   - **Aturan Kritis:** Data konsensus (`consensus_value`) **wajib** memiliki stempel waktu pencatatan sebelum `release_time_utc`. 
   - Jika suatu rilis historis tidak memiliki arsip konsensus pra-rilis yang valid, field `consensus_value` di-set `NULL`, dan `data_status` ditandai `INSUFFICIENT_DATA`. Sistem dilarang keras merekonstruksi konsensus menggunakan informasi setelah rilis.
3. **Idempotency & Deduplication:** Ingestion data menggunakan kombinasi kunci unik (`indicator_code` + `reporting_period` + `revision_version`) untuk mencegah duplikasi rilis.
4. **Retention & Audit Trail:** Seluruh perubahan nilai (khususnya revisi angka *previous*) dicatat dalam tabel audit trail terpisah untuk keperluan verifikasi backtest.

---

## 5. Approval Gate P03
- **Status Gate:** `PENDING_REVIEW`
- **Pemberi Persetujuan:** Project Owner / Stakeholder
- **Catatan:** Lanjutkan ke fase P04 (`05_Mathematical_Model_Specification.md`) setelah Data Specification & Dictionary ini disetujui.

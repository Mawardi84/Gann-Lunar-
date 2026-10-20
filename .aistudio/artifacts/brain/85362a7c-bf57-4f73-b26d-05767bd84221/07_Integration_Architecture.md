# P06 --- Integration Architecture

## 1. Status Dokumen
- **Dokumen ID:** P06
- **Judul:** Integration Architecture: Quantitative Fundamental Analysis Engine
- **Status:** `IN_REVIEW`
- **Tanggal:** 2026-10-19
- **Versi:** 1.0.0
- **Coding Authorization:** **BLOCKED / NOT AUTHORIZED** (Mapping-First Phase)

---

## 2. Arsitektur Komponen Konseptual
Berdasarkan hasil audit website eksisting (P01) dan tanpa memaksakan perubahan struktur microservices yang tidak perlu, arsitektur integrasi dibagi menjadi lapisan-lapisan berikut:
1. **Data Sources Layer:** Provider kalender ekonomi, BLS, dan Federal Reserve API.
2. **Ingestion & Validation Service:** Modul validasi stempel waktu pra-rilis (pencegahan *look-ahead bias*), deduplikasi, dan pemeriksaan kelengkapan data (`data_status`).
3. **Storage & Versioning Layer:** Penyimpanan persistensi data rilis makro dan revisi historis (*audit trail*).
4. **Quantitative Calculation Service:** Mesin perhitungan *Economic Surprise* ($A_t - F_t$, $Z$-score) dan evaluasi rezim makro XAU/USD.
5. **AI Interpretation Service:** Wrapper Google GenAI SDK untuk menghasilkan rangkuman berbasis dokumen resmi dengan suhu deterministik rendah.
6. **API Boundary Layer:** Kontrak endpoint konseptual untuk melayani frontend.
7. **Existing UI Integration:** Penambahan tab baru (`FundamentalTab.tsx`) pada SPA React eksisting menggunakan lazy loading dan custom state hook.

---

## 3. Kontrak API Konseptual (Conceptual API Contracts)

### A. Endpoint Kalender & Rilis Makro
- **Endpoint:** `GET /api/fundamental/calendar`
- **Query Params:** `event_type` (opsional: FOMC, NFP, CPI, PPI), `start_date`, `end_date`
- **Response Schema (Contoh):**
  ```json
  {
    "events": [
      {
        "event_id": "uuid-1234",
        "event_type": "NFP",
        "indicator_code": "NFP_CHANGE",
        "reporting_period": "2026-03",
        "actual_value": 220.0,
        "consensus_value": 185.0,
        "previous_value": 175.0,
        "release_time_utc": "2026-04-03T12:30:00Z",
        "data_status": "VERIFIED",
        "surprise_z_score": 1.42
      }
    ]
  }
  ```

### B. Endpoint Analisis Fundamental & AI Grounding
- **Endpoint:** `POST /api/fundamental/analyze`
- **Request Body:**
  ```json
  {
    "event_id": "uuid-1234",
    "instrument": "XAU/USD"
  }
  ```
- **Response Schema:**
  ```json
  {
    "event_id": "uuid-1234",
    "surprise_score": 1.42,
    "macro_regime_status": "MIXED",
    "ai_explanation": "Rilis NFP aktual melampaui konsensus pasar, memicu lonjakan imbal hasil obligasi namun juga ekspektasi suku bunga...",
    "source_references": [
      "https://www.bls.gov/news.release/empsit.nr0.htm"
    ]
  }
  ```

---

## 4. Observability, Retry, dan Audit Logs
- **Retry & Recovery:** Mekanisme *exponential backoff* pada kegagalan pemanggilan API eksternal.
- **Audit Logs:** Seluruh proses *ingestion* rilis data dan perubahan revisi dicatat dengan stempel waktu UTC untuk keperluan debugging dan auditabilitas backtest.

---

## 5. Approval Gate P06
- **Status Gate:** `PENDING_REVIEW`
- **Pemberi Persetujuan:** Project Owner / Stakeholder
- **Catatan:** Lanjutkan ke fase P07 (`08_Security_Data_Governance.md`) setelah Integration Architecture ini disetujui.

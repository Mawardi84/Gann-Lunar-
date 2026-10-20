# P04 --- Mathematical Model Specification

## 1. Status Dokumen
- **Dokumen ID:** P04
- **Judul:** Mathematical Model Specification: Quantitative Fundamental Analysis Engine (XAU/USD)
- **Status:** `IN_REVIEW`
- **Tanggal:** 2026-10-19
- **Versi:** 1.0.0
- **Coding Authorization:** **BLOCKED / NOT AUTHORIZED** (Mapping-First Phase)

---

## 2. Economic Surprise Formula & Normalisasi ($Z$-score)

### A. Rumus Dasar Kejutan Ekonomi
Untuk setiap rilis data pada waktu $t$:
$$S_t = A_t - F_t$$
Di mana:
- $A_t$ = Nilai aktual (*Actual*) yang dirilis resmi.
- $F_t$ = Nilai ekspektasi konsensus (*Consensus*) pra-rilis terverifikasi.

### B. Standardisasi (*Z-score*)
Karena skala dan unit setiap indikator makro berbeda (misal: NFP dalam ribuan pekerjaan vs CPI dalam persentase), nilai surprise distandardisasi menggunakan deviasi standar historis kejutan ($\sigma_S$):
$$Z_t = \frac{A_t - F_t}{\sigma_S}$$
Di mana $\sigma_S$ dihitung dari sampel historis deviasi $S$ selama minimal 36 bulan ke belakang. 
- **Batasan & Asumsi:** Distribusi surprise mungkin mengalami fat-tail atau *skewness*. Outlier ekstrem ditangani dengan pembatasan (*winsorization*) pada $\pm 3\sigma$. Larangan keras menggunakan informasi revisi masa depan untuk menghitung $\sigma_S$ historis pada waktu $t$ (*no look-ahead leakage*).

---

## 3. Macro Regime & Aturan Konflik Faktor XAU/USD
Emas (**XAU/USD**) tidak selalu merespons secara linier terhadap tanda *economic surprise*. Contoh: NFP yang sangat kuat dapat memperkuat DXY dan menaikkan yield (menekan emas), tetapi juga memicu kekhawatiran inflasi upah (mendukung emas).

- **Aturan Logika Konflik (`MIXED` / `INSUFFICIENT_DATA`):**
  - Jika indikator tenaga kerja dan inflasi memberikan sinyal arah yang saling bertentangan secara signifikan, sistem wajib mengembalikan status **`MIXED`**.
  - Jika data konsensus pra-rilis tidak tersedia, sistem mengembalikan status **`INSUFFICIENT_DATA`**.
  - Model dilarang keras berasumsi bahwa *surprise* positif selalu berimplikasi negatif bagi emas tanpa memperhitungkan rezim suku bunga riil (*real yields*).

---

## 4. Price Response & Log Returns ($r_{t,h}$)
Respons harga emas dievaluasi menggunakan *log returns* diskrit berjangka waktu (*horizons*):
$$r_{t,h} = \ln\left(\frac{P_{t+h}}{P_t}\right)$$
Di mana:
- $P_t$ = Harga XAU/USD tepat pada stempel waktu rilis event ($t_0$).
- $P_{t+h}$ = Harga XAU/USD pada horizon $h$, di mana $h \in \{15 \text{ menit}, 1 \text{ jam}, 4 \text{ jam}, 1 \text{ hari}\}$.
- **Baseline & Kalender:** Menggunakan kalender trading aktif, mengabaikan akhir pekan, dan mendokumentasikan asumsi *bid-ask spread* serta potensi *slippage* pada saat rilis berita berdampak tinggi.

---

## 5. Model Statistik & Baseline Pembanding
- **Baseline Pertama:** Regresi linier teratur (*Ridge / Regularized Regression*) untuk memetakan hubungan antara $Z_t$ (dan fitur konteks makro pendukung seperti perubahan yield 10Y) terhadap $r_{t,h}$.
- **Dokumentasi Model:** Variabel target, koefisien, asumsi homoskedastisitas, regularisasi untuk mencegah overfitting, serta evaluasi terhadap *naive baseline* (rata-rata historis).

---

## 6. Pemisahan Probability, Confidence, dan Data Quality
1. **Direction Probability:** Estimasi probabilitas arah pergerakan (*Bullish* / *Bearish*) **hanya boleh diaktifkan** jika model statistik telah dilatih secara out-of-sample dan evaluasi kalibrasinya tuntas. Sebelum kalibrasi terpenuhi, sistem hanya menampilkan skor kejutan kuantitatif ($Z$-score) dan klasifikasi kualitatif terstruktur.
2. **Model Confidence & Uncertainty:** Metrik kepercayaan model dipisahkan dari probabilitas mentah, mempertimbangkan volatilitas pasar saat rilis dan stabilitas sampel historis.
3. **Data Quality Status:** Setiap output analisis di-tag dengan status kualitas data (`VERIFIED`, `ESTIMATED`, `DISPUTED`, `INSUFFICIENT_DATA`).

---

## 7. Validasi & Out-of-Sample Guidelines
- Menggunakan *time-based split* (kronologis) dan *walk-forward validation* untuk mencegah *leakage*.
- Menetapkan jumlah sampel minimum (misalnya minimal 30 kejadian historis per jenis event sebelum model statistik layak dipublikasikan).
- Contoh numerik dalam dokumentasi bersifat **ilustratif**, bukan prediksi harga aktual.

---

## 8. Approval Gate P04
- **Status Gate:** `PENDING_REVIEW`
- **Pemberi Persetujuan:** Project Owner / Stakeholder
- **Catatan:** Lanjutkan ke fase P05 (`06_AI_Specification.md`) setelah Mathematical Model Specification ini disetujui.

# 🔍 DataVerity — Enterprise Data Quality & Schema Profiler

An enterprise-grade Data Quality & Schema Profiling web platform built with **HTML5, CSS3, JavaScript**, and **Node.js / Express**.

---

## 🚀 Quick Start

### 1. Start the Server
Make sure your terminal is in the project directory:
```bash
npm start
```
*(Or use `node server.js`)*

### 2. Open in Your Browser
Visit:
```
http://localhost:3000
```

---

## ✨ Features

- 🌐 **Full Modern SaaS Website**: Hero section, Features Bento Grid, How It Works pipeline, ROI Calculator, Standards, and FAQ.
- 📂 **Multi-format Support**: Drag-and-drop or browse `.csv`, `.xlsx`, `.xls`, and `.json` files, or paste raw tabular text.
- 🎯 **Verity Health Scorecard**:
  - Interactive Animated Radial SVG Score Gauge (0–100 scale).
  - 4 Real-time KPI Cards: **Completeness**, **Uniqueness**, **Type Validity**, and **Anomalies / Outliers**.
- 📊 **Column Health Matrix**: Column-by-column breakdown with inferred data types, fill rates, missing counts, distinct values, and SVG completeness charts.
- 🔍 **Interactive Data Explorer**:
  - Paginated table (10 / 25 / 50 / 100 rows per page).
  - Instant multi-column search.
  - Quick filters: **All Rows**, **Rows with Issues Only**, and **Clean Rows**.
  - Cell highlighting for missing data and type violations.
- 📈 **Statistical Profiler**:
  - Min, Max, Mean, Median, Standard Deviation, Variance, Q1, Q3, and IQR Outliers.
  - Interactive SVG Frequency Distribution Histogram.
- 🧹 **Smart Remediation & Cleaning Engine**:
  - One-click duplicate row removal.
  - Whitespace trimming and text case standardization.
  - Missing value imputation (Mean, Median, Zero, or "N/A").
  - Instant export to **Cleaned CSV** and **Cleaned Excel (.xlsx)**.
- 📑 **ISO/IEC 25012 Audit Certificate**:
  - Formal compliance report ready to print or save as PDF (`Ctrl + P`).
  - Export full audit data as JSON.
- ⚡ **1-Click Demo Samples**: Pre-loaded with Customer CRM (dirty data), Financial Transactions (outliers), and Benchmark Clean datasets.

---

## 📁 Project Structure

```
DataVerity/
├── public/
│   ├── index.html        # Main SaaS website & Studio interface
│   ├── css/
│   │   └── style.css     # Modern dark-theme glassmorphism styles
│   └── js/
│       └── script.js     # Profiling engine, charts, cleaning & grid logic
├── server.js             # Express API server (uploads, stats, samples, cleaning)
├── package.json          # Node dependencies and scripts
└── README.md             # Documentation
```
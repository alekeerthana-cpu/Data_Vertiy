/**
 * DataVerity - Smart Data Quality & Schema Profiler
 * Core Frontend Application Logic & Analytical Engine
 */

// Application State
const state = {
  currentData: [],
  cleanedData: [],
  originalAnalysis: null,
  cleanedAnalysis: null,
  fileName: "dataset",
  fileSize: 0,
  grid: {
    currentPage: 1,
    pageSize: 25,
    filter: "all", // 'all', 'issues', 'clean'
    searchQuery: "",
    sortColumn: null,
    sortDirection: "asc"
  },
  serverStatus: "offline"
};

// Embedded sample datasets for instant 1-click loading (works offline & zero latency)
const EMBEDDED_SAMPLES = {
  customers: [
    { id: 101, name: "Alice Jenkins", email: "alice.j@example.com", age: 34, country: "USA", balance: 4500, signup_date: "2023-01-15" },
    { id: 102, name: "Bob Martin", email: "bob.martin@corp", age: 29, country: "UK", balance: 1200, signup_date: "2023-02-18" },
    { id: 103, name: "Carlos Rossi", email: "carlos@rossi.it", age: null, country: "Italy", balance: 9800, signup_date: "2023-03-01" },
    { id: 104, name: "Diana Prince", email: "diana.p@gmail.com", age: 41, country: "Canada", balance: 15400, signup_date: "2023-04-12" },
    { id: 104, name: "Diana Prince", email: "diana.p@gmail.com", age: 41, country: "Canada", balance: 15400, signup_date: "2023-04-12" }, // Duplicate
    { id: 105, name: "Ethan Hunt", email: "ethan@imf.org", age: -5, country: "USA", balance: 850000, signup_date: "invalid-date" }, // Negative age, outlier, bad date
    { id: 106, name: "Fiona Gallagher", email: "fiona@gallagher.com", age: 28, country: "", balance: 350, signup_date: "2023-06-21" },
    { id: 107, name: "George Clark", email: "george@clark.com", age: 52, country: "UK", balance: 6700, signup_date: "2023-07-09" },
    { id: 108, name: "Hannah Abbott", email: "hannah@hogwarts.uk", age: 31, country: "UK", balance: 5100, signup_date: "2023-08-14" },
    { id: 109, name: "Ian Malcolm", email: "ian@jurassic.org", age: 46, country: "USA", balance: 11200, signup_date: "2023-09-03" },
    { id: 110, name: "Julia Roberts", email: "julia@hollywood.com", age: "N/A", country: "USA", balance: 45000, signup_date: "2023-09-25" },
    { id: 111, name: "Kevin Bacon", email: "kevin@sixdegrees.com", age: 65, country: "USA", balance: 8900, signup_date: "2023-10-10" },
    { id: 112, name: "Laura Croft", email: "laura@tomb.org", age: 32, country: "UK", balance: 92000, signup_date: "2023-10-31" },
    { id: 113, name: "Michael Scott", email: "michael@dundermifflin.com", age: 45, country: "USA", balance: 120, signup_date: "2023-11-05" },
    { id: 114, name: "Nina Simone", email: "", age: 39, country: "France", balance: 24000, signup_date: "2023-11-19" },
    { id: 115, name: "Oscar Martinez", email: "oscar@accounting.com", age: 37, country: "USA", balance: 8300, signup_date: "2023-12-01" },
    { id: 115, name: "Oscar Martinez", email: "oscar@accounting.com", age: 37, country: "USA", balance: 8300, signup_date: "2023-12-01" }, // Duplicate
    { id: 116, name: "Pam Beesly", email: "pam@art.org", age: 33, country: "USA", balance: 4100, signup_date: "2023-12-15" }
  ],
  transactions: [
    { txn_id: "TXN-001", amount: 150.50, currency: "USD", status: "COMPLETED", merchant: "Amazon", date: "2024-01-05" },
    { txn_id: "TXN-002", amount: -45.00, currency: "USD", status: "REFUNDED", merchant: "Walmart", date: "2024-01-06" },
    { txn_id: "TXN-003", amount: 999999.00, currency: "USD", status: "FLAGGED", merchant: "Offshore Bank", date: "2024-01-07" },
    { txn_id: "TXN-004", amount: 12.99, currency: "EUR", status: "COMPLETED", merchant: "Spotify", date: "2024-01-08" },
    { txn_id: "TXN-005", amount: 84.20, currency: "GBP", status: "PENDING", merchant: "Tesco", date: "2024-01-09" },
    { txn_id: "TXN-005", amount: 84.20, currency: "GBP", status: "PENDING", merchant: "Tesco", date: "2024-01-09" },
    { txn_id: "TXN-006", amount: null, currency: "USD", status: "FAILED", merchant: "Uber", date: "2024-01-10" },
    { txn_id: "TXN-007", amount: 230.00, currency: "", status: "COMPLETED", merchant: "Apple Store", date: "2024-01-11" },
    { txn_id: "TXN-008", amount: 450.00, currency: "USD", status: "COMPLETED", merchant: "Delta Air", date: "2024-01-12" },
    { txn_id: "TXN-009", amount: 18.50, currency: "CAD", status: "COMPLETED", merchant: "Tim Hortons", date: "2024-01-13" },
    { txn_id: "TXN-010", amount: 62.00, currency: "USD", status: "COMPLETED", merchant: "Target", date: "2024-01-14" }
  ],
  benchmark: [
    { employee_id: "EMP-101", full_name: "Sarah Connor", department: "Engineering", salary: 98000, performance_rating: 4.8, active: true },
    { employee_id: "EMP-102", full_name: "James Holden", department: "Operations", salary: 85000, performance_rating: 4.5, active: true },
    { employee_id: "EMP-103", full_name: "Naomi Nagata", department: "Engineering", salary: 110000, performance_rating: 4.9, active: true },
    { employee_id: "EMP-104", full_name: "Amos Burton", department: "Logistics", salary: 76000, performance_rating: 4.2, active: true },
    { employee_id: "EMP-105", full_name: "Chrisjen Avasarala", department: "Executive", salary: 185000, performance_rating: 5.0, active: true },
    { employee_id: "EMP-106", full_name: "Alex Kamal", department: "Logistics", salary: 82000, performance_rating: 4.4, active: true },
    { employee_id: "EMP-107", full_name: "Roberta Draper", department: "Security", salary: 92000, performance_rating: 4.7, active: true },
    { employee_id: "EMP-108", full_name: "Praxidike Meng", department: "Research", salary: 88000, performance_rating: 4.6, active: true },
    { employee_id: "EMP-109", full_name: "Clarissa Mao", department: "Operations", salary: 74000, performance_rating: 4.1, active: true },
    { employee_id: "EMP-110", full_name: "Camina Drummer", department: "Executive", salary: 140000, performance_rating: 4.9, active: true }
  ]
};

// UI Elements
const els = {
  // Header
  statusDot: document.getElementById("statusDot"),
  statusText: document.getElementById("statusText"),
  checkServerBtn: document.getElementById("checkServer"),
  sampleDataDropdownBtn: document.getElementById("sampleDataDropdownBtn"),
  sampleDataMenu: document.getElementById("sampleDataMenu"),
  resetBtn: document.getElementById("resetBtn"),

  // Upload & Dropzone
  uploadSection: document.getElementById("uploadSection"),
  dropZone: document.getElementById("dropZone"),
  datasetInput: document.getElementById("dataset"),
  browseBtn: document.getElementById("browseBtn"),
  pasteDataBtn: document.getElementById("pasteDataBtn"),
  chipSampleCustomers: document.getElementById("chipSampleCustomers"),
  chipSampleTxn: document.getElementById("chipSampleTxn"),
  chipSampleBench: document.getElementById("chipSampleBench"),
  loadSampleCustomers: document.getElementById("loadSampleCustomers"),
  loadSampleTransactions: document.getElementById("loadSampleTransactions"),
  loadSampleBenchmark: document.getElementById("loadSampleBenchmark"),

  // Scanning Overlay
  scanningOverlay: document.getElementById("scanningOverlay"),
  scannerStatusText: document.getElementById("scannerStatusText"),
  scannerProgressFill: document.getElementById("scannerProgressFill"),

  // Paste Modal
  pasteModal: document.getElementById("pasteModal"),
  closePasteModal: document.getElementById("closePasteModal"),
  cancelPasteBtn: document.getElementById("cancelPasteBtn"),
  submitPasteBtn: document.getElementById("submitPasteBtn"),
  rawTextInput: document.getElementById("rawTextInput"),

  // Results & Summary
  resultsSection: document.getElementById("resultsSection"),
  summaryFileName: document.getElementById("summaryFileName"),
  summaryFileDetails: document.getElementById("summaryFileDetails"),
  summaryRowsCount: document.getElementById("summaryRowsCount"),
  summaryColsCount: document.getElementById("summaryColsCount"),
  summaryCellsCount: document.getElementById("summaryCellsCount"),
  exportAuditJsonBtn: document.getElementById("exportAuditJsonBtn"),
  printReportBtn: document.getElementById("printReportBtn"),

  // Scorecard
  gaugeCircle: document.getElementById("gaugeCircle"),
  overallScoreValue: document.getElementById("overallScoreValue"),
  gradeBadge: document.getElementById("gradeBadge"),
  gradeCaption: document.getElementById("gradeCaption"),
  completenessValue: document.getElementById("completenessValue"),
  missingCellsTag: document.getElementById("missingCellsTag"),
  completenessBar: document.getElementById("completenessBar"),
  uniquenessValue: document.getElementById("uniquenessValue"),
  duplicateRowsTag: document.getElementById("duplicateRowsTag"),
  uniquenessBar: document.getElementById("uniquenessBar"),
  validityValue: document.getElementById("validityValue"),
  typeMismatchesTag: document.getElementById("typeMismatchesTag"),
  validityBar: document.getElementById("validityBar"),
  outliersValue: document.getElementById("outliersValue"),
  outliersTag: document.getElementById("outliersTag"),
  outliersBar: document.getElementById("outliersBar"),

  // Tabs
  tabButtons: document.querySelectorAll(".tab-btn"),
  tabPanels: document.querySelectorAll(".tab-panel"),
  tabColsCountBadge: document.getElementById("tabColsCountBadge"),
  tabRowsCountBadge: document.getElementById("tabRowsCountBadge"),

  // Tab 1: Column Health
  columnsMatrixTableBody: document.getElementById("columnsMatrixTableBody"),
  completenessChartBody: document.getElementById("completenessChartBody"),
  issuesBreakdownChartBody: document.getElementById("issuesBreakdownChartBody"),

  // Tab 2: Grid
  gridSearchInput: document.getElementById("gridSearchInput"),
  filterAllRows: document.getElementById("filterAllRows"),
  filterErrorRows: document.getElementById("filterErrorRows"),
  filterCleanRows: document.getElementById("filterCleanRows"),
  pageSizeSelect: document.getElementById("pageSizeSelect"),
  dataGridHead: document.getElementById("dataGridHead"),
  dataGridBody: document.getElementById("dataGridBody"),
  allRowsCount: document.getElementById("allRowsCount"),
  errorRowsCount: document.getElementById("errorRowsCount"),
  cleanRowsCount: document.getElementById("cleanRowsCount"),
  paginationInfo: document.getElementById("paginationInfo"),
  prevPageBtn: document.getElementById("prevPageBtn"),
  nextPageBtn: document.getElementById("nextPageBtn"),
  pageNumbersContainer: document.getElementById("pageNumbersContainer"),

  // Tab 3: Stats
  statsColumnSelect: document.getElementById("statsColumnSelect"),
  statsMetricsGrid: document.getElementById("statsMetricsGrid"),
  histogramChartBody: document.getElementById("histogramChartBody"),
  topFrequencyList: document.getElementById("topFrequencyList"),
  histogramSubtitle: document.getElementById("histogramSubtitle"),

  // Tab 4: Cleaning
  cleanDedup: document.getElementById("cleanDedup"),
  cleanTrim: document.getElementById("cleanTrim"),
  cleanCasing: document.getElementById("cleanCasing"),
  cleanImputeNum: document.getElementById("cleanImputeNum"),
  cleanImputeText: document.getElementById("cleanImputeText"),
  cleanDropEmpty: document.getElementById("cleanDropEmpty"),
  runCleanBtn: document.getElementById("runCleanBtn"),
  beforeScoreText: document.getElementById("beforeScoreText"),
  beforeRowsText: document.getElementById("beforeRowsText"),
  afterScoreText: document.getElementById("afterScoreText"),
  afterRowsText: document.getElementById("afterRowsText"),
  changesList: document.getElementById("changesList"),
  downloadCleanCsvBtn: document.getElementById("downloadCleanCsvBtn"),
  downloadCleanXlsxBtn: document.getElementById("downloadCleanXlsxBtn"),

  // Tab 5: Report
  reportDocId: document.getElementById("reportDocId"),
  reportGradeStamp: document.getElementById("reportGradeStamp"),
  reportDatasetName: document.getElementById("reportDatasetName"),
  reportDate: document.getElementById("reportDate"),
  reportDimensions: document.getElementById("reportDimensions"),
  reportOverallScore: document.getElementById("reportOverallScore"),
  reportCompleteness: document.getElementById("reportCompleteness"),
  reportUniqueness: document.getElementById("reportUniqueness"),
  reportStandardsBody: document.getElementById("reportStandardsBody"),
  reportFindingsList: document.getElementById("reportFindingsList"),
  btnReportPrint: document.getElementById("btnReportPrint"),
  btnReportDownloadJson: document.getElementById("btnReportDownloadJson"),

  // Toast
  toastContainer: document.getElementById("toastContainer")
};

// ============================================================================
// Notification / Toast System
// ============================================================================
function showToast(message, type = "info", duration = 3500) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  els.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================================
// Server Health Check
// ============================================================================
async function checkServerStatus() {
  const startTime = performance.now();
  try {
    const res = await fetch("/api/status");
    const elapsed = Math.round(performance.now() - startTime);
    if (res.ok) {
      const data = await res.json();
      state.serverStatus = "online";
      els.statusDot.className = "status-dot online";
      els.statusText.textContent = `Online :${data.port || 3000} (${elapsed}ms)`;
      showToast("DataVerity API Server connected", "success");
    } else {
      throw new Error(`Server returned ${res.status}`);
    }
  } catch (err) {
    state.serverStatus = "offline";
    els.statusDot.className = "status-dot offline";
    els.statusText.textContent = "Offline (Client-side Active)";
    showToast("Running in High-Speed Client Mode", "warning");
  }
}

// ============================================================================
// Analytical Engine (Browser-Native Processing)
// ============================================================================
function calculateNumericStats(numbers) {
  if (!numbers || numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const n = sorted.length;
  const min = sorted[0];
  const max = sorted[n - 1];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance);

  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = sorted.filter((v) => v < lowerBound || v > upperBound);

  return {
    count: n,
    min,
    max,
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    variance: Number(variance.toFixed(2)),
    q1,
    q3,
    iqr: Number(iqr.toFixed(2)),
    outlierCount: outliers.length,
    outliers: outliers.slice(0, 10),
    zeroCount: numbers.filter((v) => v === 0).length,
    negativeCount: numbers.filter((v) => v < 0).length
  };
}

function inferColumnType(values) {
  let numCount = 0;
  let dateCount = 0;
  let boolCount = 0;
  let emailCount = 0;
  const total = values.length;
  if (total === 0) return "string";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (const val of values) {
    if (val === null || val === undefined || val === "") continue;
    const str = String(val).trim();
    if (str.toLowerCase() === "true" || str.toLowerCase() === "false") {
      boolCount++;
    } else if (!isNaN(Number(str)) && str !== "") {
      numCount++;
    } else if (emailRegex.test(str)) {
      emailCount++;
    } else if (!isNaN(Date.parse(str)) && str.length > 5 && (str.includes("-") || str.includes("/"))) {
      dateCount++;
    }
  }

  const validCount = Math.max(numCount + dateCount + boolCount + emailCount, 1);
  if (emailCount / validCount > 0.6) return "email";
  if (numCount / validCount > 0.6) return "number";
  if (dateCount / validCount > 0.6) return "date";
  if (boolCount / validCount > 0.6) return "boolean";
  return "string";
}

function performDatasetAudit(rows, fileName = "dataset") {
  if (!rows || rows.length === 0) {
    throw new Error("Dataset is empty.");
  }

  const columns = Object.keys(rows[0]);
  const totalRows = rows.length;
  const totalCols = columns.length;
  const totalCells = totalRows * totalCols;

  let totalMissingCells = 0;
  let totalTypeMismatches = 0;
  let totalOutliers = 0;

  // Exact duplicate rows check
  const seenRowStrings = new Set();
  let duplicateRowCount = 0;

  for (const row of rows) {
    const rowStr = JSON.stringify(row);
    if (seenRowStrings.has(rowStr)) {
      duplicateRowCount++;
    } else {
      seenRowStrings.add(rowStr);
    }
  }

  // Column Profiling
  const columnProfiles = columns.map((colName) => {
    let missingCount = 0;
    const nonNullValues = [];
    const valueFrequencies = {};

    rows.forEach((row) => {
      const val = row[colName];
      if (val === null || val === undefined || String(val).trim() === "") {
        missingCount++;
      } else {
        const strVal = String(val).trim();
        nonNullValues.push(val);
        valueFrequencies[strVal] = (valueFrequencies[strVal] || 0) + 1;
      }
    });

    totalMissingCells += missingCount;

    const detectedType = inferColumnType(nonNullValues);
    const distinctValuesCount = Object.keys(valueFrequencies).length;
    const completenessPct = totalRows > 0 ? Number((((totalRows - missingCount) / totalRows) * 100).toFixed(1)) : 0;
    const uniquenessPct = nonNullValues.length > 0 ? Number(((distinctValuesCount / nonNullValues.length) * 100).toFixed(1)) : 0;

    let numericValues = [];
    let typeMismatchCount = 0;
    let formatErrors = 0;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    nonNullValues.forEach((val) => {
      const strVal = String(val).trim();
      if (detectedType === "number") {
        const num = Number(strVal);
        if (isNaN(num)) {
          typeMismatchCount++;
        } else {
          numericValues.push(num);
        }
      } else if (detectedType === "email") {
        if (!emailRegex.test(strVal)) {
          typeMismatchCount++;
          formatErrors++;
        }
      } else if (detectedType === "date") {
        if (isNaN(Date.parse(strVal))) {
          typeMismatchCount++;
          formatErrors++;
        }
      }
    });

    totalTypeMismatches += typeMismatchCount;

    let stats = null;
    if (detectedType === "number" && numericValues.length > 0) {
      stats = calculateNumericStats(numericValues);
      if (stats) {
        totalOutliers += stats.outlierCount;
      }
    }

    const topValues = Object.entries(valueFrequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({
        value,
        count,
        percentage: Number(((count / (nonNullValues.length || 1)) * 100).toFixed(1))
      }));

    let status = "healthy";
    if (completenessPct < 70 || typeMismatchCount > totalRows * 0.1 || (stats && stats.outlierCount > totalRows * 0.15)) {
      status = "danger";
    } else if (completenessPct < 90 || typeMismatchCount > 0 || (stats && stats.outlierCount > 0)) {
      status = "warning";
    }

    return {
      name: colName,
      type: detectedType,
      missingCount,
      completenessPct,
      uniquenessPct,
      distinctValuesCount,
      typeMismatchCount,
      formatErrors,
      stats,
      topValues,
      status,
      sampleValues: nonNullValues.slice(0, 3)
    };
  });

  // Weighted ISO-25012 Data Quality Score (0-100)
  const completenessRate = totalCells > 0 ? (totalCells - totalMissingCells) / totalCells : 1;
  const uniquenessRate = totalRows > 0 ? (totalRows - duplicateRowCount) / totalRows : 1;
  const validityRate = totalCells > 0 ? Math.max(0, (totalCells - totalTypeMismatches) / totalCells) : 1;
  const consistencyRate = totalCells > 0 ? Math.max(0, (totalCells - totalOutliers) / totalCells) : 1;

  const rawScore =
    completenessRate * 35 +
    uniquenessRate * 20 +
    validityRate * 25 +
    consistencyRate * 20;

  const qualityScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  let grade = "Excellent";
  let gradeBadgeClass = "status-healthy";
  let stampGrade = "A+";

  if (qualityScore < 60) {
    grade = "Critical Attention Required";
    gradeBadgeClass = "status-danger";
    stampGrade = "F";
  } else if (qualityScore < 75) {
    grade = "Needs Improvement";
    gradeBadgeClass = "status-warning";
    stampGrade = "C";
  } else if (qualityScore < 90) {
    grade = "Good Quality";
    gradeBadgeClass = "status-healthy";
    stampGrade = "B+";
  }

  return {
    fileName,
    analyzedAt: new Date().toISOString(),
    totalRows,
    totalColumns: totalCols,
    totalCells,
    duplicateRowCount,
    duplicateRowPct: totalRows > 0 ? Number(((duplicateRowCount / totalRows) * 100).toFixed(1)) : 0,
    totalMissingCells,
    missingCellsPct: totalCells > 0 ? Number(((totalMissingCells / totalCells) * 100).toFixed(1)) : 0,
    totalTypeMismatches,
    totalOutliers,
    qualityScore,
    grade,
    gradeBadgeClass,
    stampGrade,
    metrics: {
      completenessRate: Number((completenessRate * 100).toFixed(1)),
      uniquenessRate: Number((uniquenessRate * 100).toFixed(1)),
      validityRate: Number((validityRate * 100).toFixed(1)),
      consistencyRate: Number((consistencyRate * 100).toFixed(1))
    },
    columns: columnProfiles,
    sampleRows: rows
  };
}

// ============================================================================
// File Parsers
// ============================================================================
function parseCSV(text) {
  const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) throw new Error("CSV requires a header and at least one data row.");

  // Regex-aware CSV line splitter
  const parseLine = (line) => {
    const entries = [];
    let entry = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        entries.push(entry.trim());
        entry = "";
      } else {
        entry += c;
      }
    }
    entries.push(entry.trim());
    return entries;
  };

  const headers = parseLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      let val = values[idx];
      if (val === undefined || val === "") {
        val = null;
      } else if (!isNaN(Number(val)) && val.trim() !== "") {
        val = Number(val);
      }
      row[h] = val;
    });
    rows.push(row);
  }

  return rows;
}

async function handleFileProcess(file) {
  startScanAnimation(`Parsing ${file.name}...`);
  const startTime = performance.now();
  state.fileName = file.name;
  state.fileSize = file.size;

  try {
    let rows = [];

    if (file.name.endsWith(".json")) {
      const text = await file.text();
      const parsed = JSON.parse(text);
      rows = Array.isArray(parsed) ? parsed : [parsed];
    } else if (file.name.endsWith(".csv")) {
      const text = await file.text();
      rows = parseCSV(text);
    } else if (window.XLSX && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      const data = await file.arrayBuffer();
      const workbook = window.XLSX.read(data, { type: "array" });
      const firstSheet = workbook.SheetNames[0];
      rows = window.XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: null });
    } else {
      // Fallback: Upload to server API
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Server analysis failed");
      const result = await res.json();
      state.currentData = result.analysis.sampleRows;
      state.originalAnalysis = result.analysis;
      finishScanAnimation(Math.round(performance.now() - startTime));
      renderDashboard();
      return;
    }

    state.currentData = rows;
    state.originalAnalysis = performDatasetAudit(rows, file.name);
    finishScanAnimation(Math.round(performance.now() - startTime));
    renderDashboard();
    showToast(`Loaded ${rows.length} rows successfully`, "success");
  } catch (err) {
    stopScanAnimation();
    showToast(`Failed to load file: ${err.message}`, "error");
    console.error(err);
  }
}

function loadDatasetDirectly(datasetArray, name = "sample_data") {
  startScanAnimation(`Processing ${name}...`);
  const startTime = performance.now();
  state.fileName = name;
  state.fileSize = JSON.stringify(datasetArray).length;
  state.currentData = JSON.parse(JSON.stringify(datasetArray));

  setTimeout(() => {
    state.originalAnalysis = performDatasetAudit(state.currentData, name);
    finishScanAnimation(Math.round(performance.now() - startTime));
    renderDashboard();
    showToast(`Loaded ${name} dataset`, "success");
  }, 350);
}

// ============================================================================
// Scanning UI Controls
// ============================================================================
function startScanAnimation(statusText = "Analyzing schema & anomalies...") {
  els.scanningOverlay.style.display = "flex";
  els.scannerStatusText.textContent = statusText;
  els.scannerProgressFill.style.width = "20%";
  setTimeout(() => { els.scannerProgressFill.style.width = "65%"; }, 150);
}

function finishScanAnimation(elapsedMs) {
  els.scannerProgressFill.style.width = "100%";
  setTimeout(() => {
    stopScanAnimation();
    els.summaryFileDetails.textContent = `Parsed in ${elapsedMs}ms • ${(state.fileSize / 1024).toFixed(1)} KB`;
  }, 200);
}

function stopScanAnimation() {
  els.scanningOverlay.style.display = "none";
}

// ============================================================================
// UI Rendering Engine
// ============================================================================
function renderDashboard() {
  const an = state.originalAnalysis;
  if (!an) return;

  // Show sections
  els.uploadSection.style.display = "none";
  els.resultsSection.style.display = "block";
  els.resetBtn.style.display = "inline-flex";

  // Summary Bar
  els.summaryFileName.textContent = an.fileName;
  els.summaryRowsCount.textContent = an.totalRows.toLocaleString();
  els.summaryColsCount.textContent = an.totalColumns;
  els.summaryCellsCount.textContent = an.totalCells.toLocaleString();

  // Tab count badges
  els.tabColsCountBadge.textContent = an.totalColumns;
  els.tabRowsCountBadge.textContent = an.totalRows;

  // Radial Gauge Animation
  const score = an.qualityScore;
  els.overallScoreValue.textContent = score;

  // SVG perimeter for r=68 is 2 * PI * 68 ≈ 427
  const perimeter = 427;
  const offset = perimeter - (perimeter * score) / 100;
  els.gaugeCircle.style.strokeDashoffset = offset;

  // Gauge Color by Score Tier
  let gaugeColor = "#10b981"; // green
  if (score < 60) gaugeColor = "#f43f5e"; // red
  else if (score < 75) gaugeColor = "#f59e0b"; // amber
  else if (score < 90) gaugeColor = "#3b82f6"; // blue
  els.gaugeCircle.style.stroke = gaugeColor;

  els.gradeBadge.textContent = an.grade;
  els.gradeBadge.className = `grade-badge ${an.gradeBadgeClass}`;
  els.gradeCaption.textContent = getScoreDescription(score);

  // KPI Metric Cards
  els.completenessValue.textContent = `${an.metrics.completenessRate}%`;
  els.missingCellsTag.textContent = `${an.totalMissingCells} Missing`;
  els.completenessBar.style.width = `${an.metrics.completenessRate}%`;

  els.uniquenessValue.textContent = `${an.metrics.uniquenessRate}%`;
  els.duplicateRowsTag.textContent = `${an.duplicateRowCount} Duplicates`;
  els.uniquenessBar.style.width = `${an.metrics.uniquenessRate}%`;

  els.validityValue.textContent = `${an.metrics.validityRate}%`;
  els.typeMismatchesTag.textContent = `${an.totalTypeMismatches} Invalids`;
  els.validityBar.style.width = `${an.metrics.validityRate}%`;

  els.outliersValue.textContent = an.totalOutliers;
  els.outliersTag.textContent = `${an.totalOutliers} IQR Outliers`;
  const outlierBarWidth = Math.min(100, Math.max(5, an.totalOutliers * 5));
  els.outliersBar.style.width = an.totalOutliers > 0 ? `${outlierBarWidth}%` : "0%";

  // Tab 1: Render Columns Table & Charts
  renderColumnsMatrix(an.columns);
  renderCompletenessChart(an.columns);
  renderIssuesBreakdownChart(an);

  // Tab 2: Render Data Grid
  state.grid.currentPage = 1;
  renderDataGrid();

  // Tab 3: Render Statistical Profiler
  renderStatsTab(an.columns);

  // Tab 4: Prepare Cleaning Tab
  els.beforeScoreText.textContent = `${an.qualityScore}/100`;
  els.beforeRowsText.textContent = `${an.totalRows} Rows`;
  els.afterScoreText.textContent = "--";
  els.afterRowsText.textContent = "--";
  els.changesList.innerHTML = `<li>Click <strong>"Execute Smart Cleaning"</strong> to run automated fixes.</li>`;
  els.downloadCleanCsvBtn.disabled = true;
  els.downloadCleanXlsxBtn.disabled = true;

  // Tab 5: Populate Executive Audit Certificate
  populateAuditCertificate(an);
}

function getScoreDescription(score) {
  if (score >= 90) return "Optimal integrity. Dataset is production-ready for pipelines & ML models.";
  if (score >= 75) return "Good health with minor gaps. Recommended to clean whitespace and missing values.";
  if (score >= 60) return "Moderate defects detected. Requires deduplication and type normalization.";
  return "Severe degradation detected. Critical missing values and schema anomalies present.";
}

// ============================================================================
// Tab 1: Column Health Matrix & Charts
// ============================================================================
function renderColumnsMatrix(columns) {
  els.columnsMatrixTableBody.innerHTML = columns
    .map((col) => {
      const issues = [];
      if (col.missingCount > 0) issues.push(`⚠️ ${col.missingCount} missing`);
      if (col.typeMismatchCount > 0) issues.push(`❌ ${col.typeMismatchCount} invalid type`);
      if (col.stats && col.stats.outlierCount > 0) issues.push(`📈 ${col.stats.outlierCount} outliers`);
      if (issues.length === 0) issues.push(`✓ None`);

      return `
        <tr>
          <td><strong>${col.name}</strong></td>
          <td><span class="type-chip type-${col.type}">${col.type}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:6px;">
              <span>${col.completenessPct}%</span>
              <div style="width:50px;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;">
                <div style="width:${col.completenessPct}%;height:100%;background:#10b981;border-radius:2px;"></div>
              </div>
            </div>
          </td>
          <td>${col.uniquenessPct}%</td>
          <td>${col.missingCount.toLocaleString()}</td>
          <td>${col.distinctValuesCount.toLocaleString()}</td>
          <td><small style="color:${col.status === "danger" ? "#fda4af" : col.status === "warning" ? "#fde68a" : "#94a3b8"}">${issues.join(", ")}</small></td>
          <td><span class="status-badge status-${col.status}">${col.status.toUpperCase()}</span></td>
          <td>
            <button class="btn btn-sm btn-ghost" onclick="focusColumnInStats('${col.name}')" title="Profile this column">
              Inspect
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

// Global hook for inspect button
window.focusColumnInStats = function (colName) {
  const tabBtn = document.getElementById("tabBtnStats");
  if (tabBtn) tabBtn.click();
  if (els.statsColumnSelect) {
    els.statsColumnSelect.value = colName;
    els.statsColumnSelect.dispatchEvent(new Event("change"));
  }
};

function renderCompletenessChart(columns) {
  if (!columns || columns.length === 0) return;
  const maxBars = Math.min(columns.length, 12);
  const displayCols = columns.slice(0, maxBars);

  const svgWidth = 520;
  const svgHeight = 170;
  const barWidth = Math.floor((svgWidth - 60) / displayCols.length) - 8;

  let barsHtml = displayCols
    .map((col, idx) => {
      const x = 40 + idx * (barWidth + 8);
      const barHeight = (col.completenessPct / 100) * 110;
      const y = 135 - barHeight;
      const colColor = col.completenessPct > 90 ? "#10b981" : col.completenessPct > 70 ? "#f59e0b" : "#f43f5e";
      const shortName = col.name.length > 7 ? col.name.substring(0, 6) + "…" : col.name;

      return `
        <g class="chart-col-bar" title="${col.name}: ${col.completenessPct}% complete">
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="3" fill="${colColor}" opacity="0.85">
            <animate attributeName="height" from="0" to="${barHeight}" dur="0.6s" fill="freeze" />
            <animate attributeName="y" from="135" to="${y}" dur="0.6s" fill="freeze" />
          </rect>
          <text x="${x + barWidth / 2}" y="152" fill="#94a3b8" font-size="10" text-anchor="middle" font-family="monospace">${shortName}</text>
          <text x="${x + barWidth / 2}" y="${y - 4}" fill="#f8fafc" font-size="9" text-anchor="middle" font-weight="600">${Math.round(col.completenessPct)}%</text>
        </g>
      `;
    })
    .join("");

  els.completenessChartBody.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet">
      <!-- Gridlines -->
      <line x1="30" y1="25" x2="${svgWidth - 10}" y2="25" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3" />
      <line x1="30" y1="80" x2="${svgWidth - 10}" y2="80" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3" />
      <line x1="30" y1="135" x2="${svgWidth - 10}" y2="135" stroke="rgba(255,255,255,0.15)" />
      ${barsHtml}
    </svg>
  `;
}

function renderIssuesBreakdownChart(an) {
  const missing = an.totalMissingCells;
  const duplicates = an.duplicateRowCount;
  const typeErrors = an.totalTypeMismatches;
  const outliers = an.totalOutliers;
  const totalIssues = missing + duplicates + typeErrors + outliers;

  if (totalIssues === 0) {
    els.issuesBreakdownChartBody.innerHTML = `
      <div style="text-align:center;padding:1.5rem;color:#10b981;">
        <div style="font-size:2rem;margin-bottom:0.5rem;">🎉</div>
        <strong>Zero Anomalies Detected!</strong>
        <p style="font-size:0.75rem;color:#94a3b8;margin-top:4px;">100% clean dataset.</p>
      </div>
    `;
    return;
  }

  const items = [
    { label: "Missing Cells", count: missing, color: "#f43f5e" },
    { label: "Duplicates", count: duplicates, color: "#818cf8" },
    { label: "Type Invalids", count: typeErrors, color: "#f59e0b" },
    { label: "Outliers", count: outliers, color: "#06b6d4" }
  ].filter((it) => it.count > 0);

  const legendHtml = items
    .map(
      (it) => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:0.75rem;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="width:8px;height:8px;border-radius:50%;background:${it.color};"></span>
          <span>${it.label}</span>
        </div>
        <strong>${it.count}</strong>
      </div>
    `
    )
    .join("");

  els.issuesBreakdownChartBody.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;width:100%;">
      <div style="display:flex;height:12px;border-radius:6px;overflow:hidden;background:rgba(255,255,255,0.08);">
        ${items
          .map((it) => {
            const pct = (it.count / totalIssues) * 100;
            return `<div style="width:${pct}%;background:${it.color};" title="${it.label}: ${it.count} (${pct.toFixed(1)}%)"></div>`;
          })
          .join("")}
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${legendHtml}
      </div>
    </div>
  `;
}

// ============================================================================
// Tab 2: Data Explorer & Grid
// ============================================================================
function renderDataGrid() {
  const data = state.currentData;
  if (!data || data.length === 0) return;

  const columns = Object.keys(data[0]);

  // 1. Filter rows
  let filtered = data.filter((row) => {
    // Search query match
    if (state.grid.searchQuery) {
      const q = state.grid.searchQuery.toLowerCase();
      const match = Object.values(row).some((val) => String(val).toLowerCase().includes(q));
      if (!match) return false;
    }

    // Issue status match
    const hasMissing = Object.values(row).some((v) => v === null || v === undefined || String(v).trim() === "");
    if (state.grid.filter === "issues") {
      return hasMissing;
    } else if (state.grid.filter === "clean") {
      return !hasMissing;
    }
    return true;
  });

  // Update counts
  const totalIssuesCount = data.filter((r) =>
    Object.values(r).some((v) => v === null || v === undefined || String(v).trim() === "")
  ).length;

  els.allRowsCount.textContent = data.length;
  els.errorRowsCount.textContent = totalIssuesCount;
  els.cleanRowsCount.textContent = data.length - totalIssuesCount;

  // 2. Sort rows
  if (state.grid.sortColumn) {
    const col = state.grid.sortColumn;
    const dir = state.grid.sortDirection === "asc" ? 1 : -1;
    filtered.sort((a, b) => {
      const va = a[col];
      const vb = b[col];
      if (va === vb) return 0;
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      return va > vb ? dir : -dir;
    });
  }

  // 3. Paginate
  const totalRows = filtered.length;
  const pageSize = state.grid.pageSize;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  state.grid.currentPage = Math.min(state.grid.currentPage, totalPages);
  const startIdx = (state.grid.currentPage - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);

  // Render Table Header with Sort Carrots
  els.dataGridHead.innerHTML = `
    <tr>
      <th style="width: 45px;">#</th>
      ${columns
        .map((col) => {
          let sortIndicator = "↕";
          if (state.grid.sortColumn === col) {
            sortIndicator = state.grid.sortDirection === "asc" ? "▲" : "▼";
          }
          return `
            <th class="sortable-th" onclick="sortGridBy('${col}')">
              ${col} <span class="sort-icon">${sortIndicator}</span>
            </th>
          `;
        })
        .join("")}
    </tr>
  `;

  // Render Table Body with Cell Flaw Highlighting
  els.dataGridBody.innerHTML = pageRows
    .map((row, rIdx) => {
      const globalRowIdx = startIdx + rIdx + 1;
      const hasIssue = Object.values(row).some((v) => v === null || v === undefined || String(v).trim() === "");

      const cells = columns
        .map((col) => {
          const val = row[col];
          const isMissing = val === null || val === undefined || String(val).trim() === "";

          if (isMissing) {
            return `<td class="cell-missing" title="Missing / Null Value">&lt;empty&gt;</td>`;
          }

          // Check if invalid email or date
          if (col.toLowerCase().includes("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))) {
            return `<td class="cell-type-error" title="Invalid email syntax">${val}</td>`;
          }

          return `<td>${val}</td>`;
        })
        .join("");

      return `
        <tr class="${hasIssue ? "row-has-issues" : ""}">
          <td style="color:#64748b;font-family:monospace;font-size:0.75rem;">${globalRowIdx}</td>
          ${cells}
        </tr>
      `;
    })
    .join("");

  // Pagination Info & Controls
  els.paginationInfo.textContent = `Showing ${Math.min(startIdx + 1, totalRows)} to ${Math.min(startIdx + pageSize, totalRows)} of ${totalRows} rows`;
  els.prevPageBtn.disabled = state.grid.currentPage <= 1;
  els.nextPageBtn.disabled = state.grid.currentPage >= totalPages;

  // Page Numbers
  els.pageNumbersContainer.innerHTML = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const pageNum = i + 1;
    return `
      <button class="page-number-btn ${pageNum === state.grid.currentPage ? "active" : ""}" onclick="goToGridPage(${pageNum})">
        ${pageNum}
      </button>
    `;
  }).join("");
}

window.sortGridBy = function (col) {
  if (state.grid.sortColumn === col) {
    state.grid.sortDirection = state.grid.sortDirection === "asc" ? "desc" : "asc";
  } else {
    state.grid.sortColumn = col;
    state.grid.sortDirection = "asc";
  }
  renderDataGrid();
};

window.goToGridPage = function (page) {
  state.grid.currentPage = page;
  renderDataGrid();
};

// ============================================================================
// Tab 3: Statistical Profiler
// ============================================================================
function renderStatsTab(columns) {
  const numericCols = columns.filter((c) => c.type === "number" && c.stats);

  if (numericCols.length === 0) {
    els.statsColumnSelect.innerHTML = `<option value="">No numeric columns found</option>`;
    els.statsMetricsGrid.innerHTML = `<div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: #94a3b8;">No numeric columns available for statistical profiling.</div>`;
    els.histogramChartBody.innerHTML = "";
    return;
  }

  // Populate Select
  els.statsColumnSelect.innerHTML = numericCols
    .map((c) => `<option value="${c.name}">${c.name}</option>`)
    .join("");

  // Initial Profile on First Numeric Column
  updateStatsForColumn(numericCols[0].name);
}

function updateStatsForColumn(colName) {
  const an = state.originalAnalysis;
  if (!an) return;
  const col = an.columns.find((c) => c.name === colName);
  if (!col || !col.stats) return;

  const st = col.stats;

  // 1. Metric cards
  const metrics = [
    { label: "Count", val: st.count.toLocaleString() },
    { label: "Min", val: st.min },
    { label: "Max", val: st.max },
    { label: "Mean (Avg)", val: st.mean },
    { label: "Median", val: st.median },
    { label: "Std Deviation", val: st.stdDev },
    { label: "25th Pct (Q1)", val: st.q1 },
    { label: "75th Pct (Q3)", val: st.q3 },
    { label: "IQR (Spread)", val: st.iqr },
    { label: "IQR Outliers", val: st.outlierCount }
  ];

  els.statsMetricsGrid.innerHTML = metrics
    .map(
      (m) => `
      <div class="stat-metric-card">
        <span class="metric-label">${m.label}</span>
        <div class="metric-val">${m.val}</div>
      </div>
    `
    )
    .join("");

  // 2. Frequency Histogram
  els.histogramSubtitle.textContent = `Distribution of values across range [${st.min} to ${st.max}]`;
  renderHistogram(colName, st);

  // 3. Top frequent values
  els.topFrequencyList.innerHTML = col.topValues
    .map(
      (v) => `
      <div class="freq-item">
        <span style="font-family:monospace;min-width:80px;">${v.value}</span>
        <div class="freq-bar-bg">
          <div class="freq-bar-fill" style="width:${v.percentage}%"></div>
        </div>
        <span style="color:#94a3b8;font-size:0.75rem;">${v.count} (${v.percentage}%)</span>
      </div>
    `
    )
    .join("");
}

function renderHistogram(colName, st) {
  const allValues = state.currentData
    .map((r) => r[colName])
    .filter((v) => v !== null && v !== "" && !isNaN(Number(v)))
    .map(Number);

  if (allValues.length === 0) return;

  // Generate 7 histogram bins
  const binCount = 7;
  const binWidth = (st.max - st.min) / binCount || 1;
  const bins = Array(binCount).fill(0);

  allValues.forEach((v) => {
    let bIdx = Math.floor((v - st.min) / binWidth);
    if (bIdx >= binCount) bIdx = binCount - 1;
    bins[bIdx]++;
  });

  const maxFreq = Math.max(...bins, 1);
  const svgWidth = 560;
  const svgHeight = 160;
  const barW = Math.floor(svgWidth / binCount) - 10;

  const bars = bins
    .map((count, i) => {
      const x = 20 + i * (barW + 10);
      const bHeight = (count / maxFreq) * 105;
      const y = 130 - bHeight;
      const binStart = (st.min + i * binWidth).toFixed(0);

      return `
        <g>
          <rect x="${x}" y="${y}" width="${barW}" height="${bHeight}" fill="url(#histGrad)" rx="3" />
          <text x="${x + barW / 2}" y="${y - 4}" fill="#f8fafc" font-size="9" text-anchor="middle">${count}</text>
          <text x="${x + barW / 2}" y="146" fill="#94a3b8" font-size="9" text-anchor="middle" font-family="monospace">${binStart}</text>
        </g>
      `;
    })
    .join("");

  els.histogramChartBody.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}">
      <defs>
        <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#6366f1" />
        </linearGradient>
      </defs>
      <line x1="15" y1="130" x2="${svgWidth - 15}" y2="130" stroke="rgba(255,255,255,0.15)" />
      ${bars}
    </svg>
  `;
}

// ============================================================================
// Tab 4: Smart Remediation & Cleaning
// ============================================================================
function runDataCleaning() {
  const original = state.currentData;
  if (!original || original.length === 0) return;

  const dedup = els.cleanDedup.checked;
  const trim = els.cleanTrim.checked;
  const casing = els.cleanCasing.checked;
  const dropEmpty = els.cleanDropEmpty.checked;
  const imputeNum = els.cleanImputeNum.value;
  const imputeText = els.cleanImputeText.value;

  let cleaned = JSON.parse(JSON.stringify(original));
  const logs = [];

  // Column stats for imputation
  const cols = Object.keys(original[0]);
  const colMeans = {};
  const colMedians = {};

  cols.forEach((col) => {
    const nums = original
      .map((r) => r[col])
      .filter((v) => v !== null && v !== "" && !isNaN(Number(v)))
      .map(Number);
    if (nums.length > 0) {
      const sum = nums.reduce((a, b) => a + b, 0);
      const sorted = [...nums].sort((a, b) => a - b);
      colMeans[col] = Number((sum / nums.length).toFixed(2));
      colMedians[col] = sorted[Math.floor(sorted.length / 2)];
    }
  });

  // 1. Deduplication
  let dupCount = 0;
  if (dedup) {
    const seen = new Set();
    const unique = [];
    cleaned.forEach((row) => {
      const str = JSON.stringify(row);
      if (seen.has(str)) {
        dupCount++;
      } else {
        seen.add(str);
        unique.push(row);
      }
    });
    cleaned = unique;
    if (dupCount > 0) logs.push(`Removed <strong>${dupCount}</strong> exact duplicate records.`);
  }

  // 2. Drop 100% empty rows
  let emptyRowCount = 0;
  if (dropEmpty) {
    cleaned = cleaned.filter((row) => {
      const allEmpty = Object.values(row).every((v) => v === null || v === undefined || String(v).trim() === "");
      if (allEmpty) {
        emptyRowCount++;
        return false;
      }
      return true;
    });
    if (emptyRowCount > 0) logs.push(`Dropped <strong>${emptyRowCount}</strong> completely empty rows.`);
  }

  // 3. Transformations & Imputation
  let trimmedCount = 0;
  let imputedCount = 0;
  let casingCount = 0;

  cleaned = cleaned.map((row) => {
    cols.forEach((col) => {
      let val = row[col];

      // Trim whitespace
      if (trim && typeof val === "string") {
        const trimmedVal = val.trim();
        if (trimmedVal !== val) {
          trimmedCount++;
          val = trimmedVal;
        }
      }

      // Standardize casing
      if (casing && typeof val === "string" && val.length > 0) {
        if (col.toLowerCase().includes("email")) {
          val = val.toLowerCase();
          casingCount++;
        } else if (col.toLowerCase().includes("name") || col.toLowerCase().includes("country") || col.toLowerCase().includes("city")) {
          val = val.charAt(0).toUpperCase() + val.slice(1);
          casingCount++;
        }
      }

      // Impute missing
      if (val === null || val === undefined || String(val).trim() === "") {
        if (imputeNum === "mean" && colMeans[col] !== undefined) {
          val = colMeans[col];
          imputedCount++;
        } else if (imputeNum === "median" && colMedians[col] !== undefined) {
          val = colMedians[col];
          imputedCount++;
        } else if (imputeNum === "zero") {
          val = 0;
          imputedCount++;
        } else if (imputeText === "NA") {
          val = "N/A";
          imputedCount++;
        }
      }

      row[col] = val;
    });
    return row;
  });

  if (trimmedCount > 0) logs.push(`Trimmed extraneous whitespace on <strong>${trimmedCount}</strong> values.`);
  if (casingCount > 0) logs.push(`Standardized naming & email casing on <strong>${casingCount}</strong> values.`);
  if (imputedCount > 0) logs.push(`Imputed <strong>${imputedCount}</strong> null/missing values.`);

  if (logs.length === 0) {
    logs.push("Dataset was already optimal; no adjustments were required.");
  }

  // Calculate new score
  const newAnalysis = performDatasetAudit(cleaned, "cleaned_" + state.fileName);
  state.cleanedData = cleaned;
  state.cleanedAnalysis = newAnalysis;

  // Render before/after impact
  els.afterScoreText.textContent = `${newAnalysis.qualityScore}/100`;
  els.afterRowsText.textContent = `${newAnalysis.totalRows} Rows`;
  els.changesList.innerHTML = logs.map((l) => `<li>${l}</li>`).join("");

  // Enable download buttons
  els.downloadCleanCsvBtn.disabled = false;
  els.downloadCleanXlsxBtn.disabled = false;

  showToast(`Cleaning complete! Score boosted to ${newAnalysis.qualityScore}/100`, "success");
}

function exportCleanedFile(format = "csv") {
  const data = state.cleanedData;
  if (!data || data.length === 0) return;

  const baseName = state.fileName.replace(/\.[^/.]+$/, "");
  const exportName = `${baseName}_verity_cleaned.${format}`;

  if (format === "csv") {
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];

    data.forEach((row) => {
      const values = headers.map((h) => {
        const val = row[h] === null || row[h] === undefined ? "" : String(row[h]);
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, exportName);
  } else if (format === "xlsx" && window.XLSX) {
    const ws = window.XLSX.utils.json_to_sheet(data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "CleanedData");
    window.XLSX.writeFile(wb, exportName);
  }
}

function downloadBlob(blob, fileName) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  showToast(`Downloaded ${fileName}`, "success");
}

// ============================================================================
// Tab 5: Executive Audit Report
// ============================================================================
function populateAuditCertificate(an) {
  els.reportDocId.textContent = `DV-${Date.now().toString(36).toUpperCase()}`;
  els.reportGradeStamp.textContent = an.stampGrade;
  els.reportDatasetName.textContent = an.fileName;
  els.reportDate.textContent = new Date().toLocaleDateString();
  els.reportDimensions.textContent = `${an.totalRows} Rows × ${an.totalColumns} Columns (${an.totalCells} Cells)`;
  els.reportOverallScore.textContent = `${an.qualityScore}/100`;
  els.reportCompleteness.textContent = `${an.metrics.completenessRate}%`;
  els.reportUniqueness.textContent = `${an.metrics.uniquenessRate}%`;

  // ISO/IEC 25012 Data Quality Model Matrix
  const dimensions = [
    {
      dimension: "Completeness",
      criteria: "Absence of null, undefined, or empty values across all attributes",
      status: `${an.metrics.completenessRate}% (${an.totalMissingCells} missing)`,
      compliance: an.metrics.completenessRate >= 95 ? "✓ Compliant" : "⚠️ Degraded"
    },
    {
      dimension: "Uniqueness",
      criteria: "Absence of identical duplicate records",
      status: `${an.metrics.uniquenessRate}% (${an.duplicateRowCount} duplicates)`,
      compliance: an.metrics.uniquenessRate >= 98 ? "✓ Compliant" : "⚠️ Degraded"
    },
    {
      dimension: "Syntactic Validity",
      criteria: "Adherence to declared column data types and regex formats",
      status: `${an.metrics.validityRate}% (${an.totalTypeMismatches} mismatches)`,
      compliance: an.metrics.validityRate >= 95 ? "✓ Compliant" : "⚠️ Warning"
    },
    {
      dimension: "Statistical Consistency",
      criteria: "Absence of extreme outliers beyond 1.5 × Interquartile Range",
      status: `${an.totalOutliers} outliers detected`,
      compliance: an.totalOutliers === 0 ? "✓ Compliant" : "⚠️ Outliers Present"
    }
  ];

  els.reportStandardsBody.innerHTML = dimensions
    .map(
      (d) => `
      <tr>
        <td><strong>${d.dimension}</strong></td>
        <td>${d.criteria}</td>
        <td>${d.status}</td>
        <td style="font-weight:600;color:${d.compliance.includes("✓") ? "#059669" : "#d97706"};">${d.compliance}</td>
      </tr>
    `
    )
    .join("");

  // Findings list
  const findings = [];
  if (an.totalMissingCells > 0) {
    findings.push(`Implement upstream null-checks. Impute ${an.totalMissingCells} missing cells using automated imputation rules.`);
  }
  if (an.duplicateRowCount > 0) {
    findings.push(`Deduplicate the ${an.duplicateRowCount} redundant rows to preserve primary key uniqueness and prevent double-counting.`);
  }
  if (an.totalTypeMismatches > 0) {
    findings.push(`Standardize format parsing: resolve ${an.totalTypeMismatches} text/number/email syntax violations.`);
  }
  if (an.totalOutliers > 0) {
    findings.push(`Review ${an.totalOutliers} statistical outliers to determine whether they represent valid edge cases or sensor/input errors.`);
  }
  if (findings.length === 0) {
    findings.push("No material data flaws were identified. Dataset conforms to enterprise ingestion standards.");
  }

  els.reportFindingsList.innerHTML = findings.map((f) => `<li>${f}</li>`).join("");
}

// ============================================================================
// Event Listeners & Initialization
// ============================================================================
function setupEventListeners() {
  // Server Check
  els.checkServerBtn.addEventListener("click", checkServerStatus);

  // Dropdown Sample Menu
  els.sampleDataDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    els.sampleDataMenu.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    els.sampleDataMenu.classList.remove("show");
  });

  // Sample Loaders
  els.loadSampleCustomers.addEventListener("click", () => loadDatasetDirectly(EMBEDDED_SAMPLES.customers, "customers_crm.csv"));
  els.loadSampleTransactions.addEventListener("click", () => loadDatasetDirectly(EMBEDDED_SAMPLES.transactions, "transactions_ledger.csv"));
  els.loadSampleBenchmark.addEventListener("click", () => loadDatasetDirectly(EMBEDDED_SAMPLES.benchmark, "benchmark_clean.csv"));

  els.chipSampleCustomers.addEventListener("click", () => loadDatasetDirectly(EMBEDDED_SAMPLES.customers, "customers_crm.csv"));
  els.chipSampleTxn.addEventListener("click", () => loadDatasetDirectly(EMBEDDED_SAMPLES.transactions, "transactions_ledger.csv"));
  els.chipSampleBench.addEventListener("click", () => loadDatasetDirectly(EMBEDDED_SAMPLES.benchmark, "benchmark_clean.csv"));

  // Reset
  els.resetBtn.addEventListener("click", () => {
    state.currentData = [];
    state.cleanedData = [];
    state.originalAnalysis = null;
    els.resultsSection.style.display = "none";
    els.uploadSection.style.display = "block";
    els.resetBtn.style.display = "none";
    els.datasetInput.value = "";
    showToast("Dashboard reset for new upload", "info");
  });

  // Drag & Drop
  const dropZone = els.dropZone;
  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
    });
  });

  dropZone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileProcess(files[0]);
    }
  });

  // File Picker
  els.datasetInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  });

  // Paste Modal
  els.pasteDataBtn.addEventListener("click", () => {
    els.pasteModal.style.display = "flex";
    els.rawTextInput.focus();
  });

  const hidePasteModal = () => (els.pasteModal.style.display = "none");
  els.closePasteModal.addEventListener("click", hidePasteModal);
  els.cancelPasteBtn.addEventListener("click", hidePasteModal);

  els.submitPasteBtn.addEventListener("click", () => {
    const raw = els.rawTextInput.value.trim();
    if (!raw) {
      showToast("Please paste CSV or JSON data first.", "warning");
      return;
    }

    try {
      let rows;
      if (raw.startsWith("[") || raw.startsWith("{")) {
        const parsed = JSON.parse(raw);
        rows = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        rows = parseCSV(raw);
      }
      hidePasteModal();
      loadDatasetDirectly(rows, "pasted_dataset.csv");
    } catch (err) {
      showToast(`Parse failed: ${err.message}`, "error");
    }
  });

  // Workspace Tabs
  els.tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");

      els.tabButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      els.tabPanels.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // Grid Controls
  els.gridSearchInput.addEventListener("input", (e) => {
    state.grid.searchQuery = e.target.value.trim();
    state.grid.currentPage = 1;
    renderDataGrid();
  });

  els.filterAllRows.addEventListener("click", () => {
    setActiveFilter(els.filterAllRows, "all");
  });
  els.filterErrorRows.addEventListener("click", () => {
    setActiveFilter(els.filterErrorRows, "issues");
  });
  els.filterCleanRows.addEventListener("click", () => {
    setActiveFilter(els.filterCleanRows, "clean");
  });

  function setActiveFilter(btn, filterMode) {
    [els.filterAllRows, els.filterErrorRows, els.filterCleanRows].forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.grid.filter = filterMode;
    state.grid.currentPage = 1;
    renderDataGrid();
  }

  els.pageSizeSelect.addEventListener("change", (e) => {
    state.grid.pageSize = parseInt(e.target.value, 10);
    state.grid.currentPage = 1;
    renderDataGrid();
  });

  els.prevPageBtn.addEventListener("click", () => {
    if (state.grid.currentPage > 1) {
      state.grid.currentPage--;
      renderDataGrid();
    }
  });

  els.nextPageBtn.addEventListener("click", () => {
    state.grid.currentPage++;
    renderDataGrid();
  });

  // Stats Column Change
  els.statsColumnSelect.addEventListener("change", (e) => {
    updateStatsForColumn(e.target.value);
  });

  // Cleaning Actions
  els.runCleanBtn.addEventListener("click", runDataCleaning);
  els.downloadCleanCsvBtn.addEventListener("click", () => exportCleanedFile("csv"));
  els.downloadCleanXlsxBtn.addEventListener("click", () => exportCleanedFile("xlsx"));

  // Report Actions
  els.printReportBtn.addEventListener("click", () => {
    document.getElementById("tabBtnReport").click();
    setTimeout(() => window.print(), 250);
  });
  els.btnReportPrint.addEventListener("click", () => window.print());

  // Hero Demo Button
  const heroDemoBtn = document.getElementById("heroDemoBtn");
  if (heroDemoBtn) {
    heroDemoBtn.addEventListener("click", () => {
      loadDatasetDirectly(EMBEDDED_SAMPLES.customers, "customers_crm.csv");
      const analyzerEl = document.getElementById("analyzer");
      if (analyzerEl) analyzerEl.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Interactive ROI Calculator
  const calcRowsRange = document.getElementById("calcRowsRange");
  const calcErrorRateRange = document.getElementById("calcErrorRateRange");
  const calcRowsVal = document.getElementById("calcRowsVal");
  const calcErrorRateVal = document.getElementById("calcErrorRateVal");
  const resFlawsCount = document.getElementById("resFlawsCount");
  const resHoursSaved = document.getElementById("resHoursSaved");
  const resCostSaved = document.getElementById("resCostSaved");

  function updateRoiCalculator() {
    if (!calcRowsRange || !calcErrorRateRange) return;
    const rows = parseInt(calcRowsRange.value, 10);
    const errorRate = parseInt(calcErrorRateRange.value, 10);

    calcRowsVal.textContent = `${rows.toLocaleString()} Rows`;
    calcErrorRateVal.textContent = `${errorRate}%`;

    const flaws = Math.round(rows * (errorRate / 100));
    const hours = Math.max(1, Math.round(flaws * 0.007));
    const cost = Math.round(hours * 75);

    if (resFlawsCount) resFlawsCount.textContent = flaws.toLocaleString();
    if (resHoursSaved) resHoursSaved.textContent = `${hours} hrs`;
    if (resCostSaved) resCostSaved.textContent = `$${cost.toLocaleString()}`;
  }

  if (calcRowsRange && calcErrorRateRange) {
    calcRowsRange.addEventListener("input", updateRoiCalculator);
    calcErrorRateRange.addEventListener("input", updateRoiCalculator);
    updateRoiCalculator();
  }

  // FAQ Accordion
  const faqQuestions = document.querySelectorAll(".faq-question");
  faqQuestions.forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains("active");

      // Close all other items
      document.querySelectorAll(".faq-item").forEach((it) => {
        it.classList.remove("active");
        const btn = it.querySelector(".faq-question");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("active");
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  const exportAuditJSON = () => {
    if (!state.originalAnalysis) return;
    const blob = new Blob([JSON.stringify(state.originalAnalysis, null, 2)], { type: "application/json" });
    downloadBlob(blob, `${state.fileName}_quality_audit.json`);
  };
  els.exportAuditJsonBtn.addEventListener("click", exportAuditJSON);
  els.btnReportDownloadJson.addEventListener("click", exportAuditJSON);
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  checkServerStatus();
});

const express = require("express");
const path = require("path");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Expose SheetJS vendor script directly so frontend can load it offline without CDN issues
const sheetJsPath = path.join(__dirname, "node_modules", "xlsx", "dist", "xlsx.full.min.js");
if (fs.existsSync(sheetJsPath)) {
  app.get("/vendor/xlsx.full.min.js", (req, res) => {
    res.sendFile(sheetJsPath);
  });
}

// Memory storage for multer file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

// Helper: Statistical analysis on numbers
function calculateStats(numbers) {
  if (!numbers || numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const n = sorted.length;
  const min = sorted[0];
  const max = sorted[n - 1];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  // Median
  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  // Standard Deviation
  const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance);

  // Quartiles & IQR Outliers
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
    q1,
    q3,
    iqr: Number(iqr.toFixed(2)),
    outlierCount: outliers.length,
    outliers: outliers.slice(0, 10),
    zeroCount: numbers.filter((v) => v === 0).length,
    negativeCount: numbers.filter((v) => v < 0).length
  };
}

// Helper: Type inference
function inferType(values) {
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

// Core Data Quality Analyzer Function
function analyzeDataset(rows, fileName = "dataset") {
  if (!rows || rows.length === 0) {
    return {
      error: "The uploaded dataset is empty.",
      totalRows: 0,
      totalColumns: 0,
      columns: [],
      qualityScore: 0
    };
  }

  const columns = Object.keys(rows[0]);
  const totalRows = rows.length;
  const totalCols = columns.length;
  const totalCells = totalRows * totalCols;

  let totalMissingCells = 0;
  let totalTypeMismatches = 0;
  let totalOutliers = 0;

  // Duplicate rows check
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

    const detectedType = inferType(nonNullValues);
    const distinctValuesCount = Object.keys(valueFrequencies).length;
    const completenessPct = totalRows > 0 ? Number((((totalRows - missingCount) / totalRows) * 100).toFixed(1)) : 0;
    const uniquenessPct = nonNullValues.length > 0 ? Number(((distinctValuesCount / nonNullValues.length) * 100).toFixed(1)) : 0;

    // Type validation & Stats
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
      stats = calculateStats(numericValues);
      if (stats) {
        totalOutliers += stats.outlierCount;
      }
    }

    // Top frequent values
    const topValues = Object.entries(valueFrequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({ value, count, percentage: Number(((count / (nonNullValues.length || 1)) * 100).toFixed(1)) }));

    // Column status
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

  // Calculate Weighted Quality Score (0 to 100)
  // Weights: Completeness (35%), Uniqueness (20%), Validity (25%), Consistency/No Outliers (20%)
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

  // Score tier
  let grade = "Excellent";
  let gradeColor = "#10b981"; // green
  if (qualityScore < 60) {
    grade = "Critical Attention Required";
    gradeColor = "#f43f5e"; // red
  } else if (qualityScore < 75) {
    grade = "Needs Improvement";
    gradeColor = "#f59e0b"; // amber
  } else if (qualityScore < 90) {
    grade = "Good Quality";
    gradeColor = "#3b82f6"; // blue
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
    gradeColor,
    metrics: {
      completenessRate: Number((completenessRate * 100).toFixed(1)),
      uniquenessRate: Number((uniquenessRate * 100).toFixed(1)),
      validityRate: Number((validityRate * 100).toFixed(1)),
      consistencyRate: Number((consistencyRate * 100).toFixed(1))
    },
    columns: columnProfiles,
    sampleRows: rows.slice(0, 100) // first 100 rows for preview
  };
}

// Built-in Sample Datasets for 1-click testing
const SAMPLE_DATASETS = {
  customers: [
    { id: 101, name: "Alice Jenkins", email: "alice.j@example.com", age: 34, country: "USA", balance: 4500, signup_date: "2023-01-15" },
    { id: 102, name: "Bob Martin", email: "bob.martin@corp", age: 29, country: "UK", balance: 1200, signup_date: "2023-02-18" }, // invalid email
    { id: 103, name: "Carlos Rossi", email: "carlos@rossi.it", age: null, country: "Italy", balance: 9800, signup_date: "2023-03-01" }, // missing age
    { id: 104, name: "Diana Prince", email: "diana.p@gmail.com", age: 41, country: "Canada", balance: 15400, signup_date: "2023-04-12" },
    { id: 104, name: "Diana Prince", email: "diana.p@gmail.com", age: 41, country: "Canada", balance: 15400, signup_date: "2023-04-12" }, // exact duplicate row
    { id: 105, name: "Ethan Hunt", email: "ethan@imf.org", age: -5, country: "USA", balance: 750000, signup_date: "invalid-date" }, // negative age, outlier balance, bad date
    { id: 106, name: "Fiona Gallagher", email: "fiona@gallagher.com", age: 28, country: "", balance: 350, signup_date: "2023-06-21" }, // missing country
    { id: 107, name: "George Clark", email: "george@clark.com", age: 52, country: "UK", balance: 6700, signup_date: "2023-07-09" },
    { id: 108, name: "Hannah Abbott", email: "hannah@hogwarts.uk", age: 31, country: "UK", balance: 5100, signup_date: "2023-08-14" },
    { id: 109, name: "Ian Malcolm", email: "ian@jurassic.org", age: 46, country: "USA", balance: 11200, signup_date: "2023-09-03" },
    { id: 110, name: "Julia Roberts", email: "julia@hollywood.com", age: "N/A", country: "USA", balance: 45000, signup_date: "2023-09-25" }, // text in numeric age
    { id: 111, name: "Kevin Bacon", email: "kevin@sixdegrees.com", age: 65, country: "USA", balance: 8900, signup_date: "2023-10-10" },
    { id: 112, name: "Laura Croft", email: "laura@tomb.org", age: 32, country: "UK", balance: 92000, signup_date: "2023-10-31" },
    { id: 113, name: "Michael Scott", email: "michael@dundermifflin.com", age: 45, country: "USA", balance: 120, signup_date: "2023-11-05" },
    { id: 114, name: "Nina Simone", email: "", age: 39, country: "France", balance: 24000, signup_date: "2023-11-19" }, // missing email
    { id: 115, name: "Oscar Martinez", email: "oscar@accounting.com", age: 37, country: "USA", balance: 8300, signup_date: "2023-12-01" },
    { id: 115, name: "Oscar Martinez", email: "oscar@accounting.com", age: 37, country: "USA", balance: 8300, signup_date: "2023-12-01" }, // duplicate row
    { id: 116, name: "Pam Beesly", email: "pam@art.org", age: 33, country: "USA", balance: 4100, signup_date: "2023-12-15" }
  ],
  transactions: [
    { txn_id: "TXN-001", amount: 150.50, currency: "USD", status: "COMPLETED", merchant: "Amazon", date: "2024-01-05" },
    { txn_id: "TXN-002", amount: -45.00, currency: "USD", status: "REFUNDED", merchant: "Walmart", date: "2024-01-06" }, // negative amount
    { txn_id: "TXN-003", amount: 999999.00, currency: "USD", status: "FLAGGED", merchant: "Offshore Bank", date: "2024-01-07" }, // outlier
    { txn_id: "TXN-004", amount: 12.99, currency: "EUR", status: "COMPLETED", merchant: "Spotify", date: "2024-01-08" },
    { txn_id: "TXN-005", amount: 84.20, currency: "GBP", status: "PENDING", merchant: "Tesco", date: "2024-01-09" },
    { txn_id: "TXN-005", amount: 84.20, currency: "GBP", status: "PENDING", merchant: "Tesco", date: "2024-01-09" }, // duplicate txn
    { txn_id: "TXN-006", amount: null, currency: "USD", status: "FAILED", merchant: "Uber", date: "2024-01-10" }, // null amount
    { txn_id: "TXN-007", amount: 230.00, currency: "", status: "COMPLETED", merchant: "Apple Store", date: "2024-01-11" }, // missing currency
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

// API Endpoints

// 1. Health & Server Status
app.get("/api/status", (req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());
  res.json({
    status: "online",
    message: "DataVerity API Server is operational",
    version: "1.0.0",
    port: PORT,
    uptime: `${uptimeSeconds}s`,
    timestamp: new Date().toISOString(),
    features: ["csv", "xlsx", "xls", "json", "data-profiler", "auto-cleaning"]
  });
});

// 2. Fetch Sample Datasets
app.get("/api/sample/:name", (req, res) => {
  const name = req.params.name;
  if (!SAMPLE_DATASETS[name]) {
    return res.status(404).json({ error: `Sample '${name}' not found. Available: customers, transactions, benchmark` });
  }

  const analysis = analyzeDataset(SAMPLE_DATASETS[name], `sample_${name}.json`);
  res.json({
    datasetName: name,
    data: SAMPLE_DATASETS[name],
    analysis
  });
});

// 3. File Upload & Analysis Endpoint (Multer + xlsx parser)
app.post("/api/analyze", upload.single("file"), (req, res) => {
  try {
    let rows = [];
    let fileName = "dataset";

    if (req.file) {
      fileName = req.file.originalname;
      const buffer = req.file.buffer;

      // Parse with SheetJS
      const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      rows = xlsx.utils.sheet_to_json(worksheet, { defval: null });
    } else if (req.body.data && Array.isArray(req.body.data)) {
      rows = req.body.data;
      fileName = req.body.fileName || "raw_data.json";
    } else {
      return res.status(400).json({ error: "No file or data provided for analysis." });
    }

    const analysis = analyzeDataset(rows, fileName);
    res.json({ success: true, analysis });
  } catch (err) {
    console.error("Error analyzing dataset:", err);
    res.status(500).json({ error: "Failed to parse and analyze file: " + err.message });
  }
});

// 4. Data Cleaning & Remediation Endpoint
app.post("/api/clean", (req, res) => {
  try {
    const { data, options } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: "Valid dataset array required for cleaning." });
    }

    const {
      removeDuplicates = true,
      trimWhitespace = true,
      standardizeCasing = false,
      imputeMissingNumber = "none", // 'mean', 'median', 'zero', 'none'
      imputeMissingText = "none", // 'NA', 'none'
      dropEmptyRows = true
    } = options || {};

    let cleaned = [...data];
    let changesApplied = {
      duplicatesRemoved: 0,
      emptyRowsDropped: 0,
      valuesTrimmed: 0,
      casingAdjusted: 0,
      imputedCount: 0
    };

    // Calculate column means/medians if imputation requested
    const cols = Object.keys(data[0] || {});
    const colStats = {};
    if (imputeMissingNumber !== "none") {
      cols.forEach((col) => {
        const nums = data
          .map((r) => r[col])
          .filter((v) => v !== null && v !== "" && !isNaN(Number(v)))
          .map(Number);
        if (nums.length > 0) {
          const sum = nums.reduce((a, b) => a + b, 0);
          const sorted = [...nums].sort((a, b) => a - b);
          colStats[col] = {
            mean: Number((sum / nums.length).toFixed(2)),
            median: sorted[Math.floor(sorted.length / 2)]
          };
        }
      });
    }

    // 1. Deduplication
    if (removeDuplicates) {
      const seen = new Set();
      const unique = [];
      for (const row of cleaned) {
        const str = JSON.stringify(row);
        if (seen.has(str)) {
          changesApplied.duplicatesRemoved++;
        } else {
          seen.add(str);
          unique.push(row);
        }
      }
      cleaned = unique;
    }

    // 2. Row by row transformations
    cleaned = cleaned.filter((row) => {
      // Check if completely empty
      if (dropEmptyRows) {
        const allEmpty = Object.values(row).every((v) => v === null || v === undefined || String(v).trim() === "");
        if (allEmpty) {
          changesApplied.emptyRowsDropped++;
          return false;
        }
      }
      return true;
    }).map((row) => {
      const newRow = { ...row };
      cols.forEach((col) => {
        let val = newRow[col];

        // Trim string
        if (trimWhitespace && typeof val === "string") {
          const trimmed = val.trim();
          if (trimmed !== val) {
            changesApplied.valuesTrimmed++;
            val = trimmed;
          }
        }

        // Standardize Casing
        if (standardizeCasing && typeof val === "string" && val.length > 0) {
          if (col.toLowerCase().includes("email")) {
            val = val.toLowerCase();
          } else if (col.toLowerCase().includes("name") || col.toLowerCase().includes("city") || col.toLowerCase().includes("country")) {
            val = val.charAt(0).toUpperCase() + val.slice(1);
          }
        }

        // Impute missing values
        if (val === null || val === undefined || val === "") {
          if (imputeMissingNumber === "mean" && colStats[col]) {
            val = colStats[col].mean;
            changesApplied.imputedCount++;
          } else if (imputeMissingNumber === "median" && colStats[col]) {
            val = colStats[col].median;
            changesApplied.imputedCount++;
          } else if (imputeMissingNumber === "zero" && colStats[col]) {
            val = 0;
            changesApplied.imputedCount++;
          } else if (imputeMissingText === "NA") {
            val = "N/A";
            changesApplied.imputedCount++;
          }
        }

        newRow[col] = val;
      });
      return newRow;
    });

    const newAnalysis = analyzeDataset(cleaned, "cleaned_dataset");

    res.json({
      success: true,
      changesApplied,
      originalRowCount: data.length,
      cleanedRowCount: cleaned.length,
      cleanedData: cleaned,
      newAnalysis
    });
  } catch (err) {
    console.error("Error cleaning dataset:", err);
    res.status(500).json({ error: "Data cleaning failed: " + err.message });
  }
});

// Fallback to index.html for single-page routing (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 DataVerity Server Running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📡 API Status: http://localhost:${PORT}/api/status`);
  console.log(`=========================================`);
});

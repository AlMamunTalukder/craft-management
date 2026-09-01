/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import {
  Search,
  Add,
  Visibility,
  Download,
  Receipt,
  CalendarMonth,
  TrendingUp,
  AccountBalance,
  Print,
  PictureAsPdf,
  FilterAlt,
  ArrowForward,
  History,
} from "@mui/icons-material";
import CraftTable from "@/components/Table";
import { useGetAllIncomesQuery } from "@/redux/api/incomeApi";
import AddIncomeModal from "../_components/AddIncomeDialog";
import { useGetAllIncomeCategoriesQuery } from "@/redux/api/incomeCategoryApi";
import { useGetAllFeesQuery } from "@/redux/api/feesApi";
import { Column, RowAction } from "@/interface/table";
import jsPDF from "jspdf";

// Helper: format
const fmt = (n: number) => `৳${(n || 0).toLocaleString("en-BD")}`;
const monthName = (key: string) => {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};
const getQuarter = (m: number) => {
  if (m <= 3) return "Q1";
  if (m <= 6) return "Q2";
  if (m <= 9) return "Q3";
  return "Q4";
};

export default function IncomeManagement() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchView, setSearchView] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"monthly" | "yearly" | "last4" | "last6" | "last12" | "custom">("monthly");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  const { data, isLoading } = useGetAllIncomesQuery({});
  const incomeRecords: any[] = data?.data?.incomes || [];
  const { data: incomeCategories } = useGetAllIncomeCategoriesQuery({});
  const { data: feesData, isLoading: feesLoading } = useGetAllFeesQuery({ limit: 1000 });
  const feesRecords: any[] = Array.isArray((feesData as any)?.data?.fees)
    ? (feesData as any).data.fees
    : Array.isArray((feesData as any)?.data?.data)
      ? (feesData as any).data.data
      : Array.isArray((feesData as any)?.data)
        ? (feesData as any).data
        : [];

  // Group by YYYY-MM based on incomeDate + Paid Fees (asIncome)
  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number; count: number; items: any[] }>();
    incomeRecords.forEach((inc: any) => {
      const d = inc.incomeDate ? new Date(inc.incomeDate) : new Date(inc.createdAt);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const cur = map.get(key) || { income: 0, count: 0, items: [] };
      cur.income += Number(inc.totalAmount || 0);
      cur.count += 1;
      cur.items.push({ ...inc, _source: "other", _date: d });
      map.set(key, cur);
    });
    // Merge Paid Student Fees as income (from profile Paid tab: fees where status=paid + paidAmount)
    feesRecords.forEach((fee: any) => {
      const paid = Number(fee.paidAmount || 0);
      if (paid <= 0) return;
      if (fee.status !== "paid" && fee.status !== "partial") return;
      const d = fee.paymentDate ? new Date(fee.paymentDate) : fee.updatedAt ? new Date(fee.updatedAt) : null;
      if (!d || isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const cur = map.get(key) || { income: 0, count: 0, items: [] };
      cur.income += paid;
      cur.count += 1;
      cur.items.push({ ...fee, _source: "student_fee", _date: d, totalAmount: paid, incomeDate: d, category: { name: fee.feeType || "Student Fee" } });
      map.set(key, cur);
    });

    const sortedKeys = Array.from(map.keys()).sort();
    const rows: any[] = [];
    let prevTotal = 0;
    sortedKeys.forEach((key) => {
      const v = map.get(key)!;
      const [y, m] = key.split("-").map(Number);
      const prevSurplus = prevTotal;
      const totalIncome = v.income + prevSurplus;
      rows.push({
        id: key,
        monthKey: key,
        monthName: monthName(key),
        year: String(y),
        quarter: getQuarter(m),
        monthNum: m,
        income: v.income,
        prevSurplus,
        totalIncome,
        count: v.count,
        items: v.items,
      });
      prevTotal = totalIncome;
    });
    return rows;
  }, [incomeRecords]);

  // Filters: yearly, custom months, search
  const filteredRows = useMemo(() => {
    let r = [...monthlyData];
    if (selectedYear !== "all") r = r.filter((x) => x.year === selectedYear);
    if (viewMode === "last4") r = [...r].sort((a, b) => a.monthKey.localeCompare(b.monthKey)).slice(-4);
    if (viewMode === "last6") r = [...r].sort((a, b) => a.monthKey.localeCompare(b.monthKey)).slice(-6);
    if (viewMode === "last12") r = [...r].sort((a, b) => a.monthKey.localeCompare(b.monthKey)).slice(-12);
    if (viewMode === "custom" && customFrom && customTo) {
      r = r.filter((x) => x.monthKey >= customFrom && x.monthKey <= customTo);
    }
    if (viewMode === "yearly") {
      // aggregate by year
      const yMap = new Map<string, any>();
      r.forEach((row) => {
        const cur = yMap.get(row.year) || { year: row.year, income: 0, prevSurplus: 0, totalIncome: 0, count: 0, months: [] };
        cur.income += row.income;
        cur.count += row.count;
        cur.months.push(row.monthName);
        yMap.set(row.year, cur);
      });
      // recompute surplus yearly
      const years = Array.from(yMap.keys()).sort();
      let prev = 0;
      const out: any[] = [];
      years.forEach((y) => {
        const cur = yMap.get(y);
        cur.prevSurplus = prev;
        cur.totalIncome = cur.income + prev;
        cur.id = y;
        cur.monthKey = y;
        cur.monthName = `${y} (Yearly)`;
        cur.quarter = "Year";
        prev = cur.totalIncome;
        out.push(cur);
      });
      r = out;
    }
    if (searchView) {
      r = r.filter((x) => x.monthName.toLowerCase().includes(searchView.toLowerCase()));
    }
    return r.reverse(); // latest first
  }, [monthlyData, selectedYear, viewMode, searchView]);

  const isFeesLoading = feesLoading;
  const years = useMemo(() => Array.from(new Set(monthlyData.map((x) => x.year))).sort().reverse(), [monthlyData]);
  const totalYearly = useMemo(() => filteredRows.reduce((s, r) => s + r.income, 0), [filteredRows]);
  const avgMonthly = filteredRows.length ? Math.round(totalYearly / filteredRows.length) : 0;
  const lastSurplus = filteredRows[0]?.totalIncome || 0;

  const handleViewDetails = (row: any) => {
    router.push(`/dashboard/accounting/income/${row.monthKey}`);
  };

  const handleReceipt = (row: any) => {
    setSelectedRow(row);
    setReceiptOpen(true);
  };

  const handleDownloadReceipt = (row: any) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Craft International Institute", 14, 20);
    doc.setFontSize(10);
    doc.text(`Income Receipt - ${row.monthName}`, 14, 28);
    doc.text(`Month Income: ${fmt(row.income)}`, 14, 36);
    doc.text(`Previous Month Surplus: ${fmt(row.prevSurplus)}`, 14, 42);
    doc.text(`Total Income: ${fmt(row.totalIncome)}`, 14, 48);
    doc.text(`Generated: ${new Date().toLocaleString("en-GB")}`, 14, 56);
    doc.text(`Receipt includes Student Fees + Other Incomes (auto date-wise)`, 14, 64);
    doc.save(`Income-Receipt-${row.monthKey}.pdf`);
  };

  const handleDownloadAll = () => {
    const doc = new jsPDF();
    doc.text(`Income Summary - ${viewMode} ${selectedYear}`, 14, 15);
    let y = 25;
    filteredRows.forEach((r) => {
      doc.text(`${r.monthName} | Income:${fmt(r.income)} | Prev:${fmt(r.prevSurplus)} | Total:${fmt(r.totalIncome)}`, 14, y);
      y += 7;
      if (y > 280) { doc.addPage(); y = 15; }
    });
    doc.save(`Income-${viewMode}-${selectedYear}.pdf`);
  };

  const columns: Column[] = [
    {
      id: "monthName",
      label: "Month",
      sortable: true,
      filterable: true,
      render: (row: any) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#4F0187", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarMonth sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: "#0f172a" }}>{row.monthName}</Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>{row.quarter} • {row.count || 0} entries</Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: "income",
      label: "Income",
      align: "right",
      sortable: true,
      render: (row: any) => (
        <Typography variant="body2" fontWeight={800} sx={{ color: "#16a34a" }}>{fmt(row.income)}</Typography>
      ),
    },
    {
      id: "prevSurplus",
      label: "Prev. Surplus",
      align: "right",
      sortable: true,
      render: (row: any) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
          <History sx={{ fontSize: 14, color: "#64748b" }} />
          <Typography variant="body2" fontWeight={600} sx={{ color: "#475569" }}>{fmt(row.prevSurplus)}</Typography>
        </Box>
      ),
    },
    {
      id: "totalIncome",
      label: "Total Income",
      align: "right",
      sortable: true,
      render: (row: any) => (
        <Chip label={fmt(row.totalIncome)} sx={{ bgcolor: "#f1f5f9", color: "#0f172a", fontWeight: 800, borderRadius: "8px" }} />
      ),
    },
  ];

  const rowActions: RowAction[] = [
    {
      label: "View Details",
      icon: <Visibility fontSize="small" />,
      onClick: handleViewDetails,
      tooltip: "Date-wise breakdown",
    },
    {
      label: "Receipt",
      icon: <Receipt fontSize="small" />,
      onClick: handleReceipt,
      tooltip: "View receipt with prev surplus",
    },
    {
      label: "Download",
      icon: <Download fontSize="small" />,
      onClick: (row: any) => handleDownloadReceipt(row),
      tooltip: "Download receipt PDF",
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ background: "linear-gradient(135deg,#4F0187 0%,#8A2BE2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Monthly Income
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Student Fees + Other Incomes • Auto date-wise • Previous surplus included
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ borderRadius: "12px", bgcolor: "#4F0187", textTransform: "none", fontWeight: 700 }}>
            Add Income
          </Button>
          <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={handleDownloadAll} sx={{ borderRadius: "12px", textTransform: "none" }}>
            Export {viewMode}
          </Button>
        </Box>
      </Box>

      {/* Summary - all cards distinct light colors */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #bbf7d0", bgcolor: "#f0fdf4" }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#15803d", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Total Income ({viewMode})</Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: "#16a34a", fontSize: "1.25rem" }}>{fmt(totalYearly)}</Typography>
                  <Typography variant="caption" sx={{ color: "#86efac", fontWeight: 600 }}>{filteredRows.length} rows • green</Typography>
                </Box>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", flexShrink: 0 }}><TrendingUp sx={{ fontSize: 18 }} /></Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #bfdbfe", bgcolor: "#eff6ff" }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#1d4ed8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Avg. Monthly</Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: "#2563eb", fontSize: "1.25rem" }}>{fmt(avgMonthly)}</Typography>
                  <Typography variant="caption" sx={{ color: "#93c5fd", fontWeight: 600 }}>blue • per month avg</Typography>
                </Box>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0 }}><AccountBalance sx={{ fontSize: 18 }} /></Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #fed7aa", bgcolor: "#fff7ed" }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#c2410c", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Current Surplus</Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: "#ea580c", fontSize: "1.25rem" }}>{fmt(lastSurplus)}</Typography>
                  <Typography variant="caption" sx={{ color: "#fdba74", fontWeight: 600 }}>orange • carried forward</Typography>
                </Box>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center", color: "#ea580c", flexShrink: 0 }}><History sx={{ fontSize: 18 }} /></Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #e9d5ff", bgcolor: "#f5f3ff" }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Records</Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ color: "#4F0187", fontSize: "0.95rem", lineHeight: 1.3 }}>{monthlyData.length} months • {incomeRecords.length + (Array.isArray(feesRecords) ? feesRecords.filter((f:any)=> f.status==="paid" && Number(f.paidAmount)>0).length : 0)} incomes</Typography>
                  <Typography variant="caption" sx={{ color: "#a78bfa", fontWeight: 600 }}>{Array.isArray(feesRecords) ? feesRecords.filter((f:any)=> f.status==="paid").length : 0} paid fees • {years.length} years • purple</Typography>
                </Box>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#ede9ff", color: "#4F0187", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Receipt sx={{ fontSize: 18 }} /></Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2, alignItems: "center" }}>
        <Chip label={`All Years`} variant={selectedYear === "all" ? "filled" : "outlined"} color={selectedYear === "all" ? "primary" : "default"} onClick={() => setSelectedYear("all")} sx={{ borderRadius: "10px" }} />
        {years.map((y) => (
          <Chip key={y} label={y} variant={selectedYear === y ? "filled" : "outlined"} color={selectedYear === y ? "primary" : "default"} onClick={() => setSelectedYear(y)} sx={{ borderRadius: "10px" }} />
        ))}
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Chip label="Monthly" icon={<CalendarMonth />} variant={viewMode === "monthly" ? "filled" : "outlined"} color={viewMode === "monthly" ? "primary" : "default"} onClick={() => setViewMode("monthly")} sx={{ borderRadius: "10px" }} />
        <Chip label="Yearly" icon={<AccountBalance />} variant={viewMode === "yearly" ? "filled" : "outlined"} color={viewMode === "yearly" ? "primary" : "default"} onClick={() => setViewMode("yearly")} sx={{ borderRadius: "10px" }} />
        <Chip label="Last 4 Months" variant={viewMode === "last4" ? "filled" : "outlined"} color={viewMode === "last4" ? "primary" : "default"} onClick={() => setViewMode("last4")} sx={{ borderRadius: "10px" }} />
        <Chip label="Last 6 Months" variant={viewMode === "last6" ? "filled" : "outlined"} color={viewMode === "last6" ? "primary" : "default"} onClick={() => setViewMode("last6")} sx={{ borderRadius: "10px" }} />
        <Chip label="Last 12 Months" variant={viewMode === "last12" ? "filled" : "outlined"} color={viewMode === "last12" ? "primary" : "default"} onClick={() => setViewMode("last12")} sx={{ borderRadius: "10px" }} />
        <Chip label="Custom" icon={<FilterAlt />} variant={viewMode === "custom" ? "filled" : "outlined"} color={viewMode === "custom" ? "primary" : "default"} onClick={() => setViewMode("custom")} sx={{ borderRadius: "10px" }} />
      </Box>
      {viewMode === "custom" && (
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2, p: 1.5, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", alignItems: "center" }}>
          <Typography variant="caption" fontWeight={700} sx={{ color: "#475569" }}>Custom Range:</Typography>
          <TextField size="small" type="month" label="From" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" } }} InputLabelProps={{ shrink: true }} />
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>to</Typography>
          <TextField size="small" type="month" label="To" value={customTo} onChange={(e) => setCustomTo(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" } }} InputLabelProps={{ shrink: true }} />
          <Button size="small" variant="outlined" onClick={() => { setCustomFrom(""); setCustomTo(""); }} sx={{ borderRadius: 2, textTransform: "none" }}>Clear</Button>
          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <Button size="small" variant="outlined" startIcon={<Download />} onClick={() => { const doc = new jsPDF(); doc.text(`Income Custom ${customFrom} to ${customTo}`, 14, 15); let y = 25; filteredRows.forEach((r: any) => { doc.text(`${r.monthName} | ${r.income}`, 14, y); y += 7; }); doc.save(`Income-Custom-${customFrom}-${customTo}.pdf`); }} sx={{ borderRadius: 2, textTransform: "none" }}>Export</Button>
            <Button size="small" variant="contained" startIcon={<Print sx={{ fontSize: 16 }} />} onClick={() => window.print()} sx={{ borderRadius: 2, bgcolor: "#4F0187", textTransform: "none" }}>Print</Button>
          </Box>
        </Box>
      )}

      {/* Monthly Table - Reuse CraftTable - single Add button kept in header only */}
      <CraftTable
        title="Monthly Income Overview"
        subtitle={`Month • Income (Student Fees + Others) • Previous Surplus • Total - ${filteredRows.length} rows ${isFeesLoading ? "(fees loading...)" : ""}`}
        columns={columns}
        data={filteredRows}
        loading={isLoading || isFeesLoading}
        rowActions={rowActions}
        searchable
        onSearchChange={setSearchView}
        pagination
        showRowNumbers
        idField="id"
      />

      <AddIncomeModal open={open} onClose={() => setOpen(false)} id={null as any} />

      {/* Receipt Dialog - Must show previous month surplus */}
      <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#4F0187", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Receipt /> Income Receipt</Box>
          <Typography variant="caption" sx={{ bgcolor: "rgba(255,255,255,0.15)", px: 1.5, py: 0.5, borderRadius: 999 }}>{selectedRow?.monthName}</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedRow && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ textAlign: "center", mb: 3, pb: 2, borderBottom: "2px dashed #e2e8f0" }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: "#4F0187" }}>Craft International Institute</Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>123 Education Street, Dhaka • +880 1300-726000</Typography>
                <Chip label={`Receipt: INC-${selectedRow.monthKey}`} size="small" sx={{ mt: 1, bgcolor: "#4F018715", color: "#4F0187", fontWeight: 600 }} />
              </Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}><Typography variant="caption" sx={{ color: "#64748b" }}>Month</Typography><Typography variant="body2" fontWeight={700}>{selectedRow.monthName}</Typography></Grid>
                <Grid item xs={6} sx={{ textAlign: "right" }}><Typography variant="caption" sx={{ color: "#64748b" }}>Date</Typography><Typography variant="body2" fontWeight={700}>{new Date().toLocaleDateString("en-GB")}</Typography></Grid>
              </Grid>
              <Box sx={{ bgcolor: "#f8fafc", borderRadius: 2, p: 2, border: "1px solid #e2e8f0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}><Typography variant="body2">Month Income</Typography><Typography variant="body2" fontWeight={700} sx={{ color: "#16a34a" }}>{fmt(selectedRow.income)}</Typography></Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1, borderTop: "1px dashed #e2e8f0" }}><Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><History sx={{ fontSize: 16 }} /> Previous Month Surplus</Typography><Typography variant="body2" fontWeight={700}>{fmt(selectedRow.prevSurplus)}</Typography></Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1, bgcolor: "#4F0187", color: "#fff", borderRadius: 1, px: 1.5 }}><Typography variant="body2" fontWeight={800}>Total Income</Typography><Typography variant="body2" fontWeight={800}>{fmt(selectedRow.totalIncome)}</Typography></Box>
              </Box>
              <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 2, textAlign: "center" }}>
                Includes: Student Fees (auto) + Other Incomes • Date-wise breakdown available in Details
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setReceiptOpen(false)}>Close</Button>
          <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>Print</Button>
          <Button variant="contained" startIcon={<Download />} onClick={() => selectedRow && handleDownloadReceipt(selectedRow)} sx={{ bgcolor: "#4F0187", borderRadius: "10px" }}>Download PDF</Button>
          <Button variant="contained" endIcon={<ArrowForward />} onClick={() => { setReceiptOpen(false); handleViewDetails(selectedRow); }} sx={{ bgcolor: "#16a34a", borderRadius: "10px" }}>View Details</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

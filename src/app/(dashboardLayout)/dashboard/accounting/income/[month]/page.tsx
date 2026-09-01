/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { ArrowBack, Download, Receipt, CalendarMonth, History, TrendingUp, Edit, Delete } from "@mui/icons-material";
import CraftTable from "@/components/Table";
import { useGetAllIncomesQuery, useDeleteIncomeMutation } from "@/redux/api/incomeApi";
import { useGetAllFeesQuery } from "@/redux/api/feesApi";
import { Column, RowAction } from "@/interface/table";
import jsPDF from "jspdf";
import AddIncomeModal from "../../_components/AddIncomeDialog";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const fmt = (n: number) => `৳${(n || 0).toLocaleString("en-BD")}`;

export default function IncomeMonthDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const monthKey = (params?.month as string) || "";
  const isYearly = monthKey?.length === 4;
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteIncome] = useDeleteIncomeMutation();

  const { data, isLoading, refetch } = useGetAllIncomesQuery({});
  const incomes: any[] = data?.data?.incomes || [];
  const { data: feesData } = useGetAllFeesQuery({ limit: 1000 });
  const feesRecords: any[] = Array.isArray((feesData as any)?.data?.fees)
    ? (feesData as any).data.fees
    : Array.isArray((feesData as any)?.data?.data)
      ? (feesData as any).data.data
      : Array.isArray((feesData as any)?.data)
        ? (feesData as any).data
        : [];

  // Merge paid fees as incomes
  const allIncomes = useMemo(() => {
    const list: any[] = [...incomes];
    feesRecords.forEach((fee: any) => {
      const paid = Number(fee.paidAmount || 0);
      if (paid <= 0) return;
      if (fee.status !== "paid" && fee.status !== "partial") return;
      const d = fee.paymentDate ? new Date(fee.paymentDate) : fee.updatedAt ? new Date(fee.updatedAt) : null;
      if (!d || isNaN(d.getTime())) return;
      list.push({ ...fee, _id: fee._id + "_fee", totalAmount: paid, incomeDate: d, createdAt: d, category: { name: fee.feeType || "Student Fee" }, paymentMethod: fee.paymentMethod, status: fee.status, note: `Student Fee - ${fee.month || ""}`, _source: "student_fee" });
    });
    return list;
  }, [incomes, feesRecords]);

  // Filter for this month / year and sort date-wise
  const details = useMemo(() => {
    const filtered = allIncomes.filter((inc: any) => {
      const d = inc.incomeDate ? new Date(inc.incomeDate) : new Date(inc.createdAt);
      if (isNaN(d.getTime())) return false;
      if (isYearly) return String(d.getFullYear()) === monthKey;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === monthKey;
    });
    // Auto date-wise sort ascending
    filtered.sort((a: any, b: any) => new Date(a.incomeDate || a.createdAt).getTime() - new Date(b.incomeDate || b.createdAt).getTime());
    return filtered;
  }, [allIncomes, monthKey, isYearly]);

  // Also compute previous surplus up to this month
  const stats = useMemo(() => {
    const map = new Map<string, number>();
    allIncomes.forEach((inc: any) => {
      const d = inc.incomeDate ? new Date(inc.incomeDate) : new Date(inc.createdAt);
      if (isNaN(d.getTime())) return;
      const key = isYearly ? String(d.getFullYear()) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + Number(inc.totalAmount || 0));
    });
    const keys = Array.from(map.keys()).sort();
    let prev = 0;
    let prevSurplus = 0;
    let currentIncome = map.get(monthKey) || 0;
    for (const k of keys) {
      if (k === monthKey) {
        prevSurplus = prev;
        break;
      }
      prev += map.get(k)!;
    }
    // For yearly, prev is sum of previous years
    return { prevSurplus, currentIncome, total: prevSurplus + currentIncome, count: details.length };
  }, [allIncomes, monthKey, isYearly, details]);

  // Group by date for summary
  const byDate = useMemo(() => {
    const m = new Map<string, number>();
    details.forEach((d: any) => {
      const date = new Date(d.incomeDate || d.createdAt).toLocaleDateString("en-GB");
      m.set(date, (m.get(date) || 0) + Number(d.totalAmount || 0));
    });
    return Array.from(m.entries()).map(([date, amount]) => ({ date, amount }));
  }, [details]);

  const monthLabel = isYearly ? `${monthKey} (Yearly)` : (() => {
    const [y, mo] = monthKey.split("-");
    if (!y || !mo) return monthKey;
    return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  })();

  const handleEdit = (row: any) => {
    if (row._source === "student_fee") {
      toast("Student fee incomes edit via Student Profile > Paid Fees");
      return;
    }
    setEditId(row._id);
  };
  const handleDelete = async (row: any) => {
    if (row._source === "student_fee") {
      toast.error("Student fee cannot be deleted here. Use Fees section.");
      return;
    }
    const res = await Swal.fire({ title: "Delete income?", text: `Delete ${row.category?.name || "this"} - ${fmt(row.totalAmount)}?`, icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Delete" });
    if (res.isConfirmed) {
      try { await deleteIncome(row._id).unwrap(); toast.success("Income deleted"); refetch(); } catch (e: any) { toast.error(e?.data?.message || "Failed"); }
    }
  };

  const columns: Column[] = [
    {
      id: "date",
      label: "Date",
      sortable: true,
      render: (row: any) => {
        const d = row.incomeDate || row.createdAt;
        return <Typography variant="body2" fontWeight={600}>{new Date(d).toLocaleDateString("en-GB")}</Typography>;
      },
    },
    {
      id: "category",
      label: "Category / Source",
      render: (row: any) => {
        const hasStudent = row._source === "student_fee" || row.student || row.studentName || row.studentId || row.studentRoll;
        const sourceName = row.category?.name || row.feeType || row.incomeItems?.[0]?.source || "Other";
        if (hasStudent) {
          const sName = row.student?.name || row.studentName || (typeof row.student === "string" ? row.student : row.incomeItems?.[0]?.source?.includes(" - ") ? row.incomeItems[0].source.split(" - ")[0] : "Student");
          const sId = row.student?.studentId || row.studentId || (typeof row.student === "string" ? row.student.slice(-6) : row.student?._id?.toString().slice(-6) || "");
          const sRoll = row.student?.studentClassRoll || row.student?.rollNumber || row.studentRoll || row.roll || "";
          const displayName = typeof sName === "string" && sName.length > 22 ? sName.slice(0, 22) + "…" : sName;
          return (
            <Box>
              <Typography variant="body2" fontWeight={700} sx={{ color: "#0f172a", fontSize: 13 }}>{sourceName}</Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontSize: 11 }}>{displayName}{sId ? ` - ${sId}` : ""}{sRoll ? ` • Roll: ${sRoll}` : ""}</Typography>
            </Box>
          );
        }
        return (
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: "#0f172a", fontSize: 13 }}>{sourceName}</Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: 11 }}>{row.note || row.incomeItems?.map((i: any) => i.source).join(", ") || "Other Income"}</Typography>
          </Box>
        );
      },
    },
    {
      id: "paymentMethod",
      label: "Method",
      render: (row: any) => <Chip label={row.paymentMethod || "cash"} size="small" sx={{ bgcolor: "#f1f5f9", fontWeight: 600, borderRadius: "8px" }} />,
    },
    {
      id: "totalAmount",
      label: "Amount",
      align: "right",
      sortable: true,
      render: (row: any) => <Typography variant="body2" fontWeight={800} sx={{ color: "#16a34a" }}>{fmt(row.totalAmount)}</Typography>,
    },
    {
      id: "status",
      label: "Status",
      render: (row: any) => <Chip label={row.status || "completed"} size="small" color={row.status === "pending" ? "warning" : "success"} sx={{ borderRadius: "8px" }} />,
    },
  ];

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text(`Income Details - ${monthLabel}`, 14, 15);
    doc.text(`Prev Surplus: ${fmt(stats.prevSurplus)} | Income: ${fmt(stats.currentIncome)} | Total: ${fmt(stats.total)}`, 14, 22);
    let y = 32;
    details.forEach((r: any) => {
      const d = new Date(r.incomeDate || r.createdAt).toLocaleDateString("en-GB");
      doc.text(`${d} | ${r.category?.name || "Other"} | ${fmt(r.totalAmount)}`, 14, y);
      y += 7;
      if (y > 280) { doc.addPage(); y = 15; }
    });
    doc.save(`Income-Details-${monthKey}.pdf`);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Button startIcon={<ArrowBack />} onClick={() => router.push("/dashboard/accounting/income")} sx={{ mb: 2, borderRadius: "10px", textTransform: "none" }}>
        Back to Monthly Income
      </Button>

      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ background: "linear-gradient(135deg,#4F0187 0%,#8A2BE2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {monthLabel} - Details
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>Auto date-wise • Student Fees + Other Incomes • Previous surplus included</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<Receipt />} onClick={() => setReceiptOpen(true)} sx={{ borderRadius: "12px", textTransform: "none" }}>View Receipt</Button>
          <Button variant="contained" startIcon={<Download />} onClick={handleDownload} sx={{ borderRadius: "12px", bgcolor: "#4F0187", textTransform: "none" }}>Download PDF</Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}><CardContent sx={{ p: 2 }}><Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Box><Typography variant="caption" sx={{ color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Prev. Surplus</Typography><Typography variant="h6" fontWeight={800} sx={{ color: "#334155", display: "flex", alignItems: "center", gap: 1 }}><History sx={{ fontSize: 16, color: "#64748b" }} />{fmt(stats.prevSurplus)}</Typography><Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>slate • carried</Typography></Box><Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#e2e8f0", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}><History sx={{ fontSize: 16 }} /></Box></Box></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #bbf7d0", bgcolor: "#f0fdf4" }}><CardContent sx={{ p: 2 }}><Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Box><Typography variant="caption" sx={{ color: "#15803d", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Month Income</Typography><Typography variant="h6" fontWeight={800} sx={{ color: "#16a34a", display: "flex", alignItems: "center", gap: 1 }}><TrendingUp sx={{ fontSize: 16 }} />{fmt(stats.currentIncome)}</Typography><Typography variant="caption" sx={{ color: "#86efac", fontWeight: 600 }}>{stats.count} entries • green</Typography></Box><Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp sx={{ fontSize: 16 }} /></Box></Box></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #e9d5ff", bgcolor: "#f5f3ff" }}><CardContent sx={{ p: 2 }}><Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Box><Typography variant="caption" sx={{ color: "#7c3aed", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Total Income</Typography><Typography variant="h6" fontWeight={800} sx={{ color: "#4F0187" }}>{fmt(stats.total)}</Typography><Typography variant="caption" sx={{ color: "#a78bfa", fontWeight: 600 }}>purple • surplus+income</Typography></Box><Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#ede9ff", color: "#4F0187", display: "flex", alignItems: "center", justifyContent: "center" }}><Receipt sx={{ fontSize: 16 }} /></Box></Box></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #bfdbfe", bgcolor: "#eff6ff" }}><CardContent sx={{ p: 2 }}><Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Box><Typography variant="caption" sx={{ color: "#1d4ed8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Daily Avg</Typography><Typography variant="h6" fontWeight={800} sx={{ color: "#2563eb" }}>{byDate.length ? fmt(Math.round(stats.currentIncome / byDate.length)) : fmt(0)}</Typography><Typography variant="caption" sx={{ color: "#93c5fd", fontWeight: 600 }}>{byDate.length} days • blue</Typography></Box><Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#dbeafe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}><CalendarMonth sx={{ fontSize: 16 }} /></Box></Box></CardContent></Card>
        </Grid>
      </Grid>

      <CraftTable
        title={`Date-wise Income - ${monthLabel}`}
        subtitle={`${details.length} records • auto sorted by date • Student Fees + Others • Click Edit to modify`}
        columns={columns}
        data={details}
        loading={isLoading}
        pagination
        showRowNumbers
        idField="_id"
        rowActions={[
          { label: "Edit", icon: <Edit fontSize="small" />, onClick: handleEdit, tooltip: "Edit income (student fees via Fees)" } as RowAction,
          { label: "Delete", icon: <Delete fontSize="small" />, onClick: handleDelete, tooltip: "Delete income" } as RowAction,
        ]}
      />

      <AddIncomeModal open={!!editId} onClose={() => { setEditId(null); refetch(); }} id={editId || undefined} />

      {/* Receipt with prev surplus */}
      <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#4F0187", color: "#fff" }}>Income Receipt - {monthLabel}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ textAlign: "center", mb: 2, pb: 2, borderBottom: "2px dashed #e2e8f0" }}>
            <Typography variant="h6" fontWeight={800} sx={{ color: "#4F0187" }}>Craft International Institute</Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>Income Receipt • Previous Surplus Included</Typography>
          </Box>
          <Box sx={{ bgcolor: "#f8fafc", borderRadius: 2, p: 2, border: "1px solid #e2e8f0" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}><Typography>Previous Month Surplus</Typography><Typography fontWeight={700}>{fmt(stats.prevSurplus)}</Typography></Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}><Typography>Current Month Income</Typography><Typography fontWeight={700} sx={{ color: "#16a34a" }}>{fmt(stats.currentIncome)}</Typography></Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", py: 1, bgcolor: "#4F0187", color: "#fff", borderRadius: 1, px: 1.5 }}><Typography fontWeight={800}>Total Income</Typography><Typography fontWeight={800}>{fmt(stats.total)}</Typography></Box>
          </Box>
          <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 2 }}>
            Details: {stats.count} incomes • {byDate.map((b) => `${b.date}:${fmt(b.amount)}`).join(" | ")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Download />} onClick={handleDownload} sx={{ bgcolor: "#4F0187", borderRadius: "10px" }}>Download PDF</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

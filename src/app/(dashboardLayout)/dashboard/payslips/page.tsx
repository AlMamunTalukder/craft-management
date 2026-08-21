/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  Paid as PaidIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { PageHeader, PageAction } from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import {
  useGetAllPayslipsQuery,
  useGetPayslipSummaryQuery,
  useGeneratePayslipsMutation,
  useMarkPayslipPaidMutation,
  useDeletePayslipMutation,
} from "@/redux/api/payslipApi";
import type { TPayslip } from "@/interface";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const formatTaka = (n: number) =>
  (n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

const currentYear = new Date().getFullYear();

const PayslipPage = () => {
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [employeeType, setEmployeeType] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [genForm, setGenForm] = useState({
    month: new Date().getMonth() + 1,
    year: currentYear,
    employeeType: "teacher",
  });
  const [generating, setGenerating] = useState(false);
  const [printSlip, setPrintSlip] = useState<TPayslip | null>(null);

  const { data, isLoading } = useGetAllPayslipsQuery({
    page,
    limit: 10,
    month,
    year,
    employeeType: employeeType || undefined,
    status: status || undefined,
  });
  const { data: summaryData } = useGetPayslipSummaryQuery({});
  const [generatePayslips] = useGeneratePayslipsMutation();
  const [markPaid] = useMarkPayslipPaidMutation();
  const [deletePayslip] = useDeletePayslipMutation();

  const payslips: TPayslip[] = data?.data?.data || [];
  const meta = data?.data?.meta || { page: 1, total: 0, totalPage: 1, limit: 10 };

  const summary = summaryData?.data?.totals || { count: 0, paid: 0, totalNet: 0 };
  const statCards = [
    { label: "Total Payslips", value: summary.count || 0, color: "#6366f1" },
    { label: "Paid", value: summary.paid || 0, color: "#2e7d32" },
    { label: "Draft", value: (summary.count || 0) - (summary.paid || 0), color: "#f57c00" },
    { label: "Net Payable", value: `৳${formatTaka(summary.totalNet || 0)}`, color: "#1976d2" },
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res: any = await generatePayslips(genForm);
      if (res?.error) throw new Error(res.error?.data?.message || "Generate failed");
      const d = res.data?.data;
      Swal.fire(
        "Payslips Generated!",
        `${d.generated} generated, ${d.skipped} skipped (already exists for ${MONTH_NAMES[genForm.month - 1]} ${genForm.year}).`,
        "success",
      );
      setOpen(false);
    } catch (err: any) {
      Swal.fire("Error", err.message || "Generate failed", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async (slip: TPayslip) => {
    const result = await Swal.fire({
      title: "Mark as paid?",
      text: `${slip.employeeInfo?.name || ""} - ৳${formatTaka(slip.netSalary)}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2e7d32",
      confirmButtonText: "Mark Paid",
    });
    if (!result.isConfirmed) return;
    try {
      const res: any = await markPaid(slip._id);
      if (res?.error) throw new Error(res.error?.data?.message || "Failed");
      Swal.fire("Done!", "Payslip marked as paid.", "success");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed", "error");
    }
  };

  const handleDelete = async (slip: TPayslip) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete payslip for ${slip.employeeInfo?.name || ""}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete!",
    });
    if (!result.isConfirmed) return;
    try {
      const res: any = await deletePayslip(slip._id);
      if (res?.error) throw new Error(res.error?.data?.message || "Delete failed");
      Swal.fire("Deleted!", "Payslip deleted.", "success");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Delete failed", "error");
    }
  };

  const handlePrint = (slip: TPayslip) => {
    setPrintSlip(slip);
    setTimeout(() => {
      const el = document.getElementById("payslip-print");
      const originalTitle = document.title;
      if (el) {
        document.title = `Payslip-${slip.employeeInfo?.name || ""}`;
        window.print();
        document.title = originalTitle;
      }
      setPrintSlip(null);
    }, 150);
  };

  const Row = ({ label, value, bold }: { label: string; value: any; bold?: boolean }) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.3, fontSize: "0.85rem" }}>
      <Typography sx={{ fontSize: "0.85rem", color: "#555", fontWeight: bold ? 700 : 400 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.85rem", fontWeight: bold ? 800 : 600 }}>{value}</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader
        title="Payslips"
        subtitle="Generate monthly salary slips from employee salary records"
        action={
          <PageAction onClick={() => setOpen(true)} label="Generate Payslips" icon={<AddIcon />} />
        }
      />

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {statCards.map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper
              sx={{
                p: 1.5,
                borderRadius: "10px",
                textAlign: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                borderTop: `3px solid ${s.color}`,
              }}
            >
              <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, color: s.color }}>{s.value}</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#666", fontWeight: 600 }}>{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 1.5, mb: 2, borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr 1fr 1fr" }, gap: 1.5 }}>
          <TextField size="small" select label="Month" value={month} onChange={(e) => { setMonth(Number(e.target.value)); setPage(1); }}>
            {MONTH_NAMES.map((m, i) => (
              <MenuItem key={m} value={i + 1}>{m}</MenuItem>
            ))}
          </TextField>
          <TextField size="small" label="Year" value={year} onChange={(e) => { setYear(Number(e.target.value) || currentYear); setPage(1); }} />
          <TextField size="small" select label="Employee Type" value={employeeType} onChange={(e) => { setEmployeeType(e.target.value); setPage(1); }}>
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="teacher">Teachers</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
          </TextField>
          <TextField size="small" select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
          </TextField>
          <Box />
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f6fa" }}>
              {["Employee", "Month / Year", "Gross", "Deductions", "Net Salary", "Status", "Actions"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555", py: 1.2 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : payslips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5, color: "#999" }}>
                  No payslips for {MONTH_NAMES[month - 1]} {year}. Click &quot;Generate Payslips&quot;.
                </TableCell>
              </TableRow>
            ) : (
              payslips.map((slip) => (
                <TableRow key={slip._id} hover>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                      {slip.employeeInfo?.name || "Unknown"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.65rem", color: "#999", textTransform: "capitalize" }}>
                      {slip.employeeType}{" "}
                      {slip.employeeInfo?.designation || slip.employeeInfo?.category
                        ? `· ${slip.employeeInfo?.designation || slip.employeeInfo?.category}`
                        : ""}                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.78rem" }}>
                    {MONTH_NAMES[(slip.month || 1) - 1]} {slip.year}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.78rem" }}>৳{formatTaka(slip.grossSalary)}</TableCell>
                  <TableCell sx={{ fontSize: "0.75rem", color: "#d32f2f" }}>৳{formatTaka(slip.totalDeductions)}</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#2e7d32" }}>
                    ৳{formatTaka(slip.netSalary)}
                  </TableCell>
                  <TableCell><StatusChip status={slip.status} /></TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.3 }}>
                      <Tooltip title="Print">
                        <IconButton size="small" onClick={() => handlePrint(slip)} sx={{ color: "#2e7d32" }}>
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {slip.status !== "paid" && (
                        <Tooltip title="Mark Paid">
                          <IconButton size="small" onClick={() => handleMarkPaid(slip)} sx={{ color: "#1976d2" }}>
                            <PaidIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(slip)} sx={{ color: "#d32f2f" }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {meta.totalPage > 1 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1.5, alignItems: "center" }}>
          <Button size="small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Page {page} of {meta.totalPage} ({meta.total})
          </Typography>
          <Button size="small" disabled={page >= meta.totalPage} onClick={() => setPage(page + 1)}>Next</Button>
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Generate Payslips</Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <TextField
              size="small"
              select
              label="Month *"
              value={genForm.month}
              onChange={(e) => setGenForm({ ...genForm, month: Number(e.target.value) })}
            >
              {MONTH_NAMES.map((m, i) => (
                <MenuItem key={m} value={i + 1}>{m}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Year *"
              value={genForm.year}
              onChange={(e) => setGenForm({ ...genForm, year: Number(e.target.value) || currentYear })}
            />
            <TextField
              size="small"
              select
              label="Employee Type *"
              value={genForm.employeeType}
              onChange={(e) => setGenForm({ ...genForm, employeeType: e.target.value })}
              sx={{ gridColumn: "1 / -1" }}
            >
              <MenuItem value="teacher">Teachers</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ mt: 1.5, bgcolor: "#fff8e1", border: "1px solid #ffe082", borderRadius: "8px", px: 1.5, py: 1 }}>
            <Typography sx={{ fontSize: "0.75rem", color: "#b26a00" }}>
              Uses each employee&apos;s latest salary record. Existing payslips for the same month are skipped.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button size="small" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            size="small"
            variant="contained"
            disabled={generating}
            onClick={handleGenerate}
            sx={{ background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)", fontWeight: 600, textTransform: "none" }}
          >
            {generating ? "Generating..." : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ position: "absolute", left: -9999, top: 0, width: 800 }}>
        <div id="payslip-print">
          {printSlip && (
            <Box sx={{ width: "100%", p: 2 }}>
              <Box sx={{ border: "2px solid #1e3a5f", borderRadius: "8px", overflow: "hidden", maxWidth: 620, mx: "auto" }}>
                <Box sx={{ bgcolor: "#1e3a5f", color: "#fff", p: 2, textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Craft International Institute</Typography>
                  <Typography sx={{ fontSize: "0.75rem", opacity: 0.85 }}>
                    Salary Payslip · {MONTH_NAMES[(printSlip.month || 1) - 1]} {printSlip.year}
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #cbd5e1", pb: 1, mb: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
                        {printSlip.employeeInfo?.name || "Unknown"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#666" }}>
                        {printSlip.employeeType}{" "}
                        {printSlip.employeeInfo?.designation || printSlip.employeeInfo?.category
                          ? `· ${printSlip.employeeInfo?.designation || printSlip.employeeInfo?.category}`
                          : ""}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.75rem", color: "#666" }}>
                      Status: <b>{printSlip.status.toUpperCase()}</b>
                    </Typography>
                  </Box>
                  <Row label="Basic Salary" value={`৳${formatTaka(printSlip.basicSalary)}`} />
                  <Row label="House Rent" value={`৳${formatTaka(printSlip.houseRent)}`} />
                  <Row label="Medical Allowance" value={`৳${formatTaka(printSlip.medicalAllowance)}`} />
                  <Row label="Transport Allowance" value={`৳${formatTaka(printSlip.transportAllowance)}`} />
                  <Row label="Food Allowance" value={`৳${formatTaka(printSlip.foodAllowance)}`} />
                  <Row label="Other Allowances" value={`৳${formatTaka(printSlip.otherAllowances)}`} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.3, borderTop: "1px solid #e5e7eb", mt: 0.5 }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>Gross Salary</Typography>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e3a5f" }}>৳{formatTaka(printSlip.grossSalary)}</Typography>
                  </Box>
                  <Row label="Income Tax" value={`- ৳${formatTaka(printSlip.incomeTax)}`} />
                  <Row label="Provident Fund" value={`- ৳${formatTaka(printSlip.providentFund)}`} />
                  <Row label="Other Deductions" value={`- ৳${formatTaka(printSlip.otherDeductions)}`} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderTop: "2px solid #1e3a5f", mt: 0.5 }}>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 800 }}>Net Salary</Typography>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 900, color: "#2e7d32" }}>৳{formatTaka(printSlip.netSalary)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, pt: 1 }}>
                    <Typography sx={{ fontSize: "0.75rem", color: "#666" }}>Employee Signature</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#666" }}>Authorized Signature</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </div>
      </Box>
    </Box>
  );
};

export default PayslipPage;

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import FeeAdjustmentModal from "@/components/FeeAdjustmentModal";
import CraftTable from "@/components/Table";
import { StudentFeeProps } from "@/interface/student";
import {
  AccountBalanceWallet,
  AutoAwesome,
  CalendarMonth,
  Celebration,
  Close,
  Delete,
  Discount,
  ExpandMore,
  History,
  Info as InfoIcon,
  ReceiptLong,
  Visibility,
  Warning as WarningIcon
} from "@mui/icons-material";
import { Box, Button, Chip, Typography, Paper, alpha, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, Stack, Divider, ToggleButton, ToggleButtonGroup, useTheme } from "@mui/material";
import { JSX, useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useGenerateSingleStudentFeesMutation, useGetStudentAdjustmentsQuery, useDeleteFeeAdjustmentMutation } from "@/redux/api/feesApi";
import BulkPaymentModal from "./BulkPaymentModal";
import Swal from "sweetalert2";
import AddFeeModal from "./Fees/AddFeeModal";
import FeeSummaryCards from "./FeeSummaryCards";
import LateFeeCustomizationModal from "./LateFeeCustomizationModal";
import ViewFeeModal from "./ViewFeeModal";
import { Column, RowAction } from "@/interface/table";

const DueStudentFee = ({
  studentFees,
  loading = false,
  onDelete,
  onPay,
  student,
  refetch,
}: StudentFeeProps) => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [addFeeModalOpen, setAddFeeModalOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [filteredFees, setFilteredFees] = useState<any[]>([]);
  const [bulkPaymentModalOpen, setBulkPaymentModalOpen] = useState(false);
  const [lateFeeSummary, setLateFeeSummary] = useState({
    totalLateFees: 0,
    totalCustomized: 0,
    totalOverdue: 0,
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [generateSingleFees, { isLoading: isGenerating }] = useGenerateSingleStudentFeesMutation();
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const theme = useTheme();
  const { data: adjustmentsData } = useGetStudentAdjustmentsQuery({ studentId: student?._id } as any, { skip: !student?._id });
  const [deleteAdjustment, { isLoading: isDeletingAdj }] = useDeleteFeeAdjustmentMutation();

  const handleView = (fee: any) => {
    setSelectedFee(fee);
    setViewModalOpen(true);
  };

  const handleGenerateFees = async () => {
    if (!student?._id) {
      toast.error("Student ID missing");
      return;
    }
    try {
      const res: any = await generateSingleFees({ studentId: student._id }).unwrap();
      toast.success(res?.message || "Fees generated successfully");
      if (refetch) refetch();
      else window.location.reload();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to generate fees");
    }
  };

  const handleRemoveAdjustment = async (fee: any, type: "discount" | "waiver") => {
    const raw = (adjustmentsData as any)?.data || (adjustmentsData as any)?.data?.data || adjustmentsData;
    const list: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const match = [...list].reverse().find((adj: any) => (adj.fee?._id === fee._id || adj.fee === fee._id || adj.fee?.toString() === fee._id) && adj.type === type && adj.isActive !== false) || list.find((adj: any) => (adj.fee?._id === fee._id || adj.fee === fee._id) && adj.type === type);
    const amount = type === "discount" ? fee.discount : fee.waiver;
    if (!amount || amount <= 0) { toast.error(`No ${type} to remove`); return; }
    if (!match) {
      const confirmFallback = await Swal.fire({
        title: `Remove ${type} ৳${amount}?`,
        html: `No adjustment record found, but fee has <b>${type} ৳${amount}</b>.<br/>This will reset it via direct fee update.<br/><br/>Due will go from <b>৳${fee.dueAmount}</b> → <b>৳${(fee.dueAmount || 0) + amount}</b>`,
        icon: "question", showCancelButton: true, confirmButtonText: "Reset", confirmButtonColor: "#dc2626",
      });
      if (!confirmFallback.isConfirmed) return;
      try {
        // Direct fallback: try to update fee discount/waiver to 0 via generic update (if available) — for now just inform
        toast.error("No adjustment record — please use Edit Fee to reset discount/waiver to 0");
        return;
      } catch {}
      return;
    }
    const confirm = await Swal.fire({
      title: `Remove ${type}?`,
      html: `Remove <b>${type} ৳${amount}</b> from <b>${fee.feeType} (${fee.month})</b>?<br/><br/>Due: <b>৳${fee.dueAmount}</b> → <b>৳${(fee.dueAmount || 0) + amount}</b>`,
      icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Remove", confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteAdjustment(match._id).unwrap();
      toast.success(`${type === "discount" ? "Discount" : "Waiver"} removed`);
      if (refetch) refetch();
    } catch (e: any) { toast.error(e?.data?.message || `Failed to remove ${type}`); }
  };

  useEffect(() => {
    const dueFees =
      studentFees?.filter((fee) => fee?.status === "unpaid" || fee?.status === "partial") || [];
    setFilteredFees(dueFees);

    if (dueFees?.length) {
      const summary = dueFees.reduce(
        (acc, fee) => {
          if (fee.lateFeeAmount > 0) {
            acc.totalLateFees += fee.lateFeeAmount;
          }
          if (fee.lateFeeCustomized) {
            acc.totalCustomized += 1;
          }
          if (
            fee.dueDate &&
            new Date(fee.dueDate) < new Date() &&
            fee.status !== "paid"
          ) {
            acc.totalOverdue += 1;
          }
          return acc;
        },
        { totalLateFees: 0, totalCustomized: 0, totalOverdue: 0 },
      );
      setLateFeeSummary(summary);
    } else {
      setLateFeeSummary({
        totalLateFees: 0,
        totalCustomized: 0,
        totalOverdue: 0,
      });
    }
  }, [studentFees]);

  const handleAdjustmentClick = (fee: any) => {
    setSelectedFee(fee);
    setAdjustmentModalOpen(true);
  };

  const handleCustomizeLateFeeClick = (fee: any) => {
    setSelectedFee(fee);
    setCustomizationModalOpen(true);
  };

  const handleAdjustmentSuccess = () => {
    if (refetch) {
      refetch();
    }
  };

  const handleCustomizationSuccess = () => {
    if (refetch) {
      refetch();
    }
  };

  const handleCloseAdjustmentModal = () => {
    setAdjustmentModalOpen(false);
    setSelectedFee(null);
  };

  const handleCloseCustomizationModal = () => {
    setCustomizationModalOpen(false);
    setSelectedFee(null);
  };

  const handleAddFeeClick = () => {
    setAddFeeModalOpen(true);
  };

  const handleCloseAddFeeModal = () => {
    setAddFeeModalOpen(false);
  };

  const calculateSummary = () => {
    const dueFees = studentFees?.filter((fee) => fee?.status === "unpaid" || fee?.status === "partial") || [];

    const totalFees = dueFees?.reduce(
      (sum, fee) => sum + (fee.amount || 0),
      0,
    );
    const totalPaid = dueFees?.reduce(
      (sum, fee) => sum + (fee.paidAmount || 0),
      0,
    );
    const totalDue = dueFees?.reduce(
      (sum, fee) => sum + (fee.dueAmount || 0),
      0,
    );
    const totalDiscount = dueFees?.reduce(
      (sum, fee) => sum + (fee.discount || 0),
      0,
    );
    const totalWaiver = dueFees?.reduce(
      (sum, fee) => sum + (fee.waiver || 0),
      0,
    );
    const totalAdjustments = totalDiscount + totalWaiver;

    return {
      totalFees,
      totalPaid,
      totalDue,
      totalDiscount,
      totalWaiver,
      totalAdjustments,
    };
  };

  const summary = calculateSummary();

  // Month-wise grouping — user friendly, details per month
  const MONTH_ORDER = ["Admission", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, { key: string; month: string; academicYear: string; label: string; fees: any[]; totalAmount: number; totalDiscount: number; totalWaiver: number; totalNet: number; totalPaid: number; totalDue: number; count: number; monthOrder: number }> = {};
    filteredFees.forEach((fee: any) => {
      const rawMonth = fee.month || "Unknown";
      const ay = fee.academicYear || "";
      // Normalize month name (handle "January-2026" or "January")
      const monthName = rawMonth === "Admission" ? "Admission" : rawMonth.split("-")[0].trim();
      const key = `${monthName}__${ay}`;
      if (!groups[key]) {
        groups[key] = { key, month: monthName, academicYear: ay, label: monthName === "Admission" ? `Admission${ay ? " • " + ay : ""}` : `${monthName}${ay ? " " + ay : ""}`, fees: [], totalAmount: 0, totalDiscount: 0, totalWaiver: 0, totalNet: 0, totalPaid: 0, totalDue: 0, count: 0, monthOrder: MONTH_ORDER.indexOf(monthName) === -1 ? 99 : MONTH_ORDER.indexOf(monthName) };
      }
      const g = groups[key];
      g.fees.push(fee);
      g.totalAmount += fee.amount || 0;
      g.totalDiscount += fee.discount || 0;
      g.totalWaiver += fee.waiver || 0;
      g.totalNet += (fee.amount || 0) - (fee.discount || 0) - (fee.waiver || 0);
      g.totalPaid += fee.paidAmount || 0;
      g.totalDue += fee.dueAmount || 0;
      g.count += 1;
    });
    const arr = Object.values(groups).sort((a, b) => {
      if (a.academicYear !== b.academicYear) return (a.academicYear || "").localeCompare(b.academicYear || "");
      return a.monthOrder - b.monthOrder;
    });
    return arr;
  }, [filteredFees]);

  useEffect(() => {
    if (groupedByMonth.length && Object.keys(expandedMonths).length === 0) {
      const now = new Date();
      const currentMonthName = now.toLocaleString("default", { month: "long" });
      const currentYear = now.getFullYear().toString();
      const runningKey = groupedByMonth.find((g) => g.month === currentMonthName && g.academicYear === currentYear)?.key || groupedByMonth.find((g) => g.month === currentMonthName)?.key;
      const init: Record<string, boolean> = {};
      groupedByMonth.forEach((g) => { init[g.key] = g.key === (runningKey || groupedByMonth[0]?.key); });
      setExpandedMonths(init);
    }
  }, [groupedByMonth]);

  const toggleMonth = (key: string) => setExpandedMonths((p) => ({ ...p, [key]: !p[key] }));
  const expandAll = () => { const m: Record<string, boolean> = {}; groupedByMonth.forEach((g) => (m[g.key] = true)); setExpandedMonths(m); };
  const collapseAll = () => { const m: Record<string, boolean> = {}; groupedByMonth.forEach((g) => (m[g.key] = false)); setExpandedMonths(m); };

  const formatDueDate = (d: any) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } catch { return String(d); }
  };
  const isOverdue = (fee: any) => fee.dueDate && new Date(fee.dueDate) < new Date() && fee.status !== "paid";

  // Define columns for fee table
  const columns: Column[] = [
    {
      id: "feeType",
      label: "Fee Type",
      minWidth: 150,
      sortable: true,
      filterable: true,
    },
    {
      id: "month",
      label: "Month",
      minWidth: 100,
      sortable: true,
      filterable: true,
    },
    {
      id: "amount",
      label: "Total Amount",
      minWidth: 120,
      align: "right",
      sortable: true,
      type: "number",
      format: (value: number) => `৳${value?.toLocaleString()}`,
    },
    {
      id: "discount",
      label: "Discount",
      minWidth: 100,
      align: "right",
      sortable: true,
      type: "number",
      format: (value: number) =>
        value > 0 ? `-৳${value?.toLocaleString()}` : "৳0",
      render: (row: any) => (
        <Typography
          color={row.discount > 0 ? "error" : "text.secondary"}
          variant="body2"
          fontWeight={row.discount > 0 ? "bold" : "normal"}
        >
          {row.discount > 0 ? `-৳${row.discount?.toLocaleString()}` : "৳0"}
        </Typography>
      ),
    },
    {
      id: "netAmount",
      label: "Net Amount",
      minWidth: 120,
      align: "right",
      sortable: true,
      type: "number",
      format: (value: number) => `৳${value?.toLocaleString()}`,
      render: (row: any) => {
        const netAmount =
          (row.amount || 0) - (row.discount || 0) - (row.waiver || 0);
        return (
          <Typography variant="body2" fontWeight="bold">
            ৳{netAmount.toLocaleString()}
          </Typography>
        );
      },
    },
    {
      id: "paidAmount",
      label: "Paid Amount",
      minWidth: 120,
      align: "right",
      sortable: true,
      type: "number",
      format: (value: number) => `৳${value?.toLocaleString()}`,
    },
    {
      id: "dueAmount",
      label: "Due Amount",
      minWidth: 120,
      align: "right",
      sortable: true,
      type: "number",
      format: (value: number) => `৳${value?.toLocaleString()}`,
      render: (row: any) => (
        <Typography color="error" variant="body2" fontWeight="bold">
          ৳{row.dueAmount?.toLocaleString() || "0"}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 120,
      sortable: true,
      filterable: true,
      type: "status",
      render: (row: any) => {
        const statusConfig: {
          [key: string]: {
            color: "success" | "warning" | "error" | "default";
            label: string;
            icon?: JSX.Element;
          };
        } = {
          paid: { color: "success", label: "Paid" },
          partial: { color: "warning", label: "Partial", icon: <InfoIcon fontSize="small" /> },
          unpaid: { color: "error", label: "Unpaid" },
        };
        const config = statusConfig[row.status] || {
          color: "default",
          label: row.status,
        };

        const hasAdjustments = row.discount > 0 || row.waiver > 0;

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={config.label}
              color={config.color}
              size="small"
              variant="filled"
            />
            {hasAdjustments && <Discount fontSize="small" color="success" />}
          </Box>
        );
      },
    },
  ];

  const rowActions: RowAction[] = [
    {
      label: "View Details",
      icon: <Visibility fontSize="small" />,
      onClick: (row) => handleView(row),
      color: "info",
      tooltip: "View fee details",
    },
    {
      label: "Apply Discount/Waiver",
      icon: <Discount fontSize="small" />,
      onClick: (row) => handleAdjustmentClick(row),
      color: "success",
      tooltip: "Apply discount or waiver",
    },
    {
      label: "Customize Late Fee",
      icon: <WarningIcon fontSize="small" />,
      onClick: (row) => handleCustomizeLateFeeClick(row),
      color: "warning",
      tooltip: "Customize late fee amount",
      inMenu: true,
    },
    {
      label: "View Late Fee History",
      icon: <History fontSize="small" />,
      onClick: (row) => {
        if (row.lateFeeAmount > 0) {
          handleCustomizeLateFeeClick(row);
        }
      },
      color: "info",
      tooltip: "View late fee customization history",
      disabled: (row) => !row.lateFeeAmount || row.lateFeeAmount === 0,
      inMenu: true,
    },
    {
      label: "Delete",
      icon: <Delete fontSize="small" />,
      onClick: (row) => onDelete?.(row),
      color: "error",
      tooltip: "Delete fee record",
      inMenu: true,
    },
  ];

  const isEmpty = !loading && filteredFees.length === 0;
  const hasStudent = !!student?._id;
  const showGeneratePrompt = isEmpty && hasStudent && (studentFees?.length === 0 || summary.totalFees === 0);

  return (
    <Box>
      <FeeSummaryCards
        type="due"
        summary={summary}
        lateFeeSummary={lateFeeSummary}
      />

      {/* Friendly empty state with color-graded design */}
      {showGeneratePrompt ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              bgcolor: alpha("#fff", 0.08),
            },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", gap: 3, position: "relative", zIndex: 1 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                bgcolor: alpha("#fff", 0.2),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ReceiptLong sx={{ fontSize: 42, color: "#fff" }} />
            </Box>
            <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
              <Typography variant="h6" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: { xs: "center", md: "flex-start" } }}>
                <AutoAwesome fontSize="small" /> No Due Fees Generated Yet
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95, mt: 0.5, lineHeight: 1.6 }}>
                This student was just enrolled and fees are not yet created. Generate current month fees (Admission + Monthly + Tuition etc.) instantly with one click — no need to visit <b>/fees/generate</b>.
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, mt: 2, flexWrap: "wrap", justifyContent: { xs: "center", md: "flex-start" } }}>
                <Button
                  variant="contained"
                  onClick={handleGenerateFees}
                  disabled={isGenerating}
                  startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <AccountBalanceWallet />}
                  sx={{
                    bgcolor: "#fff",
                    color: "#6d28d9",
                    fontWeight: 700,
                    px: 3,
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: "none",
                    "&:hover": { bgcolor: alpha("#fff", 0.9) },
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                  }}
                >
                  {isGenerating ? "Generating..." : "Generate Fees Now"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setAddFeeModalOpen(true)}
                  sx={{
                    color: "#fff",
                    borderColor: alpha("#fff", 0.6),
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: "none",
                    "&:hover": { borderColor: "#fff", bgcolor: alpha("#fff", 0.12) },
                  }}
                >
                  + Add Custom Fee
                </Button>
              </Box>
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 1, alignItems: "flex-end", minWidth: 160 }}>
              <Chip icon={<InfoIcon sx={{ color: "#fff !important" }} />} label={`Class: ${student?.class || student?.className?.className || "N/A"}`} sx={{ bgcolor: alpha("#fff", 0.18), color: "#fff", fontWeight: 600, "& .MuiChip-icon": { color: "#fff" } }} />
              <Chip icon={<Celebration sx={{ color: "#fff !important" }} />} label={student?.category || student?.studentType || "Residential"} sx={{ bgcolor: alpha("#fff", 0.18), color: "#fff", fontWeight: 600 }} />
            </Box>
          </Box>
        </Paper>
      ) : isEmpty ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
            border: `1px solid ${alpha("#4caf50", 0.2)}`,
          }}
        >
          <Celebration sx={{ fontSize: 48, color: "#4caf50", mb: 1 }} />
          <Typography variant="h6" fontWeight={700} color="success.dark">All Clear! No Due Fees</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>All fees are paid. Great job!</Typography>
        </Paper>
      ) : null}

      {!isEmpty && (
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 1.5, alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>{groupedByMonth.length} months • {filteredFees.length} dues • Due <strong style={{ color: "#dc2626" }}>৳{summary.totalDue.toLocaleString()}</strong> • <span style={{ color: "#059669", fontWeight: 600 }}>Running month expanded</span></Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button size="small" variant="outlined" onClick={expandAll} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>Expand all</Button>
            <Button size="small" variant="outlined" onClick={collapseAll} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>Collapse</Button>
            <Button size="small" variant="outlined" onClick={handleAddFeeClick} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>+ Add Fee</Button>
            <Button variant="contained" size="small" onClick={() => setBulkPaymentModalOpen(true)} disabled={!filteredFees.length} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)"}}>Pay All ({filteredFees.length}) ৳{summary.totalDue.toLocaleString()}</Button>
          </Box>
        </Box>
      )}

      {!isEmpty && (
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          {groupedByMonth.map((g) => {
            const expanded = !!expandedMonths[g.key];
            const overdueCount = g.fees.filter(isOverdue).length;
            return (
              <Accordion key={g.key} expanded={expanded} onChange={() => toggleMonth(g.key)} elevation={0} sx={{ border: `1px solid ${alpha(g.totalDue > 0 ? "#ef4444" : "#10b981", expanded ? 0.18 : 0.1)}`, borderRadius: 2, overflow: "hidden", "&:before": { display: "none" }, bgcolor: "background.paper", boxShadow: expanded ? "0 4px 16px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.04)" }}>
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: "text.secondary" }} />} sx={{ bgcolor: expanded ? alpha(g.totalDue > 0 ? "#fef2f2" : "#f0fdf4", 0.8) : "background.paper", px: 1.5, "& .MuiAccordionSummary-content": { my: 1, alignItems: "center" }, minHeight: 64 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: g.month === "Admission" ? alpha("#f59e0b", 0.12) : alpha("#4f46e5", 0.08), border: `1px solid ${g.month === "Admission" ? alpha("#f59e0b", 0.18) : alpha("#4f46e5", 0.12)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CalendarMonth sx={{ fontSize: 20, color: g.month === "Admission" ? "#f59e0b" : "#4f46e5" }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: "0.95rem", lineHeight: 1.2 }} noWrap>{g.label}</Typography>
                        <Chip label={`${g.count} ${g.count > 1 ? "fees" : "fee"}`} size="small" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, bgcolor: alpha("#4f46e5", 0.08), color: "#4f46e5", border: `1px solid ${alpha("#4f46e5", 0.12)}` }} />
                        {overdueCount > 0 && <Chip icon={<WarningIcon sx={{ fontSize: 12 }} />} label={`${overdueCount} overdue`} size="small" color="error" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }} />}
                        <Chip label={g.totalDue === 0 ? "Paid" : g.totalPaid > 0 ? "Partial" : "Unpaid"} color={g.totalDue === 0 ? "success" : g.totalPaid > 0 ? "warning" : "error"} size="small" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, display: { xs: "none", sm: "flex" } }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.72rem", mt: 0.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {g.fees.map((f: any) => f.feeType).slice(0, 3).join(" • ")}{g.fees.length > 3 ? ` +${g.fees.length - 3} more` : ""} • Due {formatDueDate(g.fees[0]?.dueDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right", minWidth: 110, display: { xs: "none", sm: "block" }, pr: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>Total Due</Typography>
                      <Typography variant="subtitle2" fontWeight={900} color={g.totalDue > 0 ? "error" : "success.main"} sx={{ fontSize: "1rem", lineHeight: 1.1 }}>৳{g.totalDue.toLocaleString()}</Typography>
                      <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "text.secondary", display: "block" }}>Net ৳{g.totalNet.toLocaleString()} • Paid ৳{g.totalPaid.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0, borderTop: `1px solid ${alpha("#e2e8f0", 0.8)}` }}>
                  <CraftTable
                    columns={columns}
                    data={g.fees}
                    loading={false}
                    rowActions={rowActions}
                    pagination={false}
                    searchable={false}
                    filterable={false}
                    sortable={false}
                    showToolbar={false}
                    elevation={0}
                    borderRadius={0}
                    dense={true}
                    striped={true}
                    hover={true}
                    showRowNumbers={false}
                    idField="_id"
                    maxHeight="none"
                    actionColumnWidth={140}
                    actionMenuLabel="Actions"
                  />
                  <Divider />
                  <Box sx={{ p: 1.5, bgcolor: "#f8fafc", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}><strong style={{ color: "#0f172a" }}>{g.count} fees</strong> • Net <strong>৳{g.totalNet.toLocaleString()}</strong> • Discount <strong>৳{g.totalDiscount.toLocaleString()}</strong> + Waiver <strong>৳{g.totalWaiver.toLocaleString()}</strong> • Paid <strong style={{ color: "#059669" }}>৳{g.totalPaid.toLocaleString()}</strong> • Due <strong style={{ color: "#dc2626" }}>৳{g.totalDue.toLocaleString()}</strong></Typography>
                    <Button size="small" variant="contained" disabled={g.totalDue === 0} onClick={() => setBulkPaymentModalOpen(true)} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 2, background: g.totalDue === 0 ? "#e2e8f0" : "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)", color: g.totalDue === 0 ? "#64748b" : "#fff" }}>{g.totalDue === 0 ? "Paid ✓" : `Pay ${g.label} — ৳${g.totalDue.toLocaleString()}`}</Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      )}

      <AddFeeModal
        open={addFeeModalOpen}
        setOpen={handleCloseAddFeeModal}
        student={student}
        refetch={refetch}
      />

      {/* Fee Adjustment Modal - Now handles API call internally */}
      <FeeAdjustmentModal
        open={adjustmentModalOpen}
        onClose={handleCloseAdjustmentModal}
        fee={selectedFee}
        onSuccess={handleAdjustmentSuccess}
      />

      {/* Late Fee Customization Modal */}
      <LateFeeCustomizationModal
        open={customizationModalOpen}
        onClose={handleCloseCustomizationModal}
        fee={selectedFee}
        onSuccess={handleCustomizationSuccess}
      />

      {/* Bulk Payment Modal */}
      <BulkPaymentModal
        open={bulkPaymentModalOpen}
        onClose={() => setBulkPaymentModalOpen(false)}
        student={{
          ...student,
          className:
            typeof student?.className === "object"
              ? student.className?.className || student.className?.name || ""
              : student?.className || "",
        }}
        fees={filteredFees}
        refetch={refetch}
      />

      <ViewFeeModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        fee={selectedFee}
        student={student}
        refetch={refetch}
      />
    </Box>
  );
};

export default DueStudentFee;
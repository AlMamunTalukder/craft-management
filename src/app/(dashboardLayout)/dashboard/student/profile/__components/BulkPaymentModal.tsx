/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BulkPaymentModalProps } from "@/interface/fees";
import { useApplyBulkAdjustmentsMutation, useGetStudentAdjustmentsQuery, useDeleteFeeAdjustmentMutation } from "@/redux/api/feesApi";
import { useCreateBulkPaymentMutation } from "@/redux/api/paymentApi";
import Swal from "sweetalert2";
import { numberToWords } from "@/utils/numberToWords";
import { Close, Discount, ReceiptLong } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

const BulkPaymentModal: React.FC<BulkPaymentModalProps> = ({
  open,
  onClose,
  student,
  fees,
  refetch,
  onPaymentCompleted,
}) => {
  const theme = useTheme();
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [note, setNote] = useState("");
  const [collectedBy, setCollectedBy] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [createBulkPayment] = useCreateBulkPaymentMutation();

  const [discountType, setDiscountType] = useState<"flat" | "percentage">("flat");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [waiverType, setWaiverType] = useState<"flat" | "percentage">("flat");
  const [waiverValue, setWaiverValue] = useState<number>(0);
  const [payAmountInput, setPayAmountInput] = useState<string>("");
  const [useAdvance, setUseAdvance] = useState(false);
  const [search, setSearch] = useState("");
  const [applyBulkAdjustments, { isLoading: isApplyingDiscount }] = useApplyBulkAdjustmentsMutation();
  const { data: adjustmentsData } = useGetStudentAdjustmentsQuery({ studentId: student._id } as any, { skip: !open || !student?._id });
  const [deleteAdjustment, { isLoading: isDeletingAdj }] = useDeleteFeeAdjustmentMutation();

  const payableFees = fees.filter((fee) => fee.dueAmount > 0);
  const filteredForSearch = useMemo(() => {
    if (!search) return fees;
    const q = search.toLowerCase();
    return fees.filter((f) => `${f.feeType} ${f.month}`.toLowerCase().includes(q));
  }, [fees, search]);

  const calculateTotals = () => {
    const selectedFeeObjects = fees.filter((fee) => selectedFees.includes(fee._id));
    const totalAmount = selectedFeeObjects.reduce((sum, fee) => sum + fee.amount, 0);
    const totalDiscount = selectedFeeObjects.reduce((sum, fee) => sum + (fee.discount || 0), 0);
    const totalWaiver = selectedFeeObjects.reduce((sum, fee) => sum + (fee.waiver || 0), 0);
    const totalPaid = selectedFeeObjects.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
    const totalDue = selectedFeeObjects.reduce((sum, fee) => sum + (fee.dueAmount || 0), 0);
    const netAmount = totalAmount - totalDiscount - totalWaiver;
    return { totalAmount, totalDiscount, totalWaiver, totalPaid, totalDue, netAmount, selectedCount: selectedFeeObjects.length };
  };

  const totals = calculateTotals();
  const advanceBalance = (student as any)?.advanceBalance || 0;
  const effectivePayAmount = payAmountInput === "" ? totals.totalDue : Math.min(Math.max(0, Number(payAmountInput) || 0), totals.totalDue);
  const dueAfterAdvance = useAdvance ? Math.max(0, effectivePayAmount - Math.min(advanceBalance, effectivePayAmount)) : effectivePayAmount;
  const remainingDue = Math.max(0, totals.totalDue - effectivePayAmount);

  const discountPreview = useMemo(() => {
    if (!discountValue || discountValue <= 0) return null;
    if (discountType === "percentage") {
      const estimated = payableFees.reduce((sum, fee) => sum + (fee.dueAmount * discountValue) / 100, 0);
      return { estimated: Math.min(estimated, totals.totalDue), label: `${discountValue}% off due` };
    } else {
      const estimated = payableFees.reduce((sum, fee) => sum + Math.min(discountValue, fee.dueAmount), 0);
      return { estimated, label: `৳${discountValue} off per fee (capped)` };
    }
  }, [discountValue, discountType, payableFees, totals.totalDue]);

  const waiverPreview = useMemo(() => {
    if (!waiverValue || waiverValue <= 0) return null;
    if (waiverType === "percentage") {
      const estimated = payableFees.reduce((sum, fee) => sum + (fee.dueAmount * waiverValue) / 100, 0);
      return { estimated: Math.min(estimated, totals.totalDue), label: `${waiverValue}% waived` };
    } else {
      const estimated = payableFees.reduce((sum, fee) => sum + Math.min(waiverValue, fee.dueAmount), 0);
      return { estimated, label: `৳${waiverValue} waived per fee` };
    }
  }, [waiverValue, waiverType, payableFees, totals.totalDue]);

  const handleApply = async (type: "discount" | "waiver", val: number, adjType: "flat" | "percentage") => {
    if (!val || val <= 0) { toast.error(`Enter valid ${type} value`); return; }
    if (payableFees.length === 0) { toast.error("No payable fees"); return; }
    try {
      await applyBulkAdjustments({ studentId: student._id, type, adjustmentType: adjType, value: val, reason: `Bulk ${type} via one-page payment` }).unwrap();
      const est = type === "discount" ? discountPreview?.estimated : waiverPreview?.estimated;
      toast.success(`${type === "discount" ? "Discount" : "Waiver"} applied! ~৳${est?.toFixed(2) || 0} saved`, { icon: "✅" });
      if (type === "discount") setDiscountValue(0); else setWaiverValue(0);
      if (refetch) refetch();
    } catch (e: any) { toast.error(e?.data?.message || `Failed to apply ${type}`); }
  };

  const handleResetAdjustments = async (type: "discount" | "waiver") => {
    const raw: any = (adjustmentsData as any)?.data || (adjustmentsData as any)?.data?.data || adjustmentsData;
    const list: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const toDelete = list.filter((adj: any) => adj.type === type && selectedFees.some((fid) => (adj.fee?._id === fid || adj.fee === fid || adj.fee?.toString() === fid)));
    const fallbackCount = type === "discount" ? totals.totalDiscount : totals.totalWaiver;
    if (toDelete.length === 0 && fallbackCount <= 0) { toast.error(`No ${type} to reset`); return; }
    try {
      if (toDelete.length > 0) {
        for (const adj of toDelete) await deleteAdjustment(adj._id).unwrap();
        toast.success(`${type} reset for ${toDelete.length} fee(s)`);
      } else {
        toast.error(`No ${type} record found — open View Details popup to reset`);
        return;
      }
      if (refetch) refetch();
    } catch (e: any) { toast.error(e?.data?.message || `Failed to reset ${type}`); }
  };

  useEffect(() => { if (open) handleReset(); }, [open]);
  useEffect(() => {
    if (selectedFees.length > 0) {
      const stillValid = selectedFees.filter((id) => fees.some((f) => f._id === id && f.dueAmount > 0));
      if (stillValid.length !== selectedFees.length) setSelectedFees(stillValid);
    }
  }, [fees]);
  useEffect(() => { setPayAmountInput(totals.totalDue ? String(totals.totalDue) : ""); }, [totals.totalDue]);

  const handleSelectFee = (e: any, feeId: string) => { e.stopPropagation(); setSelectedFees((prev) => prev.includes(feeId) ? prev.filter((id) => id !== feeId) : [...prev, feeId]); };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { e.stopPropagation(); setSelectedFees(e.target.checked ? fees.map((fee) => fee._id) : []); };
  const handleSelectPayable = () => {
    const ids = payableFees.map((f) => f._id);
    const all = ids.every((id) => selectedFees.includes(id));
    setSelectedFees(all ? selectedFees.filter((id) => !ids.includes(id)) : [...new Set([...selectedFees, ...ids])]);
  };

  const buildReceiptData = (paymentResponse: any, paidAmount: number) => {
    const paymentDate = new Date(paymentResponse.paymentDate || new Date());
    const receiptNo = paymentResponse.receiptNo || `RCP-${Date.now()}`;
    const selectedFeeObjects = fees.filter((fee) => selectedFees.includes(fee._id));
    const receiptFees = selectedFeeObjects.map((fee) => ({
      feeType: fee.feeType, month: fee.month, originalAmount: fee.amount, discount: fee.discount || 0, waiver: fee.waiver || 0,
      netAmount: fee.amount - (fee.discount || 0) - (fee.waiver || 0), dueAmount: fee.dueAmount || 0, paidAmount: fee.dueAmount || 0, previousPaid: fee.paidAmount || 0, quantity: 1,
    }));
    const subtotal = selectedFeeObjects.reduce((sum, f) => sum + f.amount, 0);
    const totalDiscount = selectedFeeObjects.reduce((sum, f) => sum + (f.discount || 0), 0);
    const totalWaiver = selectedFeeObjects.reduce((sum, f) => sum + (f.waiver || 0), 0);
    const totalNetAmount = subtotal - totalDiscount - totalWaiver;
    return {
      _id: paymentResponse._id || `temp-${Date.now()}`, receiptNo, paymentDate: paymentDate.toISOString(), status: "active", paymentMethod, collectedBy: collectedBy || "Admin",
      studentName: student.name, studentId: student.studentId, className: (student as any).className || "", rollNumber: (student as any).roll || "", section: (student as any).section || "",
      totalAmount: paidAmount, fees: receiptFees,
      summary: { totalItems: selectedFees.length, subtotal, totalDiscount, totalWaiver, totalNetAmount, amountPaid: paidAmount, subtotalWord: numberToWords(subtotal), totalNetAmountWord: numberToWords(totalNetAmount), amountPaidWord: numberToWords(paidAmount) },
      transactionId: paymentMethod !== "cash" ? transactionId : undefined, accountNo: paymentMethod !== "cash" ? accountNo : undefined, note: note || undefined,
    };
  };

  const handleSubmitPayment = async () => {
    if (selectedFees.length === 0) { toast.error("Select at least one fee"); return; }
    if (!paymentMethod) { toast.error("Select payment method"); return; }
    if (paymentMethod !== "cash" && !transactionId) { toast.error("Enter transaction ID"); return; }
    const finalCollectedBy = collectedBy.trim() || "Admin";
    if (effectivePayAmount <= 0) { toast.error("Enter valid pay amount"); return; }
    setIsProcessing(true);
    try {
      const paymentData: any = {
        studentId: student._id,
        feeIds: selectedFees,
        amountPaid: effectivePayAmount,
        paymentMethod,
        transactionId: paymentMethod !== "cash" ? transactionId : undefined,
        accountNo: paymentMethod !== "cash" ? accountNo : undefined,
        note, collectedBy: finalCollectedBy,
      };
      if (useAdvance && advanceBalance > 0) paymentData.advanceUsed = Math.min(advanceBalance, effectivePayAmount);
      const result = await createBulkPayment(paymentData).unwrap();
      if (result.success) {
        const receiptData = buildReceiptData(result, effectivePayAmount);
        toast.success(<Box><Typography variant="body2" fontWeight={700}>Payment Success ৳{effectivePayAmount.toLocaleString()}</Typography><Typography variant="caption">Receipt {receiptData.receiptNo}</Typography></Box>, { duration: 5000, icon: "✅" });
        if (refetch) refetch();
        if (onPaymentCompleted) onPaymentCompleted(receiptData);
        setTimeout(() => { handleReset(); onClose(); }, 1200);
      } else { toast.error(result.message || "Payment failed"); setIsProcessing(false); }
    } catch (error: any) { toast.error(error?.data?.message || "Payment failed"); setIsProcessing(false); }
  };

  const handleReset = () => { setSelectedFees([]); setPaymentMethod("cash"); setTransactionId(""); setAccountNo(""); setNote(""); setCollectedBy(""); setIsProcessing(false); setDiscountValue(0); setWaiverValue(0); setPayAmountInput(""); setUseAdvance(false); setSearch(""); };
  const handleClose = () => { if (!isProcessing) { handleReset(); onClose(); } };
  const isAllSelected = fees.length > 0 && selectedFees.length === fees.length;
  const isIndeterminate = selectedFees.length > 0 && selectedFees.length < fees.length;

  return (
    <Modal open={open} onClose={handleClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 1, md: 2 }, backdropFilter: "blur(6px)" }}>
      <Paper sx={{ width: "100%", maxWidth: 1200, maxHeight: "92vh", overflow: "hidden", borderRadius: 3, display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", border: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
        {/* Header - brand purple */}
        <Box sx={{ px: 3, py: 2.2, background: "linear-gradient(135deg, #4F0187 0%, #7c3aed 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><ReceiptLong sx={{ color: "white" }} /></Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.1, fontSize: "1rem" }}>Bulk Fee Payment — One Page Checkout</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.75rem", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.name} • {student.studentId} • {(student as any).className?.className || (student as any).className || ""} • Due ৳{totals.totalDue.toLocaleString()}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label={`${selectedFees.length}/${fees.length} selected`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white", fontWeight: 700, border: "1px solid rgba(255,255,255,0.25)" }} />
            <IconButton onClick={handleClose} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.14)", "&:hover": { bgcolor: "rgba(255,255,255,0.22)" }, width: 36, height: 36 }} disabled={isProcessing}><Close sx={{ fontSize: 18 }} /></IconButton>
          </Box>
        </Box>

        {/* Content: one page grid */}
        <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2, md: 2.5 }, bgcolor: theme.palette.mode === "dark" ? "#0f0a1a" : "#f8fafc" }}>
          <Grid container spacing={2.5}>
            {/* Left: Fees + Discount/Waiver */}
            <Grid item xs={12} md={7.5}>
              {/* Search + select */}
              <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", bgcolor: "background.paper" }}>
                <TextField size="small" placeholder="Search fee type or month…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ flex: 1, minWidth: 160, "& .MuiOutlinedInput-root": { borderRadius: 2, height: 36 } }} />
                <Button size="small" variant="outlined" onClick={() => setSelectedFees(isAllSelected ? [] : fees.map((f) => f._id))} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}>{isAllSelected ? "Deselect All" : "Select All"}</Button>
                <Button size="small" variant="outlined" onClick={handleSelectPayable} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}>Payable only</Button>
                <Chip label={`৳${totals.totalDue.toLocaleString()} due`} color={totals.totalDue > 0 ? "error" : "success"} size="small" sx={{ fontWeight: 700, height: 28 }} />
              </Paper>

              <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, overflow: "hidden", bgcolor: "background.paper" }}>
                <Box sx={{ px: 2, py: 1.2, borderBottom: `1px solid ${theme.palette.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: "0.875rem" }}>Select Fees to Pay</Typography>
                  <Typography variant="caption" color="text.secondary">{filteredForSearch.length} records</Typography>
                </Box>
                <TableContainer sx={{ maxHeight: 320, overflow: "auto" }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ "& th": { bgcolor: theme.palette.mode === "dark" ? "#1e1b2e" : "#f8fafc", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", py: 1 } }}>
                        <TableCell padding="checkbox"><Checkbox checked={isAllSelected} indeterminate={isIndeterminate} onChange={handleSelectAll} size="small" /></TableCell>
                        <TableCell>Fee Type</TableCell>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Disc/Waiver</TableCell>
                        <TableCell align="right">Due</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredForSearch.map((fee: any) => (
                        <TableRow key={fee._id} hover selected={selectedFees.includes(fee._id)} onClick={(e) => handleSelectFee(e, fee._id)} sx={{ cursor: "pointer", "&.Mui-selected": { bgcolor: alpha(theme.palette.primary.main, 0.06) }, "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) } }}>
                          <TableCell padding="checkbox"><Checkbox checked={selectedFees.includes(fee._id)} onChange={(e) => handleSelectFee(e, fee._id)} onClick={(e) => e.stopPropagation()} size="small" /></TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>{fee.feeType}<Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontSize: "0.68rem" }}>{fee.class}</Typography></TableCell>
                          <TableCell sx={{ fontSize: "0.8125rem" }}><Chip label={fee.month} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600 }} /></TableCell>
                          <TableCell align="right" sx={{ fontSize: "0.8125rem" }}>৳{fee.amount.toLocaleString()}</TableCell>
                          <TableCell align="right" sx={{ fontSize: "0.8125rem", color: (fee.discount || fee.waiver) ? "#059669" : "text.secondary" }}>{(fee.discount || fee.waiver) ? `-৳${((fee.discount || 0) + (fee.waiver || 0)).toLocaleString()}` : "—"}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: fee.dueAmount > 0 ? "error.main" : "success.main", fontSize: "0.8125rem" }}>৳{fee.dueAmount.toLocaleString()}</TableCell>
                          <TableCell align="center"><Chip label={fee.status} size="small" color={fee.status === "paid" ? "success" : fee.status === "partial" ? "warning" : "error"} sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, textTransform: "capitalize" }} /></TableCell>
                        </TableRow>
                      ))}
                      {filteredForSearch.length === 0 && (
                        <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>No fees match search</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {selectedFees.length > 0 && (
                  <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.04), borderTop: `1px solid ${theme.palette.divider}`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>{selectedFees.length} fees • Net ৳{totals.netAmount.toLocaleString()} • Saved ৳{(totals.totalDiscount + totals.totalWaiver).toLocaleString()}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "error.main" }}>Due ৳{totals.totalDue.toLocaleString()}</Typography>
                  </Box>
                )}
              </Paper>

              {/* Discount vs Waiver explain + controls */}
              <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper" }}>

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha("#10b981", 0.04), borderColor: alpha("#10b981", 0.18) }}>
                      <Typography variant="caption" fontWeight={800} color="#059669" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Discount sx={{ fontSize: 14 }} /> Bulk Discount</Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <TextField select size="small" value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} sx={{ minWidth: 110, "& .MuiOutlinedInput-root": { borderRadius: 2, height: 36 } }}><MenuItem value="flat">Flat ৳</MenuItem><MenuItem value="percentage">% Percent</MenuItem></TextField>
                        <TextField size="small" type="number" placeholder={discountType === "percentage" ? "%" : "৳"} value={discountValue || ""} onChange={(e) => setDiscountValue(e.target.value === "" ? 0 : Number(e.target.value))} sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, height: 36 } }} inputProps={{ min: 0, max: discountType === "percentage" ? 100 : undefined }} />
                      </Box>
                      {discountPreview && <Alert severity="success" sx={{ mt: 1, py: 0.5, fontSize: "0.75rem", borderRadius: 2 }}>{discountPreview.label} • Save ~৳{discountPreview.estimated.toFixed(2)} → Due ~৳{Math.max(0, totals.totalDue - discountPreview.estimated).toFixed(2)}</Alert>}
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Button size="small" variant="contained" color="success" onClick={() => handleApply("discount", discountValue, discountType)} disabled={!discountValue || isApplyingDiscount} sx={{ flex: 1, borderRadius: 2, textTransform: "none", fontWeight: 700 }}>{isApplyingDiscount ? <CircularProgress size={16} color="inherit" /> : "Apply Discount"}</Button>
                        {totals.totalDiscount > 0 && <Button size="small" variant="outlined" color="error" onClick={() => handleResetAdjustments("discount")} disabled={isDeletingAdj} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, minWidth: 70 }}>Reset</Button>}
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha("#f59e0b", 0.05), borderColor: alpha("#f59e0b", 0.2) }}>
                      <Typography variant="caption" fontWeight={800} color="#d97706" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Discount sx={{ fontSize: 14 }} /> Bulk Waiver</Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <TextField select size="small" value={waiverType} onChange={(e) => setWaiverType(e.target.value as any)} sx={{ minWidth: 110, "& .MuiOutlinedInput-root": { borderRadius: 2, height: 36 } }}><MenuItem value="flat">Flat ৳</MenuItem><MenuItem value="percentage">% Percent</MenuItem></TextField>
                        <TextField size="small" type="number" placeholder={waiverType === "percentage" ? "%" : "৳"} value={waiverValue || ""} onChange={(e) => setWaiverValue(e.target.value === "" ? 0 : Number(e.target.value))} sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, height: 36 } }} inputProps={{ min: 0, max: waiverType === "percentage" ? 100 : undefined }} />
                      </Box>
                      {waiverPreview && <Alert severity="warning" sx={{ mt: 1, py: 0.5, fontSize: "0.75rem", borderRadius: 2 }}>{waiverPreview.label} • Waive ~৳{waiverPreview.estimated.toFixed(2)}</Alert>}
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Button size="small" variant="contained" color="warning" onClick={() => handleApply("waiver", waiverValue, waiverType)} disabled={!waiverValue || isApplyingDiscount} sx={{ flex: 1, borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: "#f59e0b", "&:hover": { bgcolor: "#d97706" } }}>Apply Waiver</Button>
                        {totals.totalWaiver > 0 && <Button size="small" variant="outlined" color="error" onClick={() => handleResetAdjustments("waiver")} disabled={isDeletingAdj} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, minWidth: 70 }}>Reset</Button>}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Right: Summary + Payment */}
            <Grid item xs={12} md={4.5}>
              <Box sx={{ position: "sticky", top: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Student + advance */}
                <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, overflow: "hidden" }}>
                  <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.06), borderBottom: `1px solid ${theme.palette.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" fontWeight={800}>Summary</Typography>
                    <Chip label={student.studentId} size="small" sx={{ fontWeight: 700, height: 22, bgcolor: "white", border: `1px solid ${theme.palette.divider}` }} />
                  </Box>
                  <CardContent sx={{ p: 2, pb: "16px !important" }}>
                    <Typography variant="body2" fontWeight={700} noWrap>{student.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{(student as any).className?.className || (student as any).className || ""} • {(student as any).category || ""}</Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Grid container spacing={1}>
                      {[
                        { label: "Total", value: `৳${totals.totalAmount.toLocaleString()}`, color: "text.primary" },
                        { label: "Discount", value: `-৳${totals.totalDiscount.toLocaleString()}`, color: "#059669" },
                        { label: "Waiver", value: `-৳${totals.totalWaiver.toLocaleString()}`, color: "#d97706" },
                        { label: "Net", value: `৳${totals.netAmount.toLocaleString()}`, color: "text.primary", bold: true },
                        { label: "Already Paid", value: `৳${totals.totalPaid.toLocaleString()}`, color: "#059669" },
                        { label: "Due Now", value: `৳${totals.totalDue.toLocaleString()}`, color: "#dc2626", h5: true },
                      ].map((s: any) => (
                        <Grid item xs={6} key={s.label}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>{s.label}</Typography>
                          <Typography variant={s.h5 ? "h6" : "body2"} sx={{ fontWeight: s.bold || s.h5 ? 800 : 600, color: s.color, lineHeight: 1.2 }}>{s.value}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ mt: 1.5, p: 1, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 2, border: `1px dashed ${alpha(theme.palette.primary.main, 0.15)}` }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>In words: <strong style={{ color: theme.palette.primary.main }}>{numberToWords(totals.totalDue) || "Zero"} Taka</strong></Typography>
                    </Box>
                    {advanceBalance > 0 && (
                      <Paper variant="outlined" sx={{ mt: 1.5, p: 1.2, borderRadius: 2, bgcolor: alpha("#06b6d4", 0.06), borderColor: alpha("#06b6d4", 0.2), display: "flex", alignItems: "center", gap: 1 }}>
                        <Checkbox size="small" checked={useAdvance} onChange={(e) => setUseAdvance(e.target.checked)} sx={{ p: 0.3 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" fontWeight={800} sx={{ fontSize: "0.75rem" }}>Use Advance Balance ৳{advanceBalance.toLocaleString()}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem", display: "block" }}>Deduct from advance, reduce cash needed</Typography>
                        </Box>
                        <Chip label={`→ Due ৳${dueAfterAdvance.toLocaleString()}`} size="small" color={dueAfterAdvance === 0 ? "success" : "default"} sx={{ fontWeight: 700, height: 22 }} />
                      </Paper>
                    )}
                  </CardContent>
                </Card>

                {/* Payment controls */}
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: "background.paper" }}>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>Payment Details</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Paper variant="outlined" sx={{ p: 1.2, borderRadius: 2, bgcolor: "#f8fafc", border: "1px dashed #e2e8f0" }}>

                      <Box sx={{ display: "flex", gap: 1, alignItems: "stretch" }}>

                        <Box sx={{ flex: 1.2, p: 1, bgcolor: "white", borderRadius: 2, border: "2px solid #4F0187", boxShadow: "0 0 0 3px rgba(79,1,135,0.08)", textAlign: "center" }}>
                          <Typography variant="caption" sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#4F0187", textTransform: "uppercase", letterSpacing: "0.04em" }}>Today Payment *</Typography>
                          <TextField value={payAmountInput} onChange={(e) => setPayAmountInput(e.target.value)} size="small" type="number" placeholder="e.g., 5000" sx={{ mt: 0.5, "& .MuiOutlinedInput-root": { borderRadius: 2, height: 36, fontWeight: 700, textAlign: "center", bgcolor: "#fff" }, "& input": { textAlign: "center", fontWeight: 700 } }} inputProps={{ min: 0, max: totals.totalDue }} fullWidth />

                        </Box>

                      </Box>
                    </Paper>
                    <TextField select fullWidth label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="bkash">bKash</MenuItem>
                      <MenuItem value="nagad">Nagad</MenuItem>
                      <MenuItem value="bank">Bank Transfer</MenuItem>
                      <MenuItem value="online">Online</MenuItem>
                    </TextField>
                    {paymentMethod !== "cash" && (
                      <>
                        <TextField fullWidth label="Transaction ID *" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} size="small" placeholder={`Enter ${paymentMethod} TX id`} required sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        <TextField fullWidth label="Account No *" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} size="small" placeholder={`Enter ${paymentMethod} account/number`} required sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                      </>
                    )}
                    <TextField fullWidth label="Collected By" value={collectedBy} onChange={(e) => setCollectedBy(e.target.value)} size="small" placeholder="Any name — e.g., Admin" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} helperText="Any name, defaults to Admin if empty" FormHelperTextProps={{ sx: { fontSize: "0.68rem" } }} />
                    <TextField fullWidth label="Note (Optional)" multiline rows={2} value={note} onChange={(e) => setNote(e.target.value)} size="small" placeholder="Add note for receipt" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />

                    <Box sx={{ flex: 1, p: 1.2, bgcolor: "white", borderRadius: 2, border: "1px solid #e2e8f0", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <Typography variant="caption" sx={{ fontSize: "0.6rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.04em" }}>Due After</Typography>
                      <Typography variant="body2" fontWeight={800} color={remainingDue === 0 ? "success.main" : "error"} sx={{ fontSize: "0.95rem", mt: 0.3 }}>৳{remainingDue.toLocaleString()}</Typography>

                    </Box>

                    <Button
                      variant="contained"
                      onClick={handleSubmitPayment}
                      disabled={isProcessing || isApplyingDiscount || selectedFees.length === 0 || (paymentMethod !== "cash" && !transactionId)}
                      sx={{ py: 1.4, borderRadius: 2, fontWeight: 800, textTransform: "none", fontSize: "1rem", background: "linear-gradient(135deg, #4F0187 0%, #7c3aed 100%)", "&:hover": { background: "linear-gradient(135deg, #3c0166 0%, #6d28d9 100%)" }, boxShadow: "0 6px 16px rgba(79,1,135,0.25)" }}
                    >
                      {isProcessing ? <CircularProgress size={24} color="inherit" /> : `Pay ৳${effectivePayAmount.toLocaleString()} • Confirm`}
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", fontSize: "0.68rem", display: "block" }}>By confirming, receipt will be generated instantly</Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Footer removed — all in one page */}
      </Paper>
    </Modal>
  );
};

export default BulkPaymentModal;

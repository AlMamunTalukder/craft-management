/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BulkPaymentModalProps } from "@/interface/fees";
import { useApplyBulkAdjustmentsMutation } from "@/redux/api/feesApi";
import { useCreateBulkPaymentMutation } from "@/redux/api/paymentApi";
import { numberToWords } from "@/utils/numberToWords";
import { Close, Discount } from "@mui/icons-material";
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
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
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
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");
  const [collectedBy, setCollectedBy] = useState("Nesar Ahmed");
  const [isProcessing, setIsProcessing] = useState(false);
  const [createBulkPayment] = useCreateBulkPaymentMutation();

  const [discountType, setDiscountType] = useState<"flat" | "percentage">("flat");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [applyBulkAdjustments, { isLoading: isApplyingDiscount }] = useApplyBulkAdjustmentsMutation();

  const steps = ["Select Fees & Adjust", "Payment Details", "Confirmation"];


  const payableFees = fees.filter((fee) => fee.dueAmount > 0);
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


  const discountPreview = useMemo(() => {
    if (!discountValue || discountValue <= 0) return null;
    if (discountType === "percentage") {
      const estimated = payableFees.reduce((sum, fee) => sum + (fee.dueAmount * discountValue) / 100, 0);
      return { estimated: Math.min(estimated, totals.totalDue), label: `${discountValue}% off all due fees` };
    } else {

      const estimated = payableFees.reduce((sum, fee) => sum + Math.min(discountValue, fee.dueAmount), 0);
      return { estimated, label: `৳${discountValue} off each due fee (capped per fee)` };
    }
  }, [discountValue, discountType, payableFees, totals.totalDue]);

  const handleApplyDiscount = async () => {
    if (!discountValue || discountValue <= 0) {
      toast.error("Please enter a valid discount value");
      return;
    }
    if (payableFees.length === 0) {
      toast.error("No payable fees to apply discount to");
      return;
    }

    try {
      await applyBulkAdjustments({
        studentId: student._id,
        type: "discount",
        adjustmentType: discountType,
        value: discountValue,
        reason: "Bulk payment quick discount applied before payment",
      }).unwrap();

      toast.success(
        `Discount applied! Saved approx. ৳${discountPreview?.estimated?.toFixed(2) || 0}`,
        { duration: 4000, icon: "✅" }
      );
      setDiscountValue(0);
      if (refetch) refetch();
    } catch (error: any) {
      console.error("Discount error:", error);
      toast.error(error?.data?.message || "Failed to apply discount.");
    }
  };

  useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open]);

  useEffect(() => {
    if (selectedFees.length > 0) {
      const stillValid = selectedFees.filter((id) =>
        fees.some((f) => f._id === id && f.dueAmount > 0)
      );
      if (stillValid.length !== selectedFees.length) {
        setSelectedFees(stillValid);
      }
    }
  }, [fees]);

  const handleSelectFee = (e: React.MouseEvent | React.ChangeEvent, feeId: string) => {
    e.stopPropagation();
    setSelectedFees((prev) =>
      prev.includes(feeId) ? prev.filter((id) => id !== feeId) : [...prev, feeId]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedFees(fees.map((fee) => fee._id));
    } else {
      setSelectedFees([]);
    }
  };

  const handleSelectPayable = () => {
    const payableFeeIds = payableFees.map((fee) => fee._id);
    const allPayableSelected = payableFeeIds.every((id) => selectedFees.includes(id));
    if (allPayableSelected) {
      setSelectedFees(selectedFees.filter((id) => !payableFeeIds.includes(id)));
    } else {
      setSelectedFees([...new Set([...selectedFees, ...payableFeeIds])]);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && selectedFees.length === 0) {
      toast.error("Please select at least one fee");
      return;
    }
    if (activeStep === 1 && !paymentMethod) {
      toast.error("Please select payment method");
      return;
    }
    if (activeStep === 1 && paymentMethod !== "cash" && !transactionId) {
      toast.error("Please enter transaction ID");
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const buildReceiptData = (paymentResponse: any, paidAmount: number) => {
    const paymentDate = new Date(paymentResponse.paymentDate || new Date());
    const receiptNo = paymentResponse.receiptNo || `RCP-${Date.now()}`;
    const selectedFeeObjects = fees.filter((fee) => selectedFees.includes(fee._id));

    const receiptFees = selectedFeeObjects.map((fee) => ({
      feeType: fee.feeType,
      month: fee.month,
      originalAmount: fee.amount,
      discount: fee.discount || 0,
      waiver: fee.waiver || 0,
      netAmount: fee.amount - (fee.discount || 0) - (fee.waiver || 0),
      dueAmount: fee.dueAmount || 0,
      paidAmount: fee.dueAmount || 0,
      previousPaid: fee.paidAmount || 0,
      quantity: 1,
    }));

    const subtotal = selectedFeeObjects.reduce((sum, f) => sum + f.amount, 0);
    const totalDiscount = selectedFeeObjects.reduce((sum, f) => sum + (f.discount || 0), 0);
    const totalWaiver = selectedFeeObjects.reduce((sum, f) => sum + (f.waiver || 0), 0);
    const totalNetAmount = subtotal - totalDiscount - totalWaiver;
    const amountPaid = paidAmount;


    return {
      _id: paymentResponse._id || `temp-${Date.now()}`,
      receiptNo,
      paymentDate: paymentDate.toISOString(),
      status: "active",
      paymentMethod,
      collectedBy,
      studentName: student.name,
      studentId: student.studentId,
      className: student.className || "",
      rollNumber: student.roll || "",
      section: student.section || "",
      totalAmount: paidAmount,
      fees: receiptFees,
      summary: {
        totalItems: selectedFees.length,
        subtotal,
        totalDiscount,
        totalWaiver,
        totalNetAmount,
        amountPaid,
        subtotalWord: numberToWords(subtotal),
        totalNetAmountWord: numberToWords(totalNetAmount),
        amountPaidWord: numberToWords(amountPaid)
      },
      transactionId: paymentMethod !== "cash" ? transactionId : undefined,
      note: note || undefined,
    };
  };

  const handleSubmitPayment = async () => {
    setIsProcessing(true);
    try {
      const selectedFeeObjects = fees.filter((fee) => selectedFees.includes(fee._id));
      const totalPayableAmount = selectedFeeObjects.reduce((sum, fee) => sum + (fee.dueAmount || 0), 0);

      if (totalPayableAmount === 0) {
        toast.error("No due amount to pay for selected fees");
        setIsProcessing(false);
        return;
      }

      const paymentData = {
        studentId: student._id,
        feeIds: selectedFees,
        amountPaid: totalPayableAmount,
        paymentMethod,
        transactionId: paymentMethod !== "cash" ? transactionId : undefined,
        note,
        collectedBy,
      };

      const result = await createBulkPayment(paymentData).unwrap();

      if (result.success) {
        const receiptData = buildReceiptData(result, totalPayableAmount);
        toast.success(
          <Box>
            <Typography variant="body1" fontWeight="bold">Payment Successful!</Typography>
            <Typography variant="body2">Receipt No: {receiptData.receiptNo}</Typography>
            <Typography variant="body2">Amount Paid: ৳{totalPayableAmount.toLocaleString()}</Typography>
          </Box>,
          { duration: 5000, icon: "✅" }
        );
        if (refetch) refetch();
        if (onPaymentCompleted) onPaymentCompleted(receiptData);
        setTimeout(() => { handleReset(); onClose(); }, 1500);
      } else {
        toast.error(result.message || "Payment failed");
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error?.data?.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedFees([]);
    setPaymentMethod("cash");
    setTransactionId("");
    setNote("");
    setCollectedBy("Nesar Ahmed");
    setIsProcessing(false);
    setDiscountValue(0);
  };

  const handleClose = () => {
    if (!isProcessing) { handleReset(); onClose(); }
  };

  const isAllSelected = fees.length > 0 && selectedFees.length === fees.length;
  const isIndeterminate = selectedFees.length > 0 && selectedFees.length < fees.length;

  return (
    <Modal open={open} onClose={handleClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Paper sx={{ width: "100%", maxWidth: 900, maxHeight: "90vh", overflow: "auto", borderRadius: 2, boxShadow: (theme) => theme.shadows[10], background: "#fff" }}>
        {/* Header */}
        <Box sx={{ p: 3, background: "#2c3e50", color: "white", borderRadius: "8px 8px 0 0", position: "relative" }}>
          <IconButton onClick={handleClose} sx={{ position: "absolute", right: 16, top: 16, color: "white" }} disabled={isProcessing}>
            <Close />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Bulk Fee Payment</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>Student: {student.name} ({student.studentId})</Typography>
        </Box>

        {/* Stepper */}
        <Box sx={{ p: 3, background: "#f8f9fa" }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* ── STEP 0 ── */}
          {activeStep === 0 && (
            <>
              <Alert severity="info" sx={{ mb: 3, borderRadius: 1 }}>
                Select fees to pay for {student.name}
              </Alert>

              {/* Selection buttons */}
              <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button variant="outlined" size="small" onClick={() => { if (isAllSelected) setSelectedFees([]); else setSelectedFees(fees.map((f) => f._id)); }} sx={{ borderRadius: 0 }}>
                  {isAllSelected ? "Deselect All" : "Select All"}
                </Button>
                <Button variant="outlined" size="small" onClick={handleSelectPayable} sx={{ borderRadius: 0 }}>
                  {payableFees.every((fee) => selectedFees.includes(fee._id)) ? "Deselect Payable" : "Select Payable"}
                </Button>
                <Chip
                  label={`${selectedFees.length} selected (৳${totals.totalDue.toLocaleString()})`}
                  color="primary"
                  variant="outlined"
                  sx={{ borderRadius: 0 }}
                />
              </Box>

              {/* Fee table */}
              <TableContainer sx={{ mb: 3, maxHeight: 280, border: "1px solid #ddd" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ background: "#f5f5f5" }}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={isAllSelected} indeterminate={isIndeterminate} onChange={handleSelectAll} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Fee Type</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Month</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>Amount</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>Discount</TableCell>

                      <TableCell align="right" sx={{ fontWeight: "bold" }}>Due</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fees.map((fee: any) => (
                      <TableRow
                        key={fee._id}
                        hover
                        sx={{ cursor: "pointer", backgroundColor: selectedFees.includes(fee._id) ? "rgba(25, 118, 210, 0.08)" : "inherit" }}
                        onClick={(e) => handleSelectFee(e, fee._id)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedFees.includes(fee._id)}
                            onChange={(e) => handleSelectFee(e, fee._id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell>{fee.feeType}</TableCell>
                        <TableCell>{fee.month}</TableCell>
                        <TableCell align="right">৳{fee.amount.toLocaleString()}</TableCell>

                        <TableCell align="right" sx={{ color: "error.main" }}>
                          -৳{((fee.discount || 0) + (fee.waiver || 0)).toLocaleString()}
                        </TableCell>

                        <TableCell align="right" sx={{ color: "#d32f2f", fontWeight: "bold" }}>
                          ৳{fee.dueAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={fee.status}
                            size="small"
                            sx={{
                              borderRadius: 0,
                              background: fee.status === "paid" ? "#4caf50" : fee.status === "partial" ? "#ff9800" : "#f44336",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* ── Quick Discount Section ── */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: "#4caf50", backgroundColor: "#f1f8e9" }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: "bold", color: "#2e7d32" }}>
                  <Discount fontSize="small" />
                  Apply Quick Discount Before Payment
                </Typography>

                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mt: 1, flexWrap: "wrap" }}>
                  <TextField
                    select size="small" value={discountType}
                    onChange={(e) => { setDiscountType(e.target.value as "flat" | "percentage"); setDiscountValue(0); }}
                    sx={{ minWidth: 160 }}
                  >
                    <MenuItem value="flat">Flat Amount (৳)</MenuItem>
                    <MenuItem value="percentage">Percentage (%)</MenuItem>
                  </TextField>

                  <TextField
                    size="small"
                    type="number"
                    label={discountType === "percentage" ? "Percentage (%)" : "Amount (৳)"}
                    value={discountValue || ""}
                    onChange={(e) => setDiscountValue(e.target.value === "" ? 0 : Number(e.target.value))}
                    sx={{ flex: 1, minWidth: 120 }}
                    inputProps={{ min: 0, max: discountType === "percentage" ? 100 : 99999 }}
                  />

                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleApplyDiscount}
                    disabled={payableFees.length === 0 || !discountValue || discountValue <= 0 || isApplyingDiscount}
                    startIcon={isApplyingDiscount ? <CircularProgress size={16} color="inherit" /> : <Discount />}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {isApplyingDiscount ? "Applying..." : "Apply Discount"}
                  </Button>
                </Box>


                {discountPreview && (
                  <Box sx={{ mt: 1.5, p: 1, background: "#c8e6c9", borderRadius: 1 }}>
                    <Typography variant="caption" color="#1b5e20" fontWeight="bold">
                      Preview: {discountPreview.label}
                    </Typography>
                    <Typography variant="body2" color="#1b5e20" fontWeight="bold">
                      Estimated saving: ৳{discountPreview.estimated.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="#2e7d32">
                      After discount, total due will be approx. ৳{Math.max(0, totals.totalDue - discountPreview.estimated).toFixed(2)}
                    </Typography>
                  </Box>
                )}

                {payableFees.length === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    No payable fees remaining.
                  </Typography>
                )}
              </Paper>

              {/* Summary card */}
              {selectedFees.length > 0 && (
                <Card sx={{ mb: 2, border: "1px solid #1976d2", background: "#e3f2fd" }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                        <Typography variant="h6">৳{totals.totalAmount.toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">Adjustments</Typography>
                        <Typography variant="h6" color="error">-৳{(totals.totalDiscount + totals.totalWaiver).toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">Net Amount</Typography>
                        <Typography variant="h6">৳{totals.netAmount.toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">Total Due</Typography>
                        <Typography variant="h5" color="error" fontWeight="bold">৳{totals.totalDue.toLocaleString()}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* ── STEP 1 ── */}
          {activeStep === 1 && (
            <>
              <Typography variant="h6" gutterBottom>Payment Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card sx={{ mb: 2, backgroundColor: "#f5f5f5" }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom fontWeight="bold">Payment Summary</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Amount to Pay</Typography>

                          <Typography variant="h5" color="primary" fontWeight="bold">৳{totals.totalDue.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Fees Selected</Typography>
                          <Typography variant="h6">{totals.selectedCount}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Student</Typography>
                          <Typography variant="body2" noWrap>{student.name}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">ID</Typography>
                          <Typography variant="body2">{student.studentId}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField select fullWidth label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} size="small" required>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="bkash">bKash</MenuItem>
                    <MenuItem value="nagad">Nagad</MenuItem>
                    <MenuItem value="bank">Bank Transfer</MenuItem>
                  </TextField>
                </Grid>

                {paymentMethod !== "cash" && (
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} size="small" placeholder={`Enter ${paymentMethod} transaction ID`} required />
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Collected By" value={collectedBy} onChange={(e) => setCollectedBy(e.target.value)} size="small" />
                </Grid>

                <Grid item xs={12}>
                  <TextField fullWidth label="Note (Optional)" multiline rows={2} value={note} onChange={(e) => setNote(e.target.value)} size="small" placeholder="Add any notes about this payment" />
                </Grid>
              </Grid>
            </>
          )}

          {/* ── STEP 2 ── */}
          {activeStep === 2 && (
            <>
              <Typography variant="h6" gutterBottom>Confirm Payment</Typography>
              <Card sx={{ mb: 2, backgroundColor: "#f5f5f5" }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">Payment Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Amount</Typography>
                      <Typography variant="h5" color="primary" fontWeight="bold">৳{totals.totalDue.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                      <Typography variant="body1" sx={{ textTransform: "uppercase" }}>{paymentMethod}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Collected By</Typography>
                      <Typography variant="body1">{collectedBy}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Fees Count</Typography>
                      <Typography variant="body1">{totals.selectedCount}</Typography>
                    </Grid>
                    {paymentMethod !== "cash" && transactionId && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                        <Typography variant="body1" sx={{ fontWeight: "medium" }}>{transactionId}</Typography>
                      </Grid>
                    )}
                    {note && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Note</Typography>
                        <Typography variant="body1">{note}</Typography>
                      </Grid>
                    )}
                    {(totals.totalDiscount + totals.totalWaiver) > 0 && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" color="text.secondary">Total Discounts Applied</Typography>
                        <Typography variant="body1" color="success.main" fontWeight="bold">
                          -৳{(totals.totalDiscount + totals.totalWaiver).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
              <Alert severity="info" sx={{ mb: 2, borderRadius: 1 }}>
                Please review all details before confirming the payment.
                {(totals.totalDiscount + totals.totalWaiver) > 0 && (
                  <> A total discount of <strong>৳{(totals.totalDiscount + totals.totalWaiver).toLocaleString()}</strong> has been applied.</>
                )}
              </Alert>
            </>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: "1px solid #ddd", background: "#f8f9fa" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={activeStep === 0 ? handleClose : handleBack} disabled={isProcessing} variant="outlined">
              {activeStep === 0 ? "Cancel" : "Back"}
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === 2 ? handleSubmitPayment : handleNext}
              disabled={
                isProcessing ||
                isApplyingDiscount ||
                (activeStep === 0 && selectedFees.length === 0) ||
                (activeStep === 1 && paymentMethod !== "cash" && !transactionId)
              }
              sx={{ minWidth: 150, background: activeStep === 2 ? "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)" : undefined }}
            >
              {isProcessing ? (
                <CircularProgress size={24} color="inherit" />
              ) : activeStep === 2 ? (
                `Pay ৳${totals.totalDue.toLocaleString()}`
              ) : (
                "Next"
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};

export default BulkPaymentModal;
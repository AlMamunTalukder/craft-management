
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import {
  Modal, Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Grid, Alert, CircularProgress,
  Paper, FormControlLabel, Switch, Chip, Divider, Stack,
} from "@mui/material";
import { Discount, MoneyOff, Close, Save, Info, Repeat } from "@mui/icons-material";
import { useApplyFeeAdjustmentMutation } from "@/redux/api/feesApi";
import toast from "react-hot-toast";

interface FeeAdjustmentModalProps {
  open: boolean;
  onClose: () => void;
  fee: any;
  onSuccess?: (updatedFee?: any) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const buildMonthOptions = (academicYear?: string) => {
  const now = new Date();
  const currentMonthIdx = now.getMonth();   // 0-based
  const currentYear = now.getFullYear();
  const baseYear = academicYear ? parseInt(academicYear) : currentYear;

  const options: { label: string; value: string }[] = [];

  // Show from current month to end of next year (enough range)
  const endYear = Math.max(baseYear + 1, currentYear + 1);

  for (let year = currentYear; year <= endYear; year++) {
    const startMonth = year === currentYear ? currentMonthIdx : 0;
    for (let m = startMonth; m < 12; m++) {
      options.push({
        label: `${MONTH_NAMES[m]} ${year}`,
        value: `${MONTH_NAMES[m]}-${year}`,
      });
    }
  }

  return options;
};

const FeeAdjustmentModal = ({ open, onClose, fee, onSuccess }: FeeAdjustmentModalProps) => {
  const [applyFeeAdjustment, { isLoading }] = useApplyFeeAdjustmentMutation();

  const [adjustmentKind, setAdjustmentKind] = useState<"discount" | "waiver">("discount");
  const [adjustmentType, setAdjustmentType] = useState<"percentage" | "flat">("flat");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");

  const monthOptions = useMemo(
    () => buildMonthOptions(fee?.academicYear),
    [fee?.academicYear]
  );

  // ✅ Default startMonth to current month (not fee's month which may be past)
  useEffect(() => {
    if (open && fee) {
      setAdjustmentKind("discount");
      setAdjustmentType("flat");
      setValue("");
      setReason("");
      setIsRecurring(false);

      // Use fee's month only if it's in the future options list; otherwise use first available
      const feeMonthInOptions = monthOptions.find((o) => o.value === fee.month);
      const defaultMonth = feeMonthInOptions ? fee.month : (monthOptions[0]?.value || "");
      setStartMonth(defaultMonth);
      setEndMonth(defaultMonth);
    }
  }, [open, fee, monthOptions]);

  // Sync endMonth >= startMonth
  useEffect(() => {
    if (startMonth && endMonth) {
      const startIdx = monthOptions.findIndex((o) => o.value === startMonth);
      const endIdx = monthOptions.findIndex((o) => o.value === endMonth);
      if (endIdx < startIdx) setEndMonth(startMonth);
    }
  }, [startMonth, monthOptions, endMonth]);

  const numericValue = parseFloat(value) || 0;
  const currentDue = fee?.dueAmount ?? fee?.amount ?? 0;
  const feeAmount = fee?.amount ?? 0;

  const calculatedAmount = useMemo(() => {
    if (!fee || numericValue <= 0) return 0;
    if (adjustmentType === "percentage") {
      return Math.min((feeAmount * Math.min(numericValue, 100)) / 100, currentDue);
    }
    return Math.min(numericValue, isRecurring ? feeAmount : currentDue);
  }, [numericValue, adjustmentType, feeAmount, currentDue, fee, isRecurring]);

  const newDueAmount = Math.max(0, currentDue - calculatedAmount);

  const coveredMonths = useMemo(() => {
    if (!startMonth || !endMonth) return [];
    const startIdx = monthOptions.findIndex((o) => o.value === startMonth);
    const endIdx = monthOptions.findIndex((o) => o.value === endMonth);
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return [];
    return monthOptions.slice(startIdx, endIdx + 1).map((o) => o.label);
  }, [startMonth, endMonth, monthOptions]);

  const isValid =
    !!reason.trim() &&
    numericValue > 0 &&
    (adjustmentType === "percentage"
      ? numericValue <= 100
      : numericValue <= (isRecurring ? feeAmount : currentDue)) &&
    !!startMonth &&
    !!endMonth;

  const handleSubmit = async () => {
    if (!fee || !isValid) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    const studentId = fee?.student?._id || fee?.studentId || fee?.student;
    if (!studentId) {
      toast.error("Student ID not found");
      return;
    }

    const adjustmentData = {
      student: studentId,
      fee: fee._id,
      type: adjustmentKind,
      adjustmentType,
      value: numericValue,
      reason,
      isRecurring,
      startMonth,
      endMonth: isRecurring ? endMonth : startMonth,
      academicYear: fee?.academicYear || new Date().getFullYear().toString(),
    };

    try {
      const result = await applyFeeAdjustment(adjustmentData);

      if (result?.data) {
        const monthCount = isRecurring ? coveredMonths.length : 1;

        toast.success(
          `${adjustmentKind === "discount" ? "Discount" : "Waiver"} applied to ${monthCount} month${monthCount > 1 ? "s" : ""}!`,
          { duration: 4000 }
        );

        // ✅ Build optimistic updated fee so parent table updates immediately
        const optimisticFee = {
          ...fee,
          discount: adjustmentKind === "discount"
            ? (fee.discount || 0) + calculatedAmount
            : (fee.discount || 0),
          waiver: adjustmentKind === "waiver"
            ? (fee.waiver || 0) + calculatedAmount
            : (fee.waiver || 0),
          dueAmount: newDueAmount,
          status: newDueAmount === 0 ? "paid" : fee.paidAmount > 0 ? "partial" : "unpaid",
        };

        // Pass the optimistic fee back so parent can update its local state immediately
        if (onSuccess) onSuccess(optimisticFee);
        onClose();
      }
    } catch (error: any) {
      console.error("Adjustment error:", error);
      toast.error(error?.data?.message || error?.message || "Failed to apply adjustment");
    }
  };

  if (!fee) return null;

  // ✅ Filtered end month options (only >= startMonth)
  const endMonthOptions = monthOptions.filter((opt) => {
    if (!startMonth) return true;
    const si = monthOptions.findIndex((o) => o.value === startMonth);
    const ci = monthOptions.findIndex((o) => o.value === opt.value);
    return ci >= si;
  });

  return (
    <Modal open={open} onClose={isLoading ? undefined : onClose}>
      <Box sx={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "95vw", sm: 620 },
        maxHeight: "92vh",
        bgcolor: "background.paper",
        borderRadius: 2, boxShadow: 24,
        overflow: "auto",
      }}>
        {/* Header */}
        <Box sx={{
          p: 2.5,
          background: adjustmentKind === "discount"
            ? "linear-gradient(135deg, #2e7d32 0%, #43a047 100%)"
            : "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
          color: "white",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {adjustmentKind === "discount" ? <Discount /> : <MoneyOff />}
            <Typography variant="h6" fontWeight="bold">
              Apply {adjustmentKind === "discount" ? "Discount" : "Waiver"}
            </Typography>
          </Box>
          <Button onClick={onClose} disabled={isLoading} sx={{ color: "white", minWidth: 0 }}>
            <Close />
          </Button>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Fee summary */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: "grey.50", borderRadius: 1.5 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Fee Details
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Student:</strong> {fee.student?.name || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Month:</strong> {fee.month}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Original:</strong> ৳{feeAmount.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Current Due:</strong>{" "}
                  <span style={{ color: "#d32f2f", fontWeight: "bold" }}>
                    ৳{currentDue.toLocaleString()}
                  </span>
                </Typography>
              </Grid>
              {(fee.discount > 0 || fee.waiver > 0) && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Existing adjustments:</strong>
                    {fee.discount > 0 && ` Discount ৳${fee.discount}`}
                    {fee.waiver > 0 && ` | Waiver ৳${fee.waiver}`}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Type & Calculation */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={adjustmentKind}
                  label="Type"
                  onChange={(e) => setAdjustmentKind(e.target.value as "discount" | "waiver")}
                  disabled={isLoading}
                >
                  <MenuItem value="discount">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Discount fontSize="small" color="success" /> Discount
                    </Box>
                  </MenuItem>
                  <MenuItem value="waiver">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <MoneyOff fontSize="small" color="primary" /> Waiver
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Calculation</InputLabel>
                <Select
                  value={adjustmentType}
                  label="Calculation"
                  onChange={(e) => {
                    setAdjustmentType(e.target.value as "percentage" | "flat");
                    setValue("");
                  }}
                  disabled={isLoading}
                >
                  <MenuItem value="flat">Flat Amount (৳)</MenuItem>
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Value & calculated amount */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth size="small"
                label={adjustmentType === "percentage" ? "Percentage (%)" : "Amount (৳)"}
                type="number"
                value={value}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d*\.?\d*$/.test(v)) setValue(v);
                }}
                disabled={isLoading}
                error={
                  numericValue > 0 &&
                  (adjustmentType === "percentage"
                    ? numericValue > 100
                    : numericValue > (isRecurring ? feeAmount : currentDue))
                }
                helperText={
                  adjustmentType === "percentage"
                    ? "Max 100%"
                    : `Max ৳${(isRecurring ? feeAmount : currentDue).toLocaleString()}`
                }
                inputProps={{ min: 0, step: "any" }}
              />
            </Grid>
            <Grid item xs={6}>
              {/* ✅ Real-time preview of new due amount */}
              <Box sx={{
                border: "1px solid",
                borderColor: calculatedAmount > 0 ? "success.main" : "divider",
                borderRadius: 1, p: 1.2, height: "100%",
                bgcolor: calculatedAmount > 0 ? "rgba(76,175,80,0.06)" : "grey.50",
                display: "flex", flexDirection: "column", justifyContent: "center",
              }}>
                <Typography variant="caption" color="text.secondary">
                  {isRecurring ? "Per fee saving" : "New due amount"}
                </Typography>
                {!isRecurring ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ textDecoration: calculatedAmount > 0 ? "line-through" : "none" }}
                    >
                      ৳{currentDue.toLocaleString()}
                    </Typography>
                    {calculatedAmount > 0 && (
                      <>
                        <Typography variant="body2" color="text.secondary">→</Typography>
                        <Typography variant="body1" color="success.main" fontWeight="bold">
                          ৳{newDueAmount.toFixed(2)}
                        </Typography>
                      </>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body1" color="success.main" fontWeight="bold">
                    {calculatedAmount > 0 ? `-৳${calculatedAmount.toFixed(2)}` : "—"}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Reason */}
          <TextField
            fullWidth size="small" sx={{ mb: 2 }}
            label="Reason *"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline rows={2}
            disabled={isLoading}
            placeholder="Enter reason for this adjustment"
          />

          {/* Recurring toggle */}
          <Paper
            variant="outlined"
            sx={{
              p: 2, mb: 2, borderRadius: 1.5,
              borderColor: isRecurring ? "primary.main" : "divider",
              transition: "border-color 0.2s",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={isRecurring}
                  onChange={(e) => {
                    setIsRecurring(e.target.checked);
                    // Reset end month to start month when toggling off
                    if (!e.target.checked) setEndMonth(startMonth);
                  }}
                  disabled={isLoading}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Repeat fontSize="small" color={isRecurring ? "primary" : "action"} />
                  <Typography variant="body2" fontWeight={isRecurring ? "bold" : "normal"}>
                    Apply to a month range (recurring)
                  </Typography>
                </Box>
              }
            />

            {/* ✅ Always show month pickers (for both single and range) */}
            <Box sx={{ mt: 2 }}>
              {isRecurring && (
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
                  Select start and end month. All existing fee records in this range will be updated immediately.
                  Future fees generated in this range will also get this discount automatically.
                </Typography>
              )}

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{isRecurring ? "Start Month" : "Month"}</InputLabel>
                    <Select
                      value={startMonth}
                      label={isRecurring ? "Start Month" : "Month"}
                      onChange={(e) => {
                        setStartMonth(e.target.value);
                        if (!isRecurring) setEndMonth(e.target.value);
                      }}
                      disabled={isLoading}
                      MenuProps={{ PaperProps: { style: { maxHeight: 260 } } }}
                    >
                      {monthOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {isRecurring && (
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>End Month</InputLabel>
                      <Select
                        value={endMonth}
                        label="End Month"
                        onChange={(e) => setEndMonth(e.target.value)}
                        disabled={isLoading}
                        MenuProps={{ PaperProps: { style: { maxHeight: 260 } } }}
                      >
                        {endMonthOptions.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>

              {/* Covered months preview */}
              {isRecurring && coveredMonths.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color="primary.main" fontWeight="bold">
                    Covers {coveredMonths.length} month{coveredMonths.length > 1 ? "s" : ""}:
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                    {coveredMonths.map((m) => (
                      <Chip
                        key={m}
                        label={m}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem" }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>

            {!isRecurring && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Select the month you want to apply this adjustment to.
              </Typography>
            )}
          </Paper>

          {/* Summary alert */}
          {calculatedAmount > 0 && (
            <Alert
              severity={newDueAmount === 0 ? "success" : "info"}
              icon={<Info />}
              sx={{ mb: 2, "& .MuiAlert-message": { width: "100%" } }}
            >
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Summary
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    {adjustmentKind === "discount" ? "Discount" : "Waiver"} per month
                  </Typography>
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    ৳{calculatedAmount.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  {!isRecurring ? (
                    <>
                      <Typography variant="caption" color="text.secondary">New due</Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={newDueAmount === 0 ? "success.main" : "error.main"}
                      >
                        ৳{newDueAmount.toFixed(2)}
                        {newDueAmount === 0 && " ✓ Cleared!"}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="caption" color="text.secondary">
                        Total saving ({coveredMonths.length} months)
                      </Typography>
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        ৳{(calculatedAmount * coveredMonths.length).toFixed(2)}
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
              {isRecurring && coveredMonths.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  ৳{calculatedAmount.toFixed(2)} × {coveredMonths.length} months =
                  ৳{(calculatedAmount * coveredMonths.length).toFixed(2)} total saving
                </Typography>
              )}
            </Alert>
          )}

          <Divider sx={{ mb: 2 }} />

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button onClick={onClose} disabled={isLoading} variant="outlined">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading || !isValid}
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Save />}
              sx={{
                background: adjustmentKind === "discount"
                  ? "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)"
                  : "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                minWidth: 160,
              }}
            >
              {isLoading
                ? "Applying..."
                : isRecurring && coveredMonths.length > 1
                  ? `Apply to ${coveredMonths.length} months`
                  : `Apply ${adjustmentKind === "discount" ? "Discount" : "Waiver"}`}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default FeeAdjustmentModal;
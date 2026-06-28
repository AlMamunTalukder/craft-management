// StudentFeeDetailsModal.tsx — সম্পূর্ণ updated file

import {
  Box, Button, Chip, Grid, IconButton,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, Typography,
} from "@mui/material";
import { Payment, Discount } from "@mui/icons-material";
import CraftModal from "@/components/Shared/Modal";
import FeeAdjustmentModal from "@/components/FeeAdjustmentModal";
import { useState, useEffect, useMemo, useRef } from "react";

interface StudentFeeDetailsModalProps {
  open: boolean;
  onClose: () => void;
  student: any;
  enrollment: any;
  fees: any[];
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  onBulkPayment: () => void;
  onFeeUpdated?: () => void;
}

const StudentFeeDetailsModal = ({
  open,
  onClose,
  student,
  enrollment,
  fees,
  onBulkPayment,
  onFeeUpdated,
}: StudentFeeDetailsModalProps) => {
  const formatCurrency = (value: number) => `৳${(value || 0).toFixed(2)}`;

  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [optimisticOverrides, setOptimisticOverrides] = useState<Record<string, any>>({});

  const pendingRefetchRef = useRef(false);


  const currentFees = useMemo(() => {
    return (fees || []).map((fee) =>
      optimisticOverrides[fee._id] ? { ...fee, ...optimisticOverrides[fee._id] } : fee
    );
  }, [fees, optimisticOverrides]);

  const calculatedTotals = useMemo(() => {
    return currentFees.reduce(
      (acc, fee) => ({
        amount: acc.amount + (fee.amount || 0),
        paid: acc.paid + (fee.paidAmount || 0),
        due: acc.due + (fee.dueAmount || 0),
        discount: acc.discount + (fee.discount || 0),
        waiver: acc.waiver + (fee.waiver || 0),
      }),
      { amount: 0, paid: 0, due: 0, discount: 0, waiver: 0 }
    );
  }, [currentFees]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedFee(null);
      setAdjustmentModalOpen(false);
      setOptimisticOverrides({});
      pendingRefetchRef.current = false;
    }
  }, [open]);


  useEffect(() => {
    if (!open) return;

    if (pendingRefetchRef.current) {
      pendingRefetchRef.current = false;

      setOptimisticOverrides((prev) => {
        const next = { ...prev };
        for (const feeId of Object.keys(next)) {
          const serverFee = fees.find((f) => f._id === feeId);
          if (!serverFee) continue;

          const override = next[feeId];
          if (Math.abs((serverFee.dueAmount || 0) - (override.dueAmount || 0)) < 1) {
            delete next[feeId];
          }
        }
        return next;
      });
    }

  }, [fees, open]);

  const handleAdjustmentClick = (fee: any) => {
    const feeWithStudent = {
      ...fee,
      student: {
        _id: student?._id,
        name: student?.name,
        studentId: student?.studentId,
        mobile: student?.mobile,
      },
      enrollment: {
        rollNumber: enrollment?.rollNumber,
        className: enrollment?.className || fee?.class,
      },
    };
    setSelectedFee(feeWithStudent);
    setAdjustmentModalOpen(true);
  };

  const handleCloseAdjustmentModal = () => {
    setAdjustmentModalOpen(false);
    setSelectedFee(null);
  };

  const handleAdjustmentSuccess = (updatedFee?: any) => {
    handleCloseAdjustmentModal();

    if (updatedFee?._id) {
      setOptimisticOverrides((prev) => ({
        ...prev,
        [updatedFee._id]: {
          discount: updatedFee.discount,
          waiver: updatedFee.waiver,
          dueAmount: updatedFee.dueAmount,
          status: updatedFee.status,
        },
      }));
    }
    pendingRefetchRef.current = true;
    if (onFeeUpdated) onFeeUpdated();
  };

  if (!student) return null;

  return (
    <>
      <CraftModal
        open={open}
        setOpen={onClose}
        title={`Fee Details — ${student?.name || ""}`}
        size="xl"
        onClose={onClose}
      >
        <Box sx={{ p: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<Payment />}
              onClick={onBulkPayment}
            >
              Payment Now
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Student Information</Typography>
              <Typography><strong>Name:</strong> {student?.name}</Typography>
              <Typography><strong>Student ID:</strong> {student?.studentId}</Typography>
              <Typography><strong>Mobile:</strong> {student?.mobile}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Academic Information</Typography>
              <Typography><strong>Roll Number:</strong> {enrollment?.rollNumber}</Typography>
              <Typography><strong>Class:</strong> {currentFees[0]?.class}</Typography>
            </Grid>
          </Grid>

          <Box sx={{ mb: 3, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Fee Summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                <Typography variant="h6">{formatCurrency(calculatedTotals.amount)}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Paid</Typography>
                <Typography variant="h6" color="success.main">
                  {formatCurrency(calculatedTotals.paid)}
                </Typography>
              </Grid>
              {(calculatedTotals.discount > 0 || calculatedTotals.waiver > 0) && (
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">Adjustments</Typography>
                  <Typography variant="h6" color="primary.main">
                    -{formatCurrency(calculatedTotals.discount + calculatedTotals.waiver)}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Total Due</Typography>
                <Typography variant="h6" color="error.main" fontWeight="bold">
                  {formatCurrency(calculatedTotals.due)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h6" gutterBottom>Fee Breakdown</Typography>
          <TableContainer sx={{ overflowX: "auto", maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Fee Type</strong></TableCell>
                  <TableCell><strong>Month</strong></TableCell>
                  <TableCell><strong>Class</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                  <TableCell align="right"><strong>Discount</strong></TableCell>
                  <TableCell align="right"><strong>Waiver</strong></TableCell>
                  <TableCell align="right"><strong>Paid</strong></TableCell>
                  <TableCell align="right"><strong>Due</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Adjust</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentFees.map((fee) => {
                  const hasOptimistic = !!optimisticOverrides[fee._id];
                  return (
                    <TableRow
                      key={fee._id}
                      sx={{
                        backgroundColor:
                          fee.status === "paid" || fee.dueAmount === 0
                            ? "rgba(76, 175, 80, 0.06)"
                            : hasOptimistic
                              ? "rgba(25, 118, 210, 0.04)"
                              : "inherit",
                        transition: "background-color 0.4s ease",
                      }}
                    >
                      <TableCell>{fee.feeType || "Tuition"}</TableCell>
                      <TableCell>{fee.month}</TableCell>
                      <TableCell>{fee.class}</TableCell>
                      <TableCell align="right">{formatCurrency(fee.amount)}</TableCell>
                      <TableCell align="right">
                        {fee.discount > 0 ? (
                          <Typography color="success.main" fontSize="small" fontWeight="bold">
                            -{formatCurrency(fee.discount)}
                          </Typography>
                        ) : (
                          <Typography color="text.disabled" fontSize="small">—</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {fee.waiver > 0 ? (
                          <Typography color="primary.main" fontSize="small" fontWeight="bold">
                            -{formatCurrency(fee.waiver)}
                          </Typography>
                        ) : (
                          <Typography color="text.disabled" fontSize="small">—</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(fee.paidAmount)}</TableCell>
                      <TableCell align="right">
                        <Typography
                          fontWeight="bold"
                          color={fee.dueAmount > 0 ? "error.main" : "success.main"}
                          sx={{
                            transition: "color 0.3s",
                            animation: hasOptimistic ? "flash 0.6s ease-out" : "none",
                            "@keyframes flash": {
                              "0%": { opacity: 0.4 },
                              "100%": { opacity: 1 },
                            },
                          }}
                        >
                          {formatCurrency(fee.dueAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={fee.status?.toUpperCase()}
                          size="small"
                          color={
                            fee.status === "paid" ? "success"
                              : fee.status === "partial" ? "warning"
                                : "error"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        {fee.dueAmount > 0 ? (
                          <Tooltip title="Apply Discount / Waiver">
                            <IconButton
                              size="small"
                              onClick={() => handleAdjustmentClick(fee)}
                              sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                "&:hover": { bgcolor: "primary.dark" },
                                width: 28, height: 28,
                              }}
                            >
                              <Discount sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Chip label="Paid" size="small" color="success" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={onClose} variant="outlined">Close</Button>
          </Box>
        </Box>
      </CraftModal>

      <FeeAdjustmentModal
        open={adjustmentModalOpen}
        onClose={handleCloseAdjustmentModal}
        fee={selectedFee}
        onSuccess={handleAdjustmentSuccess}
      />
    </>
  );
};

export default StudentFeeDetailsModal;
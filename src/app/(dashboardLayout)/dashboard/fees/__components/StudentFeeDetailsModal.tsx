// src/components/FeeCollection/StudentFeeDetailsModal.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Payment, Discount } from "@mui/icons-material";
import CraftModal from "@/components/Shared/Modal";
import FeeAdjustmentModal from "@/components/FeeAdjustmentModal";
import { useState, useEffect, useMemo } from "react";

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
  totalAmount,
  totalDue,
  onBulkPayment,
  onFeeUpdated,
}: StudentFeeDetailsModalProps) => {
  const formatCurrency = (value: number) => `৳${value?.toFixed(2)}`;

  // State for fee adjustment modal
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);

  // ✅ FIXED: Use useMemo to get fresh fees when parent data changes
  const currentFees = useMemo(() => fees || [], [fees]);

  // ✅ FIXED: Calculate totals from current fees (not stale props)
  const calculatedTotals = useMemo(() => {
    const total = currentFees.reduce(
      (acc, fee) => ({
        amount: acc.amount + (fee.amount || 0),
        paid: acc.paid + (fee.paidAmount || 0),
        due: acc.due + (fee.dueAmount || 0),
      }),
      { amount: 0, paid: 0, due: 0 }
    );
    return total;
  }, [currentFees]);

  useEffect(() => {
    if (!open) {
      setSelectedFee(null);
      setAdjustmentModalOpen(false);
    }
  }, [open]);

  // Handle opening adjustment modal for a specific fee
  const handleAdjustmentClick = (fee: any) => {
    // Prepare fee data with student information
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

  // Handle closing adjustment modal
  const handleCloseAdjustmentModal = () => {
    setAdjustmentModalOpen(false);
    setSelectedFee(null);
  };

  // ✅ FIXED: Just call onFeeUpdated - parent handles the refetch
  const handleAdjustmentSuccess = () => {
    // Close adjustment modal immediately
    handleCloseAdjustmentModal();

    // Call parent's refresh function
    if (onFeeUpdated) {
      onFeeUpdated();
    }
  };

  if (!student) return null;

  return (
    <>
      <CraftModal
        open={open}
        setOpen={onClose}
        title={`Fee Details - ${student?.name || ""}`}
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
              size="medium"
            >
              Payment Now
            </Button>
          </Box>

          {/* Student Information */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Student Information
              </Typography>
              <Typography>
                <strong>Name:</strong> {student?.name}
              </Typography>
              <Typography>
                <strong>Student ID:</strong> {student?.studentId}
              </Typography>
              <Typography>
                <strong>Mobile:</strong> {student?.mobile}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Academic Information
              </Typography>
              <Typography>
                <strong>Roll Number:</strong> {enrollment?.rollNumber}
              </Typography>
              <Typography>
                <strong>Class:</strong> {currentFees[0]?.class}
              </Typography>
            </Grid>
          </Grid>

          {/* ✅ FIXED: Use calculatedTotals instead of stale props */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: "grey.50",
              borderRadius: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Fee Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography>
                  <strong>Total Amount:</strong>
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(calculatedTotals.amount)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography>
                  <strong>Paid Amount:</strong>
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatCurrency(calculatedTotals.paid)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography>
                  <strong>Due Amount:</strong>
                </Typography>
                <Typography variant="h6" color="error.main">
                  {formatCurrency(calculatedTotals.due)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography>
                  <strong>Total Fees:</strong>
                </Typography>
                <Typography variant="h6">{currentFees.length}</Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Fee Breakdown */}
          <Typography variant="h6" gutterBottom>
            Fee Breakdown
          </Typography>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Fee Type</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Month</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Class</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Amount</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Discount</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Waiver</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Paid</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Due</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentFees.map((fee) => (
                  <TableRow
                    key={fee._id}
                    sx={{
                      backgroundColor:
                        fee.status === "paid"
                          ? "rgba(76, 175, 80, 0.05)"
                          : fee.dueAmount === 0
                            ? "rgba(76, 175, 80, 0.05)"
                            : "inherit",
                    }}
                  >
                    <TableCell>{fee.feeType || "Tuition"}</TableCell>
                    <TableCell>{fee.month}</TableCell>
                    <TableCell>{fee.class}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(fee.amount)}
                    </TableCell>
                    {/* ✅ Show discount and waiver columns */}
                    <TableCell align="right">
                      {fee.discount > 0 ? (
                        <Typography color="primary" fontSize="small">
                          -{formatCurrency(fee.discount)}
                        </Typography>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {fee.waiver > 0 ? (
                        <Typography color="secondary" fontSize="small">
                          -{formatCurrency(fee.waiver)}
                        </Typography>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(fee.paidAmount)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        color={fee.dueAmount > 0 ? "error.main" : "success.main"}
                        fontWeight="bold"
                      >
                        {formatCurrency(fee.dueAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={fee.status.toUpperCase()}
                        size="small"
                        color={
                          fee.status === "paid"
                            ? "success"
                            : fee.status === "partial"
                              ? "warning"
                              : "error"
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      {/* Only show discount icon for fees that are not fully paid */}
                      {fee.dueAmount > 0 && (
                        <Tooltip title="Apply Discount/Waiver">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleAdjustmentClick(fee)}
                            sx={{
                              backgroundColor: "primary.main",
                              color: 'white',

                            }}
                          >
                            <Discount fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {fee.dueAmount === 0 && (
                        <Chip
                          label="Paid"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Optional close button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={onClose} variant="outlined">
              Close
            </Button>
          </Box>
        </Box>
      </CraftModal>

      {/* Fee Adjustment Modal */}
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
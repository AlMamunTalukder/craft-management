/* eslint-disable @typescript-eslint/no-explicit-any */
import CraftModal from "@/components/Shared/Modal";
import { Box, Grid, Typography, Chip, Divider, Button, alpha } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useGetStudentAdjustmentsQuery, useDeleteFeeAdjustmentMutation } from "@/redux/api/feesApi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface ViewFeeModalProps {
  open: boolean;
  onClose: () => void;
  fee: any;
  student?: any;
  refetch?: () => void;
}

const ViewFeeModal = ({ open, onClose, fee, student, refetch }: ViewFeeModalProps) => {
  const { data: adjustmentsData } = useGetStudentAdjustmentsQuery(
    { studentId: student?._id } as any,
    { skip: !student?._id || !open }
  );
  const [deleteAdjustment, { isLoading: isDeleting }] = useDeleteFeeAdjustmentMutation();

  if (!fee) return null;

  const formatCurrency = (value: number) => `৳${value?.toLocaleString() ?? "0"}`;
  const netAmount = (fee.amount || 0) - (fee.discount || 0) - (fee.waiver || 0);

  const statusConfig: Record<string, { color: any; label: string }> = {
    paid: { color: "success", label: "Paid" },
    partial: { color: "warning", label: "Partial" },
    unpaid: { color: "error", label: "Unpaid" },
  };
  const status = statusConfig[fee.status] || { color: "default", label: fee.status };

  const handleRemove = async (type: "discount" | "waiver") => {
    const amount = type === "discount" ? fee.discount : fee.waiver;
    if (!amount || amount <= 0) { toast.error(`No ${type} to remove`); return; }
    const raw: any = (adjustmentsData as any)?.data || (adjustmentsData as any)?.data?.data || adjustmentsData;
    const list: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const match = [...list].reverse().find((adj: any) => (adj.fee?._id === fee._id || adj.fee === fee._id || adj.fee?.toString() === fee._id) && adj.type === type);
    if (!match) {
      toast.error(`No ${type} record found — edit fee to reset to 0`);
      return;
    }
    try {
      await deleteAdjustment(match._id).unwrap();
      toast.success(`${type} removed • Due restored`);
      if (refetch) refetch();
      // keep popup open to show updated amounts — user can close manually
    } catch (e: any) { toast.error(e?.data?.message || `Failed to remove ${type}`); }
  };

  return (
    <CraftModal open={open} setOpen={onClose} title="Fee Details — Manage Adjustments" size="md" onClose={onClose}>
      <Box sx={{ p: 1 }}>
        {student && (
          <>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Student Information</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Student Name</Typography><Typography variant="body1">{student.name}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Class</Typography><Typography variant="body1">{typeof student.className === "object" ? student.className?.name || student.className?.className : student.className}</Typography></Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Fee Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}><Typography variant="body2" color="text.secondary">Fee Type</Typography><Typography variant="body1">{fee.feeType || "N/A"}</Typography></Grid>
          <Grid item xs={6}><Typography variant="body2" color="text.secondary">Month</Typography><Typography variant="body1">{fee.month || "N/A"}</Typography></Grid>
          <Grid item xs={6}><Typography variant="body2" color="text.secondary">Academic Year</Typography><Typography variant="body1">{fee.academicYear || "N/A"}</Typography></Grid>
          <Grid item xs={6}><Typography variant="body2" color="text.secondary">Due Date</Typography><Typography variant="body1">{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : "N/A"}</Typography></Grid>

          <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

          {/* Amounts — serial wise, total & due not editable */}
          <Grid item xs={6}><Typography variant="body2" color="text.secondary">1. Total Amount</Typography><Typography variant="body1" fontWeight={700}>{formatCurrency(fee.amount)}</Typography><Typography variant="caption" color="text.secondary">Not editable</Typography></Grid>
          <Grid item xs={6}><Typography variant="body2" color="text.secondary">2. Net Amount</Typography><Typography variant="body1" fontWeight="bold">{formatCurrency(netAmount)}</Typography><Typography variant="caption" color="text.secondary">After D/W</Typography></Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Discount</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="body1" color="error">{fee.discount > 0 ? `-${formatCurrency(fee.discount)}` : formatCurrency(0)}</Typography>
              {fee.discount > 0 && <Button size="small" variant="outlined" color="warning" onClick={() => handleRemove("discount")} disabled={isDeleting} sx={{ height: 22, fontSize: "0.65rem", borderRadius: 2, textTransform: "none", px: 1, minWidth: 0 }} endIcon={<CloseIcon sx={{ fontSize: 12 }} />}>Remove</Button>}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Waiver</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="body1" color="error">{fee.waiver > 0 ? `-${formatCurrency(fee.waiver)}` : formatCurrency(0)}</Typography>
              {fee.waiver > 0 && <Button size="small" variant="outlined" color="error" onClick={() => handleRemove("waiver")} disabled={isDeleting} sx={{ height: 22, fontSize: "0.65rem", borderRadius: 2, textTransform: "none", px: 1, minWidth: 0 }} endIcon={<CloseIcon sx={{ fontSize: 12 }} />}>Remove</Button>}
            </Box>
          </Grid>

          <Grid item xs={6}><Typography variant="body2" color="text.secondary">3. Paid Amount</Typography><Typography variant="body1">{formatCurrency(fee.paidAmount)}</Typography></Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">4. Due Amount</Typography>
            <Typography variant="body1" color="error" fontWeight="bold">{formatCurrency(fee.dueAmount)}</Typography>
            <Typography variant="caption" color="text.secondary">Not editable • Auto</Typography>
          </Grid>

          <Grid item xs={6}><Typography variant="body2" color="text.secondary">Status</Typography><Chip label={status.label} color={status.color} size="small" variant="outlined" /></Grid>
          <Grid item xs={6}><Typography variant="body2" color="text.secondary">Today Payment</Typography><Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", fontSize: "0.75rem" }}>Use Bulk Pay → edit Today Payment (e.g., 5000 of 10000) — remaining stays as Partial</Typography></Grid>

          {fee.lateFeeAmount > 0 && (
            <>
              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Late Fee Amount</Typography><Typography variant="body1" color="warning.main">{formatCurrency(fee.lateFeeAmount)}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Late Fee Days</Typography><Typography variant="body1">{fee.lateFeeDays || 0}</Typography></Grid>
            </>
          )}

          <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
          <Grid item xs={12}>
            <Box sx={{ p: 1.5, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04), borderRadius: 2, border: (theme) => `1px dashed ${alpha(theme.palette.primary.main, 0.15)}` }}>
              <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ display: "block", mb: 0.5 }}>All remove/update here in popup</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", lineHeight: 1.4 }}>Click <strong>Remove</strong> next to Discount/Waiver to restore due. For new discount/waiver use <strong>Apply Discount/Waiver</strong> from Due Fees table. Partial is automatic.</Typography>
            </Box>
          </Grid>

          <Grid item xs={6}><Typography variant="body2" color="text.secondary">Created At</Typography><Typography variant="body2">{new Date(fee.createdAt).toLocaleString()}</Typography></Grid>
          <Grid item xs={6}><Typography variant="body2" color="text.secondary">Last Updated</Typography><Typography variant="body2">{new Date(fee.updatedAt).toLocaleString()}</Typography></Grid>
        </Grid>
      </Box>
    </CraftModal>
  );
};

export default ViewFeeModal;

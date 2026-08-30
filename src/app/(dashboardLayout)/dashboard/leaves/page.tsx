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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { PageHeader, PageAction } from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import {
  useGetAllLeavesQuery,
  useCreateLeaveMutation,
  useUpdateLeaveStatusMutation,
  useDeleteLeaveMutation,
} from "@/redux/api/leaveApi";
import { useGetAllTeachersQuery } from "@/redux/api/teacherApi";
import { useGetAllStaffQuery } from "@/redux/api/staffApi";
import type { TLeave } from "@/interface";

const LEAVE_TYPES = [
  { value: "casual", label: "Casual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "annual", label: "Annual Leave" },
  { value: "maternity", label: "Maternity Leave" },
  { value: "paternity", label: "Paternity Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
  { value: "other", label: "Other" },
];

const typeLabel = (t: string) =>
  LEAVE_TYPES.find((x) => x.value === t)?.label || t;

const formatDate = (d?: string) => {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const LeavePage = () => {
  const [page, setPage] = useState(1);
  const [employeeType, setEmployeeType] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    employeeType: "teacher",
    employee: "",
    leaveType: "casual",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useGetAllLeavesQuery({
    page,
    limit: 10,
    employeeType: employeeType || undefined,
    status: status || undefined,
  });
  const { data: teachersData } = useGetAllTeachersQuery({ limit: 100, page: 1, sort: 'teacherSerial' } as any);
  const { data: staffData } = useGetAllStaffQuery({ limit: 100, page: 1 });

  const [createLeave] = useCreateLeaveMutation();
  const [updateLeaveStatus] = useUpdateLeaveStatusMutation();
  const [deleteLeave] = useDeleteLeaveMutation();

  const leaves: TLeave[] = data?.data?.data || [];
  const meta = data?.data?.meta || { page: 1, total: 0, totalPage: 1, limit: 10 };
  const teachers = [...(teachersData?.data || [])].sort((a: any, b: any) => {
    const aHas = !!a.teacherSerial; const bHas = !!b.teacherSerial;
    if (aHas && !bHas) return -1; if (!aHas && bHas) return 1; if (!aHas && !bHas) return 0;
    const aNum = parseInt(String(a.teacherSerial), 10); const bNum = parseInt(String(b.teacherSerial), 10);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return String(a.teacherSerial).localeCompare(String(b.teacherSerial), 'en', { numeric: true });
  });
  const staff = staffData?.data || [];

  const openCreate = () => {
    setForm({
      employeeType: "teacher",
      employee: "",
      leaveType: "casual",
      startDate: "",
      endDate: "",
      reason: "",
    });
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const days = (() => {
    if (!form.startDate || !form.endDate) return 0;
    const diff = new Date(form.endDate).getTime() - new Date(form.startDate).getTime();
    return diff >= 0 ? Math.floor(diff / 86400000) + 1 : 0;
  })();

  const handleSave = async () => {
    if (!form.employee || !form.startDate || !form.endDate) {
      Swal.fire("Missing Fields", "Employee and dates are required.", "warning");
      return;
    }
    if (days <= 0) {
      Swal.fire("Invalid Dates", "End date must be after start date.", "warning");
      return;
    }
    setSaving(true);
    try {
      const res: any = await createLeave(form);
      if (res?.error) throw new Error(res.error?.data?.message || "Save failed");
      Swal.fire("Saved!", "Leave request created.", "success");
      setOpen(false);
    } catch (err: any) {
      Swal.fire("Error", err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (leave: TLeave, next: "approved" | "rejected") => {
    const result = await Swal.fire({
      title: next === "approved" ? "Approve leave?" : "Reject leave?",
      text: `${leave.employeeInfo?.name || ""} - ${typeLabel(leave.leaveType)} (${leave.days} days)`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: next === "approved" ? "#2e7d32" : "#d33",
      confirmButtonText: next === "approved" ? "Approve" : "Reject",
    });
    if (!result.isConfirmed) return;
    try {
      const res: any = await updateLeaveStatus({ id: leave._id, status: next });
      if (res?.error) throw new Error(res.error?.data?.message || "Failed");
      Swal.fire("Updated!", `Leave ${next}.`, "success");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed", "error");
    }
  };

  const handleDelete = async (leave: TLeave) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Delete this leave record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete!",
    });
    if (!result.isConfirmed) return;
    try {
      const res: any = await deleteLeave(leave._id);
      if (res?.error) throw new Error(res.error?.data?.message || "Delete failed");
      Swal.fire("Deleted!", "Leave record deleted.", "success");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Delete failed", "error");
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader
        title="Employee Leave"
        subtitle="Manage teacher & staff leave requests"
        action={
          <PageAction onClick={openCreate} label="Apply Leave" icon={<AddIcon />} />
        }
      />

      <Paper sx={{ p: 1.5, mb: 2, borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr 1fr" }, gap: 1.5 }}>
          <TextField size="small" select label="Employee Type" value={employeeType} onChange={(e) => { setEmployeeType(e.target.value); setPage(1); }}>
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="teacher">Teachers</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
          </TextField>
          <TextField size="small" select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          <Box />
          <Box />
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Table size="small" sx={{ minWidth: 860 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f6fa" }}>
              {["Employee", "Type", "Leave Type", "Dates", "Days", "Reason", "Status", "Actions"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555", py: 1.2 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5, color: "#999" }}>
                  No leave records found.
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave._id} hover>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                      {leave.employeeInfo?.name || "Unknown"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.65rem", color: "#999", textTransform: "capitalize" }}>
                      {leave.employeeType} {leave.employeeInfo?.phone ? `· ${leave.employeeInfo.phone}` : ""}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem", textTransform: "capitalize" }}>{leave.employeeType}</TableCell>
                  <TableCell sx={{ fontSize: "0.78rem" }}>{typeLabel(leave.leaveType)}</TableCell>
                  <TableCell sx={{ fontSize: "0.72rem", color: "#666" }}>
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#4338ca" }}>{leave.days}</TableCell>
                  <TableCell sx={{ fontSize: "0.72rem", color: "#666", maxWidth: 200 }}>
                    {leave.reason || "-"}
                  </TableCell>
                  <TableCell><StatusChip status={leave.status} /></TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.3 }}>
                      {leave.status === "pending" && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton size="small" onClick={() => handleStatus(leave, "approved")} sx={{ color: "#2e7d32" }}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" onClick={() => handleStatus(leave, "rejected")} sx={{ color: "#d32f2f" }}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(leave)} sx={{ color: "#999" }}>
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Apply Leave</Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            <TextField size="small" select label="Employee Type *" name="employeeType" value={form.employeeType} onChange={(e) => setForm({ ...form, employeeType: e.target.value, employee: "" })}>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
            </TextField>
            <TextField size="small" select label="Employee *" name="employee" value={form.employee} onChange={handleChange}>
              <MenuItem value="">Select Employee</MenuItem>
              {(form.employeeType === "teacher" ? teachers : staff).map((e: any) => (
                <MenuItem key={e._id} value={e._id}>{e.name}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" select label="Leave Type *" name="leaveType" value={form.leaveType} onChange={handleChange}>
              {LEAVE_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" type="date" label="Start Date *" name="startDate" value={form.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField size="small" type="date" label="End Date *" name="endDate" value={form.endDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField
              size="small"
              label="Reason"
              name="reason"
              multiline
              rows={2}
              value={form.reason}
              onChange={handleChange}
              sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}
            />
          </Box>
          {days > 0 && (
            <Box sx={{ mt: 1.5, bgcolor: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "8px", px: 1.5, py: 1 }}>
              <Typography sx={{ fontSize: "0.78rem", color: "#4338ca" }}>
                Leave duration: <b>{days} day{days > 1 ? "s" : ""}</b>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button size="small" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            size="small"
            variant="contained"
            disabled={saving}
            onClick={handleSave}
            sx={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", fontWeight: 600, textTransform: "none" }}
          >
            {saving ? "Saving..." : "Submit Leave"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeavePage;

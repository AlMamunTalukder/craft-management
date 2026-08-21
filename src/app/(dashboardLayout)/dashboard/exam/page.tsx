/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EditNote as EditNoteIcon,
  Assessment as AssessmentIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import Link from "next/link";
import { PageHeader, PageAction } from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import {
  useGetAllExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  usePublishExamMutation,
} from "@/redux/api/examApi";
import { useGetAllClassesQuery } from "@/redux/api/classApi";
import type { TExam } from "@/interface";

const EXAM_TYPES = [
  "Term",
  "Assessment",
  "Quiz",
  "Monthly Test",
  "Special",
  "Admission Test",
  "Hifz",
];

const formatDate = (d?: string) => {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const emptySubject = { subject: "", fullMarks: 100, passMarks: 33 };

const ExamPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [className, setClassName] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<TExam | null>(null);
  const [form, setForm] = useState<any>({
    name: "",
    examType: "",
    className: "",
    department: "",
    academicYear: "",
    startDate: "",
    endDate: "",
    subjects: [{ ...emptySubject }],
  });
  const [saving, setSaving] = useState(false);

  const { data, isLoading, refetch } = useGetAllExamsQuery({
    page,
    limit,
    searchTerm,
    className,
    status,
  });
  const { data: classesData } = useGetAllClassesQuery({
    limit: 100,
    page: 1,
  });
  const [createExam] = useCreateExamMutation();
  const [updateExam] = useUpdateExamMutation();
  const [deleteExam] = useDeleteExamMutation();
  const [publishExam] = usePublishExamMutation();

  const classes = classesData?.data?.classes || [];
  const exams = data?.data?.data || [];
  const meta = data?.data?.meta || { page: 1, total: 0, totalPage: 1, limit: 10 };

  const openCreate = () => {
    setEditData(null);
    setForm({
      name: "",
      examType: "",
      className: "",
      department: "",
      academicYear: "",
      startDate: "",
      endDate: "",
      subjects: [{ ...emptySubject }],
    });
    setOpen(true);
  };

  const openEdit = (exam: TExam) => {
    setEditData(exam);
    setForm({
      name: exam.name,
      examType: exam.examType,
      className: exam.className?._id || "",
      department: exam.department || "",
      academicYear: exam.academicYear || "",
      startDate: exam.startDate ? exam.startDate.slice(0, 10) : "",
      endDate: exam.endDate ? exam.endDate.slice(0, 10) : "",
      subjects:
        exam.subjects?.length > 0
          ? exam.subjects.map((s: any) => ({
              subject: s.subject,
              fullMarks: s.fullMarks,
              passMarks: s.passMarks,
            }))
          : [{ ...emptySubject }],
    });
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (i: number, field: string, value: any) => {
    const subjects = [...form.subjects];
    subjects[i] = { ...subjects[i], [field]: value };
    setForm({ ...form, subjects });
  };

  const handleSave = async () => {
    if (!form.name || !form.examType || !form.className) {
      Swal.fire("Missing Fields", "Name, type and class are required.", "warning");
      return;
    }
    const validSubjects = form.subjects.filter(
      (s: any) => s.subject && Number(s.fullMarks) > 0,
    );
    if (validSubjects.length === 0) {
      Swal.fire("Missing Subjects", "Add at least one subject.", "warning");
      return;
    }
    const payload = {
      ...form,
      subjects: validSubjects.map((s: any) => ({
        subject: s.subject,
        fullMarks: Number(s.fullMarks),
        passMarks: Number(s.passMarks) || 0,
      })),
    };
    setSaving(true);
    try {
      if (editData) {
        const res: any = await updateExam({ id: editData._id, data: payload });
        if (res?.error) throw new Error(res.error?.data?.message || "Update failed");
      } else {
        const res: any = await createExam(payload);
        if (res?.error) throw new Error(res.error?.data?.message || "Create failed");
      }
      Swal.fire("Saved!", "Exam saved successfully.", "success");
      setOpen(false);
      refetch();
    } catch (err: any) {
      Swal.fire("Error", err.message || "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (exam: TExam) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete "${exam.name}"? Its marks will also be removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
    });
    if (!result.isConfirmed) return;
    try {
      const res: any = await deleteExam(exam._id);
      if (res?.error) throw new Error(res.error?.data?.message || "Delete failed");
      Swal.fire("Deleted!", "Exam deleted.", "success");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Delete failed", "error");
    }
  };

  const handlePublish = async (exam: TExam) => {
    const next = exam.status === "published" ? "draft" : "published";
    try {
      const res: any = await publishExam({ id: exam._id, status: next });
      if (res?.error) throw new Error(res.error?.data?.message || "Failed");
      Swal.fire("Updated!", `Exam ${next === "published" ? "published" : "unpublished"}.`, "success");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed", "error");
    }
  };

  const tableHeaders = [
    "Name",
    "Type",
    "Class",
    "Academic Year",
    "Dates",
    "Subjects",
    "Status",
    "Actions",
  ];

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader
        title="Exam & Results"
        subtitle="Manage exams, record marks and view results"
        action={
          <PageAction onClick={openCreate} label="Create Exam" icon={<AddIcon />} />
        }
      />

      <Paper sx={{ p: 1.5, mb: 2, borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "1fr 1fr 1fr 1fr" },
            gap: 1.5,
          }}
        >
          <TextField
            size="small"
            placeholder="Search exam name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#999" }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            size="small"
            select
            label="Class"
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Classes</MenuItem>
            {classes.map((c: any) => (
              <MenuItem key={c._id} value={c._id}>
                {c.className}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
          <TextField
            size="small"
            select
            label="Rows"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50].map((n) => (
              <MenuItem key={n} value={n}>
                {n} / page
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Table size="small" sx={{ minWidth: 820 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f6fa" }}>
              {tableHeaders.map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#555", py: 1.2 }}>
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
            ) : exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5, color: "#999" }}>
                  No exams found. Click &quot;Create Exam&quot; to add one.
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam: TExam) => (
                <TableRow key={exam._id} hover sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.82rem", minWidth: 170 }}>
                    {exam.name}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.78rem" }}>{exam.examType}</TableCell>
                  <TableCell sx={{ fontSize: "0.78rem" }}>
                    {exam.className?.className || "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.78rem" }}>
                    {exam.academicYear || "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem", color: "#666" }}>
                    {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>
                    {exam.subjects?.length || 0} subjects
                  </TableCell>
                  <TableCell>
                    <StatusChip status={exam.status} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.3 }}>
                      <Tooltip title="Enter Marks">
                        <IconButton
                          size="small"
                          LinkComponent={Link}
                          href={`/dashboard/exam/marks?examId=${exam._id}`}
                          sx={{ color: "#1976d2" }}
                        >
                          <EditNoteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Results">
                        <IconButton
                          size="small"
                          LinkComponent={Link}
                          href={`/dashboard/exam/result?examId=${exam._id}`}
                          sx={{ color: "#2e7d32" }}
                        >
                          <AssessmentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={exam.status === "published" ? "Unpublish" : "Publish"}>
                        <IconButton
                          size="small"
                          onClick={() => handlePublish(exam)}
                          sx={{ color: exam.status === "published" ? "#d32f2f" : "#2e7d32" }}
                        >
                          {exam.status === "published" ? (
                            <CancelIcon fontSize="small" />
                          ) : (
                            <CheckCircleIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(exam)} sx={{ color: "#f57c00" }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(exam)} sx={{ color: "#d32f2f" }}>
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
          <Button size="small" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Page {page} of {meta.totalPage} ({meta.total})
          </Typography>
          <Button size="small" disabled={page >= meta.totalPage} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {editData ? "Edit Exam" : "Create Exam"}
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, mb: 2 }}>
            <TextField size="small" label="Exam Name" name="name" value={form.name} onChange={handleChange} sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }} />
            <TextField size="small" select label="Exam Type" name="examType" value={form.examType} onChange={handleChange}>
              {EXAM_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" select label="Class" name="className" value={form.className} onChange={handleChange}>
              <MenuItem value="">Select Class</MenuItem>
              {classes.map((c: any) => (
                <MenuItem key={c._id} value={c._id}>{c.className}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" label="Department (optional)" name="department" value={form.department} onChange={handleChange} />
            <TextField size="small" label="Academic Year (optional)" name="academicYear" value={form.academicYear} onChange={handleChange} />
            <TextField size="small" type="date" label="Start Date" name="startDate" value={form.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField size="small" type="date" label="End Date" name="endDate" value={form.endDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#555" }}>
            Subjects & Marks
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {form.subjects.map((s: any, i: number) => (
              <Box key={i} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr auto" }, gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Subject name"
                  value={s.subject}
                  onChange={(e) => handleSubjectChange(i, "subject", e.target.value)}
                  sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Full"
                  value={s.fullMarks}
                  onChange={(e) => handleSubjectChange(i, "fullMarks", e.target.value)}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Pass"
                  value={s.passMarks}
                  onChange={(e) => handleSubjectChange(i, "passMarks", e.target.value)}
                />
                <IconButton
                  size="small"
                  color="error"
                  disabled={form.subjects.length === 1}
                  onClick={() =>
                    setForm({
                      ...form,
                      subjects: form.subjects.filter((_: any, j: number) => j !== i),
                    })
                  }
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setForm({ ...form, subjects: [...form.subjects, { ...emptySubject }] })}
              sx={{ alignSelf: "flex-start", mt: 0.5 }}
            >
              Add Subject
            </Button>
          </Box>
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
            {saving ? "Saving..." : "Save Exam"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamPage;

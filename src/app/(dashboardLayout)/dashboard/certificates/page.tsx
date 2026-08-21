/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
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
  InputAdornment,
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
  Search as SearchIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  WorkspacePremium as WorkspacePremiumIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { PageHeader, PageAction } from "@/components/common/PageHeader";
import {
  useGetAllCertificatesQuery,
  useCreateCertificateMutation,
  useDeleteCertificateMutation,
} from "@/redux/api/certificateApi";
import { useGetAllStudentsQuery } from "@/redux/api/studentApi";
import type { TCertificate } from "@/interface";

const CERT_TYPES = [
  { value: "testimonial", label: "Testimonial Certificate" },
  { value: "character", label: "Character Certificate" },
  { value: "transfer", label: "Transfer Certificate" },
  { value: "hifz", label: "Hifz Completion Certificate" },
  { value: "other", label: "Other Certificate" },
];

const formatDate = (d?: string) => {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const CertificatePage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    student: "",
    certificateType: "testimonial",
    academicYear: new Date().getFullYear().toString(),
    issueDate: new Date().toISOString().slice(0, 10),
    issuedBy: "",
    data: { class: "", section: "", year: "", remark: "" },
  });
  const [saving, setSaving] = useState(false);
  const [printCert, setPrintCert] = useState<TCertificate | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useGetAllCertificatesQuery({
    page,
    limit: 10,
    searchTerm,
  });
  const { data: studentsData } = useGetAllStudentsQuery({ limit: 200, page: 1 });
  const [createCertificate] = useCreateCertificateMutation();
  const [deleteCertificate] = useDeleteCertificateMutation();

  const certificates: TCertificate[] = data?.data?.data || [];
  const meta = data?.data?.meta || { page: 1, total: 0, totalPage: 1, limit: 10 };
  const students = studentsData?.data || [];

  const selectedStudent: any = students.find((s: any) => s._id === form.student);

  const openCreate = () => {
    setForm({
      student: "",
      certificateType: "testimonial",
      academicYear: new Date().getFullYear().toString(),
      issueDate: new Date().toISOString().slice(0, 10),
      issuedBy: "",
      data: { class: "", section: "", year: "", remark: "" },
    });
    setOpen(true);
  };

  const handleStudentSelect = (id: string) => {
    const st: any = students.find((s: any) => s._id === id);
    const cls = Array.isArray(st?.className)
      ? st?.className?.[0]?.className
      : st?.className?.className || st?.className;
    const sec = Array.isArray(st?.section) ? st?.section?.[0] : st?.section || "";
    setForm({
      ...form,
      student: id,
      data: {
        ...form.data,
        class: cls || "",
        section: typeof sec === "string" ? sec : "",
        year: st?.academicYear || "",
      },
    });
  };

  const handleSave = async () => {
    if (!form.student) {
      Swal.fire("Missing Student", "Select a student.", "warning");
      return;
    }
    setSaving(true);
    try {
      const res: any = await createCertificate(form);
      if (res?.error) throw new Error(res.error?.data?.message || "Failed");
      Swal.fire("Issued!", `Certificate issued. No: ${res.data?.data?.certificateNo || ""}`, "success");
      setOpen(false);
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cert: TCertificate) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete certificate ${cert.certificateNo}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete!",
    });
    if (!result.isConfirmed) return;
    try {
      const res: any = await deleteCertificate(cert._id);
      if (res?.error) throw new Error(res.error?.data?.message || "Failed");
      Swal.fire("Deleted!", "Certificate deleted.", "success");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed", "error");
    }
  };

  const handlePrint = (cert: TCertificate) => {
    setPrintCert(cert);
    setTimeout(() => {
      const el = document.getElementById("certificate-print");
      const originalTitle = document.title;
      if (el) {
        document.title = `Certificate-${cert.certificateNo}`;
        window.print();
        document.title = originalTitle;
      }
      setPrintCert(null);
    }, 150);
  };

  const typeLabel = (t: string) =>
    CERT_TYPES.find((c) => c.value === t)?.label || t;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader
        title="Certificates"
        subtitle="Issue and manage student certificates with auto-generated numbers"
        action={
          <PageAction onClick={openCreate} label="Issue Certificate" icon={<AddIcon />} />
        }
      />

      <Paper sx={{ p: 1.5, mb: 2, borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search by certificate number..."
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
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f6fa" }}>
              {["Certificate No", "Type", "Student", "Academic Year", "Issue Date", "Actions"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555", py: 1.2 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : certificates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5, color: "#999" }}>
                  No certificates issued yet.
                </TableCell>
              </TableRow>
            ) : (
              certificates.map((cert) => (
                <TableRow key={cert._id} hover>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem", color: "#4338ca" }}>
                    {cert.certificateNo}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.78rem" }}>{typeLabel(cert.certificateType)}</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    {cert.student?.name || "N/A"}
                    <Box sx={{ fontSize: "0.65rem", color: "#999" }}>{cert.student?.studentId || ""}</Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.78rem" }}>{cert.academicYear || "-"}</TableCell>
                  <TableCell sx={{ fontSize: "0.75rem", color: "#666" }}>{formatDate(cert.issueDate)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.3 }}>
                      <Tooltip title="Print">
                        <IconButton size="small" onClick={() => handlePrint(cert)} sx={{ color: "#2e7d32" }}>
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(cert)} sx={{ color: "#d32f2f" }}>
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
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Issue Certificate
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            <TextField
              size="small"
              select
              label="Student *"
              value={form.student}
              onChange={(e) => handleStudentSelect(e.target.value)}
              sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}
            >
              <MenuItem value="">Select Student</MenuItem>
              {students.map((s: any) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.studentName || s.name} {s.studentId ? `(${s.studentId})` : ""}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              select
              label="Certificate Type *"
              value={form.certificateType}
              onChange={(e) => setForm({ ...form, certificateType: e.target.value })}
            >
              {CERT_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Academic Year"
              value={form.academicYear}
              onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
            />
            <TextField
              size="small"
              type="date"
              label="Issue Date"
              value={form.issueDate}
              onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="Issued By"
              value={form.issuedBy}
              onChange={(e) => setForm({ ...form, issuedBy: e.target.value })}
              sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}
            />
            {selectedStudent && (
              <>
                <TextField
                  size="small"
                  label="Class (on certificate)"
                  value={form.data.class}
                  onChange={(e) => setForm({ ...form, data: { ...form.data, class: e.target.value } })}
                />
                <TextField
                  size="small"
                  label="Section"
                  value={form.data.section}
                  onChange={(e) => setForm({ ...form, data: { ...form.data, section: e.target.value } })}
                />
              </>
            )}
            <TextField
              size="small"
              label="Remark / Detail"
              multiline
              rows={2}
              value={form.data.remark}
              onChange={(e) => setForm({ ...form, data: { ...form.data, remark: e.target.value } })}
              sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}
            />
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
            {saving ? "Issuing..." : "Issue Certificate"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ position: "absolute", left: -9999, top: 0, width: 800 }}>
        <div id="certificate-print" ref={printRef}>
          {printCert && (
            <Box sx={{ width: "100%", p: 2 }}>
              <Box
                sx={{
                  border: "4px double #1e3a5f",
                  p: 2.5,
                  textAlign: "center",
                  minHeight: "70vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a5f", letterSpacing: 1 }}>
                    Craft International Institute
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                    Admission &amp; Madrasah (Boys&amp;Girls) · Residential &amp; Non-Residential
                  </Typography>
                  <Box sx={{ my: 2, borderTop: "1px solid #1e3a5f", width: 200, mx: "auto" }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e3a5f", textTransform: "uppercase", mt: 1 }}>
                    {typeLabel(printCert.certificateType)}
                  </Typography>
                  <Box sx={{ my: 2.5, textAlign: "left", mx: "auto", maxWidth: 520 }}>
                    <Typography sx={{ fontSize: "1rem", lineHeight: 2 }}>
                      This is to certify that{" "}
                      <b style={{ textDecoration: "underline", fontSize: "1.1rem" }}>
                        {printCert.student?.name || ""}
                      </b>
                      {printCert.student?.nameBangla ? (
                        <span> ({printCert.student.nameBangla})</span>
                      ) : null}
                      , {printCert.student?.studentId ? <>Student ID <b>{printCert.student.studentId}</b>, </> : null}
                      {printCert.data?.class ? <>of class <b>{printCert.data.class}</b>{printCert.data?.section ? ` (Section ${printCert.data.section})` : ""}, </> : null}
                      was a regular student of this institution during the academic year{" "}
                      <b>{printCert.academicYear || printCert.data?.year || "-"}</b>.
                    </Typography>
                    {printCert.data?.remark && (
                      <Typography sx={{ fontSize: "1rem", lineHeight: 1.8, mt: 1 }}>
                        {printCert.data.remark}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", px: 2 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="body2">______________________</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Issued By</Typography>
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="body2">{formatDate(printCert.issueDate)}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {printCert.issuedBy || "Principal"}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: "#999", mt: 2 }}>
                  Certificate No: {printCert.certificateNo}
                </Typography>
              </Box>
            </Box>
          )}
        </div>
      </Box>
    </Box>
  );
};

export default CertificatePage;

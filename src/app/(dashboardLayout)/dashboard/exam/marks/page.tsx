/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  CircularProgress,
  Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import { PageHeader } from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import {
  useGetAllExamsQuery,
  useGetExamMarksQuery,
  useUpsertExamMarksMutation,
} from "@/redux/api/examApi";
import { useGetAllStudentsQuery } from "@/redux/api/studentApi";
import { useGetAllClassesQuery } from "@/redux/api/classApi";
import type { TExam, TExamMark } from "@/interface";

const MarksEntryPage = () => {
  const searchParams = useSearchParams();
  const [examId, setExamId] = useState(searchParams.get("examId") || "");
  const [className, setClassName] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: examsData } = useGetAllExamsQuery({ limit: 100, page: 1 });
  const { data: classesData } = useGetAllClassesQuery({ limit: 100, page: 1 });
  const exams = examsData?.data?.data || [];
  const classes = classesData?.data?.classes || [];
  const exam: TExam | undefined = exams.find((e: any) => e._id === examId);

  const { data: studentsData, isLoading: studentsLoading } = useGetAllStudentsQuery(
    { limit: 500, page: 1, className: className || undefined },
    { skip: !className },
  );
  const { data: marksData, isLoading: marksLoading } = useGetExamMarksQuery(
    { examId, className },
    { skip: !examId || !className },
  );

  const students = studentsData?.data || [];
  const savedMarks: TExamMark[] = marksData?.data?.data || [];
  const [upsertExamMarks] = useUpsertExamMarksMutation();

  useEffect(() => {
    if (!examId || !className || savedMarks.length === 0) return;
    const map: Record<string, TExamMark> = {};
    savedMarks.forEach((m) => (map[m.student._id] = m));
    setRows(
      students.map((s: any) => {
        const existing = map[s._id];
        const marksMap: Record<string, number> = {};
        existing?.marks?.forEach((mk) => (marksMap[mk.subject] = mk.obtained));
        return {
          student: s._id,
          studentName: s.studentName || s.name,
          studentId: s.studentId,
          roll: s.studentClassRoll,
          marks: (exam?.subjects || []).map((sub) => ({
            subject: sub.subject,
            obtained: marksMap[sub.subject] ?? "",
          })),
        };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, className, savedMarks.length, students.length]);

  const handleObtained = (studentIdx: number, subjIdx: number, value: string) => {
    const next = [...rows];
    next[studentIdx].marks[subjIdx] = { ...next[studentIdx].marks[subjIdx], obtained: value };
    setRows(next);
  };

  const handleSaveAll = async () => {
    if (!examId || !className) {
      Swal.fire("Missing Selection", "Select exam and class first.", "warning");
      return;
    }
    const entries = rows
      .filter((r) => r.marks.some((m: any) => m.obtained !== "" && m.obtained !== null))
      .map((r) => ({
        student: r.student,
        marks: r.marks.map((m: any) => ({
          subject: m.subject,
          obtained: m.obtained === "" ? 0 : Number(m.obtained),
        })),
      }));
    if (entries.length === 0) {
      Swal.fire("Nothing to save", "Enter marks for at least one student.", "warning");
      return;
    }
    setSaving(true);
    try {
      const res: any = await upsertExamMarks({ examId, className, entries });
      if (res?.error) throw new Error(res.error?.data?.message || "Save failed");
      Swal.fire("Saved!", `Marks saved for ${entries.length} students. GPA & grade calculated automatically.`, "success");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const subjects = exam?.subjects || [];
  const colSpan = 4 + subjects.length;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader
        title="Enter Marks"
        subtitle={exam ? `Exam: ${exam.name} (${exam.examType})` : "Select exam and class"}
        action={
          <Button
            variant="contained"
            size="small"
            disabled={saving}
            onClick={handleSaveAll}
            sx={{
              borderRadius: "10px",
              fontWeight: 600,
              textTransform: "none",
              background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
            }}
          >
            {saving ? "Saving..." : "Save All Marks"}
          </Button>
        }
      />

      <Paper sx={{ p: 1.5, mb: 2, borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
          <TextField
            size="small"
            select
            label="Exam"
            value={examId}
            onChange={(e) => {
              setExamId(e.target.value);
              setRows([]);
            }}
          >
            <MenuItem value="">Select Exam</MenuItem>
            {exams.map((e: any) => (
              <MenuItem key={e._id} value={e._id}>
                {e.name} ({e.examType})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Class"
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
              setRows([]);
            }}
          >
            <MenuItem value="">Select Class</MenuItem>
            {classes.map((c: any) => (
              <MenuItem key={c._id} value={c._id}>
                {c.className}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        {exam && (
          <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
            <StatusChip status={exam.status} />
            {exam.subjects?.map((s) => (
              <Box
                key={s.subject}
                sx={{
                  fontSize: "0.72rem",
                  bgcolor: "#eef2ff",
                  color: "#4338ca",
                  px: 1,
                  py: 0.4,
                  borderRadius: "6px",
                  fontWeight: 600,
                }}
              >
                {s.subject}: {s.fullMarks}
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Table size="small" sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f6fa" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555" }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555" }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555" }}>ID / Roll</TableCell>
              {subjects.map((s) => (
                <TableCell key={s.subject} sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555" }}>
                  {s.subject}
                  <Box sx={{ fontSize: "0.66rem", color: "#999", fontWeight: 500 }}>full {s.fullMarks} / pass {s.passMarks}</Box>
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555" }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentsLoading || marksLoading ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : !className ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ py: 5, color: "#999" }}>
                  Select exam and class to load students.
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ py: 5, color: "#999" }}>
                  No students found in this class.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, i) => {
                const total = r.marks.reduce((s: number, m: any) => s + (Number(m.obtained) || 0), 0);
                return (
                  <TableRow key={r.student} hover>
                    <TableCell sx={{ fontSize: "0.75rem" }}>{i + 1}</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{r.studentName}</TableCell>
                    <TableCell sx={{ fontSize: "0.72rem", color: "#666" }}>
                      {r.studentId || "-"}
                      {r.roll ? ` / ${r.roll}` : ""}
                    </TableCell>
                    {subjects.map((s, j) => (
                      <TableCell key={s.subject} sx={{ p: 0.5 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={r.marks[j]?.obtained}
                          onChange={(e) => handleObtained(i, j, e.target.value)}
                          sx={{ width: 78, "& .MuiInputBase-root": { fontSize: "0.75rem" } }}
                          inputProps={{ min: 0, max: s.fullMarks }}
                        />
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#4338ca" }}>{total}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {rows.length > 0 && (
        <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button size="small" variant="outlined" onClick={() => setRows([])}>
            Reset Inputs
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleSaveAll}
            disabled={saving}
            sx={{
              background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            {saving ? "Saving..." : "Save All Marks"}
          </Button>
        </Box>
      )}
      {!rows.length && !studentsLoading && className && (
        <Typography variant="caption" sx={{ color: "#999", mt: 1 }}>
          Tip: entering marks recalculates GPA, grade and pass/fail automatically on save.
        </Typography>
      )}
    </Box>
  );
};

const MarksEntryPageWithSuspense = () => (
  <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress size={30} /></Box>}>
    <MarksEntryPage />
  </Suspense>
);

export default MarksEntryPageWithSuspense;

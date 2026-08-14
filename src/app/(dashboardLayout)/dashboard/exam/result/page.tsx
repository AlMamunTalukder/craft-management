/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  CircularProgress,
  Typography,
  Grid,
} from "@mui/material";
import { PageHeader } from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import {
  useGetAllExamsQuery,
  useGetExamResultsQuery,
} from "@/redux/api/examApi";
import { useGetAllClassesQuery } from "@/redux/api/classApi";
import type { TExam } from "@/interface";

const gradeColor = (grade: string) => {
  if (grade === "A+" || grade === "A") return "#2e7d32";
  if (grade === "A-" || grade === "B+" || grade === "B") return "#1976d2";
  if (grade === "B-" || grade === "C+" || grade === "C") return "#f57c00";
  return "#d32f2f";
};

const ResultPage = () => {
  const searchParams = useSearchParams();
  const [examId, setExamId] = useState(searchParams.get("examId") || "");
  const [className, setClassName] = useState("");

  const { data: examsData } = useGetAllExamsQuery({ limit: 100, page: 1 });
  const { data: classesData } = useGetAllClassesQuery({ limit: 100, page: 1 });
  const exams = examsData?.data?.data || [];
  const classes = classesData?.data?.classes || [];
  const exam: TExam | undefined = exams.find((e: any) => e._id === examId);

  const { data, isLoading } = useGetExamResultsQuery(
    { examId, className: className || undefined },
    { skip: !examId },
  );

  const results = data?.data?.results || [];
  const summary = data?.data?.summary || { total: 0, pass: 0, fail: 0, passRate: 0, classStrength: 0 };
  const subjects = exam?.subjects || [];

  const statCards = [
    { label: "Marked Students", value: summary.total, color: "#6366f1" },
    { label: "Passed", value: summary.pass, color: "#2e7d32" },
    { label: "Failed", value: summary.fail, color: "#d32f2f" },
    { label: "Pass Rate", value: `${summary.passRate}%`, color: "#f57c00" },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader
        title="Exam Results"
        subtitle={exam ? `${exam.name} (${exam.examType})` : "Select exam to view results"}
      />

      <Paper sx={{ p: 1.5, mb: 2, borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
          <TextField
            size="small"
            select
            label="Exam"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
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
            onChange={(e) => setClassName(e.target.value)}
          >
            <MenuItem value="">All Classes</MenuItem>
            {classes.map((c: any) => (
              <MenuItem key={c._id} value={c._id}>
                {c.className}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {exam && (
        <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          <StatusChip status={exam.status} />
          <Typography variant="caption" sx={{ color: "#666" }}>
            Class strength: {summary.classStrength || "-"} students
          </Typography>
        </Box>
      )}

      {results.length > 0 && (
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {statCards.map((s) => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: "10px",
                  textAlign: "center",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  borderTop: `3px solid ${s.color}`,
                }}
              >
                <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: s.color }}>
                  {s.value}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#666", fontWeight: 600 }}>
                  {s.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Table size="small" sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f6fa" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555" }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555" }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555" }}>ID</TableCell>
              {subjects.map((s) => (
                <TableCell key={s.subject} sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#555" }}>
                  {s.subject}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555" }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555" }}>GPA</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555" }}>Grade</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555" }}>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={subjects.length + 8} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : !examId ? (
              <TableRow>
                <TableCell colSpan={subjects.length + 8} align="center" sx={{ py: 5, color: "#999" }}>
                  Select an exam to view results.
                </TableCell>
              </TableRow>
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={subjects.length + 8} align="center" sx={{ py: 5, color: "#999" }}>
                  No marks recorded yet. Enter marks first.
                </TableCell>
              </TableRow>
            ) : (
              results.map((r: any, i: number) => {
                const markMap: Record<string, any> = {};
                r.marks?.forEach((m: any) => (markMap[m.subject] = m));
                return (
                  <TableRow key={r._id} hover>
                    <TableCell sx={{ fontSize: "0.75rem" }}>{i + 1}</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                      {r.student?.name || r.student?.studentName || "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.72rem", color: "#666" }}>
                      {r.student?.studentId || "-"}
                    </TableCell>
                    {subjects.map((s) => {
                      const m = markMap[s.subject];
                      return (
                        <TableCell
                          key={s.subject}
                          sx={{
                            fontSize: "0.75rem",
                            color: m?.result === "fail" ? "#d32f2f" : "#333",
                            fontWeight: m?.result === "fail" ? 700 : 400,
                          }}
                        >
                          {m ? m.obtained : "-"}
                        </TableCell>
                      );
                    })}
                    <TableCell sx={{ fontSize: "0.8rem", fontWeight: 700 }}>
                      {r.totalObtained ?? "-"}
                      {r.totalFull ? `/${r.totalFull}` : ""}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#4338ca" }}>
                      {r.gpa > 0 ? r.gpa.toFixed(2) : "0.00"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", fontWeight: 800, color: gradeColor(r.grade) }}>
                      {r.grade || "-"}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={r.result === "pass" ? "Passed" : "Failed"} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const ResultPageWithSuspense = () => (
  <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress size={30} /></Box>}>
    <ResultPage />
  </Suspense>
);

export default ResultPageWithSuspense;

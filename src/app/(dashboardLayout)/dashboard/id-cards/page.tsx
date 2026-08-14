/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Avatar,
} from "@mui/material";
import { Print as PrintIcon } from "@mui/icons-material";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetIdCardsQuery } from "@/redux/api/certificateApi";
import { useGetAllClassesQuery } from "@/redux/api/classApi";
import { useGetAllStudentsQuery } from "@/redux/api/studentApi";

const DEPARTMENTS = [
  { value: "hifz", label: "Hifz" },
  { value: "academic", label: "Academic" },
];

const getClassName = (s: any) =>
  Array.isArray(s?.className)
    ? s.className?.[0]?.className || "-"
    : s?.className?.className || s?.className || "-";

const getSection = (s: any) =>
  Array.isArray(s?.section)
    ? s.section?.[0] || "-"
    : s?.section || "-";

const getGuardian = (s: any) => {
  const p = s?.parentInfo;
  if (!p) return { name: "-", phone: "" };
  const name = p?.guardian?.nameEnglish || p?.father?.nameEnglish || "-";
  const phone = p?.guardian?.mobile || p?.father?.mobile || "";
  return { name, phone };
};

const IdCardsPage = () => {
  const [className, setClassName] = useState("");
  const [department, setDepartment] = useState("");

  const { data: classesData } = useGetAllClassesQuery({ limit: 100, page: 1 });
  const classes = classesData?.data?.classes || [];

  const { data, isLoading, refetch } = useGetIdCardsQuery(
    {
      className: className || undefined,
      department: department || undefined,
    },
    { skip: !className && !department },
  );

  const { data: studentsData } = useGetAllStudentsQuery(
    { limit: 500, page: 1, className: className || undefined },
    { skip: !className },
  );

  const students = (data?.data?.data || studentsData?.data || []).filter(
    (s: any) => s.status !== "inactive",
  );

  const handlePrint = () => {
    const el = document.getElementById("idcards-print");
    const originalTitle = document.title;
    if (el) {
      document.title = "Student ID Cards";
      window.print();
      document.title = originalTitle;
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader
        title="Student ID Cards"
        subtitle="Generate and print ID cards for a class or department"
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={students.length === 0}
            sx={{
              borderRadius: "10px",
              fontWeight: 600,
              textTransform: "none",
              background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
            }}
          >
            Print ID Cards ({students.length})
          </Button>
        }
      />

      <Paper sx={{ p: 1.5, mb: 2, borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
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
          <TextField
            size="small"
            select
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <MenuItem value="">All Departments</MenuItem>
            {DEPARTMENTS.map((d) => (
              <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={30} />
        </Box>
      ) : !className && !department ? (
        <Paper sx={{ p: 4, textAlign: "center", color: "#999", borderRadius: "10px" }}>
          Select a class or department to load students.
        </Paper>
      ) : students.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", color: "#999", borderRadius: "10px" }}>
          No students found.
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {students.map((s: any) => {
            const { name: guardianName, phone: guardianPhone } = getGuardian(s);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={s._id}>
                <Paper
                  sx={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Box
                    sx={{
                      background: "linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)",
                      color: "#fff",
                      px: 1.5,
                      py: 1.2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2 }}>
                        Craft International Institute
                      </Typography>
                      <Typography sx={{ fontSize: "0.62rem", opacity: 0.85 }}>
                        STUDENT ID CARD · {s.academicYear || new Date().getFullYear()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "8px",
                        bgcolor: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#1e3a5f",
                        fontWeight: 900,
                        fontSize: "0.7rem",
                      }}
                    >
                      CII
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.2, p: 1.5 }}>
                    <Avatar
                      src={s.studentPhoto || undefined}
                      variant="rounded"
                      sx={{ width: 64, height: 78, borderRadius: "8px", bgcolor: "#e8edf5" }}
                    >
                      {s.studentName?.charAt(0) || s.name?.charAt(0) || "?"}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", lineHeight: 1.3 }}>
                        {s.studentName || s.name}
                      </Typography>
                      {s.nameBangla && (
                        <Typography sx={{ fontSize: "0.68rem", color: "#666" }}>
                          {s.nameBangla}
                        </Typography>
                      )}
                      <Box sx={{ mt: 0.6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.3 }}>
                        <Typography sx={{ fontSize: "0.62rem", color: "#888" }}>ID</Typography>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700 }}>{s.studentId || "-"}</Typography>
                        <Typography sx={{ fontSize: "0.62rem", color: "#888" }}>Roll</Typography>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>{s.studentClassRoll || "-"}</Typography>
                        <Typography sx={{ fontSize: "0.62rem", color: "#888" }}>Class</Typography>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>
                          {getClassName(s)}
                        </Typography>
                        <Typography sx={{ fontSize: "0.62rem", color: "#888" }}>Section</Typography>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>{getSection(s)}</Typography>
                        <Typography sx={{ fontSize: "0.62rem", color: "#888" }}>Blood</Typography>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>{s.bloodGroup || "-"}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ px: 1.5, pb: 1.2 }}>
                    <Box sx={{ borderTop: "1px dashed #cbd5e1", pt: 0.8 }}>
                      <Typography sx={{ fontSize: "0.62rem", color: "#888" }}>Guardian</Typography>
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 600 }}>
                        {guardianName}
                      </Typography>
                      <Typography sx={{ fontSize: "0.68rem", color: "#666" }}>
                        {guardianPhone}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: "#f5f6fa",
                      textAlign: "center",
                      py: 0.6,
                      fontSize: "0.62rem",
                      color: "#888",
                      fontWeight: 600,
                    }}
                  >
                    {s.studentDepartment || "academic"} DEPARTMENT
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Box sx={{ position: "absolute", left: -9999, top: 0, width: 800 }}>
        <div id="idcards-print">
          <Grid container spacing={1.5} sx={{ p: 2 }}>
            {students.map((s: any) => {
              const { name: guardianName, phone: guardianPhone } = getGuardian(s);
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={s._id}>
                  <Paper
                    sx={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Box
                      sx={{
                        background: "linear-gradient(135deg, #1e3a5f 0%, #2a5298 100%)",
                        color: "#fff",
                        px: 1.5,
                        py: 1.2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2 }}>
                          Craft International Institute
                        </Typography>
                        <Typography sx={{ fontSize: "0.62rem", opacity: 0.85 }}>
                          STUDENT ID CARD · {s.academicYear || new Date().getFullYear()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: "8px",
                          bgcolor: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#1e3a5f",
                          fontWeight: 900,
                          fontSize: "0.7rem",
                        }}
                      >
                        CII
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1.2, p: 1.5 }}>
                      <Avatar
                        src={s.studentPhoto || undefined}
                        variant="rounded"
                        sx={{ width: 64, height: 78, borderRadius: "8px", bgcolor: "#e8edf5" }}
                      >
                        {s.studentName?.charAt(0) || s.name?.charAt(0) || "?"}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", lineHeight: 1.3 }}>
                          {s.studentName || s.name}
                        </Typography>
                        {s.nameBangla && (
                          <Typography sx={{ fontSize: "0.68rem", color: "#666" }}>{s.nameBangla}</Typography>
                        )}
                        <Box sx={{ mt: 0.6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.3 }}>
                          <Typography sx={{ fontSize: "0.62rem", color: "#888" }}>ID</Typography>
                          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700 }}>{s.studentId || "-"}</Typography>
                          <Typography sx={{ fontSize: "0.62rem", color: "#888" }}>Roll</Typography>
                          <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>{s.studentClassRoll || "-"}</Typography>
                        <Typography sx={{ fontSize: "0.62rem", color: "#888" }}>Class</Typography>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>
                          {getClassName(s)}
                        </Typography>
                        <Typography sx={{ fontSize: "0.62rem", color: "#888" }}>Section</Typography>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>{getSection(s)}</Typography>
                          <Typography sx={{ fontSize: "0.62rem", color: "#888" }}>Blood</Typography>
                          <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>{s.bloodGroup || "-"}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ px: 1.5, pb: 1.2 }}>
                      <Box sx={{ borderTop: "1px dashed #cbd5e1", pt: 0.8 }}>
                        <Typography sx={{ fontSize: "0.62rem", color: "#888" }}>Guardian</Typography>
                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 600 }}>
                          {guardianName}
                        </Typography>
                        <Typography sx={{ fontSize: "0.68rem", color: "#666" }}>
                          {guardianPhone}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: "#f5f6fa",
                        textAlign: "center",
                        py: 0.6,
                        fontSize: "0.62rem",
                        color: "#888",
                        fontWeight: 600,
                      }}
                    >
                      {s.studentDepartment || "academic"} DEPARTMENT
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </div>
      </Box>
    </Box>
  );
};

export default IdCardsPage;

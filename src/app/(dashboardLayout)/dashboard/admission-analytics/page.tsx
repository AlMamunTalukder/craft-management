/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetAdmissionStatsQuery } from "@/redux/api/admissionAnalyticsApi";

const COLORS = ["#6366f1", "#f57c00", "#2e7d32", "#d32f2f", "#1976d2"];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const currentYear = new Date().getFullYear();

const AdmissionAnalyticsPage = () => {
  const [year, setYear] = useState<string>("");

  const { data, isLoading, isError } = useGetAdmissionStatsQuery({
    year: year || undefined,
  });

  const stats = data?.data;

  const funnel = stats?.funnel || {};
  const funnelItems = [
    { name: "Applied", value: funnel.applied || 0, color: "#6366f1" },
    { name: "Pending", value: funnel.pending || 0, color: "#f57c00" },
    { name: "Approved", value: funnel.approved || 0, color: "#2e7d32" },
    { name: "Rejected", value: funnel.rejected || 0, color: "#d32f2f" },
    { name: "Enrolled", value: funnel.enrolled || 0, color: "#1976d2" },
  ];

  const statCards = [
    { label: "Applications", value: funnel.applied || 0, color: "#6366f1" },
    { label: "Pending Review", value: funnel.pending || 0, color: "#f57c00" },
    { label: "Approved", value: funnel.approved || 0, color: "#2e7d32" },
    { label: "Enrolled Students", value: funnel.enrolled || 0, color: "#1976d2" },
    { label: "Approval Rate", value: `${stats?.conversionRate || 0}%`, color: "#9c27b0" },
    { label: "Enrollment Rate", value: `${stats?.enrollmentRate || 0}%`, color: "#00897b" },
  ];

  const monthlyData = (stats?.monthly || []).map((m: any) => ({
    name: MONTHS[(m._id || 1) - 1],
    Applied: m.applied || 0,
    Approved: m.approved || 0,
  }));

  const classData = (stats?.byClass || []).map((c: any) => ({
    name: c._id || "Unknown",
    Applied: c.applied || 0,
    Approved: c.approved || 0,
  }));

  const departmentData = (stats?.byDepartment || []).map((d: any) => ({
    name: d._id || "Unknown",
    applications: d.applied || 0,
  }));

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader
        title="Admission Analytics"
        subtitle="Application funnel, conversion and enrollment insights"
      />

      <Paper sx={{ p: 1.5, mb: 2, borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
          <TextField
            size="small"
            select
            label="Academic Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <MenuItem value="">All Years</MenuItem>
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <MenuItem key={y} value={String(y)}>{y}</MenuItem>
            ))}
          </TextField>
          <Box />
        </Box>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      ) : isError || !stats ? (
        <Paper sx={{ p: 5, textAlign: "center", color: "#999", borderRadius: "10px" }}>
          No admission data found for the selected period.
        </Paper>
      ) : (
        <>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {statCards.map((s) => (
              <Grid item xs={6} sm={4} md={2} key={s.label}>
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: "10px",
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    borderTop: `3px solid ${s.color}`,
                  }}
                >
                  <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: s.color }}>
                    {s.value}
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#666", fontWeight: 600 }}>
                    {s.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={1.5}>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 1.5, borderRadius: "10px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, mb: 1 }}>
                  Application Funnel
                </Typography>
                <Box sx={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={funnelItems}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        innerRadius={45}
                        label={(p: any) => `${p.name}: ${p.value}`}
                        labelLine={false}
                      >
                        {funnelItems.map((f, i) => (
                          <Cell key={f.name} fill={f.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 1.5, borderRadius: "10px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, mb: 1 }}>
                  Monthly Applications (Applied vs Approved)
                </Typography>
                <Box sx={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={11} allowDecimals={false} />
                      <ChartTooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Applied" fill="#6366f1" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Approved" fill="#2e7d32" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 1.5, borderRadius: "10px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, mb: 1 }}>
                  Applications by Class
                </Typography>
                <Box sx={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={11} allowDecimals={false} />
                      <ChartTooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Applied" fill="#f57c00" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Approved" fill="#2e7d32" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 1.5, borderRadius: "10px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, mb: 1 }}>
                  Applications by Department
                </Typography>
                <Box sx={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        dataKey="applications"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        innerRadius={45}
                        label={(p: any) => `${p.name}: ${p.value}`}
                        labelLine={false}
                      >
                        {departmentData.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default AdmissionAnalyticsPage;

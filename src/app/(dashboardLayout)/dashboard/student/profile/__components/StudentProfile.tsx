/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { studentData } from "@/data/data";
import { useGetSingleStudentQuery } from "@/redux/api/studentApi";
import {
  AccountBalanceWallet,
  Assignment,
  Book,
  CheckCircle,
  History,
  Info,
  Payment,
  Person,
  ReceiptLong,
  Restaurant,
  School,
  VerifiedUser,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import PaymentHistory from "./PaymentHistory";
import ReceiptHistory from "./ReceiptHistory";
import { StudentDetailsView } from "@/components/student/StudentDetailsView";
import { getStatusColor } from "./Utils";
import DueStudentFee from "./DueStudentFee";
import PaidStudentFee from "./PaidStudentFee";
import { PageProps, TabPanelProps } from "@/interface/student";
import { LoadingState } from "@/components/common/LoadingState";
import StudentMealAttendance from "./StudentMealAttendance";

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StudentProfile = ({ params }: PageProps) => {
  const { id } = params;
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Open the tab passed via ?tab=N (e.g. ?tab=3 = Due Fees)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t !== null && !Number.isNaN(Number(t))) {
      setTabValue(Number(t));
    }
  }, [id]);
  const { data: singleStudent, isLoading, refetch } = useGetSingleStudentQuery({ id });
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  if (isLoading) {
    return <LoadingState />;
  }

  const s = singleStudent?.data;
  const dueCount = s?.fees?.filter((f: any) => f.status === "unpaid" || f.status === "partial")?.length || 0;
  const paidCount = s?.fees?.filter((f: any) => f.status === "paid")?.length || 0;

  return (
    <Container maxWidth="xl" sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Color-graded header */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          overflow: "hidden",
          borderRadius: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B73FF 100%)",
          color: "white",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            bgcolor: alpha("#fff", 0.08),
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 }, position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", gap: 2.5, alignItems: "center", flexWrap: { xs: "wrap", sm: "nowrap" } }}>
            <Box
              sx={{
                width: 86,
                height: 86,
                borderRadius: 3,
                bgcolor: alpha("#fff", 0.22),
                border: `3px solid ${alpha("#fff", 0.35)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 800,
                fontSize: "2rem",
                backdropFilter: "blur(6px)",
                flexShrink: 0,
              }}
            >
              {s?.name?.charAt(0) || "S"}
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                {s?.name || "Student"}
                {s?.nameBangla ? <Typography component="span" variant="body2" sx={{ ml: 1, opacity: 0.9, fontWeight: 500 }}>• {s.nameBangla}</Typography> : null}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.4 }}>
                <Chip
                  icon={<VerifiedUser sx={{ color: "#fff !important", fontSize: 16 }} />}
                  label={s?.studentId || "No ID"}
                  size="small"
                  sx={{ bgcolor: alpha("#fff", 0.18), color: "#fff", fontWeight: 700, border: `1px solid ${alpha("#fff", 0.25)}` }}
                />
                <Chip
                  icon={<School sx={{ color: "#fff !important", fontSize: 16 }} />}
                  label={Array.isArray(s?.className) ? s.className.map((c: any) => c?.className || c).join(", ") : s?.class || s?.className?.className || "No class"}
                  size="small"
                  sx={{ bgcolor: alpha("#fff", 0.18), color: "#fff", fontWeight: 600 }}
                />
                <Chip
                  icon={<Assignment sx={{ color: "#fff !important", fontSize: 16 }} />}
                  label={`Roll: ${s?.studentClassRoll || s?.rollNumber || "—"}`}
                  size="small"
                  sx={{ bgcolor: alpha("#fff", 0.18), color: "#fff", fontWeight: 600 }}
                />
                <Chip
                  icon={<Person sx={{ color: "#fff !important", fontSize: 16 }} />}
                  label={s?.category || s?.studentType || "Residential"}
                  size="small"
                  sx={{ bgcolor: alpha("#fff", 0.18), color: "#fff", fontWeight: 600 }}
                />
                <Chip
                  icon={<CheckCircle sx={{ color: "#fff !important", fontSize: 16 }} />}
                  label={s?.admissionStatus || s?.status || "active"}
                  size="small"
                  sx={{ bgcolor: s?.status === "active" ? alpha("#4caf50", 0.9) : alpha("#ff9800", 0.9), color: "#fff", fontWeight: 700 }}
                />
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end", minWidth: 140 }}>
              <Paper elevation={0} sx={{ px: 2, py: 1.2, borderRadius: 2, bgcolor: alpha("#fff", 0.16), color: "#fff", textAlign: "center", minWidth: 72 }}>
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, display: "block" }}>Due</Typography>
                <Typography variant="h6" fontWeight={800}>{dueCount}</Typography>
              </Paper>
              <Paper elevation={0} sx={{ px: 2, py: 1.2, borderRadius: 2, bgcolor: alpha("#fff", 0.16), color: "#fff", textAlign: "center", minWidth: 72 }}>
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, display: "block" }}>Paid</Typography>
                <Typography variant="h6" fontWeight={800}>{paidCount}</Typography>
              </Paper>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: theme.palette.success.light,
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h4">
              {studentData.attendance.present}%
            </Typography>
            <Typography variant="body2">Attendance</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: theme.palette.info.light,
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h4">
              {studentData.results[1]?.percentage || 0}%
            </Typography>
            <Typography variant="body2">Last Exam</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: theme.palette.warning.light,
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h4">
              {
                studentData.homework.filter((hw) => hw.status === "Pending")
                  .length
              }
            </Typography>
            <Typography variant="body2">Pending Homework</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: theme.palette.error.light,
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h4">${studentData.fees.due}</Typography>
            <Typography variant="body2">Due Fees</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Card elevation={0} sx={{ mb: 3, borderRadius: 3, overflow: "hidden", border: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="student profile tabs"
            sx={{
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 56, gap: 0.5 },
              "& .Mui-selected": { color: "primary.main" },
              "& .MuiTabs-indicator": { height: 3, borderRadius: 2, background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)" },
            }}
          >
            <Tab icon={<Info sx={{ color: tabValue===0 ? "#667eea" : undefined }} />} iconPosition="start" label="Overview" />
            <Tab icon={<ReceiptLong sx={{ color: tabValue===1 ? "#764ba2" : undefined }} />} iconPosition="start" label="Receipts" />
            <Tab icon={<VerifiedUser sx={{ color: tabValue===2 ? "#11998e" : undefined }} />} iconPosition="start" label={`Paid (${paidCount})`} />
            <Tab icon={<AccountBalanceWallet sx={{ color: tabValue===3 ? "#f5576c" : undefined }} />} iconPosition="start" label={`Due Fees${dueCount ? ` • ${dueCount}` : ""}`} />
            <Tab icon={<History sx={{ color: tabValue===4 ? "#fa709a" : undefined }} />} iconPosition="start" label="Payments" />
            <Tab icon={<Restaurant sx={{ color: tabValue===5 ? "#ff9800" : undefined }} />} iconPosition="start" label="Meal" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          {/* Single source of truth - same design as AdmissionDetailModal */}
          <StudentDetailsView data={singleStudent?.data} mode="student" />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ReceiptHistory
            studentId={singleStudent?.data?._id}
            studentName={singleStudent?.data?.name}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <PaidStudentFee
            studentFees={singleStudent?.data?.fees}
            student={singleStudent?.data}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <DueStudentFee
            studentFees={singleStudent?.data?.fees}
            student={singleStudent?.data}
            refetch={refetch}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <PaymentHistory singleStudent={singleStudent} />
        </TabPanel>
           <TabPanel value={tabValue} index={5}>
          <StudentMealAttendance singleStudent={singleStudent} />
        </TabPanel>
      </Card>
    </Container>
  );
};

export default StudentProfile;

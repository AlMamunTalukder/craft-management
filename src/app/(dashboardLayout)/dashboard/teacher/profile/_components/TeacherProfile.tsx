/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useGetSingleTeacherQuery } from "@/redux/api/teacherApi";
import { formatDate } from "@/utils/formateDate";
import {
  CalendarMonth,
  CheckCircle,
  Edit,
  Info,
  Message,
  Payments,
  Restaurant,
  School,
  Star
} from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Fade,
  Grid,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useState } from "react";
import MealAttendance from "../_components/MealAttendance";
import TeacherSalary from "../_components/TeacherSalary";
import TeacherOverview from "../_components/TeacherOverview";



interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}
interface PageProps {
  params: {
    id: string;
  };
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`teacher-tabpanel-${index}`}
      aria-labelledby={`teacher-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={value === index} timeout={500}>
          <Box>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

export default function TeacherProfile({ params }: PageProps) {
  const { id } = params;

  const { data: singleTeacher } = useGetSingleTeacherQuery({ id });

  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getTabProps = (index: number) => {
    return {
      id: `teacher-tab-${index}`,
      "aria-controls": `teacher-tabpanel-${index}`,
    };
  };

  // Calculate meal attendance stats for badge
  const mealCount = singleTeacher?.data?.mealAttendances?.length || 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section with Gradient Background */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm="auto">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    <Tooltip title="Verified Teacher">
                      <CheckCircle
                        sx={{
                          color: "#4caf50",
                          bgcolor: "white",
                          borderRadius: "50%",
                          fontSize: 28,
                        }}
                      />
                    </Tooltip>
                  }
                >
                  <Avatar
                    src={singleTeacher?.data?.teacherPhoto}
                    alt={singleTeacher?.data?.name}
                    sx={{
                      width: { xs: 100, sm: 130 },
                      height: { xs: 100, sm: 130 },
                      border: "4px solid white",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  />
                </Badge>
              </Box>
            </Grid>
            <Grid item xs={12} sm>
              <Box
                sx={{ ml: { sm: 2 }, textAlign: { xs: "center", sm: "left" } }}
              >
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
                >
                  {singleTeacher?.data?.name}
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                  {singleTeacher?.data?.designation} • {singleTeacher?.data?.department} Department
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: 1,
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  <Chip
                    icon={<School />}
                    label={`ID: ${singleTeacher?.data?.teacherId}`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      color: "white",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.25)",
                      },
                    }}
                  />
                  <Chip
                    icon={<CalendarMonth />}
                    label={`Joined: ${formatDate(singleTeacher?.data?.joiningDate)}`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      color: "white",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.25)",
                      },
                    }}
                  />
                  <Chip
                    icon={<Restaurant />}
                    label={`${mealCount} Meals`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      color: "white",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.25)",
                      },
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm="auto">
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: { xs: "center", sm: "flex-end" },
                  mt: { xs: 2, sm: 0 },
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<Message />}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    color: "white",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.25)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  Message
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    color: "white",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.25)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  Edit Profile
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Quick Stats Row */}
          <Box sx={{ mt: 3, display: { xs: "none", md: "block" } }}>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 2 }} />
            <Grid container spacing={2} justifyContent="space-between">
              <Grid item xs>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {singleTeacher?.data?.class ? 1 : 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Active Classes
                  </Typography>
                </Box>
              </Grid>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: "rgba(255,255,255,0.2)" }}
              />
              <Grid item xs>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {singleTeacher?.data?.section ? 1 : 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Sections
                  </Typography>
                </Box>
              </Grid>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: "rgba(255,255,255,0.2)" }}
              />
              <Grid item xs>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {mealCount}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Meal Days
                  </Typography>
                </Box>
              </Grid>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: "rgba(255,255,255,0.2)" }}
              />
              <Grid item xs>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {singleTeacher?.data?.workExperience?.length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Experience
                  </Typography>
                </Box>
              </Grid>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: "rgba(255,255,255,0.2)" }}
              />
              <Grid item xs>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {singleTeacher?.data?.status || "Active"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Status
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>

      {/* Navigation Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 2,
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "background.paper",
          borderRadius: "8px 8px 0 0",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="teacher profile tabs"
        >
          <Tab
            icon={<Info />}
            label={isSmall ? "" : "Overview"}
            iconPosition="start"
            {...getTabProps(0)}
          />
          <Tab
            icon={<Restaurant />}
            label={isSmall ? "" : `Meal Attendance (${mealCount})`}
            iconPosition="start"
            {...getTabProps(1)}
          />
          <Tab
            icon={<Payments />}
            label={isSmall ? "" : "Salary"}
            iconPosition="start"
            {...getTabProps(2)}
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <TeacherOverview teacher={singleTeacher?.data} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <MealAttendance teacher={singleTeacher?.data} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <TeacherSalary teacher={singleTeacher?.data} />
      </TabPanel>
    </Container>
  );
}

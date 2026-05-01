// // src/app/dashboard/fees/meal-balance/page.tsx
// "use client";

// import React, { useState } from "react";
// import {
//     Box,
//     Paper,
//     Typography,
//     Grid,
//     Button,
//     Alert,
//     CircularProgress,
//     Card,
//     CardContent,
//     Chip,
//     ToggleButton,
//     ToggleButtonGroup,
//     Fade,
//     Grow,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Accordion,
//     AccordionSummary,
//     AccordionDetails,
//     Stepper,
//     Step,
//     StepLabel,
//     StepContent,
//     useMediaQuery,
//     useTheme,
//     Divider,
// } from "@mui/material";
// import {
//     Restaurant as MealIcon,
//     Calculate as CalculateIcon,
//     CheckCircle as SuccessIcon,
//     Info as InfoIcon,
//     PlayArrow as PlayIcon,
//     History as HistoryIcon,
//     ExpandMore as ExpandMoreIcon,
//     Warning as WarningIcon,
//     Schedule as ScheduleIcon,
//     CalendarMonth as CalendarIcon,
//     TrendingUp as TrendingUpIcon,
//     TrendingDown as TrendingDownIcon,
//     Timer as TimerIcon,
//     CheckCircle,
//     School,
// } from "@mui/icons-material";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs, { Dayjs } from "dayjs";
// import {
//     useCalculateCurrentMonthMealBalanceMutation,
//     useCalculateSpecificMonthMealBalanceMutation,
//     useGetFeeGenerationStatusQuery,
// } from "@/redux/api/feesApi";
// import toast from "react-hot-toast";

// type OperationType = "current" | "specific";

// interface StepData {
//     label: string;
//     description: string;
//     icon: React.ReactNode;
// }

// const MealBalancePage = () => {
//     const theme = useTheme();
//     const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

//     const [operationType, setOperationType] = useState<OperationType>("current");
//     const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
//     const [loading, setLoading] = useState(false);
//     const [activeStep, setActiveStep] = useState(0);
//     const [resultData, setResultData] = useState<any>(null);
//     const [expanded, setExpanded] = useState<string | false>(false);

//     const [calculateCurrentMonth] = useCalculateCurrentMonthMealBalanceMutation();
//     const [calculateSpecificMonth] = useCalculateSpecificMonthMealBalanceMutation();
//     const { data: statusData } = useGetFeeGenerationStatusQuery({});

//     const currentMonthStatus = statusData?.data;
//     const currentDate = dayjs();
//     const lastDayOfMonth = currentDate.endOf('month').date();

//     const steps: StepData[] = [
//         {
//             label: "📋 ধাপ ১: মাস নির্বাচন",
//             description: "আপনি বর্তমান মাস নাকি নির্দিষ্ট মাসের জন্য ব্যালেন্স ক্যালকুলেট করতে চান?",
//             icon: <CalendarIcon />,
//         },
//         {
//             label: "⚙️ ধাপ ২: ব্যালেন্স ক্যালকুলেট",
//             description: "মিল অ্যাটেনডেন্স অনুযায়ী ব্যালেন্স ক্যালকুলেট করুন",
//             icon: <CalculateIcon />,
//         },
//         {
//             label: "📊 ধাপ ৩: ফলাফল দেখুন",
//             description: "ক্যালকুলেশনের বিস্তারিত ফলাফল",
//             icon: <TrendingUpIcon />,
//         },
//     ];

//     const handleCalculate = async () => {
//         setLoading(true);
//         setResultData(null);

//         try {
//             let result;
//             const toastId = toast.loading("মিল ব্যালেন্স ক্যালকুলেট করা হচ্ছে...");

//             if (operationType === "current") {
//                 result = await calculateCurrentMonth().unwrap();
//             } else {
//                 if (!selectedMonth) {
//                     toast.error("দয়া করে একটি মাস নির্বাচন করুন");
//                     setLoading(false);
//                     return;
//                 }
//                 result = await calculateSpecificMonth({
//                     month: selectedMonth.month() + 1,
//                     year: selectedMonth.year(),
//                 }).unwrap();
//             }

//             toast.dismiss(toastId);

//             if (result.success) {
//                 setResultData(result.data);
//                 setActiveStep(2);
//                 toast.success(
//                     <Box>
//                         <Typography variant="body1" fontWeight="bold">🍽️ মিল ব্যালেন্স ক্যালকুলেশন সম্পূর্ণ!</Typography>
//                         <Typography variant="body2">✅ সফল: {result.data?.successCount || 0} জন</Typography>
//                         <Typography variant="body2">🔄 অ্যাডজাস্টমেন্ট: {result.data?.adjustments?.length || 0} টি</Typography>
//                     </Box>,
//                     { duration: 5000 }
//                 );
//             } else {
//                 toast.error(result.message || "ক্যালকুলেশন ব্যর্থ হয়েছে");
//             }
//         } catch (error: any) {
//             toast.error(error?.data?.message || "মিল ব্যালেন্স ক্যালকুলেশন ব্যর্থ হয়েছে");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getMonthDisplay = () => {
//         if (operationType === "current") {
//             return dayjs().format("MMMM YYYY");
//         }
//         return selectedMonth?.format("MMMM YYYY") || "বর্তমান মাস";
//     };

//     const handleNext = () => {
//         if (activeStep === 0) {
//             if (operationType === "specific" && !selectedMonth) {
//                 toast.error("দয়া করে একটি মাস নির্বাচন করুন");
//                 return;
//             }
//             setActiveStep(1);
//         } else if (activeStep === 1) {
//             handleCalculate();
//         }
//     };

//     const handleBack = () => {
//         setActiveStep((prev) => prev - 1);
//     };

//     const handleReset = () => {
//         setActiveStep(0);
//         setResultData(null);
//         setOperationType("current");
//         setSelectedMonth(dayjs());
//     };

//     const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
//         setExpanded(isExpanded ? panel : false);
//     };

//     return (
//         <LocalizationProvider dateAdapter={AdapterDayjs}>
//             <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f5f7fa", minHeight: "100vh" }}>

//                 {/* Header */}
//                 <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: "linear-gradient(135deg, #E91E63 0%, #FF9800 100%)", color: "white" }}>
//                     <Typography variant="h4" fontWeight="bold" gutterBottom>
//                         <MealIcon sx={{ mr: 1, verticalAlign: "middle" }} />
//                         মিল ব্যালেন্স ক্যালকুলেশন
//                     </Typography>
//                     <Typography variant="body2" sx={{ opacity: 0.9 }}>
//                         মাসিক মিল খরচ এবং ফি এর পার্থক্য স্বয়ংক্রিয়ভাবে ক্যালকুলেট করুন
//                     </Typography>
//                 </Paper>

//                 {/* Cron Job Info Card */}
//                 <Grow in={true}>
//                     <Card sx={{ mb: 3, borderRadius: 3, bgcolor: "#e3f2fd" }}>
//                         <CardContent>
//                             <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
//                                 <TimerIcon color="primary" />
//                                 <Typography variant="h6" fontWeight="bold">⏰ স্বয়ংক্রিয় ক্রন জব তথ্য</Typography>
//                             </Box>
//                             <Divider sx={{ mb: 2 }} />
//                             <Grid container spacing={2}>
//                                 <Grid item xs={12} md={6}>
//                                     <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 2 }}>
//                                         <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
//                                             <ScheduleIcon sx={{ mr: 0.5, fontSize: 16, verticalAlign: "middle" }} />
//                                             কখন চলে?
//                                         </Typography>
//                                         <Typography variant="body2" sx={{ mt: 1 }}>
//                                             <strong>📅 মাসের শেষ দিন</strong> রাত ১১:৫৯ মিনিটে স্বয়ংক্রিয়ভাবে চলে
//                                         </Typography>
//                                         <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//                                             {currentDate.format('MMMM YYYY')} মাসের শেষ দিন: <strong>{lastDayOfMonth} {currentDate.format('MMMM')}</strong>
//                                         </Typography>
//                                     </Paper>
//                                 </Grid>
//                                 <Grid item xs={12} md={6}>
//                                     <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 2 }}>
//                                         <Typography variant="subtitle2" fontWeight="bold" color="success.main">
//                                             <CheckCircle sx={{ mr: 0.5, fontSize: 16, verticalAlign: "middle" }} />
//                                             কী করে?
//                                         </Typography>
//                                         <Typography variant="body2" sx={{ mt: 1 }}>
//                                             প্রতিদিনের মিল অ্যাটেনডেন্স থেকে আসল খরচ বের করে
//                                             মিল ফি (5000 TK) এর সাথে তুলনা করে অ্যাডভান্স/ডিউ ক্যালকুলেট করে
//                                         </Typography>
//                                     </Paper>
//                                 </Grid>
//                             </Grid>
//                         </CardContent>
//                     </Card>
//                 </Grow>

//                 {/* Status Card */}
//                 <Grow in={true}>
//                     <Card sx={{ mb: 3, borderRadius: 3 }}>
//                         <CardContent>
//                             <Typography variant="h6" fontWeight="bold" gutterBottom>📊 বর্তমান মাসের মিল তথ্য</Typography>
//                             <Grid container spacing={2}>
//                                 <Grid item xs={4} md={3}>
//                                     <Typography color="text.secondary" variant="body2">বর্তমান মাস</Typography>
//                                     <Typography variant="h6" fontWeight="bold">{currentDate.format("MMMM YYYY")}</Typography>
//                                 </Grid>
//                                 <Grid item xs={4} md={3}>
//                                     <Typography color="text.secondary" variant="body2">মোট শিক্ষার্থী</Typography>
//                                     <Typography variant="h6" fontWeight="bold">{currentMonthStatus?.totalStudents || 0}</Typography>
//                                 </Grid>
//                                 <Grid item xs={4} md={3}>
//                                     <Typography color="text.secondary" variant="body2">মিল ফি রেট</Typography>
//                                     <Typography variant="h6" fontWeight="bold" color="warning.main">৳55/মিল</Typography>
//                                 </Grid>
//                                 <Grid item xs={6} md={3}>
//                                     <Typography color="text.secondary" variant="body2">মাসিক মিল ফি</Typography>
//                                     <Typography variant="h6" fontWeight="bold" color="error.main">৳5,000</Typography>
//                                 </Grid>
//                             </Grid>
//                         </CardContent>
//                     </Card>
//                 </Grow>

//                 {/* Main Stepper Card */}
//                 <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
//                     <Box sx={{ p: 3 }}>
//                         <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
//                             {steps.map((step, index) => (
//                                 <Step key={index}>
//                                     <StepLabel
//                                         StepIconComponent={() => (
//                                             <Box sx={{
//                                                 width: 40,
//                                                 height: 40,
//                                                 borderRadius: "50%",
//                                                 display: "flex",
//                                                 alignItems: "center",
//                                                 justifyContent: "center",
//                                                 bgcolor: activeStep >= index ? "warning.main" : "grey.300",
//                                                 color: activeStep >= index ? "white" : "grey.600"
//                                             }}>
//                                                 {step.icon}
//                                             </Box>
//                                         )}
//                                     >
//                                         <Typography variant="subtitle1" fontWeight="bold">
//                                             {step.label}
//                                         </Typography>
//                                         <Typography variant="caption" color="text.secondary">
//                                             {step.description}
//                                         </Typography>
//                                     </StepLabel>
//                                     <StepContent>
//                                         {/* Step 1: Select Option */}
//                                         {index === 0 && (
//                                             <Fade in={true}>
//                                                 <Box sx={{ py: 2 }}>
//                                                     <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3, borderRadius: 2 }}>
//                                                         <Typography variant="body2">
//                                                             <strong>❗ দুইটি অপশন:</strong><br />
//                                                             🔹 <strong>বর্তমান মাস</strong> - কোন মাস নির্বাচন করতে হবে না, বর্তমান মাসের কাজ করবে<br />
//                                                             🔹 <strong>নির্দিষ্ট মাস</strong> - আপনি যে মাস নির্বাচন করবেন সেই মাসের কাজ করবে
//                                                         </Typography>
//                                                     </Alert>

//                                                     <ToggleButtonGroup
//                                                         value={operationType}
//                                                         exclusive
//                                                         onChange={(_, newValue) => { if (newValue) setOperationType(newValue); }}
//                                                         sx={{ mb: 3, width: "100%" }}
//                                                     >
//                                                         <ToggleButton value="current" sx={{ flex: 1, py: 1.5 }}>
//                                                             <PlayIcon sx={{ mr: 1 }} />
//                                                             <Box sx={{ textAlign: "left" }}>
//                                                                 <Typography fontWeight="bold">বর্তমান মাস</Typography>
//                                                                 <Typography variant="caption" color="text.secondary">{dayjs().format("MMMM YYYY")}</Typography>
//                                                             </Box>
//                                                         </ToggleButton>
//                                                         <ToggleButton value="specific" sx={{ flex: 1, py: 1.5 }}>
//                                                             <HistoryIcon sx={{ mr: 1 }} />
//                                                             <Box>
//                                                                 <Typography fontWeight="bold">নির্দিষ্ট মাস</Typography>
//                                                                 <Typography variant="caption" color="text.secondary">মাস নির্বাচন করুন</Typography>
//                                                             </Box>
//                                                         </ToggleButton>
//                                                     </ToggleButtonGroup>

//                                                     {operationType === "specific" && (
//                                                         <Grow in={operationType === "specific"}>
//                                                             <Box sx={{ mt: 2 }}>
//                                                                 <DatePicker
//                                                                     views={["year", "month"]}
//                                                                     value={selectedMonth}
//                                                                     onChange={(newValue) => setSelectedMonth(newValue)}
//                                                                     slotProps={{
//                                                                         textField: {
//                                                                             fullWidth: true,
//                                                                             size: "medium",
//                                                                             sx: { bgcolor: "white" },
//                                                                             placeholder: "মাস নির্বাচন করুন"
//                                                                         }
//                                                                     }}
//                                                                 />
//                                                             </Box>
//                                                         </Grow>
//                                                     )}

//                                                     <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
//                                                         <Button variant="contained" color="warning" onClick={handleNext} disabled={operationType === "specific" && !selectedMonth}>
//                                                             পরবর্তী →
//                                                         </Button>
//                                                     </Box>
//                                                 </Box>
//                                             </Fade>
//                                         )}

//                                         {/* Step 2: Calculate Balance */}
//                                         {index === 1 && (
//                                             <Fade in={true}>
//                                                 <Box sx={{ py: 2 }}>
//                                                     <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
//                                                         <Typography variant="body2">
//                                                             <strong>📌 {getMonthDisplay()} মাসের মিল ব্যালেন্স ক্যালকুলেট করতে নিচের বাটনে ক্লিক করুন।</strong>
//                                                             <br />
//                                                             ক্যালকুলেশনের সময় প্রতিদিনের মিল অ্যাটেনডেন্স থেকে আসল খরচ বের করে
//                                                             মিল ফি (5000 TK) এর সাথে তুলনা করে অ্যাডভান্স বা ডিউ হিসাব করা হবে।
//                                                         </Typography>
//                                                     </Alert>

//                                                     <Button
//                                                         variant="contained"
//                                                         color="warning"
//                                                         size="large"
//                                                         fullWidth
//                                                         onClick={handleCalculate}
//                                                         disabled={loading}
//                                                         startIcon={loading ? <CircularProgress size={20} /> : <CalculateIcon />}
//                                                         sx={{ py: 2, borderRadius: 2, fontSize: "1rem" }}
//                                                     >
//                                                         {loading ? "ক্যালকুলেট হচ্ছে..." : `${getMonthDisplay()} মাসের মিল ব্যালেন্স ক্যালকুলেট করুন`}
//                                                     </Button>

//                                                     <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
//                                                         <Button variant="outlined" onClick={handleBack}>
//                                                             ← পিছনে
//                                                         </Button>
//                                                     </Box>
//                                                 </Box>
//                                             </Fade>
//                                         )}

//                                         {/* Step 3: Results */}
//                                         {index === 2 && resultData && (
//                                             <Fade in={!!resultData}>
//                                                 <Box sx={{ py: 2 }}>
//                                                     {/* Summary Cards */}
//                                                     <Grid container spacing={2} sx={{ mb: 3 }}>
//                                                         <Grid item xs={6} md={3}>
//                                                             <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 2 }}>
//                                                                 <CardContent sx={{ textAlign: "center", py: 2 }}>
//                                                                     <School sx={{ color: "#2196f3", fontSize: 32 }} />
//                                                                     <Typography variant="h4" fontWeight="bold">{resultData?.totalStudents || 0}</Typography>
//                                                                     <Typography variant="body2" color="text.secondary">মোট শিক্ষার্থী</Typography>
//                                                                 </CardContent>
//                                                             </Card>
//                                                         </Grid>
//                                                         <Grid item xs={6} md={3}>
//                                                             <Card sx={{ bgcolor: "#e8f5e9", borderRadius: 2 }}>
//                                                                 <CardContent sx={{ textAlign: "center", py: 2 }}>
//                                                                     <CheckCircle sx={{ color: "#4caf50", fontSize: 32 }} />
//                                                                     <Typography variant="h4" fontWeight="bold" color="success.main">{resultData?.successCount || 0}</Typography>
//                                                                     <Typography variant="body2" color="text.secondary">সফল ক্যালকুলেশন</Typography>
//                                                                 </CardContent>
//                                                             </Card>
//                                                         </Grid>
//                                                         <Grid item xs={6} md={3}>
//                                                             <Card sx={{ bgcolor: "#ffebee", borderRadius: 2 }}>
//                                                                 <CardContent sx={{ textAlign: "center", py: 2 }}>
//                                                                     <WarningIcon sx={{ color: "#f44336", fontSize: 32 }} />
//                                                                     <Typography variant="h4" fontWeight="bold" color="error.main">{resultData?.errorCount || 0}</Typography>
//                                                                     <Typography variant="body2" color="text.secondary">ত্রুটি</Typography>
//                                                                 </CardContent>
//                                                             </Card>
//                                                         </Grid>
//                                                         <Grid item xs={6} md={3}>
//                                                             <Card sx={{ bgcolor: "#fff3e0", borderRadius: 2 }}>
//                                                                 <CardContent sx={{ textAlign: "center", py: 2 }}>
//                                                                     <CalculateIcon sx={{ color: "#ff9800", fontSize: 32 }} />
//                                                                     <Typography variant="h4" fontWeight="bold" color="warning.main">{resultData?.adjustments?.length || 0}</Typography>
//                                                                     <Typography variant="body2" color="text.secondary">অ্যাডজাস্টমেন্ট</Typography>
//                                                                 </CardContent>
//                                                             </Card>
//                                                         </Grid>
//                                                     </Grid>

//                                                     {/* How Balance Works */}
//                                                     <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
//                                                         <Typography variant="body2">
//                                                             <strong>📊 ব্যালেন্স ক্যালকুলেশন পদ্ধতি:</strong><br />
//                                                             • মোট মিল খরচ (mealCost) = ৳XX,XXX<br />
//                                                             • মাসিক মিল ফি = ৳5,000<br />
//                                                             • <strong style={{ color: "#4caf50" }}>বেশি টাকা দিলে = অ্যাডভান্স</strong> (পরবর্তী মাসে কাটা হবে)<br />
//                                                             • <strong style={{ color: "#f44336" }}>কম টাকা দিলে = ডিউ</strong> (স্টুডেন্ট বাকি দিবে)
//                                                         </Typography>
//                                                     </Alert>

//                                                     {resultData?.adjustments?.length > 0 && (
//                                                         <Accordion expanded={expanded === "panel1"} onChange={handleAccordionChange("panel1")} sx={{ mb: 2 }}>
//                                                             <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                                                                 <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                                                                     <WarningIcon color="warning" />
//                                                                     <strong>অ্যাডজাস্টমেন্ট সমূহ</strong> ({resultData.adjustments.length} টি)
//                                                                 </Typography>
//                                                             </AccordionSummary>
//                                                             <AccordionDetails>
//                                                                 <TableContainer component={Paper} variant="outlined">
//                                                                     <Table size="small">
//                                                                         <TableHead>
//                                                                             <TableRow sx={{ bgcolor: "#f5f5f5" }}>
//                                                                                 <TableCell>শিক্ষার্থীর নাম</TableCell>
//                                                                                 <TableCell align="right">ব্যালেন্স</TableCell>
//                                                                                 <TableCell align="center">স্ট্যাটাস</TableCell>
//                                                                                 <TableCell align="right">নতুন ডিউ</TableCell>
//                                                                             </TableRow>
//                                                                         </TableHead>
//                                                                         <TableBody>
//                                                                             {resultData.adjustments.map((adj: any, idx: number) => (
//                                                                                 <TableRow key={idx}>
//                                                                                     <TableCell>
//                                                                                         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                                                                                             <School fontSize="small" color="primary" />
//                                                                                             <Typography fontWeight="medium">{adj.studentName}</Typography>
//                                                                                         </Box>
//                                                                                     </TableCell>
//                                                                                     <TableCell align="right" sx={{ fontWeight: "bold" }}>
//                                                                                         ৳{Math.abs(adj.balance).toLocaleString()}
//                                                                                     </TableCell>
//                                                                                     <TableCell align="center">
//                                                                                         <Chip
//                                                                                             label={adj.balance < 0 ? "💰 অ্যাডভান্স" : "⚠️ ডিউ"}
//                                                                                             size="small"
//                                                                                             color={adj.balance < 0 ? "success" : "error"}
//                                                                                         />
//                                                                                     </TableCell>
//                                                                                     <TableCell align="right">
//                                                                                         <Typography fontWeight="bold" color={adj.newDueAmount > 0 ? "error" : "success"}>
//                                                                                             ৳{adj.newDueAmount?.toLocaleString() || "0"}
//                                                                                         </Typography>
//                                                                                     </TableCell>
//                                                                                 </TableRow>
//                                                                             ))}
//                                                                         </TableBody>
//                                                                     </Table>
//                                                                 </TableContainer>
//                                                             </AccordionDetails>
//                                                         </Accordion>
//                                                     )}

//                                                     {resultData?.adjustments?.length === 0 && (
//                                                         <Alert severity="success" icon={<SuccessIcon />} sx={{ borderRadius: 2 }}>
//                                                             <strong>🎉 কোন অ্যাডজাস্টমেন্ট প্রয়োজন নেই!</strong><br />
//                                                             সকল স্টুডেন্টের মিল ব্যালেন্স সঠিক রয়েছে।
//                                                         </Alert>
//                                                     )}

//                                                     <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
//                                                         <Button variant="contained" color="success" onClick={handleReset} startIcon={<SuccessIcon />}>
//                                                             নতুন করে শুরু করুন
//                                                         </Button>
//                                                     </Box>
//                                                 </Box>
//                                             </Fade>
//                                         )}
//                                     </StepContent>
//                                 </Step>
//                             ))}
//                         </Stepper>
//                     </Box>
//                 </Paper>

//                 {/* How it works - Detailed */}
//                 <Card sx={{ mt: 3, borderRadius: 3 }}>
//                     <CardContent>
//                         <Typography variant="h6" fontWeight="bold" gutterBottom>
//                             📖 কিভাবে মিল ব্যালেন্স ক্যালকুলেশন কাজ করে?
//                         </Typography>
//                         <Grid container spacing={3}>
//                             <Grid item xs={12} md={4}>
//                                 <Paper sx={{ p: 2, bgcolor: "#e3f2fd", height: "100%", borderRadius: 2 }}>
//                                     <Typography variant="subtitle2" fontWeight="bold" color="primary.main">1️⃣ মিল অ্যাটেনডেন্স রেকর্ড</Typography>
//                                     <Typography variant="body2" sx={{ mt: 1 }}>
//                                         প্রতিদিন সকাল ১২:০৫ মিনিটে ক্রন জব চালু হয়ে
//                                         সকল শিক্ষার্থীর জন্য ডিফল্ট মিল অ্যাটেনডেন্স তৈরি করে।
//                                         শিক্ষকরা পরে তা আপডেট করতে পারেন।
//                                     </Typography>
//                                 </Paper>
//                             </Grid>
//                             <Grid item xs={12} md={4}>
//                                 <Paper sx={{ p: 2, bgcolor: "#fff3e0", height: "100%", borderRadius: 2 }}>
//                                     <Typography variant="subtitle2" fontWeight="bold" color="warning.main">2️⃣ মোট খরচ ক্যালকুলেশন</Typography>
//                                     <Typography variant="body2" sx={{ mt: 1 }}>
//                                         মাস শেষে প্রতিটি শিক্ষার্থীর মোট মিল খরচ (mealCost) যোগ করে বের করা হয়।
//                                         প্রতি মিলের মূল্য ৫৫ টাকা ধরা হয়।
//                                     </Typography>
//                                 </Paper>
//                             </Grid>
//                             <Grid item xs={12} md={4}>
//                                 <Paper sx={{ p: 2, bgcolor: "#e8f5e9", height: "100%", borderRadius: 2 }}>
//                                     <Typography variant="subtitle2" fontWeight="bold" color="success.main">3️⃣ ব্যালেন্স নির্ধারণ</Typography>
//                                     <Typography variant="body2" sx={{ mt: 1 }}>
//                                         মোট খরচ থেকে মাসিক মিল ফি (৫,০০০ টাকা) বিয়োগ করে ব্যালেন্স বের করা হয়।
//                                         <br />
//                                         <strong style={{ color: "#4caf50" }}>নেগেটিভ = অ্যাডভান্স</strong> (পরবর্তী মাসে কাটা হবে)
//                                         <br />
//                                         <strong style={{ color: "#f44336" }}>পজিটিভ = ডিউ</strong> (স্টুডেন্ট দিবে)
//                                     </Typography>
//                                 </Paper>
//                             </Grid>
//                         </Grid>
//                     </CardContent>
//                 </Card>

//                 {/* Cron Job Schedule Card */}
//                 <Card sx={{ mt: 3, borderRadius: 3, bgcolor: "#f5f5f5" }}>
//                     <CardContent>
//                         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
//                             ⏰ স্বয়ংক্রিয় ক্রন জব শিডিউল
//                         </Typography>
//                         <Grid container spacing={2}>
//                             <Grid item xs={12} sm={6}>
//                                 <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, bgcolor: "white", borderRadius: 2 }}>
//                                     <ScheduleIcon color="primary" />
//                                     <Box>
//                                         <Typography variant="body2" fontWeight="bold">মিল অ্যাটেনডেন্স ক্রন জব</Typography>
//                                         <Typography variant="caption" color="text.secondary">
//                                             প্রতিদিন রাত ১২:০৫ মিনিটে চলে
//                                         </Typography>
//                                     </Box>
//                                 </Box>
//                             </Grid>
//                             <Grid item xs={12} sm={6}>
//                                 <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, bgcolor: "white", borderRadius: 2 }}>
//                                     <TimerIcon color="warning" />
//                                     <Box>
//                                         <Typography variant="body2" fontWeight="bold">মিল ব্যালেন্স ক্রন জব</Typography>
//                                         <Typography variant="caption" color="text.secondary">
//                                             মাসের শেষ দিন রাত ১১:৫৯ মিনিটে চলে
//                                         </Typography>
//                                     </Box>
//                                 </Box>
//                             </Grid>
//                         </Grid>
//                     </CardContent>
//                 </Card>
//             </Box>
//         </LocalizationProvider>
//     );
// };

// export default MealBalancePage;

import React from 'react'

export default function page() {
    return (
        <div>page</div>
    )
}

// // src/app/dashboard/fees/generate/page.tsx
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
//     LinearProgress,
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
//     Calculate as CalculateIcon,
//     CheckCircle as SuccessIcon,
//     Info as InfoIcon,
//     PlayArrow as PlayIcon,
//     History as HistoryIcon,
//     ExpandMore as ExpandMoreIcon,
//     School as SchoolIcon,
//     AttachMoney as MoneyIcon,
//     Receipt as ReceiptIcon,
//     CalendarMonth as CalendarIcon,
//     TrendingUp as TrendingUpIcon,
//     TrendingDown as TrendingDownIcon,
//     Schedule as ScheduleIcon,
//     Timer as TimerIcon,
// } from "@mui/icons-material";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs, { Dayjs } from "dayjs";
// import {
//     useGenerateCurrentMonthFeesMutation,
//     useGenerateSpecificMonthFeesMutation,
//     useGetFeeGenerationStatusQuery,
// } from "@/redux/api/feesApi";
// import toast from "react-hot-toast";

// type OperationType = "current" | "specific";

// interface StepData {
//     label: string;
//     description: string;
//     icon: React.ReactNode;
//     details: string;
// }

// const FeeGenerationPage = () => {
//     const theme = useTheme();
//     const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

//     const [operationType, setOperationType] = useState<OperationType>("current");
//     const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
//     const [loading, setLoading] = useState(false);
//     const [activeStep, setActiveStep] = useState(0);
//     const [resultData, setResultData] = useState<any>(null);
//     const [expanded, setExpanded] = useState<string | false>(false);

//     const [generateCurrentMonth] = useGenerateCurrentMonthFeesMutation();
//     const [generateSpecificMonth] = useGenerateSpecificMonthFeesMutation();
//     const { data: statusData, refetch: refetchStatus } = useGetFeeGenerationStatusQuery({});

//     const currentMonthStatus = statusData?.data;
//     const currentDate = dayjs();
//     const lastDayOfMonth = currentDate.endOf('month').date();

//     const steps: StepData[] = [
//         {
//             label: "📋 ধাপ ১: অপশন নির্বাচন",
//             description: "আপনি বর্তমান মাস নাকি নির্দিষ্ট মাসের জন্য ফি জেনারেট করতে চান?",
//             icon: <InfoIcon />,
//             details: "এখানে আপনি কোন মাসের ফি জেনারেট করবেন তা নির্বাচন করতে পারবেন। বর্তমান মাস সিলেক্ট করলে automatic বর্তমান মাসের ফি জেনারেট হবে। নির্দিষ্ট মাস সিলেক্ট করলে আপনাকে মাস নির্বাচন করতে হবে।"
//         },
//         {
//             label: "⚙️ ধাপ ২: ফি জেনারেট",
//             description: "নির্বাচিত মাসের সকল ফি জেনারেট করুন",
//             icon: <CalculateIcon />,
//             details: "নিচের বাটনে ক্লিক করলে সিস্টেম automatic ভাবে Admission, Monthly, Tuition, Meal এবং Seat Rent ফি জেনারেট করবে। জেনারেশনের সময় আগের মাসের অ্যাডভান্স ব্যালেন্স automatic কেটে নেয়া হবে।"
//         },
//         {
//             label: "📊 ধাপ ৩: ফলাফল দেখুন",
//             description: "জেনারেট হওয়া ফি এর বিস্তারিত বিবরণ",
//             icon: <TrendingUpIcon />,
//             details: "জেনারেশন সম্পন্ন হওয়ার পর শিক্ষার্থী ভিত্তিক ফি বিবরণ দেখাবে। এখানে প্রতিটি শিক্ষার্থীর ফি টাইপ, পরিমাণ, পেইড, অ্যাডভান্স এবং বাকি টাকার বিস্তারিত তথ্য দেখতে পাবেন।"
//         },
//     ];

//     const handleGenerateFees = async () => {
//         setLoading(true);
//         setResultData(null);

//         try {
//             let result;
//             const toastId = toast.loading("ফি জেনারেট করা হচ্ছে...");

//             if (operationType === "current") {
//                 result = await generateCurrentMonth().unwrap();
//             } else {
//                 if (!selectedMonth) {
//                     toast.error("দয়া করে একটি মাস নির্বাচন করুন");
//                     setLoading(false);
//                     return;
//                 }
//                 result = await generateSpecificMonth({
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
//                         <Typography variant="body1" fontWeight="bold">✅ ফি জেনারেশন সম্পূর্ণ!</Typography>
//                         <Typography variant="body2">📊 জেনারেটেড রেকর্ড: {result.data?.generatedFeeRecords || 0}</Typography>
//                         <Typography variant="body2">💰 মোট পরিমাণ: ৳{result.data?.totalAmount?.toLocaleString() || 0}</Typography>
//                     </Box>,
//                     { duration: 5000 }
//                 );
//                 refetchStatus();
//             } else {
//                 toast.error(result.message || "ফি জেনারেশন ব্যর্থ হয়েছে");
//             }
//         } catch (error: any) {
//             toast.error(error?.data?.message || "ফি জেনারেশন ব্যর্থ হয়েছে");
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

//     const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
//         setExpanded(isExpanded ? panel : false);
//     };

//     const getFeeTypeColor = (feeType: string) => {
//         if (feeType.includes("Monthly")) return { bg: "#E3F2FD", color: "#1976D2", icon: "📅", name: "মাসিক ফি" };
//         if (feeType.includes("Tuition")) return { bg: "#E8F5E9", color: "#388E3C", icon: "📚", name: "টিউশন ফি" };
//         if (feeType.includes("Meal")) return { bg: "#FFF3E0", color: "#F57C00", icon: "🍽️", name: "মিল ফি" };
//         if (feeType.includes("Seat")) return { bg: "#F3E5F5", color: "#7B1FA2", icon: "💺", name: "সীট রেন্ট" };
//         if (feeType.includes("Admission")) return { bg: "#FFEBEE", color: "#D32F2F", icon: "🎓", name: "অ্যাডমিশন ফি" };
//         return { bg: "#F5F5F5", color: "#757575", icon: "💰", name: "অন্যান্য ফি" };
//     };

//     const handleNext = () => {
//         if (activeStep === 0) {
//             if (operationType === "specific" && !selectedMonth) {
//                 toast.error("দয়া করে একটি মাস নির্বাচন করুন");
//                 return;
//             }
//             setActiveStep(1);
//         } else if (activeStep === 1) {
//             handleGenerateFees();
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

//     return (
//         <LocalizationProvider dateAdapter={AdapterDayjs}>
//             <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f5f7fa", minHeight: "100vh" }}>

//                 {/* Header */}
//                 <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
//                     <Typography variant="h4" fontWeight="bold" gutterBottom>
//                         <CalculateIcon sx={{ mr: 1, verticalAlign: "middle" }} />
//                         ফি জেনারেশন
//                     </Typography>
//                     <Typography variant="body2" sx={{ opacity: 0.9 }}>
//                         মাসিক ফি জেনারেট করুন - Admission, Monthly, Tuition, Meal এবং Seat Rent
//                     </Typography>
//                     <Alert severity="info" sx={{ mt: 2, bgcolor: "rgba(255,255,255,0.1)", color: "white" }}>
//                         <Typography variant="body2">
//                             <strong>ℹ️ কীভাবে কাজ করে?</strong><br />
//                             • মাসের ১ তারিখে স্বয়ংক্রিয়ভাবে ক্রন জব চালু হয়ে ফি জেনারেট হয়<br />
//                             • আগের মাসের অ্যাডভান্স ব্যালেন্স থাকলে automatic কেটে নেয়া হয়<br />
//                             • প্রতিটি শিক্ষার্থীর জন্য আলাদা আলাদা ফি রেকর্ড তৈরি হয়
//                         </Typography>
//                     </Alert>
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
//                                             ফি জেনারেশন ক্রন জব
//                                         </Typography>
//                                         <Typography variant="body2" sx={{ mt: 1 }}>
//                                             <strong>📅 কখন চলে?</strong> মাসের <strong>১ তারিখ</strong> রাত <strong>১২:০০ AM</strong> এ স্বয়ংক্রিয়ভাবে চলে
//                                         </Typography>
//                                         <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//                                             <strong>🔧 কী করে?</strong> সকল শিক্ষার্থীর জন্য Admission, Monthly, Tuition, Meal এবং Seat Rent ফি জেনারেট করে
//                                         </Typography>
//                                     </Paper>
//                                 </Grid>
//                                 <Grid item xs={12} md={6}>
//                                     <Paper sx={{ p: 2, bgcolor: "#fff", borderRadius: 2 }}>
//                                         <Typography variant="subtitle2" fontWeight="bold" color="success.main">
//                                             <TrendingUpIcon sx={{ mr: 0.5, fontSize: 16, verticalAlign: "middle" }} />
//                                             অ্যাডভান্স অ্যাডজাস্টমেন্ট
//                                         </Typography>
//                                         <Typography variant="body2" sx={{ mt: 1 }}>
//                                             <strong>💰 আগের মাসের অ্যাডভান্স</strong> থাকলে স্বয়ংক্রিয়ভাবে এই মাসের ফি থেকে কেটে নেয়া হয়
//                                         </Typography>
//                                         <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//                                             <strong>📌 উদাহরণ:</strong> আগের মাসে ১,০০০ টাকা অ্যাডভান্স থাকলে এই মাসের ফি ৫,০০০ এর পরিবর্তে ৪,০০০ টাকা দিতে হবে
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
//                             <Typography variant="h6" fontWeight="bold" gutterBottom>📊 বর্তমান মাসের স্ট্যাটাস</Typography>
//                             <Grid container spacing={2}>
//                                 <Grid item xs={4} md={3}>
//                                     <Typography color="text.secondary" variant="body2">মাস</Typography>
//                                     <Typography variant="h6" fontWeight="bold">{currentMonthStatus?.currentMonth} {currentMonthStatus?.currentYear}</Typography>
//                                 </Grid>
//                                 <Grid item xs={4} md={3}>
//                                     <Typography color="text.secondary" variant="body2">মোট শিক্ষার্থী</Typography>
//                                     <Typography variant="h6" fontWeight="bold">{currentMonthStatus?.totalStudents || 0}</Typography>
//                                 </Grid>
//                                 <Grid item xs={4} md={3}>
//                                     <Typography color="text.secondary" variant="body2">ফি জেনারেট</Typography>
//                                     <Chip
//                                         label={currentMonthStatus?.statistics?.isComplete ? "সম্পূর্ণ" : "অসম্পূর্ণ"}
//                                         color={currentMonthStatus?.statistics?.isComplete ? "success" : "warning"}
//                                         size="small"
//                                     />
//                                 </Grid>
//                                 <Grid item xs={6} md={3}>
//                                     <Typography color="text.secondary" variant="body2">কমপ্লিশন রেট</Typography>
//                                     <Typography variant="h6" fontWeight="bold" color="primary">
//                                         {currentMonthStatus?.statistics?.completionRate || 0}%
//                                     </Typography>
//                                 </Grid>
//                             </Grid>
//                             {!currentMonthStatus?.statistics?.isComplete && (
//                                 <>
//                                     <LinearProgress
//                                         variant="determinate"
//                                         value={parseFloat(currentMonthStatus?.statistics?.completionRate || "0")}
//                                         sx={{ mt: 2, height: 8, borderRadius: 4 }}
//                                     />
//                                     <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
//                                         {currentMonthStatus?.statistics?.totalFeesGenerated || 0} / {currentMonthStatus?.statistics?.totalExpectedFees || 0} ফি জেনারেট হয়েছে
//                                     </Typography>
//                                 </>
//                             )}
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
//                                                 bgcolor: activeStep >= index ? "primary.main" : "grey.300",
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

//                                                     <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                                                         {step.details}
//                                                     </Typography>

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
//                                                         <Button variant="contained" onClick={handleNext} disabled={operationType === "specific" && !selectedMonth}>
//                                                             পরবর্তী →
//                                                         </Button>
//                                                     </Box>
//                                                 </Box>
//                                             </Fade>
//                                         )}

//                                         {/* Step 2: Generate Fees */}
//                                         {index === 1 && (
//                                             <Fade in={true}>
//                                                 <Box sx={{ py: 2 }}>
//                                                     <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
//                                                         <Typography variant="body2">
//                                                             <strong>📌 {getMonthDisplay()} মাসের ফি জেনারেট করতে নিচের বাটনে ক্লিক করুন।</strong>
//                                                             <br />
//                                                             জেনারেট হওয়ার পর সকল শিক্ষার্থীর জন্য Admission, Monthly, Tuition, Meal এবং Seat Rent ফি তৈরি হবে।
//                                                         </Typography>
//                                                     </Alert>

//                                                     <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                                                         {step.details}
//                                                     </Typography>

//                                                     <Button
//                                                         variant="contained"
//                                                         color="primary"
//                                                         size="large"
//                                                         fullWidth
//                                                         onClick={handleGenerateFees}
//                                                         disabled={loading}
//                                                         startIcon={loading ? <CircularProgress size={20} /> : <CalculateIcon />}
//                                                         sx={{ py: 2, borderRadius: 2, fontSize: "1rem" }}
//                                                     >
//                                                         {loading ? "জেনারেট হচ্ছে..." : `${getMonthDisplay()} মাসের ফি জেনারেট করুন`}
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
//                                                     <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                                                         {steps[2].details}
//                                                     </Typography>

//                                                     {/* Summary Cards */}
//                                                     <Grid container spacing={2} sx={{ mb: 3 }}>
//                                                         <Grid item xs={6} md={3}>
//                                                             <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 2 }}>
//                                                                 <CardContent sx={{ textAlign: "center", py: 2 }}>
//                                                                     <ReceiptIcon sx={{ color: "#2196f3", fontSize: 32 }} />
//                                                                     <Typography variant="h4" fontWeight="bold">{resultData?.generatedFeeRecords || 0}</Typography>
//                                                                     <Typography variant="body2" color="text.secondary">জেনারেটেড রেকর্ড</Typography>
//                                                                 </CardContent>
//                                                             </Card>
//                                                         </Grid>
//                                                         <Grid item xs={6} md={3}>
//                                                             <Card sx={{ bgcolor: "#e8f5e9", borderRadius: 2 }}>
//                                                                 <CardContent sx={{ textAlign: "center", py: 2 }}>
//                                                                     <TrendingUpIcon sx={{ color: "#4caf50", fontSize: 32 }} />
//                                                                     <Typography variant="h4" fontWeight="bold" color="success.main">৳{resultData?.totalAmount?.toLocaleString() || 0}</Typography>
//                                                                     <Typography variant="body2" color="text.secondary">মোট ফি</Typography>
//                                                                 </CardContent>
//                                                             </Card>
//                                                         </Grid>
//                                                         <Grid item xs={6} md={3}>
//                                                             <Card sx={{ bgcolor: "#fff3e0", borderRadius: 2 }}>
//                                                                 <CardContent sx={{ textAlign: "center", py: 2 }}>
//                                                                     <TrendingDownIcon sx={{ color: "#ff9800", fontSize: 32 }} />
//                                                                     <Typography variant="h4" fontWeight="bold" color="warning.main">৳{resultData?.totalPaid?.toLocaleString() || 0}</Typography>
//                                                                     <Typography variant="body2" color="text.secondary">অ্যাডভান্স থেকে পেইড</Typography>
//                                                                 </CardContent>
//                                                             </Card>
//                                                         </Grid>
//                                                         <Grid item xs={6} md={3}>
//                                                             <Card sx={{ bgcolor: "#ffebee", borderRadius: 2 }}>
//                                                                 <CardContent sx={{ textAlign: "center", py: 2 }}>
//                                                                     <MoneyIcon sx={{ color: "#f44336", fontSize: 32 }} />
//                                                                     <Typography variant="h4" fontWeight="bold" color="error.main">৳{resultData?.totalDue?.toLocaleString() || 0}</Typography>
//                                                                     <Typography variant="body2" color="text.secondary">বাকি পরিমাণ</Typography>
//                                                                 </CardContent>
//                                                             </Card>
//                                                         </Grid>
//                                                     </Grid>

//                                                     {/* How Fee Generation Works */}
//                                                     <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
//                                                         <Typography variant="body2">
//                                                             <strong>📊 ফি জেনারেশন পদ্ধতি:</strong><br />
//                                                             • <strong>অ্যাডমিশন ফি</strong> - শুধুমাত্র প্রথম মাসে ১ বার জেনারেট হয়<br />
//                                                             • <strong>মাসিক, টিউশন ও সীট রেন্ট ফি</strong> - প্রতি মাসে জেনারেট হয়<br />
//                                                             • <strong>মিল ফি</strong> - প্রতি মাসে ৫,০০০ টাকা জেনারেট হয়, আগের মাসের অ্যাডভান্স কেটে নেয়া হয়
//                                                         </Typography>
//                                                     </Alert>

//                                                     {/* Student-wise Breakdown */}
//                                                     {resultData?.generatedFees?.length > 0 && (
//                                                         <>
//                                                             <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
//                                                                 👨‍🎓 শিক্ষার্থী ভিত্তিক ফি বিবরণ
//                                                             </Typography>
//                                                             <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
//                                                                 প্রতিটি শিক্ষার্থীর ফি বিস্তারিত দেখতে ক্লিক করুন
//                                                             </Typography>
//                                                             {resultData.generatedFees.map((student: any, index: number) => (
//                                                                 <Accordion
//                                                                     key={student.studentId}
//                                                                     expanded={expanded === `panel${index}`}
//                                                                     onChange={handleAccordionChange(`panel${index}`)}
//                                                                     sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}
//                                                                 >
//                                                                     <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                                                                         <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", width: "100%" }}>
//                                                                             <SchoolIcon color="primary" />
//                                                                             <Typography fontWeight="bold">{student.studentName}</Typography>
//                                                                             <Chip label={student.className} size="small" variant="outlined" />
//                                                                             <Chip label={student.category} size="small" color="primary" variant="outlined" />
//                                                                             <Box sx={{ flexGrow: 1 }} />
//                                                                             <Chip
//                                                                                 label={`বাকি: ৳${student.totalDue?.toLocaleString()}`}
//                                                                                 size="small"
//                                                                                 color={student.totalDue > 0 ? "error" : "success"}
//                                                                             />
//                                                                         </Box>
//                                                                     </AccordionSummary>
//                                                                     <AccordionDetails>
//                                                                         <TableContainer component={Paper} variant="outlined">
//                                                                             <Table size="small">
//                                                                                 <TableHead sx={{ bgcolor: "#f5f5f5" }}>
//                                                                                     <TableRow>
//                                                                                         <TableCell>ফি টাইপ</TableCell>
//                                                                                         <TableCell align="right">পরিমাণ</TableCell>
//                                                                                         <TableCell align="right">পেইড</TableCell>
//                                                                                         <TableCell align="right">অ্যাডভান্স</TableCell>
//                                                                                         <TableCell align="right">বাকি</TableCell>
//                                                                                         <TableCell align="center">স্ট্যাটাস</TableCell>
//                                                                                     </TableRow>
//                                                                                 </TableHead>
//                                                                                 <TableBody>
//                                                                                     {student.fees?.map((fee: any, idx: number) => {
//                                                                                         const style = getFeeTypeColor(fee.feeType);
//                                                                                         return (
//                                                                                             <TableRow key={idx}>
//                                                                                                 <TableCell>
//                                                                                                     <Chip
//                                                                                                         label={`${style.icon} ${style.name}`}
//                                                                                                         size="small"
//                                                                                                         sx={{ bgcolor: style.bg, color: style.color, fontWeight: "bold" }}
//                                                                                                     />
//                                                                                                 </TableCell>
//                                                                                                 <TableCell align="right">৳{fee.amount?.toLocaleString()}</TableCell>
//                                                                                                 <TableCell align="right" sx={{ color: fee.paidAmount > 0 ? "#4caf50" : "inherit" }}>
//                                                                                                     ৳{fee.paidAmount?.toLocaleString()}
//                                                                                                 </TableCell>
//                                                                                                 <TableCell align="right" sx={{ color: fee.advanceUsed > 0 ? "#ff9800" : "inherit" }}>
//                                                                                                     ৳{fee.advanceUsed?.toLocaleString()}
//                                                                                                 </TableCell>
//                                                                                                 <TableCell align="right" sx={{ color: fee.dueAmount > 0 ? "#f44336" : "inherit", fontWeight: "bold" }}>
//                                                                                                     ৳{fee.dueAmount?.toLocaleString()}
//                                                                                                 </TableCell>
//                                                                                                 <TableCell align="center">
//                                                                                                     <Chip
//                                                                                                         label={fee.status === "paid" ? "✅ পেইড" : fee.status === "partial" ? "⚠️ আংশিক" : "❌ আনপেইড"}
//                                                                                                         size="small"
//                                                                                                         color={fee.status === "paid" ? "success" : fee.status === "partial" ? "warning" : "error"}
//                                                                                                     />
//                                                                                                 </TableCell>
//                                                                                             </TableRow>
//                                                                                         );
//                                                                                     })}
//                                                                                 </TableBody>
//                                                                                 <TableRow sx={{ bgcolor: "#f5f5f5" }}>
//                                                                                     <TableCell colSpan={4} align="right">
//                                                                                         <Typography fontWeight="bold">সর্বমোট:</Typography>
//                                                                                     </TableCell>
//                                                                                     <TableCell align="right">
//                                                                                         <Typography fontWeight="bold" color="error">৳{student.totalDue?.toLocaleString()}</Typography>
//                                                                                     </TableCell>
//                                                                                     <TableCell align="center">
//                                                                                         <Chip
//                                                                                             label={student.totalDue === 0 ? "✅ পেইড" : "⚠️ আংশিক"}
//                                                                                             size="small"
//                                                                                             color={student.totalDue === 0 ? "success" : "warning"}
//                                                                                         />
//                                                                                     </TableCell>
//                                                                                 </TableRow>
//                                                                             </Table>
//                                                                         </TableContainer>
//                                                                     </AccordionDetails>
//                                                                 </Accordion>
//                                                             ))}
//                                                         </>
//                                                     )}

//                                                     {resultData?.generatedFeeRecords === 0 && resultData?.skippedCount > 0 && (
//                                                         <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
//                                                             <Typography variant="body2">
//                                                                 <strong>⚠️ সতর্কতা:</strong><br />
//                                                                 {resultData.skippedCount} জন শিক্ষার্থীর জন্য ইতিমধ্যে ফি জেনারেট করা হয়েছে।
//                                                                 নতুন করে জেনারেট করতে চাইলে আগের ফি ডিলিট করে নিন অথবা একটি নতুন মাস নির্বাচন করুন।
//                                                             </Typography>
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



//                 {/* Cron Job Schedule Card */}
//                 <Card sx={{ mt: 3, borderRadius: 3, bgcolor: "#f5f5f5" }}>
//                     <CardContent>
//                         <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
//                             ⏰ স্বয়ংক্রিয় ক্রন জব শিডিউল
//                         </Typography>
//                         <Grid container spacing={2}>
//                             <Grid item xs={12} sm={6}>
//                                 <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, bgcolor: "white", borderRadius: 2 }}>
//                                     <CalculateIcon color="primary" />
//                                     <Box>
//                                         <Typography variant="body2" fontWeight="bold">ফি জেনারেশন ক্রন জব</Typography>
//                                         <Typography variant="caption" color="text.secondary">
//                                             মাসের ১ তারিখ রাত ১২:০০ AM - স্বয়ংক্রিয়ভাবে ফি জেনারেট করে
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
//                                             মাসের শেষ দিন রাত ১১:৫৯ PM - মিল খরচ ও ফির পার্থক্য ক্যালকুলেট করে
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

// export default FeeGenerationPage;

import React from 'react'

export default function page() {
    return (
        <div>page</div>
    )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboard/fees/meal-balance/page.tsx
"use client";

import { useGenerateMealBalanceMutation } from "@/redux/api/feesApi";
import {
    Calculate as CalculateIcon,
    ExpandMore as ExpandMoreIcon,
    Restaurant as MealIcon,
    School,
    CheckCircle as SuccessIcon,
    Warning as WarningIcon
} from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,

} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import toast from "react-hot-toast";

const MealBalancePage = () => {

    const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
    const [mealRate, setMealRate] = useState<number>(55);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState<any>(null);

    const [generateMealBalance] = useGenerateMealBalanceMutation();

    const handleCalculate = async () => {
        if (!selectedMonth) {
            toast.error("Please select a month");
            return;
        }

        if (!mealRate || mealRate <= 0) {
            toast.error("Please enter a valid meal rate");
            return;
        }

        setLoading(true);
        setResultData(null);

        try {
            const toastId = toast.loading("Calculating meal balance...");

            const result = await generateMealBalance({
                month: selectedMonth.month() + 1,
                year: selectedMonth.year(),
                mealRate: mealRate,
            }).unwrap();

            toast.dismiss(toastId);

            if (result.success) {
                setResultData(result.data);
                toast.success(
                    <Box>
                        <Typography variant="body1" fontWeight="bold">✅ Meal Balance Calculation Complete!</Typography>
                        <Typography variant="body2">Successful: {result.data?.successCount || 0} students</Typography>
                        <Typography variant="body2">Adjustments: {result.data?.adjustments?.length || 0}</Typography>
                    </Box>,
                    { duration: 5000 }
                );
            } else {
                toast.error(result.message || "Calculation failed");
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Meal balance calculation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setResultData(null);
        setSelectedMonth(dayjs());
        setMealRate(55);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
                {/* Header */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: "linear-gradient(135deg, #E91E63 0%, #FF9800 100%)", color: "white" }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        <MealIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                        Meal Balance Calculation
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Automatically calculate monthly meal costs and fee differences
                    </Typography>
                </Paper>

                {/* Input Form */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        📋 Calculation Input
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <DatePicker
                                views={["year", "month"]}
                                label="Select Month"
                                value={selectedMonth}
                                onChange={(newValue) => setSelectedMonth(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "medium",
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Meal Rate (in BDT)"
                                type="number"
                                value={mealRate}
                                onChange={(e) => setMealRate(Number(e.target.value))}
                                InputProps={{
                                    startAdornment: <Typography sx={{ mr: 1 }}>৳</Typography>,
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Button
                        variant="contained"
                        color="warning"
                        size="large"
                        fullWidth
                        onClick={handleCalculate}
                        disabled={loading || !selectedMonth}
                        startIcon={loading ? <CircularProgress size={20} /> : <CalculateIcon />}
                        sx={{ mt: 3, py: 1.5, borderRadius: 2, fontSize: "1rem" }}
                    >
                        {loading ? "Calculating..." : `Calculate Meal Balance for ${selectedMonth?.format("MMMM YYYY")}`}
                    </Button>
                </Paper>

                {/* Results Section */}
                {resultData && (
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            📊 Calculation Results
                        </Typography>

                        {/* Summary Cards */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6} md={4}>
                                <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 2 }}>
                                    <CardContent sx={{ textAlign: "center", py: 2 }}>
                                        <School sx={{ color: "#2196f3", fontSize: 32 }} />
                                        <Typography variant="h4" fontWeight="bold">{resultData?.totalStudents || 0}</Typography>
                                        <Typography variant="body2" color="text.secondary">Total Students</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6} md={4}>
                                <Card sx={{ bgcolor: "#e8f5e9", borderRadius: 2 }}>
                                    <CardContent sx={{ textAlign: "center", py: 2 }}>
                                        <SuccessIcon sx={{ color: "#4caf50", fontSize: 32 }} />
                                        <Typography variant="h4" fontWeight="bold" color="success.main">{resultData?.successCount || 0}</Typography>
                                        <Typography variant="body2" color="text.secondary">Successful Calculations</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6} md={4}>
                                <Card sx={{ bgcolor: "#ffebee", borderRadius: 2 }}>
                                    <CardContent sx={{ textAlign: "center", py: 2 }}>
                                        <WarningIcon sx={{ color: "#f44336", fontSize: 32 }} />
                                        <Typography variant="h4" fontWeight="bold" color="error.main">{resultData?.errorCount || 0}</Typography>
                                        <Typography variant="body2" color="text.secondary">Errors</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* How Balance Works */}
                        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                            <Typography variant="body2">
                                <strong>📊 Balance Calculation Method:</strong><br />
                                • Total meal cost = Calculated at {mealRate} BDT per meal<br />
                                • Monthly meal fee = ৳5,000<br />
                                • <strong style={{ color: "#4caf50" }}>If paid more = Advance</strong> (will be deducted next month)<br />
                                • <strong style={{ color: "#f44336" }}>If paid less = Due</strong> (student must pay)
                            </Typography>
                        </Alert>

                        {/* Adjustments Table */}
                        {resultData?.adjustments?.length > 0 && (
                            <Accordion defaultExpanded sx={{ mb: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <WarningIcon color="warning" />
                                        <strong>Adjustments</strong> ({resultData.adjustments.length})
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                                    <TableCell>Student Name</TableCell>
                                                    <TableCell align="right">Balance</TableCell>
                                                    <TableCell align="center">Status</TableCell>
                                                    <TableCell align="right">New Due</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {resultData.adjustments.map((adj: any, idx: number) => (
                                                    <TableRow key={idx}>
                                                        <TableCell>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                <School fontSize="small" color="primary" />
                                                                <Typography fontWeight="medium">{adj.studentName}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            ৳{Math.abs(adj.balance).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={adj.balance < 0 ? "💰 Advance" : "⚠️ Due"}
                                                                size="small"
                                                                color={adj.balance < 0 ? "success" : "error"}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography fontWeight="bold" color={adj.newDueAmount > 0 ? "error" : "success"}>
                                                                ৳{adj.newDueAmount?.toLocaleString() || "0"}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>
                        )}

                        {resultData?.adjustments?.length === 0 && (
                            <Alert severity="success" icon={<SuccessIcon />} sx={{ borderRadius: 2 }}>
                                <strong>🎉 No adjustments needed!</strong><br />
                                All students have correct meal balances.
                            </Alert>
                        )}

                        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                            <Button variant="contained" color="success" onClick={handleReset} startIcon={<SuccessIcon />}>
                                Start Over
                            </Button>
                        </Box>
                    </Paper>
                )}
            </Box>
        </LocalizationProvider>
    );
};

export default MealBalancePage;
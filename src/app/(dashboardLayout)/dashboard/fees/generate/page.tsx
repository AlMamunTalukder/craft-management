/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useGenerateFeesMutation } from "@/redux/api/feesApi";
import {
    Calculate as CalculateIcon,
    Receipt as ReceiptIcon,
    CheckCircle as SuccessIcon,
    TrendingDown as TrendingDownIcon,
    TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Fade,
    Grid,
    Grow,
    Paper,
    Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import toast from "react-hot-toast";

const FeeGenerationPage = () => {
    const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const [generateFees] = useGenerateFeesMutation();

    const handleGenerateFees = async () => {
        if (!selectedMonth) {
            toast.error("Please select a month");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const requestBody = {
                month: selectedMonth.month() + 1,
                year: selectedMonth.year(),
            };

            const toastId = toast.loading("Generating fees...");
            const response = await generateFees(requestBody).unwrap();
            toast.dismiss(toastId);

            if (response.success) {
                setResult(response.data);
                toast.success("Fee generation completed successfully!");
            } else {
                toast.error(response.message || "Fee generation failed");
            }
        } catch (error: any) {
            console.error("Generation error:", error);
            toast.error(error?.data?.message || error?.message || "Fee generation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f5f7fa", minHeight: "100vh" }}>

                <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "primary.main", color: "white" }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        <CalculateIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                        Fee Generation
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Generate monthly fees for Admission, Monthly, Tuition, Meal, and Seat Rent
                    </Typography>
                </Paper>


                <Grow in={true}>
                    <Card sx={{ borderRadius: 3, maxWidth: 600, mx: "auto" }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="center">
                                Select Month & Year
                            </Typography>

                            <Box sx={{ my: 4 }}>
                                <DatePicker
                                    views={["year", "month"]}
                                    value={selectedMonth}
                                    onChange={(newValue) => newValue && setSelectedMonth(newValue)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            // size: "large",
                                            sx: { bgcolor: "white" },
                                            placeholder: "Select month and year"
                                        }
                                    }}
                                />
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                onClick={handleGenerateFees}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <CalculateIcon />}
                                sx={{ py: 2, borderRadius: 2, fontSize: "1.1rem" }}
                            >
                                {loading ? "Generating Fees..." : `Generate Fees for ${selectedMonth.format("MMMM YYYY")}`}
                            </Button>

                            {/* Result Display */}
                            {result && (
                                <Fade in={!!result}>
                                    <Box sx={{ mt: 4 }}>
                                        <Alert severity="success" icon={<SuccessIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                                            <Typography variant="body1" fontWeight="bold">
                                                Fees Generated Successfully!
                                            </Typography>
                                        </Alert>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={4}>
                                                <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#e3f2fd", borderRadius: 2 }}>
                                                    <ReceiptIcon sx={{ fontSize: 40, color: "#1976d2", mb: 1 }} />
                                                    <Typography variant="h4" fontWeight="bold" color="#1976d2">
                                                        {result?.generatedFeeRecords || 0}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Total Records
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#e8f5e9", borderRadius: 2 }}>
                                                    <TrendingUpIcon sx={{ fontSize: 40, color: "#4caf50", mb: 1 }} />
                                                    <Typography variant="h4" fontWeight="bold" color="#4caf50">
                                                        ৳{result?.totalAmount?.toLocaleString() || 0}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Total Amount
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#ffebee", borderRadius: 2 }}>
                                                    <TrendingDownIcon sx={{ fontSize: 40, color: "#f44336", mb: 1 }} />
                                                    <Typography variant="h4" fontWeight="bold" color="#f44336">
                                                        ৳{result?.totalDue?.toLocaleString() || 0}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Total Due
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>

                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            fullWidth
                                            onClick={() => setResult(null)}
                                            sx={{ mt: 3, py: 1 }}
                                        >
                                            Generate Another Month
                                        </Button>
                                    </Box>
                                </Fade>
                            )}
                        </CardContent>
                    </Card>
                </Grow>
            </Box>
        </LocalizationProvider>
    );
};

export default FeeGenerationPage;
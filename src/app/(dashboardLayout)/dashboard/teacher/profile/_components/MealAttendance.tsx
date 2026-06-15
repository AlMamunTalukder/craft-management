/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    CalendarMonth,
    CheckCircle,
    DinnerDining,
    FreeBreakfast,
    LunchDining,
    Restaurant,
} from "@mui/icons-material";
import {
    Alert,
    alpha,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Fade,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from "@mui/material";
import React from "react";

interface MealAttendanceProps {
    teacher: any;
}

const MealAttendance: React.FC<MealAttendanceProps> = ({ teacher }) => {
    const theme = useTheme();
    const mealAttendances = teacher?.mealAttendances || [];

    // Calculate statistics
    const totalMeals = mealAttendances.reduce(
        (sum: number, meal: any) => sum + (meal.totalMeals || 0),
        0
    );
    const totalBreakfast = mealAttendances.filter((meal: any) => meal.breakfast).length;
    const totalLunch = mealAttendances.filter((meal: any) => meal.lunch).length;
    const totalDinner = mealAttendances.filter((meal: any) => meal.dinner).length;
    const totalCost = mealAttendances.reduce(
        (sum: number, meal: any) => sum + (meal.mealCost || 0),
        0
    );

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (!mealAttendances.length) {
        return (
            <Fade in={true} timeout={500}>
                <Box sx={{ p: 3, textAlign: "center" }}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No meal attendance records found for this teacher.
                    </Alert>
                </Box>
            </Fade>
        );
    }

    return (
        <Fade in={true} timeout={500}>
            <Box>
                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                background: `linear-gradient(135deg, ${alpha(
                                    theme.palette.primary.light,
                                    0.1
                                )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                            }}
                        >
                            <CardContent sx={{ textAlign: "center" }}>
                                <Restaurant sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold" color="primary">
                                    {mealAttendances.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Days
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                                background: `linear-gradient(135deg, ${alpha(
                                    theme.palette.success.light,
                                    0.1
                                )} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                            }}
                        >
                            <CardContent sx={{ textAlign: "center" }}>
                                <FreeBreakfast sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {totalBreakfast}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Breakfast
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                                background: `linear-gradient(135deg, ${alpha(
                                    theme.palette.warning.light,
                                    0.1
                                )} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                            }}
                        >
                            <CardContent sx={{ textAlign: "center" }}>
                                <LunchDining sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold" color="warning.main">
                                    {totalLunch}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Lunch
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                                background: `linear-gradient(135deg, ${alpha(
                                    theme.palette.info.light,
                                    0.1
                                )} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                            }}
                        >
                            <CardContent sx={{ textAlign: "center" }}>
                                <DinnerDining sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
                                <Typography variant="h4" fontWeight="bold" color="info.main">
                                    {totalDinner}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Dinner
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                                background: `linear-gradient(135deg, ${alpha(
                                    theme.palette.secondary.light,
                                    0.1
                                )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                            }}
                        >
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                                    ৳{totalCost.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Cost
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Meal Attendance Table */}
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 3,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        overflow: "auto",
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Month</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }} align="center">
                                    Breakfast
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold" }} align="center">
                                    Lunch
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold" }} align="center">
                                    Dinner
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold" }} align="center">
                                    Total Meals
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold" }} align="right">
                                    Cost (৳)
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mealAttendances.map((meal: any) => (
                                <TableRow
                                    key={meal._id}
                                    sx={{
                                        "&:hover": {
                                            bgcolor: alpha(theme.palette.primary.light, 0.05),
                                        },
                                    }}
                                >
                                    <TableCell>{formatDate(meal.date)}</TableCell>
                                    <TableCell>{meal.month || "N/A"}</TableCell>
                                    <TableCell align="center">
                                        {meal.breakfast ? (
                                            <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: "50%",
                                                    bgcolor: alpha(theme.palette.error.main, 0.2),
                                                    display: "inline-block",
                                                }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {meal.lunch ? (
                                            <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: "50%",
                                                    bgcolor: alpha(theme.palette.error.main, 0.2),
                                                    display: "inline-block",
                                                }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {meal.dinner ? (
                                            <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: "50%",
                                                    bgcolor: alpha(theme.palette.error.main, 0.2),
                                                    display: "inline-block",
                                                }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={meal.totalMeals || 0}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: "medium" }}>
                                        ৳{meal.mealCost?.toLocaleString() || 0}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Fade>
    );
};

export default MealAttendance;
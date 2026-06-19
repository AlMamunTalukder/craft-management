import React from 'react';
import {
    Avatar,
    Box,
    Divider,
    Grid,
    Paper,
    Typography,
    alpha,
} from '@mui/material';
import {
    Groups as AllPeopleIcon,
    School as SchoolIcon,
    Group as GroupIcon,
    Engineering as StaffIcon,
    Today as TodayIcon,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { PERSON_LABELS, TAB_COLORS } from '@/constant/meal';
import { PersonType } from '@/interface/meal';

interface CombinedSummaryItem {
    totalPersons?: number;
    totalMeals?: number;
    totalBreakfast?: number;
    totalLunch?: number;
    totalDinner?: number;
    totalFreeMeals?: number;
    totalGrossCost?: number;
    totalFreeMealCostSaved?: number;
    totalCost?: number;
    payableCost?: number;
}

interface CombinedSummary {
    totalPersons: number;
    totalMeals: number;
    totalGrossCost: number;
    totalCost: number;
    totalBreakfast: number;
    totalLunch: number;
    totalDinner: number;
    totalFreeMeals: number;
    totalFreeMealCostSaved: number;
    byPersonType?: Record<string, CombinedSummaryItem> | null;
    today?: CombinedSummaryItem | null;
}

interface CombinedMealStatsSectionProps {
    isLoadingCombined: boolean;
    combinedSummary: CombinedSummary | null;
    selectedMonth: Dayjs;
    combinedClassName?: string;
}

const CombinedMealStatsSection: React.FC<CombinedMealStatsSectionProps> = ({
    isLoadingCombined,
    combinedSummary,
    selectedMonth,
    combinedClassName,
}) => {
    if (isLoadingCombined) {
        return (
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                <Box sx={{ height: 140, borderRadius: 2, bgcolor: 'grey.100' }} />
            </Paper>
        );
    }

    if (!combinedSummary) return null;

    return (
        <Paper
            sx={{
                p: 3,
                mb: 3,
                borderRadius: 4,
                bgcolor: "#F8F5FC",
                border: "1px solid rgba(79,1,135,0.08)",
                boxShadow: "0 8px 24px rgba(79,1,135,0.08)",
            }}
        >
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <Avatar
                    sx={{
                        bgcolor: "#4F0187",
                        width: 48,
                        height: 48,
                    }}
                >
                    <AllPeopleIcon />
                </Avatar>

                <Box>
                    <Typography variant="h6" fontWeight={700} color="#1F2937">
                        Combined Total — Students + Teachers + Staff
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {selectedMonth.format("MMMM YYYY")}
                        {combinedClassName ? ` • Class: ${combinedClassName}` : ""}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={2}>
                {/* TOTAL PEOPLE */}
                <Grid item xs={6} sm={4} md={2}>
                    <Box
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 3,
                            p: 2,
                            textAlign: "center",
                            border: "1px solid rgba(79,1,135,.08)",
                            boxShadow: "0 4px 12px rgba(79,1,135,.05)",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            TOTAL PEOPLE
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            color="primary.main"
                        >
                            {combinedSummary.totalPersons}
                        </Typography>
                    </Box>
                </Grid>

                {/* TOTAL MEALS */}
                <Grid item xs={6} sm={4} md={2}>
                    <Box
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 3,
                            p: 2,
                            textAlign: "center",
                            border: "1px solid rgba(79,1,135,.08)",
                            boxShadow: "0 4px 12px rgba(79,1,135,.05)",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            TOTAL MEALS
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            color="#7B2CBF"
                        >
                            {combinedSummary.totalMeals}
                        </Typography>
                    </Box>
                </Grid>

                {/* BREAKFAST */}
                <Grid item xs={6} sm={4} md={2}>
                    <Box
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 3,
                            p: 2,
                            textAlign: "center",
                            border: "1px solid rgba(37,99,235,.1)",
                            boxShadow: "0 4px 12px rgba(37,99,235,.05)",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            BREAKFAST
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            color="#2563EB"
                        >
                            {combinedSummary.totalBreakfast}
                        </Typography>
                    </Box>
                </Grid>

                {/* LUNCH */}
                <Grid item xs={6} sm={4} md={2}>
                    <Box
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 3,
                            p: 2,
                            textAlign: "center",
                            border: "1px solid rgba(79,1,135,.1)",
                            boxShadow: "0 4px 12px rgba(79,1,135,.05)",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            LUNCH
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            color="#7B2CBF"
                        >
                            {combinedSummary.totalLunch}
                        </Typography>
                    </Box>
                </Grid>

                {/* DINNER */}
                <Grid item xs={6} sm={4} md={2}>
                    <Box
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 3,
                            p: 2,
                            textAlign: "center",
                            border: "1px solid rgba(220,38,38,.1)",
                            boxShadow: "0 4px 12px rgba(220,38,38,.05)",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            DINNER
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            color="#DC2626"
                        >
                            {combinedSummary.totalDinner}
                        </Typography>
                    </Box>
                </Grid>

                {/* FREE MEALS */}
                <Grid item xs={6} sm={4} md={2}>
                    <Box
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 3,
                            p: 2,
                            textAlign: "center",
                            border: "1px solid rgba(245,158,11,.1)",
                            boxShadow: "0 4px 12px rgba(245,158,11,.05)",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            FREE MEALS
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            color="#F59E0B"
                        >
                            {combinedSummary.totalFreeMeals}
                        </Typography>
                    </Box>
                </Grid>

                {/* GROSS COST */}
                <Grid item xs={12} md={4}>
                    <Box
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 3,
                            p: 2,
                            textAlign: "center",
                            border: "1px solid rgba(79,1,135,.08)",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            GROSS COST
                        </Typography>

                        <Typography
                            variant="h5"
                            fontWeight={700}
                            color="#4F0187"
                        >
                            ৳{combinedSummary.totalGrossCost.toLocaleString()}
                        </Typography>
                    </Box>
                </Grid>

                {/* SAVED */}
                <Grid item xs={12} md={4}>
                    <Box
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 3,
                            p: 2,
                            textAlign: "center",
                            border: "1px solid rgba(16,185,129,.1)",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            SAVED (FREE)
                        </Typography>

                        <Typography
                            variant="h5"
                            fontWeight={700}
                            color="#10B981"
                        >
                            ৳{combinedSummary.totalFreeMealCostSaved.toLocaleString()}
                        </Typography>
                    </Box>
                </Grid>

                {/* PAYABLE */}
                <Grid item xs={12} md={4}>
                    <Box
                        sx={{
                            background:
                                "linear-gradient(135deg,#4F0187,#7B2CBF)",
                            color: "#fff",
                            borderRadius: 3,
                            p: 2,
                            textAlign: "center",
                            boxShadow: "0 8px 24px rgba(79,1,135,.2)",
                        }}
                    >
                        <Typography variant="caption">
                            PAYABLE COST
                        </Typography>

                        <Typography
                            variant="h5"
                            fontWeight={700}
                        >
                            ৳{combinedSummary.totalCost.toLocaleString()}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default CombinedMealStatsSection;

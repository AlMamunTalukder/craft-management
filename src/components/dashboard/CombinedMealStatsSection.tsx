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
    Today as TodayIcon,
} from '@mui/icons-material';
import { Dayjs } from 'dayjs';

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

interface StatCardItem {
    label: string;
    value: number | string;
    color: string;
    muted?: boolean;
}

const formatCurrency = (value?: number) => `৳${(value || 0).toLocaleString()}`;

const buildMealCards = (summary: CombinedSummaryItem): StatCardItem[] => [
    {
        label: 'Total People',
        value: summary.totalPersons || 0,
        color: '#4F0187',
    },
    {
        label: 'Total Meals',
        value: summary.totalMeals || 0,
        color: '#7B2CBF',
    },
    {
        label: 'Breakfast',
        value: summary.totalBreakfast || 0,
        color: '#2563EB',
    },
    {
        label: 'Lunch',
        value: summary.totalLunch || 0,
        color: '#7B2CBF',
    },
    {
        label: 'Dinner',
        value: summary.totalDinner || 0,
        color: '#DC2626',
    },
    {
        label: 'Free Meals',
        value: summary.totalFreeMeals || 0,
        color: '#F59E0B',
    },
];

const buildCostCards = (summary: CombinedSummaryItem): StatCardItem[] => [
    {
        label: 'Gross Cost',
        value: formatCurrency(summary.totalGrossCost),
        color: '#4F0187',
        muted: true,
    },
    {
        label: 'Saved (Free)',
        value: formatCurrency(summary.totalFreeMealCostSaved),
        color: '#10B981',
        muted: true,
    },
    {
        label: 'Payable Cost',
        value: formatCurrency(summary.totalCost || summary.payableCost || 0),
        color: '#FFFFFF',
    },
];

const SummaryPanel = ({
    title,
    subtitle,
    summary,
    accentColor,
    icon,
    compact = false,
}: {
    title: string;
    subtitle: string;
    summary: CombinedSummaryItem;
    accentColor: string;
    icon: React.ReactNode;
    compact?: boolean;
}) => {
    const mealCards = buildMealCards(summary);
    const costCards = buildCostCards(summary);

    return (
        <Box
            sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 4,
                bgcolor: '#fff',
                border: `1px solid ${alpha(accentColor, 0.12)}`,
                boxShadow: `0 16px 40px ${alpha(accentColor, compact ? 0.08 : 0.1)}`,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: -60,
                    right: -60,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    bgcolor: alpha(accentColor, 0.08),
                }}
            />

            <Box display="flex" alignItems="center" gap={1.5} mb={2.5} position="relative">
                <Avatar
                    sx={{
                        bgcolor: alpha(accentColor, 0.12),
                        color: accentColor,
                        width: 46,
                        height: 46,
                    }}
                >
                    {icon}
                </Avatar>

                <Box>
                    <Typography variant="h6" fontWeight={800} color="#111827">
                        {title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={1.5} position="relative">
                {mealCards.map((card) => (
                    <Grid item xs={6} sm={4} md={2} key={card.label}>
                        <Box
                            sx={{
                                p: 1.75,
                                height: '100%',
                                minHeight: 102,
                                borderRadius: 3,
                                bgcolor: alpha(card.color, 0.055),
                                border: `1px solid ${alpha(card.color, 0.12)}`,
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
                            >
                                {card.label}
                            </Typography>

                            <Typography variant="h4" fontWeight={800} color={card.color} mt={0.75}>
                                {card.value}
                            </Typography>
                        </Box>
                    </Grid>
                ))}

                {costCards.map((card, index) => {
                    const isPayable = index === 2;

                    return (
                        <Grid item xs={12} md={4} key={card.label}>
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    textAlign: 'center',
                                    bgcolor: isPayable
                                        ? `linear-gradient(135deg, ${accentColor}, #7B2CBF)`
                                        : alpha(card.color, 0.055),
                                    background: isPayable
                                        ? `linear-gradient(135deg, ${accentColor}, #7B2CBF)`
                                        : undefined,
                                    color: isPayable ? '#fff' : 'inherit',
                                    border: isPayable ? 'none' : `1px solid ${alpha(card.color, 0.12)}`,
                                    boxShadow: isPayable ? `0 12px 28px ${alpha(accentColor, 0.22)}` : 'none',
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color={isPayable ? 'inherit' : 'text.secondary'}
                                    sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
                                >
                                    {card.label}
                                </Typography>

                                <Typography variant="h5" fontWeight={800} color={card.color} mt={0.5}>
                                    {card.value}
                                </Typography>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

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

    const monthlySummary: CombinedSummaryItem = {
        totalPersons: combinedSummary.totalPersons,
        totalMeals: combinedSummary.totalMeals,
        totalGrossCost: combinedSummary.totalGrossCost,
        totalCost: combinedSummary.totalCost,
        totalBreakfast: combinedSummary.totalBreakfast,
        totalLunch: combinedSummary.totalLunch,
        totalDinner: combinedSummary.totalDinner,
        totalFreeMeals: combinedSummary.totalFreeMeals,
        totalFreeMealCostSaved: combinedSummary.totalFreeMealCostSaved,
    };
    const todaySummary = combinedSummary.today || {};
    const classText = combinedClassName ? ` • Class: ${combinedClassName}` : '';

    return (
        <Paper
            sx={{
                p: { xs: 2, md: 3 },
                mb: 3,
                borderRadius: 5,
                bgcolor: '#F8F5FC',
                border: '1px solid rgba(79,1,135,0.08)',
                boxShadow: '0 10px 32px rgba(79,1,135,0.08)',
            }}
        >
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
                flexWrap="wrap"
                mb={2.5}
            >
                <Box>
                    <Typography variant="overline" color="#7B2CBF" fontWeight={800} letterSpacing={1}>
                        Students + Teachers + Staff
                    </Typography>

                    <Typography variant="h5" fontWeight={900} color="#111827">
                        Combined Meal Overview
                    </Typography>
                </Box>

                <Box
                    sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 999,
                        bgcolor: '#fff',
                        border: '1px solid rgba(79,1,135,0.08)',
                        color: 'text.secondary',
                        fontSize: 14,
                        fontWeight: 600,
                    }}
                >
                    {selectedMonth.format('MMMM YYYY')}{classText}
                </Box>
            </Box>

            <Grid container spacing={2.5}>
                <Grid item xs={12}>
                    <SummaryPanel
                        title="Combined Total"
                        subtitle={`${selectedMonth.format('MMMM YYYY')}${classText}`}
                        summary={monthlySummary}
                        accentColor="#4F0187"
                        icon={<AllPeopleIcon />}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ my: 0.5 }} />
                </Grid>

                <Grid item xs={12}>
                    <SummaryPanel
                        title="Today Combined Total"
                        subtitle={`Today meal total • ${new Date().toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        })}${classText}`}
                        summary={todaySummary}
                        accentColor="#2563EB"
                        icon={<TodayIcon />}
                        compact
                    />
                </Grid>
            </Grid>
        </Paper>
    );
};

export default CombinedMealStatsSection;

import React from 'react';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    alpha,
} from '@mui/material';

import {
    Restaurant as FoodIcon,
    Person as PersonIcon,
    MoneyOff as MoneyOffIcon,
    Savings as SavingsIcon,
    AttachMoney as RateIcon,
    ReceiptLong as GrossIcon,
    Payments as PayableIcon,
} from '@mui/icons-material';
import { PERSON_LABELS } from '@/constant/meal';
import { PersonType } from '@/interface/meal';

interface MealSummary {
    totalStudents: number;
    totalMeals: number;
    totalGrossCost: number;
    totalCost: number;
    totalBreakfast: number;
    totalLunch: number;
    totalDinner: number;
    totalFreeMeals: number;
    totalFreeMealCostSaved: number;
    mealRates: {
        breakfast: number;
        lunch: number;
        dinner: number;
    };
}

interface MealStatsCardsProps {
    personType: PersonType;
    monthlySummary: MealSummary;
    isLoadingStats: boolean;
}

const MealStatsCards: React.FC<MealStatsCardsProps> = ({
    personType,
    monthlySummary,
    isLoadingStats,
}) => {
    if (isLoadingStats) {
        return (
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                    <Box sx={{ height: 140, borderRadius: 3, bgcolor: 'grey.100' }} />
                </Grid>
            </Grid>
        );
    }

    return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4} lg={1.5}>
                <Card sx={{ borderRadius: 3, bgcolor: alpha('#1976d2', 0.08), border: `1px solid ${alpha('#1976d2', 0.18)}`, height: '100%' }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between">
                            <Box>
                                <Typography color="text.secondary" variant="caption" fontWeight="bold">TOTAL {PERSON_LABELS[personType].toUpperCase()}</Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">{monthlySummary.totalStudents}</Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: alpha('#1976d2', 0.18) }}><PersonIcon sx={{ color: '#1976d2' }} /></Avatar>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={1.5}>
                <Card sx={{ borderRadius: 3, bgcolor: alpha('#ED6C02', 0.08), border: `1px solid ${alpha('#ED6C02', 0.18)}`, height: '100%' }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between">
                            <Box>
                                <Typography color="text.secondary" variant="caption" fontWeight="bold">MONTHLY MEALS</Typography>
                                <Typography variant="h4" fontWeight="bold" color="#ED6C02">{monthlySummary.totalMeals}</Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: alpha('#ED6C02', 0.18) }}><FoodIcon sx={{ color: '#ED6C02' }} /></Avatar>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={1.5}>
                <Card sx={{ borderRadius: 3, bgcolor: '#E8F5E9', height: '100%' }}>
                    <CardContent>
                        <Typography color="text.secondary" variant="caption" fontWeight="bold">BREAKFAST</Typography>
                        <Typography variant="h4" fontWeight="bold" color="#2E7D32">{monthlySummary.totalBreakfast}</Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={1.5}>
                <Card sx={{ borderRadius: 3, bgcolor: '#F3E5F5', height: '100%' }}>
                    <CardContent>
                        <Typography color="text.secondary" variant="caption" fontWeight="bold">LUNCH</Typography>
                        <Typography variant="h4" fontWeight="bold" color="#9C27B0">{monthlySummary.totalLunch}</Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={1.5}>
                <Card sx={{ borderRadius: 3, bgcolor: '#FFEBEE', height: '100%' }}>
                    <CardContent>
                        <Typography color="text.secondary" variant="caption" fontWeight="bold">DINNER</Typography>
                        <Typography variant="h4" fontWeight="bold" color="#D32F2F">{monthlySummary.totalDinner}</Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={1.5}>
                <Card sx={{ borderRadius: 3, bgcolor: '#FFF3E0', height: '100%' }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between">
                            <Box>
                                <Typography color="text.secondary" variant="caption" fontWeight="bold">FREE MEALS</Typography>
                                <Typography variant="h4" fontWeight="bold" color="#EF6C00">{monthlySummary.totalFreeMeals}</Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: alpha('#EF6C00', 0.18) }}><MoneyOffIcon sx={{ color: '#EF6C00' }} /></Avatar>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={1.5}>
                <Card sx={{ borderRadius: 3, bgcolor: '#ECEFF1', height: '100%' }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between">
                            <Box>
                                <Typography color="text.secondary" variant="caption" fontWeight="bold">GROSS COST</Typography>
                                <Typography variant="h5" fontWeight="bold" color="#455A64">৳{monthlySummary.totalGrossCost.toLocaleString()}</Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: alpha('#455A64', 0.18) }}><GrossIcon sx={{ color: '#455A64' }} /></Avatar>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={1.5}>
                <Card sx={{ borderRadius: 3, bgcolor: '#E0F2F1', height: '100%' }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between">
                            <Box>
                                <Typography color="text.secondary" variant="caption" fontWeight="bold">COST SAVED (FREE)</Typography>
                                <Typography variant="h5" fontWeight="bold" color="#00796B">৳{monthlySummary.totalFreeMealCostSaved.toLocaleString()}</Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: alpha('#00796B', 0.18) }}><SavingsIcon sx={{ color: '#00796B' }} /></Avatar>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={1.5}>
                <Card sx={{ borderRadius: 3, bgcolor: '#E8F5E9', height: '100%' }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between">
                            <Box>
                                <Typography color="text.secondary" variant="caption" fontWeight="bold">PAYABLE COST</Typography>
                                <Typography variant="h5" fontWeight="bold" color="#2E7D32">৳{monthlySummary.totalCost.toLocaleString()}</Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: alpha('#2E7D32', 0.18) }}><PayableIcon sx={{ color: '#2E7D32' }} /></Avatar>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={1.5}>
                <Card sx={{ borderRadius: 3, bgcolor: '#EDE7F6', height: '100%' }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between">
                            <Box>
                                <Typography color="text.secondary" variant="caption" fontWeight="bold">MEAL RATES (৳)</Typography>
                                <Typography variant="body2" fontWeight="bold" color="#5E35B1" sx={{ mt: 0.5 }}>
                                    B: {monthlySummary.mealRates.breakfast} &nbsp;|&nbsp; L: {monthlySummary.mealRates.lunch} &nbsp;|&nbsp; D: {monthlySummary.mealRates.dinner}
                                </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: alpha('#5E35B1', 0.18) }}><RateIcon sx={{ color: '#5E35B1' }} /></Avatar>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default MealStatsCards;

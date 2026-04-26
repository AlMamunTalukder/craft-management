// src/components/student/StudentMealAttendance.tsx
'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  alpha,
  useTheme,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Restaurant as FoodIcon,
  BreakfastDining as BreakfastIcon,
  LunchDining as LunchIcon,
  DinnerDining as DinnerIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import CraftTable, { Column, RowAction } from '@/components/Table';
import dayjs from 'dayjs';
import { StudentMealAttendanceProps } from '@/interface/meal';



const StudentMealAttendance: React.FC<StudentMealAttendanceProps> = ({ singleStudent }) => {
  const theme = useTheme();
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');
  const [mealTypeFilter, setMealTypeFilter] = useState<string>('all');

  const student = singleStudent?.data;
  const mealAttendances = student?.mealAttendances || [];
  const mealStats = student?.mealStatistics;


  const academicYears = useMemo(() => {
    const years = new Set(mealAttendances.map((att: any) => att.academicYear));
    return ['all', ...Array.from(years)];
  }, [mealAttendances]);

  const filteredAttendances = useMemo(() => {
    let filtered = [...mealAttendances];

    if (academicYearFilter !== 'all') {
      filtered = filtered.filter((att) => att.academicYear === academicYearFilter);
    }

    if (mealTypeFilter !== 'all') {
      filtered = filtered.filter((att) => {
        if (mealTypeFilter === 'breakfast') return att.breakfast;
        if (mealTypeFilter === 'lunch') return att.lunch;
        if (mealTypeFilter === 'dinner') return att.dinner;
        return true;
      });
    }

    return filtered;
  }, [mealAttendances, academicYearFilter, mealTypeFilter]);

  const formatDate = (date: string) => {
    return dayjs(date).format('DD MMM YYYY, dddd');
  };

  const renderMealStatus = (value: boolean) => {
    return value ? (
      <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
    ) : (
      <CancelIcon sx={{ color: '#f44336', fontSize: 20 }} />
    );
  };

  const columns: Column[] = useMemo(() => [
    {
      id: 'date',
      label: 'Date',
      minWidth: 150,
      sortable: true,
      render: (row: any) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {formatDate(row.date)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Month: {dayjs(row.date).format('MMMM YYYY')}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'breakfast',
      label: 'Breakfast',
      minWidth: 100,
      align: 'center',
      sortable: true,
      render: (row: any) => (
        <Box textAlign="center">
          {renderMealStatus(row.breakfast)}
          <Typography variant="caption" display="block">
            {row.breakfast ? 'Taken' : 'Not Taken'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'lunch',
      label: 'Lunch',
      minWidth: 100,
      align: 'center',
      sortable: true,
      render: (row: any) => (
        <Box textAlign="center">
          {renderMealStatus(row.lunch)}
          <Typography variant="caption" display="block">
            {row.lunch ? 'Taken' : 'Not Taken'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'dinner',
      label: 'Dinner',
      minWidth: 100,
      align: 'center',
      sortable: true,
      render: (row: any) => (
        <Box textAlign="center">
          {renderMealStatus(row.dinner)}
          <Typography variant="caption" display="block">
            {row.dinner ? 'Taken' : 'Not Taken'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'totalMeals',
      label: 'Total Meals',
      minWidth: 100,
      align: 'center',
      sortable: true,
      render: (row: any) => (
        <Chip
          label={`${row.totalMeals} Meal${row.totalMeals !== 1 ? 's' : ''}`}
          size="small"
          color={row.totalMeals === 3 ? 'success' : row.totalMeals > 0 ? 'warning' : 'error'}
          variant="filled"
        />
      ),
    },
    {
      id: 'mealCost',
      label: 'Cost',
      minWidth: 100,
      align: 'center',
      sortable: true,
      render: (row: any) => (
        <Typography variant="body2" fontWeight="bold" color="primary.main">
          ৳{row.mealCost || 0}
        </Typography>
      ),
    },
    {
      id: 'academicYear',
      label: 'Academic Year',
      minWidth: 120,
      align: 'center',
      sortable: true,
      render: (row: any) => (
        <Chip
          label={row.academicYear}
          size="small"
          variant="outlined"
        />
      ),
    },
  ], []);


  const rowActions: RowAction[] = useMemo(() => [], []);


  const StatisticsCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Meals
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {mealStats?.totalMeals || 0}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
              <FoodIcon />
            </Avatar>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Cost
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                ৳{mealStats?.totalCost || 0}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: theme.palette.success.main, width: 48, height: 48 }}>
              <MoneyIcon />
            </Avatar>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Present Days
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {mealStats?.totalPresentDays || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                / {((mealStats?.totalPresentDays || 0) + (mealStats?.totalAbsentDays || 0))} days
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: theme.palette.info.main, width: 48, height: 48 }}>
              <CalendarIcon />
            </Avatar>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Attendance Rate
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {mealStats?.attendanceRate || 0}%
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: theme.palette.warning.main, width: 48, height: 48 }}>
              <ReceiptIcon />
            </Avatar>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  const MealBreakdown = () => (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Meal Breakdown
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <BreakfastIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Breakfast</Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {mealStats?.totalBreakfast || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <LunchIcon sx={{ fontSize: 40, color: theme.palette.warning.main }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Lunch</Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {mealStats?.totalLunch || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <DinnerIcon sx={{ fontSize: 40, color: theme.palette.error.main }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Dinner</Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {mealStats?.totalDinner || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );

  const FilterToolbar = () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Academic Year</InputLabel>
        <Select
          value={academicYearFilter}
          label="Academic Year"
          onChange={(e) => setAcademicYearFilter(e.target.value)}
        >
          {academicYears.map((year) => (
            <MenuItem key={year} value={year}>
              {year === 'all' ? 'All Years' : year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Meal Type</InputLabel>
        <Select
          value={mealTypeFilter}
          label="Meal Type"
          onChange={(e) => setMealTypeFilter(e.target.value)}
        >
          <MenuItem value="all">All Meals</MenuItem>
          <MenuItem value="breakfast">Breakfast Only</MenuItem>
          <MenuItem value="lunch">Lunch Only</MenuItem>
          <MenuItem value="dinner">Dinner Only</MenuItem>
        </Select>
      </FormControl>

      {(academicYearFilter !== 'all' || mealTypeFilter !== 'all') && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setAcademicYearFilter('all');
            setMealTypeFilter('all');
          }}
        >
          Clear Filters
        </Button>
      )}
    </Box>
  );

  if (!mealAttendances.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <FoodIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No Meal Attendance Records Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This student hasn't taken any meals yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <StatisticsCards />
      <MealBreakdown />
      <FilterToolbar />
    
      <CraftTable
        columns={columns}
        data={filteredAttendances}
        rowActions={rowActions}
        selectable={false}
        searchable={true}
        sortable={true}
        pagination={true}
        serverSideSorting={false}
        emptyStateMessage="No meal attendance records found"
        idField="_id"
        defaultSortColumn="date"
        defaultSortDirection="desc"
        maxHeight="500px"
        stickyHeader={true}
        dense={false}
        striped={true}
        hover={true}
        showToolbar={false}
        showRowNumbers={true}
        rowNumberHeader="SL"
      />
    </Box>
  );
};

export default StudentMealAttendance;
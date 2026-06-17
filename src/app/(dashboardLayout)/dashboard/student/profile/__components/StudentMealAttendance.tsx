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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  AccountBalance as BalanceIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import CraftTable from '@/components/Table';
import dayjs from 'dayjs';
import { StudentMealAttendanceProps } from '@/interface/meal';
import { Column, RowAction } from '@/interface/table';

const StudentMealAttendance: React.FC<StudentMealAttendanceProps> = ({ singleStudent }) => {
  const theme = useTheme();
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');
  const [mealTypeFilter, setMealTypeFilter] = useState<string>('all');

  const student = singleStudent?.data;
  const mealAttendances = student?.mealAttendances || [];
  const mealStats = student?.mealStatistics;
  const mealCurrentBalance = student?.mealCurrentBalance || 0;

  // Fix: Correctly access mealBalance history
  const mealBalanceHistory = student?.mealBalance?.history || [];
  const studentCategory = student?.category || 'Residential';

  // Debug logs
  console.log('Student object:', student);
  console.log('mealBalance:', student?.mealBalance);
  console.log('mealBalanceHistory:', mealBalanceHistory);
  console.log('History length:', mealBalanceHistory.length);

  // Sort history by month (newest first)
  const sortedHistory = useMemo(() => {
    const history = [...mealBalanceHistory];
    console.log('Sorting history:', history);
    return history.sort((a, b) => {
      if (a.month > b.month) return -1;
      if (a.month < b.month) return 1;
      return 0;
    });
  }, [mealBalanceHistory]);

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
      label: 'Cost (৳)',
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

  // Current Balance Card
  const CurrentBalanceCard = () => (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.dark, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 56, height: 56 }}>
            <BalanceIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Current Meal Balance
            </Typography>
            <Typography variant="h3" fontWeight="bold" color="secondary.main">
              ৳{mealCurrentBalance.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Available for future months
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={1}>
          <Chip
            label={studentCategory}
            color="primary"
            variant="filled"
            size="medium"
          />
          {mealCurrentBalance > 0 && (
            <Chip
              label="Advance Available"
              color="success"
              icon={<CheckCircleIcon />}
              variant="filled"
            />
          )}
          {mealCurrentBalance < 0 && (
            <Chip
              label="Due Balance"
              color="error"
              icon={<CancelIcon />}
              variant="filled"
            />
          )}
        </Box>
      </Box>
    </Paper>
  );

  // Complete Balance History Table
  const BalanceHistoryTable = () => {
    console.log('Rendering BalanceHistoryTable, history length:', sortedHistory.length);

    if (sortedHistory.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <HistoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No balance history available
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Debug: History data is {!mealBalanceHistory ? 'undefined' : `present but length is ${mealBalanceHistory.length}`}
          </Typography>
        </Paper>
      );
    }

    return (
      <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box display="flex" alignItems="center" gap={1}>
            <HistoryIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Complete Meal Balance History
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Monthly breakdown of meal balances, advances, and actual costs
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell><strong>Month</strong></TableCell>
                <TableCell align="right"><strong>Opening Balance (৳)</strong></TableCell>
                <TableCell align="right"><strong>Advance Bill (৳)</strong></TableCell>
                <TableCell align="right"><strong>Actual Cost (৳)</strong></TableCell>
                <TableCell align="right"><strong>Closing Balance (৳)</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedHistory.map((history: any, index: number) => {
                const isPositiveBalance = history.closingBalance > 0;
                const isNegativeBalance = history.closingBalance < 0;

                return (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {history.monthName} {history.academicYear}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {history.month}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        ৳{history.openingBalance.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium" color="success.main">
                        + ৳{history.advanceBill.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium" color="error.main">
                        - ৳{history.actualCost.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                        <Typography variant="body2" fontWeight="bold" color={isPositiveBalance ? 'success.main' : isNegativeBalance ? 'error.main' : 'text.primary'}>
                          ৳{history.closingBalance.toLocaleString()}
                        </Typography>
                        {isPositiveBalance && <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />}
                        {isNegativeBalance && <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {history.closingBalance > 0 ? (
                        <Chip label="Advance Remaining" size="small" color="success" variant="outlined" />
                      ) : history.closingBalance < 0 ? (
                        <Chip label="Due Balance" size="small" color="error" variant="outlined" />
                      ) : (
                        <Chip label="Settled" size="small" color="default" variant="outlined" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  // Detailed Monthly History Cards
  const MonthlyHistoryCards = () => {
    if (sortedHistory.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="primary" />
          Monthly Breakdown
        </Typography>
        <Grid container spacing={2}>
          {sortedHistory.map((history: any, index: number) => (
            <Grid item xs={12} md={6} key={index}>
              <Accordion
                sx={{
                  borderRadius: 2,
                  '&:before': { display: 'none' },
                  boxShadow: theme.shadows[1],
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {history.monthName} {history.academicYear}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {history.month}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        label={`Meals: ${history.feeId?.mealCount || 0}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="h6" fontWeight="bold" color={history.closingBalance > 0 ? 'success.main' : history.closingBalance < 0 ? 'error.main' : 'text.primary'}>
                        ৳{history.closingBalance}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ bgcolor: alpha(theme.palette.grey[500], 0.05), p: 2, borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Opening Balance</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ৳{history.openingBalance}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Advance Bill</Typography>
                        <Typography variant="body1" fontWeight="bold" color="success.main">
                          + ৳{history.advanceBill}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Actual Cost</Typography>
                        <Typography variant="body1" fontWeight="bold" color="error.main">
                          - ৳{history.actualCost}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Closing Balance</Typography>
                        <Typography variant="body1" fontWeight="bold" color={history.closingBalance > 0 ? 'success.main' : 'error.main'}>
                          ৳{history.closingBalance}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
                          <Typography variant="caption" color="text.secondary">
                            Meal Count: <strong>{history.feeId?.mealCount || 0}</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Meal Rate: <strong>৳55/meal</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total Amount: <strong>৳{history.feeId?.amount || 0}</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Status: <Chip label={history.feeId?.status || 'N/A'} size="small" color={history.feeId?.status === 'paid' ? 'success' : 'warning'} sx={{ height: 20, fontSize: '10px' }} />
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const StatisticsCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={2.4}>
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

      <Grid item xs={12} sm={6} md={2.4}>
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

      <Grid item xs={12} sm={6} md={2.4}>
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

      <Grid item xs={12} sm={6} md={2.4}>
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

      <Grid item xs={12} sm={6} md={2.4}>
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Current Balance
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="secondary.main">
                ৳{mealCurrentBalance}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 48, height: 48 }}>
              <BalanceIcon />
            </Avatar>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  const MealBreakdown = () => (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Meal Breakdown by Type
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
        {mealCurrentBalance > 0 && (
          <Typography variant="body2" color="secondary.main" sx={{ mt: 2 }}>
            Current Meal Balance: ৳{mealCurrentBalance}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <CurrentBalanceCard />
      <StatisticsCards />
      <BalanceHistoryTable />
      <MonthlyHistoryCards />
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
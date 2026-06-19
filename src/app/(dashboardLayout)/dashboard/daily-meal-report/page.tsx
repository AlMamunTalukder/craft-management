/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem,
  Button, Card, CardContent, alpha, useTheme, Skeleton, Avatar, Divider, Chip,
  Tabs, Tab,
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon, Restaurant as FoodIcon, Person as PersonIcon,
  CalendarMonth as CalendarIcon, Today as TodayIcon,
  Add, MoneyOff as MoneyOffIcon, Savings as SavingsIcon,
  School as SchoolIcon, Group as GroupIcon, Engineering as StaffIcon,
  AttachMoney as RateIcon, ReceiptLong as GrossIcon, Payments as PayableIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useGetMonthlyAttendanceSheetQuery, useDeleteMonthlyAttendanceMutation } from '@/redux/api/mealAttendanceApi';
import { useAcademicOption } from '@/hooks/useAcademicOption';
import CraftTable from '@/components/Table';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { Column } from '@/interface/table';

type PersonType = 'student' | 'teacher' | 'staff';

const TAB_COLORS: Record<PersonType, string> = {
  student: '#1976d2',
  teacher: '#7b1fa2',
  staff: '#2e7d32',
};

const PERSON_LABELS: Record<PersonType, string> = {
  student: 'Students',
  teacher: 'Teachers',
  staff: 'Staff',
};

const DEFAULT_MEAL_RATES = { breakfast: 40, lunch: 45, dinner: 80 };

const MealAttendanceList: React.FC<any> = ({ academicYear = dayjs().year().toString() }) => {
  const theme = useTheme();
  const { classData } = useAcademicOption();
  const router = useRouter();
  const [deleteMonthly] = useDeleteMonthlyAttendanceMutation();

  // State
  const [personType, setPersonType] = useState<PersonType>('student');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());

  // Extract Classes
  const allClasses = useMemo((): { classes: any[] } => {
    const defaultReturn = { classes: [] };
    try {
      if (classData?.data?.data?.classes) return { classes: classData.data.data.classes };
      else if (classData?.data?.classes) return { classes: classData.data.classes };
      else if (classData?.classes) return { classes: classData.classes };
      else if (Array.isArray(classData)) return { classes: classData };
      return defaultReturn;
    } catch (error) {
      return defaultReturn;
    }
  }, [classData]);

  const classDropdownOptions = useMemo(() => {
    if (!allClasses.classes || allClasses.classes.length === 0) return [];
    return [
      { label: 'All Classes', value: 'ALL' },
      ...allClasses.classes.map((cls: any) => ({
        label: cls.className,
        value: cls.className,
      }))
    ];
  }, [allClasses]);

  // ── Tab change ──
  const handlePersonTypeChange = (_: any, val: PersonType | null) => {
    if (!val) return;
    setPersonType(val);
    setSelectedClassId('ALL'); // reset class filter when leaving students
  };

  // API Call — now personType-aware
  const classNameQuery = personType === 'student' && selectedClassId !== 'ALL' ? selectedClassId : undefined;

  const {
    data: monthlyStats,
    isLoading: isLoadingStats,
    refetch,
  } = useGetMonthlyAttendanceSheetQuery(
    {
      personType,
      className: classNameQuery,
      month: selectedMonth.format('YYYY-MM'),
      academicYear,
    },
    { skip: !selectedMonth }
  );

  const monthlySummary = useMemo(() => {
    const statsData = monthlyStats?.data || monthlyStats;
    if (!statsData) return {
      totalStudents: 0,
      totalMeals: 0,
      totalGrossCost: 0,
      totalCost: 0,
      totalBreakfast: 0,
      totalLunch: 0,
      totalDinner: 0,
      totalFreeMeals: 0,
      totalFreeMealCostSaved: 0,
      mealRates: DEFAULT_MEAL_RATES,
    };
    return {
      totalStudents: statsData.totalStudents || 0,
      totalMeals: statsData.grandTotalMeals || 0,
      totalGrossCost: statsData.grandTotalGrossCost || 0,
      totalCost: statsData.grandTotalCost || 0, // payable
      totalBreakfast: statsData.grandTotalBreakfast || 0,
      totalLunch: statsData.grandTotalLunch || 0,
      totalDinner: statsData.grandTotalDinner || 0,
      totalFreeMeals: statsData.grandTotalFreeMeals || 0,
      totalFreeMealCostSaved: statsData.grandTotalFreeMealCostSaved || 0,
      mealRates: statsData.mealRates || DEFAULT_MEAL_RATES,
    };
  }, [monthlyStats]);

  const todayStats = useMemo(() => {
    const statsData = monthlyStats?.data || monthlyStats;
    const todayDate = dayjs().format('YYYY-MM-DD');
    const todayEntry = statsData?.dailyTotals?.find((d: any) => d.date === todayDate);
    if (!todayEntry) return { date: todayDate, totalMeals: 0, grossCost: 0, totalCost: 0, totalBreakfast: 0, totalLunch: 0, totalDinner: 0, totalFreeMeals: 0, freeMealCostSaved: 0, found: false };
    return { ...todayEntry, found: true };
  }, [monthlyStats]);

  const dailyTableData = useMemo(() => monthlyStats?.data?.dailyTotals || monthlyStats?.dailyTotals || [], [monthlyStats]);

  // Handlers — pass personType through to the update page
  const handleEdit = useCallback(() => {
    const classNameToSend = personType === 'student' && selectedClassId !== 'ALL' ? selectedClassId : '';
    const params = new URLSearchParams({
      personType,
      className: classNameToSend,
      month: selectedMonth.format('YYYY-MM'),
      academicYear,
      mode: 'monthly-update',
    });
    router.push(`/dashboard/daily-meal-report/update?${params.toString()}`);
  }, [router, personType, selectedClassId, selectedMonth, academicYear]);

  const handleDelete = useCallback(async () => {
    const classText =
      personType !== 'student'
        ? PERSON_LABELS[personType]
        : selectedClassId === 'ALL' ? 'ALL CLASSES' : `Class: ${selectedClassId}`;

    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `Delete all meal records for <strong>${classText}</strong> in <strong>${selectedMonth.format('MMMM YYYY')}</strong>?<br/><br/>This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const payload: any = {
          personType,
          month: selectedMonth.format('YYYY-MM'),
          academicYear,
        };

        if (personType === 'student' && selectedClassId !== 'ALL') {
          payload.className = selectedClassId;
        }

        await deleteMonthly(payload).unwrap();

        Swal.fire('Deleted!', 'Monthly attendance has been deleted.', 'success');
        refetch();
      } catch (error: any) {
        Swal.fire('Error!', error?.data?.message || 'Failed to delete', 'error');
      }
    }
  }, [deleteMonthly, personType, selectedClassId, selectedMonth, academicYear, refetch]);

  const handleMonthChange = useCallback((newValue: Dayjs | null) => {
    if (newValue) setSelectedMonth(newValue);
  }, []);

  const handleClassChange = useCallback((e: any) => setSelectedClassId(e.target.value), []);

  const columns: Column[] = useMemo(() => [
    {
      id: 'date', label: 'Date', minWidth: 150, sortable: true,
      render: (row: any) => {
        const isToday = row.date === dayjs().format('YYYY-MM-DD');
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarIcon fontSize="small" color={isToday ? "primary" : "disabled"} />
            <Typography variant="body2" fontWeight={isToday ? "bold" : "normal"}>
              {dayjs(row.date).format('DD MMM YYYY')}
              {isToday && <Chip label="Today" size="small" color="primary" sx={{ ml: 1 }} />}
            </Typography>
          </Box>
        );
      },
    },
    { id: 'totalBreakfast', label: 'Breakfast', minWidth: 100, align: 'center', render: (r: any) => <Chip label={r.totalBreakfast} size="small" variant="outlined" color="info" /> },
    { id: 'totalLunch', label: 'Lunch', minWidth: 100, align: 'center', render: (r: any) => <Chip label={r.totalLunch} size="small" variant="outlined" color="secondary" /> },
    { id: 'totalDinner', label: 'Dinner', minWidth: 100, align: 'center', render: (r: any) => <Chip label={r.totalDinner} size="small" variant="outlined" color="error" /> },
    { id: 'totalMeals', label: 'Total Meals', minWidth: 120, align: 'center', render: (r: any) => <Typography variant="body2" fontWeight="bold">{r.totalMeals}</Typography> },
    { id: 'totalFreeMeals', label: 'Free Meals', minWidth: 100, align: 'center', render: (r: any) => <Chip label={r.totalFreeMeals || 0} size="small" variant="outlined" color="warning" /> },
    {
      id: 'grossCost', label: 'Gross Cost (BDT)', minWidth: 130, align: 'right',
      render: (r: any) => <Typography variant="body2" color="text.secondary">৳{(r.grossCost || 0).toLocaleString()}</Typography>,
    },
    {
      id: 'freeMealCostSaved', label: 'Free Saved (BDT)', minWidth: 130, align: 'right',
      render: (r: any) => <Typography variant="body2" color="#00796B" fontWeight="bold">৳{(r.freeMealCostSaved || 0).toLocaleString()}</Typography>,
    },
    {
      id: 'totalCost', label: 'Payable (BDT)', minWidth: 130, align: 'right',
      render: (r: any) => <Typography variant="body2" color="success.main" fontWeight="bold">৳{(r.totalCost || 0).toLocaleString()}</Typography>,
    },
  ], []);

  const tabColor = TAB_COLORS[personType];

  // Stats Component
  const MonthlyStatsCards = () => {
    if (isLoadingStats) return <Grid container spacing={3} sx={{ mb: 3 }}><Skeleton variant="rectangular" height={100} /></Grid>;
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4} lg={1.5}>
          <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, height: '100%' }}>
            <CardContent><Box display="flex" justifyContent="space-between"><Box><Typography color="text.secondary" variant="caption" fontWeight="bold">TOTAL {PERSON_LABELS[personType].toUpperCase()}</Typography><Typography variant="h4" fontWeight="bold" color="primary.main">{monthlySummary.totalStudents}</Typography></Box><Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2) }}><PersonIcon sx={{ color: theme.palette.primary.main }} /></Avatar></Box></CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={1.5}>
          <Card sx={{ borderRadius: 3, bgcolor: alpha('#ED6C02', 0.1), border: `1px solid ${alpha('#ED6C02', 0.2)}`, height: '100%' }}>
            <CardContent><Box display="flex" justifyContent="space-between"><Box><Typography color="text.secondary" variant="caption" fontWeight="bold">MONTHLY MEALS</Typography><Typography variant="h4" fontWeight="bold" color="#ED6C02">{monthlySummary.totalMeals}</Typography></Box><Avatar sx={{ bgcolor: alpha('#ED6C02', 0.2) }}><FoodIcon sx={{ color: '#ED6C02' }} /></Avatar></Box></CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={1.5}><Card sx={{ borderRadius: 3, bgcolor: '#E8F5E9', height: '100%' }}><CardContent><Typography color="text.secondary" variant="caption" fontWeight="bold">BREAKFAST</Typography><Typography variant="h4" fontWeight="bold" color="#2E7D32">{monthlySummary.totalBreakfast}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={4} lg={1.5}><Card sx={{ borderRadius: 3, bgcolor: '#F3E5F5', height: '100%' }}><CardContent><Typography color="text.secondary" variant="caption" fontWeight="bold">LUNCH</Typography><Typography variant="h4" fontWeight="bold" color="#9C27B0">{monthlySummary.totalLunch}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={4} lg={1.5}><Card sx={{ borderRadius: 3, bgcolor: '#FFEBEE', height: '100%' }}><CardContent><Typography color="text.secondary" variant="caption" fontWeight="bold">DINNER</Typography><Typography variant="h4" fontWeight="bold" color="#D32F2F">{monthlySummary.totalDinner}</Typography></CardContent></Card></Grid>

        <Grid item xs={12} sm={6} md={4} lg={1.5}>
          <Card sx={{ borderRadius: 3, bgcolor: '#FFF3E0', height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="caption" fontWeight="bold">FREE MEALS</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#EF6C00">{monthlySummary.totalFreeMeals}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#EF6C00', 0.2) }}><MoneyOffIcon sx={{ color: '#EF6C00' }} /></Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gross Cost — total as if NOTHING were free */}
        <Grid item xs={12} sm={6} md={4} lg={1.5}>
          <Card sx={{ borderRadius: 3, bgcolor: '#ECEFF1', height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="caption" fontWeight="bold">GROSS COST</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#455A64">৳{monthlySummary.totalGrossCost.toLocaleString()}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#455A64', 0.2) }}><GrossIcon sx={{ color: '#455A64' }} /></Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Free Meal Cost Saved */}
        <Grid item xs={12} sm={6} md={4} lg={1.5}>
          <Card sx={{ borderRadius: 3, bgcolor: '#E0F2F1', height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="caption" fontWeight="bold">COST SAVED (FREE)</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#00796B">৳{monthlySummary.totalFreeMealCostSaved.toLocaleString()}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#00796B', 0.2) }}><SavingsIcon sx={{ color: '#00796B' }} /></Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payable Cost — actual amount to be charged */}
        <Grid item xs={12} sm={6} md={4} lg={1.5}>
          <Card sx={{ borderRadius: 3, bgcolor: '#E8F5E9', height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="caption" fontWeight="bold">PAYABLE COST</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#2E7D32">৳{monthlySummary.totalCost.toLocaleString()}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#2E7D32', 0.2) }}><PayableIcon sx={{ color: '#2E7D32' }} /></Avatar>
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
                <Avatar sx={{ bgcolor: alpha('#5E35B1', 0.2) }}><RateIcon sx={{ color: '#5E35B1' }} /></Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}><Typography variant="h5" fontWeight="bold" color="primary.main">Meal Attendance Dashboard</Typography></Grid>
            <Grid item xs={12} md={8}>
              <Box display="flex" gap={2} justifyContent="flex-end" flexWrap="wrap">
                {personType === 'student' && (
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Class</InputLabel>
                    <Select value={selectedClassId} label="Class" onChange={handleClassChange}>
                      {classDropdownOptions?.map((o: any) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
                <DatePicker label="Select Month" views={['year', 'month']} value={selectedMonth} onChange={handleMonthChange} maxDate={dayjs()} slotProps={{ textField: { size: 'small', sx: { minWidth: 180 } } }} />
                <Button variant="contained" onClick={() => refetch()} disabled={isLoadingStats}>Refresh</Button>
              </Box>
            </Grid>
          </Grid>

          {/* ── Person Type Tabs ── */}
          <Box sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 1 }}>
            <Tabs
              value={personType}
              onChange={handlePersonTypeChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                minHeight: 44,
                '& .MuiTab-root': { fontWeight: 600, minHeight: 44 },
                '& .Mui-selected': { color: tabColor },
                '& .MuiTabs-indicator': { bgcolor: tabColor },
              }}
            >
              <Tab value="student" label="Students" icon={<SchoolIcon fontSize="small" />} iconPosition="start" sx={{ color: TAB_COLORS.student }} />
              <Tab value="teacher" label="Teachers" icon={<GroupIcon fontSize="small" />} iconPosition="start" sx={{ color: TAB_COLORS.teacher }} />
              <Tab value="staff" label="Staff" icon={<StaffIcon fontSize="small" />} iconPosition="start" sx={{ color: TAB_COLORS.staff }} />
            </Tabs>
          </Box>
        </Paper>

        <MonthlyStatsCards />

        {/* Formula caption — explains the relationship between the three cost cards */}
        <Box sx={{ mb: 3, px: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Gross Cost = Payable Cost + Cost Saved (Free) &nbsp;•&nbsp;
            Payable Cost = Gross Cost − Cost Saved (Free) &nbsp;•&nbsp;
            Cost Saved (Free) = total value of meals marked as free
          </Typography>
        </Box>

        {todayStats.found && !isLoadingStats && (
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#E3F2FD', border: '1px solid #90CAF9' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={1}><TodayIcon color="primary" /><Typography variant="h6" fontWeight="bold" color="primary.dark">Today: {dayjs().format('DD MMM YYYY')}</Typography></Box>
              <Box display="flex" gap={3} flexWrap="wrap">
                <Box textAlign="center"><Typography variant="caption">Total Meals</Typography><Typography variant="h6" fontWeight="bold">{todayStats.totalMeals}</Typography></Box>
                <Divider orientation="vertical" flexItem />
                <Box textAlign="center"><Typography variant="caption">Breakfast</Typography><Typography variant="h6" fontWeight="bold" color="#2E7D32">{todayStats.totalBreakfast}</Typography></Box>
                <Box textAlign="center"><Typography variant="caption">Lunch</Typography><Typography variant="h6" fontWeight="bold" color="#9C27B0">{todayStats.totalLunch}</Typography></Box>
                <Box textAlign="center"><Typography variant="caption">Dinner</Typography><Typography variant="h6" fontWeight="bold" color="#D32F2F">{todayStats.totalDinner}</Typography></Box>
                <Divider orientation="vertical" flexItem />
                <Box textAlign="center"><Typography variant="caption">Free Meals</Typography><Typography variant="h6" fontWeight="bold" color="#EF6C00">{todayStats.totalFreeMeals || 0}</Typography></Box>
                <Box textAlign="center"><Typography variant="caption">Gross Cost</Typography><Typography variant="h6" fontWeight="bold" color="#455A64">৳{(todayStats.grossCost || 0).toLocaleString()}</Typography></Box>
                <Box textAlign="center"><Typography variant="caption">Saved</Typography><Typography variant="h6" fontWeight="bold" color="#00796B">৳{(todayStats.freeMealCostSaved || 0).toLocaleString()}</Typography></Box>
                <Divider orientation="vertical" flexItem />
                <Box textAlign="center"><Typography variant="caption">Payable</Typography><Typography variant="h6" fontWeight="bold" color="#00838F">৳{(todayStats.totalCost || 0).toLocaleString()}</Typography></Box>
              </Box>
            </Box>
          </Paper>
        )}

        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box p={2} bgcolor="white" borderBottom="1px solid #e0e0e0" display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Typography variant="h6" fontWeight="bold">
              Daily Breakdown — {PERSON_LABELS[personType]} — {selectedMonth.format('MMMM YYYY')}
            </Typography>
            <Box display="flex" gap={1}>
              <Button variant="contained" startIcon={<Add />} component={Link} href={`/dashboard/daily-meal-report/add?personType=${personType}`} color="primary" size="small">Add Meal Report</Button>
              <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit} color="primary" size="small" sx={{ bgcolor: tabColor }}>Edit Month</Button>
              <Button variant="outlined" startIcon={<DeleteIcon />} onClick={handleDelete} color="error" size="small">Delete Month</Button>
            </Box>
          </Box>
          <CraftTable columns={columns} data={dailyTableData} rowCount={dailyTableData.length} page={0} rowsPerPage={100} rowActions={[]} selectable={false} pagination={false} idField="date" stickyHeader dense />
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default MealAttendanceList;
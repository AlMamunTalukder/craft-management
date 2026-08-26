/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem,
  Button, Divider, Chip, Tabs, Tab,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon,
  CalendarMonth as CalendarIcon, Today as TodayIcon,
  Add,
  School as SchoolIcon, Group as GroupIcon, Engineering as StaffIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  useGetMonthlyAttendanceSheetQuery,
  useDeleteMonthlyAttendanceMutation,
  useGetCombinedMonthlySheetQuery,
} from '@/redux/api/mealAttendanceApi';
import { useAcademicOption } from '@/hooks/useAcademicOption';
import CraftTable from '@/components/Table';
import CombinedMealStatsSection from '@/components/dashboard/CombinedMealStatsSection';
import MealStatsCards from '@/components/dashboard/MealStatsCards';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { Column } from '@/interface/table';
import { PersonType } from '@/interface/meal';
import { DEFAULT_MEAL_RATES, PERSON_LABELS, TAB_COLORS } from '@/constant/meal';


const MealAttendanceList: React.FC<any> = ({ academicYear = dayjs().year().toString() }) => {
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

  // ── NEW: Combined (Student + Teacher + Staff) totals for the same month ──
  // className filter only applies to the student portion inside the combined sheet.
  const combinedClassName = selectedClassId !== 'ALL' ? selectedClassId : undefined;

  const {
    data: combinedStats,
    isLoading: isLoadingCombined,
    refetch: refetchCombined,
  } = useGetCombinedMonthlySheetQuery(
    {
      month: selectedMonth.format('YYYY-MM'),
      academicYear,
      className: combinedClassName,
    },
    { skip: !selectedMonth }
  );

  const combinedSummary = useMemo(() => {
    const c = combinedStats?.data || combinedStats;
    if (!c) return null;
    return {
      totalPersons: c.totalPersons || 0,
      totalMeals: c.grandTotalMeals || 0,
      totalGrossCost: c.grandTotalGrossCost || 0,
      totalCost: c.grandTotalCost || 0,
      totalBreakfast: c.grandTotalBreakfast || 0,
      totalLunch: c.grandTotalLunch || 0,
      totalDinner: c.grandTotalDinner || 0,
      totalFreeMeals: c.grandTotalFreeMeals || 0,
      totalFreeMealCostSaved: c.grandTotalFreeMealCostSaved || 0,
      byPersonType: c.byPersonType || null,
      today: c.today
        ? {
          totalPersons: c.today.totalPersons || 0,
          totalMeals: c.today.totalMeals || 0,
          totalGrossCost: c.today.totalGrossCost || c.today.grossCost || 0,
          totalCost: c.today.totalCost || 0,
          totalBreakfast: c.today.totalBreakfast || 0,
          totalLunch: c.today.totalLunch || 0,
          totalDinner: c.today.totalDinner || 0,
          totalFreeMeals: c.today.totalFreeMeals || 0,
          totalFreeMealCostSaved: c.today.totalFreeMealCostSaved || c.today.freeMealCostSaved || 0,
        }
        : null,
    };
  }, [combinedStats]);

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
        refetchCombined();
      } catch (error: any) {
        Swal.fire('Error!', error?.data?.message || 'Failed to delete', 'error');
      }
    }
  }, [deleteMonthly, personType, selectedClassId, selectedMonth, academicYear, refetch, refetchCombined]);

  const handleMonthChange = useCallback((newValue: Dayjs | null) => {
    if (newValue) setSelectedMonth(newValue);
  }, []);

  const handleClassChange = useCallback((e: any) => setSelectedClassId(e.target.value), []);

  const handleRefreshAll = useCallback(() => {
    refetch();
    refetchCombined();
  }, [refetch, refetchCombined]);

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
                <Button variant="contained" onClick={handleRefreshAll} disabled={isLoadingStats || isLoadingCombined}>Refresh</Button>
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
              <Tab value="student" label="All" icon={<SchoolIcon fontSize="small" />} iconPosition="start" sx={{ color: TAB_COLORS.student }} />
              <Tab value="student" label="Students" icon={<SchoolIcon fontSize="small" />} iconPosition="start" sx={{ color: TAB_COLORS.student }} />
              <Tab value="teacher" label="Teachers" icon={<GroupIcon fontSize="small" />} iconPosition="start" sx={{ color: TAB_COLORS.teacher }} />
              <Tab value="staff" label="Staff" icon={<StaffIcon fontSize="small" />} iconPosition="start" sx={{ color: TAB_COLORS.staff }} />
            </Tabs>
          </Box>
        </Paper>



        <MealStatsCards
          personType={personType}
          monthlySummary={monthlySummary}
          isLoadingStats={isLoadingStats}
        />



        {todayStats.found && !isLoadingStats && (
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 4,
              bgcolor: "#F8F5FC",
              border: "1px solid rgba(79,1,135,.08)",
              boxShadow: "0 8px 24px rgba(79,1,135,.08)",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={3}
              mb={3}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 45,
                    height: 45,
                  }}
                >
                  <TodayIcon />
                </Avatar>

                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Today's Meal Summary
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {dayjs().format("DD MMM YYYY")} • {PERSON_LABELS[personType]}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6} md={2}>
                <Box
                  sx={{
                    bgcolor: "#fff",
                    p: 2,
                    borderRadius: 3,
                    textAlign: "center",
                    border: "1px solid rgba(79,1,135,.08)",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    TOTAL MEALS
                  </Typography>

                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {todayStats.totalMeals}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} md={2}>
                <Box
                  sx={{
                    bgcolor: "#fff",
                    p: 2,
                    borderRadius: 3,
                    textAlign: "center",
                    border: "1px solid rgba(37,99,235,.1)",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    BREAKFAST
                  </Typography>

                  <Typography variant="h4" fontWeight={700} color="#2563EB">
                    {todayStats.totalBreakfast}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} md={2}>
                <Box
                  sx={{
                    bgcolor: "#fff",
                    p: 2,
                    borderRadius: 3,
                    textAlign: "center",
                    border: "1px solid rgba(79,1,135,.1)",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    LUNCH
                  </Typography>

                  <Typography variant="h4" fontWeight={700} color="#7B2CBF">
                    {todayStats.totalLunch}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} md={2}>
                <Box
                  sx={{
                    bgcolor: "#fff",
                    p: 2,
                    borderRadius: 3,
                    textAlign: "center",
                    border: "1px solid rgba(220,38,38,.1)",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    DINNER
                  </Typography>

                  <Typography variant="h4" fontWeight={700} color="#DC2626">
                    {todayStats.totalDinner}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} md={2}>
                <Box
                  sx={{
                    bgcolor: "#fff",
                    p: 2,
                    borderRadius: 3,
                    textAlign: "center",
                    border: "1px solid rgba(245,158,11,.1)",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    FREE MEALS
                  </Typography>

                  <Typography variant="h4" fontWeight={700} color="#F59E0B">
                    {todayStats.totalFreeMeals || 0}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} md={2}>
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg,#4F0187,#7B2CBF)",
                    color: "#fff",
                    p: 2,
                    borderRadius: 3,
                    textAlign: "center",
                    boxShadow: "0 10px 30px rgba(79,1,135,.2)",
                  }}
                >
                  <Typography variant="caption">
                    PAYABLE COST
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    ৳{(todayStats.totalCost || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "#fff",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Gross Cost
                  </Typography>

                  <Typography variant="h6" fontWeight={700}>
                    ৳{(todayStats.grossCost || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "#ECFDF5",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Saved From Free Meals
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="#059669"
                  >
                    ৳{(todayStats.freeMealCostSaved || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "#FFF7ED",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Meal Type
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {PERSON_LABELS[personType]}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
        <CombinedMealStatsSection
          isLoadingCombined={isLoadingCombined}
          combinedSummary={combinedSummary}
          selectedMonth={selectedMonth}
          combinedClassName={combinedClassName}
        />

        <Divider sx={{ mb: 3 }}>
          <Chip label={`${PERSON_LABELS[personType]} Breakdown`} sx={{ bgcolor: tabColor, color: 'white', fontWeight: 'bold' }} />
        </Divider>
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

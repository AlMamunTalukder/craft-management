/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Avatar,
  Card,
  CardContent,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Restaurant as FoodIcon,
  Person as PersonIcon,
  BreakfastDining as BreakfastIcon,
  LunchDining as LunchIcon,
  DinnerDining as DinnerIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useGetAllAttendanceRecordsQuery, useDeleteAttendanceMutation, useGetMonthlyAttendanceSheetQuery } from '@/redux/api/mealAttendanceApi';
import { useAcademicOption } from '@/hooks/useAcademicOption';
import CraftTable, { BulkAction, Column, RowAction } from '@/components/Table';
import AttendanceDetailsModal from './add/__components/AttendanceDetailsModal';
import { useRouter } from 'next/navigation';
import { AttendanceRecord, ClassItem } from '@/interface/meal';
import Swal from 'sweetalert2';

const MealAttendanceList: React.FC<any> = ({ academicYear = dayjs().year().toString() }) => {
  const theme = useTheme();
  const { classData } = useAcademicOption();
  const [deleteAttendance] = useDeleteAttendanceMutation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('One');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isClassOptionsLoaded, setIsClassOptionsLoaded] = useState(false);

  const allClasses = useMemo((): { classes: ClassItem[] } => {
    const defaultReturn = { classes: [] };
    try {
      if (classData?.data?.data?.classes) return { classes: classData.data.data.classes };
      else if (classData?.data?.classes) return { classes: classData.data.classes };
      else if (classData?.classes) return { classes: classData.classes };
      else if (Array.isArray(classData)) return { classes: classData };
      return defaultReturn;
    } catch (error) {
      console.error('Error extracting classes:', error);
      return defaultReturn;
    }
  }, [classData]);

  const classDropdownOptions = useMemo(() => {
    if (!allClasses.classes || allClasses.classes.length === 0) return [];
    return allClasses.classes.map((cls: ClassItem) => ({
      label: cls.className,
      value: cls.className,
    }));
  }, [allClasses]);

  // Set default class "One" when options are loaded
  useEffect(() => {
    if (classDropdownOptions.length > 0 && !isClassOptionsLoaded) {
      const hasOneClass = classDropdownOptions.some(option => option.value === 'One');
      if (hasOneClass) {
        setSelectedClassId('One');
      } else if (classDropdownOptions.length > 0) {
        setSelectedClassId(classDropdownOptions[0].value);
      }
      setIsClassOptionsLoaded(true);
    }
  }, [classDropdownOptions, isClassOptionsLoaded]);

  const getClassName = useCallback((classIds: string[] | any): string => {
    if (!classIds || !classIds.length || !allClasses.classes || allClasses.classes.length === 0) return 'N/A';
    if (Array.isArray(classIds) && classIds.length > 0) {
      const classObj = allClasses.classes.find((c: ClassItem) => c._id === classIds[0]);
      return classObj?.className || 'N/A';
    }
    if (typeof classIds === 'string') return classIds;
    return 'N/A';
  }, [allClasses]);

  // Fetch monthly statistics for cards
  const selectedClassName = selectedClassId;
  const currentMonth = selectedMonth?.format('YYYY-MM') || dayjs().format('YYYY-MM');

  const {
    data: monthlyStats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useGetMonthlyAttendanceSheetQuery(
    {
      className: selectedClassName || undefined,
      month: currentMonth,
      academicYear,
    },
    { skip: !selectedClassName }
  );

  // Extract stats from monthly data
  const statsData = monthlyStats?.data || monthlyStats;

  const monthlySummary = useMemo(() => {
    if (!statsData || !statsData.students) {
      return {
        totalStudents: 0,
        totalMeals: 0,
        totalCost: 0,
        totalBreakfast: 0,
        totalLunch: 0,
        totalDinner: 0,
        averagePerStudent: 0,
      };
    }

    let totalMeals = 0;
    let totalBreakfast = 0;
    let totalLunch = 0;
    let totalDinner = 0;

    statsData.students.forEach((student: any) => {
      if (student.attendance) {
        student.attendance.forEach((att: any) => {
          if (att.breakfast) totalBreakfast++;
          if (att.lunch) totalLunch++;
          if (att.dinner) totalDinner++;
          totalMeals += att.totalMeals || 0;
        });
      }
    });

    const totalCost = totalMeals * (statsData.mealRate || 55);
    const totalStudents = statsData.totalStudents || statsData.students?.length || 0;

    return {
      totalStudents,
      totalMeals,
      totalCost,
      totalBreakfast,
      totalLunch,
      totalDinner,
      averagePerStudent: totalStudents > 0 ? Math.round(totalMeals / totalStudents) : 0,
      mealRate: statsData.mealRate || 55,
    };
  }, [statsData]);

  // Refetch stats when class or month changes
  useEffect(() => {
    if (selectedClassName) {
      refetchStats();
    }
  }, [selectedClassName, currentMonth, academicYear, refetchStats]);

  const handleEdit = useCallback((row: AttendanceRecord) => {
    const student = row.student || {};
    const recordDate = dayjs(row.date);
    const month = recordDate.format('YYYY-MM');

    let classId = '';
    let classNameStr = '';

    if (Array.isArray(student.className) && student.className.length > 0) {
      const firstClass = student.className[0];
      if (typeof firstClass === 'object' && firstClass !== null) {
        classId = firstClass._id || '';
        classNameStr = firstClass.className || '';
      } else {
        classId = firstClass;
        const foundClass = allClasses.classes.find((c: ClassItem) => c._id === firstClass);
        classNameStr = foundClass?.className || '';
      }
    }

    const params = new URLSearchParams({
      classId,
      className: classNameStr,
      month,
      academicYear,
      mode: 'monthly-update',
    });

    router.push(`/dashboard/daily-meal-report/update?${params.toString()}`);
  }, [router, allClasses, academicYear]);

  const {
    data: attendanceData,
    isLoading,
    refetch,
  } = useGetAllAttendanceRecordsQuery({
    page,
    limit,
    search: searchTerm,
    className: selectedClassName,
    date: selectedDate?.format('YYYY-MM-DD') || '',
    month: selectedMonth?.format('YYYY-MM') || '',
    academicYear,
    sortColumn,
    sortDirection,
  });

  // ✅ Sweet Alert for delete confirmation
  const handleDelete = useCallback(async (row: AttendanceRecord) => {
    const student = row.student || {};
    const studentName = student?.name || 'this student';
    const date = dayjs(row.date).format('DD MMM YYYY');

    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete attendance record for <strong>${studentName}</strong> on <strong>${date}</strong>.<br/><br/>This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        htmlContainer: 'swal2-html-custom',
      },
    });

    if (result.isConfirmed) {
      try {
        await deleteAttendance(row._id).unwrap();

        await Swal.fire({
          title: 'Deleted!',
          html: `Attendance record for <strong>${studentName}</strong> has been deleted successfully.`,
          icon: 'success',
          confirmButtonColor: '#3085d6',
          timer: 2000,
          showConfirmButton: true,
        });

        refetch();
        refetchStats();
      } catch (error: any) {
        console.error('Delete failed:', error);
        await Swal.fire({
          title: 'Error!',
          html: `Failed to delete attendance record: <br/>${error?.data?.message || 'Unknown error occurred'}`,
          icon: 'error',
          confirmButtonColor: '#3085d6',
        });
      }
    }
  }, [deleteAttendance, refetch, refetchStats]);

  const handleView = useCallback((row: AttendanceRecord) => {
    setSelectedRecord(row);
    setViewModalOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    router.push('/dashboard/daily-meal-report/add');
  }, [router]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handleSort = useCallback((column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const columns: Column[] = useMemo(() => [
    {
      id: 'studentInfo',
      label: 'Student',
      minWidth: 250,
      sortable: true,
      render: (row: AttendanceRecord) => {
        const student = row.student || {};
        return (
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="bold">{student?.name || 'N/A'}</Typography>
              <Typography variant="caption" color="text.secondary">{student?.nameBangla || ''}</Typography>
              <Typography variant="caption" display="block" color="primary.main">
                ID: {student?.studentId || 'N/A'}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'studentClassRoll',
      label: 'Roll No',
      minWidth: 100,
      sortable: false,
      render: (row: AttendanceRecord) => {
        const student = row.student || {};
        return (
          <Chip
            label={student?.studentId || student?.studentClassRoll || 'N/A'}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        );
      },
    },
    {
      id: 'className',
      label: 'Class',
      minWidth: 120,
      sortable: false,
      render: (row: AttendanceRecord) => {
        const student = row.student || {};
        const className = getClassName(student?.className || []);
        return <Chip label={className} size="small" color="primary" variant="outlined" />;
      },
    },
    {
      id: 'date',
      label: 'Date',
      minWidth: 120,
      sortable: true,
      render: (row: AttendanceRecord) => (
        <Typography variant="body2">{dayjs(row.date).format('DD MMM YYYY')}</Typography>
      ),
    },
    { id: 'breakfast', label: 'Breakfast', minWidth: 100, align: 'center', sortable: true, type: 'boolean' },
    { id: 'lunch', label: 'Lunch', minWidth: 100, align: 'center', sortable: true, type: 'boolean' },
    { id: 'dinner', label: 'Dinner', minWidth: 100, align: 'center', sortable: true, type: 'boolean' },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      align: 'center',
      sortable: true,
      type: 'status',
      render: (row: AttendanceRecord) => {
        const total = [row.breakfast, row.lunch, row.dinner].filter(Boolean).length;
        let status = 'absent';
        let color: 'success' | 'warning' | 'error' = 'error';
        if (total === 3) { status = 'full day'; color = 'success'; }
        else if (total >= 1) { status = total === 2 ? 'partial' : 'single meal'; color = 'warning'; }
        return <Chip label={`${status} (${total})`} size="small" color={color} variant="filled" />;
      },
    },
  ], [theme, getClassName]);

  const rowActions: RowAction[] = useMemo(() => [
    {
      label: 'View',
      icon: <ViewIcon fontSize="small" />,
      onClick: handleView,
      color: 'info',
      tooltip: 'View Details',
      inMenu: false,
    },
    {
      label: 'Edit',
      icon: <EditIcon fontSize="small" />,
      onClick: handleEdit,
      color: 'warning',
      tooltip: 'Edit Full Month Record for This Class',
      inMenu: false,
    },
    {
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" />,
      onClick: handleDelete,
      color: 'error',
      tooltip: 'Delete Record',
      inMenu: true,
    },
  ], [handleView, handleEdit, handleDelete]);

  const bulkActions: BulkAction[] = useMemo(() => [
    {
      label: 'Delete Selected',
      icon: <DeleteIcon />,
      onClick: async (selectedRows) => {
        if (selectedRows.length === 0) return;

        const result = await Swal.fire({
          title: 'Are you sure?',
          html: `You are about to delete <strong>${selectedRows.length}</strong> attendance record(s).<br/><br/>This action cannot be undone!`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete them!',
          cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
          try {
            // Delete each selected record
            for (const row of selectedRows) {
              await deleteAttendance(row._id).unwrap();
            }

            await Swal.fire({
              title: 'Deleted!',
              html: `<strong>${selectedRows.length}</strong> attendance record(s) have been deleted successfully.`,
              icon: 'success',
              confirmButtonColor: '#3085d6',
              timer: 2000,
              showConfirmButton: true,
            });

            refetch();
            refetchStats();
          } catch (error: any) {
            await Swal.fire({
              title: 'Error!',
              html: `Failed to delete records: <br/>${error?.data?.message || 'Unknown error occurred'}`,
              icon: 'error',
              confirmButtonColor: '#3085d6',
            });
          }
        }
      },
      color: 'error',
      disabled: (selectedRows) => selectedRows.length === 0,
    },
    {
      label: 'Bulk Update Selected',
      icon: <EditIcon />,
      onClick: async (selectedRows) => {
        if (selectedRows.length === 0) return;
        const firstRow = selectedRows[0];
        const student = firstRow.student || {};
        const month = dayjs(firstRow.date).format('YYYY-MM');
        let classId = '';
        let classNameStr = '';
        if (Array.isArray(student.className) && student.className.length > 0) {
          const firstClass = student.className[0];
          if (typeof firstClass === 'object') {
            classId = firstClass._id || '';
            classNameStr = firstClass.className || '';
          } else {
            classId = firstClass;
            const foundClass = allClasses.classes.find((c: ClassItem) => c._id === firstClass);
            classNameStr = foundClass?.className || '';
          }
        }
        const params = new URLSearchParams({
          classId,
          className: classNameStr,
          month,
          academicYear,
          mode: 'monthly-update'
        });
        router.push(`/dashboard/daily-meal-report/update?${params.toString()}`);
      },
      color: 'primary',
      disabled: (selectedRows) => selectedRows.length === 0,
    },
  ], [router, allClasses, academicYear, deleteAttendance, refetch, refetchStats]);

  const records = attendanceData?.data?.data || [];
  const totalRecords = attendanceData?.data?.total || 0;

  const CustomFilters = () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Filter by Class</InputLabel>
        <Select
          value={selectedClassId}
          label="Filter by Class"
          onChange={(e) => { setSelectedClassId(e.target.value); setPage(1); }}
        >
          <MenuItem value="">All Classes</MenuItem>
          {classDropdownOptions?.map((option: any) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <DatePicker
        label="Filter by Date"
        value={selectedDate}
        onChange={(newValue) => { setSelectedDate(newValue); setSelectedMonth(null); setPage(1); }}
        slotProps={{ textField: { size: 'small', sx: { minWidth: 180 } } }}
      />

      <DatePicker
        label="Filter by Month"
        views={['year', 'month']}
        value={selectedMonth}
        onChange={(newValue) => { setSelectedMonth(newValue); setSelectedDate(null); setPage(1); }}
        slotProps={{ textField: { size: 'small', sx: { minWidth: 180 } } }}
      />

      {(selectedClassId !== 'One' || selectedDate || (selectedMonth && selectedMonth.format('YYYY-MM') !== dayjs().format('YYYY-MM'))) && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setSelectedClassId('One');
            setSelectedDate(null);
            setSelectedMonth(dayjs());
            setPage(1);
          }}
        >
          Reset to Default
        </Button>
      )}
    </Box>
  );

  // Stats Card Component
  const StatsCards = () => {
    if (!selectedClassId) {
      return (
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: '#fff3e0', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary">
            👈 Please select a class to view monthly statistics
          </Typography>
        </Paper>
      );
    }

    if (isLoadingStats) {
      return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Skeleton variant="rectangular" height={80} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Students */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ borderRadius: 3, bgcolor: '#E3F2FD' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">Total Students</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#1976D2">{monthlySummary.totalStudents}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#1976D2', 0.1), width: 48, height: 48 }}>
                  <PersonIcon sx={{ color: '#1976D2' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Meals */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ borderRadius: 3, bgcolor: '#FFF3E0' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">Total Meals</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#ED6C02">{monthlySummary.totalMeals}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#ED6C02', 0.1), width: 48, height: 48 }}>
                  <FoodIcon sx={{ color: '#ED6C02' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Breakfast */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ borderRadius: 3, bgcolor: '#E8F5E9' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">Breakfast</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#2E7D32">{monthlySummary.totalBreakfast}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#2E7D32', 0.1), width: 48, height: 48 }}>
                  <BreakfastIcon sx={{ color: '#2E7D32' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Lunch */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ borderRadius: 3, bgcolor: '#F3E5F5' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">Lunch</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#9C27B0">{monthlySummary.totalLunch}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#9C27B0', 0.1), width: 48, height: 48 }}>
                  <LunchIcon sx={{ color: '#9C27B0' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Dinner */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ borderRadius: 3, bgcolor: '#FFEBEE' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">Dinner</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#D32F2F">{monthlySummary.totalDinner}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#D32F2F', 0.1), width: 48, height: 48 }}>
                  <DinnerIcon sx={{ color: '#D32F2F' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Cost */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ borderRadius: 3, bgcolor: '#E0F7FA' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">Total Cost</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#00838F">৳{monthlySummary.totalCost.toLocaleString()}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    @ ৳{monthlySummary.mealRate}/meal
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#00838F', 0.1), width: 48, height: 48 }}>
                  <FoodIcon sx={{ color: '#00838F' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Average per Student */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ borderRadius: 3, bgcolor: '#FCE4EC' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">Avg Meals/Student</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#C2185B">{monthlySummary.averagePerStudent}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#C2185B', 0.1), width: 48, height: 48 }}>
                  <PersonIcon sx={{ color: '#C2185B' }} />
                </Avatar>
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
        {/* Month Info Header */}
        {selectedClassId && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: '#E8EAF6' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarIcon color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                Statistics for {selectedClassId} - {dayjs(currentMonth).format('MMMM YYYY')}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Stats Cards */}
        <StatsCards />

        {(selectedClassId !== 'One' || selectedDate || (selectedMonth && selectedMonth.format('YYYY-MM') !== dayjs().format('YYYY-MM'))) && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">Active Filters:</Typography>
              {selectedClassId && selectedClassId !== 'One' && <Chip label={`Class: ${selectedClassId}`} size="small" onDelete={() => setSelectedClassId('One')} />}
              {selectedDate && <Chip label={`Date: ${selectedDate.format('DD MMM YYYY')}`} size="small" onDelete={() => setSelectedDate(null)} />}
              {selectedMonth && selectedMonth.format('YYYY-MM') !== dayjs().format('YYYY-MM') && (
                <Chip label={`Month: ${selectedMonth.format('MMMM YYYY')}`} size="small" onDelete={() => setSelectedMonth(dayjs())} />
              )}
            </Box>
          </Paper>
        )}

        <CraftTable
          columns={columns}
          data={records}
          loading={isLoading}
          rowCount={totalRecords}
          page={page - 1}
          rowsPerPage={limit}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onAdd={handleAdd}
          onSearchChange={handleSearch}
          onSortChange={handleSort}
          rowActions={rowActions}
          bulkActions={bulkActions}
          selectable={true}
          searchable={true}
          filterable={false}
          sortable={true}
          pagination={true}
          serverSideSorting={true}
          emptyStateMessage="No attendance records found"
          idField="_id"
          defaultSortColumn="date"
          defaultSortDirection="desc"
          maxHeight="70vh"
          stickyHeader={true}
          dense={false}
          striped={true}
          hover={true}
          showToolbar={true}
          showRowNumbers={true}
          rowNumberHeader="SL"
          actionColumnWidth={150}
          actionMenuLabel="Actions"
          elevation={0}
          borderRadius={3}
          customToolbar={<CustomFilters />}
        />
        <AttendanceDetailsModal
          open={viewModalOpen}
          setOpen={setViewModalOpen}
          selectedRecord={selectedRecord}
          onDelete={handleDelete}
          getClassName={getClassName}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default MealAttendanceList;
// src/components/mealAttendance/MealAttendanceList.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Restaurant as FoodIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useGetAllAttendanceRecordsQuery, useDeleteAttendanceMutation } from '@/redux/api/mealAttendanceApi';
import { useAcademicOption } from '@/hooks/useAcademicOption';
import CraftTable, { BulkAction, Column, RowAction } from '@/components/Table';
import AttendanceDetailsModal from './add/__components/AttendanceDetailsModal';
import { useRouter } from 'next/navigation';
import { AttendanceRecord, ClassItem } from '@/interface/meal';

const MealAttendanceList: React.FC<any> = ({ academicYear = dayjs().year().toString() }) => {
  const theme = useTheme();
  const { classData } = useAcademicOption();
  const [deleteAttendance] = useDeleteAttendanceMutation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null);
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const allClasses = useMemo((): { classes: ClassItem[] } => {

    const defaultReturn = { classes: [] };
    
    try {

      if (classData?.data?.data?.classes) {
        return { classes: classData.data.data.classes };
      } else if (classData?.data?.classes) {
        return { classes: classData.data.classes };
      } else if (classData?.classes) {
        return { classes: classData.classes };
      } else if (Array.isArray(classData)) {
        return { classes: classData };
      }
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

  const getClassName = useCallback((classIds: string[] | any): string => {
    if (!classIds || !classIds.length || !allClasses.classes || allClasses.classes.length === 0) {
      return 'N/A';
    }
    
    if (Array.isArray(classIds) && classIds.length > 0) {
      const classObj = allClasses.classes.find((c: ClassItem) => c._id === classIds[0]);
      return classObj?.className || 'N/A';
    }
    if (typeof classIds === 'string') {
      return classIds;
    }
    
    return 'N/A';
  }, [allClasses]);

  const selectedClassName = selectedClassId;

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

  const handleDelete = useCallback(async (row: AttendanceRecord) => {
    try {
      await deleteAttendance(row._id).unwrap();
      refetch();
    } catch (error: any) {
      console.error('Delete failed:', error);
    }
  }, [deleteAttendance, refetch]);

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
              <Typography variant="body2" fontWeight="bold">
                {student?.name || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {student?.nameBangla || ''}
              </Typography>
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
        return (
          <Chip
            label={className}
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      },
    },
    {
      id: 'date',
      label: 'Date',
      minWidth: 120,
      sortable: true,
      render: (row: AttendanceRecord) => (
        <Typography variant="body2">
          {dayjs(row.date).format('DD MMM YYYY')}
        </Typography>
      ),
    },
    {
      id: 'breakfast',
      label: 'Breakfast',
      minWidth: 100,
      align: 'center',
      sortable: true,
      type: 'boolean',
    },
    {
      id: 'lunch',
      label: 'Lunch',
      minWidth: 100,
      align: 'center',
      sortable: true,
      type: 'boolean',
    },
    {
      id: 'dinner',
      label: 'Dinner',
      minWidth: 100,
      align: 'center',
      sortable: true,
      type: 'boolean',
    },
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
        
        if (total === 3) {
          status = 'full day';
          color = 'success';
        } else if (total === 2) {
          status = 'partial';
          color = 'warning';
        } else if (total === 1) {
          status = 'single meal';
          color = 'warning';
        } else {
          status = 'absent';
          color = 'error';
        }
        
        return (
          <Chip
            label={`${status} (${total})`}
            size="small"
            color={color}
            variant="filled"
          />
        );
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
      label: 'Delete',
      icon: <DeleteIcon fontSize="small" />,
      onClick: handleDelete,
      color: 'error',
      tooltip: 'Delete Record',
      inMenu: true,
    },
  ], [handleView, handleDelete]);

  const bulkActions: BulkAction[] = useMemo(() => [
    {
      label: 'Delete Selected',
      icon: <DeleteIcon />,
      onClick: async (selectedRows) => {
        console.log('Delete selected:', selectedRows);
      },
      color: 'error',
      disabled: (selectedRows) => selectedRows.length === 0,
    },
  ], []);

  const records = attendanceData?.data?.data || [];
  const totalRecords = attendanceData?.data?.total || 0;
  const stats = attendanceData?.data || {};

  const CustomFilters = () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Filter by Class</InputLabel>
        <Select
          value={selectedClassId}
          label="Filter by Class"
          onChange={(e) => {
            setSelectedClassId(e.target.value);
            setPage(1);
          }}
        >
          <MenuItem value="">All Classes</MenuItem>
          {classDropdownOptions?.map((option: any) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <DatePicker
        label="Filter by Date"
        value={selectedDate}
        onChange={(newValue) => {
          setSelectedDate(newValue);
          setSelectedMonth(null);
          setPage(1);
        }}
        slotProps={{ textField: { size: 'small', sx: { minWidth: 180 } } }}
      />

      <DatePicker
        label="Filter by Month"
        views={['year', 'month']}
        value={selectedMonth}
        onChange={(newValue) => {
          setSelectedMonth(newValue);
          setSelectedDate(null);
          setPage(1);
        }}
        slotProps={{ textField: { size: 'small', sx: { minWidth: 180 } } }}
      />

      {(selectedClassId || selectedDate || selectedMonth) && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setSelectedClassId('');
            setSelectedDate(null);
            setSelectedMonth(null);
            setPage(1);
          }}
        >
          Clear Filters
        </Button>
      )}
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
        {stats.total > 0 && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">Total Records</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#2196f3">
                        {stats.total || 0}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: alpha('#2196f3', 0.1), width: 48, height: 48 }}>
                      <FoodIcon sx={{ color: '#2196f3' }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">Total Students</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#4caf50">
                        {stats.uniqueStudents || 0}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: alpha('#4caf50', 0.1), width: 48, height: 48 }}>
                      <PersonIcon sx={{ color: '#4caf50' }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">Total Meals</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#ff9800">
                        {stats.totalMeals || 0}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: alpha('#ff9800', 0.1), width: 48, height: 48 }}>
                      <FoodIcon sx={{ color: '#ff9800' }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">Total Cost</Typography>
                      <Typography variant="h5" fontWeight="bold" color="#9c27b0">
                        ৳{stats.totalCost || 0}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: alpha('#9c27b0', 0.1), width: 48, height: 48 }}>
                      <FoodIcon sx={{ color: '#9c27b0' }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {(selectedClassId || selectedDate || selectedMonth) && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                Active Filters:
              </Typography>
              {selectedClassId && (
                <Chip 
                  label={`Class: ${selectedClassId}`} 
                  size="small" 
                  onDelete={() => setSelectedClassId('')}
                />
              )}
              {selectedDate && (
                <Chip 
                  label={`Date: ${selectedDate.format('DD MMM YYYY')}`} 
                  size="small" 
                  onDelete={() => setSelectedDate(null)}
                />
              )}
              {selectedMonth && (
                <Chip 
                  label={`Month: ${selectedMonth.format('MMMM YYYY')}`} 
                  size="small" 
                  onDelete={() => setSelectedMonth(null)}
                />
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
          actionColumnWidth={120}
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

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tooltip,
  Stack,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Menu,
} from '@mui/material';
import {
  Save as SaveIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  BreakfastDining as BreakfastIcon,
  LunchDining as LunchIcon,
  DinnerDining as DinnerIcon,
  Person as PersonIcon,
  Restaurant as FoodIcon,
  BarChart as ChartIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CalendarMonth as CalendarIcon,
  DateRange as DateRangeIcon,
  AddTask as AddTaskIcon,
  EditCalendar as EditCalendarIcon,
  Today as TodayIcon,
  Weekend as WeekendIcon,
  ViewWeek as ViewWeekIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { 
  useBulkCreateAttendanceMutation, 
  useGetMonthlyAttendanceSheetQuery, 
  useGetAttendanceByDateRangeQuery,
  useGetAttendanceBySpecificDateQuery 
} from '@/redux/api/mealAttendanceApi';
import { useAcademicOption } from '@/hooks/useAcademicOption';



interface Student {
  _id: string;
  studentId: string;
  name: string;
  nameBangla: string;
  studentClassRoll: string;
  studentType: string;
  className: Array<{ _id: string; className: string; [key: string]: any }>;
  admissionStatus: string;
  email?: string;
  mobile?: string;
  gender?: string;
}

interface ClassItem {
  _id: string;
  className: string;
  section?: string;
  [key: string]: any;
}
type ViewMode = 'monthly' | 'daterange' | 'specific';
type QuickRange = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';
const getCurrentAcademicYear = (): string => {
  return dayjs().year().toString();
};

const MealAttendanceManager: React.FC<any> = ({ academicYear = getCurrentAcademicYear() }) => {
  const { classOptions, classData, studentData } = useAcademicOption();
  const [bulkCreateAttendance, { isLoading: isSaving }] = useBulkCreateAttendanceMutation();
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf('week'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().endOf('week'));
  const [specificDate, setSpecificDate] = useState<Dayjs | null>(dayjs());
  const [viewMode, setViewMode] = useState<ViewMode>('daterange');
  const [attendanceChanges, setAttendanceChanges] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [localAttendanceData, setLocalAttendanceData] = useState<Record<string, any>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedDateForBulk, setSelectedDateForBulk] = useState<string | null>(null);
  const [quickRangeAnchorEl, setQuickRangeAnchorEl] = useState<null | HTMLElement>(null);
  const [openSpecificDateDialog, setOpenSpecificDateDialog] = useState(false);
  const [selectedSpecificDate, setSelectedSpecificDate] = useState<Dayjs | null>(dayjs());
  const [dateWiseAttendance, setDateWiseAttendance] = useState<Record<string, any>>({});
  const [quickSelectAll, setQuickSelectAll] = useState({ breakfast: false, lunch: false, dinner: false });

  const allStudents: Student[] = useMemo(() => {
    let students: any[] = [];
    
    if (studentData?.data?.data) {
      students = studentData.data.data;
    } else if (studentData?.data) {
      students = studentData.data;
    } else if (Array.isArray(studentData)) {
      students = studentData;
    } else {
      students = [];
    }
    
    return students.filter((student: any) => student.admissionStatus === 'enrolled');
  }, [studentData]);

  const allClasses = useMemo((): ClassItem[] => {
    let classes: any[] = [];
    
    if (classData?.data?.data?.classes) {
      classes = classData.data.data.classes;
    } else if (classData?.data?.classes) {
      classes = classData.data.classes;
    } else if (classData?.classes) {
      classes = classData.classes;
    } else if (classData?.data?.data) {
      classes = classData.data.data;
    } else if (classData?.data) {
      classes = classData.data;
    } else if (Array.isArray(classData)) {
      classes = classData;
    } else {
      classes = [];
    }
    
    return classes;
  }, [classData]);
  const classDropdownOptions = useMemo(() => {
    if (!allClasses || allClasses.length === 0) return [];
    return allClasses.map((cls: ClassItem) => ({
      label: cls.className,
      value: cls._id,
    }));
  }, [allClasses]);
  useEffect(() => {
    if (!isInitialized && classDropdownOptions.length > 0 && !selectedClassId) {
      const firstClass = classDropdownOptions[0];
      setSelectedClassId(firstClass.value);
      setIsInitialized(true);
    }
  }, [classDropdownOptions, selectedClassId, isInitialized]);

  const studentsByClass = useMemo(() => {
    if (!selectedClassId) return [];
    
    const filtered = allStudents.filter((student: Student) => {
      if (student.className && Array.isArray(student.className)) {
        return student.className.some((cls: any) => {
          const classId = cls._id || cls;
          return classId === selectedClassId;
        });
      }
      return false;
    });
    
    return filtered;
  }, [allStudents, selectedClassId]);

  // Get selected class name for API
  const selectedClassObj = allClasses.find((c: ClassItem) => c._id === selectedClassId);
  const className = selectedClassObj?.className || '';

  const handleQuickRangeSelect = (range: QuickRange) => {
    const today = dayjs();
    let newStartDate = dayjs();
    let newEndDate = dayjs();

    switch (range) {
      case 'today':
        newStartDate = today.startOf('day');
        newEndDate = today.endOf('day');
        break;
      case 'yesterday':
        newStartDate = today.subtract(1, 'day').startOf('day');
        newEndDate = today.subtract(1, 'day').endOf('day');
        break;
      case 'thisWeek':
        newStartDate = today.startOf('week');
        newEndDate = today.endOf('week');
        break;
      case 'lastWeek':
        newStartDate = today.subtract(1, 'week').startOf('week');
        newEndDate = today.subtract(1, 'week').endOf('week');
        break;
      case 'thisMonth':
        newStartDate = today.startOf('month');
        newEndDate = today.endOf('month');
        break;
      case 'lastMonth':
        newStartDate = today.subtract(1, 'month').startOf('month');
        newEndDate = today.subtract(1, 'month').endOf('month');
        break;
      default:
        return;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setAttendanceChanges({});
    setQuickRangeAnchorEl(null);
    
    setSnackbar({
      open: true,
      message: `Date range set to ${range}`,
      severity: 'success',
    });
  };

  const {
    data: monthlyAttendanceData,
    isLoading: isLoadingMonthly,
    refetch: refetchMonthly,
  } = useGetMonthlyAttendanceSheetQuery(
    {
      className: className,
      month: selectedMonth?.format('YYYY-MM') || '',
      academicYear,
    },
    { skip: viewMode !== 'monthly' || !className || !selectedMonth }
  );

  const {
    data: dateRangeAttendanceData,
    isLoading: isLoadingDateRange,
    refetch: refetchDateRange,
  } = useGetAttendanceByDateRangeQuery(
    {
      className: className,
      startDate: startDate?.format('YYYY-MM-DD') || '',
      endDate: endDate?.format('YYYY-MM-DD') || '',
      academicYear,
    },
    { skip: viewMode !== 'daterange' || !className || !startDate || !endDate }
  );

  const {
    data: specificDateData,
    isLoading: isLoadingSpecific,
    refetch: refetchSpecific,
  } = useGetAttendanceBySpecificDateQuery(
    {
      className: className,
      date: specificDate?.format('YYYY-MM-DD') || '',
      academicYear,
    },
    { skip: viewMode !== 'specific' || !className || !specificDate }
  );

  const isLoadingSheet = viewMode === 'monthly' 
    ? isLoadingMonthly 
    : viewMode === 'daterange' 
    ? isLoadingDateRange 
    : isLoadingSpecific;
    
  const attendanceSheetData = viewMode === 'monthly' 
    ? monthlyAttendanceData 
    : viewMode === 'daterange'
    ? dateRangeAttendanceData
    : specificDateData;

  const dates = useMemo(() => {
    if (attendanceSheetData?.dates && attendanceSheetData.dates.length > 0) {
      return attendanceSheetData.dates;
    }
    
    if (viewMode === 'monthly' && selectedMonth) {
      const startOfMonth = selectedMonth.startOf('month');
      const endOfMonth = selectedMonth.endOf('month');
      const datesList = [];
      let currentDate = startOfMonth;
      while (currentDate.isBefore(endOfMonth) || currentDate.isSame(endOfMonth, 'day')) {
        datesList.push(currentDate.format('YYYY-MM-DD'));
        currentDate = currentDate.add(1, 'day');
      }
      return datesList;
    }
    
    if (viewMode === 'daterange' && startDate && endDate) {
      const datesList = [];
      let currentDate = startDate.clone();
      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
        datesList.push(currentDate.format('YYYY-MM-DD'));
        currentDate = currentDate.add(1, 'day');
      }
      return datesList;
    }
    
    if (viewMode === 'specific' && specificDate) {
      return [specificDate.format('YYYY-MM-DD')];
    }
    
    return [];
  }, [attendanceSheetData, selectedMonth, startDate, endDate, viewMode, specificDate]);

  useEffect(() => {
    if (studentsByClass.length > 0 && dates.length > 0) {
      const initialData: Record<string, any> = {};
      
      if (attendanceSheetData?.students && attendanceSheetData.students.length > 0) {
        attendanceSheetData.students.forEach((apiStudent: any) => {
          if (apiStudent.attendance && Array.isArray(apiStudent.attendance)) {
            apiStudent.attendance.forEach((att: any) => {
              const key = `${apiStudent.student.id}_${att.date}`;
              initialData[key] = {
                breakfast: att.breakfast,
                lunch: att.lunch,
                dinner: att.dinner,
              };
            });
          }
        });
      }
      
      studentsByClass.forEach((student: Student) => {
        dates.forEach((date: string) => {
          const key = `${student._id}_${date}`;
          if (!initialData[key]) {
            initialData[key] = {
              breakfast: false,
              lunch: false,
              dinner: false,
            };
          }
        });
      });
      
      setLocalAttendanceData(initialData);
      
      // For specific date view, also populate dateWiseAttendance
      if (viewMode === 'specific' && dates[0]) {
        const dateAttendance: Record<string, any> = {};
        studentsByClass.forEach((student: Student) => {
          const key = `${student._id}_${dates[0]}`;
          dateAttendance[student._id] = {
            studentId: student._id,
            studentName: student.name,
            roll: student.studentClassRoll,
            breakfast: initialData[key]?.breakfast || false,
            lunch: initialData[key]?.lunch || false,
            dinner: initialData[key]?.dinner || false,
          };
        });
        setDateWiseAttendance(dateAttendance);
      }
    }
  }, [attendanceSheetData, studentsByClass, dates, viewMode]);

  // Get meal status
  const getMealStatus = useCallback((studentId: string, date: string, mealType: string) => {
    const changeKey = `${studentId}_${date}`;
    if (attendanceChanges[changeKey] && mealType in attendanceChanges[changeKey]) {
      return attendanceChanges[changeKey][mealType];
    }
    return localAttendanceData[`${studentId}_${date}`]?.[mealType] || false;
  }, [attendanceChanges, localAttendanceData]);

  // Get total meals for a day
  const getTotalMealsForDay = useCallback((studentId: string, date: string) => {
    let total = 0;
    if (getMealStatus(studentId, date, 'breakfast')) total++;
    if (getMealStatus(studentId, date, 'lunch')) total++;
    if (getMealStatus(studentId, date, 'dinner')) total++;
    return total;
  }, [getMealStatus]);

  // Get total meals for a student
  const getTotalMealsForStudent = useCallback((studentId: string) => {
    let total = 0;
    dates.forEach((date:any) => { total += getTotalMealsForDay(studentId, date) });
    return total;
  }, [dates, getTotalMealsForDay]);

  // Handle meal toggle
  const handleMealToggle = (studentId: string, date: string, mealType: string) => {
    const currentValue = getMealStatus(studentId, date, mealType);
    const key = `${studentId}_${date}`;
    
    setAttendanceChanges(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        studentId,
        date,
        [mealType]: !currentValue,
      },
    }));
    
    // Also update dateWiseAttendance for specific date view
    if (viewMode === 'specific') {
      setDateWiseAttendance(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [mealType]: !currentValue,
        }
      }));
    }
  };

  // Handle quick select all for specific date
  const handleQuickSelectAll = (mealType: string, value: boolean) => {
    if (!dates[0]) return;
    const date = dates[0];
    
    const newChanges = { ...attendanceChanges };
    const newDateWise = { ...dateWiseAttendance };
    
    studentsByClass.forEach((student: Student) => {
      const key = `${student._id}_${date}`;
      if (!newChanges[key]) {
        newChanges[key] = { studentId: student._id, date };
      }
      newChanges[key][mealType] = value;
      
      newDateWise[student._id] = {
        ...newDateWise[student._id],
        [mealType]: value,
      };
    });
    
    setAttendanceChanges(newChanges);
    setDateWiseAttendance(newDateWise);
    setQuickSelectAll({ ...quickSelectAll, [mealType]: value });
    
    setSnackbar({
      open: true,
      message: `${mealType === 'breakfast' ? 'Breakfast' : mealType === 'lunch' ? 'Lunch' : 'Dinner'} ${value ? 'added for everyone' : 'removed for everyone'}`,
      severity: 'success',
    });
  };

  // Handle open specific date dialog
  const handleOpenSpecificDateDialog = () => {
    setSelectedSpecificDate(specificDate);
    setOpenSpecificDateDialog(true);
  };

  // Handle save from specific date dialog
  const handleSaveSpecificDate = async () => {
    const allAttendances = studentsByClass.map((student: Student) => ({
      studentId: student._id,
      date: dates[0],
      breakfast: dateWiseAttendance[student._id]?.breakfast || false,
      lunch: dateWiseAttendance[student._id]?.lunch || false,
      dinner: dateWiseAttendance[student._id]?.dinner || false,
    }));
    
    const payload = {
      academicYear,
      attendances: allAttendances,
    };
    
    try {
      const result = await bulkCreateAttendance(payload).unwrap();
      
      // Update local data
      const newLocalData = { ...localAttendanceData };
      allAttendances.forEach((att: any) => {
        const key = `${att.studentId}_${att.date}`;
        newLocalData[key] = {
          breakfast: att.breakfast,
          lunch: att.lunch,
          dinner: att.dinner,
        };
      });
      
      setLocalAttendanceData(newLocalData);
      setAttendanceChanges({});
      
      setSnackbar({
        open: true,
        message: `${result.totalProcessed || allAttendances.length} attendance records saved successfully`,
        severity: 'success',
      });
      
      refetchSpecific();
      setOpenSpecificDateDialog(false);
    } catch (error: any) {
      console.error('Save error:', error);
      setSnackbar({
        open: true,
        message: error?.data?.message || 'Failed to save',
        severity: 'error',
      });
    }
  };

  // Handle bulk meal assignment for all students on a specific date
  const assignMealToAllOnDate = (date: string, mealType: string, value: boolean) => {
    const newChanges = { ...attendanceChanges };
    
    studentsByClass.forEach((student: Student) => {
      const key = `${student._id}_${date}`;
      if (!newChanges[key]) {
        newChanges[key] = { studentId: student._id, date };
      }
      newChanges[key][mealType] = value;
    });
    
    setAttendanceChanges(newChanges);
    setSnackbar({
      open: true,
      message: `${mealType === 'breakfast' ? 'Breakfast' : mealType === 'lunch' ? 'Lunch' : 'Dinner'} ${value ? 'added for everyone' : 'removed for everyone'} on ${date}`,
      severity: 'success',
    });
  };

  // Handle bulk meal assignment for all students on ALL dates in the range
  const assignMealToAllOnAllDates = (mealType: string, value: boolean) => {
    const newChanges = { ...attendanceChanges };
    
    studentsByClass.forEach((student: Student) => {
      dates.forEach((date: string) => {
        const key = `${student._id}_${date}`;
        if (!newChanges[key]) {
          newChanges[key] = { studentId: student._id, date };
        }
        newChanges[key][mealType] = value;
      });
    });
    
    setAttendanceChanges(newChanges);
    setSnackbar({
      open: true,
      message: `${mealType === 'breakfast' ? 'Breakfast' : mealType === 'lunch' ? 'Lunch' : 'Dinner'} ${value ? 'added for everyone on all dates' : 'removed for everyone on all dates'}`,
      severity: 'success',
    });
  };

  // Assign all three meals to all students on a specific date
  const assignFullDayMealToAllOnDate = (date: string, value: boolean) => {
    const newChanges = { ...attendanceChanges };
    
    studentsByClass.forEach((student: Student) => {
      const key = `${student._id}_${date}`;
      if (!newChanges[key]) {
        newChanges[key] = { studentId: student._id, date };
      }
      newChanges[key].breakfast = value;
      newChanges[key].lunch = value;
      newChanges[key].dinner = value;
    });
    
    setAttendanceChanges(newChanges);
    setSnackbar({
      open: true,
      message: `All meals ${value ? 'added' : 'removed'} for everyone on ${date}`,
      severity: 'success',
    });
  };

  // Handle bulk save to API
  const handleSaveAll = async () => {
    const changesArray = Object.values(attendanceChanges);
    if (changesArray.length === 0) {
      setSnackbar({
        open: true,
        message: 'No changes to save',
        severity: 'info',
      });
      return;
    }

    const payload = {
      academicYear,
      attendances: changesArray.map((change: any) => ({
        studentId: change.studentId,
        date: change.date,
        breakfast: change.breakfast !== undefined ? change.breakfast : false,
        lunch: change.lunch !== undefined ? change.lunch : false,
        dinner: change.dinner !== undefined ? change.dinner : false,
      })),
    };

    try {
      const result = await bulkCreateAttendance(payload).unwrap();
      
      const newLocalData = { ...localAttendanceData };
      changesArray.forEach((change: any) => {
        const key = `${change.studentId}_${change.date}`;
        newLocalData[key] = {
          breakfast: change.breakfast !== undefined ? change.breakfast : (newLocalData[key]?.breakfast || false),
          lunch: change.lunch !== undefined ? change.lunch : (newLocalData[key]?.lunch || false),
          dinner: change.dinner !== undefined ? change.dinner : (newLocalData[key]?.dinner || false),
        };
      });
      
      setLocalAttendanceData(newLocalData);
      setAttendanceChanges({});
      
      setSnackbar({
        open: true,
        message: `${result.totalProcessed || changesArray.length} attendance records saved successfully`,
        severity: 'success',
      });
      
      // Refetch based on view mode
      if (viewMode === 'monthly') {
        refetchMonthly();
      } else if (viewMode === 'daterange') {
        refetchDateRange();
      } else {
        refetchSpecific();
      }
    } catch (error: any) {
      console.error('Save error:', error);
      setSnackbar({
        open: true,
        message: error?.data?.message || 'Failed to save',
        severity: 'error',
      });
    }
  };

  // Handle reset
  const handleReset = () => {
    setAttendanceChanges({});
    setSnackbar({
      open: true,
      message: 'All changes cancelled',
      severity: 'info',
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    setAttendanceChanges({});
    if (viewMode === 'monthly') {
      refetchMonthly();
    } else if (viewMode === 'daterange') {
      refetchDateRange();
    } else {
      refetchSpecific();
    }
    setSnackbar({
      open: true,
      message: 'Data refreshed',
      severity: 'success',
    });
  };

  // Handle export
  const handleExport = () => {
    setSnackbar({
      open: true,
      message: 'Excel file download starting...',
      severity: 'success',
    });
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Calculate statistics
  const calculateStats = () => {
    let totalMeals = 0;
    let totalBreakfast = 0;
    let totalLunch = 0;
    let totalDinner = 0;
    let totalPresent = 0;

    studentsByClass.forEach((student: Student) => {
      let studentMeals = 0;
      dates.forEach((date: string) => {
        const dayMeals = getTotalMealsForDay(student._id, date);
        studentMeals += dayMeals;
        if (getMealStatus(student._id, date, 'breakfast')) totalBreakfast++;
        if (getMealStatus(student._id, date, 'lunch')) totalLunch++;
        if (getMealStatus(student._id, date, 'dinner')) totalDinner++;
      });
      totalMeals += studentMeals;
      if (studentMeals > 0) totalPresent++;
    });

    const mealRate = attendanceSheetData?.mealRate || 55;

    return {
      totalStudents: studentsByClass.length,
      totalMeals,
      totalBreakfast,
      totalLunch,
      totalDinner,
      totalCost: totalMeals * mealRate,
      totalPresent,
      totalAbsent: studentsByClass.length - totalPresent,
      averageMealsPerStudent: studentsByClass.length ? (totalMeals / studentsByClass.length).toFixed(1) : '0',
      mealRate,
      totalDays: dates.length,
    };
  };

  const stats = calculateStats();

  // Filtered students based on search
  const filteredStudents = studentsByClass.filter((student: Student) =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nameBangla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentClassRoll?.toString().includes(searchTerm) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (classDropdownOptions.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Loading class data...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
        
        {/* Header Section */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                <FoodIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Meal Attendance Management
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Track and manage daily meal attendance for students
              </Typography>
            </Box>
            <Box mt={{ xs: 2, sm: 0 }}>
              <Chip 
                icon={<TrophyIcon />} 
                label={`Academic Year: ${academicYear}`} 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              {className && (
                <Chip 
                  label={`Class: ${className}`} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', ml: 1 }}
                />
              )}
            </Box>
          </Box>
        </Paper>

        {/* Statistics Cards */}
        {studentsByClass.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">Total Students</Typography>
                      <Typography variant="h4" fontWeight="bold">{stats.totalStudents}</Typography>
                      <Typography variant="caption" color="success.main">
                        Present: {stats.totalPresent}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#2196f3', width: 48, height: 48 }}>
                      <PersonIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">Total Meals</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#4caf50">{stats.totalMeals}</Typography>
                      <Typography variant="caption">
                        Over {stats.totalDays} days
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
                      <FoodIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">Breakfast</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#ff9800">{stats.totalBreakfast}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}>
                      <BreakfastIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">Lunch</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#f44336">{stats.totalLunch}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#f44336', width: 48, height: 48 }}>
                      <LunchIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="text.secondary" variant="body2">Total Cost</Typography>
                      <Typography variant="h5" fontWeight="bold" color="#9c27b0">৳{stats.totalCost}</Typography>
                      <Typography variant="caption">
                        Rate: ৳{stats.mealRate}/meal
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                      <ChartIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Main Content */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {/* Toolbar */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Class</InputLabel>
                  <Select 
                    value={selectedClassId} 
                    label="Select Class" 
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      setAttendanceChanges({});
                    }}
                  >
                    {classDropdownOptions.map((option: any) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm="auto">
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, newMode) => {
                    if (newMode) {
                      setViewMode(newMode);
                      setAttendanceChanges({});
                    }
                  }}
                  size="small"
                >
                  <ToggleButton value="monthly">
                    <CalendarIcon sx={{ mr: 0.5 }} /> Monthly
                  </ToggleButton>
                  <ToggleButton value="daterange">
                    <DateRangeIcon sx={{ mr: 0.5 }} /> Date Range
                  </ToggleButton>
                  <ToggleButton value="specific">
                    <EditCalendarIcon sx={{ mr: 0.5 }} /> Specific Date
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              
              {viewMode === 'monthly' ? (
                <Grid item xs={12} sm={3}>
                  <DatePicker
                    label="Select Month"
                    views={['year', 'month']}
                    value={selectedMonth}
                    onChange={(newValue) => {
                      setSelectedMonth(newValue);
                      setAttendanceChanges({});
                    }}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
              ) : viewMode === 'daterange' ? (
                <>
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" gap={1} alignItems="center">
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => {
                          setStartDate(newValue);
                          setAttendanceChanges({});
                        }}
                        slotProps={{ textField: { size: 'small', sx: { width: '100%' } } }}
                      />
                      <Typography variant="body2">to</Typography>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => {
                          setEndDate(newValue);
                          setAttendanceChanges({});
                        }}
                        slotProps={{ textField: { size: 'small', sx: { width: '100%' } } }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => setQuickRangeAnchorEl(e.currentTarget)}
                        startIcon={<ViewWeekIcon />}
                      >
                        Quick Range
                      </Button>
                      <Menu
                        anchorEl={quickRangeAnchorEl}
                        open={Boolean(quickRangeAnchorEl)}
                        onClose={() => setQuickRangeAnchorEl(null)}
                      >
                        <MenuItem onClick={() => handleQuickRangeSelect('today')}>
                          <TodayIcon sx={{ mr: 1, fontSize: 20 }} /> Today
                        </MenuItem>
                        <MenuItem onClick={() => handleQuickRangeSelect('yesterday')}>
                          <TodayIcon sx={{ mr: 1, fontSize: 20 }} /> Yesterday
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => handleQuickRangeSelect('thisWeek')}>
                          <ViewWeekIcon sx={{ mr: 1, fontSize: 20 }} /> This Week
                        </MenuItem>
                        <MenuItem onClick={() => handleQuickRangeSelect('lastWeek')}>
                          <WeekendIcon sx={{ mr: 1, fontSize: 20 }} /> Last Week
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => handleQuickRangeSelect('thisMonth')}>
                          <CalendarIcon sx={{ mr: 1, fontSize: 20 }} /> This Month
                        </MenuItem>
                        <MenuItem onClick={() => handleQuickRangeSelect('lastMonth')}>
                          <CalendarIcon sx={{ mr: 1, fontSize: 20 }} /> Last Month
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <Chip 
                      label={`${dates.length} day(s)`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Grid>
                </>
              ) : (
                <Grid item xs={12} sm={3}>
                  <Box display="flex" gap={1}>
                    <MobileDatePicker
                      label="Select Date"
                      value={specificDate}
                      onChange={(newValue) => {
                        setSpecificDate(newValue);
                        setAttendanceChanges({});
                      }}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<EditCalendarIcon />}
                      onClick={handleOpenSpecificDateDialog}
                    >
                      Entry
                    </Button>
                  </Box>
                </Grid>
              )}
              
              <Grid item xs={12} sm={viewMode === 'daterange' ? 1.5 : 2}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={viewMode === 'daterange' ? 1 : 1.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={isLoadingSheet}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>

            {/* Show date range info */}
            {viewMode === 'daterange' && startDate && endDate && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Showing attendance from <strong>{startDate.format('DD MMMM YYYY')}</strong> to <strong>{endDate.format('DD MMMM YYYY')}</strong> 
                  {' '}({dates.length} days)
                </Typography>
              </Box>
            )}

            {/* Quick Actions - For Monthly and Date Range Views */}
            {studentsByClass.length > 0 && dates.length > 0 && viewMode !== 'specific' && (
              <>
                <Divider sx={{ my: 2 }} />
                
                {/* Date-wise Quick Actions */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    <DateRangeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Quick actions for specific date (click on any date in the table below):
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {dates.slice(0, 10).map((date:any) => (
                      <Chip
                        key={date}
                        label={dayjs(date).format('DD MMM')}
                        onClick={() => setSelectedDateForBulk(selectedDateForBulk === date ? null : date)}
                        color={selectedDateForBulk === date ? 'primary' : 'default'}
                        variant={selectedDateForBulk === date ? 'filled' : 'outlined'}
                        size="small"
                      />
                    ))}
                    {dates.length > 10 && (
                      <Chip label={`+${dates.length - 10} more`} variant="outlined" size="small" />
                    )}
                  </Stack>
                  
                  {selectedDateForBulk && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        <strong>{dayjs(selectedDateForBulk).format('DD MMMM YYYY')}</strong> - Actions for this date:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button size="small" variant="contained" color="success" onClick={() => assignFullDayMealToAllOnDate(selectedDateForBulk, true)}>
                          Give Full Day Meal
                        </Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => assignFullDayMealToAllOnDate(selectedDateForBulk, false)}>
                          Remove Full Day Meal
                        </Button>
                        <Divider orientation="vertical" flexItem />
                        <Button size="small" variant="outlined" startIcon={<BreakfastIcon />} onClick={() => assignMealToAllOnDate(selectedDateForBulk, 'breakfast', true)}>
                          Breakfast
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<LunchIcon />} onClick={() => assignMealToAllOnDate(selectedDateForBulk, 'lunch', true)}>
                          Lunch
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<DinnerIcon />} onClick={() => assignMealToAllOnDate(selectedDateForBulk, 'dinner', true)}>
                          Dinner
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 1 }} />
                
                {/* Global Quick Actions - For ALL dates in the range */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Assign breakfast to all students on all dates">
                      <Button size="small" variant="outlined" onClick={() => assignMealToAllOnAllDates('breakfast', true)}>
                        <BreakfastIcon fontSize="small" sx={{ mr: 0.5 }} /> All Breakfast
                      </Button>
                    </Tooltip>
                    <Tooltip title="Assign lunch to all students on all dates">
                      <Button size="small" variant="outlined" onClick={() => assignMealToAllOnAllDates('lunch', true)}>
                        <LunchIcon fontSize="small" sx={{ mr: 0.5 }} /> All Lunch
                      </Button>
                    </Tooltip>
                    <Tooltip title="Assign dinner to all students on all dates">
                      <Button size="small" variant="outlined" onClick={() => assignMealToAllOnAllDates('dinner', true)}>
                        <DinnerIcon fontSize="small" sx={{ mr: 0.5 }} /> All Dinner
                      </Button>
                    </Tooltip>
                  </Stack>
                  
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Export to Excel">
                      <Button size="small" startIcon={<DownloadIcon />} onClick={handleExport}>
                        Export
                      </Button>
                    </Tooltip>
                    <Tooltip title="Print">
                      <Button size="small" startIcon={<PrintIcon />} onClick={handlePrint}>
                        Print
                      </Button>
                    </Tooltip>
                    <Tooltip title="Cancel all changes">
                      <Button size="small" color="error" onClick={handleReset} disabled={Object.keys(attendanceChanges).length === 0}>
                        Cancel
                      </Button>
                    </Tooltip>
                    <Button
                      variant="contained"
                      startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handleSaveAll}
                      disabled={isSaving || Object.keys(attendanceChanges).length === 0}
                    >
                      {Object.keys(attendanceChanges).length > 0 
                        ? `Save (${Object.keys(attendanceChanges).length})` 
                        : 'Save'}
                    </Button>
                  </Stack>
                </Box>
              </>
            )}

            {/* Specific Date Quick Actions */}
            {viewMode === 'specific' && studentsByClass.length > 0 && dates.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" icon={<AddTaskIcon />}>
                  <Typography variant="body2" gutterBottom>
                    <strong>{specificDate?.format('DD MMMM YYYY')}</strong> - Quick entry for this date:
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={quickSelectAll.breakfast}
                          onChange={(e) => handleQuickSelectAll('breakfast', e.target.checked)}
                        />
                      }
                      label="All Breakfast"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={quickSelectAll.lunch}
                          onChange={(e) => handleQuickSelectAll('lunch', e.target.checked)}
                        />
                      }
                      label="All Lunch"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={quickSelectAll.dinner}
                          onChange={(e) => handleQuickSelectAll('dinner', e.target.checked)}
                        />
                      }
                      label="All Dinner"
                    />
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveSpecificDate}
                    >
                      Save
                    </Button>
                  </Stack>
                </Alert>
              </Box>
            )}

            {/* Pending Changes Alert */}
            {Object.keys(attendanceChanges).length > 0 && viewMode !== 'specific' && (
              <Alert severity="warning" sx={{ mt: 2 }} onClose={handleReset}>
                <strong>{Object.keys(attendanceChanges).length} unsaved change(s)!</strong> Please save your changes.
              </Alert>
            )}
          </Box>

          {/* Loading State */}
          {isLoadingSheet && dates.length === 0 && (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">Loading attendance data...</Typography>
            </Box>
          )}

          {/* No Students in Class */}
          {!isLoadingSheet && selectedClassId && studentsByClass.length === 0 && (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No students in this class
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No students found for class {className}
              </Typography>
            </Box>
          )}

          {/* Attendance Table */}
          {!isLoadingSheet && selectedClassId && filteredStudents.length > 0 && dates.length > 0 && (
            <TableContainer sx={{ maxHeight: '70vh', overflow: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: 100, position: 'sticky', left: 0, zIndex: 2 }}>
                      Roll No
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: 200, position: 'sticky', left: 100, zIndex: 2 }}>
                      Student Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: 150 }}>
                      Student ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', minWidth: 120 }}>
                      Type
                    </TableCell>
                    {dates.map((date: string) => (
                      <TableCell
                        key={date}
                        align="center"
                        sx={{
                          fontWeight: 'bold',
                          bgcolor: selectedDateForBulk === date ? '#e3f2fd' : '#f5f5f5',
                          minWidth: 100,
                          borderLeft: '1px solid #e0e0e0',
                          cursor: viewMode !== 'specific' ? 'pointer' : 'default',
                          '&:hover': { bgcolor: viewMode !== 'specific' ? '#bbdefb' : '#f5f5f5' },
                        }}
                        onClick={() => {
                          if (viewMode !== 'specific') {
                            setSelectedDateForBulk(selectedDateForBulk === date ? null : date);
                          }
                        }}
                      >
                        <Typography variant="caption" display="block" fontWeight="bold">
                          {dayjs(date).format('DD MMM')}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {dayjs(date).format('ddd')}
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#e3f2fd', minWidth: 100 }}>
                      Total Meals
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#e3f2fd', minWidth: 100 }}>
                      Total Cost (৳)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((student: Student) => {
                    const totalMeals = getTotalMealsForStudent(student._id);
                    const totalCost = totalMeals * (attendanceSheetData?.mealRate || 55);
                    
                    return (
                      <TableRow hover key={student._id}>
                        <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'white', zIndex: 1 }}>
                          <Chip label={student.studentClassRoll || 'N/A'} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ position: 'sticky', left: 100, bgcolor: 'white', zIndex: 1 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4caf50' }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {student.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.nameBangla || student.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {student.studentId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.studentType || 'Day Scholar'}
                            size="small"
                            color={student.studentType === 'Residential' || student.studentType === 'hostel' ? 'primary' : 'default'}
                            variant={student.studentType === 'Residential' || student.studentType === 'hostel' ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        {dates.map((date: string) => {
                          const total = getTotalMealsForDay(student._id, date);
                          
                          return (
                            <TableCell
                              key={date}
                              align="center"
                              sx={{
                                bgcolor: total > 0 ? '#e8f5e9' : '#ffebee',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: '#e3f2fd' },
                                borderLeft: selectedDateForBulk === date ? '2px solid #1976d2' : 'none',
                                borderRight: selectedDateForBulk === date ? '2px solid #1976d2' : 'none',
                              }}
                            >
                              <Box display="flex" justifyContent="center" gap={0.5}>
                                <Tooltip title="Breakfast">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMealToggle(student._id, date, 'breakfast');
                                    }}
                                    color={getMealStatus(student._id, date, 'breakfast') ? 'success' : 'default'}
                                    sx={{ p: 0.5 }}
                                  >
                                    <BreakfastIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Lunch">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMealToggle(student._id, date, 'lunch');
                                    }}
                                    color={getMealStatus(student._id, date, 'lunch') ? 'success' : 'default'}
                                    sx={{ p: 0.5 }}
                                  >
                                    <LunchIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Dinner">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMealToggle(student._id, date, 'dinner');
                                    }}
                                    color={getMealStatus(student._id, date, 'dinner') ? 'success' : 'default'}
                                    sx={{ p: 0.5 }}
                                  >
                                    <DinnerIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                              {total > 0 && (
                                <Chip
                                  label={`${total}`}
                                  size="small"
                                  sx={{ mt: 0.5, height: 20, fontSize: '10px' }}
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell align="center" sx={{ bgcolor: '#e3f2fd' }}>
                          <Typography fontWeight="bold" color="primary">
                            {totalMeals}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: '#e3f2fd' }}>
                          <Typography fontWeight="bold">
                            ৳{totalCost}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* No Dates State */}
          {!isLoadingSheet && selectedClassId && filteredStudents.length > 0 && dates.length === 0 && (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <CalendarIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No dates found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please {viewMode === 'monthly' ? 'select a month' : viewMode === 'daterange' ? 'select a valid date range' : 'select a date'}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Specific Date Entry Dialog */}
        <Dialog 
          open={openSpecificDateDialog} 
          onClose={() => setOpenSpecificDateDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <EditCalendarIcon color="primary" />
              <Typography variant="h6">
                Meal Entry for {selectedSpecificDate?.format('DD MMMM YYYY')}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Roll No</TableCell>
                    <TableCell>Student Name</TableCell>
                    <TableCell align="center">Breakfast</TableCell>
                    <TableCell align="center">Lunch</TableCell>
                    <TableCell align="center">Dinner</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentsByClass.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>{student.studentClassRoll || 'N/A'}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={dateWiseAttendance[student._id]?.breakfast || false}
                          onChange={(e) => {
                            const newValue = e.target.checked;
                            setDateWiseAttendance(prev => ({
                              ...prev,
                              [student._id]: {
                                ...prev[student._id],
                                breakfast: newValue,
                              }
                            }));
                            if (selectedSpecificDate) {
                              const dateStr = selectedSpecificDate.format('YYYY-MM-DD');
                              setAttendanceChanges(prev => ({
                                ...prev,
                                [`${student._id}_${dateStr}`]: {
                                  studentId: student._id,
                                  date: dateStr,
                                  breakfast: newValue,
                                  lunch: dateWiseAttendance[student._id]?.lunch || false,
                                  dinner: dateWiseAttendance[student._id]?.dinner || false,
                                }
                              }));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={dateWiseAttendance[student._id]?.lunch || false}
                          onChange={(e) => {
                            const newValue = e.target.checked;
                            setDateWiseAttendance(prev => ({
                              ...prev,
                              [student._id]: {
                                ...prev[student._id],
                                lunch: newValue,
                              }
                            }));
                            if (selectedSpecificDate) {
                              const dateStr = selectedSpecificDate.format('YYYY-MM-DD');
                              setAttendanceChanges(prev => ({
                                ...prev,
                                [`${student._id}_${dateStr}`]: {
                                  studentId: student._id,
                                  date: dateStr,
                                  breakfast: dateWiseAttendance[student._id]?.breakfast || false,
                                  lunch: newValue,
                                  dinner: dateWiseAttendance[student._id]?.dinner || false,
                                }
                              }));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={dateWiseAttendance[student._id]?.dinner || false}
                          onChange={(e) => {
                            const newValue = e.target.checked;
                            setDateWiseAttendance(prev => ({
                              ...prev,
                              [student._id]: {
                                ...prev[student._id],
                                dinner: newValue,
                              }
                            }));
                            if (selectedSpecificDate) {
                              const dateStr = selectedSpecificDate.format('YYYY-MM-DD');
                              setAttendanceChanges(prev => ({
                                ...prev,
                                [`${student._id}_${dateStr}`]: {
                                  studentId: student._id,
                                  date: dateStr,
                                  breakfast: dateWiseAttendance[student._id]?.breakfast || false,
                                  lunch: dateWiseAttendance[student._id]?.lunch || false,
                                  dinner: newValue,
                                }
                              }));
                            }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSpecificDateDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSaveSpecificDate}
              startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={isSaving}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default MealAttendanceManager;
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useAcademicOption } from '@/hooks/useAcademicOption';
import { ClassItem } from '@/interface/meal';
import {
    useBulkCreateAttendanceMutation,
    useGetMonthlyAttendanceSheetQuery,
} from '@/redux/api/mealAttendanceApi';
import { MealFormProps, Student } from '@/types/meal';
import {
    ArrowBack as ArrowBackIcon,
    BreakfastDining as BreakfastIcon,
    CalendarMonth as CalendarIcon,
    Clear as ClearIcon,
    DinnerDining as DinnerIcon,
    Fastfood as FastfoodIcon,
    LunchDining as LunchIcon,
    Person as PersonIcon,
    Refresh as RefreshIcon,
    RemoveCircle as RemoveCircleIcon,
    Save as SaveIcon,
    School as SchoolIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';


const SEL_BG = 'rgba(19,102,210,0.13)';
const SEL_BORDER = '#1366D2';
const HEADER_SEL_BG = 'rgba(19,102,210,0.28)';
const MEAL_RATE = 55;


const MealForm: React.FC<MealFormProps> = ({
    isMonthlyUpdate = false,
    monthlyUpdateClassId = '',
    monthlyUpdateClassName = '',
    monthlyUpdateMonth = '',
    monthlyUpdateAcademicYear = '',
}) => {
    const router = useRouter();
    const { classData, studentData } = useAcademicOption();
    const [bulkCreateAttendance, { isLoading: isSaving }] = useBulkCreateAttendanceMutation();

    // Function to get academic year from URL or prop
    const getAcademicYear = useCallback(() => {
        if (monthlyUpdateAcademicYear) return monthlyUpdateAcademicYear;
        if (isMonthlyUpdate) {
            const urlParams = new URLSearchParams(window.location.search);
            const urlAcademicYear = urlParams.get('academicYear');
            if (urlAcademicYear) return urlAcademicYear;
        }
        return dayjs().year().toString();
    }, [monthlyUpdateAcademicYear, isMonthlyUpdate]);

    // Core state
    const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(() => {
        if (isMonthlyUpdate && monthlyUpdateMonth) return dayjs(monthlyUpdateMonth);
        return dayjs();
    });

    const [attendanceChanges, setAttendanceChanges] = useState<Record<string, any>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
    const [localAttendanceData, setLocalAttendanceData] = useState<Record<string, any>>({});
    const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
    const [isSavingMonthly, setIsSavingMonthly] = useState(false);

    // Excel column selection
    const [selectedColIndices, setSelectedColIndices] = useState<Set<number>>(new Set());
    const isDraggingCol = useRef(false);
    const dragStartCol = useRef(-1);
    const dragLastCol = useRef(-1);

    // Data helpers
    const allStudents: Student[] = useMemo(() => {
        let s: any[] = [];
        if (studentData?.data?.data) s = studentData.data.data;
        else if (studentData?.data) s = studentData.data;
        else if (Array.isArray(studentData)) s = studentData;
        return s.filter(
            (st: any) =>
                st.admissionStatus === 'enrolled' &&
                (st.category === 'Residential' || st.studentType === 'Residential')
        );
    }, [studentData]);

    const allClasses = useMemo((): ClassItem[] => {
        let c: any[] = [];
        if (classData?.data?.data?.classes) c = classData.data.data.classes;
        else if (classData?.data?.classes) c = classData.data.classes;
        else if (classData?.classes) c = classData.classes;
        else if (classData?.data?.data) c = classData.data.data;
        else if (classData?.data) c = classData.data;
        else if (Array.isArray(classData)) c = classData;
        return c;
    }, [classData]);

    // className string for API query
    const resolvedClassName = useMemo(() => {
        if (isMonthlyUpdate) {
            if (monthlyUpdateClassName) return monthlyUpdateClassName;
            const found = allClasses.find((c) => c._id === monthlyUpdateClassId);
            return found?.className || '';
        }
        return '';
    }, [isMonthlyUpdate, monthlyUpdateClassName, monthlyUpdateClassId, allClasses]);

    // Monthly attendance sheet API
    const shouldFetchSheet = useMemo(() => {
        return isMonthlyUpdate && !!resolvedClassName && !!selectedMonth;
    }, [isMonthlyUpdate, resolvedClassName, selectedMonth]);

    const {
        data: monthlyData,
        isLoading: loadMonthly,
        refetch: refetchMonthly,
    } = useGetMonthlyAttendanceSheetQuery(
        {
            className: resolvedClassName,
            month: selectedMonth?.format('YYYY-MM') || '',
            academicYear: getAcademicYear(),
        },
        { skip: !shouldFetchSheet }
    );

    const attendanceSheetData = monthlyData?.data || monthlyData;
    const mealRate = attendanceSheetData?.mealRate || MEAL_RATE;

    // Students for the table
    const studentsByClass = useMemo(() => {
        if (isMonthlyUpdate) {
            if (!monthlyUpdateClassId && !monthlyUpdateClassName) return allStudents;
            return allStudents.filter((s: Student) =>
                Array.isArray(s.className) &&
                s.className.some((c: any) => {
                    const cId = c._id || c;
                    const cName = c.className || '';
                    return cId === monthlyUpdateClassId || cName === monthlyUpdateClassName;
                })
            );
        }
        return [];
    }, [allStudents, isMonthlyUpdate, monthlyUpdateClassId, monthlyUpdateClassName]);

    // Dates list
    const dates = useMemo<string[]>(() => {
        if (attendanceSheetData?.dates?.length) return attendanceSheetData.dates;
        if (selectedMonth) {
            const list: string[] = [];
            let cur = selectedMonth.startOf('month');
            const e = selectedMonth.endOf('month');
            while (!cur.isAfter(e)) {
                list.push(cur.format('YYYY-MM-DD'));
                cur = cur.add(1, 'day');
            }
            return list;
        }
        return [];
    }, [attendanceSheetData, selectedMonth]);

    // Initialize local attendance data from API response
    useEffect(() => {
        if (isMonthlyUpdate && attendanceSheetData && studentsByClass.length > 0 && dates.length > 0 && !hasLoadedInitialData) {
            const init: Record<string, any> = {};

            // Create a map for quick lookup of API attendance data
            attendanceSheetData?.students?.forEach((apiStudent: any) => {
                const studentId = apiStudent.student?.id || apiStudent.student?._id;

                if (studentId && apiStudent.attendance) {
                    apiStudent.attendance.forEach((att: any) => {
                        const key = `${studentId}_${att.date}`;
                        init[key] = {
                            breakfast: att.breakfast === true,
                            lunch: att.lunch === true,
                            dinner: att.dinner === true,
                        };
                    });
                }
            });

            // For any student/date combination not in API response, set default values (all meals = true)
            studentsByClass.forEach((student: Student) => {
                dates.forEach((date: string) => {
                    const key = `${student._id}_${date}`;
                    if (!init[key]) {
                        init[key] = { breakfast: true, lunch: true, dinner: true };
                    }
                });
            });

            setLocalAttendanceData(init);
            setSelectedColIndices(new Set());
            setHasLoadedInitialData(true);
        }
    }, [attendanceSheetData, studentsByClass, dates, isMonthlyUpdate, hasLoadedInitialData]);

    // Month change reset
    const handleMonthChange = (v: Dayjs | null) => {
        setSelectedMonth(v);
        setAttendanceChanges({});
        clearSelection();
        setHasLoadedInitialData(false);
        setLocalAttendanceData({});
    };

    // Meal helpers
    const getMealStatus = useCallback(
        (sid: string, date: string, meal: string): boolean => {
            const k = `${sid}_${date}`;
            // Check if there's an unsaved change first
            if (attendanceChanges[k] && meal in attendanceChanges[k]) {
                return attendanceChanges[k][meal];
            }
            // Otherwise use local data
            const localValue = localAttendanceData[k]?.[meal];
            return localValue !== undefined ? localValue : true;
        },
        [attendanceChanges, localAttendanceData]
    );

    const getMealsForDay = useCallback(
        (sid: string, date: string) =>
            (getMealStatus(sid, date, 'breakfast') ? 1 : 0) +
            (getMealStatus(sid, date, 'lunch') ? 1 : 0) +
            (getMealStatus(sid, date, 'dinner') ? 1 : 0),
        [getMealStatus]
    );

    const getTotalMealsForStudent = useCallback(
        (sid: string) => dates.reduce((a: number, d: string) => a + getMealsForDay(sid, d), 0),
        [dates, getMealsForDay]
    );

    const handleMealToggle = (sid: string, date: string, meal: string) => {
        const cur = getMealStatus(sid, date, meal);
        const k = `${sid}_${date}`;
        setAttendanceChanges((prev) => ({
            ...prev,
            [k]: { ...prev[k], studentId: sid, date, [meal]: !cur },
        }));
    };

    // Excel-like column selection
    const buildRange = (a: number, b: number): Set<number> => {
        const s = new Set<number>();
        for (let i = Math.min(a, b); i <= Math.max(a, b); i++) s.add(i);
        return s;
    };

    const canSelectCols = isMonthlyUpdate;

    const startColDrag = (e: React.MouseEvent, colIdx: number) => {
        if (e.button !== 0 || !canSelectCols) return;
        e.preventDefault();
        isDraggingCol.current = true;
        dragStartCol.current = colIdx;
        dragLastCol.current = colIdx;
        if (e.shiftKey && selectedColIndices.size > 0) {
            setSelectedColIndices(buildRange(Math.min(...Array.from(selectedColIndices)), colIdx));
        } else if (e.ctrlKey || e.metaKey) {
            setSelectedColIndices((prev) => {
                const next = new Set(prev);
                if (next.has(colIdx)) next.delete(colIdx);
                else next.add(colIdx);
                return next;
            });
        } else {
            setSelectedColIndices(new Set([colIdx]));
        }
    };

    const extendColDrag = (e: React.MouseEvent, colIdx: number) => {
        if (!isDraggingCol.current || !canSelectCols || colIdx === dragLastCol.current) return;
        dragLastCol.current = colIdx;
        setSelectedColIndices(buildRange(dragStartCol.current, colIdx));
    };

    useEffect(() => {
        const up = () => { isDraggingCol.current = false; };
        window.addEventListener('mouseup', up);
        return () => window.removeEventListener('mouseup', up);
    }, []);

    const clearSelection = () => setSelectedColIndices(new Set());

    const applyToSelectedCols = (value: boolean) => {
        if (!selectedColIndices.size) {
            setSnackbar({ open: true, message: 'Please select columns first!', severity: 'warning' });
            return;
        }
        const targetDates = Array.from(selectedColIndices).map((i) => dates[i]).filter(Boolean);
        const nc = { ...attendanceChanges };
        const nl = { ...localAttendanceData };
        studentsByClass.forEach((s: Student) => {
            targetDates.forEach((d: string) => {
                const k = `${s._id}_${d}`;
                nc[k] = { ...nc[k], studentId: s._id, date: d, breakfast: value, lunch: value, dinner: value };
                nl[k] = { breakfast: value, lunch: value, dinner: value };
            });
        });
        setAttendanceChanges(nc);
        setLocalAttendanceData(nl);
        setSnackbar({
            open: true,
            message: value
                ? `✅ All meals ADDED for ${targetDates.length} selected date(s)`
                : `❌ All meals REMOVED for ${targetDates.length} selected date(s)`,
            severity: 'success',
        });
        clearSelection();
    };

    const setAllMealsValue = (value: boolean) => {
        const nc: Record<string, any> = {};
        const nl: Record<string, any> = {};
        studentsByClass.forEach((s: Student) => {
            dates.forEach((d: string) => {
                const k = `${s._id}_${d}`;
                nc[k] = { studentId: s._id, date: d, breakfast: value, lunch: value, dinner: value };
                nl[k] = { breakfast: value, lunch: value, dinner: value };
            });
        });
        setAttendanceChanges(nc);
        setLocalAttendanceData(nl);
        setSnackbar({ open: true, message: value ? '✅ All meals added!' : '❌ All meals removed!', severity: 'success' });
    };

    const assignMealAllDates = (meal: string, value: boolean) => {
        const nc = { ...attendanceChanges };
        studentsByClass.forEach((s: Student) =>
            dates.forEach((d: string) => {
                const k = `${s._id}_${d}`;
                nc[k] = { ...nc[k], studentId: s._id, date: d, [meal]: value };
            })
        );
        setAttendanceChanges(nc);
        setSnackbar({ open: true, message: `${meal} ${value ? 'added' : 'removed'} for all dates`, severity: 'success' });
    };

    // SAVE: Monthly Update
    const handleMonthlyUpdateSave = async () => {
        if (!studentsByClass.length || !dates.length) {
            setSnackbar({ open: true, message: 'No data to update', severity: 'warning' });
            return;
        }

        setIsSavingMonthly(true);
        try {
            const attendancesToSave: any[] = [];

            studentsByClass.forEach((student: Student) => {
                dates.forEach((date: string) => {
                    const k = `${student._id}_${date}`;
                    const change = attendanceChanges[k];
                    const local = localAttendanceData[k];

                    const breakfast = change?.breakfast !== undefined ? change.breakfast : (local?.breakfast ?? true);
                    const lunch = change?.lunch !== undefined ? change.lunch : (local?.lunch ?? true);
                    const dinner = change?.dinner !== undefined ? change.dinner : (local?.dinner ?? true);

                    attendancesToSave.push({
                        studentId: student._id,
                        date,
                        breakfast,
                        lunch,
                        dinner,
                    });
                });
            });

            if (attendancesToSave.length === 0) {
                setSnackbar({ open: true, message: 'No data to save', severity: 'warning' });
                return;
            }

            const result = await bulkCreateAttendance({
                academicYear: getAcademicYear(),
                attendances: attendancesToSave,
            }).unwrap();

            setSnackbar({
                open: true,
                message: `✅ ${result.totalProcessed || attendancesToSave.length} records updated successfully!`,
                severity: 'success',
            });
            setAttendanceChanges({});

            setTimeout(() => {
                router.push('/dashboard/daily-meal-report');
            }, 1500);
        } catch (err: any) {
            setSnackbar({ open: true, message: err?.data?.message || 'Failed to update', severity: 'error' });
        } finally {
            setIsSavingMonthly(false);
        }
    };

    const handleRefresh = () => {
        setAttendanceChanges({});
        clearSelection();
        setHasLoadedInitialData(false);
        setLocalAttendanceData({});
        refetchMonthly();
        setSnackbar({ open: true, message: 'Data refreshed', severity: 'success' });
    };

    const filteredStudents = useMemo(
        () =>
            studentsByClass.filter(
                (s: Student) =>
                    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.nameBangla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.studentClassRoll?.toString().includes(searchTerm) ||
                    s.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [studentsByClass, searchTerm]
    );

    // Loading states
    if (isMonthlyUpdate && loadMonthly && !hasLoadedInitialData) {
        return (
            <Box sx={{ p: 4 }}>
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }} color="text.secondary">
                        Loading {monthlyUpdateClassName} — {dayjs(monthlyUpdateMonth).format('MMMM YYYY')} attendance data...
                    </Typography>
                </Paper>
            </Box>
        );
    }

    // Computed UI values
    const hasSel = selectedColIndices.size > 0;
    const changesCount = Object.keys(attendanceChanges).length;
    const isSaveLoading = isSavingMonthly || isSaving;

    const pageTitle = `Update Meal Attendance — ${monthlyUpdateClassName || resolvedClassName} (${dayjs(monthlyUpdateMonth).format('MMMM YYYY')})`;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
                {/* Header */}
                <Paper
                    sx={{
                        p: 3, mb: 3, borderRadius: 3,
                        background: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
                        color: 'white',
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <IconButton
                                    onClick={() => router.push('/dashboard/daily-meal-report')}
                                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                                >
                                    <ArrowBackIcon />
                                </IconButton>
                                <Typography variant="h5" fontWeight="bold">{pageTitle}</Typography>
                            </Box>

                            <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Chip
                                    icon={<SchoolIcon />}
                                    label={`Class: ${monthlyUpdateClassName || resolvedClassName}`}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }}
                                    size="small"
                                />
                                <Chip
                                    icon={<CalendarIcon />}
                                    label={`Month: ${dayjs(monthlyUpdateMonth).format('MMMM YYYY')}`}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }}
                                    size="small"
                                />
                                <Chip
                                    icon={<PersonIcon />}
                                    label={`${studentsByClass.length} Students`}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }}
                                    size="small"
                                />
                                <Chip
                                    label={`${dates.length} Days`}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }}
                                    size="small"
                                />
                                <Chip
                                    icon={<CalendarIcon />}
                                    label={`Academic Year: ${getAcademicYear()}`}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }}
                                    size="small"
                                />
                            </Box>
                        </Box>

                        {studentsByClass.length > 0 && (
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={isSaveLoading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                                onClick={handleMonthlyUpdateSave}
                                disabled={isSaveLoading}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.25)',
                                    color: 'white',
                                    border: '2px solid rgba(255,255,255,0.5)',
                                    fontWeight: 'bold',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
                                    '&:disabled': { bgcolor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' },
                                }}
                            >
                                {`Update Full Month (${studentsByClass.length} students × ${dates.length} days)`}
                            </Button>
                        )}
                    </Box>
                </Paper>

                {/* Main Panel */}
                <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    {/* Toolbar */}
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <DatePicker
                                    label="Select Month"
                                    views={['year', 'month']}
                                    value={selectedMonth}
                                    onChange={handleMonthChange}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                            </Grid>

                            <Grid item xs={12} sm="auto">
                                <TextField
                                    size="small"
                                    placeholder="Search student…"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    sx={{ minWidth: 250 }}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setSearchTerm('')}><ClearIcon fontSize="small" /></IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm="auto">
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleRefresh}
                                    disabled={loadMonthly}
                                    size="small"
                                >
                                    Refresh
                                </Button>
                            </Grid>
                        </Grid>

                        {/* Column selection toolbar */}
                        {studentsByClass.length > 0 && dates.length > 0 && (
                            <Box
                                sx={{
                                    mt: 2, p: '10px 16px',
                                    bgcolor: hasSel ? '#EBF3FF' : '#f8f9fa',
                                    border: hasSel ? `1.5px solid ${SEL_BORDER}` : '1px solid #e0e0e0',
                                    borderRadius: 2,
                                    display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center',
                                }}
                            >
                                <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                                    <Button
                                        variant="contained" color="success" size="small"
                                        startIcon={<FastfoodIcon />}
                                        onClick={() => hasSel ? applyToSelectedCols(true) : setAllMealsValue(true)}
                                    >
                                        {hasSel ? `Add Full Meal (${selectedColIndices.size} col)` : 'Add All Meals'}
                                    </Button>
                                    <Button
                                        variant="contained" color="error" size="small"
                                        startIcon={<RemoveCircleIcon />}
                                        onClick={() => hasSel ? applyToSelectedCols(false) : setAllMealsValue(false)}
                                    >
                                        {hasSel ? `Remove Meals (${selectedColIndices.size} col)` : 'Remove All Meals'}
                                    </Button>
                                    <Divider orientation="vertical" flexItem />
                                    <Tooltip title="Add Breakfast — all dates">
                                        <Button size="small" variant="outlined" onClick={() => assignMealAllDates('breakfast', true)}>
                                            <BreakfastIcon fontSize="small" /> All B
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Add Lunch — all dates">
                                        <Button size="small" variant="outlined" onClick={() => assignMealAllDates('lunch', true)}>
                                            <LunchIcon fontSize="small" /> All L
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Add Dinner — all dates">
                                        <Button size="small" variant="outlined" onClick={() => assignMealAllDates('dinner', true)}>
                                            <DinnerIcon fontSize="small" /> All D
                                        </Button>
                                    </Tooltip>
                                </Box>
                                {!hasSel ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                                        💡 Click & drag on date headers to select multiple columns
                                    </Typography>
                                ) : (
                                    <Box display="flex" alignItems="center" gap={1} flexGrow={1}>
                                        <Typography variant="body2" fontWeight="bold" color={SEL_BORDER}>
                                            {selectedColIndices.size} column(s) selected
                                        </Typography>
                                        <Button size="small" onClick={clearSelection}>Clear</Button>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* Save button row */}
                        {studentsByClass.length > 0 && dates.length > 0 && (
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center' }}>
                                {changesCount > 0 && (
                                    <Chip
                                        label={`${changesCount} unsaved change(s)`}
                                        color="warning"
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={isSaveLoading ? <CircularProgress size={18} /> : <SaveIcon />}
                                    onClick={handleMonthlyUpdateSave}
                                    disabled={isSaveLoading}
                                >
                                    {`Save All (${changesCount || '0'} changes)`}
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {loadMonthly && !hasLoadedInitialData && (
                        <Box sx={{ p: 8, textAlign: 'center' }}>
                            <CircularProgress />
                            <Typography sx={{ mt: 2 }}>Loading attendance data...</Typography>
                        </Box>
                    )}

                    {!loadMonthly && !studentsByClass.length && (
                        <Box sx={{ p: 8, textAlign: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No Residential students in this class</Typography>
                        </Box>
                    )}

                    {/* Attendance Table */}
                    {studentsByClass.length > 0 && dates.length > 0 && (
                        <TableContainer sx={{ maxHeight: '72vh', overflow: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell
                                            sx={{
                                                fontWeight: 700, bgcolor: '#EAECF0', minWidth: 220,
                                                position: 'sticky', left: 0, zIndex: 5,
                                            }}
                                        >
                                            Student
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                Click meal icons to toggle
                                            </Typography>
                                        </TableCell>

                                        {dates.map((date: string, dIdx: number) => {
                                            const sel = selectedColIndices.has(dIdx);
                                            const isWeekend = [0, 6].includes(dayjs(date).day());
                                            return (
                                                <TableCell
                                                    key={date}
                                                    align="center"
                                                    sx={{
                                                        minWidth: 90,
                                                        bgcolor: sel ? HEADER_SEL_BG : (isWeekend ? '#FFF3E0' : '#EAECF0'),
                                                        cursor: 'col-resize',
                                                        borderTop: sel ? `2px solid ${SEL_BORDER}` : 'none',
                                                        userSelect: 'none',
                                                    }}
                                                    onMouseDown={(e) => startColDrag(e, dIdx)}
                                                    onMouseEnter={(e) => extendColDrag(e, dIdx)}
                                                >
                                                    <Typography variant="caption" display="block" fontWeight={700}>
                                                        {dayjs(date).format('DD MMM')}
                                                    </Typography>
                                                    <Typography variant="caption" display="block" color={isWeekend ? 'warning.main' : 'text.secondary'}>
                                                        {dayjs(date).format('ddd')}
                                                    </Typography>
                                                </TableCell>
                                            );
                                        })}

                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#DBEAFE', minWidth: 100 }}>
                                            Total Meals
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#DBEAFE', minWidth: 120 }}>
                                            Cost (৳)
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {filteredStudents.map((student: Student) => {
                                        const totalMeals = getTotalMealsForStudent(student._id);
                                        const totalCost = totalMeals * mealRate;
                                        return (
                                            <TableRow hover key={student._id}>
                                                <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'white', zIndex: 1 }}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#4caf50' }}>
                                                            <PersonIcon sx={{ fontSize: 14 }} />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={500}>{student.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {student.studentId} | Roll: {student.studentClassRoll}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {dates.map((date: string, dIdx: number) => {
                                                    const total = getMealsForDay(student._id, date);
                                                    const b = getMealStatus(student._id, date, 'breakfast');
                                                    const l = getMealStatus(student._id, date, 'lunch');
                                                    const dn = getMealStatus(student._id, date, 'dinner');
                                                    const sel = selectedColIndices.has(dIdx);
                                                    const hasChange = !!attendanceChanges[`${student._id}_${date}`];

                                                    return (
                                                        <TableCell
                                                            key={date}
                                                            align="center"
                                                            sx={{
                                                                bgcolor: sel
                                                                    ? SEL_BG
                                                                    : total === 3
                                                                        ? '#F0FDF4'
                                                                        : total > 0
                                                                            ? '#FFFBEB'
                                                                            : '#FFF5F5',
                                                                cursor: 'cell',
                                                                border: hasChange ? '1.5px solid #f59e0b' : undefined,
                                                            }}
                                                            onMouseDown={(e) => { if (!(e.target as HTMLElement).closest('button')) startColDrag(e, dIdx); }}
                                                            onMouseEnter={(e) => extendColDrag(e, dIdx)}
                                                        >
                                                            <Box display="flex" justifyContent="center" gap={0.3}>
                                                                <IconButton
                                                                    size="small"
                                                                    color={b ? 'success' : 'default'}
                                                                    onClick={(e) => { e.stopPropagation(); handleMealToggle(student._id, date, 'breakfast'); }}
                                                                    sx={{ p: '2px' }}
                                                                    title="Breakfast"
                                                                >
                                                                    <BreakfastIcon sx={{ fontSize: 15 }} />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    color={l ? 'success' : 'default'}
                                                                    onClick={(e) => { e.stopPropagation(); handleMealToggle(student._id, date, 'lunch'); }}
                                                                    sx={{ p: '2px' }}
                                                                    title="Lunch"
                                                                >
                                                                    <LunchIcon sx={{ fontSize: 15 }} />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    color={dn ? 'success' : 'default'}
                                                                    onClick={(e) => { e.stopPropagation(); handleMealToggle(student._id, date, 'dinner'); }}
                                                                    sx={{ p: '2px' }}
                                                                    title="Dinner"
                                                                >
                                                                    <DinnerIcon sx={{ fontSize: 15 }} />
                                                                </IconButton>
                                                            </Box>
                                                            <Typography
                                                                variant="caption"
                                                                display="block"
                                                                fontWeight={700}
                                                                sx={{ color: total === 3 ? '#16a34a' : total > 0 ? '#b45309' : '#dc2626' }}
                                                            >
                                                                {total}/3
                                                            </Typography>
                                                        </TableCell>
                                                    );
                                                })}

                                                <TableCell align="center" sx={{ bgcolor: '#DBEAFE' }}>
                                                    <Typography fontWeight="bold" color="primary">{totalMeals}</Typography>
                                                </TableCell>
                                                <TableCell align="center" sx={{ bgcolor: '#DBEAFE' }}>
                                                    <Typography fontWeight="bold">৳{totalCost}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </LocalizationProvider>
    );
};

export default MealForm;
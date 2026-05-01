'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem,
    Button, IconButton, Alert, Snackbar, CircularProgress, Chip, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Avatar, Tooltip, Stack,
    TextField, InputAdornment, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox,
    FormControlLabel,
} from '@mui/material';
import {
    Save as SaveIcon, Download as DownloadIcon, Print as PrintIcon,
    Refresh as RefreshIcon, BreakfastDining as BreakfastIcon,
    LunchDining as LunchIcon, DinnerDining as DinnerIcon, Person as PersonIcon,
    Restaurant as FoodIcon, School as SchoolIcon,
    Search as SearchIcon, Clear as ClearIcon,
    CalendarMonth as CalendarIcon, AddTask as AddTaskIcon,
    EditCalendar as EditCalendarIcon,
    Fastfood as FastfoodIcon, RemoveCircle as RemoveCircleIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
    useBulkCreateAttendanceMutation,
    useUpdateAttendanceMutation,
    useGetMonthlyAttendanceSheetQuery,
    useGetAttendanceBySpecificDateQuery,
    useGetAttendanceByIdQuery,
} from '@/redux/api/mealAttendanceApi';
import { useAcademicOption } from '@/hooks/useAcademicOption';
import { useRouter } from 'next/navigation';

interface Student {
    _id: string; studentId: string; name: string; nameBangla: string;
    studentClassRoll: string; studentType: string; category?: string;
    className: Array<{ _id: string; className: string;[key: string]: any }>;
    admissionStatus: string; email?: string; mobile?: string; gender?: string;
}
interface ClassItem { _id: string; className: string; section?: string;[key: string]: any; }

// Excel selection colours
const SEL_BG = 'rgba(19,102,210,0.13)';
const SEL_BORDER = '#1366D2';
const HEADER_SEL_BG = 'rgba(19,102,210,0.28)';

const getCurrentAcademicYear = () => dayjs().year().toString();

interface MealFormProps {
    isUpdate?: boolean;
    attendanceId?: string;
}

const MealForm: React.FC<MealFormProps> = ({ isUpdate = false, attendanceId = '' }) => {
    const router = useRouter();
    const { classData, studentData } = useAcademicOption();
    const [bulkCreateAttendance, { isLoading: isSaving }] = useBulkCreateAttendanceMutation();
    const [updateAttendance, { isLoading: isUpdating }] = useUpdateAttendanceMutation();

    // Fetch single attendance data for update mode
    const { data: singleAttendanceData, isLoading: isLoadingSingle } = useGetAttendanceByIdQuery(
        attendanceId,
        { skip: !isUpdate || !attendanceId }
    );

    // core state
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs()); // Default to current month
    const [attendanceChanges, setAttendanceChanges] = useState<Record<string, any>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
    const [localAttendanceData, setLocalAttendanceData] = useState<Record<string, any>>({});
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

    // Excel column selection
    const [selectedColIndices, setSelectedColIndices] = useState<Set<number>>(new Set());
    const isDraggingCol = useRef(false);
    const dragStartCol = useRef(-1);
    const dragLastCol = useRef(-1);

    // Set initial data from API for update mode
    useEffect(() => {
        if (isUpdate && singleAttendanceData?.data && !hasLoadedInitialData) {
            const record = singleAttendanceData.data;

            // Set the date to the record's date
            if (record.date) {
                const date = dayjs(record.date);
                setSelectedMonth(date);
            }

            // Set the class
            if (record.student?.className && record.student.className.length > 0) {
                const classId = record.student.className[0];
                setSelectedClassId(classId);
            }

            setHasLoadedInitialData(true);
        }
    }, [isUpdate, singleAttendanceData, hasLoadedInitialData]);

    // data helpers
    const allStudents: Student[] = useMemo(() => {
        let s: any[] = [];
        if (studentData?.data?.data) s = studentData.data.data;
        else if (studentData?.data) s = studentData.data;
        else if (Array.isArray(studentData)) s = studentData;
        return s.filter((st: any) =>
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

    const classDropdownOptions = useMemo(
        () => allClasses.map((c: ClassItem) => ({ label: c.className, value: c._id })),
        [allClasses]
    );

    useEffect(() => {
        if (!isInitialized && classDropdownOptions.length && !selectedClassId) {
            const one = classDropdownOptions.find(o => o.label === 'One');
            setSelectedClassId(one ? one.value : classDropdownOptions[0].value);
            setIsInitialized(true);
        }
    }, [classDropdownOptions, selectedClassId, isInitialized]);

    const studentsByClass = useMemo(() => {
        if (!selectedClassId) return [];
        return allStudents.filter((s: Student) =>
            Array.isArray(s.className) &&
            s.className.some((c: any) => (c._id || c) === selectedClassId)
        );
    }, [allStudents, selectedClassId]);

    const className = allClasses.find((c: ClassItem) => c._id === selectedClassId)?.className || '';

    // API query for monthly attendance sheet
    const { data: monthlyData, isLoading: loadMonthly, refetch: refetchMonthly }
        = useGetMonthlyAttendanceSheetQuery(
            { className, month: selectedMonth?.format('YYYY-MM') || '', academicYear: getCurrentAcademicYear() },
            { skip: !className || !selectedMonth || isUpdate }
        );

    const isLoadingSheet = loadMonthly;
    const attendanceSheetData = monthlyData;
    const mealRate = attendanceSheetData?.mealRate || 55;

    // Generate all dates for the selected month
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

    // Initialize local attendance data with API data for update mode
    useEffect(() => {
        if (isUpdate && singleAttendanceData?.data && studentsByClass.length > 0 && dates.length > 0 && !hasLoadedInitialData) {
            const record = singleAttendanceData.data;
            const initialData: Record<string, any> = {};

            studentsByClass.forEach((student: Student) => {
                dates.forEach((date: string) => {
                    const key = `${student._id}_${date}`;
                    // If this is the student we're updating, use their data
                    if (student._id === record.student?._id && date === dayjs(record.date).format('YYYY-MM-DD')) {
                        initialData[key] = {
                            breakfast: record.breakfast,
                            lunch: record.lunch,
                            dinner: record.dinner,
                        };
                    } else {
                        initialData[key] = {
                            breakfast: true,
                            lunch: true,
                            dinner: true,
                        };
                    }
                });
            });

            setLocalAttendanceData(initialData);
            setHasLoadedInitialData(true);
        }
    }, [singleAttendanceData, studentsByClass, dates, isUpdate, hasLoadedInitialData]);

    // Regular initialization for non-update mode
    useEffect(() => {
        if (!isUpdate && studentsByClass.length > 0 && dates.length > 0) {
            const init: Record<string, any> = {};
            attendanceSheetData?.students?.forEach((apiS: any) => {
                apiS.attendance?.forEach((att: any) => {
                    init[`${apiS.student.id}_${att.date}`] = { breakfast: att.breakfast, lunch: att.lunch, dinner: att.dinner };
                });
            });
            studentsByClass.forEach((s: Student) => {
                dates.forEach((d: string) => {
                    const k = `${s._id}_${d}`;
                    if (!init[k]) init[k] = { breakfast: true, lunch: true, dinner: true };
                });
            });
            setLocalAttendanceData(init);
            setSelectedColIndices(new Set());
        }
    }, [attendanceSheetData, studentsByClass, dates, isUpdate]);

    // Meal helpers
    const getMealStatus = useCallback((sid: string, date: string, meal: string): boolean => {
        const k = `${sid}_${date}`;
        if (attendanceChanges[k] && meal in attendanceChanges[k]) return attendanceChanges[k][meal];
        return localAttendanceData[k]?.[meal] ?? false;
    }, [attendanceChanges, localAttendanceData]);

    const getMealsForDay = useCallback((sid: string, date: string) =>
        (getMealStatus(sid, date, 'breakfast') ? 1 : 0) +
        (getMealStatus(sid, date, 'lunch') ? 1 : 0) +
        (getMealStatus(sid, date, 'dinner') ? 1 : 0)
        , [getMealStatus]);

    const getTotalMealsForStudent = useCallback((sid: string) =>
        dates.reduce((a: number, d: string) => a + getMealsForDay(sid, d), 0)
        , [dates, getMealsForDay]);

    const handleMealToggle = (sid: string, date: string, meal: string) => {
        const cur = getMealStatus(sid, date, meal);
        const k = `${sid}_${date}`;
        setAttendanceChanges(prev => ({ ...prev, [k]: { ...prev[k], studentId: sid, date, [meal]: !cur } }));
    };

    // Excel-like column drag selection
    const buildRange = (a: number, b: number): Set<number> => {
        const s = new Set<number>();
        const lo = Math.min(a, b), hi = Math.max(a, b);
        for (let i = lo; i <= hi; i++) s.add(i);
        return s;
    };

    const startColDrag = (e: React.MouseEvent, colIdx: number) => {
        if (e.button !== 0) return;
        e.preventDefault();
        isDraggingCol.current = true;
        dragStartCol.current = colIdx;
        dragLastCol.current = colIdx;

        if (e.shiftKey && selectedColIndices.size > 0) {
            const firstSel = Math.min(...Array.from(selectedColIndices));
            setSelectedColIndices(buildRange(firstSel, colIdx));
        } else if (e.ctrlKey || e.metaKey) {
            setSelectedColIndices(prev => {
                const next = new Set(prev);
                if (next.has(colIdx)) next.delete(colIdx); else next.add(colIdx);
                return next;
            });
        } else {
            setSelectedColIndices(new Set([colIdx]));
        }
    };

    const extendColDrag = (e: React.MouseEvent, colIdx: number) => {
        if (!isDraggingCol.current || colIdx === dragLastCol.current) return;
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
        const targetDates = Array.from(selectedColIndices).map(i => dates[i]).filter(Boolean);
        const nc = { ...attendanceChanges }, nl = { ...localAttendanceData };
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
            severity: 'success'
        });
        clearSelection();
    };

    const setAllMealsValue = (value: boolean) => {
        const nc: Record<string, any> = {}, nl: Record<string, any> = {};
        studentsByClass.forEach((s: Student) => {
            dates.forEach((d: string) => {
                const k = `${s._id}_${d}`;
                nc[k] = { studentId: s._id, date: d, breakfast: value, lunch: value, dinner: value };
                nl[k] = { breakfast: value, lunch: value, dinner: value };
            });
        });
        setAttendanceChanges(nc); setLocalAttendanceData(nl);
        setSnackbar({ open: true, message: value ? '✅ All meals added!' : '❌ All meals removed!', severity: 'success' });
    };

    const assignMealAllDates = (meal: string, value: boolean) => {
        const nc = { ...attendanceChanges };
        studentsByClass.forEach((s: Student) => dates.forEach((d: string) => {
            const k = `${s._id}_${d}`;
            nc[k] = { ...nc[k], studentId: s._id, date: d, [meal]: value };
        }));
        setAttendanceChanges(nc);
        setSnackbar({ open: true, message: `${meal} ${value ? 'added' : 'removed'} for all dates`, severity: 'success' });
    };

    // Save function for update mode
    const handleUpdateSave = async () => {
        if (!attendanceId) return;

        const changes = Object.values(attendanceChanges);
        let attendanceToSave;

        if (changes.length > 0) {
            attendanceToSave = changes[0];
        } else if (dates[0] && studentsByClass.length > 0) {
            const firstStudent = studentsByClass[0];
            attendanceToSave = {
                studentId: firstStudent._id,
                date: dates[0],
                breakfast: localAttendanceData[`${firstStudent._id}_${dates[0]}`]?.breakfast ?? false,
                lunch: localAttendanceData[`${firstStudent._id}_${dates[0]}`]?.lunch ?? false,
                dinner: localAttendanceData[`${firstStudent._id}_${dates[0]}`]?.dinner ?? false,
            };
        } else {
            setSnackbar({ open: true, message: 'No data to save', severity: 'warning' });
            return;
        }

        try {
            await updateAttendance({
                id: attendanceId,
                data: {
                    student: attendanceToSave.studentId,
                    date: attendanceToSave.date,
                    breakfast: attendanceToSave.breakfast,
                    lunch: attendanceToSave.lunch,
                    dinner: attendanceToSave.dinner,
                    academicYear: getCurrentAcademicYear(),
                }
            }).unwrap();

            setSnackbar({ open: true, message: 'Attendance updated successfully!', severity: 'success' });
            setAttendanceChanges({});

            setTimeout(() => {
                router.push('/dashboard/daily-meal-report');
            }, 1500);
        } catch (err: any) {
            setSnackbar({ open: true, message: err?.data?.message || 'Failed to update', severity: 'error' });
        }
    };

    // Save function for bulk/create mode
    const handleSaveAll = async () => {
        const changes = Object.values(attendanceChanges);
        if (!changes.length) { setSnackbar({ open: true, message: 'No changes to save', severity: 'info' }); return; }
        try {
            const result = await bulkCreateAttendance({
                academicYear: getCurrentAcademicYear(),
                attendances: changes.map((c: any) => ({
                    studentId: c.studentId, date: c.date,
                    breakfast: c.breakfast ?? false, lunch: c.lunch ?? false, dinner: c.dinner ?? false,
                })),
            }).unwrap();
            const nl = { ...localAttendanceData };
            changes.forEach((c: any) => {
                nl[`${c.studentId}_${c.date}`] = { breakfast: c.breakfast ?? false, lunch: c.lunch ?? false, dinner: c.dinner ?? false };
            });
            setLocalAttendanceData(nl); setAttendanceChanges({});
            setSnackbar({ open: true, message: `${result.totalProcessed || changes.length} records saved`, severity: 'success' });
            refetchMonthly();
        } catch (err: any) {
            setSnackbar({ open: true, message: err?.data?.message || 'Failed to save', severity: 'error' });
        }
    };

    const handleReset = () => {
        setAttendanceChanges({}); clearSelection();
        const nl = { ...localAttendanceData };
        studentsByClass.forEach((s: Student) => dates.forEach((d: string) => {
            nl[`${s._id}_${d}`] = { breakfast: true, lunch: true, dinner: true };
        }));
        setLocalAttendanceData(nl);
        setSnackbar({ open: true, message: 'Reset — all meals set to present', severity: 'info' });
    };

    const handleRefresh = () => {
        setAttendanceChanges({}); clearSelection();
        refetchMonthly();
        setSnackbar({ open: true, message: 'Data refreshed', severity: 'success' });
    };

    const filteredStudents = useMemo(() =>
        studentsByClass.filter((s: Student) =>
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.nameBangla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.studentClassRoll?.toString().includes(searchTerm) ||
            s.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        , [studentsByClass, searchTerm]);

    // Loading state for update mode
    if (isUpdate && isLoadingSingle) {
        return (
            <Box sx={{ p: 4 }}>
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }} color="text.secondary">Loading attendance data...</Typography>
                </Paper>
            </Box>
        );
    }

    if (!classDropdownOptions.length) {
        return (
            <Box sx={{ p: 4 }}>
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }} color="text.secondary">Loading class data…</Typography>
                </Paper>
            </Box>
        );
    }

    const hasSel = selectedColIndices.size > 0;
    const selLabels = Array.from(selectedColIndices).sort((a, b) => a - b)
        .map(i => dates[i] ? dayjs(dates[i]).format('DD MMM') : '').filter(Boolean);

    // Show update title
    const pageTitle = isUpdate ? 'Update Meal Attendance' : 'Meal Attendance Management';
    const pageSubtitle = isUpdate
        ? `Updating attendance for ${singleAttendanceData?.data?.student?.name || 'Student'} on ${dayjs(singleAttendanceData?.data?.date).format('DD MMMM YYYY')}`
        : 'Track and manage daily meal attendance for Residential students';

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#f5f7fa', minHeight: '100vh' }}>

                {/* Header Section */}
                <Paper sx={{
                    p: 3, mb: 3, borderRadius: 3,
                    background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', color: 'white'
                }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                {isUpdate && (
                                    <IconButton
                                        onClick={() => router.push('/dashboard/daily-meal-report')}
                                        sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                                    >
                                        <ArrowBackIcon />
                                    </IconButton>
                                )}
                                <Typography variant="h4" fontWeight="bold">
                                    <FoodIcon sx={{ mr: 1, verticalAlign: 'middle' }} />{pageTitle}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {pageSubtitle}
                            </Typography>
                        </Box>
                        <Box mt={{ xs: 2, sm: 0 }} display="flex" gap={1} flexWrap="wrap">
                            <Chip label={`AY: ${getCurrentAcademicYear()}`}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                            {className && <Chip label={`Class: ${className}`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
                            <Chip label="Residential Only" color="success" />
                            {isUpdate && <Chip label="Edit Mode" color="warning" />}
                        </Box>
                    </Box>
                </Paper>

                {/* Main Panel */}
                <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>

                    {/* Toolbar */}
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Select Class</InputLabel>
                                    <Select value={selectedClassId} label="Select Class"
                                        onChange={e => { setSelectedClassId(e.target.value); setAttendanceChanges({}); clearSelection(); }}
                                        disabled={isUpdate}>
                                        {classDropdownOptions.map((o: any) => (
                                            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {!isUpdate && (
                                <Grid item xs={12} sm={3}>
                                    <DatePicker
                                        label="Select Month"
                                        views={['year', 'month']}
                                        value={selectedMonth}
                                        onChange={v => {
                                            setSelectedMonth(v);
                                            setAttendanceChanges({});
                                            clearSelection();
                                        }}
                                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12} sm={2}>
                                <TextField fullWidth size="small" placeholder="Search student…"
                                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setSearchTerm('')}><ClearIcon fontSize="small" /></IconButton>
                                            </InputAdornment>
                                        ),
                                    }} />
                            </Grid>

                            {!isUpdate && (
                                <Grid item xs="auto">
                                    <Button variant="outlined" startIcon={<RefreshIcon />}
                                        onClick={handleRefresh} disabled={isLoadingSheet} size="small">
                                        Refresh
                                    </Button>
                                </Grid>
                            )}
                        </Grid>

                        {/* Selection Status Bar - only in create mode */}
                        {!isUpdate && studentsByClass.length > 0 && dates.length > 0 && (
                            <Box sx={{
                                mt: 2, p: '10px 16px',
                                bgcolor: hasSel ? '#EBF3FF' : '#f8f9fa',
                                border: hasSel ? `1.5px solid ${SEL_BORDER}` : '1px solid #e0e0e0',
                                borderRadius: 2,
                                display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center',
                                transition: 'all 0.18s',
                            }}>
                                <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                                    <Button variant="contained" color="success" size="small"
                                        startIcon={<FastfoodIcon />}
                                        onClick={() => hasSel ? applyToSelectedCols(true) : setAllMealsValue(true)}
                                        sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                                        {hasSel ? `Add Full Meal (${selectedColIndices.size} col)` : 'Add All Meals'}
                                    </Button>

                                    <Button variant="contained" color="error" size="small"
                                        startIcon={<RemoveCircleIcon />}
                                        onClick={() => hasSel ? applyToSelectedCols(false) : setAllMealsValue(false)}
                                        sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                                        {hasSel ? `Remove Full Meal (${selectedColIndices.size} col)` : 'Remove All Meals'}
                                    </Button>

                                    <Divider orientation="vertical" flexItem />

                                    <Tooltip title="Add Breakfast — all dates">
                                        <Button size="small" variant="outlined" onClick={() => assignMealAllDates('breakfast', true)}>
                                            <BreakfastIcon fontSize="small" sx={{ mr: 0.4 }} />All B
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Add Lunch — all dates">
                                        <Button size="small" variant="outlined" onClick={() => assignMealAllDates('lunch', true)}>
                                            <LunchIcon fontSize="small" sx={{ mr: 0.4 }} />All L
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Add Dinner — all dates">
                                        <Button size="small" variant="outlined" onClick={() => assignMealAllDates('dinner', true)}>
                                            <DinnerIcon fontSize="small" sx={{ mr: 0.4 }} />All D
                                        </Button>
                                    </Tooltip>
                                </Box>

                                {!hasSel && (
                                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                                        💡 <strong>Click</strong> a date column header or drag across multiple headers to select.&nbsp;
                                        <kbd style={{ fontSize: 11, background: '#eee', padding: '1px 5px', borderRadius: 3, border: '1px solid #ccc' }}>Shift</kbd>&nbsp;extend &nbsp;
                                        <kbd style={{ fontSize: 11, background: '#eee', padding: '1px 5px', borderRadius: 3, border: '1px solid #ccc' }}>Ctrl</kbd>&nbsp;multi-pick
                                    </Typography>
                                )}

                                {hasSel && (
                                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" flexGrow={1}>
                                        <Typography variant="body2" fontWeight="bold" color={SEL_BORDER}>
                                            {selectedColIndices.size} column(s) selected:
                                        </Typography>
                                        {selLabels.slice(0, 10).map(lbl => (
                                            <Chip key={lbl} label={lbl} size="small"
                                                sx={{ bgcolor: HEADER_SEL_BG, color: SEL_BORDER, fontWeight: 'bold', height: 22 }} />
                                        ))}
                                        {selLabels.length > 10 && (
                                            <Chip label={`+${selLabels.length - 10} more`} size="small" variant="outlined" />
                                        )}
                                        <Button size="small" onClick={clearSelection} sx={{ ml: 1, minWidth: 60 }}>Clear</Button>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* Save / export row */}
                        {studentsByClass.length > 0 && dates.length > 0 && (
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                                {!isUpdate && (
                                    <>
                                        <Button size="small" startIcon={<DownloadIcon />}
                                            onClick={() => setSnackbar({ open: true, message: 'Excel download starting…', severity: 'success' })}>
                                            Export
                                        </Button>
                                        <Button size="small" startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button>
                                        <Button size="small" color="error" onClick={handleReset}
                                            disabled={!Object.keys(attendanceChanges).length}>Cancel</Button>
                                    </>
                                )}
                                <Button variant="contained"
                                    startIcon={isSaving || isUpdating ? <CircularProgress size={18} /> : <SaveIcon />}
                                    onClick={isUpdate ? handleUpdateSave : handleSaveAll}
                                    disabled={isSaving || isUpdating}>
                                    {isUpdate ? 'Update Attendance' : (Object.keys(attendanceChanges).length ? `Save (${Object.keys(attendanceChanges).length})` : 'Save')}
                                </Button>
                            </Box>
                        )}

                        {!isUpdate && Object.keys(attendanceChanges).length > 0 && (
                            <Alert severity="warning" sx={{ mt: 1.5 }} onClose={handleReset}>
                                <strong>{Object.keys(attendanceChanges).length} unsaved change(s)!</strong> Please save.
                            </Alert>
                        )}
                    </Box>

                    {/* Loading */}
                    {isLoadingSheet && !dates.length && !isUpdate && (
                        <Box sx={{ p: 8, textAlign: 'center' }}>
                            <CircularProgress />
                            <Typography sx={{ mt: 2 }} color="text.secondary">Loading…</Typography>
                        </Box>
                    )}

                    {!isLoadingSheet && selectedClassId && !studentsByClass.length && (
                        <Box sx={{ p: 8, textAlign: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No Residential students in this class</Typography>
                        </Box>
                    )}

                    {/* Attendance Table */}
                    {selectedClassId && filteredStudents.length > 0 && dates.length > 0 && (
                        <TableContainer sx={{
                            maxHeight: '72vh', overflow: 'auto',
                            WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none',
                        }}>
                            <Table stickyHeader size="small" sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>

                                {/* Header */}
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{
                                            fontWeight: 700, bgcolor: '#EAECF0', minWidth: 120, zIndex: 4,
                                            borderRight: '2px solid #CDD0D5', fontSize: 12
                                        }}>
                                            Roll No
                                        </TableCell>
                                        <TableCell sx={{
                                            fontWeight: 700, bgcolor: '#EAECF0', minWidth: 190,
                                            position: 'sticky', left: 0, zIndex: 5, borderRight: '2px solid #CDD0D5', fontSize: 12
                                        }}>
                                            Student Name
                                        </TableCell>

                                        {/* DATE HEADERS - draggable */}
                                        {dates.map((date: string, dIdx: number) => {
                                            const sel = selectedColIndices.has(dIdx);
                                            return (
                                                <TableCell key={date} align="center"
                                                    sx={{
                                                        minWidth: 108,
                                                        bgcolor: sel ? HEADER_SEL_BG : '#EAECF0',
                                                        borderLeft: sel ? `2px solid ${SEL_BORDER}` : '1px solid #D0D3D8',
                                                        borderRight: sel ? `2px solid ${SEL_BORDER}` : '1px solid #D0D3D8',
                                                        borderTop: sel ? `3px solid ${SEL_BORDER}` : '2px solid #EAECF0',
                                                        cursor: !isUpdate ? 'col-resize' : 'default',
                                                        zIndex: 3, p: '6px 4px',
                                                        transition: 'background 0.1s',
                                                        '&:hover': { bgcolor: !isUpdate && sel ? HEADER_SEL_BG : !isUpdate ? '#D8DDED' : '#EAECF0' },
                                                    }}
                                                    onMouseDown={!isUpdate ? (e) => startColDrag(e, dIdx) : undefined}
                                                    onMouseEnter={!isUpdate ? (e) => extendColDrag(e, dIdx) : undefined}
                                                >
                                                    <Typography variant="caption" display="block" fontWeight={700}
                                                        sx={{ color: sel ? SEL_BORDER : '#1a1a2e', lineHeight: 1.2 }}>
                                                        {dayjs(date).format('DD MMM')}
                                                    </Typography>
                                                    <Typography variant="caption" display="block"
                                                        sx={{ color: sel ? SEL_BORDER : '#666', lineHeight: 1.2 }}>
                                                        {dayjs(date).format('ddd')}
                                                    </Typography>
                                                    {sel && (
                                                        <Box sx={{
                                                            width: 7, height: 7, borderRadius: '50%',
                                                            bgcolor: SEL_BORDER, mx: 'auto', mt: '3px'
                                                        }} />
                                                    )}
                                                </TableCell>
                                            );
                                        })}

                                        <TableCell align="center" sx={{
                                            fontWeight: 700, bgcolor: '#DBEAFE',
                                            minWidth: 88, borderLeft: '2px solid #93C5FD', zIndex: 3, fontSize: 12
                                        }}>
                                            Total Meals
                                        </TableCell>
                                        <TableCell align="center" sx={{
                                            fontWeight: 700, bgcolor: '#DBEAFE',
                                            minWidth: 110, zIndex: 3, fontSize: 12
                                        }}>
                                            Total Cost (৳)
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                {/* Body */}
                                <TableBody>
                                    {filteredStudents.map((student: Student) => {
                                        const totalMeals = getTotalMealsForStudent(student._id);
                                        const totalCost = totalMeals * mealRate;

                                        return (
                                            <TableRow hover key={student._id}>
                                                <TableCell sx={{ borderRight: '2px solid #CDD0D5', fontSize: 12 }}>
                                                    <Typography variant="body2">{student.studentClassRoll || 'N/A'}</Typography>
                                                </TableCell>
                                                <TableCell sx={{
                                                    position: 'sticky', left: 0, bgcolor: 'white', zIndex: 1,
                                                    borderRight: '2px solid #CDD0D5'
                                                }}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#4caf50', fontSize: 12 }}>
                                                            <PersonIcon sx={{ fontSize: 14 }} />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.2 }}>
                                                                {student.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {student.nameBangla || '—'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {/* DATE BODY CELLS */}
                                                {dates.map((date: string, dIdx: number) => {
                                                    const sel = selectedColIndices.has(dIdx);
                                                    const total = getMealsForDay(student._id, date);
                                                    const b = getMealStatus(student._id, date, 'breakfast');
                                                    const l = getMealStatus(student._id, date, 'lunch');
                                                    const dn = getMealStatus(student._id, date, 'dinner');

                                                    return (
                                                        <TableCell key={date} align="center"
                                                            sx={{
                                                                bgcolor: sel
                                                                    ? SEL_BG
                                                                    : total === 3 ? '#F0FDF4'
                                                                        : total > 0 ? '#FFFBEB'
                                                                            : '#FFF5F5',
                                                                borderLeft: sel ? `2px solid ${SEL_BORDER}` : '1px solid #E8E9EC',
                                                                borderRight: sel ? `2px solid ${SEL_BORDER}` : '1px solid #E8E9EC',
                                                                borderBottom: sel ? `1px solid ${SEL_BORDER}40` : '1px solid #E8E9EC',
                                                                p: '4px 2px',
                                                                cursor: !isUpdate ? 'cell' : 'default',
                                                                transition: 'background 0.08s',
                                                                '&:hover': { bgcolor: !isUpdate && sel ? SEL_BG : !isUpdate ? '#EFF6FF' : undefined },
                                                            }}
                                                            onMouseDown={!isUpdate ? (e) => { if (!(e.target as HTMLElement).closest('button')) startColDrag(e, dIdx); } : undefined}
                                                            onMouseEnter={!isUpdate ? (e) => extendColDrag(e, dIdx) : undefined}
                                                        >
                                                            <Box display="flex" justifyContent="center" gap={0.2}>
                                                                <Tooltip title={`Breakfast: ${b ? 'Present' : 'Absent'}`}>
                                                                    <IconButton size="small"
                                                                        color={b ? 'success' : 'default'}
                                                                        sx={{
                                                                            p: '2px', opacity: b ? 1 : 0.3,
                                                                            '&:hover': { opacity: 1, bgcolor: 'transparent' }
                                                                        }}
                                                                        onClick={e => { e.stopPropagation(); handleMealToggle(student._id, date, 'breakfast'); }}
                                                                        disabled={isUpdate}>
                                                                        <BreakfastIcon sx={{ fontSize: 15 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title={`Lunch: ${l ? 'Present' : 'Absent'}`}>
                                                                    <IconButton size="small"
                                                                        color={l ? 'success' : 'default'}
                                                                        sx={{
                                                                            p: '2px', opacity: l ? 1 : 0.3,
                                                                            '&:hover': { opacity: 1, bgcolor: 'transparent' }
                                                                        }}
                                                                        onClick={e => { e.stopPropagation(); handleMealToggle(student._id, date, 'lunch'); }}
                                                                        disabled={isUpdate}>
                                                                        <LunchIcon sx={{ fontSize: 15 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title={`Dinner: ${dn ? 'Present' : 'Absent'}`}>
                                                                    <IconButton size="small"
                                                                        color={dn ? 'success' : 'default'}
                                                                        sx={{
                                                                            p: '2px', opacity: dn ? 1 : 0.3,
                                                                            '&:hover': { opacity: 1, bgcolor: 'transparent' }
                                                                        }}
                                                                        onClick={e => { e.stopPropagation(); handleMealToggle(student._id, date, 'dinner'); }}
                                                                        disabled={isUpdate}>
                                                                        <DinnerIcon sx={{ fontSize: 15 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                            <Typography variant="caption" display="block" align="center"
                                                                sx={{
                                                                    color: total === 3 ? '#16a34a' : total > 0 ? '#b45309' : '#dc2626',
                                                                    fontWeight: 700, lineHeight: 1.1, mt: '1px', fontSize: 11,
                                                                }}>
                                                                {total}/3
                                                            </Typography>
                                                        </TableCell>
                                                    );
                                                })}

                                                <TableCell align="center"
                                                    sx={{ bgcolor: '#DBEAFE', borderLeft: '2px solid #93C5FD' }}>
                                                    <Typography fontWeight="bold" color="primary">{totalMeals}</Typography>
                                                </TableCell>
                                                <TableCell align="center" sx={{ bgcolor: '#DBEAFE' }}>
                                                    <Typography fontWeight="bold">৳{totalCost.toLocaleString()}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {!isLoadingSheet && selectedClassId && filteredStudents.length > 0 && !dates.length && (
                        <Box sx={{ p: 8, textAlign: 'center' }}>
                            <CalendarIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No dates found</Typography>
                        </Box>
                    )}
                </Paper>

                {/* Snackbar */}
                <Snackbar open={snackbar.open} autoHideDuration={4000}
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <Alert severity={snackbar.severity} variant="filled"
                        onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </LocalizationProvider>
    );
};

export default MealForm;
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { COL_HEADER_BG, COL_SEL_BG, COL_SEL_BORDER, DEFAULT_MEAL_RATES, FREE_MEAL_BG, PERSON_AVATARS, PERSON_LABELS, ROW_SEL_BG, ROW_SEL_BORDER, TAB_COLORS } from '@/constant/meal';
import { useAcademicOption } from '@/hooks/useAcademicOption';
import { MealRates, PersonRow, PersonType } from '@/interface/meal';
import {
    useBulkCreateAttendanceMutation,
    useGetMonthlyAttendanceSheetQuery,
} from '@/redux/api/mealAttendanceApi';
import { useGetAllStaffQuery } from '@/redux/api/staffApi';
import { useGetAllTeachersQuery } from '@/redux/api/teacherApi';
import {
    ArrowBack as ArrowBackIcon,
    BreakfastDining as BreakfastIcon,
    CalendarMonth as CalendarIcon,
    Clear as ClearIcon,
    DinnerDining as DinnerIcon,
    LunchDining as LunchIcon,
    RemoveCircle as RemoveCircleIcon,
    Save as SaveIcon,
    School as SchoolIcon,
    Search as SearchIcon,
    ViewColumn as ColumnIcon,
    ViewList as RowIcon,
    CheckBox as CheckBoxIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
    Add as AddIcon,
    MoneyOff,
    MoneyOffCsred,
    Group as GroupIcon,
    Engineering as StaffIcon,
    Person as PersonIcon,
    Tune as TuneIcon,
    RestartAlt as RestartAltIcon,
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
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';



interface UpdateMealFormProps {
    monthlyUpdateClassName?: string;
    monthlyUpdateMonth: string;
    monthlyUpdateAcademicYear: string;
    initialPersonType?: PersonType;
}

const UpdateMealForm: React.FC<UpdateMealFormProps> = ({
    monthlyUpdateClassName = '',
    monthlyUpdateMonth,
    monthlyUpdateAcademicYear,
    initialPersonType = 'student',
}) => {
    const router = useRouter();
    const { classData, studentData } = useAcademicOption();
    const [bulkCreateAttendance, { isLoading: isSaving }] = useBulkCreateAttendanceMutation();
    const category = 'Residential'
    const { data: staffApiData } = useGetAllStaffQuery({ category: category });
    const { data: teacherApiData } = useGetAllTeachersQuery({ category: category, sort: 'teacherSerial' } as any);

    // ─── Core state ────────────────────────────────────────────────────────────
    const [personType, setPersonType] = useState<PersonType>(initialPersonType);
    const [selectedMonth, setSelectedMonth] = useState(dayjs(monthlyUpdateMonth || undefined));
    const [attendanceChanges, setAttendanceChanges] = useState<Record<string, any>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [localAttendanceData, setLocalAttendanceData] = useState<Record<string, any>>({});
    const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

    // Selection state
    const [selectionMode, setSelectionMode] = useState<'row' | 'col'>('col');
    const [selectedColIndices, setSelectedColIndices] = useState<Set<number>>(new Set());
    const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());

    // Custom meal rates
    const [customRates, setCustomRates] = useState<MealRates | null>(null);
    const [showRateEditor, setShowRateEditor] = useState(false);

    const isDragging = useRef(false);
    const dragStartIdx = useRef(-1);
    const dragLastIdx = useRef(-1);

    // ─── Person lists ───────────────────────────────────────────────────────────

    const allStudents: PersonRow[] = useMemo(() => {
        let s: any[] = [];
        if (studentData?.data?.data) s = studentData.data.data;
        else if (studentData?.data) s = studentData.data;
        else if (Array.isArray(studentData)) s = studentData;
        return s.filter((st: any) =>
            st.admissionStatus === 'enrolled' &&
            (['Residential', 'Non-Residential One Meal'].includes(st.category) || st.studentType === 'Residential'),
        );
    }, [studentData]);

    const allTeachers: PersonRow[] = useMemo(() => {
        const data = teacherApiData?.data?.data || teacherApiData?.data || [];
        return (Array.isArray(data) ? data : []).filter((t: any) => t.status === 'Active');
    }, [teacherApiData]);

    const allStaff: PersonRow[] = useMemo(() => {
        const data = staffApiData?.data?.data || staffApiData?.data || [];
        return (Array.isArray(data) ? data : []).filter((s: any) => s.status === 'Active');
    }, [staffApiData]);

    // Filter Students by Class
    const studentsByClass: PersonRow[] = useMemo(() => {
        if (monthlyUpdateClassName) {
            return allStudents.filter((s: any) =>
                Array.isArray(s.className) &&
                s.className.some((c: any) => (c.className || c) === monthlyUpdateClassName),
            );
        }
        return allStudents;
    }, [allStudents, monthlyUpdateClassName]);

    // Active persons for current tab
    const personsByClass: PersonRow[] = useMemo(() => {
        if (personType === 'teacher') return allTeachers;
        if (personType === 'staff') return allStaff;
        return studentsByClass;
    }, [personType, studentsByClass, allTeachers, allStaff]);


    const { data: monthlyData, isLoading: loadMonthly, refetch: refetchMonthly } =
        useGetMonthlyAttendanceSheetQuery(
            {
                personType,
                className: personType === 'student' ? (monthlyUpdateClassName || undefined) : undefined,
                month: selectedMonth.format('YYYY-MM'),
                academicYear: monthlyUpdateAcademicYear,
            },
            { skip: !monthlyUpdateMonth },
        );


    const sheetData = useMemo(() => monthlyData?.data || monthlyData, [monthlyData]);

    // Default rates from API
    const apiMealRates: MealRates = useMemo(() => {
        const apiRates = sheetData?.mealRates;
        return {
            breakfast: apiRates?.breakfast ?? DEFAULT_MEAL_RATES.breakfast,
            lunch: apiRates?.lunch ?? DEFAULT_MEAL_RATES.lunch,
            dinner: apiRates?.dinner ?? DEFAULT_MEAL_RATES.dinner,
        };
    }, [sheetData]);

    // Effective rates = custom override (if set) else API/default rates
    const mealRates: MealRates = customRates ?? apiMealRates;

    const isCustomRate =
        !!customRates &&
        (customRates.breakfast !== apiMealRates.breakfast ||
            customRates.lunch !== apiMealRates.lunch ||
            customRates.dinner !== apiMealRates.dinner);

    const handleRateChange = (meal: keyof MealRates, value: string) => {
        const num = value === '' ? 0 : Math.max(0, Number(value));
        setCustomRates(prev => ({
            breakfast: prev?.breakfast ?? apiMealRates.breakfast,
            lunch: prev?.lunch ?? apiMealRates.lunch,
            dinner: prev?.dinner ?? apiMealRates.dinner,
            [meal]: num,
        }));
    };


    // ─── Dates ──────────────────────────────────────────────────────────────────

    const dates = useMemo<string[]>(() => {
        if (sheetData?.dates?.length) return sheetData.dates;
        const list: string[] = [];
        let cur = selectedMonth.startOf('month');
        const e = selectedMonth.endOf('month');
        while (!cur.isAfter(e)) { list.push(cur.format('YYYY-MM-DD')); cur = cur.add(1, 'day'); }
        return list;
    }, [sheetData, selectedMonth]);

    // ─── Selection helpers ────────────────────────────────────────────────────────

    const clearSelection = () => { setSelectedColIndices(new Set()); setSelectedRowIndices(new Set()); };

    useEffect(() => { clearSelection(); }, [searchTerm, selectionMode, personType]);

    // ─── Tab change (user-initiated, from the tabs in this page) ───────────────

    const handlePersonTypeChange = (_: any, newType: PersonType | null) => {
        if (!newType) return;
        setPersonType(newType);
        setAttendanceChanges({});
        setLocalAttendanceData({});
        clearSelection();
        setHasLoadedInitialData(false);
        setCustomRates(null);
    };
    useEffect(() => {
        setPersonType(initialPersonType);
        setAttendanceChanges({});
        setLocalAttendanceData({});
        clearSelection();
        setHasLoadedInitialData(false);
        setCustomRates(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialPersonType]);

    useEffect(() => {
        if (!monthlyUpdateMonth) return;
        const next = dayjs(monthlyUpdateMonth);
        if (!next.isValid() || next.isSame(selectedMonth, 'month')) return;

        setSelectedMonth(next);
        setAttendanceChanges({});
        setLocalAttendanceData({});
        clearSelection();
        setHasLoadedInitialData(false);
        setCustomRates(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monthlyUpdateMonth]);

    // ─── Load initial data from API sheet ───────────────────────────────────────

    useEffect(() => {
        if (personsByClass.length > 0 && dates.length > 0 && !hasLoadedInitialData && sheetData) {
            const init: Record<string, any> = {};

            // 1. Load existing API records
            sheetData?.persons?.forEach((apiP: any) => {
                // Prioritize _id (standard Mongoose) then id
                const pid = apiP.person?._id?.toString() || apiP.person?.id?.toString() || apiP.student?._id?.toString() || apiP.student?.id?.toString();

                if (!pid) return;

                apiP.attendance?.forEach((att: any) => {
                    init[`${pid}_${att.date}`] = {
                        breakfast: att.breakfast === true,
                        lunch: att.lunch === true,
                        dinner: att.dinner === true,
                        isFreeMeal: att.isFreeMeal === true,
                        // Store Rates: Use API record rate if exists, else use API default rates
                        breakfastRate: att.breakfastRate ?? apiMealRates.breakfast,
                        lunchRate: att.lunchRate ?? apiMealRates.lunch,
                        dinnerRate: att.dinnerRate ?? apiMealRates.dinner,
                    };
                });
            });

            // 2. Fill gaps (missing records) with Defaults
            personsByClass.forEach((p: any) => {
                dates.forEach((d) => {
                    const k = `${p._id}_${d}`;
                    if (!init[k]) {
                        init[k] = {
                            breakfast: true,
                            lunch: true,
                            dinner: true,
                            isFreeMeal: false,
                            // Fill gaps with API default rates
                            breakfastRate: apiMealRates.breakfast,
                            lunchRate: apiMealRates.lunch,
                            dinnerRate: apiMealRates.dinner,
                        };
                    }
                });
            });

            setLocalAttendanceData(init);
            setHasLoadedInitialData(true);
            clearSelection();
        }
    }, [sheetData, personsByClass, dates, hasLoadedInitialData, apiMealRates]);

    // ─── Meal status helpers ─────────────────────────────────────────────────────

    const getMealStatus = useCallback(
        (pid: string, date: string, meal: string): boolean => {
            const k = `${pid}_${date}`;
            if (attendanceChanges[k] && meal in attendanceChanges[k]) return attendanceChanges[k][meal];
            return localAttendanceData[k]?.[meal] ?? true;
        },
        [attendanceChanges, localAttendanceData],
    );

    const getIsFreeMeal = useCallback(
        (pid: string, date: string): boolean => {
            const k = `${pid}_${date}`;
            if (attendanceChanges[k] && 'isFreeMeal' in attendanceChanges[k]) return attendanceChanges[k].isFreeMeal;
            return localAttendanceData[k]?.isFreeMeal ?? false;
        },
        [attendanceChanges, localAttendanceData],
    );

    const getMealsForDay = useCallback(
        (pid: string, date: string) =>
            (getMealStatus(pid, date, 'breakfast') ? 1 : 0) +
            (getMealStatus(pid, date, 'lunch') ? 1 : 0) +
            (getMealStatus(pid, date, 'dinner') ? 1 : 0),
        [getMealStatus],
    );

    const getCostForDay = useCallback(
        (pid: string, date: string) => {
            if (getIsFreeMeal(pid, date)) return 0;
            let cost = 0;
            if (getMealStatus(pid, date, 'breakfast')) cost += mealRates.breakfast;
            if (getMealStatus(pid, date, 'lunch')) cost += mealRates.lunch;
            if (getMealStatus(pid, date, 'dinner')) cost += mealRates.dinner;
            return cost;
        },
        [getMealStatus, getIsFreeMeal, mealRates],
    );

    const getTotalMealsForPerson = useCallback(
        (pid: string) => dates.reduce((a, d) => a + getMealsForDay(pid, d), 0),
        [dates, getMealsForDay],
    );

    const getTotalCostForPerson = useCallback(
        (pid: string) => dates.reduce((a, d) => a + getCostForDay(pid, d), 0),
        [dates, getCostForDay],
    );

    // ─── Handlers ───────────────────────────────────────────────────────────────

    const handleMealToggle = (pid: string, date: string, meal: string) => {
        const cur = getMealStatus(pid, date, meal);
        const k = `${pid}_${date}`;
        setAttendanceChanges(prev => {
            const current = prev[k] || localAttendanceData[k] || { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
            const isFree = !cur ? false : current.isFreeMeal;
            return { ...prev, [k]: { ...current, personId: pid, date, [meal]: !cur, isFreeMeal: isFree } };
        });
    };

    const handleFreeMealToggle = (pid: string, date: string) => {
        const newFreeStatus = !getIsFreeMeal(pid, date);
        const k = `${pid}_${date}`;
        setAttendanceChanges(prev => {
            const current = prev[k] || localAttendanceData[k] || { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
            const update: any = { personId: pid, date, isFreeMeal: newFreeStatus };
            if (newFreeStatus) { update.breakfast = false; update.lunch = false; update.dinner = false; }
            return { ...prev, [k]: { ...current, ...update } };
        });
    };

    // ─── Drag logic ──────────────────────────────────────────────────────────────

    const buildRange = (a: number, b: number) => {
        const s = new Set<number>();
        for (let i = Math.min(a, b); i <= Math.max(a, b); i++) s.add(i);
        return s;
    };

    const handleDragStart = (e: React.MouseEvent, idx: number, type: 'row' | 'col') => {
        if (e.button !== 0) return;
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
        e.preventDefault();
        isDragging.current = true;
        dragStartIdx.current = idx;
        dragLastIdx.current = idx;

        if (type === 'row') {
            const cur = selectedRowIndices;
            let next: Set<number>;
            if (e.shiftKey && cur.size > 0) next = buildRange(Math.min(...cur), idx);
            else if (e.ctrlKey || e.metaKey) { next = new Set(cur); next.has(idx) ? next.delete(idx) : next.add(idx); }
            else next = new Set([idx]);
            setSelectedRowIndices(next);
            setSelectedColIndices(new Set());
        } else {
            const cur = selectedColIndices;
            let next: Set<number>;
            if (e.shiftKey && cur.size > 0) next = buildRange(Math.min(...cur), idx);
            else if (e.ctrlKey || e.metaKey) { next = new Set(cur); next.has(idx) ? next.delete(idx) : next.add(idx); }
            else next = new Set([idx]);
            setSelectedColIndices(next);
            if (selectionMode !== 'row') setSelectedRowIndices(new Set());
        }
    };

    const handleDragEnter = (e: React.MouseEvent, idx: number, type: 'row' | 'col') => {
        if (!isDragging.current || idx === dragLastIdx.current) return;
        dragLastIdx.current = idx;
        const range = buildRange(dragStartIdx.current, idx);
        if (type === 'row') setSelectedRowIndices(range);
        else setSelectedColIndices(range);
    };

    useEffect(() => {
        const up = () => { isDragging.current = false; };
        window.addEventListener('mouseup', up);
        return () => window.removeEventListener('mouseup', up);
    }, []);

    // ─── Bulk actions ────────────────────────────────────────────────────────────

    const applyMealAction = (action: 'full' | 'b' | 'l' | 'd' | 'free', value: boolean) => {
        const isRowMode = selectionMode === 'row';
        const hasSelection = isRowMode ? selectedRowIndices.size > 0 : selectedColIndices.size > 0;

        if (!hasSelection) {
            setSnackbar({ open: true, message: `Please select ${isRowMode ? 'person row(s)' : 'date column(s)'} first!`, severity: 'warning' });
            return;
        }

        const targetPersons = isRowMode
            ? filteredPersons.filter((_: any, i: number) => selectedRowIndices.has(i))
            : personsByClass;
        const targetDates = isRowMode
            ? (selectedColIndices.size > 0 ? dates.filter((_, i) => selectedColIndices.has(i)) : dates)
            : dates.filter((_, i) => selectedColIndices.has(i));

        const nc = { ...attendanceChanges };
        const nl = { ...localAttendanceData };

        targetPersons.forEach((p: PersonRow) => {
            targetDates.forEach((d: string) => {
                const k = `${p._id}_${d}`;
                const current = nc[k] || nl[k] || { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
                const update: any = { personId: p._id, date: d };

                if (action === 'free') {
                    update.isFreeMeal = value;
                    if (value) { update.breakfast = false; update.lunch = false; update.dinner = false; }
                } else if (action === 'full') {
                    update.breakfast = update.lunch = update.dinner = value;
                    if (value) update.isFreeMeal = false;
                } else {
                    update[action === 'b' ? 'breakfast' : action === 'l' ? 'lunch' : 'dinner'] = value;
                    if (value) update.isFreeMeal = false;
                }

                nc[k] = { ...current, ...update };
                nl[k] = { ...current, ...update };
            });
        });

        setAttendanceChanges(nc);
        setLocalAttendanceData(nl);
        setSnackbar({ open: true, message: `${action === 'free' ? (value ? 'Marked as Free' : 'Unmarked Free') : `${value ? 'Added' : 'Removed'} ${action}`}`, severity: 'success' });
    };

    // ─── Save ────────────────────────────────────────────────────────────────────

    const handleSaveAll = async () => {
        if (!personsByClass.length || !dates.length) return;
        try {
            const rateOverrides = {
                breakfastRate: mealRates.breakfast,
                lunchRate: mealRates.lunch,
                dinnerRate: mealRates.dinner,
            };

            const attendancesToSave: any[] = [];
            personsByClass.forEach((person: PersonRow) => {
                dates.forEach((date: string) => {
                    const k = `${person._id}_${date}`;
                    const change = attendanceChanges[k];
                    const local = localAttendanceData[k];
                    const breakfast = change?.breakfast !== undefined ? change.breakfast : (local?.breakfast ?? true);
                    const lunch = change?.lunch !== undefined ? change.lunch : (local?.lunch ?? true);
                    const dinner = change?.dinner !== undefined ? change.dinner : (local?.dinner ?? true);
                    const isFreeMeal = change?.isFreeMeal !== undefined ? change.isFreeMeal : (local?.isFreeMeal ?? false);

                    attendancesToSave.push({
                        personId: person._id,
                        personType,
                        date,
                        breakfast,
                        lunch,
                        dinner,
                        isFreeMeal,
                        ...rateOverrides,
                    });
                });
            });

            const result = await bulkCreateAttendance({
                academicYear: monthlyUpdateAcademicYear,
                attendances: attendancesToSave,
            }).unwrap();
            if (result) {
                const count = result?.data?.totalProcessed || result?.totalProcessed || attendancesToSave.length;
                toast.success(`Updated ${count} record(s) successfully!`);
                setAttendanceChanges({});
                refetchMonthly();
                router.push('/dashboard/daily-meal-report')
            }


        } catch (err: any) {
            setSnackbar({ open: true, message: err?.data?.message || err?.error || 'Failed to update', severity: 'error' });
        }
    };

    const handleReset = () => {
        setAttendanceChanges({});
        clearSelection();
    };

    // ─── Filtered persons ─────────────────────────────────────────────────────────

    const filteredPersons: PersonRow[] = useMemo(
        () =>
            personsByClass.filter(
                p =>
                    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.nameBangla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.roll?.toString().includes(searchTerm) ||
                    p.personId?.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        [personsByClass, searchTerm],
    );

    // ─── Labels ──────────────────────────────────────────────────────────────────

    const hasColSel = selectedColIndices.size > 0;
    const hasRowSel = selectedRowIndices.size > 0;
    const selLabels = Array.from(selectedColIndices).sort((a, b) => a - b).map(i => dates[i] ? dayjs(dates[i]).format('DD MMM') : '').filter(Boolean);

    const displayClassName =
        personType === 'student'
            ? (monthlyUpdateClassName || 'All Classes')
            : PERSON_LABELS[personType];

    const tabColor = TAB_COLORS[personType];
    const showTable = filteredPersons.length > 0 && dates.length > 0;

    if (loadMonthly && !hasLoadedInitialData) {
        return (
            <Box sx={{ p: 4 }}>
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading attendance data...</Typography>
                </Paper>
            </Box>
        );
    }


    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#f5f7fa', minHeight: '100vh' }}>

                {/* ── Header ── */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: `linear-gradient(135deg, ${tabColor} 0%, ${tabColor}cc 100%)`, color: 'white' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <IconButton onClick={() => router.back()} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <ArrowBackIcon />
                                </IconButton>
                                <Typography variant="h5" fontWeight="bold">Update Meal Attendance</Typography>
                            </Box>
                            <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Chip icon={<SchoolIcon sx={{ color: 'white !important' }} />} label={`${PERSON_LABELS[personType]}: ${displayClassName}`} sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }} />
                                <Chip icon={<CalendarIcon sx={{ color: 'white !important' }} />} label={`Month: ${selectedMonth.format('MMMM YYYY')}`} sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }} />
                                <Chip label={`${personsByClass.length} ${PERSON_LABELS[personType]}`} sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }} />
                                <Chip
                                    label={`Rates — B:৳${mealRates.breakfast} L:৳${mealRates.lunch} D:৳${mealRates.dinner}${isCustomRate ? ' (Custom)' : ''}`}
                                    sx={{ bgcolor: isCustomRate ? 'rgba(255, 235, 59, 0.35)' : 'rgba(255,255,255,0.25)', color: 'white', fontWeight: isCustomRate ? 700 : 400 }}
                                />
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<TuneIcon fontSize="small" />}
                                    onClick={() => setShowRateEditor(v => !v)}
                                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', textTransform: 'none', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                                >
                                    {showRateEditor ? 'Hide Rate Editor' : 'Edit Meal Rates'}
                                </Button>
                            </Box>
                        </Box>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                            onClick={handleSaveAll}
                            disabled={isSaving}
                            sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', fontWeight: 'bold' }}
                        >
                            {Object.keys(attendanceChanges).length ? `Save Updates (${Object.keys(attendanceChanges).length})` : 'Save Updates'}
                        </Button>
                    </Box>

                    {showRateEditor && (
                        <Box sx={{ mt: 2, p: 2, borderRadius: 2, width: '500px' }}>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Breakfast Rate (৳)"
                                        value={mealRates.breakfast}
                                        onChange={e => handleRateChange('breakfast', e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><BreakfastIcon fontSize="small" /></InputAdornment>,
                                            inputProps: { min: 0, step: 1 },
                                        }}
                                        sx={{ bgcolor: 'white', borderRadius: 1, '& .MuiInputBase-input': { fontWeight: 'bold' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Lunch Rate (৳)"
                                        value={mealRates.lunch}
                                        onChange={e => handleRateChange('lunch', e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LunchIcon fontSize="small" /></InputAdornment>,
                                            inputProps: { min: 0, step: 1 },
                                        }}
                                        sx={{ bgcolor: 'white', borderRadius: 1, '& .MuiInputBase-input': { fontWeight: 'bold' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Dinner Rate (৳)"
                                        value={mealRates.dinner}
                                        onChange={e => handleRateChange('dinner', e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><DinnerIcon fontSize="small" /></InputAdornment>,
                                            inputProps: { min: 0, step: 1 },
                                        }}
                                        sx={{ bgcolor: 'white', borderRadius: 1, '& .MuiInputBase-input': { fontWeight: 'bold' } }}
                                    />
                                </Grid>
                            </Grid>

                        </Box>
                    )}
                </Paper>

                <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>

                    {/* ── Person Type Tabs ── */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
                        <Tabs
                            value={personType}
                            onChange={handlePersonTypeChange}
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{
                                px: 2,
                                '& .MuiTab-root': { fontWeight: 600, minHeight: 56 },
                                '& .Mui-selected': { color: tabColor },
                                '& .MuiTabs-indicator': { bgcolor: tabColor },
                            }}
                        >
                            <Tab value="student" label="Students" icon={<SchoolIcon fontSize="small" />} iconPosition="start" sx={{ color: TAB_COLORS.student }} />
                            <Tab value="teacher" label="Teachers" icon={<GroupIcon fontSize="small" />} iconPosition="start" sx={{ color: TAB_COLORS.teacher }} />
                            <Tab value="staff" label="Staff" icon={<StaffIcon fontSize="small" />} iconPosition="start" sx={{ color: TAB_COLORS.staff }} />
                        </Tabs>
                    </Box>

                    {/* ── Toolbar ── */}
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'white', width: '1050px' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth size="small"
                                    placeholder={`Search ${PERSON_LABELS[personType].toLowerCase()}…`}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
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

                            <Grid item xs={12} sm={3}>
                                <ToggleButtonGroup value={selectionMode} exclusive onChange={(e, val) => val && setSelectionMode(val)} size="small" fullWidth sx={{ bgcolor: '#f5f5f5' }}>
                                    <ToggleButton value="col"><Tooltip title="Select Columns (Dates)"><ColumnIcon fontSize="small" /></Tooltip></ToggleButton>
                                    <ToggleButton value="row"><Tooltip title="Select Rows (Persons)"><RowIcon fontSize="small" /></Tooltip></ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                        </Grid>

                        {/* ── Column action toolbar ── */}
                        {personsByClass.length > 0 && dates.length > 0 && selectionMode === 'col' && (
                            <Box sx={{ mt: 2, p: '10px 16px', bgcolor: hasColSel ? '#EBF3FF' : '#f8f9fa', border: hasColSel ? `1.5px solid ${COL_SEL_BORDER}` : '1px solid #e0e0e0', borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>

                                <Button variant="contained" color="success" size="small" startIcon={<AddIcon />} onClick={() => applyMealAction('full', true)} sx={{ textTransform: 'none', fontWeight: 'bold' }} disabled={!hasColSel}>Add Full Meal {hasColSel && `(${selectedColIndices.size} col)`}</Button>
                                <Button variant="contained" color="error" size="small" startIcon={<RemoveCircleIcon />} onClick={() => applyMealAction('full', false)} sx={{ textTransform: 'none', fontWeight: 'bold' }} disabled={!hasColSel}>Remove Full Meal {hasColSel && `(${selectedColIndices.size} col)`}</Button>
                                <Divider orientation="vertical" flexItem />

                                <Divider orientation="vertical" flexItem />
                                <Button size="small" variant="outlined" color="warning" onClick={() => applyMealAction('free', true)} disabled={!hasColSel}><MoneyOff fontSize="small" sx={{ mr: 0.4 }} />Mark Free</Button>
                                <Button size="small" variant="outlined" onClick={() => applyMealAction('free', false)} disabled={!hasColSel}><MoneyOffCsred fontSize="small" sx={{ mr: 0.4 }} />Unmark Free</Button>
                                <Box flexGrow={1} />

                                <Button size="small" onClick={clearSelection} sx={{ minWidth: 60 }}>Clear</Button>
                            </Box>
                        )}

                        {/* ── Row action toolbar ── */}
                        {personsByClass.length > 0 && dates.length > 0 && selectionMode === 'row' && (
                            <Box sx={{ mt: 2, p: '10px 16px', bgcolor: hasRowSel ? '#FFF7ED' : '#f8f9fa', border: hasRowSel ? `1.5px solid ${ROW_SEL_BORDER}` : '1px solid #e0e0e0', borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">Row Actions (All Dates):</Typography>
                                <Button size="small" variant="contained" color="success" onClick={() => applyMealAction('full', true)} startIcon={<AddIcon />} disabled={!hasRowSel}>Add All</Button>
                                <Button size="small" variant="contained" color="error" onClick={() => applyMealAction('full', false)} startIcon={<RemoveCircleIcon />} disabled={!hasRowSel}>Remove All</Button>
                                <Divider orientation="vertical" flexItem />
                                <Button size="small" variant="outlined" onClick={() => applyMealAction('b', true)} disabled={!hasRowSel}><BreakfastIcon fontSize="small" sx={{ mr: 0.4 }} />+B</Button>
                                <Button size="small" variant="outlined" onClick={() => applyMealAction('l', true)} disabled={!hasRowSel}><LunchIcon fontSize="small" sx={{ mr: 0.4 }} />+L</Button>
                                <Button size="small" variant="outlined" onClick={() => applyMealAction('d', true)} disabled={!hasRowSel}><DinnerIcon fontSize="small" sx={{ mr: 0.4 }} />+D</Button>
                                <Divider orientation="vertical" flexItem />
                                <Button size="small" variant="outlined" color="warning" onClick={() => applyMealAction('free', true)} disabled={!hasRowSel}><MoneyOff fontSize="small" sx={{ mr: 0.4 }} />Mark Free</Button>
                                <Button size="small" variant="outlined" onClick={() => applyMealAction('free', false)} disabled={!hasRowSel}><MoneyOffCsred fontSize="small" sx={{ mr: 0.4 }} />Unmark Free</Button>
                                <Box flexGrow={1} />
                                {!hasRowSel
                                    ? <Typography variant="body2" color="text.secondary"><strong>Click</strong> a person row or drag to select multiple.</Typography>
                                    : <Typography variant="body2" fontWeight="bold" color={ROW_SEL_BORDER}>{selectedRowIndices.size} {PERSON_LABELS[personType].toLowerCase()} selected</Typography>
                                }
                                <Button size="small" onClick={clearSelection} sx={{ minWidth: 60 }}>Clear</Button>
                            </Box>
                        )}

                        {Object.keys(attendanceChanges).length > 0 && (
                            <Alert severity="warning" sx={{ mt: 1.5 }} onClose={handleReset} action={
                                <Button size="small" color="inherit" onClick={handleReset}>Discard</Button>
                            }>
                                <strong>{Object.keys(attendanceChanges).length} unsaved change(s)!</strong> Click "Save Updates" above to persist.
                            </Alert>
                        )}

                        {isCustomRate && (
                            <Alert severity="info" sx={{ mt: 1.5 }}>
                                <strong>Custom meal rates active:</strong> B:৳{mealRates.breakfast} / L:৳{mealRates.lunch} / D:৳{mealRates.dinner}.
                                These rates will be applied to all records saved in this session.
                            </Alert>
                        )}
                    </Box>

                    {/* ── Info banner ── */}
                    {personsByClass.length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <Typography variant="h6">No {PERSON_LABELS[personType].toLowerCase()} found.</Typography>
                            {personType !== 'student' && (
                                <Typography variant="body2" sx={{ mt: 1 }}>Make sure {PERSON_LABELS[personType].toLowerCase()} have status = Active.</Typography>
                            )}
                        </Box>
                    )}

                    {/* ── Attendance Table ── */}
                    {showTable && (
                        <TableContainer sx={{ maxHeight: '72vh', overflow: 'auto', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}>
                            <Table stickyHeader size="small" sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, bgcolor: '#EAECF0', minWidth: 210, position: 'sticky', left: 0, zIndex: 5, borderRight: '2px solid #CDD0D5', fontSize: 12 }}>
                                            {personType === 'student' ? 'Student Name' : personType === 'teacher' ? 'Teacher Name' : 'Staff Name'}
                                        </TableCell>
                                        {dates.map((date, dIdx) => {
                                            const sel = selectionMode === 'row' ? false : selectedColIndices.has(dIdx);
                                            return (
                                                <TableCell
                                                    key={date}
                                                    align="center"
                                                    sx={{ minWidth: 108, bgcolor: sel ? COL_HEADER_BG : '#EAECF0', borderLeft: sel ? `2px solid ${COL_SEL_BORDER}` : '1px solid #D0D3D8', borderRight: sel ? `2px solid ${COL_SEL_BORDER}` : '1px solid #D0D3D8', borderTop: sel ? `3px solid ${COL_SEL_BORDER}` : '2px solid #EAECF0', cursor: selectionMode === 'col' ? 'col-resize' : 'default', zIndex: 3, p: '6px 4px' }}
                                                    onMouseDown={selectionMode === 'col' ? e => handleDragStart(e, dIdx, 'col') : undefined}
                                                    onMouseEnter={selectionMode === 'col' ? e => handleDragEnter(e, dIdx, 'col') : undefined}
                                                >
                                                    <Typography variant="caption" display="block" fontWeight={700} sx={{ color: sel ? COL_SEL_BORDER : '#1a1a2e' }}>{dayjs(date).format('DD MMM')}</Typography>
                                                    <Typography variant="caption" display="block" sx={{ color: sel ? COL_SEL_BORDER : '#666' }}>{dayjs(date).format('ddd')}</Typography>
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#DBEAFE', minWidth: 88, zIndex: 3, fontSize: 12 }}>Total Meals</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#DBEAFE', minWidth: 110, zIndex: 3, fontSize: 12 }}>Total Cost (৳)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredPersons.map((person, rIdx) => {
                                        const pid = person._id;
                                        const totalMeals = getTotalMealsForPerson(pid);
                                        const totalCost = getTotalCostForPerson(pid);
                                        const isRowSel = selectedRowIndices.has(rIdx);
                                        const avatarColor = PERSON_AVATARS[personType];

                                        const subLabel =
                                            personType === 'student' ? person.nameBangla || '—'
                                                : personType === 'teacher' ? (person.designation || person.department || '—')
                                                    : (person.staffDepartment || '—');

                                        return (
                                            <TableRow hover key={pid} sx={{ bgcolor: isRowSel ? ROW_SEL_BG : undefined }}>
                                                <TableCell
                                                    sx={{ position: 'sticky', left: 0, bgcolor: isRowSel ? '#fff3e0' : 'white', zIndex: 1, borderRight: '2px solid #CDD0D5', borderLeft: isRowSel ? `4px solid ${ROW_SEL_BORDER}` : '4px solid transparent', cursor: selectionMode === 'row' ? 'row-resize' : 'default' }}
                                                    onMouseDown={selectionMode === 'row' ? e => handleDragStart(e, rIdx, 'row') : undefined}
                                                    onMouseEnter={selectionMode === 'row' ? e => handleDragEnter(e, rIdx, 'row') : undefined}
                                                >
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        {selectionMode === 'row' && (isRowSel ? <CheckBoxIcon fontSize="small" color="warning" /> : <CheckBoxOutlineBlankIcon fontSize="small" color="disabled" />)}
                                                        <Avatar sx={{ width: 28, height: 28, bgcolor: avatarColor, fontSize: 12 }}>
                                                            <PersonIcon sx={{ fontSize: 14 }} />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={500}>{person.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{subLabel}</Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {dates.map((date, dIdx) => {
                                                    const colSel = selectionMode === 'row' ? (isRowSel && selectedColIndices.has(dIdx)) : selectedColIndices.has(dIdx);
                                                    const isCellActive = selectionMode === 'row' ? colSel : (isRowSel || colSel);
                                                    const total = getMealsForDay(pid, date);
                                                    const b = getMealStatus(pid, date, 'breakfast');
                                                    const l = getMealStatus(pid, date, 'lunch');
                                                    const dn = getMealStatus(pid, date, 'dinner');
                                                    const isFree = getIsFreeMeal(pid, date);

                                                    let cellBg = total === 3 ? '#F0FDF4' : total > 0 ? '#FFFBEB' : '#FFF5F5';
                                                    if (isFree) cellBg = FREE_MEAL_BG;
                                                    if (isCellActive) cellBg = isRowSel && colSel ? 'rgba(255,152,0,0.3)' : (isRowSel ? ROW_SEL_BG : COL_SEL_BG);

                                                    return (
                                                        <TableCell
                                                            key={date}
                                                            align="center"
                                                            sx={{ bgcolor: cellBg, borderLeft: colSel ? `2px solid ${COL_SEL_BORDER}` : '1px solid #E8E9EC', borderRight: colSel ? `2px solid ${COL_SEL_BORDER}` : '1px solid #E8E9EC', p: '4px 2px', cursor: selectionMode === 'col' ? 'cell' : 'default' }}
                                                            onMouseDown={e => { if (!(e.target as HTMLElement).closest('button')) handleDragStart(e, dIdx, 'col'); }}
                                                            onMouseEnter={e => handleDragEnter(e, dIdx, 'col')}
                                                        >
                                                            <Box display="flex" justifyContent="center" gap={0.2}>
                                                                <Tooltip title={`Breakfast`}><IconButton size="small" color={b ? 'success' : 'default'} sx={{ p: '2px', opacity: b ? 1 : 0.3 }} onClick={e => { e.stopPropagation(); handleMealToggle(pid, date, 'breakfast'); }}><BreakfastIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                                                <Tooltip title={`Lunch`}><IconButton size="small" color={l ? 'success' : 'default'} sx={{ p: '2px', opacity: l ? 1 : 0.3 }} onClick={e => { e.stopPropagation(); handleMealToggle(pid, date, 'lunch'); }}><LunchIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                                                <Tooltip title={`Dinner`}><IconButton size="small" color={dn ? 'success' : 'default'} sx={{ p: '2px', opacity: dn ? 1 : 0.3 }} onClick={e => { e.stopPropagation(); handleMealToggle(pid, date, 'dinner'); }}><DinnerIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                                                <Tooltip title={isFree ? 'Mark Paid' : 'Mark Free'}><IconButton size="small" color={isFree ? 'warning' : 'default'} sx={{ p: '2px', opacity: isFree ? 1 : 0.4 }} onClick={e => { e.stopPropagation(); handleFreeMealToggle(pid, date); }}><MoneyOff sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                                            </Box>
                                                            <Typography variant="caption" display="block" align="center" sx={{ color: isFree ? '#F57C00' : (total === 3 ? '#16a34a' : '#999'), fontWeight: 700, lineHeight: 1.1, mt: '1px', fontSize: 11 }}>{isFree ? 'Free' : `${total}/3`}</Typography>
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell align="center" sx={{ bgcolor: '#DBEAFE' }}><Typography fontWeight="bold" fontSize={12}>{totalMeals}</Typography></TableCell>
                                                <TableCell align="center" sx={{ bgcolor: '#DBEAFE' }}><Typography fontWeight="bold" fontSize={12} color={totalCost === 0 ? '#999' : '#0277BD'}>{totalCost > 0 ? `৳${totalCost}` : '-'}</Typography></TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Box>
        </LocalizationProvider>
    );
};

export default UpdateMealForm;
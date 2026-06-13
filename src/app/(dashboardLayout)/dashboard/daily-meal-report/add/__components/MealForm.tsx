'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAcademicOption } from '@/hooks/useAcademicOption';
import {
    useBulkCreateAttendanceMutation,
    useGetMonthlyAttendanceSheetQuery,
} from '@/redux/api/mealAttendanceApi';
import {
    ArrowBack as ArrowBackIcon,
    BreakfastDining as BreakfastIcon,
    CalendarMonth as CalendarIcon,
    Clear as ClearIcon,
    DinnerDining as DinnerIcon,
    Fastfood as FastfoodIcon,
    LunchDining as LunchIcon,
    Person as PersonIcon,
    RemoveCircle as RemoveCircleIcon,
    Rowing,
    Save as SaveIcon,
    School as SchoolIcon,
    Search as SearchIcon,
    MoneyOff,
    MoneyOffCsred,
} from '@mui/icons-material';
import {
    Alert, Avatar, Box, Button, CircularProgress, Divider, Grid, IconButton, InputAdornment,
    Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
    Tooltip, Typography, ToggleButton, ToggleButtonGroup,
    Chip
} from '@mui/material';
import { GridColumnIcon } from '@mui/x-data-grid';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';

// Constants
const COL_SEL_BG = 'rgba(19,102,210,0.13)';
const COL_SEL_BORDER = '#1366D2';
const COL_HEADER_BG = 'rgba(19,102,210,0.28)';
const ROW_SEL_BG = 'rgba(255, 152, 0, 0.15)';
const ROW_SEL_BORDER = '#f57c00';
const CELL_INT_SEL_BG = 'rgba(100, 100, 255, 0.25)';
const FREE_MEAL_BG = '#FFFDE7'; // Gold color for free meals
const MEAL_RATE = 55;

const UpdateMealForm: React.FC<any> = ({
    isMonthlyUpdate = false,
    monthlyUpdateClassName = '',
    monthlyUpdateMonth = '',
    monthlyUpdateAcademicYear = '',
}) => {
    const router = useRouter();
    const { classData, studentData } = useAcademicOption();
    const [bulkCreateAttendance, { isLoading: isSaving }] = useBulkCreateAttendanceMutation();

    // State
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

    // Selection State
    const [selectionMode, setSelectionMode] = useState<'row' | 'col'>('col');
    const [selectedColIndices, setSelectedColIndices] = useState<Set<number>>(new Set());
    const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());

    const isDragging = useRef(false);
    const dragStartRow = useRef(-1);
    const dragStartCol = useRef(-1);
    const dragLastRow = useRef(-1);
    const dragLastCol = useRef(-1);

    // Data Helpers
    const allStudents: any[] = useMemo(() => {
        let s: any[] = [];
        if (studentData?.data?.data) s = studentData.data.data;
        else if (studentData?.data) s = studentData.data;
        else if (Array.isArray(studentData)) s = studentData;
        return s.filter((st: any) =>
            st.admissionStatus === 'enrolled' &&
            (['Residential', 'Non-Residential One Meal'].includes(st.category) || st.studentType === 'Residential')
        );
    }, [studentData]);

    // Logic: If className is provided (not empty), filter students. Otherwise, show All.
    const studentsByClass = useMemo(() => {
        if (isMonthlyUpdate) {
            if (monthlyUpdateClassName) {
                return allStudents.filter((s: any) =>
                    Array.isArray(s.className) &&
                    s.className.some((c: any) => c.className === monthlyUpdateClassName)
                );
            }
            return allStudents; // Show all if no specific class
        }
        return [];
    }, [allStudents, isMonthlyUpdate, monthlyUpdateClassName]);

    // Determine what to send to API: If className is empty, send undefined (All Classes)
    const resolvedClassName = useMemo(() => {
        return isMonthlyUpdate && monthlyUpdateClassName ? monthlyUpdateClassName : undefined;
    }, [isMonthlyUpdate, monthlyUpdateClassName]);

    const shouldFetchSheet = useMemo(() => {
        return isMonthlyUpdate && !!selectedMonth;
    }, [isMonthlyUpdate, selectedMonth]);

    // API Query
    const { data: monthlyData, isLoading: loadMonthly, refetch: refetchMonthly } = useGetMonthlyAttendanceSheetQuery(
        {
            className: resolvedClassName, // Sends undefined if All Classes
            month: selectedMonth?.format('YYYY-MM') || '',
            academicYear: monthlyUpdateAcademicYear,
        },
        { skip: !shouldFetchSheet }
    );

    const attendanceSheetData = monthlyData?.data || monthlyData;
    const mealRate = attendanceSheetData?.mealRate || MEAL_RATE;

    // Dates List
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

    // Initialize Data from API
    useEffect(() => {
        if (isMonthlyUpdate && attendanceSheetData && studentsByClass.length > 0 && dates.length > 0 && !hasLoadedInitialData) {
            const init: Record<string, any> = {};

            attendanceSheetData?.students?.forEach((apiStudent: any) => {
                const studentId = apiStudent.student?.id || apiStudent.student?._id;
                if (studentId && apiStudent.attendance) {
                    apiStudent.attendance.forEach((att: any) => {
                        const key = `${studentId}_${att.date}`;
                        init[key] = {
                            breakfast: att.breakfast === true,
                            lunch: att.lunch === true,
                            dinner: att.dinner === true,
                            isFreeMeal: att.isFreeMeal === true, // ✅ Load Free Meal Status
                        };
                    });
                }
            });

            studentsByClass.forEach((student: any) => {
                dates.forEach((date: string) => {
                    const key = `${student._id}_${date}`;
                    if (!init[key]) init[key] = { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
                });
            });

            setLocalAttendanceData(init);
            setHasLoadedInitialData(true);
        }
    }, [attendanceSheetData, studentsByClass, dates, isMonthlyUpdate, hasLoadedInitialData]);

    // --- Logic Helpers ---
    const getMealStatus = useCallback((sid: string, date: string, meal: string): boolean => {
        const k = `${sid}_${date}`;
        if (attendanceChanges[k] && meal in attendanceChanges[k]) return attendanceChanges[k][meal];
        return localAttendanceData[k]?.[meal] ?? true;
    }, [attendanceChanges, localAttendanceData]);

    const getIsFreeMeal = useCallback((sid: string, date: string): boolean => {
        const k = `${sid}_${date}`;
        if (attendanceChanges[k] && 'isFreeMeal' in attendanceChanges[k]) return attendanceChanges[k].isFreeMeal;
        return localAttendanceData[k]?.isFreeMeal ?? false;
    }, [attendanceChanges, localAttendanceData]);

    const getMealsForDay = useCallback((sid: string, date: string) =>
        (getMealStatus(sid, date, 'breakfast') ? 1 : 0) +
        (getMealStatus(sid, date, 'lunch') ? 1 : 0) +
        (getMealStatus(sid, date, 'dinner') ? 1 : 0)
        , [getMealStatus]);

    const getTotalMealsForStudent = useCallback((sid: string) =>
        dates.reduce((a: number, d: string) => a + getMealsForDay(sid, d), 0)
        , [dates, getMealsForDay]);

    // --- Handlers ---
    const handleMealToggle = (sid: string, date: string, meal: string) => {
        const cur = getMealStatus(sid, date, meal);
        const k = `${sid}_${date}`;
        setAttendanceChanges((prev) => {
            const current = prev[k] || localAttendanceData[k] || { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
            // If enabling a meal, it is no longer a free meal (optional logic, but consistent)
            const isFree = !cur ? false : current.isFreeMeal;
            return {
                ...prev,
                [k]: { ...current, studentId: sid, date, [meal]: !cur, isFreeMeal: isFree },
            };
        });
    };

    // ✅ NEW: Toggle Free Meal
    const handleFreeMealToggle = (sid: string, date: string) => {
        const cur = getIsFreeMeal(sid, date);
        const newFreeStatus = !cur;
        const k = `${sid}_${date}`;

        setAttendanceChanges((prev) => {
            const currentData = prev[k] || localAttendanceData[k] || { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
            const updatePayload: any = { studentId: sid, date, isFreeMeal: newFreeStatus };

            // If marking as FREE, set meals to false as requested
            if (newFreeStatus) {
                updatePayload.breakfast = false;
                updatePayload.lunch = false;
                updatePayload.dinner = false;
            }

            return { ...prev, [k]: { ...currentData, ...updatePayload } };
        });
    };

    // Selection Logic
    const buildRange = (a: number, b: number): Set<number> => {
        const s = new Set<number>();
        const lo = Math.min(a, b), hi = Math.max(a, b);
        for (let i = lo; i <= hi; i++) s.add(i);
        return s;
    };
    const clearSelection = () => { setSelectedColIndices(new Set()); setSelectedRowIndices(new Set()); };

    const handleDragStart = (e: React.MouseEvent, rIdx: number, cIdx: number, target: 'row-header' | 'col-header' | 'cell') => {
        if (e.button !== 0) return;
        if ((e.target as HTMLElement).closest('button')) return;
        e.preventDefault(); e.stopPropagation();
        isDragging.current = true; dragStartRow.current = rIdx; dragStartCol.current = cIdx;
        dragLastRow.current = rIdx; dragLastCol.current = cIdx;
        if (target === 'cell') { setSelectedRowIndices(new Set([rIdx])); setSelectedColIndices(new Set([cIdx])); }
        else if (target === 'row-header') { setSelectedRowIndices(new Set([rIdx])); setSelectedColIndices(new Set()); }
        else if (target === 'col-header') { setSelectedColIndices(new Set([cIdx])); setSelectedRowIndices(new Set()); }
    };
    const handleDragEnter = (e: React.MouseEvent, rIdx: number, cIdx: number, target: 'row-header' | 'col-header' | 'cell') => {
        if (!isDragging.current) return;
        if (target === 'cell' && (rIdx === dragLastRow.current && cIdx === dragLastCol.current)) return;
        dragLastRow.current = rIdx; dragLastCol.current = cIdx;
        if (target === 'cell') { setSelectedRowIndices(buildRange(dragStartRow.current, rIdx)); setSelectedColIndices(buildRange(dragStartCol.current, cIdx)); }
        else if (target === 'row-header') setSelectedRowIndices(buildRange(dragStartRow.current, rIdx));
        else if (target === 'col-header') setSelectedColIndices(buildRange(dragStartCol.current, cIdx));
    };
    useEffect(() => { const up = () => { isDragging.current = false; }; window.addEventListener('mouseup', up); return () => window.removeEventListener('mouseup', up); }, []);

    // ✅ UPDATED: Bulk Actions (Added Free Meal logic)
    const applyMealAction = (action: 'full' | 'b' | 'l' | 'd' | 'free', value: boolean) => {
        const hasRows = selectedRowIndices.size > 0; const hasCols = selectedColIndices.size > 0;
        if (!hasRows && !hasCols) { setSnackbar({ open: true, message: 'Please select cells, rows, or columns!', severity: 'warning' }); return; }

        const displayedStudents = studentsByClass.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()));
        const targetStudents = hasRows ? displayedStudents.filter((_, i) => selectedRowIndices.has(i)) : displayedStudents;
        const targetDates = hasCols ? dates.filter((_, i) => selectedColIndices.has(i)) : dates;

        const nc = { ...attendanceChanges }; const nl = { ...localAttendanceData };
        targetStudents.forEach(s => {
            targetDates.forEach(d => {
                const k = `${s._id}_${d}`;
                const update: any = { studentId: s._id, date: d };

                if (action === 'free') {
                    update.isFreeMeal = value;
                    if (value) {
                        update.breakfast = false;
                        update.lunch = false;
                        update.dinner = false;
                    }
                } else if (action === 'full') {
                    update.breakfast = update.lunch = update.dinner = value;
                    // If adding meals, ensure it's not marked as free meal
                    if (value) update.isFreeMeal = false;
                } else {
                    update[action] = value;
                    if (value) update.isFreeMeal = false;
                }

                const current = nc[k] || nl[k] || { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
                nc[k] = { ...current, ...update }; nl[k] = { ...current, ...update };
            });
        });
        setAttendanceChanges(nc); setLocalAttendanceData(nl);
        setSnackbar({ open: true, message: `${value ? 'Added' : 'Removed'} ${action}`, severity: 'success' });
    };

    // Save
    const handleMonthlyUpdateSave = async () => {
        if (!studentsByClass.length || !dates.length) return;
        setIsSavingMonthly(true);
        try {
            const attendancesToSave: any[] = [];
            studentsByClass.forEach((student: any) => {
                dates.forEach((date: string) => {
                    const k = `${student._id}_${date}`;
                    const change = attendanceChanges[k];
                    const local = localAttendanceData[k];
                    const breakfast = change?.breakfast !== undefined ? change.breakfast : (local?.breakfast ?? true);
                    const lunch = change?.lunch !== undefined ? change.lunch : (local?.lunch ?? true);
                    const dinner = change?.dinner !== undefined ? change.dinner : (local?.dinner ?? true);
                    const isFreeMeal = change?.isFreeMeal !== undefined ? change.isFreeMeal : (local?.isFreeMeal ?? false);
                    attendancesToSave.push({ studentId: student._id, date, breakfast, lunch, dinner, isFreeMeal });
                });
            });
            const result = await bulkCreateAttendance({ academicYear: monthlyUpdateAcademicYear, attendances: attendancesToSave }).unwrap();
            setSnackbar({ open: true, message: `Updated ${result.totalProcessed || attendancesToSave.length} records!`, severity: 'success' });
            setAttendanceChanges({});
            setTimeout(() => { router.back(); }, 1500);
        } catch (err: any) { setSnackbar({ open: true, message: err?.data?.message || 'Failed', severity: 'error' }); }
        finally { setIsSavingMonthly(false); }
    };

    const filteredStudents = useMemo(() => studentsByClass.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase())), [studentsByClass, searchTerm]);

    if (loadMonthly && !hasLoadedInitialData) {
        return (<Box sx={{ p: 4 }}><Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading...</Typography></Paper></Box>);
    }

    const hasSel = selectedColIndices.size > 0 || selectedRowIndices.size > 0;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', color: 'white' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <IconButton onClick={() => router.back()} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}><ArrowBackIcon /></IconButton>
                                <Typography variant="h5" fontWeight="bold">Update Meal Attendance</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Chip icon={<SchoolIcon />} label={`Class: ${monthlyUpdateClassName || 'All Classes'}`} sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }} />
                                <Chip icon={<CalendarIcon />} label={`Month: ${dayjs(monthlyUpdateMonth).format('MMMM YYYY')}`} sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }} />
                            </Box>
                        </Box>
                        <Button variant="contained" size="large" startIcon={isSavingMonthly ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />} onClick={handleMonthlyUpdateSave} disabled={isSavingMonthly} sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', fontWeight: 'bold' }}>Save Updates</Button>
                    </Box>
                </Paper>
                <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}><TextField size="small" placeholder="Search student…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>, endAdornment: searchTerm && <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchTerm('')}><ClearIcon /></IconButton></InputAdornment> }} /></Grid>
                            <Grid item xs={12} sm="auto"><ToggleButtonGroup value={selectionMode} exclusive onChange={(e, v) => v && setSelectionMode(v)} size="small"><ToggleButton value="col"><Tooltip title="Select Columns"><GridColumnIcon fontSize="small" /></Tooltip></ToggleButton><ToggleButton value="row"><Tooltip title="Select Rows"><Rowing fontSize="small" /></Tooltip></ToggleButton></ToggleButtonGroup></Grid>
                        </Grid>
                        {hasSel && (
                            <Box sx={{ mt: 2, p: '10px', bgcolor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Button size="small" variant="contained" color="success" startIcon={<FastfoodIcon />} onClick={() => applyMealAction('full', true)}>Add Meal</Button>
                                <Button size="small" variant="contained" color="error" startIcon={<RemoveCircleIcon />} onClick={() => applyMealAction('full', false)}>Remove Meal</Button>
                                <Divider orientation="vertical" flexItem />
                                <Button size="small" variant="outlined" onClick={() => applyMealAction('b', true)}><BreakfastIcon fontSize="small" sx={{ mr: 0.5 }} />+B</Button>
                                <Button size="small" variant="outlined" onClick={() => applyMealAction('l', true)}><LunchIcon fontSize="small" sx={{ mr: 0.5 }} />+L</Button>
                                <Button size="small" variant="outlined" onClick={() => applyMealAction('d', true)}><DinnerIcon fontSize="small" sx={{ mr: 0.5 }} />+D</Button>
                                <Divider orientation="vertical" flexItem />
                                {/* ✅ NEW: Free Meal Buttons */}
                                <Button size="small" variant="outlined" color="warning" onClick={() => applyMealAction('free', true)}><MoneyOff fontSize="small" sx={{ mr: 0.5 }} />Mark Free</Button>
                                <Button size="small" variant="outlined" onClick={() => applyMealAction('free', false)}><MoneyOffCsred fontSize="small" sx={{ mr: 0.5 }} />Unmark Free</Button>
                            </Box>
                        )}
                    </Box>
                    <TableContainer sx={{ maxHeight: '70vh' }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, bgcolor: '#EAECF0', minWidth: 200, position: 'sticky', left: 0, zIndex: 5 }}>Student</TableCell>
                                    {dates.map((date, dIdx) => {
                                        const sel = selectedColIndices.has(dIdx);
                                        return (<TableCell key={date} align="center" sx={{ minWidth: 100, bgcolor: sel ? COL_HEADER_BG : '#EAECF0', cursor: 'col-resize', userSelect: 'none' }} onMouseDown={(e) => handleDragStart(e, -1, dIdx, 'col-header')} onMouseEnter={(e) => handleDragEnter(e, -1, dIdx, 'col-header')}><Typography variant="caption" fontWeight={700}>{dayjs(date).format('DD')}</Typography></TableCell>);
                                    })}
                                    <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#DBEAFE', minWidth: 80 }}>Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents.map((student, rIdx) => {
                                    const isRowSel = selectedRowIndices.has(rIdx); const totalMeals = getTotalMealsForStudent(student._id);
                                    return (
                                        <TableRow hover key={student._id} sx={{ bgcolor: isRowSel ? ROW_SEL_BG : undefined }}>
                                            <TableCell sx={{ position: 'sticky', left: 0, bgcolor: isRowSel ? '#fff3e0' : 'white', zIndex: 1, borderLeft: isRowSel ? `4px solid ${ROW_SEL_BORDER}` : '4px solid transparent' }}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Box><Typography variant="body2" fontWeight={500}>{student.name}</Typography><Typography variant="caption" color="text.secondary">{student.studentId}</Typography></Box>
                                                </Box>
                                            </TableCell>
                                            {dates.map((date, dIdx) => {
                                                const isColSel = selectedColIndices.has(dIdx);
                                                const total = getMealsForDay(student._id, date);
                                                const b = getMealStatus(student._id, date, 'breakfast');
                                                const l = getMealStatus(student._id, date, 'lunch');
                                                const dn = getMealStatus(student._id, date, 'dinner');
                                                const isFree = getIsFreeMeal(student._id, date);

                                                // Background Logic
                                                let cellBg = total === 3 ? '#F0FDF4' : total > 0 ? '#FFFBEB' : '#FFF5F5';
                                                if (isFree) cellBg = FREE_MEAL_BG;
                                                if (isRowSel || isColSel) cellBg = isRowSel && isColSel ? CELL_INT_SEL_BG : (isRowSel ? ROW_SEL_BG : COL_SEL_BG);

                                                return (<TableCell key={date} align="center" sx={{ bgcolor: cellBg, p: 0, border: '1px solid #eee' }} onMouseDown={(e) => { if (!(e.target as HTMLElement).closest('button')) handleDragStart(e, rIdx, dIdx, 'cell'); }} onMouseEnter={(e) => handleDragEnter(e, rIdx, dIdx, 'cell')}>
                                                    <Box display="flex" justifyContent="center" gap={0.2}>
                                                        <IconButton size="small" color={b ? 'success' : 'default'} onClick={(e) => { e.stopPropagation(); handleMealToggle(student._id, date, 'breakfast'); }} sx={{ p: '2px' }}><BreakfastIcon sx={{ fontSize: 14 }} /></IconButton>
                                                        <IconButton size="small" color={l ? 'success' : 'default'} onClick={(e) => { e.stopPropagation(); handleMealToggle(student._id, date, 'lunch'); }} sx={{ p: '2px' }}><LunchIcon sx={{ fontSize: 14 }} /></IconButton>
                                                        <IconButton size="small" color={dn ? 'success' : 'default'} onClick={(e) => { e.stopPropagation(); handleMealToggle(student._id, date, 'dinner'); }} sx={{ p: '2px' }}><DinnerIcon sx={{ fontSize: 14 }} /></IconButton>
                                                        {/* ✅ NEW: Free Meal Icon */}
                                                        <Tooltip title={isFree ? "Mark as Paid" : "Mark as Free"}>
                                                            <IconButton size="small" color={isFree ? 'warning' : 'default'} onClick={(e) => { e.stopPropagation(); handleFreeMealToggle(student._id, date); }} sx={{ p: '2px', opacity: isFree ? 1 : 0.4 }}>
                                                                <MoneyOff sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                    <Typography variant="caption" display="block" fontWeight={700} sx={{ color: isFree ? '#F57C00' : (total === 3 ? '#16a34a' : '#999'), fontSize: 10 }}>{isFree ? 'Free' : `${total}/3`}</Typography>
                                                </TableCell>);
                                            })}
                                            <TableCell align="center" sx={{ bgcolor: '#DBEAFE' }}><Typography fontWeight="bold" fontSize={12}>{totalMeals}</Typography></TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}><Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert></Snackbar>
            </Box>
        </LocalizationProvider>
    );
};

export default UpdateMealForm;
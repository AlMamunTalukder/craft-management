// /* eslint-disable @typescript-eslint/no-explicit-any */
// 'use client';

// import { useAcademicOption } from '@/hooks/useAcademicOption';
// import {
//   useBulkCreateAttendanceMutation,
//   useGetAttendanceByIdQuery,
//   useGetMonthlyAttendanceSheetQuery,
//   useUpdateAttendanceMutation
// } from '@/redux/api/mealAttendanceApi';
// import {
//   ArrowBack as ArrowBackIcon,
//   BreakfastDining as BreakfastIcon,
//   CalendarMonth as CalendarIcon,
//   Clear as ClearIcon,
//   DinnerDining as DinnerIcon,
//   Fastfood as FastfoodIcon,
//   LunchDining as LunchIcon,
//   Person as PersonIcon,
//   Refresh as RefreshIcon,
//   RemoveCircle as RemoveCircleIcon,
//   Save as SaveIcon,
//   School as SchoolIcon,
//   Search as SearchIcon,
//   ViewColumn as ColumnIcon,
//   ViewList as RowIcon,
//   CheckBox as CheckBoxIcon,
//   CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
//   Add as AddIcon,
//   MoneyOff,
//   MoneyOffCsred,
// } from '@mui/icons-material';
// import {
//   Alert,
//   Avatar,
//   Box,
//   Button,
//   Chip,
//   CircularProgress,
//   Divider,
//   FormControl,
//   Grid,
//   IconButton,
//   InputAdornment,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   Snackbar,
//   Table, TableBody,
//   TableCell, TableContainer, TableHead, TableRow,
//   TextField,
//   Tooltip,
//   Typography,
//   ToggleButton,
//   ToggleButtonGroup
// } from '@mui/material';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import dayjs, { Dayjs } from 'dayjs';
// import { useRouter } from 'next/navigation';
// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// interface Student {
//   _id: string; studentId: string; name: string; nameBangla: string;
//   studentClassRoll: string; studentType: string; category?: string;
//   className: Array<{ _id: string; className: string;[key: string]: any }>;
//   admissionStatus: string; email?: string; mobile?: string; gender?: string;
// }
// interface ClassItem { _id: string; className: string; section?: string;[key: string]: any; }

// // Constants
// const COL_SEL_BG = 'rgba(19,102,210,0.13)';
// const COL_SEL_BORDER = '#1366D2';
// const COL_HEADER_BG = 'rgba(19,102,210,0.28)';
// const ROW_SEL_BG = 'rgba(255, 152, 0, 0.15)';
// const ROW_SEL_BORDER = '#f57c00';
// const FREE_MEAL_BG = '#FFFDE7'; // Gold color for free meals

// const getCurrentAcademicYear = () => dayjs().year().toString();
// const ALL_CLASSES = 'ALL';

// const AddMealForm: any = ({ isUpdate = false, attendanceId = '' }) => {
//   const router = useRouter();
//   const { classData, studentData } = useAcademicOption();
//   const [bulkCreateAttendance, { isLoading: isSaving }] = useBulkCreateAttendanceMutation();
//   const [updateAttendance, { isLoading: isUpdating }] = useUpdateAttendanceMutation();
//   const { data: singleAttendanceData, isLoading: isLoadingSingle } = useGetAttendanceByIdQuery(
//     attendanceId,
//     { skip: !isUpdate || !attendanceId }
//   );

//   // Core State
//   const [selectedClassId, setSelectedClassId] = useState<string>(ALL_CLASSES);
//   const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
//   const [attendanceChanges, setAttendanceChanges] = useState<Record<string, any>>({});
//   const [searchTerm, setSearchTerm] = useState('');
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
//   const [localAttendanceData, setLocalAttendanceData] = useState<Record<string, any>>({});
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

//   // Selection State
//   const [selectionMode, setSelectionMode] = useState<'row' | 'col'>('col');
//   const [selectedColIndices, setSelectedColIndices] = useState<Set<number>>(new Set());
//   const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());

//   const isDragging = useRef(false);
//   const dragStartIdx = useRef(-1);
//   const dragLastIdx = useRef(-1);

//   // --- Init Effects ---
//   useEffect(() => {
//     if (isUpdate && singleAttendanceData?.data && !hasLoadedInitialData) {
//       const record = singleAttendanceData.data;
//       if (record.date) setSelectedMonth(dayjs(record.date));
//       if (record.student?.className && record.student.className.length > 0) setSelectedClassId(record.student.className[0]);
//       setHasLoadedInitialData(true);
//     }
//   }, [isUpdate, singleAttendanceData, hasLoadedInitialData]);

//   // --- Helpers ---
//   const allStudents: Student[] = useMemo(() => {
//     let s: any[] = [];
//     if (studentData?.data?.data) s = studentData.data.data;
//     else if (studentData?.data) s = studentData.data;
//     else if (Array.isArray(studentData)) s = studentData;
//     return s.filter((st: any) => st.admissionStatus === 'enrolled' && (['Residential', 'Non-Residential One Meal'].includes(st.category) || st.studentType === 'Residential'));
//   }, [studentData]);

//   const allClasses = useMemo((): ClassItem[] => {
//     let c: any[] = [];
//     if (classData?.data?.data?.classes) c = classData.data.data.classes;
//     else if (classData?.data?.classes) c = classData.data.classes;
//     else if (classData?.classes) c = classData.classes;
//     else if (classData?.data?.data) c = classData.data.data;
//     else if (classData?.data) c = classData.data;
//     else if (Array.isArray(classData)) c = classData;
//     return c;
//   }, [classData]);

//   const classDropdownOptions = useMemo(() => allClasses.map((c: ClassItem) => ({ label: c.className, value: c._id })), [allClasses]);

//   useEffect(() => {
//     if (!isInitialized && isUpdate && classDropdownOptions.length && (!selectedClassId || selectedClassId === ALL_CLASSES)) {
//       const one = classDropdownOptions.find(o => o.label === 'One');
//       setSelectedClassId(one ? one.value : classDropdownOptions[0].value);
//       setIsInitialized(true);
//     }
//     if (!isInitialized && !isUpdate) setIsInitialized(true);
//   }, [classDropdownOptions, selectedClassId, isInitialized, isUpdate]);

//   const studentsByClass = useMemo(() => {
//     if (selectedClassId === ALL_CLASSES) return allStudents;
//     if (!selectedClassId) return [];
//     return allStudents.filter((s: Student) => Array.isArray(s.className) && s.className.some((c: any) => (c._id || c) === selectedClassId));
//   }, [allStudents, selectedClassId]);

//   const className = selectedClassId === ALL_CLASSES ? '' : (allClasses.find((c: ClassItem) => c._id === selectedClassId)?.className || '');

//   const shouldFetchSheet = useMemo(() => !isUpdate && selectedClassId !== ALL_CLASSES && !!className && !!selectedMonth, [isUpdate, selectedClassId, className, selectedMonth]);

//   const { data: monthlyData, isLoading: loadMonthly, refetch: refetchMonthly } = useGetMonthlyAttendanceSheetQuery(
//     { className, month: selectedMonth?.format('YYYY-MM') || '', academicYear: getCurrentAcademicYear() },
//     { skip: !shouldFetchSheet }
//   );

//   const attendanceSheetData = monthlyData;
//   const mealRate = attendanceSheetData?.mealRate || 55;

//   const dates = useMemo<string[]>(() => {
//     if (attendanceSheetData?.dates?.length) return attendanceSheetData.dates;
//     if (selectedMonth) {
//       const list: string[] = [];
//       let cur = selectedMonth.startOf('month');
//       const e = selectedMonth.endOf('month');
//       while (!cur.isAfter(e)) { list.push(cur.format('YYYY-MM-DD')); cur = cur.add(1, 'day'); }
//       return list;
//     }
//     return [];
//   }, [attendanceSheetData, selectedMonth]);

//   const clearSelection = () => { setSelectedColIndices(new Set()); setSelectedRowIndices(new Set()); };
//   useEffect(() => { clearSelection(); }, [selectedClassId, searchTerm, selectionMode]); // eslint-disable-line react-hooks/exhaustive-deps

//   // --- Data Loading (Load Free Meal Status) ---
//   useEffect(() => {
//     if (isUpdate && singleAttendanceData?.data && studentsByClass.length > 0 && dates.length > 0 && !hasLoadedInitialData) {
//       const record = singleAttendanceData.data;
//       const initialData: Record<string, any> = {};
//       studentsByClass.forEach((student: Student) => {
//         dates.forEach((date: string) => {
//           const key = `${student._id}_${date}`;
//           if (student._id === record.student?._id && date === dayjs(record.date).format('YYYY-MM-DD')) {
//             initialData[key] = { breakfast: record.breakfast, lunch: record.lunch, dinner: record.dinner, isFreeMeal: record.isFreeMeal || false };
//           } else {
//             initialData[key] = { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
//           }
//         });
//       });
//       setLocalAttendanceData(initialData);
//       setHasLoadedInitialData(true);
//     }
//   }, [singleAttendanceData, studentsByClass, dates, isUpdate, hasLoadedInitialData]);

//   useEffect(() => {
//     if (!isUpdate && studentsByClass.length > 0 && dates.length > 0) {
//       const init: Record<string, any> = {};
//       attendanceSheetData?.students?.forEach((apiS: any) => {
//         apiS.attendance?.forEach((att: any) => {
//           init[`${apiS.student.id}_${att.date}`] = {
//             breakfast: att.breakfast,
//             lunch: att.lunch,
//             dinner: att.dinner,
//             isFreeMeal: att.isFreeMeal || false
//           };
//         });
//       });
//       studentsByClass.forEach((s: Student) => {
//         dates.forEach((d: string) => {
//           const k = `${s._id}_${d}`;
//           if (!init[k]) init[k] = { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
//         });
//       });
//       setLocalAttendanceData(init);
//       clearSelection();
//     }
//   }, [attendanceSheetData, studentsByClass, dates, isUpdate]); // eslint-disable-line react-hooks/exhaustive-deps

//   // --- Logic Helpers ---
//   const getMealStatus = useCallback((sid: string, date: string, meal: string): boolean => {
//     const k = `${sid}_${date}`;
//     if (attendanceChanges[k] && meal in attendanceChanges[k]) return attendanceChanges[k][meal];
//     return localAttendanceData[k]?.[meal] ?? false;
//   }, [attendanceChanges, localAttendanceData]);

//   const getIsFreeMeal = useCallback((sid: string, date: string): boolean => {
//     const k = `${sid}_${date}`;
//     if (attendanceChanges[k] && 'isFreeMeal' in attendanceChanges[k]) return attendanceChanges[k].isFreeMeal;
//     return localAttendanceData[k]?.isFreeMeal ?? false;
//   }, [attendanceChanges, localAttendanceData]);

//   const getMealsForDay = useCallback((sid: string, date: string) =>
//     (getMealStatus(sid, date, 'breakfast') ? 1 : 0) +
//     (getMealStatus(sid, date, 'lunch') ? 1 : 0) +
//     (getMealStatus(sid, date, 'dinner') ? 1 : 0)
//     , [getMealStatus]);

//   const getTotalCostForStudent = useCallback((sid: string) => {
//     let cost = 0;
//     dates.forEach((d: string) => {
//       if (!getIsFreeMeal(sid, d)) {
//         cost += getMealsForDay(sid, d) * mealRate;
//       }
//     });
//     return cost;
//   }, [dates, getMealsForDay, getIsFreeMeal, mealRate]);

//   const getTotalMealsForStudent = useCallback((sid: string) =>
//     dates.reduce((a: number, d: string) => a + getMealsForDay(sid, d), 0)
//     , [dates, getMealsForDay]);

//   // --- Handlers ---
//   const handleMealToggle = (sid: string, date: string, meal: string) => {
//     const cur = getMealStatus(sid, date, meal);
//     const k = `${sid}_${date}`;
//     setAttendanceChanges(prev => ({ ...prev, [k]: { ...prev[k], studentId: sid, date, [meal]: !cur } }));
//   };

//   // ✅ UPDATED: Toggle Free Meal logic
//   const handleFreeMealToggle = (sid: string, date: string) => {
//     const cur = getIsFreeMeal(sid, date);
//     const newFreeStatus = !cur;
//     const k = `${sid}_${date}`;

//     setAttendanceChanges(prev => {
//       // Get the most up-to-date state for this cell
//       const currentData = prev[k] || localAttendanceData[k] || { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };

//       const updatePayload: any = {
//         studentId: sid,
//         date,
//         isFreeMeal: newFreeStatus
//       };

//       // If marking as FREE, we must set all meals to false as requested
//       if (newFreeStatus) {
//         updatePayload.breakfast = false;
//         updatePayload.lunch = false;
//         updatePayload.dinner = false;
//       }

//       return { ...prev, [k]: { ...currentData, ...updatePayload } };
//     });
//   };

//   // --- Drag Logic ---
//   const buildRange = (a: number, b: number): Set<number> => {
//     const s = new Set<number>();
//     const lo = Math.min(a, b), hi = Math.max(a, b);
//     for (let i = lo; i <= hi; i++) s.add(i);
//     return s;
//   };

//   const handleDragStart = (e: React.MouseEvent, idx: number, type: 'row' | 'col') => {
//     if (e.button !== 0) return;
//     if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
//     e.preventDefault();
//     isDragging.current = true;
//     dragStartIdx.current = idx;
//     dragLastIdx.current = idx;

//     if (type === 'row') {
//       const currentSet = selectedRowIndices;
//       let newSet: Set<number>;
//       if (e.shiftKey && currentSet.size > 0) newSet = buildRange(Math.min(...currentSet), idx);
//       else if (e.ctrlKey || e.metaKey) { newSet = new Set(currentSet); if (newSet.has(idx)) newSet.delete(idx); else newSet.add(idx); }
//       else newSet = new Set([idx]);
//       setSelectedRowIndices(newSet);
//       setSelectedColIndices(new Set());
//     } else {
//       const currentSet = selectedColIndices;
//       let newSet: Set<number>;
//       if (e.shiftKey && currentSet.size > 0) newSet = buildRange(Math.min(...currentSet), idx);
//       else if (e.ctrlKey || e.metaKey) { newSet = new Set(currentSet); if (newSet.has(idx)) newSet.delete(idx); else newSet.add(idx); }
//       else newSet = new Set([idx]);
//       setSelectedColIndices(newSet);
//       if (selectionMode !== 'row') setSelectedRowIndices(new Set());
//     }
//   };

//   const handleDragEnter = (e: React.MouseEvent, idx: number, type: 'row' | 'col') => {
//     if (!isDragging.current || idx === dragLastIdx.current) return;
//     dragLastIdx.current = idx;
//     const range = buildRange(dragStartIdx.current, idx);
//     if (type === 'row') setSelectedRowIndices(range);
//     else setSelectedColIndices(range);
//   };

//   useEffect(() => {
//     const up = () => { isDragging.current = false; };
//     window.addEventListener('mouseup', up);
//     return () => window.removeEventListener('mouseup', up);
//   }, []);

//   // ✅ UPDATED: Bulk Actions (Header Buttons)
//   const applyMealAction = (action: 'full' | 'b' | 'l' | 'd' | 'free', value: boolean) => {
//     const isRowMode = selectionMode === 'row';
//     const hasSelection = isRowMode ? selectedRowIndices.size > 0 : selectedColIndices.size > 0;

//     if (!hasSelection) {
//       setSnackbar({ open: true, message: `Please select ${isRowMode ? 'student row(s)' : 'date column(s)'} first!`, severity: 'warning' });
//       return;
//     }

//     const targetStudents = isRowMode ? filteredStudents.filter((_: any, i: number) => selectedRowIndices.has(i)) : studentsByClass;
//     const targetDates = isRowMode ? (selectedColIndices.size > 0 ? dates.filter((_, i) => selectedColIndices.has(i)) : dates) : dates.filter((_, i) => selectedColIndices.has(i));

//     const nc = { ...attendanceChanges };
//     const nl = { ...localAttendanceData };

//     targetStudents.forEach((s: Student) => {
//       targetDates.forEach((d: string) => {
//         const k = `${s._id}_${d}`;
//         const update: any = { studentId: s._id, date: d };

//         if (action === 'free') {
//           update.isFreeMeal = value;
//           // If marking as free, explicitly set meals to false to match requirement
//           if (value) {
//             update.breakfast = false;
//             update.lunch = false;
//             update.dinner = false;
//           }
//         }
//         else if (action === 'full') update.breakfast = update.lunch = update.dinner = value;
//         else update[action] = value;

//         // Ensure isFreeMeal is preserved in current state if not updating
//         const current = nc[k] || nl[k] || { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
//         nc[k] = { ...current, ...update };
//         nl[k] = { ...current, ...update };
//       });
//     });

//     setAttendanceChanges(nc);
//     setLocalAttendanceData(nl);

//     let msg = `${value ? '✅' : '❌'} `;
//     if (action === 'free') msg += `Marked as Free`;
//     else if (action === 'full') msg += `Meals`;
//     else msg += `Meal Type`;
//     setSnackbar({ open: true, message: msg, severity: 'success' });
//   };

//   const setAllMealsValue = (value: boolean) => {
//     const nc: Record<string, any> = {}, nl: Record<string, any> = {};
//     studentsByClass.forEach((s: Student) => {
//       dates.forEach((d: string) => {
//         const k = `${s._id}_${d}`;
//         nc[k] = { studentId: s._id, date: d, breakfast: value, lunch: value, dinner: value };
//         nl[k] = { breakfast: value, lunch: value, dinner: value };
//       });
//     });
//     setAttendanceChanges(nc); setLocalAttendanceData(nl);
//     setSnackbar({ open: true, message: value ? '✅ All meals added!' : '❌ All meals removed!', severity: 'success' });
//   };

//   const assignMealAllDates = (meal: string, value: boolean) => {
//     const nc = { ...attendanceChanges };
//     const nl = { ...localAttendanceData };
//     studentsByClass.forEach((s: Student) => dates.forEach((d: string) => {
//       const k = `${s._id}_${d}`;
//       const current = nc[k] || nl[k] || { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
//       nc[k] = { ...current, studentId: s._id, date: d, [meal]: value };
//       nl[k] = { ...current, [meal]: value };
//     }));
//     setAttendanceChanges(nc);
//     setLocalAttendanceData(nl);
//     setSnackbar({ open: true, message: `${meal} ${value ? 'added' : 'removed'} for all dates`, severity: 'success' });
//   };

//   // --- Save Logic ---
//   const handleSaveAll = async () => {
//     try {
//       const changes = Object.values(attendanceChanges);
//       let attendancesToSave;

//       if (changes.length > 0) {
//         attendancesToSave = changes.map((c: any) => ({
//           studentId: c.studentId,
//           date: c.date,
//           breakfast: c.breakfast ?? false,
//           lunch: c.lunch ?? false,
//           dinner: c.dinner ?? false,
//           isFreeMeal: c.isFreeMeal ?? false,
//         }));
//       } else {
//         const allAttendanceData: any[] = [];
//         for (const student of studentsByClass) {
//           for (const date of dates) {
//             const k = `${student._id}_${date}`;
//             const current = localAttendanceData[k] || { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
//             allAttendanceData.push({
//               studentId: student._id,
//               date: date,
//               breakfast: current.breakfast,
//               lunch: current.lunch,
//               dinner: current.dinner,
//               isFreeMeal: current.isFreeMeal,
//             });
//           }
//         }
//         attendancesToSave = allAttendanceData;
//       }

//       if (attendancesToSave.length === 0) { setSnackbar({ open: true, message: 'No data to save', severity: 'warning' }); return; }

//       const result = await bulkCreateAttendance({ academicYear: getCurrentAcademicYear(), attendances: attendancesToSave }).unwrap();

//       const nl = { ...localAttendanceData };
//       attendancesToSave.forEach((att: any) => {
//         nl[`${att.studentId}_${att.date}`] = { breakfast: att.breakfast, lunch: att.lunch, dinner: att.dinner, isFreeMeal: att.isFreeMeal };
//       });

//       setLocalAttendanceData(nl);
//       setAttendanceChanges({});
//       setSnackbar({ open: true, message: `${result.totalProcessed || attendancesToSave.length} records saved`, severity: 'success' });
//       refetchMonthly();
//       setTimeout(() => { router.push('/dashboard/daily-meal-report'); }, 1500);

//     } catch (err: any) { setSnackbar({ open: true, message: err?.data?.message || 'Failed to save', severity: 'error' }); }
//   };

//   const handleUpdateSave = async () => {
//     if (!attendanceId) return;
//     try {
//       const changes = Object.values(attendanceChanges);
//       let attendanceToSave;
//       if (changes.length > 0) attendanceToSave = changes[0];
//       else if (dates[0] && studentsByClass.length > 0) {
//         const firstStudent = studentsByClass[0];
//         attendanceToSave = {
//           studentId: firstStudent._id,
//           date: dates[0],
//           breakfast: localAttendanceData[`${firstStudent._id}_${dates[0]}`]?.breakfast ?? false,
//           lunch: localAttendanceData[`${firstStudent._id}_${dates[0]}`]?.lunch ?? false,
//           dinner: localAttendanceData[`${firstStudent._id}_${dates[0]}`]?.dinner ?? false,
//           isFreeMeal: localAttendanceData[`${firstStudent._id}_${dates[0]}`]?.isFreeMeal ?? false, // ✅ Ensure Free Meal is saved in update
//         };
//       } else { setSnackbar({ open: true, message: 'No data to save', severity: 'warning' }); return; }

//       await updateAttendance({
//         id: attendanceId,
//         data: { student: attendanceToSave.studentId, date: attendanceToSave.date, breakfast: attendanceToSave.breakfast, lunch: attendanceToSave.lunch, dinner: attendanceToSave.dinner, isFreeMeal: attendanceToSave.isFreeMeal, academicYear: getCurrentAcademicYear() }
//       }).unwrap();
//       setSnackbar({ open: true, message: 'Attendance updated successfully!', severity: 'success' });
//       setAttendanceChanges({});
//       setTimeout(() => { router.push('/dashboard/daily-meal-report'); }, 1500);
//     } catch (err: any) { setSnackbar({ open: true, message: err?.data?.message || 'Failed to update', severity: 'error' }); }
//   };

//   const handleReset = () => {
//     setAttendanceChanges({}); clearSelection();
//     const nl = { ...localAttendanceData };
//     studentsByClass.forEach((s: Student) => dates.forEach((d: string) => { nl[`${s._id}_${d}`] = { breakfast: true, lunch: true, dinner: true, isFreeMeal: false }; }));
//     setLocalAttendanceData(nl);
//     setSnackbar({ open: true, message: 'Reset — all meals set to present', severity: 'info' });
//   };

//   const filteredStudents = useMemo(() => studentsByClass.filter((s: Student) => s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.nameBangla?.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentClassRoll?.toString().includes(searchTerm) || s.studentId?.toLowerCase().includes(searchTerm.toLowerCase())), [studentsByClass, searchTerm]);

//   // if (isUpdate && isLoadingSingle) return <Box sx={{ p: 4 }}><Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}><CircularProgress /><Typography sx={{ mt: 2 }} color="text.secondary">Loading attendance data...</Typography></Paper></Box>;
//   // if (!classDropdownOptions.length) return <Box sx={{ p: 4 }}><Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}><CircularProgress /><Typography sx={{ mt: 2 }} color="text.secondary">Loading class data…</Typography></Paper></Box>;

//   const hasColSel = selectedColIndices.size > 0;
//   const hasRowSel = selectedRowIndices.size > 0;
//   const selLabels = Array.from(selectedColIndices).sort((a, b) => a - b).map(i => dates[i] ? dayjs(dates[i]).format('DD MMM') : '').filter(Boolean);
//   const pageTitle = isUpdate ? 'Update Meal Attendance' : 'Meal Attendance Management';
//   const displayClassName = selectedClassId === ALL_CLASSES ? 'All Classes' : (allClasses.find(c => c._id === selectedClassId)?.className || 'Class');

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
//         {/* Header */}
//         <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', color: 'white' }}>
//           <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
//             <Box>
//               <Box display="flex" alignItems="center" gap={1} mb={1}>
//                 {isUpdate && <IconButton onClick={() => router.push('/dashboard/daily-meal-report')} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}><ArrowBackIcon /></IconButton>}
//                 <Typography variant="h4" fontWeight="bold">{pageTitle}</Typography>
//               </Box>
//               {!isUpdate && (
//                 <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
//                   <Chip label={`Class: ${displayClassName}`} sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }} size="small" />
//                   <Chip label={`${studentsByClass.length} Students`} sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }} size="small" />
//                 </Box>
//               )}
//             </Box>
//           </Box>
//         </Paper>

//         <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
//           {/* Toolbar */}
//           <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
//             <Grid container spacing={2} alignItems="center" width='1000px'>
//               <Grid item xs={12} sm={3} md={3}>
//                 <FormControl fullWidth size="small">
//                   <InputLabel>Select Class</InputLabel>
//                   <Select value={selectedClassId} label="Select Class" onChange={e => { setSelectedClassId(e.target.value); setAttendanceChanges({}); clearSelection(); setHasLoadedInitialData(false); setLocalAttendanceData({}); }} disabled={isUpdate}>
//                     {!isUpdate && <MenuItem value={ALL_CLASSES}><em>All Classes</em></MenuItem>}
//                     {classDropdownOptions.map((o: any) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
//                   </Select>
//                 </FormControl>
//               </Grid>
//               {!isUpdate && (
//                 <Grid item xs={12} sm={3}>
//                   <DatePicker label="Select Month" views={['year', 'month']} value={selectedMonth} onChange={v => { setSelectedMonth(v); setAttendanceChanges({}); clearSelection(); setHasLoadedInitialData(false); setLocalAttendanceData({}); }} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
//                 </Grid>
//               )}
//               <Grid item xs={12} sm={3}>
//                 <TextField fullWidth size="small" placeholder="Search student…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>, endAdornment: searchTerm && <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchTerm('')}><ClearIcon fontSize="small" /></IconButton></InputAdornment> }} />
//               </Grid>
//               {!isUpdate && <Grid item xs={6} sm={1.5}><Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => { setAttendanceChanges({}); clearSelection(); refetchMonthly(); }} size="small" fullWidth>Refresh</Button></Grid>}
//               {!isUpdate && (
//                 <Grid item xs={6} sm={1.5}>
//                   <ToggleButtonGroup value={selectionMode} exclusive onChange={(e, val) => val && setSelectionMode(val)} size="small" fullWidth sx={{ bgcolor: '#f5f5f5' }}>
//                     <ToggleButton value="col"><Tooltip title="Select Columns (Dates)"><ColumnIcon fontSize="small" /></Tooltip></ToggleButton>
//                     <ToggleButton value="row"><Tooltip title="Select Rows (Students)"><RowIcon fontSize="small" /></Tooltip></ToggleButton>
//                   </ToggleButtonGroup>
//                 </Grid>
//               )}
//             </Grid>

//             {/* Action Toolbar - Column Mode */}
//             {!isUpdate && studentsByClass.length > 0 && dates.length > 0 && selectionMode === 'col' && (
//               <Box sx={{ mt: 2, p: '10px 16px', bgcolor: hasColSel ? '#EBF3FF' : '#f8f9fa', border: hasColSel ? `1.5px solid ${COL_SEL_BORDER}` : '1px solid #e0e0e0', borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
//                 <Typography variant="caption" fontWeight="bold" color="text.secondary">Column Actions (All Students):</Typography>
//                 <Button variant="contained" color="success" size="small" startIcon={<AddIcon />} onClick={() => hasColSel ? applyMealAction('full', true) : setAllMealsValue(true)} sx={{ textTransform: 'none', fontWeight: 'bold' }}>{hasColSel ? `Add Full Meal (${selectedColIndices.size} col)` : 'Add All Meals'}</Button>
//                 <Button variant="contained" color="error" size="small" startIcon={<RemoveCircleIcon />} onClick={() => hasColSel ? applyMealAction('full', false) : setAllMealsValue(false)} sx={{ textTransform: 'none', fontWeight: 'bold' }}>{hasColSel ? `Remove Full Meal (${selectedColIndices.size} col)` : 'Remove All Meals'}</Button>
//                 <Divider orientation="vertical" flexItem />
//                 <Button size="small" variant="outlined" onClick={() => hasColSel ? applyMealAction('b', true) : assignMealAllDates('breakfast', true)}><BreakfastIcon fontSize="small" sx={{ mr: 0.4 }} />+B</Button>
//                 <Button size="small" variant="outlined" onClick={() => hasColSel ? applyMealAction('l', true) : assignMealAllDates('lunch', true)}><LunchIcon fontSize="small" sx={{ mr: 0.4 }} />+L</Button>
//                 <Button size="small" variant="outlined" onClick={() => hasColSel ? applyMealAction('d', true) : assignMealAllDates('dinner', true)}><DinnerIcon fontSize="small" sx={{ mr: 0.4 }} />+D</Button>
//                 <Divider orientation="vertical" flexItem />
//                 <Button size="small" variant="outlined" color="warning" onClick={() => applyMealAction('free', true)}><MoneyOff fontSize="small" sx={{ mr: 0.4 }} />Mark Free</Button>
//                 <Button size="small" variant="outlined" onClick={() => applyMealAction('free', false)}><MoneyOffCsred fontSize="small" sx={{ mr: 0.4 }} />Unmark Free</Button>
//                 <Box flexGrow={1} />
//                 {!hasColSel ? <Typography variant="body2" color="text.secondary"><strong>Click</strong> a date column header or drag to select multiple dates.</Typography> : <Box display="flex" alignItems="center" gap={1} flexWrap="wrap"><Typography variant="body2" fontWeight="bold" color={COL_SEL_BORDER}>{selectedColIndices.size} column(s) selected:</Typography>{selLabels.slice(0, 10).map(lbl => <Chip key={lbl} label={lbl} size="small" sx={{ bgcolor: COL_HEADER_BG, color: COL_SEL_BORDER, fontWeight: 'bold', height: 22 }} />)}{selLabels.length > 10 && <Chip label={`+${selLabels.length - 10} more`} size="small" variant="outlined" />}</Box>}
//                 <Button size="small" onClick={clearSelection} sx={{ minWidth: 60 }}>Clear</Button>
//               </Box>
//             )}

//             {/* Action Toolbar - Row Mode */}
//             {!isUpdate && studentsByClass.length > 0 && dates.length > 0 && selectionMode === 'row' && (
//               <Box sx={{ mt: 2, p: '10px 16px', bgcolor: hasRowSel ? '#FFF7ED' : '#f8f9fa', border: hasRowSel ? `1.5px solid ${ROW_SEL_BORDER}` : '1px solid #e0e0e0', borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
//                 <Typography variant="caption" fontWeight="bold" color="text.secondary">Row Actions (All Dates):</Typography>
//                 <Button size="small" variant="contained" color="success" onClick={() => applyMealAction('full', true)} startIcon={<AddIcon />}>Add All</Button>
//                 <Button size="small" variant="contained" color="error" onClick={() => applyMealAction('full', false)} startIcon={<RemoveCircleIcon />}>Remove All</Button>
//                 <Divider orientation="vertical" flexItem />
//                 <Button size="small" variant="outlined" onClick={() => applyMealAction('b', true)}><BreakfastIcon fontSize="small" sx={{ mr: 0.4 }} />+B</Button>
//                 <Button size="small" variant="outlined" onClick={() => applyMealAction('l', true)}><LunchIcon fontSize="small" sx={{ mr: 0.4 }} />+L</Button>
//                 <Button size="small" variant="outlined" onClick={() => applyMealAction('d', true)}><DinnerIcon fontSize="small" sx={{ mr: 0.4 }} />+D</Button>
//                 <Divider orientation="vertical" flexItem />
//                 <Button size="small" variant="outlined" color="warning" onClick={() => applyMealAction('free', true)}><MoneyOff fontSize="small" sx={{ mr: 0.4 }} />Mark Free</Button>
//                 <Button size="small" variant="outlined" onClick={() => applyMealAction('free', false)}><MoneyOffCsred fontSize="small" sx={{ mr: 0.4 }} />Unmark Free</Button>
//                 <Box flexGrow={1} />
//                 {!hasRowSel ? <Typography variant="body2" color="text.secondary"><strong>Click</strong> a student row or drag to select multiple students.</Typography> : <Typography variant="body2" fontWeight="bold" color={ROW_SEL_BORDER}>{selectedRowIndices.size} student(s) selected{selectedColIndices.size > 0 && ` • ${selectedColIndices.size} date(s) selected (actions apply only to these dates)`}</Typography>}
//                 {hasRowSel && <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>Tip: drag across that student&apos;s date cells (the meal icons) to pick specific dates — actions above will then apply only to that date range.</Typography>}
//                 <Button size="small" onClick={clearSelection} sx={{ minWidth: 60 }}>Clear</Button>
//               </Box>
//             )}

//             {/* Save Buttons */}
//             {studentsByClass.length > 0 && dates.length > 0 && (
//               <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
//                 {!isUpdate && <Button size="small" color="error" onClick={handleReset} disabled={!Object.keys(attendanceChanges).length}>Cancel</Button>}
//                 <Button variant="contained" startIcon={isSaving || isUpdating ? <CircularProgress size={18} /> : <SaveIcon />} onClick={isUpdate ? handleUpdateSave : handleSaveAll} disabled={isSaving || isUpdating}>
//                   {isUpdate ? 'Update Attendance' : (Object.keys(attendanceChanges).length ? `Save (${Object.keys(attendanceChanges).length})` : 'Save')}
//                 </Button>
//               </Box>
//             )}
//             {!isUpdate && Object.keys(attendanceChanges).length > 0 && <Alert severity="warning" sx={{ mt: 1.5 }} onClose={handleReset}><strong>{Object.keys(attendanceChanges).length} unsaved change(s)!</strong> Please save.</Alert>}
//           </Box>

//           {/* Table */}
//           {selectedClassId && filteredStudents.length > 0 && dates.length > 0 && (
//             <TableContainer sx={{ maxHeight: '72vh', overflow: 'auto', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}>
//               <Table stickyHeader size="small" sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 700, bgcolor: '#EAECF0', minWidth: 190, position: 'sticky', left: 0, zIndex: 5, borderRight: '2px solid #CDD0D5', fontSize: 12 }}>Student Name</TableCell>
//                     {dates.map((date: string, dIdx: number) => {
//                       const sel = selectionMode === 'row' ? false : selectedColIndices.has(dIdx);
//                       return (
//                         <TableCell key={date} align="center" sx={{ minWidth: 108, bgcolor: sel ? COL_HEADER_BG : '#EAECF0', borderLeft: sel ? `2px solid ${COL_SEL_BORDER}` : '1px solid #D0D3D8', borderRight: sel ? `2px solid ${COL_SEL_BORDER}` : '1px solid #D0D3D8', borderTop: sel ? `3px solid ${COL_SEL_BORDER}` : '2px solid #EAECF0', cursor: !isUpdate && selectionMode === 'col' ? 'col-resize' : 'default', zIndex: 3, p: '6px 4px' }}
//                           onMouseDown={!isUpdate && selectionMode === 'col' ? (e) => handleDragStart(e, dIdx, 'col') : undefined}
//                           onMouseEnter={!isUpdate && selectionMode === 'col' ? (e) => handleDragEnter(e, dIdx, 'col') : undefined}>
//                           <Typography variant="caption" display="block" fontWeight={700} sx={{ color: sel ? COL_SEL_BORDER : '#1a1a2e' }}>{dayjs(date).format('DD MMM')}</Typography>
//                           <Typography variant="caption" display="block" sx={{ color: sel ? COL_SEL_BORDER : '#666' }}>{dayjs(date).format('ddd')}</Typography>
//                         </TableCell>
//                       );
//                     })}
//                     <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#DBEAFE', minWidth: 88, zIndex: 3, fontSize: 12 }}>Total Meals</TableCell>
//                     <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#DBEAFE', minWidth: 110, zIndex: 3, fontSize: 12 }}>Total Cost (৳)</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {filteredStudents.map((student: Student, rIdx: number) => {
//                     const totalMeals = getTotalMealsForStudent(student._id);
//                     const totalCost = getTotalCostForStudent(student._id);
//                     const isRowSel = selectedRowIndices.has(rIdx);

//                     return (
//                       <TableRow hover key={student._id} sx={{ bgcolor: isRowSel ? ROW_SEL_BG : undefined }}>
//                         <TableCell sx={{ position: 'sticky', left: 0, bgcolor: isRowSel ? '#fff3e0' : 'white', zIndex: 1, borderRight: '2px solid #CDD0D5', borderLeft: isRowSel ? `4px solid ${ROW_SEL_BORDER}` : '4px solid transparent', cursor: !isUpdate && selectionMode === 'row' ? 'row-resize' : 'default' }}
//                           onMouseDown={!isUpdate && selectionMode === 'row' ? (e) => handleDragStart(e, rIdx, 'row') : undefined}
//                           onMouseEnter={!isUpdate && selectionMode === 'row' ? (e) => handleDragEnter(e, rIdx, 'row') : undefined}>
//                           <Box display="flex" alignItems="center" gap={1}>
//                             {selectionMode === 'row' && (isRowSel ? <CheckBoxIcon fontSize="small" color="warning" /> : <CheckBoxOutlineBlankIcon fontSize="small" color="disabled" />)}
//                             <Avatar sx={{ width: 28, height: 28, bgcolor: '#4caf50', fontSize: 12 }}><PersonIcon sx={{ fontSize: 14 }} /></Avatar>
//                             <Box><Typography variant="body2" fontWeight={500}>{student.name}</Typography><Typography variant="caption" color="text.secondary">{student.nameBangla || '—'}</Typography></Box>
//                           </Box>
//                         </TableCell>
//                         {dates.map((date: string, dIdx: number) => {
//                           const colSel = selectionMode === 'row' ? (isRowSel && selectedColIndices.has(dIdx)) : selectedColIndices.has(dIdx);
//                           const isCellActive = selectionMode === 'row' ? colSel : (isRowSel || colSel);
//                           const total = getMealsForDay(student._id, date);
//                           const b = getMealStatus(student._id, date, 'breakfast');
//                           const l = getMealStatus(student._id, date, 'lunch');
//                           const dn = getMealStatus(student._id, date, 'dinner');
//                           const isFree = getIsFreeMeal(student._id, date);

//                           let cellBg = total === 3 ? '#F0FDF4' : total > 0 ? '#FFFBEB' : '#FFF5F5';
//                           if (isFree) cellBg = FREE_MEAL_BG;
//                           if (isCellActive) cellBg = isRowSel && colSel ? 'rgba(255, 152, 0, 0.3)' : (isRowSel ? ROW_SEL_BG : COL_SEL_BG);

//                           return (
//                             <TableCell key={date} align="center" sx={{ bgcolor: cellBg, borderLeft: colSel ? `2px solid ${COL_SEL_BORDER}` : '1px solid #E8E9EC', borderRight: colSel ? `2px solid ${COL_SEL_BORDER}` : '1px solid #E8E9EC', p: '4px 2px', cursor: !isUpdate && selectionMode === 'col' ? 'cell' : 'default' }}
//                               onMouseDown={!isUpdate && (selectionMode === 'col' || selectionMode === 'row') ? (e) => { if (!(e.target as HTMLElement).closest('button')) handleDragStart(e, dIdx, 'col'); } : undefined}
//                               onMouseEnter={!isUpdate && (selectionMode === 'col' || selectionMode === 'row') ? (e) => handleDragEnter(e, dIdx, 'col') : undefined}>
//                               <Box display="flex" justifyContent="center" gap={0.2}>
//                                 <Tooltip title={`Breakfast: ${b ? 'Present' : 'Absent'}`}><IconButton size="small" color={b ? 'success' : 'default'} sx={{ p: '2px', opacity: b ? 1 : 0.3 }} onClick={e => { e.stopPropagation(); handleMealToggle(student._id, date, 'breakfast'); }} disabled={isUpdate}><BreakfastIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
//                                 <Tooltip title={`Lunch: ${l ? 'Present' : 'Absent'}`}><IconButton size="small" color={l ? 'success' : 'default'} sx={{ p: '2px', opacity: l ? 1 : 0.3 }} onClick={e => { e.stopPropagation(); handleMealToggle(student._id, date, 'lunch'); }} disabled={isUpdate}><LunchIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
//                                 <Tooltip title={`Dinner: ${dn ? 'Present' : 'Absent'}`}><IconButton size="small" color={dn ? 'success' : 'default'} sx={{ p: '2px', opacity: dn ? 1 : 0.3 }} onClick={e => { e.stopPropagation(); handleMealToggle(student._id, date, 'dinner'); }} disabled={isUpdate}><DinnerIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
//                                 <Tooltip title={isFree ? "Mark as Paid" : "Mark as Free"}>
//                                   <IconButton size="small" color={isFree ? 'warning' : 'default'} sx={{ p: '2px', opacity: isFree ? 1 : 0.4 }} onClick={e => { e.stopPropagation(); handleFreeMealToggle(student._id, date); }} disabled={isUpdate}>
//                                     <MoneyOff sx={{ fontSize: 15 }} />
//                                   </IconButton>
//                                 </Tooltip>
//                               </Box>
//                               <Typography variant="caption" display="block" align="center" sx={{ color: isFree ? '#F57C00' : (total === 3 ? '#16a34a' : '#999'), fontWeight: 700, lineHeight: 1.1, mt: '1px', fontSize: 11 }}>{isFree ? 'Free' : `${total}/3`}</Typography>
//                             </TableCell>
//                           );
//                         })}
//                         <TableCell align="center" sx={{ bgcolor: '#DBEAFE' }}><Typography fontWeight="bold" fontSize={12}>{totalMeals}</Typography></TableCell>
//                         <TableCell align="center" sx={{ bgcolor: '#DBEAFE' }}><Typography fontWeight="bold" fontSize={12} color={totalCost === 0 ? '#999' : '#0277BD'}>{totalCost > 0 ? `৳${totalCost}` : '-'}</Typography></TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}
//         </Paper>
//         <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}><Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert></Snackbar>
//       </Box>
//     </LocalizationProvider>
//   );
// };

// export default AddMealForm;
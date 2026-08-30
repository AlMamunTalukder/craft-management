/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ALL_CLASSES, COL_HEADER_BG, COL_SEL_BG, COL_SEL_BORDER, DEFAULT_MEAL_RATES, FREE_MEAL_BG, getCurrentAcademicYear, PERSON_AVATARS, PERSON_LABELS, ROW_SEL_BG, ROW_SEL_BORDER, TAB_COLORS } from '@/constant/meal';
import { useAcademicOption } from '@/hooks/useAcademicOption';
import { ClassItem, MealRates, PersonRow, PersonType } from '@/interface/meal';
import {
  useBulkCreateAttendanceMutation,
  useGetAttendanceByIdQuery,
  useGetMonthlyAttendanceSheetQuery,
  useUpdateAttendanceMutation,
} from '@/redux/api/mealAttendanceApi';
import { useGetAllStaffQuery } from '@/redux/api/staffApi';
import { useGetAllTeachersQuery } from '@/redux/api/teacherApi';
import {
  BreakfastDining as BreakfastIcon, 
  Clear as ClearIcon,
  DinnerDining as DinnerIcon,
  LunchDining as LunchIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  RemoveCircle as RemoveCircleIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  ViewColumn as ColumnIcon,
  ViewList as RowIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Add as AddIcon,
  MoneyOff,
  MoneyOffCsred,
  School as SchoolIcon,
  Group as GroupIcon,
  Engineering as StaffIcon,
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
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  Zoom,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';


const AddMealForm: any = ({ isUpdate = false, attendanceId = '' }) => {
  const { classData, studentData } = useAcademicOption();
  const [bulkCreateAttendance, { isLoading: isSaving }] = useBulkCreateAttendanceMutation();
  const category = 'Residential'

  const { data: staffApiData } = useGetAllStaffQuery({ category: category });
  const { data: teacherApiData } = useGetAllTeachersQuery({ category: category, sort: 'teacherSerial' } as any);

  // ─── Core state ────────────────────────────────────────────────────────────
  const [personType, setPersonType] = useState<PersonType>('student');
  const [selectedClassId, setSelectedClassId] = useState<string>(ALL_CLASSES);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const [attendanceChanges, setAttendanceChanges] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [localAttendanceData, setLocalAttendanceData] = useState<Record<string, any>>({});

  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // Selection state
  const [selectionMode, setSelectionMode] = useState<'row' | 'col'>('col');
  const [selectedColIndices, setSelectedColIndices] = useState<Set<number>>(new Set());
  const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());

  // Custom meal rates (editable, defaults from API / fallback)
  const [customRates, setCustomRates] = useState<MealRates | null>(null);
  const [showRateEditor, setShowRateEditor] = useState(false);

  const isDragging = useRef(false);
  const dragStartIdx = useRef(-1);
  const dragLastIdx = useRef(-1);

  // ─── Person lists ───────────────────────────────────────────────────────────

  // Students (enrolled, residential/non-residential one meal)
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

  // Teachers (active)
  const allTeachers: PersonRow[] = useMemo(() => {
    const data = teacherApiData?.data?.data || teacherApiData?.data || [];
    return (Array.isArray(data) ? data : []).filter((t: any) => t.status === 'Active');
  }, [teacherApiData]);

  // Staff (active)
  const allStaff: PersonRow[] = useMemo(() => {
    const data = staffApiData?.data?.data || staffApiData?.data || [];
    return (Array.isArray(data) ? data : []).filter((s: any) => s.status === 'Active');
  }, [staffApiData]);

  // Active person list for current tab
  const activePersons: PersonRow[] = useMemo(() => {
    if (personType === 'teacher') return allTeachers;
    if (personType === 'staff') return allStaff;
    return allStudents;
  }, [personType, allStudents, allTeachers, allStaff]);

  // ─── Classes ────────────────────────────────────────────────────────────────

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
    [allClasses],
  );

  // Filter students by class
  const personsByClass: PersonRow[] = useMemo(() => {
    if (personType !== 'student') return activePersons;
    if (selectedClassId === ALL_CLASSES) return allStudents;
    return allStudents.filter((s: any) =>
      Array.isArray(s.className) && s.className.some((c: any) => (c._id || c) === selectedClassId),
    );
  }, [personType, activePersons, allStudents, selectedClassId]);

  // ─── Sheet API query ────────────────────────────────────────────────────────

  const className =
    personType === 'student' && selectedClassId !== ALL_CLASSES
      ? (allClasses.find(c => c._id === selectedClassId)?.className || '')
      : '';

  const shouldFetchSheet = !isUpdate && !!selectedMonth && (personType !== 'student' || (selectedClassId !== ALL_CLASSES && !!className));

  const { data: monthlyData, isLoading: loadMonthly, refetch: refetchMonthly } =
    useGetMonthlyAttendanceSheetQuery(
      {
        personType,
        className: personType === 'student' ? className : undefined,
        month: selectedMonth?.format('YYYY-MM') || '',
        academicYear: getCurrentAcademicYear(),
      },
      { skip: !shouldFetchSheet },
    );

  // Default rates from API (or fallback) — used as the base before any custom override
  const apiMealRates: MealRates = useMemo(() => {
    const apiRates = monthlyData?.mealRates;
    return {
      breakfast: apiRates?.breakfast ?? DEFAULT_MEAL_RATES.breakfast,
      lunch: apiRates?.lunch ?? DEFAULT_MEAL_RATES.lunch,
      dinner: apiRates?.dinner ?? DEFAULT_MEAL_RATES.dinner,
    };
  }, [monthlyData]);

  // Effective rates = custom override (if set) else API/default rates
  const mealRates: MealRates = customRates ?? apiMealRates;

  // Sync customRates editor fields when API rates first arrive / change (only if user hasn't customized yet)
  useEffect(() => {
    if (!customRates) {
      // keep null so it always tracks apiMealRates until user edits
      return;
    }
  }, [apiMealRates, customRates]);

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

  const resetRatesToDefault = () => {
    setCustomRates(null);
    toast.success('Meal rates reset to default');
  };

  // ─── Dates ──────────────────────────────────────────────────────────────────

  const dates = useMemo<string[]>(() => {
    if (monthlyData?.dates?.length) return monthlyData.dates;
    if (selectedMonth) {
      const list: string[] = [];
      let cur = selectedMonth.startOf('month');
      const e = selectedMonth.endOf('month');
      while (!cur.isAfter(e)) { list.push(cur.format('YYYY-MM-DD')); cur = cur.add(1, 'day'); }
      return list;
    }
    return [];
  }, [monthlyData, selectedMonth]);

  // ─── Clear selection helpers ─────────────────────────────────────────────────

  const clearSelection = () => { setSelectedColIndices(new Set()); setSelectedRowIndices(new Set()); };

  useEffect(() => { clearSelection(); }, [selectedClassId, searchTerm, selectionMode, personType]); // eslint-disable-line

  // ─── Tab change: reset everything ───────────────────────────────────────────

  const handlePersonTypeChange = (_: any, newType: PersonType | null) => {
    if (!newType) return;
    setPersonType(newType);
    setAttendanceChanges({});
    setLocalAttendanceData({});
    clearSelection();
    setHasLoadedInitialData(false);
    setSelectedClassId(ALL_CLASSES);
    setCustomRates(null);
  };

  // ─── Load initial data from API sheet ───────────────────────────────────────

  useEffect(() => {
    if (!isUpdate && personsByClass.length > 0 && dates.length > 0) {
      const init: Record<string, any> = {};

      // Pre-load from API response
      monthlyData?.persons?.forEach((apiP: any) => {
        const pid = apiP.person?.id?.toString() || apiP.student?.id?.toString();
        apiP.attendance?.forEach((att: any) => {
          init[`${pid}_${att.date}`] = {
            breakfast: att.breakfast,
            lunch: att.lunch,
            dinner: att.dinner,
            isFreeMeal: att.isFreeMeal || false,
          };
        });
      });

      // Fill gaps with defaults
      personsByClass.forEach(p => {
        dates.forEach(d => {
          const k = `${p._id}_${d}`;
          if (!init[k]) init[k] = { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
        });
      });

      setLocalAttendanceData(init);
      clearSelection();
    }
  }, [monthlyData, personsByClass, dates, isUpdate]);
  const getMealStatus = useCallback(
    (pid: string, date: string, meal: string): boolean => {
      const k = `${pid}_${date}`;
      if (attendanceChanges[k] && meal in attendanceChanges[k]) return attendanceChanges[k][meal];
      return localAttendanceData[k]?.[meal] ?? false;
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

  // Cost for a single day using effective per-meal rates (custom or default)
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
    setAttendanceChanges(prev => ({ ...prev, [k]: { ...prev[k], personId: pid, date, [meal]: !cur } }));
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
      toast(`Please select ${isRowMode ? 'person row(s)' : 'date column(s)'} first!`, { icon: '⚠️' });
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
        } else {
          update[action === 'b' ? 'breakfast' : action === 'l' ? 'lunch' : 'dinner'] = value;
        }

        nc[k] = { ...current, ...update };
        nl[k] = { ...current, ...update };
      });
    });

    setAttendanceChanges(nc);
    setLocalAttendanceData(nl);
    toast.success(`${value ? '✅' : '❌'} ${action === 'free' ? 'Marked as Free' : action === 'full' ? 'Full Meal' : `Meal (${action})`}`);
  };

  const setAllMealsValue = (value: boolean) => {
    const nc: Record<string, any> = {}, nl: Record<string, any> = {};
    personsByClass.forEach((p: PersonRow) => {
      dates.forEach((d: string) => {
        const k = `${p._id}_${d}`;
        nc[k] = { personId: p._id, date: d, breakfast: value, lunch: value, dinner: value };
        nl[k] = { breakfast: value, lunch: value, dinner: value };
      });
    });
    setAttendanceChanges(nc);
    setLocalAttendanceData(nl);
    toast.success(value ? '✅ All meals added!' : '❌ All meals removed!');
  };

  const assignMealAllDates = (meal: string, value: boolean) => {
    const nc = { ...attendanceChanges };
    const nl = { ...localAttendanceData };
    personsByClass.forEach((p: PersonRow) => {
      dates.forEach((d: string) => {
        const k = `${p._id}_${d}`;
        const cur = nc[k] || nl[k] || { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
        nc[k] = { ...cur, personId: p._id, date: d, [meal]: value };
        nl[k] = { ...cur, [meal]: value };
      });
    });
    setAttendanceChanges(nc);
    setLocalAttendanceData(nl);
    toast.success(`${meal} ${value ? 'added' : 'removed'} for all dates`);
  };

  // ─── Save ────────────────────────────────────────────────────────────────────

  const handleSaveAll = async () => {
    try {
      const changes = Object.values(attendanceChanges);
      let toSave: any[];

      // Custom per-meal rates to attach to every saved record (if user customized them)
      const rateOverrides = {
        breakfastRate: mealRates.breakfast,
        lunchRate: mealRates.lunch,
        dinnerRate: mealRates.dinner,
      };

      if (changes.length > 0) {
        toSave = changes.map((c: any) => ({
          personId: c.personId,
          personType,
          date: c.date,
          breakfast: c.breakfast ?? false,
          lunch: c.lunch ?? false,
          dinner: c.dinner ?? false,
          isFreeMeal: c.isFreeMeal ?? false,
          ...rateOverrides,
        }));
      } else {
        toSave = [];
        for (const person of personsByClass) {
          for (const date of dates) {
            const k = `${person._id}_${date}`;
            const cur = localAttendanceData[k] || { breakfast: true, lunch: true, dinner: true, isFreeMeal: false };
            toSave.push({
              personId: person._id,
              personType,
              date,
              breakfast: cur.breakfast,
              lunch: cur.lunch,
              dinner: cur.dinner,
              isFreeMeal: cur.isFreeMeal,
              ...rateOverrides,
            });
          }
        }
      }

      if (!toSave.length) { toast('No data to save', { icon: '⚠️' }); return; }

      const result = await bulkCreateAttendance({ academicYear: getCurrentAcademicYear(), attendances: toSave }).unwrap();

      if (result) {
        const nl = { ...localAttendanceData };
        toSave.forEach((att: any) => {
          nl[`${att.personId}_${att.date}`] = { breakfast: att.breakfast, lunch: att.lunch, dinner: att.dinner, isFreeMeal: att.isFreeMeal };
        });
        setLocalAttendanceData(nl);
        setAttendanceChanges({});
        const count = result?.data?.totalProcessed || result?.totalProcessed || toSave.length;
        toast.success(`${count} records saved successfully!`);
        refetchMonthly();
        // REMOVED: router.push('/dashboard/daily-meal-report'); 
        // Keep this line commented out - if you need navigation, uncomment it
        // router.push('/dashboard/daily-meal-report');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error || 'Failed to save');
    }
  };

  const handleReset = () => {
    setAttendanceChanges({});
    clearSelection();
    const nl = { ...localAttendanceData };
    personsByClass.forEach(p => dates.forEach(d => { nl[`${p._id}_${d}`] = { breakfast: true, lunch: true, dinner: true, isFreeMeal: false }; }));
    setLocalAttendanceData(nl);
    toast('Reset — all meals set to present', { icon: 'ℹ️' });
  };

  // ─── Filtered persons for search ─────────────────────────────────────────────

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

  const showTable =
    filteredPersons.length > 0 &&
    dates.length > 0 &&
    (personType !== 'student' || (selectedClassId !== ALL_CLASSES || personsByClass.length > 0));

  const displayClassName =
    personType === 'student'
      ? (selectedClassId === ALL_CLASSES ? 'All Classes' : allClasses.find(c => c._id === selectedClassId)?.className || 'Class')
      : PERSON_LABELS[personType];

  const tabColor = TAB_COLORS[personType];

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Toaster position="top-right" reverseOrder={false} />

      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#f5f7fa', minHeight: '100vh', pb: { xs: 10, sm: 12, md: 14 } }}>

        {/* ── Header ── */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: `linear-gradient(135deg, ${tabColor} 0%, ${tabColor}cc 100%)`, color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="h4" fontWeight="bold">Meal Attendance Management</Typography>
              </Box>
              <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip label={`${PERSON_LABELS[personType]}: ${displayClassName}`} sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }} size="small" />
                <Chip label={`${personsByClass.length} ${PERSON_LABELS[personType]}`} sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }} size="small" />
                <Chip
                  label={`Rates — B:৳${mealRates.breakfast} L:৳${mealRates.lunch} D:৳${mealRates.dinner}${isCustomRate ? ' (Custom)' : ''}`}
                  sx={{ bgcolor: isCustomRate ? 'rgba(255, 235, 59, 0.35)' : 'rgba(255,255,255,0.25)', color: 'white', fontWeight: isCustomRate ? 700 : 400 }}
                  size="small"
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
          </Box>

          {/* ── Custom Meal Rate Editor ── */}
          {showRateEditor && (
            <Box sx={{ mt: 2, p: 2, borderRadius: 2, width: '500px' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={1.5}>

                <Button
                  size="small"
                  startIcon={<RestartAltIcon fontSize="small" />}
                  onClick={resetRatesToDefault}

                  sx={{ color: 'white', textTransform: 'none' }}
                >
                  Reset to Default
                </Button>
              </Box>
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
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white', }}>
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
              <Tab
                value="student"
                label="Students"
                icon={<SchoolIcon fontSize="small" />}
                iconPosition="start"
                sx={{ color: TAB_COLORS.student }}
              />
              <Tab
                value="teacher"
                label="Teachers"
                icon={<GroupIcon fontSize="small" />}
                iconPosition="start"
                sx={{ color: TAB_COLORS.teacher }}
              />
              <Tab
                value="staff"
                label="Staff"
                icon={<StaffIcon fontSize="small" />}
                iconPosition="start"
                sx={{ color: TAB_COLORS.staff }}
              />
            </Tabs>
          </Box>

          {/* ── Toolbar ── */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'white', }}>
            <Box >

              <Grid container spacing={2} alignItems="center">

                {/* Class selector (students only) */}
                {personType === 'student' && (
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Class</InputLabel>
                      <Select
                        value={selectedClassId}
                        label="Select Class"
                        onChange={e => {
                          setSelectedClassId(e.target.value);
                          setAttendanceChanges({});
                          clearSelection();
                          setLocalAttendanceData({});
                        }}
                      >
                        <MenuItem value={ALL_CLASSES}><em>All Classes</em></MenuItem>
                        {classDropdownOptions.map((o: any) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* Month picker */}
                <Grid item xs={12} sm={3}>
                  <DatePicker
                    label="Select Month"
                    views={['year', 'month']}
                    value={selectedMonth}
                    onChange={v => {
                      setSelectedMonth(v);
                      setAttendanceChanges({});
                      clearSelection();
                      setLocalAttendanceData({});
                    }}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>

                {/* Search */}
                <Grid item xs={12} sm={3}>
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

                {/* Refresh */}
                <Grid item xs={6} sm={1.5}>
                  <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => { setAttendanceChanges({}); clearSelection(); refetchMonthly(); }} size="small" fullWidth>Refresh</Button>
                </Grid>

                {/* Row / Col toggle */}
                <Grid item xs={6} sm={1.5}>
                  <ToggleButtonGroup value={selectionMode} exclusive onChange={(e, val) => val && setSelectionMode(val)} size="small" fullWidth sx={{ bgcolor: '#f5f5f5' }}>
                    <ToggleButton value="col"><Tooltip title="Select Columns (Dates)"><ColumnIcon fontSize="small" /></Tooltip></ToggleButton>
                    <ToggleButton value="row"><Tooltip title="Select Rows (Persons)"><RowIcon fontSize="small" /></Tooltip></ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>

            </Box>
            {/* ── Column action toolbar ── */}
            {personsByClass.length > 0 && dates.length > 0 && selectionMode === 'col' && (
              <Box sx={{ mt: 2, p: '10px 16px', bgcolor: hasColSel ? '#EBF3FF' : '#f8f9fa', border: hasColSel ? `1.5px solid ${COL_SEL_BORDER}` : '1px solid #e0e0e0', borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>

                <Button variant="contained" color="success" size="small" startIcon={<AddIcon />} onClick={() => hasColSel ? applyMealAction('full', true) : setAllMealsValue(true)} sx={{ textTransform: 'none', fontWeight: 'bold' }}>{hasColSel ? `Add Full Meal (${selectedColIndices.size} col)` : 'Add All Meals'}</Button>
                <Button variant="contained" color="error" size="small" startIcon={<RemoveCircleIcon />} onClick={() => hasColSel ? applyMealAction('full', false) : setAllMealsValue(false)} sx={{ textTransform: 'none', fontWeight: 'bold' }}>{hasColSel ? `Remove Full Meal (${selectedColIndices.size} col)` : 'Remove All Meals'}</Button>


                <Divider orientation="vertical" flexItem />
                <Button size="small" variant="outlined" color="warning" onClick={() => applyMealAction('free', true)}><MoneyOff fontSize="small" sx={{ mr: 0.4 }} />Mark Free</Button>
                <Button size="small" variant="outlined" onClick={() => applyMealAction('free', false)}><MoneyOffCsred fontSize="small" sx={{ mr: 0.4 }} />Unmark Free</Button>
                <Box flexGrow={1} />

                <Button size="small" onClick={clearSelection} sx={{ minWidth: 60 }}>Clear</Button>
              </Box>
            )}

            {/* ── Row action toolbar ── */}
            {personsByClass.length > 0 && dates.length > 0 && selectionMode === 'row' && (
              <Box sx={{ mt: 2, p: '10px 16px', bgcolor: hasRowSel ? '#FFF7ED' : '#f8f9fa', border: hasRowSel ? `1.5px solid ${ROW_SEL_BORDER}` : '1px solid #e0e0e0', borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">Row Actions (All Dates):</Typography>
                <Button size="small" variant="contained" color="success" onClick={() => applyMealAction('full', true)} startIcon={<AddIcon />}>Add All</Button>
                <Button size="small" variant="contained" color="error" onClick={() => applyMealAction('full', false)} startIcon={<RemoveCircleIcon />}>Remove All</Button>
                <Divider orientation="vertical" flexItem />
                <Button size="small" variant="outlined" onClick={() => applyMealAction('b', true)}><BreakfastIcon fontSize="small" sx={{ mr: 0.4 }} />+B</Button>
                <Button size="small" variant="outlined" onClick={() => applyMealAction('l', true)}><LunchIcon fontSize="small" sx={{ mr: 0.4 }} />+L</Button>
                <Button size="small" variant="outlined" onClick={() => applyMealAction('d', true)}><DinnerIcon fontSize="small" sx={{ mr: 0.4 }} />+D</Button>

                <Divider orientation="vertical" flexItem />
                <Button size="small" variant="outlined" color="warning" onClick={() => applyMealAction('free', true)}><MoneyOff fontSize="small" sx={{ mr: 0.4 }} />Mark Free</Button>
                <Button size="small" variant="outlined" onClick={() => applyMealAction('free', false)}><MoneyOffCsred fontSize="small" sx={{ mr: 0.4 }} />Unmark Free</Button>
                <Box flexGrow={1} />
                {!hasRowSel
                  ? <Typography variant="body2" color="text.secondary"><strong>Click</strong> a person row or drag to select multiple.</Typography>
                  : <Typography variant="body2" fontWeight="bold" color={ROW_SEL_BORDER}>{selectedRowIndices.size} {PERSON_LABELS[personType].toLowerCase()} selected</Typography>
                }
                <Button size="small" onClick={clearSelection} sx={{ minWidth: 60 }}>Clear</Button>
              </Box>
            )}

            {/* ── Save buttons ── */}
            {personsByClass.length > 0 && dates.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" color="error" onClick={handleReset} disabled={!Object.keys(attendanceChanges).length}>Cancel</Button>
                <Button
                  variant="contained"
                  startIcon={isSaving ? <CircularProgress size={18} /> : <SaveIcon />}
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  sx={{ bgcolor: tabColor }}
                >
                  {Object.keys(attendanceChanges).length ? `Save (${Object.keys(attendanceChanges).length})` : 'Save'}
                </Button>
              </Box>
            )}

            {Object.keys(attendanceChanges).length > 0 && (
              <Alert severity="warning" sx={{ mt: 1.5 }} onClose={handleReset}>
                <strong>{Object.keys(attendanceChanges).length} unsaved change(s)!</strong> Please save.
              </Alert>
            )}

            {isCustomRate && (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                <strong>Custom meal rates active:</strong> B:৳{mealRates.breakfast} / L:৳{mealRates.lunch} / D:৳{mealRates.dinner}.
                These rates will be applied to all records saved in this session.
              </Alert>
            )}
          </Box>

          {/* ── Info banner for teachers/staff (no class filter needed) ── */}
          {personType !== 'student' && personsByClass.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="h6">No active {PERSON_LABELS[personType].toLowerCase()} found.</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Make sure {PERSON_LABELS[personType].toLowerCase()} have status = Active.</Typography>
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

                    // Sub-label: class for student, designation for teacher, dept for staff
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
                              onMouseDown={selectionMode === 'col' || selectionMode === 'row' ? e => { if (!(e.target as HTMLElement).closest('button')) handleDragStart(e, dIdx, 'col'); } : undefined}
                              onMouseEnter={selectionMode === 'col' || selectionMode === 'row' ? e => handleDragEnter(e, dIdx, 'col') : undefined}
                            >
                              <Box display="flex" justifyContent="center" gap={0.2}>
                                <Tooltip title={`Breakfast: ${b ? 'Present' : 'Absent'} (৳${mealRates.breakfast})`}>
                                  <IconButton size="small" color={b ? 'success' : 'default'} sx={{ p: '2px', opacity: b ? 1 : 0.3 }} onClick={e => { e.stopPropagation(); handleMealToggle(pid, date, 'breakfast'); }}>
                                    <BreakfastIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={`Lunch: ${l ? 'Present' : 'Absent'} (৳${mealRates.lunch})`}>
                                  <IconButton size="small" color={l ? 'success' : 'default'} sx={{ p: '2px', opacity: l ? 1 : 0.3 }} onClick={e => { e.stopPropagation(); handleMealToggle(pid, date, 'lunch'); }}>
                                    <LunchIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={`Dinner: ${dn ? 'Present' : 'Absent'} (৳${mealRates.dinner})`}>
                                  <IconButton size="small" color={dn ? 'success' : 'default'} sx={{ p: '2px', opacity: dn ? 1 : 0.3 }} onClick={e => { e.stopPropagation(); handleMealToggle(pid, date, 'dinner'); }}>
                                    <DinnerIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={isFree ? 'Mark as Paid' : 'Mark as Free'}>
                                  <IconButton size="small" color={isFree ? 'warning' : 'default'} sx={{ p: '2px', opacity: isFree ? 1 : 0.4 }} onClick={e => { e.stopPropagation(); handleFreeMealToggle(pid, date); }}>
                                    <MoneyOff sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                              <Typography variant="caption" display="block" align="center" sx={{ color: isFree ? '#F57C00' : (total === 3 ? '#16a34a' : '#999'), fontWeight: 700, lineHeight: 1.1, mt: '1px', fontSize: 11 }}>
                                {isFree ? 'Free' : `${total}/3`}
                              </Typography>
                            </TableCell>
                          );
                        })}

                        <TableCell align="center" sx={{ bgcolor: '#DBEAFE' }}>
                          <Typography fontWeight="bold" fontSize={12}>{totalMeals}</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: '#DBEAFE' }}>
                          <Typography fontWeight="bold" fontSize={12} color={totalCost === 0 ? '#999' : '#0277BD'}>
                            {totalCost > 0 ? `৳${totalCost}` : '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

        </Paper>
      </Box>

      {/* ─── FLOATING SAVE BUTTON - ONLY THIS ADDED ─── */}
      <Zoom in={true}>
        <Fab
          variant="extended"
          color="primary"
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24, md: 32 },
            right: { xs: 16, sm: 24, md: 32 },
            bgcolor: tabColor,
            color: 'white',
            fontWeight: 'bold',
            boxShadow: 6,
            '&:hover': {
              bgcolor: tabColor,
              opacity: 0.9,
            },
            zIndex: 999,
            px: { xs: 2, sm: 3 },
            borderRadius: 4,
          }}
          onClick={handleSaveAll}
          disabled={isSaving}
        >
          {isSaving ? (
            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
          ) : (
            <SaveIcon sx={{ mr: 1 }} />
          )}
          {Object.keys(attendanceChanges).length > 0 ? (
            <>Save ({Object.keys(attendanceChanges).length})</>
          ) : (
            'Save All'
          )}
        </Fab>
      </Zoom>

      {/* ─── FLOATING CANCEL BUTTON - ONLY WHEN CHANGES EXIST ─── */}
      {Object.keys(attendanceChanges).length > 0 && (
        <Zoom in={true}>
          <Fab
            variant="extended"
            color="error"
            size="medium"
            sx={{
              position: 'fixed',
              bottom: { xs: 80, sm: 88, md: 96 },
              right: { xs: 16, sm: 24, md: 32 },
              bgcolor: '#ef5350',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: 6,
              '&:hover': {
                bgcolor: '#d32f2f',
              },
              zIndex: 999,
              px: { xs: 2, sm: 3 },
              borderRadius: 4,
            }}
            onClick={handleReset}
          >
            <RemoveCircleIcon sx={{ mr: 1 }} />
            Cancel
          </Fab>
        </Zoom>
      )}
    </LocalizationProvider>
  );
};

export default AddMealForm;
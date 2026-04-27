// src/redux/slices/mealAttendanceSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MealAttendanceState {
    selectedClass: string;
    selectedMonth: string;
    selectedAcademicYear: string;
    selectedDate: string | null;
    editingMode: 'single' | 'bulk';
    temporaryAttendance: Record<string, any>;
}

const initialState: MealAttendanceState = {
    selectedClass: '',
    selectedMonth: new Date().toISOString().slice(0, 7),
    selectedAcademicYear: new Date().getFullYear().toString(),
    selectedDate: null,
    editingMode: 'bulk',
    temporaryAttendance: {},
};

const mealAttendanceSlice = createSlice({
    name: 'mealAttendance',
    initialState,
    reducers: {
        setSelectedClass: (state, action: PayloadAction<string>) => {
            state.selectedClass = action.payload;
        },
        setSelectedMonth: (state, action: PayloadAction<string>) => {
            state.selectedMonth = action.payload;
        },
        setSelectedAcademicYear: (state, action: PayloadAction<string>) => {
            state.selectedAcademicYear = action.payload;
        },
        setSelectedDate: (state, action: PayloadAction<string | null>) => {
            state.selectedDate = action.payload;
        },
        setEditingMode: (state, action: PayloadAction<'single' | 'bulk'>) => {
            state.editingMode = action.payload;
        },
        updateTemporaryAttendance: (state, action: PayloadAction<{ studentId: string; date: string; mealType: string; value: boolean }>) => {
            const { studentId, date, mealType, value } = action.payload;
            const key = `${studentId}_${date}`;
            if (!state.temporaryAttendance[key]) {
                state.temporaryAttendance[key] = { breakfast: false, lunch: false, dinner: false };
            }
            state.temporaryAttendance[key][mealType] = value;
        },
        clearTemporaryAttendance: (state) => {
            state.temporaryAttendance = {};
        },
    },
});

export const {
    setSelectedClass,
    setSelectedMonth,
    setSelectedAcademicYear,
    setSelectedDate,
    setEditingMode,
    updateTemporaryAttendance,
    clearTemporaryAttendance,
} = mealAttendanceSlice.actions;

export default mealAttendanceSlice.reducer;
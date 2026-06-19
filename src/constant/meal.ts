import { MealRates, PersonType } from "@/interface/meal";
import dayjs from "dayjs";

export const COL_SEL_BG = 'rgba(19,102,210,0.13)';
export const COL_SEL_BORDER = '#1366D2';
export const COL_HEADER_BG = 'rgba(19,102,210,0.28)';
export const ROW_SEL_BG = 'rgba(255, 152, 0, 0.15)';
export const ROW_SEL_BORDER = '#f57c00';
export const FREE_MEAL_BG = '#FFFDE7';

// Fallback default meal rates
export const DEFAULT_MEAL_RATES: MealRates = { breakfast: 40, lunch: 45, dinner: 80 };

export const TAB_COLORS: Record<PersonType, string> = {
    student: '#1976d2',
    teacher: '#7b1fa2',
    staff: '#2e7d32',
};

export const PERSON_LABELS: Record<PersonType, string> = {
    student: 'Students',
    teacher: 'Teachers',
    staff: 'Staff',
};

export const PERSON_AVATARS: Record<PersonType, string> = {
    student: '#4caf50',
    teacher: '#9c27b0',
    staff: '#ff9800',
};


export const ALL_CLASSES = 'ALL';


export const getCurrentAcademicYear = () => dayjs().year().toString();



// type PersonType = 'student' | 'teacher' | 'staff';

// interface PersonRow {
//   _id: string;
//   name: string;
//   nameBangla?: string;
//   roll?: string;
//   personId?: string; // studentId / teacherId / staffId
//   category?: string;
//   studentType?: string;
//   // student-specific
//   className?: any[];
//   admissionStatus?: string;
//   // teacher-specific
//   designation?: string;
//   department?: string;
//   status?: string;
//   // staff-specific
//   staffDepartment?: string;
// }

// interface ClassItem { _id: string; className: string;[k: string]: any }

// interface MealRates {
//   breakfast: number;
//   lunch: number;
//   dinner: number;
// }

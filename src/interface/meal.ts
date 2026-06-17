/* eslint-disable @typescript-eslint/no-explicit-any */
export interface StudentMealAttendanceProps {
    singleStudent: {
        data: {
            _id: string;
            name: string;
            studentId: string;
            studentClassRoll: string;
            mealAttendances?: any[];
            mealCurrentBalance: any;
            mealBalance: any;
            category: any;
            mealStatistics?: {
                totalMeals: number;
                totalCost: number;
                totalBreakfast: number;
                totalLunch: number;
                totalDinner: number;
                totalPresentDays: number;
                totalAbsentDays: number;
                attendanceRate: string;
            };
        };
    };
}
export interface MealAttendanceListProps {
    academicYear?: string;
}

export interface StudentInfo {
    _id: string;
    studentId: string;
    name: string;
    nameBangla: string;
    className: string[] | any;
    studentClassRoll?: string;
}

export interface AttendanceRecord {
    _id: string;
    academicYear: string;
    student: StudentInfo;
    date: string;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    totalMeals: number;
    mealCost: number;
    mealRate: number;
    month: string;
    createdAt: string;
    updatedAt: string;
    isAbsent: boolean;
    isHoliday: boolean;
}

export interface ClassItem {
    _id: string;
    className: string;
    section?: string;
}

export interface ClassDataResponse {
    data?: {
        data?: {
            classes?: ClassItem[];
        };
    };
}


export type PersonType = 'student' | 'teacher' | 'staff';

export interface PersonRow {
    _id: string;
    name: string;
    nameBangla?: string;
    roll?: string;
    personId?: string;
    category?: string;
    studentType?: string;
    className?: any[];
    admissionStatus?: string;
    designation?: string;
    department?: string;
    status?: string;
    staffDepartment?: string;
}

export interface MealRates {
    breakfast: number;
    lunch: number;
    dinner: number;
}
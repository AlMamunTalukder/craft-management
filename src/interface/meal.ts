export interface StudentMealAttendanceProps {
    singleStudent: {
        data: {
            _id: string;
            name: string;
            studentId: string;
            studentClassRoll: string;
            mealAttendances?: any[];
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
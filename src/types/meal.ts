/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Student {
    _id: string;
    studentId: string;
    name: string;
    nameBangla: string;
    studentClassRoll: string;
    studentType: string;
    category?: string;
    className: Array<{ _id: string; className: string;[key: string]: any }>;
    admissionStatus: string;
    email?: string;
    mobile?: string;
    gender?: string;
}

export interface ClassItem {
    _id: string;
    className: string;
    section?: string;
    [key: string]: any;
}

export const SEL_BG = 'rgba(19,102,210,0.13)';


export interface MealFormProps {
    isMonthlyUpdate?: boolean;
    monthlyUpdateClassId?: string;
    monthlyUpdateClassName?: string;
    monthlyUpdateMonth?: string;
    monthlyUpdateAcademicYear?: string;
}

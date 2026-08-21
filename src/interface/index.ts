/* eslint-disable @typescript-eslint/no-explicit-any */
export type TeacherStatus = "active" | "on leave" | "inactive"

export interface Teacher {
    id:number,
  _id: number
  name: string
  teacherId:string;
  teacherPhoto: string
  department: string
  status: TeacherStatus
  email: string
  phone: string
  subjects: string[]
  classes: string[]
  experience: number
  rating: string
  performance: number
  students: number
  joinDate: string
  qualifications: string
}
export interface ITimeSlot {
  title?: string
  day: "Saturday" | "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday"
  startTime: string
  endTime: string
  isActive?: boolean
}
export const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export interface TimeSlotModalProps {
  open: boolean
  onClose: () => void
  onSave: (timeSlot: ITimeSlot) => void
  initialData?: ITimeSlot
}


export interface FormData {
  name: string
  classes: string
  capacity: number
  teachers: string
  rooms: string
  timeSlots: number[]
  description: string
  sectionType: number
  isActive: boolean
}
export interface Filters {
  class: string;
  subject: string;
  teacher: string;
  date: string;
  hour: string;
}

export interface IncomeItem {
  source: string;
  description: string;
  amount: string;
}

export interface TIncome {
  _id:string;
 category: {
    _id: string;
    name: string;
  };
  note: string;
  incomeDate: Date;
  paymentMethod: string;
  status: string;
  incomeItems: IncomeItem[];
  totalAmount:number
}
export interface TExpense {
  _id:string;
 category: {
    _id: string;
    name: string;
  };
  note: string;
  expenseDate: Date;
  paymentMethod: string;
  status: string;
  expenseItems: IncomeItem[];
  totalAmount:number
  buyer?: string;
  payer?: string;
}

export interface IDailySession {
  para: string
  page: string
  amount: string
  mistakes: string
}

export interface IDayEntry {
  morning: IDailySession
  afternoon: IDailySession
  night: IDailySession
  totalRead: string
  duaHadithMasala: string
  mashq?: string
  tajweed?: string
}

export interface INazeraReport {
  _id: string
  teacherName: string
  studentName: string
  reportDate: string
  month: string
  weeklyTarget: string
  dailyEntries: {
    saturday: IDayEntry
    sunday: IDayEntry
    monday: IDayEntry
    tuesday: IDayEntry
    wednesday: IDayEntry
    thursday: IDayEntry
    friday: IDayEntry
  }
  totalPages: number
  totalMistakes: number
  totalDuas: number
  totalHadiths: number
  createdAt: string
  updatedAt: string
  totalDuaHadith:any
}

export type SessionKey = keyof Pick<IDayEntry, 'morning' | 'afternoon' | 'night'>;

export interface TExamSubject {
  subject: string;
  fullMarks: number;
  passMarks: number;
}

export interface TExam {
  _id: string;
  name: string;
  examType: string;
  className: { _id: string; className: string } | any;
  department: string;
  academicYear: string;
  startDate?: string;
  endDate?: string;
  subjects: TExamSubject[];
  status: "draft" | "published" | "completed";
  publishedAt?: string;
}

export interface TExamMark {
  _id: string;
  exam: string;
  student: {
    _id: string;
    name: string;
    studentId?: string;
    studentClassRoll?: string;
    studentPhoto?: string;
  };
  marks: {
    subject: string;
    obtained: number;
    fullMarks: number;
    passMarks: number;
    grade: string;
    gradePoint: number;
    result: "pass" | "fail";
  }[];
  totalObtained: number;
  totalFull: number;
  gpa: number;
  grade: string;
  result: "pass" | "fail";
}

export interface TRoutinePeriod {
  subject: string;
  teacher?: { _id: string; name: string } | string | null;
  startTime: string;
  endTime: string;
  room?: string;
  isBreak?: boolean;
}

export interface TRoutine {
  _id: string;
  className: { _id: string; className: string };
  section?: string;
  day: string;
  academicYear: string;
  periods: TRoutinePeriod[];
}

export interface TCertificate {
  _id: string;
  certificateType: string;
  certificateNo: string;
  student: any;
  academicYear?: string;
  issueDate: string;
  issuedBy?: string;
  data: Record<string, any>;
}

export interface TAsset {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchaseDate?: string;
  vendor?: string;
  location?: string;
  condition: string;
  warrantyTill?: string;
  note?: string;
}

export interface TLeave {
  _id: string;
  employeeType: "teacher" | "staff";
  employee: string;
  employeeInfo?: { _id: string; name: string; phone?: string };
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: "pending" | "approved" | "rejected";
}

export interface TPayslip {
  _id: string;
  employeeType: "teacher" | "staff";
  employee: string;
  employeeInfo?: { _id: string; name: string; phone?: string; designation?: string; category?: string };
  month: number;
  year: number;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  foodAllowance: number;
  otherAllowances: number;
  grossSalary: number;
  deductions: number;
  incomeTax: number;
  providentFund: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  status: "draft" | "paid";
  paidAt?: string;
}

export interface TAdmissionStats {
  year: string;
  funnel: {
    applied: number;
    pending: number;
    approved: number;
    rejected: number;
    enrolled: number;
  };
  conversionRate: number;
  enrollmentRate: number;
  byClass: { _id: string; applied: number; approved: number }[];
  byDepartment: { _id: string; applied: number }[];
  monthly: { _id: number; applied: number; approved: number }[];
}
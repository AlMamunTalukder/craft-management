/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, ReactNode, SetStateAction } from "react";

export interface FeeItem {
  feeType: string;
  amount: number;
  _id: string;
  discount?: number;
  discountType?: "flat" | "percentage";
  advanceAmount?: number;
  isMonthly?: boolean;
  discountRangeStart?: string;
  discountRangeEnd?: string;
  discountRangeAmount?: number;
  isCustom?: boolean;
}

export interface FeeCategory {
  _id: string;
  categoryName: string;
  className: string;
  feeItems: FeeItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AddFeeModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  student: any;
  refetch?: () => void;
  debug?: boolean;
}
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  subtitle?: string;
  variant?: "default" | "compact" | "large";
  loading?: boolean;
  onClick?: () => void;
}

export interface FeeSummaryStatsProps {
  filteredTotal: {
    totalAmount: number;
    totalPaid: number;
    totalDue: number;
    totalDiscount: number;
    totalAdvance: number;
  };
  grandTotal: {
    totalAmount: number;
  };
  filteredClassesLength: number;
  rawClassesLength: number;
  loading?: boolean;
}
export interface FeeCollectionOverviewProps {
  feeSummaryData?: any;
  isLoading?: boolean;
  classWiseData?: Record<string, number>;
  showClassWise?: boolean;
}
// ─── Types ────────────────────────────────────────────────────────────────────
export interface MonthData {
  month: string;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  totalDiscount: number;
  totalWaiver: number;
  totalAdvance: number;
  feeCount: number;
  studentCount: number;
}

export interface YearlyData {
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
  totalDiscount: number;
  totalWaiver: number;
  totalAdvance: number;
}

export interface ClassData {
  class: string;
  monthly: MonthData[];
  yearly: YearlyData;
}

export interface ClientFilters {
  search: string;
  class: string;
  month: string;
  minDue: string;
  minPaid: string;
  minAdvance: string;
  sortBy: string;
  sortDir: "asc" | "desc";
}

export interface Fee {
  _id: string;
  feeType: string;
  month: string;
  class: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  academicYear?: string;
  isCurrentMonth?: boolean;
  advanceUsed?: number;
  discount?: number;
  waiver?: number;
  computedDue?: number;
}

export interface BulkPaymentModalProps {
  open: boolean;
  onClose: () => void;
  student: {
    _id: string;
    name: string;
    studentId: string;
    className?: string | any;
    roll?: string;
    section?: string;
    jamatGroup?: string;
  };
  fees: Fee[];
  refetch?: () => void;
  onPaymentCompleted?: (receiptData: any) => void;
}
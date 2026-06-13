/* eslint-disable @typescript-eslint/no-explicit-any */
import { FeeItem } from "@/types/feeCollection";
import { MONTHS } from "@/constant/month";

export const CURRENT_YEAR = new Date().getFullYear();
export const CURRENT_MONTH = new Date().toLocaleString("default", { month: "long" });

export const generateUniqueId = () => `${Date.now()}_${Math.random()}`;

export const createEmptyFeeItem = (): FeeItem => ({
    id: generateUniqueId(),
    feeType: "",
    amount: 0,
    discount: 0,
    isMonthly: false,
});

export const calculateFinalAmount = (amount: number, discount: number) =>
    Math.max(0, amount - Math.min(discount, amount));

export const getAcademicYear = () => String(CURRENT_YEAR);

export const getMonthOptions = () => MONTHS.map((month) => ({
    label: `${month}-${CURRENT_YEAR}`,
    value: `${month}-${CURRENT_YEAR}`
}));

export const validateFeeItems = (items: FeeItem[]): boolean => {
    if (!items.length) return false;

    return items.every(item => {
        const amount = item.amount || 0;
        const feeType = item.feeType.trim();
        return amount > 0 && feeType !== "";
    });
};

export const extractMonthData = (monthRaw: any, defaultMonth: string): { monthStr: string; monthName: string } => {
    let monthStr: string;

    if (typeof monthRaw === "object" && monthRaw !== null) {
        monthStr = String(monthRaw?.value || monthRaw?.label || `${defaultMonth}-${CURRENT_YEAR}`);
    } else if (typeof monthRaw === "string" && monthRaw.trim()) {
        monthStr = monthRaw.trim();
    } else {
        monthStr = `${defaultMonth}-${CURRENT_YEAR}`;
    }

    const monthName = monthStr.split("-")[0];
    return { monthStr, monthName };
};
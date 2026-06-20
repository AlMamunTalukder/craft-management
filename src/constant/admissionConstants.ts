

import { Documents } from "@/interface/admission";

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'enrolled';


export type StatusConfig = {
    color: "warning" | "success" | "error" | "info";
    icon: string;
    label: string;
};


export const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
    pending: {
        color: "warning",
        icon: "⏳",
        label: "Pending"
    },
    approved: {
        color: "success",
        icon: "✓",
        label: "Approved"
    },
    rejected: {
        color: "error",
        icon: "✗",
        label: "Reject"
    },
    enrolled: {
        color: "info",
        icon: "📚",
        label: "ভর্তিকৃত"
    },
};

// Helper to get status config safely
export const getStatusConfig = (status?: string): StatusConfig => {
    if (!status) return STATUS_CONFIG.pending;

    const lowerStatus = status.toLowerCase() as ApplicationStatus;
    return STATUS_CONFIG[lowerStatus] || STATUS_CONFIG.pending;
};

export const DEPARTMENT_COLORS: Record<string, string> = {
    hifz: "#8B5CF6",
    academic: "#3B82F6",
    nazera: "#10B981",
    tajbid: "#F59E0B",
};

export const DEPARTMENT_LABELS: Record<string, string> = {
    hifz: "হিফজ",
    academic: "একাডেমিক",
    nazera: "নাজেরা",
    tajbid: "তাজবীদ",
};

export const DOCUMENT_LABELS: Array<{ key: keyof Documents; label: string }> = [
    { key: "photographs", label: "ছবি" },
    { key: "birthCertificate", label: "জন্ম নিবন্ধন সনদ" },
    { key: "markSheet", label: "মার্কশিট" },
    { key: "transferCertificate", label: "ট্রান্সফার সার্টিফিকেট" },
    { key: "characterCertificate", label: "চরিত্র সনদপত্র" },
];
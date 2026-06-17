/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CraftModal from "@/components/Shared/Modal";
import { banglaMonths, englishMonths } from "@/constant/month";
import { Description, MapRounded, Phone } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";

const PrintModal = ({ open, setOpen, receipt, student, onClose }: any) => {
    const componentRef = useRef<HTMLDivElement | null>(null);

    const hasNavigationCallback = typeof onClose === "function";

    const handleClose = () => {
        setOpen(false);
        if (hasNavigationCallback) onClose();
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Money-Receipt-${receipt?.receiptNo || "Receipt"}`,
        onAfterPrint: () => {
            setOpen(false);
            if (hasNavigationCallback) onClose();
        },
        pageStyle: `
      @page {
        size: 120mm 100mm;
        margin: 0;
      }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print { display: none !important; }
        .receipt-preview { transform: none !important; }
        .printable-root {
          width: 100mm !important;
          height: 100mm !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-shadow: none !important;
          background: white !important;
          font-size: 9px !important;
        }
        .printable-root * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("en-US");
        } catch {
            return dateString;
        }
    };

    const calculateTotal = () => {
        if (receipt?.fees && Array.isArray(receipt.fees) && receipt.fees.length > 0) {
            return receipt.fees.reduce(
                (sum: number, fee: any) => sum + (fee.paidAmount || fee.amount || 0),
                0
            );
        }
        return receipt?.totalAmount || receipt?.paidAmount || 0;
    };

    const getDisplayFees = () => {
        if (receipt?.fees && Array.isArray(receipt.fees) && receipt.fees.length > 0) {
            return receipt.fees;
        }
        return [{ feeType: "Total Payment", paidAmount: receipt?.totalAmount || 0, quantity: 1 }];
    };

    const extractMonthFromFeeType = (feeType: string) => {
        const monthlyFeeMatch = feeType.match(/Monthly Fee - (\w+)/i);
        if (monthlyFeeMatch) {
            const monthName = monthlyFeeMatch[1];
            const monthIndex = englishMonths.findIndex(
                (m) => m.toLowerCase() === monthName.toLowerCase()
            );
            if (monthIndex !== -1) return monthIndex;
        }
        for (let i = 0; i < englishMonths.length; i++) {
            if (feeType.toLowerCase().includes(englishMonths[i].toLowerCase())) return i;
        }
        return -1;
    };

    const getSelectedMonths = useMemo(() => {
        const fees = getDisplayFees();
        const selectedMonths = new Set<number>();
        fees.forEach((fee: any) => {
            const feeType = fee.feeType || fee.name || "";
            const monthIndex = extractMonthFromFeeType(feeType);
            if (monthIndex !== -1) selectedMonths.add(monthIndex);
        });
        return selectedMonths;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receipt?.fees]);

    const isMonthSelected = (monthIndex: number) => getSelectedMonths.has(monthIndex);

    const getClassName = () => {
        const className = receipt?.className || receipt?.studentClass || student?.className;
        if (!className) return "N/A";
        if (typeof className === "string") return className;
        if (Array.isArray(className)) {
            const first = className[0];
            if (typeof first === "string") return first;
            if (first && typeof first === "object") return first.label || first.name || first.className || "N/A";
            return "N/A";
        }
        if (typeof className === "object") return className.label || className.name || className.className || "N/A";
        return "N/A";
    };

    const getStudentName = () =>
        receipt?.studentName || receipt?.name || student?.studentName || student?.name || "N/A";

    const getRoll = () =>
        receipt?.rollNumber || receipt?.studentRoll || student?.rollNumber || "N/A";

    const fees = getDisplayFees();
    const MIN_ROWS = 7;
    const emptyRowCount = Math.max(0, MIN_ROWS - fees.length);

    return (
        <CraftModal
            open={open}
            setOpen={setOpen}
            title="Print Money Receipt"
            size="md"
            onClose={handleClose}
        >
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

                {/* Preview Area */}
                <Box
                    className="bg-gray-100 overflow-y-auto flex justify-center py-4 px-2"
                    sx={{ flexShrink: 0, width: "100%" }}
                >
                    <div style={{ transform: "scale(0.82)", transformOrigin: "top center" }}>
                        <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
              .font-bengali { font-family: 'Hind Siliguri', sans-serif; }
              .fee-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
              .fee-table thead tr { background-color: #4c2a70; color: white; }
              .fee-table th { padding: 6px 8px; font-size: 12px; font-weight: 600; }
              .fee-table th:first-child { text-align: left; width: 50%; border-right: 1px solid rgba(255,255,255,0.3); }
              .fee-table th:nth-child(2) { text-align: center; width: 25%; border-right: 1px solid rgba(255,255,255,0.3); }
              .fee-table th:last-child { text-align: center; width: 25%; }
              .fee-table td { padding: 5px 8px; font-size: 11px; border-bottom: 1px solid #e5e7eb; height: 26px; }
              .fee-table td:first-child { border-right: 1px solid #e5e7eb; font-weight: 500; }
              .fee-table td:nth-child(2) { border-right: 1px solid #e5e7eb; text-align: center; }
              .fee-table td:last-child { text-align: right; }
              .fee-row-even { background-color: #f3f4f6; }
              .fee-row-odd { background-color: #f9fafb; }
            `}</style>

                        {/* ── Receipt Root ── */}
                        <div
                            ref={componentRef}
                            className="receipt-preview printable-root font-bengali bg-white text-black"
                            style={{
                                boxSizing: "border-box",
                                // width: "130mm",

                                height: "150mm",
                                overflow: "hidden",
                                backgroundColor: "white",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                style={{
                                    padding: "18px 20px 12px",
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "100%",
                                    boxSizing: "border-box",
                                }}
                            >

                                {/* ── HEADER ── */}
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexShrink: 0 }}>
                                    <div style={{
                                        width: "44px", height: "44px", borderRadius: "50%",
                                        border: "3px solid #4c2a70", display: "flex",
                                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                                    }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#4c2a70">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "18px", fontWeight: 700, color: "#2d1b4e", lineHeight: 1.1 }}>Craft</div>
                                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#4c2a70" }}>International Institute</div>
                                    </div>
                                </div>

                                {/* ── STUDENT INFO ── */}
                                <div style={{
                                    display: "grid", gridTemplateColumns: "repeat(12, 1fr)",
                                    border: "1px solid #d1d5db", backgroundColor: "#f3f4f6",
                                    marginBottom: "8px", flexShrink: 0, fontSize: "11px",
                                }}>
                                    <div style={{ gridColumn: "span 8", padding: "4px 6px", borderRight: "1px solid #d1d5db", borderBottom: "1px solid #d1d5db", display: "flex", alignItems: "center" }}>
                                        <span style={{ fontWeight: 600, width: "32px", flexShrink: 0 }}>নাম:</span>
                                        <span style={{ borderBottom: "1px dotted #9ca3af", flex: 1, paddingLeft: "4px" }}>{getStudentName()}</span>
                                    </div>
                                    <div style={{ gridColumn: "span 4", padding: "4px 6px", borderBottom: "1px solid #d1d5db", display: "flex", alignItems: "center", backgroundColor: "rgba(209,213,219,0.3)" }}>
                                        <span style={{ fontWeight: 600, width: "36px", flexShrink: 0 }}>তারিখ:</span>
                                        <span style={{ borderBottom: "1px dotted #9ca3af", flex: 1, paddingLeft: "4px" }}>
                                            {formatDate(receipt?.paymentDate || receipt?.createdAt)}
                                        </span>
                                    </div>
                                    <div style={{ gridColumn: "span 3", padding: "4px 6px", borderRight: "1px solid #d1d5db", display: "flex", alignItems: "center", backgroundColor: "rgba(209,213,219,0.3)" }}>
                                        <span style={{ fontWeight: 600, width: "30px", flexShrink: 0 }}>শ্রেণি:</span>
                                        <span style={{ flex: 1 }}>{getClassName()}</span>
                                    </div>
                                    <div style={{ gridColumn: "span 3", padding: "4px 6px", borderRight: "1px solid #d1d5db", display: "flex", alignItems: "center" }}>
                                        <span style={{ fontWeight: 600, width: "30px", flexShrink: 0 }}>শাখা:</span>
                                        <span style={{ flex: 1 }}>{receipt?.section || receipt?.studentSection || "N/A"}</span>
                                    </div>
                                    <div style={{ gridColumn: "span 3", padding: "4px 6px", borderRight: "1px solid #d1d5db", display: "flex", alignItems: "center", backgroundColor: "rgba(209,213,219,0.3)" }}>
                                        <span style={{ fontWeight: 600, width: "28px", flexShrink: 0 }}>রোল:</span>
                                        <span style={{ flex: 1 }}>{getRoll()}</span>
                                    </div>
                                    <div style={{ gridColumn: "span 3", padding: "4px 6px", display: "flex", alignItems: "center" }}>
                                        <span style={{ fontWeight: 600, width: "28px", flexShrink: 0 }}>আইডি:</span>
                                        <span style={{ flex: 1 }}>{receipt?.studentId || receipt?.receiptNo || "N/A"}</span>
                                    </div>
                                </div>

                                {/* ── FEE TABLE ── fills remaining space ── */}
                                <div style={{ flex: 1, overflow: "hidden", marginBottom: "8px" }}>
                                    <table className="fee-table">
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: "left", width: "50%", padding: "6px 8px", borderRight: "1px solid rgba(255,255,255,0.3)" }}>বিবরণ</th>
                                                <th style={{ textAlign: "center", width: "25%", padding: "6px 8px", borderRight: "1px solid rgba(255,255,255,0.3)" }}>পরিমাণ</th>
                                                <th style={{ textAlign: "center", width: "25%", padding: "6px 8px" }}>মোট টাকা</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fees.map((fee: any, index: number) => (
                                                <tr key={index} className={index % 2 === 0 ? "fee-row-odd" : "fee-row-even"}>
                                                    <td>{fee.feeType || `ফি ${index + 1}`}</td>
                                                    <td>{fee.quantity || "1"}</td>
                                                    <td>৳{(fee.paidAmount || fee.amount || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            {Array.from({ length: emptyRowCount }).map((_, index) => {
                                                const realIndex = fees.length + index;
                                                return (
                                                    <tr key={`empty-${index}`} className={realIndex % 2 === 0 ? "fee-row-odd" : "fee-row-even"}>
                                                        <td>&nbsp;</td>
                                                        <td>&nbsp;</td>
                                                        <td>&nbsp;</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ── FOOTER SECTION ── always at bottom ── */}
                                <div style={{ flexShrink: 0 }}>
                                    {/* Month checkboxes + total */}
                                    <div style={{ display: "grid", gridTemplateColumns: "8fr 4fr", border: "1px solid #d1d5db" }}>
                                        <div style={{ borderRight: "1px solid #d1d5db" }}>
                                            <div style={{ padding: "6px 8px", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "3px" }}>
                                                    {banglaMonths.map((m, i) => {
                                                        const isSelected = isMonthSelected(i);
                                                        return (
                                                            <label key={i} style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "10px", fontWeight: 600, cursor: "pointer" }}>
                                                                <input
                                                                    type="checkbox"
                                                                    style={{ accentColor: "#4c2a70", width: "11px", height: "11px" }}
                                                                    checked={isSelected}
                                                                    readOnly
                                                                />
                                                                <span style={{ color: isSelected ? "#4c2a70" : "inherit", fontWeight: isSelected ? 700 : 600 }}>{m}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div style={{ padding: "6px 8px", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{ fontWeight: 700, fontSize: "11px", whiteSpace: "nowrap" }}>কথায়:</span>
                                                <div style={{ borderBottom: "1px dotted #9ca3af", flex: 1, height: "14px" }}></div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: "11px", fontWeight: 600 }}>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100%" }}>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    {["সর্বমোট", "পরিশোধিত", "বকেয়া"].map((label, i) => (
                                                        <div key={i} style={{
                                                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                                                            backgroundColor: "#e5e7eb", borderRight: "1px solid white",
                                                            borderBottom: i < 2 ? "1px solid white" : "none",
                                                            color: i === 2 ? "#9c27b0" : "inherit", fontSize: "10px",
                                                        }}>{label}</div>
                                                    ))}
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <div style={{ flex: 1, padding: "2px 4px", textAlign: "right", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: "10px" }}>
                                                        ৳{calculateTotal().toLocaleString()}
                                                    </div>
                                                    <div style={{ flex: 1, padding: "2px 4px", textAlign: "right", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: "10px" }}>
                                                        ৳{calculateTotal().toLocaleString()}
                                                    </div>
                                                    <div style={{ flex: 1, padding: "2px 4px", textAlign: "right", backgroundColor: "#fdf2f8", color: "#dc2626", fontSize: "10px" }}>
                                                        ৳0
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact + Signature */}
                                    <div style={{ marginTop: "10px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                                        <div style={{ fontSize: "10px", color: "#4b5563" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                                <div style={{ backgroundColor: "#4c2a70", padding: "3px", borderRadius: "3px", color: "white", display: "flex", alignItems: "center" }}>
                                                    <Phone style={{ fontSize: "12px" }} />
                                                </div>
                                                <div>
                                                    <div>+8801830678383</div>
                                                    <div>+8801310726000</div>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                                                <div style={{ backgroundColor: "#4c2a70", padding: "3px", borderRadius: "3px", color: "white", display: "flex", alignItems: "center", flexShrink: 0 }}>
                                                    <MapRounded style={{ fontSize: "12px" }} />
                                                </div>
                                                <p style={{ maxWidth: "180px", margin: 0, lineHeight: 1.4 }}>
                                                    কুয়েত টাওয়ার, স্বপ্ন সুপার শপ বিল্ডিং, নিমাইকাশারি, সিদ্ধিরগঞ্জ, নারায়ণগঞ্জ
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ width: "90px", borderTop: "1px solid black", marginBottom: "3px" }}></div>
                                            <div style={{ fontSize: "10px", fontWeight: 600 }}>আদায়কারীর স্বাক্ষর</div>
                                            <div style={{ fontSize: "10px", marginTop: "2px" }}>{receipt?.collectedBy || "Admin"}</div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </Box>

                {/* Action Buttons */}
                <Box
                    className="no-print bg-white border-t border-gray-200"
                    sx={{ p: 2, display: "flex", justifyContent: "center", alignItems: "center", gap: 2, flexShrink: 0 }}
                >
                    <Button variant="outlined" onClick={handleClose}>Close</Button>
                    <Button
                        variant="contained"
                        onClick={() => handlePrint()}
                        startIcon={<Description />}
                        sx={{ minWidth: 120 }}
                    >
                        Print Receipt
                    </Button>
                </Box>
            </Box>
        </CraftModal>
    );
};

export default PrintModal;
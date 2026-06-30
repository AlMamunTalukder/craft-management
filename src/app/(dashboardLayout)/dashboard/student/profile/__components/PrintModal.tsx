/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CraftModal from "@/components/Shared/Modal";
import { banglaMonths, englishMonths } from "@/constant/month";
import { formatDate } from "@/utils/formateDate";
import { Description, MapRounded, Phone } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import logo from '@/assets/img/logo/logo.png'
import Image from "next/image";
const PrintModal = ({ open, setOpen, receipt, student, onClose }: any) => {
  const componentRef = useRef<HTMLDivElement | null>(null);
  console.log('reciept ', receipt)
  const hasNavigationCallback = typeof onClose === "function";

  const handleClose = () => {
    setOpen(false);
    if (hasNavigationCallback) {
      onClose();
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Money-Receipt-${receipt?.receiptNo || "Receipt"}`,
    onAfterPrint: () => {
      setOpen(false);
      if (hasNavigationCallback) {
        onClose();
      }
    },
    pageStyle: `
      @page {
        size: 140mm 240mm;
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
        .receipt-preview {
          transform: none !important;
          width: 140mm !important;
          height: 240mm !important;
          font-size: 16px !important;
          margin: 0 auto !important;
          padding: 0 !important;
          overflow: hidden !important;
          // box-shadow: none !important;
          background: 'red' !important;
        }
        .receipt-preview * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
  });

  const handlePrintClick = () => {
    if (!receipt) {
      console.error(" No receipt data available for printing!");
      return;
    }
    handlePrint();
  };


  const calculateTotal = () => {
    if (!receipt) return 0;
    if (receipt?.fees && Array.isArray(receipt.fees) && receipt.fees.length > 0) {
      return receipt.fees.reduce(
        (sum: number, fee: any) => sum + (fee.paidAmount || fee.amount || 0),
        0
      );
    }
    return receipt?.totalAmount || receipt?.paidAmount || 0;
  };

  const getDisplayFees = () => {
    if (!receipt) return [];
    if (receipt?.fees && Array.isArray(receipt.fees) && receipt.fees.length > 0) {
      return receipt.fees;
    }
    return [
      {
        feeType: "Total Payment",
        paidAmount: receipt?.totalAmount || 0,
        quantity: 1,
      },
    ];
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
      if (feeType.toLowerCase().includes(englishMonths[i].toLowerCase())) {
        return i;
      }
    }
    return -1;
  };

  const getSelectedMonths = useMemo(() => {
    const fees = getDisplayFees();
    const selectedMonths = new Set<number>();

    fees.forEach((fee: any) => {
      // Only consider Monthly Fee
      if (fee.feeType === "Monthly Fee" && fee.month) {
        const monthIndex = englishMonths.findIndex(
          (m) => m.toLowerCase() === fee.month.toLowerCase()
        );

        if (monthIndex !== -1) {
          selectedMonths.add(monthIndex);
        }
        return;
      }

      // Keep old logic for backward compatibility
      const feeType = fee.feeType || fee.name || "";
      const monthIndex = extractMonthFromFeeType(feeType);

      if (monthIndex !== -1) {
        selectedMonths.add(monthIndex);
      }
    });

    return selectedMonths;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt?.fees]);

  const isMonthSelected = (monthIndex: number) => getSelectedMonths.has(monthIndex);

  const getClassName = () => {
    const className =
      receipt?.className || receipt?.studentClass || student?.className;
    if (!className) return "N/A";
    if (typeof className === "string") return className;
    if (Array.isArray(className)) {
      const first = className[0];
      if (typeof first === "string") return first;
      if (first && typeof first === "object") {
        return first.label || first.name || first.className || "N/A";
      }
      return "N/A";
    }
    if (typeof className === "object") {
      return className.label || className.name || className.className || "N/A";
    }
    return "N/A";
  };

  const getStudentName = () =>
    receipt?.studentName ||
    receipt?.name ||
    student?.studentName ||
    student?.name ||
    "N/A";

  const getRoll = () =>
    receipt?.rollNumber || receipt?.studentRoll || student?.rollNumber || "N/A";

  const fees = getDisplayFees();
  const MIN_ROWS = 12;
  const emptyRowCount = Math.max(0, MIN_ROWS - fees.length);


  return (
    <CraftModal
      open={open}
      setOpen={setOpen}
      title="Print Money Receipt"
      size="md"
      onClose={handleClose}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          className=" bg-[#F3F4F6] overflow-y-auto"
          sx={{
            flexShrink: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            py: 2,
            px: 2,
          }}
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
            .font-bengali { font-family: 'Hind Siliguri', sans-serif; }
            .fee-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            .fee-table thead tr { background-color: #4c2a70; color: white; }
            .fee-table th { padding: 6px 8px; font-size: 14px; font-weight: 600; }
            .fee-table th:first-child { text-align: left; width: 50%; border-right: 1px solid rgba(255,255,255,0.3); }
            .fee-table th:nth-child(2) { text-align: center; width: 25%; border-right: 1px solid rgba(255,255,255,0.3); }
            .fee-table th:last-child { text-align: center; width: 25%; }
            .fee-table td { padding: 5px 8px; font-size: 14px; border-bottom: 1px solid #e5e7eb; height: 26px; }
            .fee-table td:first-child { border-right: 1px solid #e5e7eb; font-weight: 500; }
            .fee-table td:nth-child(2) { border-right: 1px solid #e5e7eb; text-align: center; }
            .fee-table td:last-child { text-align: right; }
            .fee-row-even { background-color: #f3f4f6; }
            .fee-row-odd { background-color: #f9fafb; }
          `}</style>

          <div
            ref={componentRef}
            className="receipt-preview bg-white text-black font-bengali"
            style={{
              boxSizing: "border-box",
              width: "140mm",
              height: "240mm",
              overflow: "hidden",
              backgroundColor: "#fff",
              border: "1px solid #f3f4f6",
              display: "flex",
              flexDirection: "column",

            }}
          >
            <div className="p-8 pb-4 relative z-10 flex justify-between flex-col h-full box-border">
              {/* Header */}
              <div>
                <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                  {/* <div className="w-16 h-16 rounded-full border-4 border-[#4c2a70] flex items-center justify-center">
                    <div className="text-[#4c2a70]">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                      </svg>
                    </div>
                  </div> */}
                  <div className=" w-32">
                    <Image className="h-full w-full object-contain" src={logo} alt="logo" />
                  </div>

                </div>

                {/* Student Info Grid */}
                <div className="grid grid-cols-12 gap-0 border-t border-b border-gray-300 bg-gray-100 mb-6 text-sm flex-shrink-0">
                  <div className="col-span-8 p-2 border-r border-b border-gray-300 flex items-center">
                    <span className="font-semibold w-12">নাম:</span>
                    <div className="bg-transparent border-b border-dotted border-gray-400 flex-1 outline-none px-2">
                      {getStudentName()}
                    </div>
                  </div>
                  <div className="col-span-4 p-2 border-b border-gray-300 flex items-center bg-gray-200/50">
                    <span className="font-semibold w-12">তারিখ</span>
                    <div className="bg-transparent border-b border-dotted border-gray-400 flex-1 outline-none px-2">
                      {formatDate(receipt?.paymentDate || receipt?.createdAt)}
                    </div>
                  </div>

                  <div className="col-span-3 p-2 border-r border-gray-300 flex items-center bg-gray-200/50">
                    <span className="font-semibold w-10">শ্রেণি:</span>
                    <div className="bg-transparent flex-1 outline-none">{getClassName()}</div>
                  </div>
                  <div className="col-span-3 p-2 border-r border-gray-300 flex items-center">
                    <span className="font-semibold w-10">শাখা:</span>
                    <div className="bg-transparent flex-1 outline-none">
                      {receipt?.section || receipt?.studentSection || "N/A"}
                    </div>
                  </div>
                  <div className="col-span-3 p-2 border-r obrder-gray-300 flex items-center bg-gray-200/50">
                    <span className="font-semibold w-10">রোল:</span>
                    <div className="bg-transparent flex-1 outline-none">{getRoll()}</div>
                  </div>
                  <div className="col-span-3 p-2 flex items-center">
                    <span className="font-semibold w-10">আইডি:</span>
                    <div className="bg-transparent flex-1 outline-none">
                      {receipt?.studentId || receipt?.receiptNo || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Fee Table */}
                <div className="w-full mb-2 flex-shrink-0">
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
              </div>

              {/* Bottom Contact Info */}
              <div>
                <div className="grid grid-cols-12 gap-0 border border-gray-300 mt-4 flex-shrink-0">
                  <div className="col-span-8 flex flex-col">
                    <div className="p-3 bg-gray-50 border-b border-gray-200">
                      <div className="grid grid-cols-6 gap-2 text-xs font-semibold">
                        {banglaMonths.map((m, i) => {
                          const isSelected = isMonthSelected(i) || (getSelectedMonths.size === 0 && i === new Date().getMonth());
                          return (
                            <label key={i} className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                className="accent-[#4c2a70]"
                                checked={isSelected}
                                readOnly
                              />
                              <span className={isSelected ? "text-[#4c2a70] font-bold" : ""}>
                                {m}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-100 flex-1 flex items-start gap-2">
                      <span className="font-bold text-sm whitespace-nowrap">কথায়:</span>
                      <div className="border-b mb border-dotted border-gray-400 w-full h-5">
                        <span className="text-[12px]  font-semibold">{receipt?.summary?.amountPaidWord}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4 text-sm font-semibold">
                    <div className="grid grid-cols-2 h-full">
                      <div className="flex flex-col">
                        <div className="flex-1 flex items-center justify-center bg-gray-200 border-b border-r border-white">
                          সর্বমোট
                        </div>
                        <div className="flex-1 flex items-center justify-center bg-gray-200 border-b border-r border-white">
                          পরিশোধিত
                        </div>
                        <div className="flex-1 flex items-center justify-center bg-gray-200 border-r border-white text-[#9c27b0]">
                          বকেয়া
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex-1 bg-gray-50 border-b border-gray-200 p-1 text-right outline-none">
                          ৳{calculateTotal().toLocaleString()}
                        </div>
                        <div className="flex-1 bg-gray-50 border-b border-gray-200 p-1 text-right outline-none">
                          ৳{calculateTotal().toLocaleString()}
                        </div>
                        <div className="flex-1 bg-pink-50/50 p-1 text-right outline-none text-red-600">
                          ৳0
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex items-end justify-between flex-shrink-0">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#4c2a70] p-1 rounded text-white">
                        <Phone />
                      </div>
                      <div>
                        <p>+8801830678383</p>
                        <p>+8801310726000</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="bg-[#4c2a70] p-1 rounded text-white">
                        <MapRounded />
                      </div>
                      <p className="max-w-[250px]">
                        কুয়েত টাওয়ার, স্বপ্ন সুপার শপ বিল্ডিং, নিমাইকাশারি, সিদ্ধিরগঞ্জ, নারায়ণগঞ্জ
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-t border-black mb-1"></div>
                    <p className="text-sm font-semibold">আদায়কারীর স্বাক্ষর</p>
                    <p className="text-sm mt-1">{receipt?.collectedBy || "Admin"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Box>

        {/* Footer (screen only) */}
        <Box
          className="no-print bg-white border-t border-gray-200"
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            flexShrink: 0,
          }}
        >
          <Button variant="outlined" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handlePrintClick}
            startIcon={<Description />}
            sx={{ minWidth: 120 }}
            disabled={!receipt}
          >
            Print Receipt
          </Button>
        </Box>
      </Box>
    </CraftModal>
  );
};

export default PrintModal;
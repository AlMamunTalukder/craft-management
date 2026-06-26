// src/components/FeeCollection/FeeCollection.tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import LoadingSpinner from "@/components/LoadingSpinner";
import CraftTable from "@/components/Table";
import { Column, RowAction } from "@/interface/table";
import { baseApi } from "@/redux/api/baseApi";
import { useGetDueFeesQuery } from "@/redux/api/feesApi";
import {
  Fee,
  StudentTableRow,
  StudentWithFees,
  Summary,
} from "@/types/feeCollection";
import { Payment, Visibility } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import BulkPaymentModal from "../../student/profile/__components/BulkPaymentModal";
import PaymentModal from "../../student/profile/__components/PaymentModal";
import PrintModal from "../../student/profile/__components/PrintModal";
import StudentFeeDetailsModal from "./StudentFeeDetailsModal";

const FeeCollection = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [dueFeesData, setDueFeesData] = useState<StudentWithFees[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [year] = useState(new Date().getFullYear());
  const [classFilter] = useState("");
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithFees | null>(null);

  const [bulkPaymentModalOpen, setBulkPaymentModalOpen] = useState(false);
  const [selectedStudentIdForBulk, setSelectedStudentIdForBulk] = useState<string | null>(null);

  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);

  const { data, error, isLoading } = useGetDueFeesQuery({
    year: year?.toString() || "",
    class: classFilter || "",
  });

  const forceRefetch = useCallback(async () => {
    try {
      dispatch(
        baseApi.util.invalidateTags([
          "fees",
          "students",
          "Student",
          "Payment",
          "Receipts",
          "Receipt",
        ])
      );
    } catch (error) {
      console.error("Force refetch error:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (data?.success && data?.data) {
      const studentsData = data?.data?.students || [];
      const summaryData = data?.data?.summary || {
        totalStudents: 0,
        totalFees: 0,
        totalDueAmount: 0,
        totalPaidAmount: 0,
        totalAmount: 0,
      };

      const transformedStudents: StudentWithFees[] = studentsData.map(
        (student: any) => ({
          student: {
            _id: student.student?._id || "",
            studentId: student.student?.studentId || "",
            name: student.student?.nameBangla || student.student?.name || "",
            mobile: student.student?.mobile || "",
          },
          enrollment: student.enrollment || {
            _id: student.student?._id || "",
            rollNumber: "",
            className: student.fees?.[0]?.class || "",
          },
          // FeeCollection.tsx — transformedStudents mapping এ এই change করুন

          fees: student.fees?.map((fee: any) => ({
            _id: fee._id || "",
            feeType: fee.feeType || "",
            month: fee.month || "",
            class: fee.class || "",
            amount: fee.amount || 0,
            paidAmount: fee.paidAmount || 0,
            // ✅ dueAmount: computedDue কে priority দিন (aggregate থেকে আসে)
            dueAmount: fee.computedDue ?? fee.dueAmount ?? 0,
            status: fee.status || "",
            academicYear: fee.academicYear || "",
            isCurrentMonth: fee.isCurrentMonth || false,
            advanceUsed: fee.advanceUsed || 0,
            discount: fee.discount || 0,
            waiver: fee.waiver || 0,
            computedDue: fee.computedDue ?? fee.dueAmount ?? 0,
          })) || [],
          totalDue: student.totalDue || 0,
          totalPaid: student.totalPaid || 0,
          totalAmount: student.totalAmount || 0,
          feesCount: student.feesCount || 0,
        })
      );

      setDueFeesData(transformedStudents);
      setSummary({
        totalStudents: summaryData.totalStudents || 0,
        totalFees: summaryData.totalFees || 0,
        totalDueAmount: summaryData.totalDueAmount || 0,
        totalPaidAmount: summaryData.totalPaidAmount || 0,
        totalAmount: summaryData.totalAmount || 0,
      });
      setLoading(false);
    } else if (error) {
      console.error("Error fetching due fees:", error);
      toast.error("Error fetching due fees");
      setLoading(false);
      setDueFeesData([]);
    }
  }, [data, error]);

  // Always derive the freshest version of the selected student from live dueFeesData
  const selectedStudentForBulk = useMemo(() => {
    if (!selectedStudentIdForBulk) return null;
    return dueFeesData.find((s) => s.student._id === selectedStudentIdForBulk) || null;
  }, [selectedStudentIdForBulk, dueFeesData]);

  const getStudentOverallStatus = (fees: Fee[]): string => {
    if (!fees?.length) return "unknown";
    if (fees?.every((f) => f?.status === "paid")) return "paid";
    if (fees?.some((f) => f?.status === "unpaid")) return "unpaid";
    if (fees?.some((f) => f?.status === "partial")) return "partial";
    return "unknown";
  };

  const studentTableData: StudentTableRow[] = useMemo(() => {
    return (
      dueFeesData?.map((studentWithFees) => {
        const firstFee = studentWithFees?.fees?.[0];
        return {
          _id: studentWithFees?.student?._id || "",
          studentName: studentWithFees?.student?.name || "",
          studentId: studentWithFees?.student?.studentId || "",
          rollNumber: studentWithFees?.enrollment?.rollNumber || "",
          mobile: studentWithFees?.student?.mobile || "",
          className: firstFee?.class || "",
          totalAmount: studentWithFees?.totalAmount || 0,
          totalPaid: studentWithFees?.totalPaid || 0,
          totalDue: studentWithFees?.totalDue || 0,
          feesCount: studentWithFees?.fees?.length || 0,
          overallStatus: getStudentOverallStatus(studentWithFees?.fees || []),
        };
      }) || []
    );
  }, [dueFeesData]);

  const classFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    return (
      studentTableData
        ?.filter((row) => row?.className && row?.className?.trim() !== "")
        ?.reduce((acc: { label: string; value: string }[], row) => {
          if (!seen.has(row?.className)) {
            seen.add(row?.className);
            acc.push({ label: row?.className, value: row?.className });
          }
          return acc;
        }, [])
        ?.sort((a, b) => a?.label?.localeCompare(b?.label)) || []
    );
  }, [studentTableData]);

  const statusFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    return (
      studentTableData
        ?.filter((row) => row?.overallStatus)
        ?.reduce((acc: { label: string; value: string }[], row) => {
          if (!seen.has(row?.overallStatus)) {
            seen.add(row?.overallStatus);
            const label =
              row?.overallStatus?.charAt(0)?.toUpperCase() +
              row?.overallStatus?.slice(1);
            acc.push({ label, value: row?.overallStatus });
          }
          return acc;
        }, [])
        ?.sort((a, b) => a?.label?.localeCompare(b?.label)) || []
    );
  }, [studentTableData]);

  const handleViewDetails = (student: StudentWithFees) => {
    setSelectedStudent(student);
    setViewDetailsModalOpen(true);
  };

  const handleOpenBulkPayment = (student: StudentWithFees) => {
    setSelectedStudentIdForBulk(student.student._id);
    setBulkPaymentModalOpen(true);
  };

  const handleCloseBulkPayment = () => {
    setBulkPaymentModalOpen(false);
    setSelectedStudentIdForBulk(null);
  };

  const handleBulkPaymentCompleted = (receiptData: any) => {
    setSelectedReceipt(receiptData);
    setPrintModalOpen(true);
  };

  const handleClosePrintModal = () => {
    setPrintModalOpen(false);
    setSelectedReceipt(null);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedFee(null);
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment processed successfully!");
    forceRefetch();
    handleClosePaymentModal();
  };

  const handleBulkPaymentFromView = () => {
    if (selectedStudent) {
      handleOpenBulkPayment(selectedStudent);
      setViewDetailsModalOpen(false);
    }
  };




  const getStudentColumns = (): Column[] => {
    const baseColumns: Column[] = [
      {
        id: "studentName",
        label: "Student",
        minWidth: isSmallMobile ? 120 : 180,
        sortable: true,
        filterable: true,
      },
      {
        id: "studentId",
        label: "ID",
        minWidth: 100,
        sortable: true,
        filterable: true,
      },
      {
        id: "mobile",
        label: "Mobile",
        minWidth: 120,
        sortable: true,
        filterable: true,
      },
    ];

    if (!isMobile) {
      baseColumns.push(
        {
          id: "className",
          label: "Class",
          minWidth: 100,
          sortable: true,
          filterable: true,
          filterOptions: classFilterOptions,
        },
        {
          id: "totalAmount",
          label: "Total (৳)",
          minWidth: 120,
          align: "right",
          sortable: true,
          format: (value: number) => `৳${value?.toFixed(2)}`,
        },
        {
          id: "totalPaid",
          label: "Paid (৳)",
          minWidth: 120,
          align: "right",
          sortable: true,
          format: (value: number) => `৳${value?.toFixed(2)}`,
        },
        {
          id: "totalDue",
          label: "Due (৳)",
          minWidth: 120,
          align: "right",
          sortable: true,
          format: (value: number) => (
            <Typography color="error.main" fontWeight="bold">
              ৳{value?.toFixed(2)}
            </Typography>
          ),
        },
        {
          id: "overallStatus",
          label: "Status",
          minWidth: 100,
          sortable: true,
          filterable: true,
          filterOptions: statusFilterOptions,
          format: (value: string) => {
            const statusMap: any = {
              paid: { color: "success", label: "Paid" },
              partial: { color: "warning", label: "Partial" },
              unpaid: { color: "error", label: "Due" },
            };
            const config = statusMap[value] || {
              color: "default",
              label: value || "Unknown",
            };
            return (
              <Chip label={config?.label} color={config?.color} size="small" />
            );
          },
        }
      );
    }

    return baseColumns;
  };

  const studentRowActions: RowAction[] = [
    {
      label: "View Details",
      icon: <Visibility fontSize="small" />,
      onClick: (row) => {
        const student = dueFeesData?.find((s) => s?.student?._id === row?._id);
        if (student) handleViewDetails(student);
      },
      color: "primary",
      tooltip: "View student fee details",
    },
    {
      label: "Collect Payment",
      icon: <Payment fontSize="small" />,
      onClick: (row) => {
        const student = dueFeesData?.find((s) => s?.student?._id === row?._id);
        if (student) handleOpenBulkPayment(student);
      },
      color: "success",
      tooltip: "Collect all due fees for this student",
    },

  ];


  if (isLoading) {
    return <LoadingSpinner />;
  }

  const freshSelectedStudent = selectedStudent
    ? dueFeesData.find((s) => s.student._id === selectedStudent.student._id) ||
    selectedStudent
    : null;

  return (
    <>
      <Box sx={{ p: { xs: 1, sm: 2 }, height: "100%", width: "100%" }}>
        {studentTableData?.length > 0 ? (
          <CraftTable
            title="Due Fees (Student Wise)"
            subtitle={`Showing ${studentTableData?.length} students with due fees`}
            columns={getStudentColumns()}
            data={studentTableData}
            loading={loading}
            rowActions={studentRowActions}

            selectable={true}
            idField="_id"
            hover={true}
            showToolbar={true}
            striped={true}
            searchable={true}
            filterable={true}
            sortable={true}
            pagination={true}
            elevation={3}
            showRowNumbers={!isMobile}
            rowNumberHeader="#"
            borderRadius={3}
          />
        ) : (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No Due Fees Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All fees are cleared for the selected filters
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      <StudentFeeDetailsModal
        open={viewDetailsModalOpen}
        onClose={() => setViewDetailsModalOpen(false)}
        student={freshSelectedStudent?.student}
        enrollment={freshSelectedStudent?.enrollment}
        fees={freshSelectedStudent?.fees || []}
        totalAmount={freshSelectedStudent?.totalAmount || 0}
        totalPaid={freshSelectedStudent?.totalPaid || 0}
        totalDue={freshSelectedStudent?.totalDue || 0}
        onBulkPayment={handleBulkPaymentFromView}
        onFeeUpdated={forceRefetch}
      />

      {selectedStudentForBulk && (
        <BulkPaymentModal
          open={bulkPaymentModalOpen}
          onClose={handleCloseBulkPayment}
          student={{
            _id: selectedStudentForBulk.student._id || "",
            name: selectedStudentForBulk.student.name || "",
            studentId: selectedStudentForBulk.student.studentId || "",
            className: selectedStudentForBulk.fees?.[0]?.class || "",
            roll: selectedStudentForBulk.enrollment?.rollNumber || "",
            section: "",
            jamatGroup: "",
          }}
          fees={
            selectedStudentForBulk.fees?.filter((fee) => fee.dueAmount > 0) || []
          }
          refetch={forceRefetch}
          onPaymentCompleted={handleBulkPaymentCompleted}
        />
      )}

      <PrintModal
        open={printModalOpen}
        setOpen={handleClosePrintModal}
        receipt={selectedReceipt}
      />

      <PaymentModal
        open={paymentModalOpen}
        onClose={handleClosePaymentModal}
        fee={selectedFee}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default FeeCollection;
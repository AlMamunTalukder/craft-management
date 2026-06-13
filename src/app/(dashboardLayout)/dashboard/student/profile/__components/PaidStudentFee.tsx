/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import CraftTable, { Column, RowAction } from "@/components/Table";
import { StudentFeeProps } from "@/interface/student";
import {
  Delete,
  Discount,
  Visibility
} from "@mui/icons-material";
import { Box, Chip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import AddFeeModal from "./Fees/AddFeeModal";
import FeeSummaryCards from "./FeeSummaryCards";
import PaymentModal from "./PaymentModal";
import ViewFeeModal from "./ViewFeeModal";

const PaidStudentFee = ({
  studentFees,
  loading = false,
  onView,
  onDelete,
  onDownload,
  onPay,
  student,
  refetch,
}: StudentFeeProps) => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [addFeeModalOpen, setAddFeeModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [filteredFees, setFilteredFees] = useState<any[]>([]);
  const [lateFeeSummary, setLateFeeSummary] = useState({
    totalLateFees: 0,
    totalCustomized: 0,
    totalOverdue: 0,
  });

  // State for view modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFeeForView, setSelectedFeeForView] = useState<any>(null);
  console.log('student paid fee check', studentFees)
  useEffect(() => {
    const paidFees = studentFees?.filter((fee) => fee?.status === "paid") || [];
    setFilteredFees(paidFees);

    // Calculate late fee summary for paid fees only
    if (paidFees?.length) {
      const summary = paidFees.reduce(
        (acc, fee) => {
          if (fee.lateFeeAmount > 0) {
            acc.totalLateFees += fee.lateFeeAmount;
          }
          if (fee.lateFeeCustomized) {
            acc.totalCustomized += 1;
          }
          return acc;
        },
        { totalLateFees: 0, totalCustomized: 0, totalOverdue: 0 },
      );
      setLateFeeSummary(summary);
    } else {
      setLateFeeSummary({
        totalLateFees: 0,
        totalCustomized: 0,
        totalOverdue: 0,
      });
    }
  }, [studentFees]);



  const handleViewClick = (fee: any) => {
    setSelectedFeeForView(fee);
    setViewModalOpen(true);
    if (onView) onView(fee);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    if (onPay) {
      onPay(paymentData);
    }
    if (refetch) refetch();
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedFee(null);
  };



  const handleAddFeeClick = () => {
    setAddFeeModalOpen(true);
  };

  const handleCloseAddFeeModal = () => {
    setAddFeeModalOpen(false);
  };

  // Calculate summary statistics for paid fees only
  const calculateSummary = () => {
    const paidFees = studentFees?.filter((fee) => fee?.status === "paid") || [];

    const totalFees = paidFees?.reduce(
      (sum, fee) => sum + (fee.amount || 0),
      0,
    );
    const totalPaid = paidFees?.reduce(
      (sum, fee) => sum + (fee.paidAmount || 0),
      0,
    );
    const totalDue = paidFees?.reduce(
      (sum, fee) => sum + (fee.dueAmount || 0),
      0,
    );
    const totalDiscount = paidFees?.reduce(
      (sum, fee) => sum + (fee.discount || 0),
      0,
    );
    const totalWaiver = paidFees?.reduce(
      (sum, fee) => sum + (fee.waiver || 0),
      0,
    );
    const totalAdjustments = totalDiscount + totalWaiver;

    return {
      totalFees,
      totalPaid,
      totalDue,
      totalDiscount,
      totalWaiver,
      totalAdjustments,
    };
  };

  const summary = calculateSummary();

  // Define columns for fee table with all fee information
  // Define columns for fee table with all fee information including month and advance used
  const columns: Column[] = [
    {
      id: "feeType",
      label: "Fee Type",
      minWidth: 150,
      sortable: true,
      filterable: true,
    },
    {
      id: "month",
      label: "Month",
      minWidth: 100,
      sortable: true,
      filterable: true,
      render: (row: any) => (
        <Typography variant="body2">
          {row.month || "N/A"}
        </Typography>
      ),
    },
    {
      id: "amount",
      label: "Total Amount",
      minWidth: 120,
      align: "right",
      sortable: true,
      type: "number",
      format: (value: number) => `৳${value?.toLocaleString()}`,
    },
    {
      id: "advanceUsed",
      label: "Advance Used",
      minWidth: 120,
      align: "right",
      sortable: true,
      type: "number",
      format: (value: number) => `৳${value?.toLocaleString()}`,
      render: (row: any) => (
        <Typography
          variant="body2"
          color={row.advanceUsed > 0 ? "info.main" : "text.secondary"}
          fontWeight={row.advanceUsed > 0 ? "bold" : "normal"}
        >
          {row.advanceUsed > 0 ? `৳${row.advanceUsed.toLocaleString()}` : "-"}
        </Typography>
      ),
    },
    {
      id: "netAmount",
      label: "Net Amount",
      minWidth: 120,
      align: "right",
      sortable: true,
      type: "number",
      format: (value: number) => `৳${value?.toLocaleString()}`,
      render: (row: any) => {
        const netAmount =
          (row.amount || 0) - (row.discount || 0) - (row.waiver || 0);
        return (
          <Typography variant="body2" fontWeight="bold">
            ৳{netAmount.toLocaleString()}
          </Typography>
        );
      },
    },
    {
      id: "paidAmount",
      label: "Paid Amount",
      minWidth: 120,
      align: "right",
      sortable: true,
      type: "number",
      format: (value: number) => `৳${value?.toLocaleString()}`,
      render: (row: any) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          ৳{row.paidAmount?.toLocaleString() || "0"}
        </Typography>
      ),
    },
    {
      id: "dueAmount",
      label: "Due Amount",
      minWidth: 120,
      align: "right",
      sortable: true,
      type: "number",
      format: (value: number) => `৳${value?.toLocaleString()}`,
      render: (row: any) => (
        <Typography
          color={row.dueAmount > 0 ? "error" : "success"}
          variant="body2"
          fontWeight="bold"
        >
          ৳{row.dueAmount?.toLocaleString() || "0"}
        </Typography>
      ),
    },
    {
      id: "paymentDate",
      label: "Payment Date",
      minWidth: 150,
      sortable: true,
      type: "date",
      format: (value: string) => {
        if (!value) return "Not Paid";
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return "Invalid Date";
        }
      },
      render: (row: any) => (
        <Typography variant="body2" fontWeight="medium">
          {row.paymentDate
            ? new Date(row.paymentDate).toLocaleDateString()
            : "N/A"}
        </Typography>
      ),
    },
    {
      id: "paymentMethod",
      label: "Payment Method",
      minWidth: 130,
      sortable: true,
      filterable: true,
      type: "text",
      format: (value: string) => {
        if (!value) return "N/A";
        return value.charAt(0).toUpperCase() + value.slice(1);
      },
    },
    {
      id: "status",
      label: "Status",
      minWidth: 120,
      sortable: true,
      filterable: true,
      type: "status",
      render: (row: any) => {
        const statusConfig: {
          [key: string]: {
            color: "success" | "warning" | "error" | "default";
            label: string;
          };
        } = {
          paid: { color: "success", label: "Paid" },
          partial: { color: "warning", label: "Partial" },
          unpaid: { color: "error", label: "Unpaid" },
        };
        const config = statusConfig[row.status] || {
          color: "default",
          label: row.status,
        };

        const hasAdjustments = row.discount > 0 || row.waiver > 0;

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={config.label}
              color={config.color}
              size="small"
              variant={row.status === "paid" ? "filled" : "outlined"}
            />
            {hasAdjustments && <Discount fontSize="small" color="success" />}
          </Box>
        );
      },
    },
    {
      id: "createdAt",
      label: "Created Date",
      minWidth: 150,
      sortable: true,
      type: "date",
      format: (value: string) => {
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return "Invalid Date";
        }
      },
    },
  ];

  // Define row actions for paid fees
  const rowActions: RowAction[] = [
    {
      label: "View Details",
      icon: <Visibility fontSize="small" />,
      onClick: (row) => handleViewClick(row),
      color: "info",
      tooltip: "View fee details",
    },

    {
      label: "Delete",
      icon: <Delete fontSize="small" />,
      onClick: (row) => onDelete?.(row),
      color: "error",
      tooltip: "Delete fee record",
      inMenu: true,
    },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Paid Fee Records
      </Typography>

      {/* Summary Cards - Using the new component */}
      <FeeSummaryCards
        type="paid"
        summary={summary}
        lateFeeSummary={lateFeeSummary}
      />

      {/* Fee Records Table - Showing only paid fees */}
      <CraftTable
        title="Paid Fee Records"
        subtitle={`Total ${filteredFees?.length || 0} paid fee records found`}
        columns={columns}
        data={filteredFees}
        loading={loading}
        rowActions={rowActions}
        selectable={true}
        searchable={true}
        filterable={true}
        sortable={true}
        pagination={true}
        idField="_id"
        emptyStateMessage="No paid fee records found"
        height="auto"
        maxHeight="60vh"
        stickyHeader={true}
        hover={true}
        showToolbar={true}
        elevation={1}
        borderRadius={2}
        showRowNumbers={true}
        rowNumberHeader="#"
        onRefresh={refetch}
        onAdd={handleAddFeeClick}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={handleClosePaymentModal}
        fee={selectedFee}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Add Fee Modal */}
      <AddFeeModal
        open={addFeeModalOpen}
        setOpen={handleCloseAddFeeModal}
        student={student}
      />

      {/* View Fee Modal */}
      <ViewFeeModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        fee={selectedFeeForView}
        student={student}
      />
    </Box>
  );
};

export default PaidStudentFee;

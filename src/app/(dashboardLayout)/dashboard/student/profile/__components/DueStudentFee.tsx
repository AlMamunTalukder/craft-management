/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import FeeAdjustmentModal from "@/components/FeeAdjustmentModal";
import CraftTable, { Column, RowAction } from "@/components/Table";
import { StudentFeeProps } from "@/interface/student";
import {
  Delete,
  Discount,
  History,
  Info as InfoIcon,
  Visibility,
  Warning as WarningIcon
} from "@mui/icons-material";
import { Box, Button, Chip, Typography } from "@mui/material";
import { JSX, useEffect, useState } from "react";
import BulkPaymentModal from "./BulkPaymentModal";
import AddFeeModal from "./Fees/AddFeeModal";
import FeeSummaryCards from "./FeeSummaryCards";
import LateFeeCustomizationModal from "./LateFeeCustomizationModal";
import ViewFeeModal from "./ViewFeeModal";

const DueStudentFee = ({
  studentFees,
  loading = false,
  onDelete,
  onPay,
  student,
  refetch,
}: StudentFeeProps) => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [addFeeModalOpen, setAddFeeModalOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [filteredFees, setFilteredFees] = useState<any[]>([]);
  const [bulkPaymentModalOpen, setBulkPaymentModalOpen] = useState(false);
  const [lateFeeSummary, setLateFeeSummary] = useState({
    totalLateFees: 0,
    totalCustomized: 0,
    totalOverdue: 0,
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const handleView = (fee: any) => {
    setSelectedFee(fee);
    setViewModalOpen(true);
  };

  useEffect(() => {
    const dueFees =
      studentFees?.filter((fee) => fee?.status === "unpaid" || fee?.status === "partial") || [];
    setFilteredFees(dueFees);

    if (dueFees?.length) {
      const summary = dueFees.reduce(
        (acc, fee) => {
          if (fee.lateFeeAmount > 0) {
            acc.totalLateFees += fee.lateFeeAmount;
          }
          if (fee.lateFeeCustomized) {
            acc.totalCustomized += 1;
          }
          if (
            fee.dueDate &&
            new Date(fee.dueDate) < new Date() &&
            fee.status !== "paid"
          ) {
            acc.totalOverdue += 1;
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

  const handleAdjustmentClick = (fee: any) => {
    setSelectedFee(fee);
    setAdjustmentModalOpen(true);
  };

  const handleCustomizeLateFeeClick = (fee: any) => {
    setSelectedFee(fee);
    setCustomizationModalOpen(true);
  };

  const handleAdjustmentSuccess = () => {
    if (refetch) {
      refetch();
    }
  };

  const handleCustomizationSuccess = () => {
    if (refetch) {
      refetch();
    }
  };

  const handleCloseAdjustmentModal = () => {
    setAdjustmentModalOpen(false);
    setSelectedFee(null);
  };

  const handleCloseCustomizationModal = () => {
    setCustomizationModalOpen(false);
    setSelectedFee(null);
  };

  const handleAddFeeClick = () => {
    setAddFeeModalOpen(true);
  };

  const handleCloseAddFeeModal = () => {
    setAddFeeModalOpen(false);
  };

  const calculateSummary = () => {
    const dueFees = studentFees?.filter((fee) => fee?.status === "unpaid" || fee?.status === "partial") || [];

    const totalFees = dueFees?.reduce(
      (sum, fee) => sum + (fee.amount || 0),
      0,
    );
    const totalPaid = dueFees?.reduce(
      (sum, fee) => sum + (fee.paidAmount || 0),
      0,
    );
    const totalDue = dueFees?.reduce(
      (sum, fee) => sum + (fee.dueAmount || 0),
      0,
    );
    const totalDiscount = dueFees?.reduce(
      (sum, fee) => sum + (fee.discount || 0),
      0,
    );
    const totalWaiver = dueFees?.reduce(
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

  // Define columns for fee table
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
      id: "discount",
      label: "Discount",
      minWidth: 100,
      align: "right",
      sortable: true,
      type: "number",
      format: (value: number) =>
        value > 0 ? `-৳${value?.toLocaleString()}` : "৳0",
      render: (row: any) => (
        <Typography
          color={row.discount > 0 ? "error" : "text.secondary"}
          variant="body2"
          fontWeight={row.discount > 0 ? "bold" : "normal"}
        >
          {row.discount > 0 ? `-৳${row.discount?.toLocaleString()}` : "৳0"}
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
        <Typography color="error" variant="body2" fontWeight="bold">
          ৳{row.dueAmount?.toLocaleString() || "0"}
        </Typography>
      ),
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
            icon?: JSX.Element;
          };
        } = {
          paid: { color: "success", label: "Paid" },
          partial: { color: "warning", label: "Partial", icon: <InfoIcon fontSize="small" /> },
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
              variant="filled"
            />
            {hasAdjustments && <Discount fontSize="small" color="success" />}
          </Box>
        );
      },
    },
  ];

  const rowActions: RowAction[] = [
    {
      label: "View Details",
      icon: <Visibility fontSize="small" />,
      onClick: (row) => handleView(row),
      color: "info",
      tooltip: "View fee details",
    },
    {
      label: "Apply Discount/Waiver",
      icon: <Discount fontSize="small" />,
      onClick: (row) => handleAdjustmentClick(row),
      color: "success",
      tooltip: "Apply discount or waiver",
    },
    {
      label: "Customize Late Fee",
      icon: <WarningIcon fontSize="small" />,
      onClick: (row) => handleCustomizeLateFeeClick(row),
      color: "warning",
      tooltip: "Customize late fee amount",
      inMenu: true,
    },
    {
      label: "View Late Fee History",
      icon: <History fontSize="small" />,
      onClick: (row) => {
        if (row.lateFeeAmount > 0) {
          handleCustomizeLateFeeClick(row);
        }
      },
      color: "info",
      tooltip: "View late fee customization history",
      disabled: (row) => !row.lateFeeAmount || row.lateFeeAmount === 0,
      inMenu: true,
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
      <FeeSummaryCards
        type="due"
        summary={summary}
        lateFeeSummary={lateFeeSummary}
      />

      <CraftTable
        title="Due Fee Records"
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
        emptyStateMessage="No pending fee records found. All fees are paid."
        height="auto"
        stickyHeader={true}
        hover={true}
        showToolbar={true}
        elevation={1}
        borderRadius={2}
        showRowNumbers={true}
        rowNumberHeader="#"
        onAdd={handleAddFeeClick}
        customToolbar={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              onClick={() => setBulkPaymentModalOpen(true)}
              disabled={!filteredFees?.length}
              sx={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
                },
              }}
            >
              Payment Now ({filteredFees?.length})
            </Button>
          </Box>
        }
      />

      <AddFeeModal
        open={addFeeModalOpen}
        setOpen={handleCloseAddFeeModal}
        student={student}
        refetch={refetch}
      />

      {/* Fee Adjustment Modal - Now handles API call internally */}
      <FeeAdjustmentModal
        open={adjustmentModalOpen}
        onClose={handleCloseAdjustmentModal}
        fee={selectedFee}
        onSuccess={handleAdjustmentSuccess}
      />

      {/* Late Fee Customization Modal */}
      <LateFeeCustomizationModal
        open={customizationModalOpen}
        onClose={handleCloseCustomizationModal}
        fee={selectedFee}
        onSuccess={handleCustomizationSuccess}
      />

      {/* Bulk Payment Modal */}
      <BulkPaymentModal
        open={bulkPaymentModalOpen}
        onClose={() => setBulkPaymentModalOpen(false)}
        student={{
          ...student,
          className:
            typeof student?.className === "object"
              ? student.className?.className || student.className?.name || ""
              : student?.className || "",
        }}
        fees={filteredFees}
        refetch={refetch}
      />

      <ViewFeeModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        fee={selectedFee}
        student={student}
      />
    </Box>
  );
};

export default DueStudentFee;
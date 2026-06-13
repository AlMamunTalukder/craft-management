/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import FeeAdjustmentModal from "@/components/FeeAdjustmentModal";
import StatsGrid from "@/components/StatsCard/StatsGrid";
import CraftTable, { Column, RowAction } from "@/components/Table";
import { useDeleteFeeMutation, useGetAllFeesQuery } from "@/redux/api/feesApi";
import {
  AccountBalance as AccountBalanceIcon,
  Delete,
  Discount,
  Edit,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Visibility,
} from "@mui/icons-material";
import { Box, Chip, Container, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import FeeDetailsModal from "../__components/FeeDetailsModal";

export default function AllStudentFee() {
  const { data: feesData, isLoading, error, refetch } = useGetAllFeesQuery({});
  const [deleteFee] = useDeleteFeeMutation();
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);

  const feeRecords = feesData?.data?.data || [];


  const handleViewFee = (row: any) => {
    setSelectedFee(row);
    setDetailsModalOpen(true);
  };


  const handleOpenAdjustment = (row: any) => {
    setSelectedFee(row);
    setAdjustmentModalOpen(true);
  };

  const handleDeleteFee = async (id: string) => {
    try {
      const result = await deleteFee(id).unwrap();
      if (result.success) {
        toast.success("Fee deleted successfully");
        refetch();
      } else {
        toast.error(result.message || "Failed to delete fee");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete fee");
    }
  };

  const statsData = useMemo(() => {
    const fees = feeRecords;
    const totalFees = fees.reduce((sum: number, fee: any) => sum + (fee.amount || 0), 0);
    const totalPaid = fees.reduce((sum: number, fee: any) => sum + (fee.paidAmount || 0), 0);
    const totalDue = fees.reduce((sum: number, fee: any) => sum + (fee.dueAmount || 0), 0);
    const totalDiscount = fees.reduce((sum: number, fee: any) => sum + (fee.discount || 0), 0);
    const totalWaiver = fees.reduce((sum: number, fee: any) => sum + (fee.waiver || 0), 0);

    return [
      {
        title: "Total Fees",
        value: `৳${totalFees.toLocaleString()}`,
        icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      {
        title: "Total Paid",
        value: `৳${totalPaid.toLocaleString()}`,
        icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      },
      {
        title: "Total Due",
        value: `৳${totalDue.toLocaleString()}`,
        icon: <TrendingDownIcon sx={{ fontSize: 40 }} />,
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      },
      {
        title: "Total Adjustments",
        value: `৳${(totalDiscount + totalWaiver).toLocaleString()}`,
        icon: <Discount sx={{ fontSize: 40 }} />,
        gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        subValue: `Discount: ৳${totalDiscount.toLocaleString()} | Waiver: ৳${totalWaiver.toLocaleString()}`,
      },
    ];
  }, [feeRecords]);

  const columns: Column[] = [
    {
      id: "student.name",
      label: "Student Name",
      minWidth: 150,
      sortable: true,
      filterable: true,
      render: (row: any) => row.student?.name || "N/A",
    },
    {
      id: "class",
      label: "Class",
      minWidth: 100,
      sortable: true,
      filterable: true,
    },
    {
      id: "feeType",
      label: "Fee Type",
      minWidth: 120,
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
      label: "Amount",
      minWidth: 100,
      align: "right" as const,
      sortable: true,
      format: (value: number) => `৳${value?.toLocaleString() || "0"}`,
    },
    {
      id: "discount",
      label: "Discount",
      minWidth: 90,
      align: "right" as const,
      sortable: true,
      render: (row: any) => (
        <Typography color="error" variant="body2">
          {row.discount > 0 ? `-৳${row.discount.toLocaleString()}` : "৳0"}
        </Typography>
      ),
    },
    {
      id: "waiver",
      label: "Waiver",
      minWidth: 90,
      align: "right" as const,
      sortable: true,
      render: (row: any) => (
        <Typography color="error" variant="body2">
          {row.waiver > 0 ? `-৳${row.waiver.toLocaleString()}` : "৳0"}
        </Typography>
      ),
    },
    {
      id: "paidAmount",
      label: "Paid",
      minWidth: 100,
      align: "right" as const,
      sortable: true,
      format: (value: number) => `৳${value?.toLocaleString() || "0"}`,
    },
    {
      id: "dueAmount",
      label: "Due",
      minWidth: 100,
      align: "right" as const,
      sortable: true,
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
      id: "status",
      label: "Status",
      minWidth: 100,
      sortable: true,
      render: (row: any) => (
        <Chip
          label={row.status === "paid" ? "Paid" : row.status === "partial" ? "Partial" : "Unpaid"}
          color={row.status === "paid" ? "success" : row.status === "partial" ? "warning" : "error"}
          size="small"
        />
      ),
    },
  ];

  const rowActions: RowAction[] = [
    {
      label: "View Details",
      icon: <Visibility fontSize="small" />,
      onClick: (row: any) => handleViewFee(row),
      color: "info" as const,
    },
    {
      label: "Apply Discount",
      icon: <Discount fontSize="small" />,
      onClick: (row: any) => handleOpenAdjustment(row),
      color: "success" as const,
      tooltip: "Apply discount/waiver",
    },
    {
      label: "Edit",
      icon: <Edit fontSize="small" />,
      onClick: (row: any) => console.log("Edit fee:", row),
      color: "primary" as const,
    },
    {
      label: "Delete",
      icon: <Delete fontSize="small" />,
      onClick: (row: any) => {
        if (confirm("Are you sure you want to delete this fee record?")) {
          handleDeleteFee(row._id);
        }
      },
      color: "error" as const,
    },
  ];

  const bulkActions = [
    {
      label: "Delete Selected",
      icon: <Delete fontSize="small" />,
      onClick: (selectedRows: any[]) => {
        if (confirm(`Are you sure you want to delete ${selectedRows.length} records?`)) {
          selectedRows.forEach((row) => handleDeleteFee(row._id));
        }
      },
      color: "error" as const,
    },
  ];


  return (
    <Box>
      <Container maxWidth="xl">


        <StatsGrid stats={statsData} />

        <CraftTable
          title="Fee Records"
          columns={columns}
          data={feeRecords}
          loading={isLoading}
          error={error ? "Failed to load fee data" : undefined}
          rowActions={rowActions}
          bulkActions={bulkActions}
          selectable={true}
          searchable={true}
          filterable={true}
          sortable={true}
          pagination={true}
          emptyStateMessage="No fee records found"
          idField="_id"
          stickyHeader={true}
          hover={true}
          showToolbar={true}
        />

        <FeeDetailsModal
          open={detailsModalOpen}
          setOpen={setDetailsModalOpen}
          selectedFee={selectedFee}
          onEdit={() => console.log("Edit fee")}
        />

        <FeeAdjustmentModal
          open={adjustmentModalOpen}
          onClose={() => setAdjustmentModalOpen(false)}
          fee={selectedFee}
        />
      </Container>
    </Box>
  );
}
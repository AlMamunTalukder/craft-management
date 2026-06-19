/* eslint-disable @typescript-eslint/no-explicit-any */

import { BulkAction, Column, RowAction } from "@/interface/table";
import {
  Delete,
  Download,
  Edit,
  Email,
  MoreVert,
  Print,
  Visibility,
} from "@mui/icons-material";
import { Box, Chip, Typography } from "@mui/material";

interface UseReceiptTableConfigProps {
  handleViewReceipt: (receipt: any) => void;
  handlePrintReceipt: (receipt: any) => void;
  handleViewCraftReceipt: (receipt: any) => void;
  handleDownloadReceipt: (receipt: any) => void;
  handleEditReceipt: (receipt: any) => void;
  handleEmailReceipt: (receipt: any) => void;
  handleDeleteReceipt: (receipt: any) => void;
  handleBulkDelete: (selectedRows: any[]) => void;
}

export const useReceiptTableConfig = ({
  handleViewReceipt,
  handlePrintReceipt,
  handleViewCraftReceipt,
  handleDownloadReceipt,
  handleEditReceipt,
  handleEmailReceipt,
  handleDeleteReceipt,
  handleBulkDelete,
}: UseReceiptTableConfigProps) => {
  // পেমেন্ট মেথড আইকন
  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return "💰";
      case "bkash":
        return "📱";
      case "nagad":
        return "💳";
      case "bank":
        return "🏦";
      case "card":
        return "💳";
      default:
        return "💵";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "cancelled":
        return "error";
      case "refunded":
        return "warning";
      default:
        return "default";
    }
  };

  // CraftTable-এর জন্য কলাম ডেফিনিশন
  const columns: Column[] = [
    {
      id: "receiptNo",
      label: "রিসিট নং",
      minWidth: 150,
      sortable: true,
      filterable: true,
      visible: true,
      type: "text",
    },
    {
      id: "paymentDate",
      label: "তারিখ",
      minWidth: 120,
      align: "center",
      sortable: true,
      filterable: true,
      visible: true,
      type: "date",
      format: (value: string) => {
        try {
          return new Date(value).toLocaleDateString("bn-BD");
        } catch {
          return value;
        }
      },
    },
    {
      id: "paymentMethod",
      label: "পেমেন্ট পদ্ধতি",
      minWidth: 130,
      align: "center",
      sortable: true,
      filterable: true,
      visible: true,
      type: "text",
      render: (row: any) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography>{getPaymentMethodIcon(row.paymentMethod)}</Typography>
          <Typography variant="body2">
            {row.paymentMethod?.toUpperCase()}
          </Typography>
        </Box>
      ),
      filterOptions: [
        { label: "Cash", value: "cash" },
        { label: "bKash", value: "bkash" },
        { label: "Nagad", value: "nagad" },
        { label: "Bank", value: "bank" },
        { label: "Card", value: "card" },
      ],
    },
    {
      id: "totalAmount",
      label: "মোট টাকা",
      minWidth: 120,
      align: "right",
      sortable: true,
      filterable: false,
      visible: true,
      type: "number",
      format: (value: number) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          ৳{value?.toLocaleString() || "0"}
        </Typography>
      ),
    },
    {
      id: "fees",
      label: "ফি আইটেম",
      minWidth: 100,
      align: "center",
      sortable: false,
      filterable: false,
      visible: true,
      type: "number",
      render: (row: any) => (
        <Chip
          label={`${row.fees?.length || 0} টি`}
          color="info"
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: "status",
      label: "স্ট্যাটাস",
      minWidth: 120,
      align: "center",
      sortable: true,
      filterable: true,
      visible: true,
      type: "status",
      filterOptions: [
        { label: "Active", value: "active" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Refunded", value: "refunded" },
      ],
      render: (row: any) => (
        <Chip
          label={row.status?.toUpperCase() || "ACTIVE"}
          color={getStatusColor(row.status)}
          size="small"
        />
      ),
    },
    {
      id: "collectedBy",
      label: "সংগ্রহকারী",
      minWidth: 120,
      sortable: true,
      filterable: true,
      visible: true,
      type: "text",
    },
    {
      id: "summary",
      label: "ডিটেইলস",
      minWidth: 200,
      sortable: false,
      filterable: false,
      visible: true,
      render: (row: any) => (
        <Box>
          <Typography variant="caption" display="block" color="textSecondary">
            {row.fees
              ?.slice(0, 2)
              .map(
                (fee: any) =>
                  `${fee.feeType}: ৳${fee.paidAmount?.toLocaleString()}`
              )
              .join(", ")}
          </Typography>
          {row.fees && row.fees.length > 2 && (
            <Typography variant="caption" color="textSecondary">
              +{row.fees.length - 2} more
            </Typography>
          )}
        </Box>
      ),
    },
  ];

  // Row Actions ডেফিনিশন
  const rowActions: RowAction[] = [
    {
      label: "View",
      icon: <Visibility fontSize="small" />,
      onClick: handleViewReceipt,
      color: "primary",
      tooltip: "বিস্তারিত দেখুন",
      alwaysShow: true,
    },
    {
      label: "Print",
      icon: <Print fontSize="small" />,
      onClick: handlePrintReceipt,
      color: "info",
      tooltip: "প্রিন্ট করুন",
      alwaysShow: true,
    },
    {
      label: "Craft Receipt",
      icon: <Print fontSize="small" />,
      onClick: handleViewCraftReceipt,
      color: "secondary",
      tooltip: "Craft রিসিট দেখুন",
      alwaysShow: true,
    },
    {
      label: "Download",
      icon: <Download fontSize="small" />,
      onClick: handleDownloadReceipt,
      color: "success",
      tooltip: "ডাউনলোড করুন",
      inMenu: false,
    },
    {
      label: "Edit",
      icon: <Edit fontSize="small" />,
      onClick: handleEditReceipt,
      color: "warning",
      tooltip: "এডিট করুন",
      inMenu: true,
    },
    {
      label: "Email",
      icon: <Email fontSize="small" />,
      onClick: handleEmailReceipt,
      color: "info",
      tooltip: "ইমেইল করুন",
      inMenu: true,
    },
    {
      label: "Delete",
      icon: <Delete fontSize="small" />,
      onClick: handleDeleteReceipt,
      color: "error",
      tooltip: "ডিলিট করুন",
      inMenu: false,
    },
    {
      label: "More Actions",
      icon: <MoreVert fontSize="small" />,
      onClick: () => { },
      inMenu: false,
      alwaysShow: false,
    },
  ];

  // Bulk Actions ডেফিনিশন
  const bulkActions: BulkAction[] = [
    {
      label: "Bulk Print",
      icon: <Print fontSize="small" />,
      onClick: (selectedRows: any) => {
        selectedRows.forEach((row: any) => handlePrintReceipt(row));
      },
      color: "info",
    },
    {
      label: "Bulk Download",
      icon: <Download fontSize="small" />,
      onClick: (selectedRows: any) => {
        selectedRows.forEach((row: any) => handleDownloadReceipt(row));
      },
      color: "success",
    },
    {
      label: "Bulk Delete",
      icon: <Delete fontSize="small" />,
      onClick: handleBulkDelete,
      color: "error",
    },
  ];

  return {
    columns,
    rowActions,
    bulkActions,
    getPaymentMethodIcon,
    getStatusColor,
  };
};

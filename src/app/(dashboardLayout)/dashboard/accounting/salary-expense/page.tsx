/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  Payments,
  Person,
  TrendingDown,
  Wallet,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import CraftTable from "@/components/Table";
import { Column, RowAction } from "@/interface/table";
import {
  useDeleteSalaryMutation,
  useGetAllSalariesQuery,
} from "@/redux/api/salaryApi";
import AddSalaryModal from "../salary/__components/AddSalaryModal";

const formatCurrency = (value: number | string | undefined | null) => {
  const amount = Number(value) || 0;
  return `৳${amount.toLocaleString()}`;
};

const formatDate = (date: string | Date | undefined | null) => {
  if (!date) return "-";
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? "-"
    : parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
};

const getDeductedAmount = (row: any) =>
  (Number(row.deducted) || 0) +
  (Number(row.incomeTax) || 0) +
  (Number(row.providentFund) || 0) +
  (Number(row.otherDeductions) || 0);

const getBonusAmount = (row: any) =>
  Number(row.bonus) || Number(row.otherAllowances) || 0;

const getAdvanceAmount = (row: any) =>
  Number(row.advanceGiven) || Number(row.advance) || Number(row.advanceSalary) || 0;

const getDueAmount = (row: any) =>
  Number(row.due) || Number(row.dueSalary) || Number(row.salaryDue) || 0;

export default function SalaryExpensePage() {
  const [openSalaryModal, setOpenSalaryModal] = useState(false);
  const [editingSalaryId, setEditingSalaryId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, refetch } = useGetAllSalariesQuery({});
  const [deleteSalary] = useDeleteSalaryMutation();

  const salaries = useMemo(() => data?.data?.salaries || [], [data]);

  const totalPaid = salaries.reduce(
    (sum: number, item: any) => sum + (Number(item.netSalary || item.totalSalary) || 0),
    0,
  );
  const totalAdvance = salaries.reduce(
    (sum: number, item: any) => sum + getAdvanceAmount(item),
    0,
  );
  const totalDue = salaries.reduce(
    (sum: number, item: any) => sum + getDueAmount(item),
    0,
  );

  const handleAddSalaryExpense = () => {
    setEditingSalaryId(null);
    setOpenSalaryModal(true);
  };

  const handleEditSalary = (row: any) => {
    setEditingSalaryId(row._id);
    setOpenSalaryModal(true);
  };

  const handleCloseModal = () => {
    setOpenSalaryModal(false);
    setEditingSalaryId(null);
    refetch();
  };

  const handleDeleteSalary = async (row: any) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You want to delete this salary expense?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d32f2f",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      await deleteSalary(row._id).unwrap();
      await Swal.fire({
        title: "Deleted!",
        text: "Salary expense has been deleted successfully.",
        icon: "success",
      });
      refetch();
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.data?.message || "Failed to delete salary expense",
        icon: "error",
      });
    }
  };

  const columns: Column[] = [
    {
      id: "effectiveDate",
      label: "Date",
      minWidth: 130,
      sortable: true,
      type: "date",
      render: (row: any) => formatDate(row.effectiveDate || row.date || row.createdAt),
    },
    {
      id: "employee",
      label: "Staff/Teacher Name",
      minWidth: 230,
      sortable: true,
      render: (row: any) => {
        const name = row.employee?.name || row.employeeName || row.employee || "Unknown";

        return (
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Avatar sx={{ bgcolor: "#4F0187", width: 36, height: 36 }}>
              <Person fontSize="small" />
            </Avatar>
            <Box>
              <Typography fontWeight={700} color="#111827">
                {name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Salary expense record
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      id: "category",
      label: "Category",
      minWidth: 130,
      align: "center",
      filterable: true,
      render: (row: any) => (
        <Chip
          size="small"
          label={row.category || row.employeeCategory || row.personType || "Salary"}
          sx={{ bgcolor: "#EEF2FF", color: "#4338CA", fontWeight: 700 }}
        />
      ),
    },
    {
      id: "basicSalary",
      label: "Fixed Salary",
      minWidth: 130,
      align: "right",
      sortable: true,
      render: (row: any) => formatCurrency(row.basicSalary || row.fixedSalary),
    },
    {
      id: "houseRent",
      label: "Home Rent",
      minWidth: 120,
      align: "right",
      sortable: true,
      render: (row: any) => formatCurrency(row.houseRent || row.homeRent),
    },
    {
      id: "bonus",
      label: "Bonus",
      minWidth: 110,
      align: "right",
      sortable: true,
      render: (row: any) => (
        <Typography fontWeight={700} color="#059669">
          {formatCurrency(getBonusAmount(row))}
        </Typography>
      ),
    },
    {
      id: "deducted",
      label: "Deducted",
      minWidth: 120,
      align: "right",
      sortable: true,
      render: (row: any) => (
        <Typography fontWeight={700} color="#DC2626">
          {formatCurrency(getDeductedAmount(row))}
        </Typography>
      ),
    },
    {
      id: "netSalary",
      label: "Net/Total Salary",
      minWidth: 160,
      align: "right",
      sortable: true,
      render: (row: any) => (
        <Typography fontWeight={800} color="#4F0187">
          {formatCurrency(row.netSalary || row.totalSalary)}
        </Typography>
      ),
    },
    {
      id: "advanceGiven",
      label: "Advance Given",
      minWidth: 145,
      align: "right",
      sortable: true,
      render: (row: any) => formatCurrency(getAdvanceAmount(row)),
    },
    {
      id: "due",
      label: "Due",
      minWidth: 110,
      align: "right",
      sortable: true,
      render: (row: any) => (
        <Typography fontWeight={800} color={getDueAmount(row) > 0 ? "#F59E0B" : "#10B981"}>
          {formatCurrency(getDueAmount(row))}
        </Typography>
      ),
    },
  ];

  const rowActions: RowAction[] = [
    {
      label: "Edit",
      icon: <Edit fontSize="small" />,
      onClick: handleEditSalary,
      color: "warning",
      tooltip: "Edit salary expense",
    },
    {
      label: "Delete",
      icon: <Delete fontSize="small" />,
      onClick: handleDeleteSalary,
      color: "error",
      tooltip: "Delete salary expense",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 4,
            background: "linear-gradient(135deg, #4F0187 0%, #7B2CBF 100%)",
            color: "#fff",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              bgcolor: alpha("#fff", 0.08),
              right: -70,
              top: -90,
            }}
          />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            position="relative"
          >
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.85, fontWeight: 800 }}>
                Accounting Expense
              </Typography>
              <Typography variant="h4" fontWeight={900}>
                Salary Expense
              </Typography>
              <Typography sx={{ opacity: 0.88, mt: 0.5 }}>
                Salary given records for teachers and staff.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} width={{ xs: "100%", md: "auto" }}>
              {[
                { label: "Total Salary", value: totalPaid, icon: <Payments /> },
                { label: "Advance", value: totalAdvance, icon: <Wallet /> },
                { label: "Due", value: totalDue, icon: <TrendingDown /> },
              ].map((item) => (
                <Paper
                  key={item.label}
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1.5,
                    minWidth: { xs: "100%", sm: 150 },
                    borderRadius: 3,
                    bgcolor: alpha("#fff", 0.14),
                    color: "#fff",
                    border: `1px solid ${alpha("#fff", 0.18)}`,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    {item.icon}
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.85 }}>
                        {item.label}
                      </Typography>
                      <Typography fontWeight={900}>{formatCurrency(item.value)}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Paper>

        <CraftTable
          title="Salary Expense Table"
          subtitle="Date, staff/teacher, category, salary, advance, due and actions"
          columns={columns}
          data={salaries}
          loading={isLoading}
          rowActions={rowActions}
          onAdd={handleAddSalaryExpense}
          searchable
          filterable
          sortable
          pagination
          hover
          striped
          stickyHeader
          showRowNumbers
          idField="_id"
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
          emptyStateMessage="No salary expense records found"
          actionColumnWidth={130}
        />

        <AddSalaryModal
          open={openSalaryModal}
          onClose={handleCloseModal}
          salaryId={editingSalaryId}
        />
      </Container>
    </Box>
  );
}

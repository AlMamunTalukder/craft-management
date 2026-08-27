/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Box, Button, Chip, Container, Paper, Stack, Typography, alpha } from "@mui/material";
import { Add, ArrowBack, Delete, Edit, Person, Wallet } from "@mui/icons-material";
import Swal from "sweetalert2";
import CraftTable from "@/components/Table";
import { Column, RowAction } from "@/interface/table";
import {
  useDeleteSalaryMutation,
  useGetAllSalariesQuery,
} from "@/redux/api/salaryApi";
import AddSalaryModal from "../../salary/__components/AddSalaryModal";

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

const getMonthKey = (date: string | Date | undefined | null) => {
  if (!date) return "unknown";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "unknown";
  return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthName = (monthKey: string) => {
  if (monthKey === "unknown") return "Unknown Month";
  const [year, month] = monthKey.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
};

const getEmployeeName = (row: any) => row.employeeInfo?.name || row.employee?.name || row.employeeName || row.employee || "Unknown";
const getEmployeeType = (row: any) => row.employeeType || row.personType || "teacher/staff";
const getCategory = (row: any) => row.employeeInfo?.category || row.employeeInfo?.designation || row.category || row.designation || "Salary";
const getBonusAmount = (row: any) => Number(row.bonus) || Number(row.otherAllowances) || 0;
const getDeductedAmount = (row: any) =>
  Number(row.deductions || row.deducted || row.totalDeductions) ||
  (Number(row.incomeTax) || 0) + (Number(row.providentFund) || 0) + (Number(row.otherDeductions) || 0);
const getAdvanceAmount = (row: any) => Number(row.advanceGiven || row.advance || row.advanceSalary) || 0;
const getPaidAmount = (row: any) => Number(row.paidAmount || row.netSalary || row.totalSalary) || 0;
const getDueAmount = (row: any) => Number(row.due || row.dueSalary || row.salaryDue) || 0;

export default function SalaryExpenseDetailsPage({ params }: { params: { month: string } }) {
  const router = useRouter();
  const [openSalaryModal, setOpenSalaryModal] = useState(false);
  const [editingSalaryId, setEditingSalaryId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, refetch } = useGetAllSalariesQuery({});
  const [deleteSalary] = useDeleteSalaryMutation();

  const salaryRows = useMemo(() => {
    const salaries = data?.data?.salaries || [];
    return salaries.filter((salary: any) => getMonthKey(salary.paidAt || salary.effectiveDate || salary.createdAt) === params.month);
  }, [data, params.month]);

  const totalPaid = salaryRows.reduce((sum: number, row: any) => sum + getPaidAmount(row), 0);
  const totalAdvance = salaryRows.reduce((sum: number, row: any) => sum + getAdvanceAmount(row), 0);
  const totalDue = salaryRows.reduce((sum: number, row: any) => sum + getDueAmount(row), 0);

  const handleAdd = () => {
    setEditingSalaryId(null);
    setOpenSalaryModal(true);
  };

  const handleEdit = (row: any) => {
    setEditingSalaryId(row._id);
    setOpenSalaryModal(true);
  };

  const handleCloseModal = () => {
    setOpenSalaryModal(false);
    setEditingSalaryId(null);
    refetch();
  };

  const handleDelete = async (row: any) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You want to delete this salary record?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d32f2f",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      await deleteSalary(row._id).unwrap();
      await Swal.fire("Deleted!", "Salary record has been deleted.", "success");
      refetch();
    } catch (err: any) {
      Swal.fire("Error!", err.data?.message || "Failed to delete salary record", "error");
    }
  };

  const columns: Column[] = [
    {
      id: "date",
      label: "Date",
      minWidth: 130,
      render: (row: any) => formatDate(row.paidAt || row.effectiveDate || row.createdAt),
    },
    {
      id: "employee",
      label: "Staff/Teacher Name",
      minWidth: 240,
      render: (row: any) => (
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar sx={{ bgcolor: "#4F0187", width: 36, height: 36 }}>
            <Person fontSize="small" />
          </Avatar>
          <Box>
            <Typography fontWeight={800}>{getEmployeeName(row)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {getEmployeeType(row)}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    { id: "employeeType", label: "Type", minWidth: 120, render: (row: any) => getEmployeeType(row) },
    { id: "category", label: "Category", minWidth: 140, render: (row: any) => getCategory(row) },
    { id: "basicSalary", label: "Fixed Salary", minWidth: 130, align: "right", render: (row: any) => formatCurrency(row.basicSalary || row.fixedSalary) },
    { id: "houseRent", label: "Home Rent", minWidth: 120, align: "right", render: (row: any) => formatCurrency(row.houseRent || row.homeRent) },
    { id: "bonus", label: "Bonus", minWidth: 110, align: "right", render: (row: any) => formatCurrency(getBonusAmount(row)) },
    { id: "deducted", label: "Deducted", minWidth: 120, align: "right", render: (row: any) => formatCurrency(getDeductedAmount(row)) },
    { id: "advanceGiven", label: "Advance Given", minWidth: 145, align: "right", render: (row: any) => formatCurrency(getAdvanceAmount(row)) },
    {
      id: "paidAmount",
      label: "Paid Salary",
      minWidth: 130,
      align: "right",
      render: (row: any) => <Typography fontWeight={800} color="#4F0187">{formatCurrency(getPaidAmount(row))}</Typography>,
    },
    {
      id: "due",
      label: "Due",
      minWidth: 110,
      align: "right",
      render: (row: any) => <Typography fontWeight={800} color={getDueAmount(row) > 0 ? "#F59E0B" : "#10B981"}>{formatCurrency(getDueAmount(row))}</Typography>,
    },
    {
      id: "status",
      label: "Status",
      minWidth: 110,
      align: "center",
      render: (row: any) => <Chip size="small" label={row.status || "paid"} sx={{ textTransform: "capitalize", fontWeight: 800 }} />,
    },
  ];

  const rowActions: RowAction[] = [
    { label: "Edit", icon: <Edit fontSize="small" />, onClick: handleEdit, color: "warning", tooltip: "Edit salary" },
    { label: "Delete", icon: <Delete fontSize="small" />, onClick: handleDelete, color: "error", tooltip: "Delete salary" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        <Button startIcon={<ArrowBack />} onClick={() => router.push("/dashboard/accounting/salary-expense")} sx={{ mb: 2 }}>
          Back to Salary Expense
        </Button>

        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 4, background: "linear-gradient(135deg, #4F0187 0%, #7B2CBF 100%)", color: "#fff" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.86, fontWeight: 900 }}>Monthly Salary Sheet</Typography>
              <Typography variant="h4" fontWeight={900}>{getMonthName(params.month)}</Typography>
              <Typography sx={{ opacity: 0.9, mt: 0.5 }}>Teacher and staff salary, advance, due, and payment records.</Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              {[
                { label: "Paid", value: totalPaid },
                { label: "Advance", value: totalAdvance },
                { label: "Due", value: totalDue },
              ].map((item) => (
                <Paper key={item.label} sx={{ px: 2, py: 1.5, minWidth: 140, borderRadius: 3, bgcolor: alpha("#fff", 0.14), color: "#fff" }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Wallet />
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.85 }}>{item.label}</Typography>
                      <Typography fontWeight={900}>{formatCurrency(item.value)}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Paper>

        <CraftTable
          title="Salary Details"
          subtitle="Teacher/staff monthly salary sheet"
          columns={columns}
          data={salaryRows}
          loading={isLoading}
          rowActions={rowActions}
          onAdd={handleAdd}
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
          emptyStateMessage="No salary records found for this month"
          actionColumnWidth={130}
        />

        <AddSalaryModal open={openSalaryModal} onClose={handleCloseModal} salaryId={editingSalaryId} />
      </Container>
    </Box>
  );
}

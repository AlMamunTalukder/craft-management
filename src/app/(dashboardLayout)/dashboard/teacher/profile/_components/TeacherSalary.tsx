/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Chip, Grid, Paper, Stack, Typography, alpha } from "@mui/material";
import { Add, CalendarMonth, Payments, ReceiptLong, TrendingDown, Wallet } from "@mui/icons-material";
import CraftTable from "@/components/Table";
import { Column } from "@/interface/table";
import { useGetAllSalariesQuery } from "@/redux/api/salaryApi";

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

const getEmployeeId = (row: any) => row.employeeInfo?._id || row.employee?._id || row.employeeId || "";
const getEmployeeName = (row: any) => row.employeeInfo?.name || row.employee?.name || row.employeeName || row.employee || "";
const getAdvanceAmount = (row: any) => Number(row.advanceGiven || row.advance || row.advanceSalary) || 0;
const getPaidAmount = (row: any) => Number(row.paidAmount || row.netSalary || row.totalSalary) || 0;
const getDueAmount = (row: any) => Number(row.due || row.dueSalary || row.salaryDue) || 0;
const getBonusAmount = (row: any) => Number(row.bonus) || Number(row.otherAllowances) || 0;
const getDeductedAmount = (row: any) =>
  Number(row.deductions || row.deducted || row.totalDeductions) ||
  (Number(row.incomeTax) || 0) + (Number(row.providentFund) || 0) + (Number(row.otherDeductions) || 0);

export default function TeacherSalary({ teacher }: { teacher: any }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { data, isLoading } = useGetAllSalariesQuery({});

  const salaryRows = useMemo(() => {
    const salaries = data?.data?.salaries || [];
    const teacherId = teacher?._id;
    const teacherName = String(teacher?.name || "").toLowerCase();

    return salaries.filter((salary: any) => {
      const salaryEmployeeId = getEmployeeId(salary);
      const salaryEmployeeName = String(getEmployeeName(salary)).toLowerCase();

      return (
        (teacherId && salaryEmployeeId === teacherId) ||
        (teacherName && salaryEmployeeName === teacherName)
      );
    });
  }, [data, teacher]);

  const currentMonthKey = getMonthKey(new Date());
  const currentMonthSalary = salaryRows.find(
    (salary: any) => getMonthKey(salary.paidAt || salary.effectiveDate || salary.createdAt) === currentMonthKey,
  );
  const fixedSalary = Number(teacher?.monthlySalary) || Number(currentMonthSalary?.basicSalary) || 0;
  const totalPaid = salaryRows.reduce((sum: number, row: any) => sum + getPaidAmount(row), 0);
  const totalAdvance = salaryRows.reduce((sum: number, row: any) => sum + getAdvanceAmount(row), 0);
  const totalDue = salaryRows.reduce((sum: number, row: any) => sum + getDueAmount(row), 0);

  const summaryCards = [
    { label: "Fixed Monthly Salary", value: fixedSalary, icon: <Payments />, color: "#4F0187" },
    { label: "Current Month Paid", value: getPaidAmount(currentMonthSalary), icon: <Wallet />, color: "#2563EB" },
    { label: "Total Advance", value: totalAdvance, icon: <ReceiptLong />, color: "#F59E0B" },
    { label: "Total Due", value: totalDue, icon: <TrendingDown />, color: "#DC2626" },
  ];

  const columns: Column[] = [
    {
      id: "month",
      label: "Month",
      minWidth: 160,
      render: (row: any) => getMonthName(getMonthKey(row.paidAt || row.effectiveDate || row.createdAt)),
    },
    { id: "basicSalary", label: "Fixed Salary", minWidth: 130, align: "right", render: (row: any) => formatCurrency(row.basicSalary || row.fixedSalary || fixedSalary) },
    { id: "bonus", label: "Bonus", minWidth: 110, align: "right", render: (row: any) => formatCurrency(getBonusAmount(row)) },
    { id: "deducted", label: "Deducted", minWidth: 120, align: "right", render: (row: any) => formatCurrency(getDeductedAmount(row)) },
    { id: "advance", label: "Advance Taken", minWidth: 145, align: "right", render: (row: any) => formatCurrency(getAdvanceAmount(row)) },
    { id: "paid", label: "Paid Salary", minWidth: 130, align: "right", render: (row: any) => <Typography fontWeight={800} color="#4F0187">{formatCurrency(getPaidAmount(row))}</Typography> },
    { id: "due", label: "Due", minWidth: 110, align: "right", render: (row: any) => <Typography fontWeight={800} color={getDueAmount(row) > 0 ? "#F59E0B" : "#10B981"}>{formatCurrency(getDueAmount(row))}</Typography> },
    { id: "status", label: "Status", minWidth: 110, align: "center", render: (row: any) => <Chip size="small" label={row.status || "paid"} sx={{ fontWeight: 800, textTransform: "capitalize" }} /> },
    { id: "paidAt", label: "Paid Date", minWidth: 130, render: (row: any) => formatDate(row.paidAt || row.effectiveDate || row.createdAt) },
  ];

  return (
    <Box>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 4, background: "linear-gradient(135deg, #4F0187 0%, #7B2CBF 100%)", color: "#fff" }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.86, fontWeight: 900 }}>Teacher Salary</Typography>
            <Typography variant="h4" fontWeight={900}>{teacher?.name || "Teacher"}</Typography>
            <Typography sx={{ opacity: 0.9, mt: 0.5 }}>Fixed salary, paid salary, advance, due, and monthly history.</Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.push(`/dashboard/accounting/salary-expense/${currentMonthKey}`)}
              sx={{ bgcolor: "#fff", color: "#4F0187", borderRadius: 999, fontWeight: 900, "&:hover": { bgcolor: "#F8F5FC" } }}
            >
              Add Salary Payment
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2} mb={3}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Paper sx={{ p: 2, borderRadius: 3, border: `1px solid ${alpha(card.color, 0.12)}`, boxShadow: `0 10px 24px ${alpha(card.color, 0.08)}` }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 42, height: 42, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: alpha(card.color, 0.1), color: card.color }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase">{card.label}</Typography>
                  <Typography variant="h6" fontWeight={900} color={card.color}>{formatCurrency(card.value)}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: "#FFF7ED", border: "1px solid #FED7AA" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CalendarMonth sx={{ color: "#EA580C" }} />
          <Box>
            <Typography fontWeight={900}>Current Month Status: {getMonthName(currentMonthKey)}</Typography>
            <Typography variant="body2" color="text.secondary">
              Paid {formatCurrency(getPaidAmount(currentMonthSalary))}, advance {formatCurrency(getAdvanceAmount(currentMonthSalary))}, due {formatCurrency(getDueAmount(currentMonthSalary))}.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <CraftTable
        title="Salary Payment History"
        subtitle="Monthly salary, advance, due, and payment records for this teacher"
        columns={columns}
        data={salaryRows}
        loading={isLoading}
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
        emptyStateMessage="No salary records found for this teacher"
      />
    </Box>
  );
}

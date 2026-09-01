/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Chip, Container, Paper, Stack, Typography, alpha } from "@mui/material";
import { ArrowForward, CalendarMonth, Payments, ReceiptLong } from "@mui/icons-material";
import CraftTable from "@/components/Table";
import { Column } from "@/interface/table";
import { useGetAllExpensesQuery } from "@/redux/api/expenseApi";
import { useGetAllSalariesQuery } from "@/redux/api/salaryApi";

const formatCurrency = (value: number | string | undefined | null) => {
  const amount = Number(value) || 0;
  return `৳${amount.toLocaleString()}`;
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

const getSalaryAmount = (row: any) =>
  Number(row.netSalary || row.totalSalary || row.grossSalary || row.basicSalary) || 0;

const getExpenseCategoryName = (expense: any) =>
  String(expense?.category?.name || expense?.category || "").toLowerCase();

const isOfficeExpense = (expense: any) => getExpenseCategoryName(expense).includes("office");

const isResidentialExpense = (expense: any) => {
  const category = getExpenseCategoryName(expense);
  return (
    category.includes("residential") ||
    category.includes("hostel") ||
    category.includes("boarding")
  );
};

export default function SalaryExpensePage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: salaryData, isLoading: isLoadingSalary } = useGetAllSalariesQuery({});
  const { data: expenseData, isLoading: isLoadingExpense } = useGetAllExpensesQuery({});

  const salaries = useMemo(() => salaryData?.data?.salaries || [], [salaryData]);
  const expenses = useMemo(() => expenseData?.data?.expenses || [], [expenseData]);

  const monthlyRows = useMemo(() => {
    const summaryMap = new Map<string, any>();

    const ensureMonth = (monthKey: string) => {
      if (!summaryMap.has(monthKey)) {
        summaryMap.set(monthKey, {
          id: monthKey,
          month: monthKey,
          monthName: getMonthName(monthKey),
          officeExpense: 0,
          residentialExpense: 0,
          salary: 0,
          total: 0,
        });
      }

      return summaryMap.get(monthKey);
    };

    salaries.forEach((salary: any) => {
      const monthKey = getMonthKey(salary.paidAt || salary.effectiveDate || salary.createdAt);
      const row = ensureMonth(monthKey);
      row.salary += getSalaryAmount(salary);
    });

    expenses.forEach((expense: any) => {
      const monthKey = getMonthKey(expense.expenseDate || expense.createdAt);
      const row = ensureMonth(monthKey);
      const amount = Number(expense.totalAmount) || 0;

      if (isOfficeExpense(expense)) row.officeExpense += amount;
      if (isResidentialExpense(expense)) row.residentialExpense += amount;
    });

    return Array.from(summaryMap.values())
      .map((row) => ({
        ...row,
        total: row.officeExpense + row.residentialExpense + row.salary,
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [expenses, salaries]);

  const totalSalaryExpense = monthlyRows.reduce((sum, row) => sum + row.salary, 0);
  const totalCombinedExpense = monthlyRows.reduce((sum, row) => sum + row.total, 0);

  const columns: Column[] = [
    {
      id: "monthName",
      label: "Month Name",
      minWidth: 180,
      sortable: true,
      render: (row: any) => (
        <Stack direction="row" spacing={1.25} alignItems="center">
          <CalendarMonth sx={{ color: "#4F0187" }} />
          <Box>
            <Typography fontWeight={800}>{row.monthName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {row.month}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: "officeExpense",
      label: "Office Expense",
      minWidth: 150,
      align: "right",
      sortable: true,
      render: (row: any) => formatCurrency(row.officeExpense),
    },
    {
      id: "residentialExpense",
      label: "Residential Expense",
      minWidth: 180,
      align: "right",
      sortable: true,
      render: (row: any) => formatCurrency(row.residentialExpense),
    },
    {
      id: "salary",
      label: "Salary",
      minWidth: 140,
      align: "right",
      sortable: true,
      render: (row: any) => (
        <Typography fontWeight={800} color="#4F0187">
          {formatCurrency(row.salary)}
        </Typography>
      ),
    },
    {
      id: "total",
      label: "Total",
      minWidth: 140,
      align: "right",
      sortable: true,
      render: (row: any) => (
        <Chip
          label={formatCurrency(row.total)}
          sx={{ bgcolor: "#ECFDF5", color: "#047857", fontWeight: 900 }}
        />
      ),
    },
    {
      id: "details",
      label: "Details",
      minWidth: 130,
      align: "center",
      render: (row: any) => (
        <Button
          size="small"
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={() => router.push(`/dashboard/accounting/salary-expense/${row.month}`)}
          sx={{ bgcolor: "#4F0187", borderRadius: 999 }}
        >
          Details
        </Button>
      ),
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
            position: "relative",
            overflow: "hidden",
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
              <Typography variant="overline" sx={{ opacity: 0.86, fontWeight: 900 }}>
                Institute Expense
              </Typography>
              <Typography variant="h4" fontWeight={900}>
                Salary Expense Summary
              </Typography>
              <Typography sx={{ opacity: 0.9, mt: 0.5 }}>
                Monthly office, residential, and salary expense overview.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} width={{ xs: "100%", md: "auto" }}>
              <Paper sx={{ px: 2, py: 1.5, borderRadius: 3, bgcolor: alpha("#fff", 0.14), color: "#fff" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Payments />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>Salary</Typography>
                    <Typography fontWeight={900}>{formatCurrency(totalSalaryExpense)}</Typography>
                  </Box>
                </Stack>
              </Paper>
              <Paper sx={{ px: 2, py: 1.5, borderRadius: 3, bgcolor: alpha("#fff", 0.14), color: "#fff" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ReceiptLong />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>Total Expense</Typography>
                    <Typography fontWeight={900}>{formatCurrency(totalCombinedExpense)}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Stack>
        </Paper>

        <CraftTable
          title="Salary Expense Table"
          subtitle="SL, month name, office expense, residential expense, salary, total, and details"
          columns={columns}
          data={monthlyRows}
          loading={isLoadingSalary || isLoadingExpense}
          searchable
          filterable
          sortable
          pagination
          hover
          striped
          stickyHeader
          showRowNumbers
          idField="id"
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
          emptyStateMessage="No monthly salary expense records found"
        />
      </Container>
    </Box>
  );
}

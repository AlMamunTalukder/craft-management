"use client";

import { useRouter } from "next/navigation";
import { useGetAccountingReportQuery } from "@/redux/api/metaApi";
import { AccountingTab } from "@/components/dashboard/AccountingTab";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Calculator, TrendingUp, TrendingDown, Wallet, Building2, CreditCard, Receipt, PiggyBank, DollarSign } from "lucide-react";

const quickLinks = [
  { title: "Income Records", desc: "All income", path: "/dashboard/accounting/income", icon: TrendingUp, color: "#16a34a" },
  { title: "Expense Records", desc: "All expenses", path: "/dashboard/accounting/expense", icon: TrendingDown, color: "#dc2626" },
  { title: "Residential", desc: "Meal & hostel", path: "/dashboard/accounting/residential", icon: Building2, color: "#0ea5e9" },
  { title: "Fee Collection", desc: "Student fees", path: "/dashboard/accounting/fee-collection", icon: Calculator, color: "#0d9488" },
  { title: "Invoices", desc: "Billing", path: "/dashboard/accounting/invoice", icon: Receipt, color: "#7c3aed" },
  { title: "Payslips", desc: "Salary pay", path: "/dashboard/accounting/salary-expense", icon: DollarSign, color: "#2563eb" },
  { title: "Salary Structure", desc: "Setup salary", path: "/dashboard/accounting/salary", icon: Wallet, color: "#4F0187" },
  { title: "Receivable", desc: "Due collection", path: "/dashboard/accounting/receivable", icon: Wallet, color: "#16a34a" },
  { title: "Loans", desc: "Taken/Given", path: "/dashboard/accounting/loan", icon: CreditCard, color: "#7c3aed" },
  { title: "Investments", desc: "Capital", path: "/dashboard/accounting/investments", icon: PiggyBank, color: "#0288d1" },
  { title: "Assets", desc: "Inventory", path: "/dashboard/assets", icon: Building2, color: "#475569" },
  { title: "Reports", desc: "Summary", path: "/dashboard/accounting/total-expense-category", icon: Receipt, color: "#f59e0b" },
];

export default function AccountingOverviewPage() {
  const router = useRouter();
  const { data: accountingData, isLoading } = useGetAccountingReportQuery({});

  const accountingReport = accountingData?.data?.data;
  const accountingStats = accountingReport
    ? {
        totalIncome: accountingReport.summary?.income,
        totalExpense: accountingReport.summary?.expense,
        netProfit: accountingReport.summary?.netProfit,
        assets: accountingReport.summary?.assets,
        liabilities: accountingReport.summary?.liabilities,
        equity: accountingReport.summary?.equity,
        equationValid: accountingReport.formulaCheck?.["Valid?"],
        equationAssets: accountingReport.formulaCheck?.["Assets (সম্পদ)"],
        equationLiabilities: accountingReport.formulaCheck?.["Liabilities (দেনা)"],
        equationEquity: accountingReport.formulaCheck?.["Equity (মূলধন)"],
        breakdown: accountingReport.breakdown || {},
        details: accountingReport.details || {},
      }
    : null;

  const handleCardClick = (type: string) => {
    const map: Record<string, string> = {
      income: "/dashboard/accounting/income",
      expenses: "/dashboard/accounting/expense",
      assets: "/dashboard/assets",
      liabilities: "/dashboard/accounting/loan",
      equity: "/dashboard/accounting/investments",
    };
    if (map[type]) router.push(map[type]);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#4F0187" }} />
      </Box>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-3 sm:p-5 lg:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-[#4F0187] to-[#8A2BE2] bg-clip-text text-transparent">
          Accounting Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">Complete financial overview • Income, Expense, Assets, Liabilities, Equity</p>
      </div>

      {/* Quick Links Grid */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.path}
              onClick={() => router.push(link.path)}
              className="group text-left bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 hover:border-[#4F0187]/20 hover:shadow-[0_8px_24px_rgba(79,1,135,0.08)] transition-all"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${link.color}15`, color: link.color }}>
                <Icon size={16} />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#4F0187] leading-tight">{link.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{link.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Accounting Stats */}
      {!accountingStats ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography color="text.secondary">No accounting data available</Typography>
        </Box>
      ) : (
        <AccountingTab accountingStats={accountingStats} accountingLoading={isLoading} onCardClick={handleCardClick} />
      )}
    </div>
  );
}

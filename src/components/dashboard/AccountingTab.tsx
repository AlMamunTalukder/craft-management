/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  ArrowDown,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Download,
  Network,
  Receipt,
  Scale,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { AccountingCard } from "./AccountingCard"; 
import { CashFlowSummary } from "./CashFlowSummary";
import { EquationCheck } from "./EquationCheck";
import { FinancialHealthMeter } from "./FinancialHealthMeter";

const GradientTypography = ({
  children,
  gradient,
  className = "",
}: any) => {
  const gradientColors =
    gradient || "linear-gradient(135deg, #4F0187 0%, #8A2BE2 100%)";

  return (
    <div
      className={`inline-flex items-center font-bold ${className}`}
      style={{
        background: gradientColors,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </div>
  );
};

export const AccountingTab = ({
  accountingStats,
  accountingLoading,
  onCardClick,
}: any) => {
  if (!accountingStats) return null;

  const profitMargin =
    accountingStats.totalIncome > 0
      ? Math.round(
          (accountingStats.netProfit / accountingStats.totalIncome) * 100
        )
      : 0;

  const otherIncome =
    accountingStats.totalIncome -
    accountingStats.breakdown.totalAdmissionFee;

  const otherExpenses =
    accountingStats.totalExpense -
    accountingStats.breakdown.totalSalary;

  return (
    <div className="mb-4 sm:mb-6 md:mb-8">
      {/* =========================================================
          HEADER SECTION
      ========================================================== */}
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <GradientTypography className="text-xl sm:text-2xl md:text-3xl">
          <Wallet className="mr-2.5 h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
          Accounting Overview
        </GradientTypography>

        <div className="flex gap-2">
          {/* Date Filter */}
          <button
            type="button"
            className="
              inline-flex items-center justify-center gap-1.5
              rounded-xl border border-gray-200
              bg-white/80 px-3 py-2
              text-xs font-medium text-gray-700
              shadow-sm backdrop-blur-sm
              transition-colors
              hover:border-purple-200
              hover:bg-purple-50
              hover:text-purple-700
              sm:px-4 sm:py-2.5 sm:text-sm
            "
          >
            <CalendarDays className="h-4 w-4" />

            <span className="min-[381px]:inline sm:hidden">
              Filter
            </span>

            <span className="hidden sm:inline">
              Date Filter
            </span>
          </button>

          {/* Export */}
          <button
            type="button"
            className="
              inline-flex items-center justify-center gap-1.5
              rounded-xl border border-gray-200
              bg-white/80 px-3 py-2
              text-xs font-medium text-gray-700
              shadow-sm backdrop-blur-sm
              transition-colors
              hover:border-purple-200
              hover:bg-purple-50
              hover:text-purple-700
              sm:px-4 sm:py-2.5 sm:text-sm
            "
          >
            <Download className="h-4 w-4" />

            <span className="min-[381px]:inline sm:hidden">
              Export
            </span>

            <span className="hidden sm:inline">
              Export Report
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================
          EQUATION CHECK
      ========================================================== */}
      <div className="mb-4 sm:mb-6">
        <EquationCheck
          assets={accountingStats.equationAssets}
          liabilities={accountingStats.equationLiabilities}
          equity={accountingStats.equationEquity}
          isValid={accountingStats.equationValid}
          loading={accountingLoading}
        />
      </div>

      {/* =========================================================
          FINANCIAL SUMMARY CARDS
      ========================================================== */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-6">
        {/* Total Income */}
        <div className="min-w-0">
          <AccountingCard
            title="Total Income"
            value={`৳${accountingStats.totalIncome?.toLocaleString()}`}
            icon={<TrendingUp />}
            color="#16a34a"
            subValue={`৳${accountingStats.breakdown.totalAdmissionFee?.toLocaleString()}`}
            subTitle="From Admissions"
            loading={accountingLoading}
            onClick={() => onCardClick?.("income")}
          />
        </div>

        {/* Total Expenses */}
        <div className="min-w-0">
          <AccountingCard
            title="Total Expenses"
            value={`৳${accountingStats.totalExpense?.toLocaleString()}`}
            icon={<TrendingDown />}
            color="#dc2626"
            subValue={`৳${accountingStats.breakdown.totalSalary?.toLocaleString()}`}
            subTitle="In Salaries"
            loading={accountingLoading}
            onClick={() => onCardClick?.("expenses")}
          />
        </div>

        {/* Net Profit */}
        <div className="min-w-0 sm:col-span-2 md:col-span-1">
          <AccountingCard
            title="Net Profit"
            value={`৳${accountingStats.netProfit?.toLocaleString()}`}
            icon={<TrendingUp />}
            color="#2563eb"
            subValue={`${profitMargin}%`}
            subTitle="Profit Margin"
            loading={accountingLoading}
            onClick={() => onCardClick?.("profit")}
          />
        </div>
      </div>

      {/* =========================================================
          FINANCIAL HEALTH + CASH FLOW
      ========================================================== */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:gap-4 md:grid-cols-2 md:gap-6">
        {/* Financial Health */}
        <div className="min-w-0">
          <FinancialHealthMeter
            income={accountingStats.totalIncome}
            expenses={accountingStats.totalExpense}
            profit={accountingStats.netProfit}
            loading={accountingLoading}
          />
        </div>

        {/* Cash Flow */}
        <div className="min-w-0">
          <CashFlowSummary
            income={accountingStats.totalIncome}
            expenses={accountingStats.totalExpense}
            breakdown={accountingStats.breakdown}
            loading={accountingLoading}
          />
        </div>
      </div>

      {/* =========================================================
          ASSETS / LIABILITIES / EQUITY
      ========================================================== */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-6">
        {/* Total Assets */}
        <div className="min-w-0">
          <AccountingCard
            title="Total Assets"
            value={`৳${accountingStats.assets?.toLocaleString()}`}
            icon={<Wallet />}
            color="#4F0187"
            subValue={`৳${accountingStats.details.assets?.investments?.toLocaleString()}`}
            subTitle="In Investments"
            loading={accountingLoading}
            onClick={() => onCardClick?.("assets")}
          />
        </div>

        {/* Total Liabilities */}
        <div className="min-w-0">
          <AccountingCard
            title="Total Liabilities"
            value={`৳${accountingStats.liabilities?.toLocaleString()}`}
            icon={<CreditCard />}
            color="#d97706"
            subValue={`৳${accountingStats.breakdown.outstandingTakenLoans?.toLocaleString()}`}
            subTitle="Outstanding Loans"
            loading={accountingLoading}
            onClick={() => onCardClick?.("liabilities")}
          />
        </div>

        {/* Total Equity */}
        <div className="min-w-0 sm:col-span-2 md:col-span-1">
          <AccountingCard
            title="Total Equity"
            value={`৳${accountingStats.equity?.toLocaleString()}`}
            icon={<Scale />}
            color="#8A2BE2"
            subValue={`৳${accountingStats.details.equity?.capital?.toLocaleString()}`}
            subTitle="Capital"
            loading={accountingLoading}
            onClick={() => onCardClick?.("equity")}
          />
        </div>
      </div>

      {/* =========================================================
          DETAILED FINANCIAL BREAKDOWN
      ========================================================== */}
      <details
        className="
          group mb-4 overflow-hidden
          rounded-2xl
          border border-gray-200/80
          bg-white/80
          shadow-[0_4px_20px_rgba(0,0,0,0.05)]
          backdrop-blur-xl
          sm:mb-6 sm:rounded-3xl
        "
      >
        {/* Accordion Header */}
        <summary
          className="
            flex cursor-pointer list-none
            items-center justify-between
            px-4 py-3
            marker:hidden
            sm:px-5 sm:py-4
            md:px-6
            [&::-webkit-details-marker]:hidden
          "
        >
          <div className="flex min-w-0 items-center">
            <div
              className="
                mr-2.5 flex h-8 w-8 shrink-0
                items-center justify-center
                rounded-lg
                bg-purple-50
                text-purple-700
                sm:mr-3 sm:h-9 sm:w-9
              "
            >
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            <span className="truncate text-sm font-semibold text-gray-800 sm:text-base md:text-lg">
              Detailed Financial Breakdown
            </span>
          </div>

          <ChevronDown
            className="
              ml-3 h-5 w-5 shrink-0
              text-gray-500
              transition-transform
              group-open:rotate-180
            "
          />
        </summary>

        {/* Accordion Content */}
        <div className="border-t border-gray-100 p-3 sm:p-5 md:p-6">
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
            {/* =====================================================
                INCOME DETAILS
            ====================================================== */}
            <div className="min-w-0">
              <div className="mb-3 flex items-center text-sm font-semibold text-gray-800 sm:mb-4 sm:text-base">
                <div
                  className="
                    mr-2 flex h-7 w-7
                    items-center justify-center
                    rounded-lg
                    bg-green-50
                    text-green-600
                  "
                >
                  <CircleDollarSign className="h-4 w-4" />
                </div>

                Income Details
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="divide-y divide-gray-100">
                  {/* Total Admission Fees */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium text-gray-600 sm:text-sm">
                      Total Admission Fees
                    </span>

                    <span className="shrink-0 font-mono text-xs font-medium text-gray-800 sm:text-sm">
                      ৳
                      {accountingStats.breakdown.totalAdmissionFee?.toLocaleString()}
                    </span>
                  </div>

                  {/* Other Income */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium text-gray-600 sm:text-sm">
                      Other Income
                    </span>

                    <span className="shrink-0 font-mono text-xs font-medium text-gray-800 sm:text-sm">
                      ৳{otherIncome?.toLocaleString()}
                    </span>
                  </div>

                  {/* Total Income */}
                  <div className="flex items-center justify-between gap-3 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3">
                    <span className="text-xs font-bold text-gray-900 sm:text-sm">
                      Total Income
                    </span>

                    <span className="shrink-0 font-mono text-xs font-bold text-gray-900 sm:text-sm">
                      ৳{accountingStats.totalIncome?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
                EXPENSE DETAILS
            ====================================================== */}
            <div className="min-w-0">
              <div className="mb-3 flex items-center text-sm font-semibold text-gray-800 sm:mb-4 sm:text-base">
                <div
                  className="
                    mr-2 flex h-7 w-7
                    items-center justify-center
                    rounded-lg
                    bg-red-50
                    text-red-600
                  "
                >
                  <ArrowDown className="h-4 w-4" />
                </div>

                Expense Details
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="divide-y divide-gray-100">
                  {/* Salaries */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium text-gray-600 sm:text-sm">
                      Salaries
                    </span>

                    <span className="shrink-0 font-mono text-xs font-medium text-gray-800 sm:text-sm">
                      ৳
                      {accountingStats.breakdown.totalSalary?.toLocaleString()}
                    </span>
                  </div>

                  {/* Other Expenses */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium text-gray-600 sm:text-sm">
                      Other Expenses
                    </span>

                    <span className="shrink-0 font-mono text-xs font-medium text-gray-800 sm:text-sm">
                      ৳{otherExpenses?.toLocaleString()}
                    </span>
                  </div>

                  {/* Total Expenses */}
                  <div className="flex items-center justify-between gap-3 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3">
                    <span className="text-xs font-bold text-gray-900 sm:text-sm">
                      Total Expenses
                    </span>

                    <span className="shrink-0 font-mono text-xs font-bold text-gray-900 sm:text-sm">
                      ৳{accountingStats.totalExpense?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
                ASSETS BREAKDOWN
            ====================================================== */}
            <div className="min-w-0">
              <div className="mb-3 flex items-center text-sm font-semibold text-gray-800 sm:mb-4 sm:text-base">
                <div
                  className="
                    mr-2 flex h-7 w-7
                    items-center justify-center
                    rounded-lg
                    bg-purple-50
                    text-purple-700
                  "
                >
                  <Network className="h-4 w-4" />
                </div>

                Assets Breakdown
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="divide-y divide-gray-100">
                  {/* Cash */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium text-gray-600 sm:text-sm">
                      Cash
                    </span>

                    <span className="shrink-0 font-mono text-xs font-medium text-gray-800 sm:text-sm">
                      ৳
                      {accountingStats.details.assets?.cash?.toLocaleString()}
                    </span>
                  </div>

                  {/* Accounts Receivable */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium text-gray-600 sm:text-sm">
                      Accounts Receivable
                    </span>

                    <span className="shrink-0 font-mono text-xs font-medium text-gray-800 sm:text-sm">
                      ৳
                      {accountingStats.details.assets?.accountsReceivable?.toLocaleString()}
                    </span>
                  </div>

                  {/* Investments */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium text-gray-600 sm:text-sm">
                      Investments
                    </span>

                    <span className="shrink-0 font-mono text-xs font-medium text-gray-800 sm:text-sm">
                      ৳
                      {accountingStats.details.assets?.investments?.toLocaleString()}
                    </span>
                  </div>

                  {/* Fixed Assets */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium text-gray-600 sm:text-sm">
                      Fixed Assets
                    </span>

                    <span className="shrink-0 font-mono text-xs font-medium text-gray-800 sm:text-sm">
                      ৳
                      {accountingStats.details.assets?.fixedAssets?.toLocaleString()}
                    </span>
                  </div>

                  {/* Total Assets */}
                  <div className="flex items-center justify-between gap-3 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3">
                    <span className="text-xs font-bold text-gray-900 sm:text-sm">
                      Total Assets
                    </span>

                    <span className="shrink-0 font-mono text-xs font-bold text-gray-900 sm:text-sm">
                      ৳{accountingStats.assets?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
                LIABILITIES & EQUITY
            ====================================================== */}
            <div className="min-w-0">
              <div className="mb-3 flex items-center text-sm font-semibold text-gray-800 sm:mb-4 sm:text-base">
                <div
                  className="
                    mr-2 flex h-7 w-7
                    items-center justify-center
                    rounded-lg
                    bg-amber-50
                    text-amber-600
                  "
                >
                  <Scale className="h-4 w-4" />
                </div>

                Liabilities &amp; Equity
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="divide-y divide-gray-100">
                  {/* Accounts Payable */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium text-gray-600 sm:text-sm">
                      Accounts Payable
                    </span>

                    <span className="shrink-0 font-mono text-xs font-medium text-gray-800 sm:text-sm">
                      ৳
                      {accountingStats.details.liabilities?.accountsPayable?.toLocaleString()}
                    </span>
                  </div>

                  {/* Loans */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium text-gray-600 sm:text-sm">
                      Loans
                    </span>

                    <span className="shrink-0 font-mono text-xs font-medium text-gray-800 sm:text-sm">
                      ৳
                      {accountingStats.details.liabilities?.loans?.toLocaleString()}
                    </span>
                  </div>

                  {/* Other Liabilities */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium text-gray-600 sm:text-sm">
                      Other Liabilities
                    </span>

                    <span className="shrink-0 font-mono text-xs font-medium text-gray-800 sm:text-sm">
                      ৳
                      {accountingStats.details.liabilities?.otherLiabilities?.toLocaleString()}
                    </span>
                  </div>

                  {/* Separator */}
                  <div className="h-2 bg-gray-50" />

                  {/* Capital */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium text-gray-600 sm:text-sm">
                      Capital
                    </span>

                    <span className="shrink-0 font-mono text-xs font-medium text-gray-800 sm:text-sm">
                      ৳
                      {accountingStats.details.equity?.capital?.toLocaleString()}
                    </span>
                  </div>

                  {/* Retained Earnings */}
                  <div className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 sm:px-4 sm:py-3">
                    <span className="text-xs font-medium text-gray-600 sm:text-sm">
                      Retained Earnings
                    </span>

                    <span className="shrink-0 font-mono text-xs font-medium text-gray-800 sm:text-sm">
                      ৳
                      {accountingStats.details.equity?.retainedEarnings?.toLocaleString()}
                    </span>
                  </div>

                  {/* Total Liabilities & Equity */}
                  <div className="flex items-center justify-between gap-3 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3">
                    <span className="text-xs font-bold text-gray-900 sm:text-sm">
                      Total Liabilities &amp; Equity
                    </span>

                    <span className="shrink-0 font-mono text-xs font-bold text-gray-900 sm:text-sm">
                      ৳
                      {(
                        accountingStats.liabilities +
                        accountingStats.equity
                      )?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
};
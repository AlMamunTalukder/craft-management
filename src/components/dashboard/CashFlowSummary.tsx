/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Activity,
  Download,
  Eye,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

export const CashFlowSummary = ({
  income,
  expenses,
  breakdown,
  loading = false,
}: any) => {
  const netCashFlow = income - expenses;
  const isPositive = netCashFlow >= 0;

  return (
    <div
      className="
        relative h-full overflow-hidden
        rounded-2xl sm:rounded-3xl
        border border-gray-200/70
        bg-white/90
        backdrop-blur-xl
        shadow-lg shadow-gray-200/40
      "
    >
      {/* Accent */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" />

      <div className="p-4 sm:p-5 md:p-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3 sm:mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 sm:h-11 sm:w-11">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 sm:text-base md:text-lg">
              Cash Flow Summary
            </h3>
            <p className="text-[11px] text-gray-400 sm:text-xs">
              Income and expense overview
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-5">
            <div className="h-5 w-full rounded-md bg-gray-100" />
            <div className="h-5 w-4/5 rounded-md bg-gray-100" />
            <div className="h-px w-full bg-gray-100" />
            <div className="h-5 w-full rounded-md bg-gray-100" />
            <div className="h-5 w-3/4 rounded-md bg-gray-100" />
          </div>
        ) : (
          <>
            {/* Income */}
            <div className="mb-5 rounded-2xl bg-emerald-50/60 p-3.5 sm:mb-6 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-gray-600 sm:text-sm">
                    Operating Income
                  </span>
                </div>

                <strong className="text-sm text-emerald-600 sm:text-base">
                  ৳{income?.toLocaleString()}
                </strong>
              </div>

              <div className="flex items-center justify-between pl-6">
                <span className="text-xs text-gray-500">
                  Admission Fees
                </span>

                <span className="text-xs font-semibold text-gray-700 sm:text-sm">
                  ৳{breakdown?.totalAdmissionFee?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Expenses */}
            <div className="mb-5 rounded-2xl bg-red-50/60 p-3.5 sm:mb-6 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-semibold text-gray-600 sm:text-sm">
                    Operating Expenses
                  </span>
                </div>

                <strong className="text-sm text-red-600 sm:text-base">
                  ৳{expenses?.toLocaleString()}
                </strong>
              </div>

              <div className="flex items-center justify-between pl-6">
                <span className="text-xs text-gray-500">
                  Salaries
                </span>

                <span className="text-xs font-semibold text-gray-700 sm:text-sm">
                  ৳{breakdown?.totalSalary?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Net Cash Flow */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-700 sm:text-sm">
                    Net Cash Flow
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
                    Current period
                  </p>
                </div>

                <strong
                  className={`text-base sm:text-lg ${
                    isPositive
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  ৳{netCashFlow?.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:justify-between">
              <button
                type="button"
                className="
                  flex w-full items-center justify-center gap-2
                  rounded-xl border border-gray-200
                  bg-white px-4 py-2.5
                  text-xs font-semibold text-gray-600
                  shadow-sm
                  hover:bg-gray-50
                  sm:w-auto
                "
              >
                <Eye className="h-4 w-4" />
                Details
              </button>

              <button
                type="button"
                className="
                  flex w-full items-center justify-center gap-2
                  rounded-xl
                  bg-gray-900 px-4 py-2.5
                  text-xs font-semibold text-white
                  shadow-md
                  hover:bg-gray-800
                  sm:w-auto
                "
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
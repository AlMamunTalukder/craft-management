/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  BarChart3,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

export const FinancialHealthMeter = ({
  income,
  expenses,
  profit,
  loading = false,
}: any) => {
  const profitMargin = income > 0 ? (profit / income) * 100 : 0;

  let healthStatus = "Excellent";
  let healthColor = "text-emerald-600";
  let healthBg = "bg-emerald-100";
  let progressColor = "rgb(16, 185, 129)";

  if (profitMargin < 10) {
    healthStatus = "Poor";
    healthColor = "text-red-600";
    healthBg = "bg-red-100";
    progressColor = "rgb(239, 68, 68)";
  } else if (profitMargin < 20) {
    healthStatus = "Fair";
    healthColor = "text-orange-600";
    healthBg = "bg-orange-100";
    progressColor = "rgb(249, 115, 22)";
  } else if (profitMargin < 30) {
    healthStatus = "Good";
    healthColor = "text-sky-600";
    healthBg = "bg-sky-100";
    progressColor = "rgb(14, 165, 233)";
  }

  const percentage = Math.min(Math.max(profitMargin, 0), 100);

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
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-purple-500 via-blue-500 to-transparent" />

      <div className="p-4 sm:p-5 md:p-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3 sm:mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 sm:h-11 sm:w-11">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 sm:text-base md:text-lg">
              Financial Health
            </h3>

            <p className="text-[11px] text-gray-400 sm:text-xs">
              Overall financial performance
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <LoaderCircle className="h-8 w-8 text-gray-400" />
          </div>
        ) : (
          <>
            {/* Donut */}
            <div className="mb-5 flex justify-center sm:mb-6">
              <div
                className="relative flex h-28 w-28 items-center justify-center rounded-full sm:h-32 sm:w-32"
                style={{
                  background: `conic-gradient(
                    ${progressColor} ${percentage}%,
                    #f1f5f9 ${percentage}% 100%
                  )`,
                }}
              >
                {/* Inner circle */}
                <div className="flex h-[82%] w-[82%] flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <span className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
                    {profitMargin.toFixed(1)}%
                  </span>

                  <span className="text-[10px] font-medium text-gray-400 sm:text-xs">
                    Margin
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-5 flex justify-center sm:mb-6">
              <div
                className={`
                  inline-flex items-center gap-1.5
                  rounded-full ${healthBg}
                  px-3 py-1.5
                  text-xs font-bold ${healthColor}
                `}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {healthStatus}
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 sm:p-4">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-gray-500 sm:text-sm">
                  Income:
                </span>

                <strong className="text-xs font-bold text-gray-800 sm:text-sm">
                  ৳{income?.toLocaleString()}
                </strong>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-gray-500 sm:text-sm">
                  Expenses:
                </span>

                <strong className="text-xs font-bold text-gray-800 sm:text-sm">
                  ৳{expenses?.toLocaleString()}
                </strong>
              </div>

              <div className="my-2 h-px bg-gray-200" />

              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs font-bold text-gray-700 sm:text-sm">
                  Profit:
                </span>

                <strong
                  className={`
                    text-xs font-extrabold sm:text-sm
                    ${
                      profit >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  `}
                >
                  ৳{profit?.toLocaleString()}
                </strong>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
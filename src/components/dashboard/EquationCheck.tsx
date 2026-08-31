/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Scale,
  CheckCircle2,
  XCircle,
  LoaderCircle,
} from "lucide-react";

export const EquationCheck = ({
  assets,
  liabilities,
  equity,
  isValid,
  loading = false,
}: any) => {
  return (
    <div
      className={`
        relative overflow-hidden
        rounded-2xl sm:rounded-3xl
        border
        ${
          isValid
            ? "border-emerald-200/70 bg-emerald-50/50"
            : "border-red-200/70 bg-red-50/50"
        }
        shadow-sm
      `}
    >
      {/* Top gradient */}
      <div
        className={`
          absolute left-0 top-0 h-1 w-full
          ${
            isValid
              ? "bg-gradient-to-r from-emerald-500 to-transparent"
              : "bg-gradient-to-r from-red-500 to-transparent"
          }
        `}
      />

      <div className="p-4 sm:p-5 md:p-6">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center gap-3 sm:mb-5">
          <div
            className={`
              flex h-10 w-10 items-center justify-center rounded-xl
              ${
                isValid
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-red-500/10 text-red-600"
              }
            `}
          >
            <Scale className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-900 sm:text-base md:text-lg">
              Accounting Equation Check
            </h3>
          </div>

          {!loading && (
            <div
              className={`
                flex items-center gap-1.5 rounded-full
                px-2.5 py-1 text-[10px] font-bold
                sm:px-3 sm:py-1.5 sm:text-xs
                ${
                  isValid
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }
              `}
            >
              {isValid ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}

              {isValid ? "Balanced" : "Not Balanced"}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <LoaderCircle className="h-7 w-7 text-gray-400" />
          </div>
        ) : (
          <>
            <p className="mb-5 text-xs leading-relaxed text-gray-500 sm:text-sm">
              The fundamental accounting equation:{" "}
              <strong className="text-gray-700">
                Assets = Liabilities + Equity
              </strong>
            </p>

            {/* Equation */}
            <div
              className="
                flex flex-wrap items-center justify-center
                gap-2 rounded-2xl
                border border-white/80
                bg-white/70
                px-3 py-4
                shadow-sm
                sm:gap-3 sm:px-5 sm:py-5
              "
            >
              <span className="text-lg font-extrabold text-blue-600 sm:text-2xl">
                ৳{assets?.toLocaleString()}
              </span>

              <span className="text-lg font-bold text-gray-400 sm:text-2xl">
                =
              </span>

              <span className="text-lg font-extrabold text-orange-600 sm:text-2xl">
                ৳{liabilities?.toLocaleString()}
              </span>

              <span className="text-lg font-bold text-gray-400 sm:text-2xl">
                +
              </span>

              <span className="text-lg font-extrabold text-purple-600 sm:text-2xl">
                ৳{equity?.toLocaleString()}
              </span>
            </div>

            {!isValid && (
              <p className="mt-4 text-center text-xs font-semibold text-red-600">
                There is a discrepancy in the accounting equation that needs
                attention.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
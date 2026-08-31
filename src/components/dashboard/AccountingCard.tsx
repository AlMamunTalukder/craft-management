/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  MoreVertical,
  LoaderCircle,
} from "lucide-react";

export const AccountingCard = ({
  title,
  value,
  icon,
  color,
  subValue,
  subTitle,
  loading = false,
  onClick,
}: any) => {
  const colorMap: Record<string, string> = {
    "#2e7d32": "text-emerald-600",
    "#d32f2f": "text-red-600",
    "#0288d1": "text-sky-600",
    "#1976d2": "text-blue-600",
    "#ed6c02": "text-orange-600",
    "#9c27b0": "text-purple-600",
  };

  const bgMap: Record<string, string> = {
    "#2e7d32": "bg-emerald-500/[0.10]",
    "#d32f2f": "bg-red-500/[0.10]",
    "#0288d1": "bg-sky-500/[0.10]",
    "#1976d2": "bg-blue-500/[0.10]",
    "#ed6c02": "bg-orange-500/[0.10]",
    "#9c27b0": "bg-purple-500/[0.10]",
  };

  const borderMap: Record<string, string> = {
    "#2e7d32": "border-emerald-500/20",
    "#d32f2f": "border-red-500/20",
    "#0288d1": "border-sky-500/20",
    "#1976d2": "border-blue-500/20",
    "#ed6c02": "border-orange-500/20",
    "#9c27b0": "border-purple-500/20",
  };

  const shadowMap: Record<string, string> = {
    "#2e7d32": "shadow-emerald-500/10",
    "#d32f2f": "shadow-red-500/10",
    "#0288d1": "shadow-sky-500/10",
    "#1976d2": "shadow-blue-500/10",
    "#ed6c02": "shadow-orange-500/10",
    "#9c27b0": "shadow-purple-500/10",
  };

  const textColor =
    colorMap[color] || "text-purple-600";

  const iconBg =
    bgMap[color] || "bg-purple-500/[0.10]";

  const borderColor =
    borderMap[color] || "border-purple-500/20";

  const shadowColor =
    shadowMap[color] || "shadow-purple-500/10";

  return (
    <div
      onClick={onClick}
      className={`
        group relative h-full overflow-hidden
        rounded-2xl sm:rounded-3xl
        border ${borderColor}
        bg-white/90
        backdrop-blur-xl
        shadow-lg ${shadowColor}
        ${onClick ? "cursor-pointer" : "cursor-default"}
      `}
    >
      {/* Top accent */}
      <div
        className="absolute left-0 top-0 h-1 w-full opacity-80"
        style={{
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }}
      />

      {/* Decorative background */}
      <div
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl opacity-30"
        style={{
          backgroundColor: color,
        }}
      />

      <div className="relative p-4 sm:p-5 md:p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between sm:mb-5">
          {loading ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 sm:h-13 sm:w-13">
              <LoaderCircle className="h-5 w-5 text-gray-400" />
            </div>
          ) : (
            <div
              className={`
                flex h-11 w-11 items-center justify-center
                rounded-xl sm:h-13 sm:w-13 sm:rounded-2xl
                ${iconBg}
                ${textColor}
                border ${borderColor}
                shadow-sm
              `}
            >
              <div className="h-5 w-5 sm:h-6 sm:w-6">
                {icon}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="
              rounded-lg p-1.5
              text-gray-400
              hover:bg-gray-100
              hover:text-gray-700
            "
            aria-label="More options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-8 w-3/4 rounded-lg bg-gray-100" />
            <div className="h-4 w-1/2 rounded-md bg-gray-100" />
            <div className="mt-5 h-2 w-full rounded-full bg-gray-100" />
          </div>
        ) : (
          <>
            {/* Value */}
            <div
              className="
                truncate
                text-2xl font-extrabold tracking-tight
                text-gray-900
                sm:text-3xl
                md:text-[2rem]
              "
            >
              {value}
            </div>

            {/* Title */}
            <div className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">
              {title}
            </div>

            {/* Bottom information */}
            {subValue && (
              <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
                <span
                  className={`text-xs font-bold sm:text-sm ${textColor}`}
                >
                  {subValue}
                </span>

                <span className="text-[11px] text-gray-400 sm:text-xs">
                  {subTitle}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
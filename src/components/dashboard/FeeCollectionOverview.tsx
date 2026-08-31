/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FeeCollectionOverviewProps } from "@/interface/fees";
import { formatCurrency } from "@/utils/formaters";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  GraduationCap,
  Percent,
  Receipt,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";

export const FeeCollectionOverview = ({
  feeSummaryData,
  isLoading = false,
}: FeeCollectionOverviewProps) => {
  const router = useRouter();

  /* ----------------------------------------------------------
     Calculate totals
  ---------------------------------------------------------- */

  const calculateFeeTotals = () => {
    if (!feeSummaryData?.classes) {
      return {
        currentMonthTotal: {
          totalAmount: 0,
          totalPaid: 0,
          totalDue: 0,
          totalDiscount: 0,
        },
        yearlyTotal: {
          totalAmount: 0,
          totalPaid: 0,
          totalDue: 0,
          totalDiscount: 0,
        },
        grandTotal: {
          totalAmount: 0,
          totalPaid: 0,
          totalDue: 0,
          totalDiscount: 0,
          totalWaiver: 0,
        },
      };
    }

    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });

    const currentMonthTotal = {
      totalAmount: 0,
      totalPaid: 0,
      totalDue: 0,
      totalDiscount: 0,
    };

    const yearlyTotal = {
      totalAmount: 0,
      totalPaid: 0,
      totalDue: 0,
      totalDiscount: 0,
    };

    feeSummaryData.classes.forEach((classItem: any) => {
      yearlyTotal.totalAmount += classItem.yearly.totalAmount;
      yearlyTotal.totalPaid += classItem.yearly.totalPaid;
      yearlyTotal.totalDue += classItem.yearly.totalDue;
      yearlyTotal.totalDiscount += classItem.yearly.totalDiscount;

      const currentMonthData = classItem.monthly.find(
        (monthData: any) => monthData.month === currentMonth,
      );

      if (currentMonthData) {
        currentMonthTotal.totalAmount += currentMonthData.totalAmount;
        currentMonthTotal.totalPaid += currentMonthData.totalPaid;
        currentMonthTotal.totalDue += currentMonthData.totalDue;
        currentMonthTotal.totalDiscount += currentMonthData.totalDiscount;
      }
    });

    return {
      currentMonthTotal,
      yearlyTotal,
      grandTotal: feeSummaryData.grandTotal || {
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0,
        totalDiscount: 0,
        totalWaiver: 0,
      },
    };
  };

  const { currentMonthTotal, yearlyTotal, grandTotal } =
    calculateFeeTotals();

  /* ----------------------------------------------------------
     Rates
  ---------------------------------------------------------- */

  const collectionRate =
    grandTotal.totalAmount > 0
      ? ((grandTotal.totalPaid / grandTotal.totalAmount) * 100).toFixed(1)
      : "0";

  const discountRate =
    grandTotal.totalAmount > 0
      ? ((grandTotal.totalDiscount / grandTotal.totalAmount) * 100).toFixed(1)
      : "0";

  const duePercentage =
    grandTotal.totalAmount > 0
      ? ((grandTotal.totalDue / grandTotal.totalAmount) * 100).toFixed(1)
      : "0";

  /* ----------------------------------------------------------
     Navigation
  ---------------------------------------------------------- */

  const handleCardClick = (cardType: string) => {
    router.push(`/dashboard/fees/summary?tab=${cardType.toLowerCase()}`);
  };

  /* ----------------------------------------------------------
     Reusable metric data
  ---------------------------------------------------------- */

  const supportingCards = [
    {
      title: "TOTAL DUE",
      value: formatCurrency(grandTotal.totalDue),
      subtitle: `${duePercentage}% of total`,
      icon: ArrowDownRight,
      iconClass: "bg-rose-500 text-white shadow-xs",
      cardType: "due",
      bgClass:
        "bg-gradient-to-br from-rose-50/90 via-rose-50/50 to-white border-rose-200/80 hover:border-rose-300 hover:shadow-md hover:shadow-rose-100/50",
      titleColor: "text-rose-800",
      subColor: "text-rose-600/80",
    },
    {
      title: "TOTAL DISCOUNT",
      value: formatCurrency(grandTotal.totalDiscount),
      subtitle: `${discountRate}% of total`,
      icon: Percent,
      iconClass: "bg-amber-500 text-white shadow-xs",
      cardType: "discount",
      bgClass:
        "bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-white border-amber-200/80 hover:border-amber-300 hover:shadow-md hover:shadow-amber-100/50",
      titleColor: "text-amber-800",
      subColor: "text-amber-700/80",
    },
    {
      title: "TOTAL CLASSES",
      value: feeSummaryData?.classes?.length || 0,
      subtitle: "Active classes",
      icon: GraduationCap,
      iconClass: "bg-sky-500 text-white shadow-xs",
      cardType: "classes",
      bgClass:
        "bg-gradient-to-br from-sky-50/90 via-sky-50/50 to-white border-sky-200/80 hover:border-sky-300 hover:shadow-md hover:shadow-sky-100/50",
      titleColor: "text-sky-800",
      subColor: "text-sky-600/80",
    },
    {
      title: "DISCOUNT RATE",
      value: `${discountRate}%`,
      subtitle: `${formatCurrency(grandTotal.totalDiscount)} given`,
      icon: Percent,
      iconClass: "bg-violet-500 text-white shadow-xs",
      cardType: "discount-rate",
      bgClass:
        "bg-gradient-to-br from-violet-50/90 via-violet-50/50 to-white border-violet-200/80 hover:border-violet-300 hover:shadow-md hover:shadow-violet-100/50",
      titleColor: "text-violet-800",
      subColor: "text-violet-600/80",
    },
  ];

  const primaryCards = [
    {
      title: "CURRENT MONTH",
      value: formatCurrency(currentMonthTotal.totalPaid),
      subtitle: `Target: ${formatCurrency(currentMonthTotal.totalAmount)}`,
      icon: CalendarDays,
      iconClass: "bg-emerald-600 text-white shadow-xs",
      cardType: "current-month",
      bgClass:
        "bg-gradient-to-br from-emerald-50 via-emerald-50/40 to-white border-emerald-200 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100/50",
      titleColor: "text-emerald-900",
      subColor: "text-emerald-700/80",
    },
    {
      title: "YEARLY COLLECTION",
      value: formatCurrency(yearlyTotal.totalPaid),
      subtitle: `Total: ${formatCurrency(yearlyTotal.totalAmount)}`,
      icon: Receipt,
      iconClass: "bg-teal-600 text-white shadow-xs",
      cardType: "yearly",
      bgClass:
        "bg-gradient-to-br from-teal-50 via-teal-50/40 to-white border-teal-200 hover:border-teal-300 hover:shadow-md hover:shadow-teal-100/50",
      titleColor: "text-teal-900",
      subColor: "text-teal-700/80",
    },
  ];

  return (
    <div className="mb-6 w-full transition-all duration-300">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100/80 p-2.5 shadow-sm sm:p-3.5">
        {/* =====================================================
            HEADER SECTION
        ====================================================== */}

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-xs sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Wallet size={19} strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-bold tracking-tight text-slate-800">
                  Fee Collection Overview
                </h2>

                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </div>

              <p className="mt-0.5 hidden text-xs font-medium text-slate-500 sm:block">
                Collection summary and fee performance
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-2xs">
            <BookOpen size={14} className="text-slate-600" strokeWidth={2} />

            <span className="text-xs font-bold tracking-wide text-slate-700">
              Year {feeSummaryData?.academicYear || "2026"}
            </span>
          </div>
        </div>

        {/* =====================================================
            MAIN COLLECTION AREA
        ====================================================== */}

        <div className="mt-2.5 grid grid-cols-1 gap-2.5 lg:grid-cols-12">
          {/* Current Month + Yearly Cards */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:col-span-6">
            {primaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <button
                  key={card.cardType}
                  type="button"
                  onClick={() => handleCardClick(card.cardType)}
                  className={`group relative flex flex-col justify-between rounded-2xl border ${card.bgClass} p-5 text-left transition-all duration-200`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${card.iconClass}`}
                      >
                        <Icon size={19} strokeWidth={2} />
                      </div>

                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-400 border border-slate-200/80 transition-all duration-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900">
                        <ArrowUpRight
                          size={15}
                          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </div>
                    </div>

                    <p className={`mt-4 text-[10px] font-bold uppercase tracking-wider ${card.titleColor}`}>
                      {card.title}
                    </p>

                    {isLoading ? (
                      <div className="mt-2 h-7 w-28 animate-pulse rounded-lg bg-slate-200/60" />
                    ) : (
                      <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                        {card.value}
                      </p>
                    )}

                    <p className={`mt-1 truncate text-xs font-medium ${card.subColor}`}>
                      {card.subtitle}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {card.cardType === "current-month" && (
                    <div className="mt-4 pt-2">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-emerald-800">
                          Collection
                        </span>

                        <span className="text-[10px] font-bold text-emerald-700">
                          {currentMonthTotal.totalAmount > 0
                            ? (
                                (currentMonthTotal.totalPaid /
                                  currentMonthTotal.totalAmount) *
                                100
                              ).toFixed(0)
                            : 0}
                          %
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-emerald-200/60">
                        <div
                          className="h-full rounded-full bg-emerald-600 transition-all duration-700 ease-out"
                          style={{
                            width: `${
                              currentMonthTotal.totalAmount > 0
                                ? Math.min(
                                    (currentMonthTotal.totalPaid /
                                      currentMonthTotal.totalAmount) *
                                      100,
                                    100,
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Grand Total & Collection Rate */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:col-span-6">
            {/* Grand Total Card */}
            <button
              type="button"
              onClick={() => handleCardClick("grand-total")}
              className="group relative flex flex-col justify-between rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/90 via-indigo-50/40 to-white p-5 text-left transition-all duration-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/50"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
                      <CircleDollarSign size={20} strokeWidth={2} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-900">
                        GRAND TOTAL
                      </p>

                      <p className="text-[10px] font-medium text-indigo-700/80">
                        Overall collection
                      </p>
                    </div>
                  </div>

                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-400 border border-slate-200/80 transition-all duration-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600">
                    <ArrowUpRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="mt-4 h-8 w-36 animate-pulse rounded-lg bg-indigo-100/60" />
                ) : (
                  <p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    {formatCurrency(grandTotal.totalPaid)}
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 w-fit shadow-2xs">
                <span className="text-[10px] font-medium text-indigo-700/80">
                  Overall:
                </span>

                <span className="text-[10px] font-bold text-indigo-950">
                  {formatCurrency(grandTotal.totalAmount)}
                </span>
              </div>
            </button>

            {/* Collection Rate Card */}
            <button
              type="button"
              onClick={() => handleCardClick("collection-rate")}
              className="group relative flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 text-left transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/50"
            >
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                <svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100"
                  />

                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-emerald-500 transition-all duration-700 ease-out"
                    strokeDasharray={`${Number(collectionRate) * 2.51} 251`}
                  />
                </svg>

                <div className="text-center">
                  <p className="text-base font-bold text-slate-900">
                    {collectionRate}%
                  </p>

                  <p className="text-[7px] font-bold uppercase tracking-wider text-slate-400">
                    collected
                  </p>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white shadow-2xs">
                      <BarChart3 size={14} strokeWidth={2} />
                    </div>

                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      RATE
                    </p>
                  </div>

                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-200/80 transition-all duration-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900">
                    <ArrowUpRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs font-semibold text-slate-800">
                  {formatCurrency(grandTotal.totalPaid)} collected
                </p>

                <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                  <CheckCircle2 size={12} strokeWidth={2.5} />
                  Collection performance
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* =====================================================
            SUPPORTING METRICS
        ====================================================== */}

        <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {supportingCards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.cardType}
                type="button"
                onClick={() => handleCardClick(card.cardType)}
                className={`group relative min-w-0 rounded-2xl border ${card.bgClass} p-4 text-left transition-all duration-200`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 ${card.iconClass}`}
                    >
                      <Icon size={15} strokeWidth={2} />
                    </div>

                    <p className={`truncate text-[9px] font-bold uppercase tracking-wider ${card.titleColor}`}>
                      {card.title}
                    </p>
                  </div>

                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 border border-slate-200/80 transition-all duration-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900">
                    <ArrowUpRight
                      size={13}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="mt-2.5 h-6 w-20 animate-pulse rounded bg-slate-200/60" />
                ) : (
                  <p className="mt-2.5 truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                    {card.value}
                  </p>
                )}

                <p className={`mt-0.5 truncate text-[10px] font-medium ${card.subColor}`}>
                  {card.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeeCollectionOverview;
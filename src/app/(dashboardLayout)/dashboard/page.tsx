/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AccountingTab } from "@/components/dashboard/AccountingTab";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { FeeCollectionOverview } from "@/components/dashboard/FeeCollectionOverview";
import { useGetClassWiseFeeSummaryQuery } from "@/redux/api/feesApi";
import {
  useGetAccountingReportQuery,
  useGetAllMetaQuery,
  useGetStudentByClassQuery,
} from "@/redux/api/metaApi";
import {
  Badge,
  BookOpen,
  BookOpenText,
  BriefcaseBusiness,
  CreditCard,
  FilePenLine,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  Megaphone,
  Menu,
  ShieldCheck,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardHome() {
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const { data: classWiseFeeSummary, isLoading: feeSummaryLoading } =
    useGetClassWiseFeeSummaryQuery({});

  const { data, isLoading } = useGetAllMetaQuery({});

  const { data: accountingData, isLoading: accountingLoading } =
    useGetAccountingReportQuery({});

  const { data: classWiseData, isLoading: classWiseLoading } =
    useGetStudentByClassQuery({});

  const metaData = data?.data;
  const accountingReport = accountingData?.data?.data;
  const classWiseStudentData = classWiseData?.data || {};
  const feeSummaryData = classWiseFeeSummary?.data;

  /* ----------------------------------------------------------
     Responsive state
  ---------------------------------------------------------- */

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");

    const handleChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  /* ----------------------------------------------------------
     Existing functionality
  ---------------------------------------------------------- */

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleTabChange = (_event: any, newValue: any) =>
    setActiveTab(newValue);

  const navigateToModule = (path: any) => router.push(path);

  /* ----------------------------------------------------------
     Statistics
  ---------------------------------------------------------- */

  const [stats, setStats] = useState({
    students: { total: 0, trend: "up", trendValue: 12 },
    teachers: { total: 0, trend: "up", trendValue: 8 },
    classes: { total: 0, trend: "up", trendValue: 5 },
    staffs: { total: 0, trend: "up", trendValue: 10 },
    income: { total: "৳24,500", trend: "up", trendValue: 15 },
    expenses: { total: "৳18,200", trend: "down", trendValue: 5 },
    attendance: {
      students: { present: 0, total: 0 },
      teachers: { present: 0, total: 0 },
    },
    smsBalance: 250,
    smsSent: 42,
    websiteVisits: 1243,
  });

  useEffect(() => {
    if (metaData) {
      setStats((prev) => ({
        ...prev,
        students: {
          ...prev.students,
          total: metaData.totalStudents || 0,
        },
        teachers: {
          ...prev.teachers,
          total: metaData.totalTeachers || 0,
        },
        classes: {
          ...prev.classes,
          total: metaData.totalClasses || 0,
        },
        staffs: {
          ...prev.staffs,
          total: metaData.totalStaffs || 0,
        },
        attendance: {
          students: {
            present: Math.round((metaData.totalStudents || 0) * 0.85),
            total: metaData.totalStudents || 0,
          },
          teachers: {
            present: Math.round((metaData.totalTeachers || 0) * 0.9),
            total: metaData.totalTeachers || 0,
          },
        },
      }));
    }
  }, [metaData]);

  /* ----------------------------------------------------------
     Accounting
  ---------------------------------------------------------- */

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
        equationLiabilities:
          accountingReport.formulaCheck?.["Liabilities (দেনা)"],
        equationEquity: accountingReport.formulaCheck?.["Equity (মূলধন)"],
        breakdown: accountingReport.breakdown || {},
        details: accountingReport.details || {},
      }
    : null;

  /* ----------------------------------------------------------
     Dashboard modules
  ---------------------------------------------------------- */

  const modules = [
    {
      title: "Dashboard",
      description: "Overview",
      icon: <LayoutDashboard size={22} strokeWidth={1.8} />,
      color: "#2563EB",
      path: "/dashboard",
    },
    {
      title: "Website",
      description: "Notice, Events, Blog",
      icon: <Globe size={22} strokeWidth={1.8} />,
      color: "#0891B2",
      path: "/dashboard/website",
    },
    {
      title: "Admissions",
      description: "Enrollments",
      icon: <FilePenLine size={22} strokeWidth={1.8} />,
      color: "#7C3AED",
      path: "/dashboard/enrollments/list",
    },
    {
      title: "Academic",
      description: "Class, Batch, Attendance",
      icon: <GraduationCap size={22} strokeWidth={1.8} />,
      color: "#059669",
      path: "/dashboard/academic",
    },
    {
      title: "Hifz Program",
      description: "Daily Reports",
      icon: <BookOpenText size={22} strokeWidth={1.8} />,
      color: "#9333EA",
      path: "/dashboard/hifz/class/list",
    },
    {
      title: "Ampara",
      description: "Daily & Weekly",
      icon: <BookOpen size={22} strokeWidth={1.8} />,
      color: "#16A34A",
      path: "/dashboard/ampara/daily-report/list",
    },
    {
      title: "Nazera",
      description: "Daily & Weekly",
      icon: <BookOpen size={22} strokeWidth={1.8} />,
      color: "#EA580C",
      path: "/dashboard/nazera/daily-report/list",
    },
    {
      title: "Qaida/Noorani",
      description: "Daily & Weekly",
      icon: <LibraryBig size={22} strokeWidth={1.8} />,
      color: "#0891B2",
      path: "/dashboard/qaida-noorani/daily-report/list",
    },
    {
      title: "Teachers",
      description: "Manage Teachers",
      icon: <BriefcaseBusiness size={22} strokeWidth={1.8} />,
      color: "#DC2626",
      path: "/dashboard/teacher/list",
    },
    {
      title: "Staff",
      description: "Staff List",
      icon: <Badge size={22} strokeWidth={1.8} />,
      color: "#9333EA",
      path: "/dashboard/staff/list",
    },
    {
      title: "Students",
      description: "Student List",
      icon: <Users size={22} strokeWidth={1.8} />,
      color: "#2563EB",
      path: "/dashboard/student/list",
    },
    {
      title: "Communications",
      description: "Notice, Feedback",
      icon: <Megaphone size={22} strokeWidth={1.8} />,
      color: "#7C3AED",
      path: "/dashboard/notice-board",
    },
    {
      title: "Meal Mgmt",
      description: "Daily Meal Reports",
      icon: <Utensils size={22} strokeWidth={1.8} />,
      color: "#DB2777",
      path: "/dashboard/daily-meal-report",
    },
    {
      title: "Fees",
      description: "Fee Collections",
      icon: <CreditCard size={22} strokeWidth={1.8} />,
      color: "#0D9488",
      path: "/dashboard/fees/list",
    },
    {
      title: "Accounting",
      description: "Income, Expense",
      icon: <Wallet size={22} strokeWidth={1.8} />,
      color: "#16A34A",
      path: "/dashboard/accounting/income",
    },
    {
      title: "User Mgmt",
      description: "Users & Permissions",
      icon: <ShieldCheck size={22} strokeWidth={1.8} />,
      color: "#475569",
      path: "/dashboard/user-management",
    },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: isMobile ? "short" : "long",
    year: "numeric",
    month: isMobile ? "short" : "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen w-full bg-[#f7f8fa] text-slate-900">
      <div className="relative mx-auto w-full max-w-[1800px] overflow-hidden px-3 py-3 sm:px-5 sm:py-5 lg:px-7 lg:py-7">
        {/* Subtle background decoration */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-100/30 blur-3xl" />

        <div className="relative z-10">
          {/* --------------------------------------------------
              Header
          -------------------------------------------------- */}

          <header className="mb-4 flex items-center justify-between gap-3 sm:mb-6 lg:mb-7">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 md:hidden"
              >
                <Menu size={19} strokeWidth={2} />
              </button>

              <div className="min-w-0">
                <h1 className="truncate bg-gradient-to-r from-slate-900 via-blue-700 to-violet-700 bg-clip-text text-[1rem] font-bold leading-tight text-transparent sm:text-[1.35rem] md:text-[1.75rem] lg:text-[2.1rem]">
                  {isMobile
                    ? "CI Dashboard"
                    : "Craft International Institute Dashboard"}
                </h1>

                <p className="mt-1 text-[0.68rem] font-medium text-slate-500 sm:text-sm">
                  {currentDate}
                </p>
              </div>
            </div>
          </header>

          {/* --------------------------------------------------
              Fee Collection Overview
          -------------------------------------------------- */}

          <FeeCollectionOverview
            feeSummaryData={feeSummaryData}
            isLoading={feeSummaryLoading}
            classWiseData={classWiseStudentData}
            showClassWise={true}
          />

          {/* --------------------------------------------------
              Tabs
          -------------------------------------------------- */}

          <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:mb-6">
            <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50/70 p-1 sm:p-1.5">
              <button
                type="button"
                onClick={() => handleTabChange(null, 0)}
                className={`flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition sm:min-h-11 sm:px-4 sm:text-sm ${
                  activeTab === 0
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                }`}
              >
                <LayoutDashboard size={17} strokeWidth={1.9} />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange(null, 1)}
                className={`flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition sm:min-h-11 sm:px-4 sm:text-sm ${
                  activeTab === 1
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                }`}
              >
                <Wallet size={17} strokeWidth={1.9} />
                <span>Accounting</span>
              </button>
            </div>
          </div>

          {/* --------------------------------------------------
              Tab Panels
          -------------------------------------------------- */}

          {activeTab === 0 && (
            <OverviewTab
              stats={stats}
              isLoading={isLoading}
              classWiseData={classWiseStudentData}
            />
          )}

          {activeTab === 1 && (
            <AccountingTab
              accountingStats={accountingStats}
              accountingLoading={accountingLoading}
            />
          )}

          {/* --------------------------------------------------
              Quick Access Modules
          -------------------------------------------------- */}

          <section className="mb-2">
            <div className="mb-3 flex items-center gap-2 sm:mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 sm:h-9 sm:w-9">
                <LayoutDashboard
                  size={17}
                  strokeWidth={1.9}
                  className="sm:h-[19px] sm:w-[19px]"
                />
              </div>

              <h2 className="text-base font-bold tracking-tight text-slate-800 sm:text-xl md:text-2xl">
                Quick Access Modules
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-4">
              {modules.map((module) => (
                <ModuleCard
                  key={module.path}
                  title={module.title}
                  description={module.description}
                  icon={module.icon}
                  color={module.color}
                  onClick={() => navigateToModule(module.path)}
                  loading={isLoading}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
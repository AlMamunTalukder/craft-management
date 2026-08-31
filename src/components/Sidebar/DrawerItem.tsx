import { NavigationItem } from "@/types/common";
import {
  LayoutDashboard,
  Globe,
  LayoutList,
  GraduationCap,
  BookOpen,
  FilePlus,
  CalendarDays,
  NotebookPen,
  UserCheck,
  Clock,
  CircleCheck,
  RotateCcw,
  BarChart3,
  PiggyBank,
  ClipboardCheck,
  ClipboardList,
  Library,
  FileText,
  Target,
  ListChecks,
  BookMarked,
  Bookmark,
  Award,
  BadgeCheck,
  Users,
  UserPlus,
  List,
  Receipt,
  IdCard,
  CalendarX,
  Megaphone,
  LayoutGrid,
  BellPlus,
  MessageSquare,
  Utensils,
  ListOrdered,
  PlusCircle,
  CreditCard,
  Tag,
  Calculator,
  CheckCheck,
  TrendingUp,
  TrendingDown,
  Wallet,
  GitBranch,
  DollarSign,
  ShieldCheck,
  Settings,
  Database,
  KeyRound,
  Trash2,
  Cloud,
  School,
  Building2,
  ScrollText,
  Contact,
} from "lucide-react";
import { ColorfulIcon } from "./ColorfulIcon";

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    icon: (
      <ColorfulIcon color="#6366f1">
        <LayoutDashboard size={17} />
      </ColorfulIcon>
    ),
    path: "/dashboard",
    roles: [
      "admin",
      "teacher",
      "student",
      "super_admin",
      "class_teacher",
      "accountant",
    ],
  },

  {
    title: "Website",
    icon: (
      <ColorfulIcon color="#0ea5e9">
        <Globe size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin"],
    children: [
      {
        title: "Sections",
        icon: (
          <ColorfulIcon color="#0ea5e9" size={28}>
            <LayoutList size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/classes/section/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Classes",
        icon: (
          <ColorfulIcon color="#0ea5e9" size={28}>
            <GraduationCap size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/classes/class",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Subjects",
        icon: (
          <ColorfulIcon color="#0ea5e9" size={28}>
            <BookOpen size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/subject",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },

      {
        title: "New Report",
        icon: (
          <ColorfulIcon color="#0ea5e9" size={28}>
            <FilePlus size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/classes/report/new",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Class Routine",
        icon: (
          <ColorfulIcon color="#0ea5e9" size={28}>
            <CalendarDays size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/class-routine",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
    ],
  },

  {
    title: "Admissions",
    icon: (
      <ColorfulIcon color="#f59e0b">
        <NotebookPen size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin", "teacher"],
    children: [
      {
        title: "All Enrollments",
        icon: (
          <ColorfulIcon color="#f59e0b" size={28}>
            <UserCheck size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/enrollments/list",
        roles: ["admin", "super_admin"],
      },
      {
        title: "Pending Applications",
        icon: (
          <ColorfulIcon color="#f59e0b" size={28}>
            <Clock size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/online-application/pending",
        roles: ["admin", "super_admin"],
      },
      {
        title: "Approved Applications",
        icon: (
          <ColorfulIcon color="#f59e0b" size={28}>
            <CircleCheck size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/online-application/approved",
        roles: ["admin", "super_admin"],
      },
      {
        title: "Enrolled Applications",
        icon: (
          <ColorfulIcon color="#f59e0b" size={28}>
            <UserCheck size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/online-application/enrolled",
        roles: ["admin", "super_admin"],
      },
      {
        title: "Rejected Applications",
        icon: (
          <ColorfulIcon color="#f59e0b" size={28}>
            <RotateCcw size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/online-application/rejected",
        roles: ["admin", "super_admin"],
      },
      {
        title: "Admission Analytics",
        icon: (
          <ColorfulIcon color="#f59e0b" size={28}>
            <BarChart3 size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/admission-analytics",
        roles: ["admin", "super_admin", "teacher"],
      },
    ],
  },

  {
    title: "Discount Student",
    icon: (
      <ColorfulIcon color="#10b981">
        <PiggyBank size={17} />
      </ColorfulIcon>
    ),
    path: "/dashboard/student/discount",
    roles: ["admin", "super_admin", "teacher"],
  },
  {
    title: "Academic",
    icon: (
      <ColorfulIcon color="#8b5cf6">
        <GraduationCap size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin", "teacher"],
    children: [
      {
        title: "Sections",
        icon: (
          <ColorfulIcon color="#8b5cf6" size={28}>
            <LayoutList size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/classes/section/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Classes",
        icon: (
          <ColorfulIcon color="#8b5cf6" size={28}>
            <GraduationCap size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/classes/class",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Subjects",
        icon: (
          <ColorfulIcon color="#8b5cf6" size={28}>
            <BookOpen size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/subject",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Class Reports",
        icon: (
          <ColorfulIcon color="#8b5cf6" size={28}>
            <BarChart3 size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/classes/report/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "New Report",
        icon: (
          <ColorfulIcon color="#8b5cf6" size={28}>
            <FilePlus size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/classes/report/new",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Class Routine",
        icon: (
          <ColorfulIcon color="#8b5cf6" size={28}>
            <CalendarDays size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/class-routine",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
    ],
  },
  // Exam & Results
  {
    title: "Exam & Results",
    icon: (
      <ColorfulIcon color="#ec4899">
        <ClipboardCheck size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin", "teacher"],
    children: [
      {
        title: "Exams",
        icon: (
          <ColorfulIcon color="#ec4899" size={28}>
            <ClipboardCheck size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/exam",
        roles: ["admin", "super_admin", "teacher"],
      },
      {
        title: "Enter Marks",
        icon: (
          <ColorfulIcon color="#ec4899" size={28}>
            <NotebookPen size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/exam/marks",
        roles: ["admin", "super_admin", "teacher"],
      },
      {
        title: "Results",
        icon: (
          <ColorfulIcon color="#ec4899" size={28}>
            <ClipboardList size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/exam/result",
        roles: ["admin", "super_admin", "teacher"],
      },
    ],
  },
  // Hifz Program
  {
    title: "Hifz Program",
    icon: (
      <ColorfulIcon color="#a855f7">
        <BookOpen size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin", "teacher"],
    children: [
      {
        title: "Classes",
        icon: (
          <ColorfulIcon color="#a855f7" size={28}>
            <GraduationCap size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/hifz/class/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Hifz Subjects",
        icon: (
          <ColorfulIcon color="#a855f7" size={28}>
            <Library size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/hifz/subject/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Soboki Daily Report Add",
        icon: (
          <ColorfulIcon color="#a855f7" size={28}>
            <FilePlus size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/hifz/daily-report/soboki/add",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Soboki Daily Report List",
        icon: (
          <ColorfulIcon color="#a855f7" size={28}>
            <FileText size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/hifz/daily-report/soboki/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Sunani Daily Report Add",
        icon: (
          <ColorfulIcon color="#a855f7" size={28}>
            <FilePlus size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/hifz/daily-report/sunani/add",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Sunani Daily Report List",
        icon: (
          <ColorfulIcon color="#a855f7" size={28}>
            <FileText size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/hifz/daily-report/sunani/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Weekly Target List",
        icon: (
          <ColorfulIcon color="#a855f7" size={28}>
            <Target size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/hifz/weeklytarget/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Weekly Target Add",
        icon: (
          <ColorfulIcon color="#a855f7" size={28}>
            <ListChecks size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/hifz/weeklytarget/add",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
    ],
  },
  {
    title: "Ampara",
    icon: (
      <ColorfulIcon color="#059669">
        <BookMarked size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin", "teacher"],
    children: [
      {
        title: "Daily Report List",
        icon: (
          <ColorfulIcon color="#059669" size={28}>
            <FileText size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/ampara/daily-report/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Daily Report Add",
        icon: (
          <ColorfulIcon color="#059669" size={28}>
            <FilePlus size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/ampara/daily-report/add",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Weekly Report List",
        icon: (
          <ColorfulIcon color="#059669" size={28}>
            <BarChart3 size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/ampara/weekly-report/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Weekly Report Add",
        icon: (
          <ColorfulIcon color="#059669" size={28}>
            <PlusCircle size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/ampara/weekly-report/add",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
    ],
  },
  {
    title: "Nazera",
    icon: (
      <ColorfulIcon color="#f97316">
        <BookMarked size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin", "teacher"],
    children: [
      {
        title: "Daily Report List",
        icon: (
          <ColorfulIcon color="#f97316" size={28}>
            <FileText size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/nazera/daily-report/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Daily Report Add",
        icon: (
          <ColorfulIcon color="#f97316" size={28}>
            <FilePlus size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/nazera/daily-report/add",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Weekly Report List",
        icon: (
          <ColorfulIcon color="#f97316" size={28}>
            <BarChart3 size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/nazera/weekly-report/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Weekly Report Add",
        icon: (
          <ColorfulIcon color="#f97316" size={28}>
            <PlusCircle size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/nazera/weekly-report/add",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
    ],
  },
  {
    title: "Qaida",
    icon: (
      <ColorfulIcon color="#06b6d4">
        <Bookmark size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin", "teacher"],
    children: [
      {
        title: "Daily Report List",
        icon: (
          <ColorfulIcon color="#06b6d4" size={28}>
            <FileText size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/qaida-noorani/daily-report/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Daily Report Add",
        icon: (
          <ColorfulIcon color="#06b6d4" size={28}>
            <FilePlus size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/qaida-noorani/daily-report/add",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Weekly Report Add",
        icon: (
          <ColorfulIcon color="#06b6d4" size={28}>
            <ListChecks size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/qaida-noorani/weekly-report/add",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Weekly Report List",
        icon: (
          <ColorfulIcon color="#06b6d4" size={28}>
            <Target size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/qaida-noorani/weekly-report/list",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
    ],
  },
  {
    title: "Certificates & ID Cards",
    icon: (
      <ColorfulIcon color="#dc2626">
        <Award size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin"],
    children: [
      {
        title: "Certificates",
        icon: (
          <ColorfulIcon color="#dc2626" size={28}>
            <Award size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/certificates",
        roles: ["admin", "super_admin"],
      },
      {
        title: "ID Cards",
        icon: (
          <ColorfulIcon color="#dc2626" size={28}>
            <BadgeCheck size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/id-cards",
        roles: ["admin", "super_admin"],
      },
    ],
  },
  // People
  {
    title: "People",
    icon: (
      <ColorfulIcon color="#3b82f6">
        <Users size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin", "teacher"],
    children: [
      {
        title: "Teachers",
        icon: (
          <ColorfulIcon color="#2563eb">
            <GraduationCap size={15} />
          </ColorfulIcon>
        ),
        children: [
          {
            path: "/dashboard/teacher/new",
            title: "Add Teacher",
            icon: (
              <ColorfulIcon color="#2563eb" size={28}>
                <UserPlus size={15} />
              </ColorfulIcon>
            ),
            roles: [
              "admin",
              "teacher",
              "student",
              "super_admin",
              "class_teacher",
            ],
          },
          {
            path: "/dashboard/teacher/list",
            title: "Teachers List",
            icon: (
              <ColorfulIcon color="#2563eb" size={28}>
                <List size={15} />
              </ColorfulIcon>
            ),
            roles: [
              "admin",
              "teacher",
              "student",
              "super_admin",
              "class_teacher",
            ],
          },
          {
            path: "/dashboard/teacher/daily-report/list",
            title: "Daily Reports",
            icon: (
              <ColorfulIcon color="#2563eb" size={28}>
                <Receipt size={15} />
              </ColorfulIcon>
            ),
            roles: [
              "admin",
              "teacher",
              "student",
              "super_admin",
              "class_teacher",
            ],
          },
        ],
      },
      {
        title: "Staff",
        icon: (
          <ColorfulIcon color="#7c3aed">
            <Contact size={15} />
          </ColorfulIcon>
        ),
        children: [
          {
            path: "/dashboard/staff/add",
            title: "Add Staff",
            icon: (
              <ColorfulIcon color="#7c3aed" size={28}>
                <UserPlus size={15} />
              </ColorfulIcon>
            ),
            roles: [
              "admin",
              "teacher",
              "student",
              "super_admin",
              "class_teacher",
            ],
          },
          {
            path: "/dashboard/staff/list",
            title: "Staff List",
            icon: (
              <ColorfulIcon color="#7c3aed" size={28}>
                <List size={15} />
              </ColorfulIcon>
            ),
            roles: [
              "admin",
              "teacher",
              "student",
              "super_admin",
              "class_teacher",
            ],
          },
        ],
      },
      {
        title: "Students",
        icon: (
          <ColorfulIcon color="#0ea5e9">
            <Users size={15} />
          </ColorfulIcon>
        ),
        children: [
          {
            path: "/dashboard/student/list",
            title: "Students List",
            icon: (
              <ColorfulIcon color="#0ea5e9" size={28}>
                <List size={15} />
              </ColorfulIcon>
            ),
            roles: [
              "admin",
              "teacher",
              "student",
              "super_admin",
              "class_teacher",
            ],
          },
        ],
      },
    ],
  },

  {
    title: "HR Management",
    icon: (
      <ColorfulIcon color="#0e7490">
        <Users size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin"],
    children: [
      {
        title: "Leaves",
        icon: (
          <ColorfulIcon color="#0e7490" size={28}>
            <CalendarX size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/leaves",
        roles: ["admin", "super_admin"],
      },
      {
        title: "Payslips",
        icon: (
          <ColorfulIcon color="#0e7490" size={28}>
            <Receipt size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/payslips",
        roles: ["admin", "super_admin", "accountant"],
      },
    ],
  },
  {
    title: "Assets & Inventory",
    icon: (
      <ColorfulIcon color="#475569">
        <Building2 size={17} />
      </ColorfulIcon>
    ),
    path: "/dashboard/assets",
    roles: ["admin", "super_admin", "accountant"],
  },

  {
    title: "Communications",
    icon: (
      <ColorfulIcon color="#7c3aed">
        <Megaphone size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin"],
    children: [
      {
        title: "Notice Board",
        icon: (
          <ColorfulIcon color="#7c3aed" size={28}>
            <LayoutGrid size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/notice-board",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Notifications",
        icon: (
          <ColorfulIcon color="#7c3aed" size={28}>
            <BellPlus size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/notification",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        title: "Feedback",
        icon: (
          <ColorfulIcon color="#7c3aed" size={28}>
            <MessageSquare size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/feedback",
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
    ],
  },
  // Meal Management
  {
    title: "Meal Management",
    icon: (
      <ColorfulIcon color="#e11d48">
        <Utensils size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin"],
    children: [
      {
        path: "/dashboard/daily-meal-report",
        title: "Meal Reports",
        icon: (
          <ColorfulIcon color="#e11d48" size={28}>
            <ListOrdered size={15} />
          </ColorfulIcon>
        ),
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        path: "/dashboard/daily-meal-report/add",
        title: "Add Meal Report",
        icon: (
          <ColorfulIcon color="#e11d48" size={28}>
            <PlusCircle size={15} />
          </ColorfulIcon>
        ),
        roles: ["admin", "teacher", "student", "super_admin", "class_teacher"],
      },
      {
        path: "/dashboard/fees/meal-balance",
        title: " Meal Balance",
        icon: <ColorfulIcon color="#e11d48" size={28}><Utensils size={15} /></ColorfulIcon>,
        roles: ["admin", "super_admin", "accountant"],
      },
    ],
  },

  {
    title: "Fees Management",
    icon: (
      <ColorfulIcon color="#0d9488">
        <CreditCard size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin", "accountant"],
    children: [
      {
        path: "/dashboard/fees/list",
        title: "All Fees",
        icon: <ColorfulIcon color="#0d9488" size={28}><Tag size={15} /></ColorfulIcon>,
        roles: ["admin", "super_admin", "accountant"],
      },
      {
        path: "/dashboard/fees/summary",
        title: "Fee Summary",
        icon: <ColorfulIcon color="#0d9488" size={28}><ScrollText size={15} /></ColorfulIcon>,
        roles: ["admin", "super_admin", "accountant"],
      },
      {
        path: "/dashboard/fees/category",
        title: "Fee Categories",
        icon: <ColorfulIcon color="#0d9488" size={28}><Tag size={15} /></ColorfulIcon>,
        roles: ["admin", "super_admin", "accountant"],
      },
      {
        path: "/dashboard/fees/fee-collection",
        title: "Fee Collection",
        icon: <ColorfulIcon color="#0d9488" size={28}><Wallet size={15} /></ColorfulIcon>,
        roles: ["admin", "super_admin", "accountant"],
      },
      {
        path: "/dashboard/fees/generate",
        title: "Generate Fees",
        icon: <ColorfulIcon color="#f59e0b" size={28}><Calculator size={15} /></ColorfulIcon>,
        roles: ["admin", "super_admin", "accountant"],
      },

    ],
  },
  {
    title: "Accounting",
    icon: (
      <ColorfulIcon color="#16a34a">
        <CheckCheck size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin", "accountant"],
    children: [
      {
        title: "Income",
        icon: (
          <ColorfulIcon color="#16a34a" size={28}>
            <TrendingUp size={15} />
          </ColorfulIcon>
        ),
        children: [
          {
            path: "/dashboard/accounting/residantial/list",
            title: "Residential ",
            icon: (
              <ColorfulIcon color="#16a34a" size={28}>
                <Tag size={15} />
              </ColorfulIcon>
            ),
            roles: ["admin", "super_admin"],
          },
          {
            path: "/dashboard/accounting/income",
            title: "Income Records",
            icon: (
              <ColorfulIcon color="#16a34a" size={28}>
                <Wallet size={15} />
              </ColorfulIcon>
            ),
            roles: ["admin", "super_admin"],
          },
          {
            path: "/dashboard/accounting/income/category",
            title: "Income Categories",
            icon: (
              <ColorfulIcon color="#16a34a" size={28}>
                <Tag size={15} />
              </ColorfulIcon>
            ),
            roles: ["admin", "super_admin"],
          },
        ],
      },
      {
        title: "Expenses",
        icon: (
          <ColorfulIcon color="#dc2626" size={28}>
            <TrendingDown size={15} />
          </ColorfulIcon>
        ),
        children: [
          {
            path: "/dashboard/accounting/expense",
            title: "Expense Records",
            icon: (
              <ColorfulIcon color="#dc2626" size={28}>
                <Receipt size={15} />
              </ColorfulIcon>
            ),
            roles: ["admin", "super_admin"],
          },
          {
            path: "/dashboard/accounting/salary-expense",
            title: "Salary",
            icon: (
              <ColorfulIcon color="#dc2626" size={28}>
                <Receipt size={15} />
              </ColorfulIcon>
            ),
            roles: ["admin", "super_admin"],
          },
          {
            path: "/dashboard/accounting/residantial",
            title: "Residential",
            icon: (
              <ColorfulIcon color="#dc2626" size={28}>
                <Receipt size={15} />
              </ColorfulIcon>
            ),
            roles: ["admin", "super_admin"],
          },
          {
            path: "/dashboard/accounting/expense/category",
            title: "Expense Categories",
            icon: (
              <ColorfulIcon color="#dc2626" size={28}>
                <Tag size={15} />
              </ColorfulIcon>
            ),
            roles: ["admin", "super_admin"],
          },
        ],
      },
      {
        path: "/dashboard/accounting/total-expense-category",
        title: "Income & Expense Summary",
        icon: (
          <ColorfulIcon color="#f59e0b" size={28}>
            <GitBranch size={15} />
          </ColorfulIcon>
        ),
        roles: ["admin", "super_admin"],
      },
      {
        path: "/dashboard/accounting/investments",
        title: "Investments",
        icon: (
          <ColorfulIcon color="#0288d1" size={28}>
            <PiggyBank size={15} />
          </ColorfulIcon>
        ),
        roles: ["admin", "super_admin"],
      },
      {
        path: "/dashboard/accounting/loan",
        title: "Loans",
        icon: (
          <ColorfulIcon color="#7c3aed" size={28}>
            <CreditCard size={15} />
          </ColorfulIcon>
        ),
        roles: ["admin", "super_admin"],
      },
      {
        path: "/dashboard/accounting/salary",
        title: "Salary Management",
        icon: (
          <ColorfulIcon color="#2563eb" size={28}>
            <DollarSign size={15} />
          </ColorfulIcon>
        ),
        roles: ["admin", "super_admin"],
      },
      {
        path: "/dashboard/accounting/fees",
        title: "Student Fees ",
        icon: (
          <ColorfulIcon color="#16a34a" size={28}>
            <Tag size={15} />
          </ColorfulIcon>
        ),
        roles: ["admin", "super_admin"],
      },
      {
        path: "/dashboard/accounting/fee-collection",
        title: "Fee Collections",
        icon: (
          <ColorfulIcon color="#0f766e" size={28}>
            <Calculator size={15} />
          </ColorfulIcon>
        ),
        roles: ["admin", "super_admin"],
      },
    ],
  },

  {
    title: "User Management",
    icon: (
      <ColorfulIcon color="#64748b">
        <ShieldCheck size={17} />
      </ColorfulIcon>
    ),
    path: "/dashboard/user-management",
    roles: ["admin", "super_admin"],
  },
  {
    title: "System",
    icon: (
      <ColorfulIcon color="#334155">
        <Settings size={17} />
      </ColorfulIcon>
    ),
    roles: ["admin", "super_admin"],
    children: [
      {
        title: "Database",
        icon: (
          <ColorfulIcon color="#334155" size={28}>
            <Database size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/database-backup",
        roles: ["admin", "super_admin"],
      },
      {
        title: "Security",
        icon: (
          <ColorfulIcon color="#334155" size={28}>
            <KeyRound size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/security",
        roles: ["admin", "super_admin"],
      },
      {
        title: "Trash",
        icon: (
          <ColorfulIcon color="#334155" size={28}>
            <Trash2 size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/trash",
        roles: ["admin", "super_admin"],
      },
      {
        title: "Backup",
        icon: (
          <ColorfulIcon color="#334155" size={28}>
            <Cloud size={15} />
          </ColorfulIcon>
        ),
        path: "/dashboard/backup",
        roles: ["admin", "super_admin"],
      },
    ],
  },
];

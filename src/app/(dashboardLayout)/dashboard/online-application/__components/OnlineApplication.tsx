/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { LoadingState } from "@/components/common/LoadingState";
import CraftTable from "@/components/Table";
import { TAdmissionStatus } from "@/interface/admission";
import { Column, RowAction } from "@/interface/table";
import { classOrder } from "@/options";
import {
  useDeleteAdmissionApplicationMutation,
  useGetAllAdmissionApplicationsQuery,
  useUpdateAdmissionApplicationMutation,
} from "@/redux/api/admissionApplication";
import { AdmissionApplicationListProps, ApplicationRow } from "@/types/apply";
import { formatDate, formatShortDate } from "@/utils/formateDate";
import { generatePDFFromData } from "@/utils/pdfGenerator";
import {
  CalendarToday,
  Cancel,
  CheckCircle,
  Delete,
  Edit,
  HowToReg,
  Pending,
  Phone,
  PictureAsPdf,
  Restore,
  School,
  Visibility,
} from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Chip,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { AdmissionDetailModal } from "./AdmissionDetailModal";

const mapApplicationToFormData = (app: any): Record<string, any> => {
  const student = app.studentInfo || {};
  const parent = app.parentInfo || {};
  const father = parent.father || {};
  const mother = parent.mother || {};
  const academic = app.academicInfo || {};
  const addr = app.address || {};

  const present = addr.present || addr.presentAddress || {};
  const permanent = addr.permanent || addr.permanentAddress || {};

  const family = app.familyEnvironment || {};
  const behavior = app.behaviorSkills || {};
  const docs = app.documents || {};

  // Map profession to pdfGenerator expected values
  const mapProfession = (prof: string, type: "father" | "mother"): string => {
    if (!prof) return "";
    const p = prof.toLowerCase();
    const fatherMap: Record<string, string> = {
      teacher: "teacher",
      doctor: "doctor",
      engineer: "engineer",
      business: "business",
      govt_job: "govt_job",
      private_job: "private_job",
      expatriate: "expatriate",
      lawyer: "lawyer",
      farmer: "farmer",
      driver: "driver",
      others: "others",
      গুরু: "teacher",
      ডাক্তার: "doctor",
      ইঞ্জিনিয়ার: "engineer",
      ব্যবসায়ী: "business",
      "সরকারী চাকরিজীবি": "govt_job",
      "বেসরকারী চাকরিজীবি": "private_job",
      প্রবাসী: "expatriate",
      উকিল: "lawyer",
      কৃষক: "farmer",
      চালক: "driver",
      অন্যান্য: "others",
    };
    const motherMap: Record<string, string> = {
      housewife: "Housewife",
      teacher: "teacher",
      doctor: "doctor",
      engineer: "engineer",
      business: "business",
      govt_job: "govt_job",
      private_job: "private_job",
      lawyer: "lawyer",
      others: "others",
      গৃহিণী: "Housewife",
      শিক্ষকা: "teacher",
      ডাক্তার: "doctor",
      ইঞ্জিনিয়ার: "engineer",
      ব্যবসায়ী: "business",
      "সরকারি চাকরিজীবি": "govt_job",
      "বেসরকারী চাকরিজীবি": "private_job",
      উকিল: "lawyer",
      অন্যান্য: "others",
    };
    const map = type === "father" ? fatherMap : motherMap;
    return map[p] || p;
  };

  return {
    // Student
    StudentName: student.nameBangla || "",
    studentName: student.nameEnglish || "",
    studentPhoto: student.studentPhoto || "",
    gender: student.gender || "",
    dateOfBirth: student.dateOfBirth || "",
    Age: student.age || "",
    nidBirth: student.nidBirth || student.birthCertificate || "",
    studentDepartment: student.department || "",
    Class: academic.class || student.class || "",
    bloodGroup: student.bloodGroup || "",
    session: academic.session || student.session || "",
    nationality: student.nationality || "",
    category: (app as any).category || student.category || "Residential",
    rollNumber: student.rollNumber || student.roll || "",
    section: student.section || "",
    group: student.group || "",
    optionalSubject: student.optionalSubject || "",
    shift: student.shift || "",

    FatherNameBangla: father.nameBangla || "",
    FatherName: father.nameEnglish || "",
    FatherJob: mapProfession(
      father.profession || father.occupation || "",
      "father",
    ),
    FatherMobile: father.mobile || "",
    FatherWhatsapp: father.whatsapp || "",
    FatherNid: father.nid || father.nidBirth || "",
    FatherIncome: father.income || 0,
    FatherEducation: father.education || "",

    MotherNameBangla: mother.nameBangla || "",
    MotherName: mother.nameEnglish || "",
    MotherJob: mapProfession(
      mother.profession || mother.occupation || "",
      "mother",
    ),
    MotherMobile: mother.mobile || "",
    MotherWhatsapp: mother.whatsapp || "",
    MotherNid: mother.nid || mother.nidBirth || "",
    MotherIncome: mother.income || 0,
    MotherEducation: mother.education || "",

    guardianNameBangla: parent.guardian?.nameBangla || "",
    guardianName: parent.guardian?.nameEnglish || "",
    guardianRelation: parent.guardian?.relation || "",
    guardianMobile: parent.guardian?.mobile || "",
    guardianWhatsapp: parent.guardian?.whatsapp || "",
    guardianJob: parent.guardian?.profession || "",
    guardianAddress: parent.guardian?.address || "",

    village: present.village || "",
    postOffice: present.postOffice || "",
    postCode: present.postCode || "",
    policeStation: present.policeStation || "",
    district: present.district || "",

    permVillage: permanent.village || "",
    permPostOffice: permanent.postOffice || "",
    permPostCode: permanent.postCode || "",
    permPoliceStation: permanent.policeStation || "",
    permDistrict: permanent.district || "",

    // Family environment
    HalalIncome: family.halalIncome || "",
    Purdah: family.purdah || "",
    ParentsPrayer: family.parentsPrayer || "",
    TV: family.tv || "",
    Addiction: family.addiction || "",
    QuranRecitation: family.quranRecitation || "",

    // Behavior
    StudyInterest: behavior.studyInterest || "",
    AngerControl: behavior.angerControl || "",
    MobileUsage: behavior.mobileUsage || "",
    GeneralBehavior: behavior.generalBehavior || "",
    Obedience: behavior.obedience || "",
    ElderBehavior: behavior.elderBehavior || "",
    YoungerBehavior: behavior.youngerBehavior || "",
    LyingStubbornness: behavior.lyingStubbornness || "",
    ReligiousInterest: behavior.religiousInterest || "",

    // Academic - UPDATED: previousClass (DB field is previousClass, not prevClass)
    PrevSchool: academic.previousSchool || academic.prevSchool || "",
    PrevClass: academic.previousClass || academic.prevClass || "",
    GPA: academic.gpa || academic.GPA || "",

    // Documents
    photographs: docs.photographs || false,
    birthCertificate: docs.birthCertificate || false,
    markSheet: docs.markSheet || false,
    transferCertificate: docs.transferCertificate || false,
    characterCertificate: docs.characterCertificate || false,

    termsAccepted: app.termsAccepted || false,
  };
};

const StatusChip = ({ status }: { status: TAdmissionStatus }) => {
  const statusConfig: Record<
    string,
    {
      color: "success" | "warning" | "error" | "info" | "default" | "secondary";
      icon: JSX.Element;
      label: string;
    }
  > = {
    pending: {
      color: "warning",
      icon: <Pending sx={{ fontSize: 16 }} />,
      label: "Pending",
    },
    approved: {
      color: "success",
      icon: <CheckCircle sx={{ fontSize: 16 }} />,
      label: "Approved",
    },
    rejected: {
      color: "error",
      icon: <Cancel sx={{ fontSize: 16 }} />,
      label: "Rejected",
    },
    enrolled: {
      color: "secondary",
      icon: <HowToReg sx={{ fontSize: 16 }} />,
      label: "Enrolled",
    },
  };
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color as any}
      size="small"
      sx={{
        fontWeight: 600,
        borderRadius: "8px",
        minWidth: { xs: 80, sm: 100 },
        "& .MuiChip-icon": { fontSize: 16 },
        "& .MuiChip-label": { px: { xs: 1, sm: 2 } },
      }}
    />
  );
};

const DepartmentChip = ({ department }: { department: string }) => {
  const colors: Record<string, string> = {
    hifz: "#8B5CF6",
    academic: "#3B82F6",
    nazera: "#10B981",
    tajbid: "#F59E0B",
  };
  const labels: Record<string, string> = {
    hifz: "হিফজ",
    academic: "একাডেমিক",
    nazera: "নাজেরা",
    tajbid: "তাজবীদ",
  };
  const color = colors[department] || "#6B7280";
  return (
    <Chip
      label={labels[department] || department || "N/A"}
      size="small"
      sx={{
        backgroundColor: `${color}20`,
        color,
        fontWeight: 600,
        borderRadius: "8px",
        border: `1px solid ${color}30`,
        minWidth: { xs: 70, sm: 90 },
        "& .MuiChip-label": { px: { xs: 1, sm: 1.5 } },
      }}
    />
  );
};

const StudentAvatar = ({ name, photo }: { name: string; photo?: string }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
    <Avatar
      src={photo}
      sx={{
        width: { xs: 32, sm: 40 },
        height: { xs: 32, sm: 40 },
        bgcolor: (t) => t.palette.primary.main,
        fontSize: { xs: "0.875rem", sm: "1rem" },
        fontWeight: 600,
      }}
    >
      {name?.charAt(0) || "S"}
    </Avatar>
    <Typography
      variant="body2"
      fontWeight={500}
      noWrap
      sx={{
        maxWidth: { xs: 100, sm: 150, md: 200 },
        fontSize: { xs: "0.75rem", sm: "0.875rem" },
      }}
    >
      {name}
    </Typography>
  </Box>
);

const MobileNumber = ({ number }: { number: string }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    <Phone sx={{ fontSize: { xs: 14, sm: 16 }, color: "text.secondary" }} />
    <Typography
      variant="body2"
      sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
    >
      {number || "N/A"}
    </Typography>
  </Box>
);

const DateDisplay = ({ date }: { date?: string }) => {
  if (!date) return <Typography variant="body2">N/A</Typography>;
  return (
    <Tooltip title={formatDate(date)} arrow>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
        <Typography
          variant="body2"
          sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
        >
          {formatShortDate(date)}
        </Typography>
      </Box>
    </Tooltip>
  );
};

function extractClassName(item: any): string {
  if (item.studentInfo?.class) {
    if (
      typeof item.studentInfo.class === "object" &&
      item.studentInfo.class?.className
    )
      return item.studentInfo.class.className;
    if (typeof item.studentInfo.class === "string")
      return item.studentInfo.class;
  }
  if (item.academicInfo?.class) return item.academicInfo.class;
  if (item.class) return item.class;
  return "N/A";
}

export default function AdmissionApplicationList({
  type,
}: AdmissionApplicationListProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [updateApplication, { isLoading: isUpdating }] =
    useUpdateAdmissionApplicationMutation();
  const [deleteAdmissionApplication, { isLoading: isDeleting }] =
    useDeleteAdmissionApplicationMutation();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : isTablet ? 8 : 10);
  }, [isMobile, isTablet]);

  const queryParams = useMemo(() => {
    const params: any = { limit: 1000, page: 1 };
    if (type === "pending") params.status = "pending";
    if (type === "approved") params.status = "approved";
    if (type === "rejected") params.status = "rejected";
    if (type === "enrolled") params.status = "enrolled";
    params.sort = "-createdAt";
    return params;
  }, [type]);

  const { data, isLoading, refetch } =
    useGetAllAdmissionApplicationsQuery(queryParams);

  const tableData: any = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((item: any): any => {
      const cls = extractClassName(item);
      return {
        _id: item._id,
        applicationId: item.applicationId ?? "",
        status: item.status ?? "",
        academicYear: item.academicYear ?? String(new Date().getFullYear()),
        nameBangla: item.studentInfo?.nameBangla ?? "",
        nameEnglish: item.studentInfo?.nameEnglish ?? "",
        studentPhoto: item.studentInfo?.studentPhoto,
        department: item.studentInfo?.department ?? "",
        class: cls,
        _classFlat: cls,
        mobile: item.parentInfo?.father?.mobile ?? "",
        fatherMobile: item.parentInfo?.father?.mobile ?? "",
        studentInfo: item.studentInfo,
        parentInfo: item.parentInfo,
        academicInfo: item.academicInfo,
        address: item.address,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        original: item,
      };
    });
  }, [data]);

  // ─── Class filter options with the exact order from ALL_CLASSES ─────────────
  const classFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { label: string; value: string }[] = [];
    tableData.forEach((r: ApplicationRow) => {
      if (r.class && r.class !== "N/A" && !seen.has(r.class)) {
        seen.add(r.class);
        opts.push({ label: r.class, value: r.class });
      }
    });

    return opts.sort((a, b) => {
      const indexA = classOrder.indexOf(a.value);
      const indexB = classOrder.indexOf(b.value);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.label.localeCompare(b.label);
    });
  }, [tableData]);

  const totalCount = data?.meta?.total ?? tableData.length;

  const handleView = useCallback((row: ApplicationRow) => {
    setModalLoading(true);
    setSelectedApplication((row as any).original);
    setModalOpen(true);
    setTimeout(() => setModalLoading(false), 500);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => setSelectedApplication(null), 300);
  }, []);

  const handleEdit = useCallback(
    (row: ApplicationRow) => {
      if (!row?._id) {
        Swal.fire("Error", "Application ID not found", "error");
        return;
      }

      router.push(
        `/dashboard/online-application/edit?id=${row._id}&from=${type}`,
      );
    },
    [router, type],
  );

  const handleDelete = useCallback(
    async (row: ApplicationRow) => {
      if (!row?._id) return;
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });
      if (result.isConfirmed) {
        try {
          await deleteAdmissionApplication(row._id).unwrap();
          Swal.fire("Deleted!", "Application has been deleted.", "success");
          refetch();
        } catch (error: any) {
          Swal.fire(
            "Failed!",
            error?.data?.message || "Failed to delete",
            "error",
          );
        }
      }
    },
    [deleteAdmissionApplication, refetch],
  );

  const handleDownloadPDF = useCallback(async (row: ApplicationRow) => {
    Swal.fire({
      title: "Generating PDF...",
      text: "Please wait",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const original = (row as any).original;

      const formData = mapApplicationToFormData(original);
      const studentId =
        row.applicationId || row._id?.slice(-6).toUpperCase() || "STU";

      await generatePDFFromData(formData, studentId);
      Swal.close();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "PDF Generation Failed",
        text: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }, []);

  const handleUpdateStatus = useCallback(
    async (
      row: ApplicationRow,
      newStatus: "approved" | "rejected" | "pending",
    ) => {
      if (!row?._id) return;
      const isApproving = newStatus === "approved";
      const isRejecting = newStatus === "rejected";
      const confirmButtonColor = isApproving
        ? "#10B981"
        : isRejecting
          ? "#d33"
          : "#F59E0B";
      const title = isApproving
        ? "Approve Application?"
        : isRejecting
          ? "Reject Application?"
          : "Restore to Pending?";
      const confirmButtonText = isApproving
        ? "Yes, Approve!"
        : isRejecting
          ? "Yes, Reject!"
          : "Yes, Restore!";

      const result = await Swal.fire({
        title,
        text: `Are you sure you want to move this application to ${newStatus}?`,
        icon: isApproving ? "question" : isRejecting ? "warning" : "info",
        showCancelButton: true,
        confirmButtonColor,
        cancelButtonColor: "#3085d6",
        confirmButtonText,
      });
      if (!result.isConfirmed) return;

      try {
        await updateApplication({
          id: row._id,
          data: { status: newStatus },
        }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Application has been ${newStatus === "pending" ? "restored to pending" : newStatus}.`,
          timer: 1500,
          showConfirmButton: false,
        });
        if (isApproving) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "approvedApplication",
              JSON.stringify({
                id: row._id,
                applicationId: row.applicationId,
                studentName: row.nameBangla || row.nameEnglish,
                department: row.department,
                class: row.class,
                studentInfo: row.studentInfo,
                parentInfo: row.parentInfo,
              }),
            );
          }
          router.push(
            `/dashboard/enrollments?applicationId=${row.applicationId}`,
          );
        } else {
          refetch();
        }
      } catch (error: any) {
        console.error("Status update failed:", error);
        Swal.fire(
          "Failed!",
          error?.data?.message || "Failed to update status",
          "error",
        );
      }
    },
    [updateApplication, refetch, router],
  );

  const handleApprove = useCallback(
    (row: ApplicationRow) => handleUpdateStatus(row, "approved"),
    [handleUpdateStatus],
  );
  const handleReject = useCallback(
    (row: ApplicationRow) => handleUpdateStatus(row, "rejected"),
    [handleUpdateStatus],
  );
  const handleRestore = useCallback(
    (row: ApplicationRow) => handleUpdateStatus(row, "pending"),
    [handleUpdateStatus],
  );

  const handleEnroll = useCallback(
    (row: ApplicationRow) => {
      if (!row?.applicationId) {
        Swal.fire("Error", "Application ID not found", "error");
        return;
      }
      router.push(`/dashboard/enrollments?applicationId=${row.applicationId}`);
    },
    [router],
  );

  const columns: Column[] = useMemo(() => {
    const cols: Column[] = [
      {
        id: "nameBangla",
        label: "Student",
        minWidth: isMobile ? 150 : 250,
        sortable: true,
        filterable: true,
        render: (row: ApplicationRow) => (
          <StudentAvatar
            name={row.nameBangla || row.nameEnglish}
            photo={row.studentPhoto}
          />
        ),
      },
      {
        id: "applicationId",
        label: "OA. ID",
        minWidth: isMobile ? 80 : 120,
        sortable: true,
        filterable: true,
        render: (row: ApplicationRow) => (
          <Typography
            variant="body2"
            fontWeight={600}
            color="primary"
            sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
          >
            {row.applicationId || row._id?.slice(-6).toUpperCase()}
          </Typography>
        ),
      },
      {
        id: "createdAt",
        label: "Application Date",
        minWidth: isMobile ? 100 : 140,
        sortable: true,
        render: (row: ApplicationRow) => <DateDisplay date={row.createdAt} />,
      },
      {
        id: "department",
        label: "Department",
        minWidth: isMobile ? 80 : 120,
        sortable: true,
        filterable: true,
        filterOptions: [
          { label: "হিফজ", value: "hifz" },
          { label: "একাডেমিক", value: "academic" },
          { label: "নাজেরা", value: "nazera" },
          { label: "তাজবীদ", value: "tajbid" },
        ],
        render: (row: ApplicationRow) => (
          <DepartmentChip department={row.department} />
        ),
      },
      {
        id: "_classFlat",
        label: "Class",
        minWidth: isMobile ? 70 : 100,
        sortable: true,
        filterable: true,
        filterOptions: classFilterOptions,
        render: (row: ApplicationRow) => (
          <Typography
            variant="body2"
            sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
          >
            {row.class}
          </Typography>
        ),
      },
      {
        id: "status",
        label: "Status",
        minWidth: isMobile ? 90 : 120,
        sortable: true,
        filterable: true,
        filterOptions: [
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "Enrolled", value: "enrolled" },
        ],
        render: (row: ApplicationRow) => (
          <StatusChip status={row.status as TAdmissionStatus} />
        ),
      },
    ];

    if (!isMobile) {
      cols.push({
        id: "mobile",
        label: "Mobile",
        minWidth: isTablet ? 120 : 140,
        sortable: true,
        filterable: true,
        render: (row: ApplicationRow) => (
          <MobileNumber number={row.mobile || row.fatherMobile} />
        ),
      });
    }
    return cols;
  }, [isMobile, isTablet, classFilterOptions]);

  const rowActions: RowAction[] = useMemo(() => {
    const baseActions: RowAction[] = [
      {
        label: "View",
        icon: <Visibility fontSize="small" />,
        onClick: handleView,
        tooltip: "View details",
        color: "info",
        inMenu: isMobile,
        alwaysShow: !isMobile,
      },
      {
        label: "Edit",
        icon: <Edit fontSize="small" />,
        onClick: handleEdit,
        tooltip: "Edit application",
        color: "primary",
        inMenu: isMobile,
        alwaysShow: !isMobile,
      },
      {
        label: "Download PDF",
        icon: <PictureAsPdf fontSize="small" />,
        onClick: handleDownloadPDF,
        tooltip: "Download as PDF",
        color: "secondary",
        inMenu: true,
      },
      {
        label: "Delete",
        icon: <Delete fontSize="small" />,
        onClick: handleDelete,
        tooltip: "Delete application",
        color: "error",
        inMenu: false,
        alwaysShow: true,
        disabled: () => isDeleting || isUpdating,
      },
    ];

    if (type === "pending") {
      return [
        ...baseActions,
        {
          label: "Approve",
          icon: <CheckCircle fontSize="small" />,
          onClick: handleApprove,
          tooltip: "Approve & go to enrollment",
          color: "success",
          inMenu: true,
        },
        {
          label: "Reject",
          icon: <Cancel fontSize="small" />,
          onClick: handleReject,
          tooltip: "Reject application",
          color: "error",
          inMenu: true,
        },
      ];
    } else if (type === "approved") {
      return [
        ...baseActions,
        {
          label: "Enroll",
          icon: <HowToReg fontSize="small" />,
          onClick: handleEnroll,
          tooltip: "Proceed to enrollment",
          color: "success",
          inMenu: false,
          alwaysShow: true,
        },
        {
          label: "Reject",
          icon: <Cancel fontSize="small" />,
          onClick: handleReject,
          tooltip: "Reject application",
          color: "error",
          inMenu: true,
        },
        {
          label: "Restore to Pending",
          icon: <Restore fontSize="small" />,
          onClick: handleRestore,
          tooltip: "Move back to pending",
          color: "warning",
          inMenu: true,
          disabled: (row: ApplicationRow) =>
            row.status !== "approved" || isUpdating || isDeleting,
        },
      ];
    } else if (type === "rejected") {
      return [
        ...baseActions,
        {
          label: "Restore to Pending",
          icon: <Restore fontSize="small" />,
          onClick: handleRestore,
          tooltip: "Restore to pending",
          color: "warning",
          inMenu: true,
        },
        {
          label: "Approve",
          icon: <CheckCircle fontSize="small" />,
          onClick: handleApprove,
          tooltip: "Approve & go to enrollment",
          color: "success",
          inMenu: true,
        },
      ];
    } else {
      return [...baseActions];
    }
  }, [
    type,
    isMobile,
    isUpdating,
    isDeleting,
    handleView,
    handleEdit,
    handleDelete,
    handleApprove,
    handleReject,
    handleRestore,
    handleEnroll,
    handleDownloadPDF,
  ]);

  const getHeaderBanner = () => {
    const bannerConfig = {
      pending: {
        palette: theme.palette.warning,
        Icon: Pending,
        title: "Pending Applications",
        subtitle: "These applications are waiting for review",
        chipLabel: `Total Pending: ${totalCount}`,

        BtnIcon: School,
      },
      approved: {
        palette: theme.palette.success,
        Icon: CheckCircle,
        title: "Approved Applications",
        subtitle: "These students are approved and ready for enrollment",
        chipLabel: `Total Approved: ${totalCount}`,
        btnLabel: "New Enrollment",
        btnRoute: "/dashboard/enrollments/new",
        BtnIcon: School,
      },
      rejected: {
        palette: theme.palette.error,
        Icon: Cancel,
        title: "Rejected Applications",
        subtitle: "These applications have been rejected",
        chipLabel: `Total Rejected: ${totalCount}`,
        btnLabel: "Back to Pending",
        btnRoute: "/dashboard/online-application",
        BtnIcon: Restore,
      },
      enrolled: {
        palette: theme.palette.secondary,
        Icon: HowToReg,
        title: "Enrolled Applications",
        subtitle: "These students have been successfully enrolled",
        chipLabel: `Total Enrolled: ${totalCount}`,
        btnLabel: "View All Enrollments",
        btnRoute: "/dashboard/enrollments",
        BtnIcon: School,
      },
    }[type] ?? {
      palette: theme.palette.warning,
      Icon: Pending,
      title: "",
      subtitle: "",
      chipLabel: "",
      btnLabel: "",
      btnRoute: "/",
      BtnIcon: School,
    };

    const {
      palette,
      Icon,
      title,
      subtitle,
      chipLabel,
      btnLabel,
      btnRoute,
      BtnIcon,
    } = bannerConfig;
    const color = (
      type === "pending"
        ? "warning"
        : type === "approved"
          ? "success"
          : type === "rejected"
            ? "error"
            : "secondary"
    ) as any;

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(palette.main, 0.08)} 0%, ${alpha(palette.light, 0.04)} 100%)`,
          border: `1px solid ${alpha(palette.main, 0.25)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(palette.main, 0.15),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ color: `${color}.main`, fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color={`${color}.dark`}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip
            icon={<Icon />}
            label={chipLabel}
            color={color}
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Paper>
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>{getHeaderBanner()}</Box>

      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, height: "100%", width: "100%" }}>
        <CraftTable
          title={
            type === "pending"
              ? "Pending Applications"
              : type === "approved"
                ? "Approved Applications"
                : type === "rejected"
                  ? "Rejected Applications"
                  : "Enrolled Applications"
          }
          subtitle={`Total ${totalCount} ${type} applications`}
          emptyStateMessage={`No ${type} applications found`}
          columns={columns}
          data={tableData}
          loading={isLoading}
          idField="_id"
          pagination={true}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n);
            setPage(0);
          }}
          searchable={true}
          sortable={true}
          serverSideSorting={false}
          filterable={true}
          rowActions={rowActions}
          onRefresh={refetch}
          onAdd={
            type === "pending"
              ? () => router.push("/dashboard/online-application/new")
              : undefined
          }
          selectable={
            type === "pending" || type === "rejected" || type === "approved"
          }
          dense={isMobile}
          striped={true}
          hover={true}
          showRowNumbers={!isMobile}
          showToolbar={true}
          maxHeight="calc(100vh - 200px)"
          actionColumnWidth={isMobile ? 100 : 140}
          actionMenuLabel={isMobile ? "" : "Actions"}
          elevation={2}
          borderRadius={3}
        />
      </Box>

      <AdmissionDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        application={selectedApplication}
        loading={modalLoading}
      />
    </>
  );
}

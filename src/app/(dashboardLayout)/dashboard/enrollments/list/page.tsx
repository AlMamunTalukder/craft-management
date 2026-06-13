/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import Table, { BulkAction, Column, RowAction } from "@/components/Table";
import { useAcademicOption } from "@/hooks/useAcademicOption";
import {
  useDeleteEnrollmentMutation,
  useGetAllEnrollmentsQuery,
} from "@/redux/api/enrollmentApi";
import {
  Add,
  ArrowForward,
  AttachMoney,
  Delete,
  Edit,
  FileDownload,
  History,
  Person,
  Refresh,
  RestartAlt,
  Visibility,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import EnrollmentDetailsModal from "../__components/EnrollmentDetailsModal";
import PromotionHistoryModal from "../__components/PromotionHistoryModal";
import PromotionModal from "../__components/PromotionModal";
import RetainModal from "../__components/RetainModal";
import { sortClassOptions } from "@/options/classReport";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "success";
    case "inactive":
      return "error";
    case "passed":
      return "info";
    case "failed":
      return "warning";
    case "left":
      return "default";
    default:
      return "default";
  }
};

const getAdmissionTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "admission":
      return "primary";
    case "promotion":
      return "success";
    default:
      return "default";
  }
};

export default function EnrollmentsPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [selectedStudentForHistory, setSelectedStudentForHistory] =
    useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [promotionHistoryModalOpen, setPromotionHistoryModalOpen] =
    useState(false);
  const [retainModalOpen, setRetainModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);

  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : isTablet ? 8 : 10);
  }, [isMobile, isTablet]);

  const {
    data: enrollmentData,
    isLoading,
    error,
    refetch,
  } = useGetAllEnrollmentsQuery({});
  const [deleteEnrollment] = useDeleteEnrollmentMutation();
  const { classOptions } = useAcademicOption();

  const tableData = useMemo(() => {
    if (!enrollmentData?.data?.data || !Array.isArray(enrollmentData.data.data))
      return [];

    return enrollmentData.data.data.map((enrollment: any) => ({
      id: enrollment._id,
      enrollmentId: enrollment._id,
      studentId: enrollment.studentId || enrollment.student?.studentId,
      studentName: enrollment.studentName || enrollment.student?.name,
      studentNameBangla: enrollment.nameBangla || enrollment.student?.nameBangla,
      fatherName: enrollment.parentInfo?.father?.nameEnglish || enrollment.student?.parentInfo?.father?.nameEnglish,
      fatherNameBangla: enrollment.parentInfo?.father?.nameBangla,
      motherName: enrollment.parentInfo?.mother?.nameEnglish,
      motherNameBangla: enrollment.parentInfo?.mother?.nameBangla,
      fatherIncome: enrollment.parentInfo?.father?.income || 0,
      motherIncome: enrollment.parentInfo?.mother?.income || 0,
      fatherNid: enrollment.parentInfo?.father?.nid || "N/A",
      motherNid: enrollment.parentInfo?.mother?.nid || "N/A",
      mobileNo: enrollment.mobileNo || enrollment.student?.mobile || enrollment.parentInfo?.father?.mobile,
      guardianInfo: enrollment.parentInfo?.guardian || { name: "N/A", relation: "N/A", mobile: "N/A" },
      birthDate: enrollment.birthDate ? new Date(enrollment.birthDate).toLocaleDateString() :
        enrollment.student?.birthDate ? new Date(enrollment.student.birthDate).toLocaleDateString() : "N/A",
      nationality: enrollment.nationality || enrollment.student?.nationality || "Bangladeshi",
      className: enrollment.className?.className || "N/A",
      studentDepartment: enrollment.studentDepartment || enrollment.student?.studentDepartment || "N/A",
      studentType: enrollment.studentType || enrollment.student?.studentType || "N/A",
      status: enrollment.status || "active",
      admissionType: enrollment.admissionType || "admission",
      presentAddress: enrollment.presentAddress || enrollment.student?.presentAddress || {},
      permanentAddress: enrollment.permanentAddress || enrollment.student?.permanentAddress || {},
      documents: enrollment.documents || enrollment.student?.documents || {},
      termsAccepted: enrollment.termsAccepted || enrollment.student?.termsAccepted || false,
      fees: enrollment.fees || enrollment.student?.fees || [],
      rawData: enrollment,
      student: enrollment.student,
      parentInfo: enrollment.parentInfo,
      familyEnvironment: enrollment.familyEnvironment || enrollment.student?.familyEnvironment || {},
      behaviorSkills: enrollment.behaviorSkills || enrollment.student?.behaviorSkills || {},
      previousSchool: enrollment.previousSchool || enrollment.student?.previousSchool || {},
      bloodGroup: enrollment.bloodGroup || enrollment.student?.bloodGroup || "N/A",
      birthRegistrationNo: enrollment.birthRegistrationNo || enrollment.student?.birthRegistrationNo || "N/A",
    }));
  }, [enrollmentData]);

  const classFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { label: string; value: string }[] = [];

    tableData.forEach((r: any) => {
      if (r.className && r.className !== "N/A" && !seen.has(r.className)) {
        seen.add(r.className);
        opts.push({ label: r.className, value: r.className });
      }
    });

    return sortClassOptions(opts);
  }, [tableData]);

  const columns: Column[] = useMemo(() => {
    const cols: Column[] = [
      {
        id: "studentName",
        label: "Student",
        minWidth: isMobile ? 160 : 220,
        sortable: true,
        filterable: true,
        render: (row: any) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 2 },
            }}
          >
            <Avatar
              sx={{
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                bgcolor: "primary.main",
              }}
            >
              <Person />
            </Avatar>
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                {row.studentName}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
              >
                ID: {row.studentId}
              </Typography>
              <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                <Chip
                  label={row.admissionType}
                  size="small"
                  color={getAdmissionTypeColor(row.admissionType) as any}
                  variant="outlined"
                  sx={{ height: 18, fontSize: "0.6rem" }}
                />
                {row.rawData?.promotedFrom && (
                  <Chip
                    label="Promoted"
                    size="small"
                    color="success"
                    icon={
                      <ArrowForward sx={{ fontSize: "0.75rem !important" }} />
                    }
                    sx={{ height: 18, fontSize: "0.6rem" }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        ),
      },
      {
        id: "className",
        label: "Class & Dept",
        minWidth: isMobile ? 100 : 180,
        sortable: true,
        filterable: true,
        filterOptions: classFilterOptions,
        render: (row: any) => (
          <Box>
            <Typography
              variant="body2"
              fontWeight="medium"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              {row.className}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
            >
              {row.studentDepartment} • {row.studentType}
            </Typography>
            <Chip
              label={row.status}
              size="small"
              color={getStatusColor(row.status) as any}
              sx={{ mt: 0.5, height: 20, fontSize: "0.65rem" }}
            />
          </Box>
        ),
      },
    ];

    if (!isMobile) {
      cols.push({
        id: "mobileNo",
        label: "Contact",
        minWidth: isTablet ? 120 : 140,
        sortable: true,
        filterable: true,
        render: (row: any) => (
          <Box>
            <Typography variant="body2">{row.mobileNo}</Typography>
            <Typography variant="caption" color="text.secondary">
              Father: {row.fatherName}
            </Typography>
          </Box>
        ),
      });
    }

    cols.push({
      id: "admissionType",
      label: "Type",
      minWidth: 90,
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "Admission", value: "admission" },
        { label: "Promotion", value: "promotion" },
      ],
      render: (row: any) => (
        <Chip
          label={row.admissionType}
          size="small"
          color={getAdmissionTypeColor(row.admissionType) as any}
          variant={row.admissionType === "promotion" ? "filled" : "outlined"}
          icon={
            row.admissionType === "promotion" ? (
              <ArrowForward fontSize="small" />
            ) : undefined
          }
        />
      ),
    });

    return cols;
  }, [isMobile, isTablet, classFilterOptions]);

  // Row action
  const rowActions: RowAction[] = useMemo(
    () => [
      {
        label: "View Details",
        icon: <Visibility fontSize="small" />,
        onClick: (row) => {
          setSelectedEnrollment(row);
          setDetailDialogOpen(true);
        },
        tooltip: "View Details",
        color: "info",
        inMenu: isMobile,
        alwaysShow: !isMobile,
      },
      {
        label: "Edit",
        icon: <Edit fontSize="small" />,
        onClick: (row) => {
          router.push(`/dashboard/enrollments?id=${row.id}`);
        },
        tooltip: "Edit Enrollment",
        color: "primary",
        inMenu: isMobile,
        alwaysShow: !isMobile,
      },
      {
        label: "Promotion History",
        icon: <History fontSize="small" />,
        onClick: (row) => {
          setSelectedStudentForHistory({
            id: row.rawData?.student?._id || row.id,
            name: row.studentName,
          });
          setPromotionHistoryModalOpen(true);
        },
        tooltip: "View Promotion History",
        color: "info",
        inMenu: true,
      },
      {
        label: "Delete",
        icon: <Delete fontSize="small" />,
        onClick: (row) => {
          Swal.fire({
            title: "Are you sure?",
            html: `You are about to delete <strong>${row.studentName}</strong>'s enrollment. This cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
          }).then((result) => {
            if (result.isConfirmed) {
              deleteEnrollment(row.id)
                .unwrap()
                .then(() => {
                  Swal.fire({
                    title: "Deleted!",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                  });
                  refetch();
                })
                .catch((err) => {
                  Swal.fire({
                    title: "Error!",
                    text: err.data?.message || "Failed to delete.",
                    icon: "error",
                  });
                });
            }
          });
        },
        color: "error",
        tooltip: "Delete Enrollment",
        alwaysShow: true,
        disabled: (row) => row.admissionType === "promotion",
      },
    ],
    [isMobile, router, deleteEnrollment, refetch],
  );


  // Custom toolbar
  const customToolbar = (
    <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">

      <Button
        variant="outlined"
        startIcon={<ArrowForward />}
        onClick={() => setPromotionModalOpen(true)}
        color="success"
        size="small"
      >
        Promote
      </Button>
      <Button
        variant="outlined"
        startIcon={<RestartAlt />}
        onClick={() => setRetainModalOpen(true)}
        color="warning"
        size="small"
      >
        Retain
      </Button>
      <Box flexGrow={1} />
      <Button
        variant="outlined"
        startIcon={<Refresh />}
        onClick={() => refetch()}
        size="small"
      >
        Refresh
      </Button>
    </Box>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  function handleCloseDetails() {
    setDetailDialogOpen(false);
    setSelectedEnrollment(null);
    setActiveTab(0);
  }

  function handleEditEnrollment(enrollment: any) {
    handleCloseDetails();
    router.push(`/dashboard/enrollments?id=${enrollment.id}`);
  }
  function handleCollectFee(enrollment: any) {
    handleCloseDetails();
    setSelectedEnrollment(enrollment);

  }

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        backgroundColor: "grey.50",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ p: { xs: 0, sm: 1 } }}>
        <Table
          title="Enrollments"
          emptyStateMessage="No enrollments found"
          columns={columns}
          data={tableData}
          loading={isLoading}
          error={
            error
              ? "Error loading enrollment data. Please try again."
              : undefined
          }
          idField="id"
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
          selectable={true}
          customToolbar={customToolbar}
          showToolbar={true}
          dense={isMobile}
          striped={true}
          hover={true}
          showRowNumbers={!isMobile}
          actionColumnWidth={isMobile ? 100 : 140}
          actionMenuLabel={isMobile ? "" : "Actions"}
          elevation={2}
          borderRadius={3}
        />
      </Box>
      <EnrollmentDetailsModal
        open={detailDialogOpen}
        setOpen={handleCloseDetails}
        enrollment={selectedEnrollment}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onEdit={handleEditEnrollment}
        onCollectFee={handleCollectFee}
      />
      <PromotionModal
        open={promotionModalOpen}
        onClose={() => setPromotionModalOpen(false)}
        classOptions={classOptions}
      />
      <RetainModal
        open={retainModalOpen}
        onClose={() => setRetainModalOpen(false)}
        classOptions={classOptions}
      />
      <PromotionHistoryModal
        open={promotionHistoryModalOpen}
        onClose={() => setPromotionHistoryModalOpen(false)}
        studentId={selectedStudentForHistory?.id}
        studentName={selectedStudentForHistory?.name}
      />
    </Box>
  );
}
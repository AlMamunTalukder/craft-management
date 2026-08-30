/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type { Teacher, TeacherStatus } from "@/interface";
import {
  useDeleteTeacherMutation,
  useGetAllTeachersQuery,
} from "@/redux/api/teacherApi";
import {
  Delete,
  Edit,
  Mail as MailIcon,
  Phone,
  Visibility,
} from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Chip,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Column, RowAction } from "@/interface/table";
import CraftTable from "@/components/Table";

export default function TeacherList() {
  const theme = useTheme();
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [filterDepartment, setFilterDepartment] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const {
    data: teacherData,
    isLoading,
    refetch,
  } = useGetAllTeachersQuery({
    limit: rowsPerPage,
    page: page + 1,
    searchTerm: searchTerm,
    sort: 'teacherSerial',
  });

  const [deleteTeacher] = useDeleteTeacherMutation();

  useEffect(() => {
    if (teacherData && teacherData.data && !isLoading) {
      const formattedTeachers = teacherData.data
        .map(
          (teacher: any, index: number) => {
            let department = "Not Specified";
            if (teacher.department) {
              department = teacher.department;
            } else if (teacher.professionalInfo?.department) {
              department = teacher.professionalInfo.department;
            }

            const teacherName = teacher.englishName || teacher.name || "Unknown";

            const status =
              teacher.status?.toLowerCase() === "active" ||
                teacher.additionalInfo?.status?.toLowerCase() === "active"
                ? ("Active" as TeacherStatus)
                : ("Inactive" as TeacherStatus);
            const experience = calculateExperience(
              teacher.joiningDate || teacher.professionalInfo?.joiningDate,
            );

            return {
              id: index + 1,
              _id: teacher._id,
              name: teacherName,
              teacherPhoto: teacher.teacherPhoto || "",
              department: department,
              status: status,
              email: teacher.email || "Not Available",
              phone: teacher.phone || "Not Available",
              subjects: [],
              classes: [],
              experience: experience,
              rating: "4.5",
              performance: 85,
              students: 120,
              joinDate: new Date(
                teacher.joiningDate ||
                teacher.professionalInfo?.joiningDate ||
                teacher.createdAt,
              ).toLocaleDateString(),
              qualifications:
                teacher.designation ||
                teacher.professionalInfo?.designation ||
                "Teacher",
              teacherId: teacher.teacherId || "",
              teacherSerial: teacher.teacherSerial || "",
            };
          },
        )
        .sort((a: any, b: any) => {
          const aHas = !!a.teacherSerial;
          const bHas = !!b.teacherSerial;
          if (aHas && !bHas) return -1;
          if (!aHas && bHas) return 1;
          if (!aHas && !bHas) return 0;
          const aNum = parseInt(String(a.teacherSerial), 10);
          const bNum = parseInt(String(b.teacherSerial), 10);
          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
          return String(a.teacherSerial).localeCompare(String(b.teacherSerial), 'en', { numeric: true });
        })
        .map((t: any, idx: number) => ({ ...t, id: idx + 1 }));

      setTeachers(formattedTeachers);
    }
  }, [teacherData, isLoading]);

  const calculateExperience = (joiningDate: string | undefined) => {
    if (!joiningDate) return 0;
    const joinDate = new Date(joiningDate);
    const now = new Date();
    const yearsDiff = Math.floor(
      (now.getTime() - joinDate.getTime()) / (365 * 24 * 60 * 60 * 1000),
    );
    return yearsDiff >= 0 ? yearsDiff : 0;
  };

  const handleViewTeacher = (teacher: Teacher) => {
    router.push(`/dashboard/teacher/profile/${teacher._id}`);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    router.push(`/dashboard/teacher/update/${teacher._id}`);
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You want to delete ${teacher.name}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await deleteTeacher(teacher._id).unwrap();

        Swal.fire({
          title: "Deleted!",
          text: `${teacher.name} has been deleted successfully.`,
          icon: "success",
        });

        refetch();
      }
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.data?.message || "Failed to delete teacher",
        icon: "error",
      });
    }
  };

  const handleSortChange = (column: string, direction: "asc" | "desc") => {
    setSortColumn(column);
    setSortDirection(direction);
    setPage(0);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(0);
  };


  const getFilteredData = () => {
    if (filterDepartment === "all") return teachers;
    return teachers.filter(
      (teacher) => teacher.department === filterDepartment,
    );
  };

  const columns: Column[] = [
    {
      id: "teacherSerial",
      label: "Serial No",
      minWidth: 180,
      sortable: true,
      render: (row: any) => (
        <Box>
          <Typography variant="body1" fontWeight={600}>
            {row.teacherSerial}
          </Typography>
        </Box>
      ),
    },
    {
      id: "teacherPhoto",
      label: "Photo",
      minWidth: 70,
      align: "center",
      type: "avatar",
      sortable: false,
      render: (row: any) => (
        <Avatar
          src={row.teacherPhoto}
          sx={{
            width: 48,
            height: 48,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            boxShadow: theme.shadows[1],
            mx: "auto",
          }}
        >
          {row.name.charAt(0)}
        </Avatar>
      ),
    },
    {
      id: "name",
      label: "Teacher Name",
      minWidth: 180,
      sortable: true,
      render: (row: any) => (
        <Box>
          <Typography variant="body1" fontWeight={600}>
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {row.teacherId}
          </Typography>
        </Box>
      ),
    },

    {
      id: "department",
      label: "Department",
      minWidth: 140,
      sortable: true,
      render: (row: any) => (
        <Typography variant="body2" fontWeight={500}>
          {row.department}
        </Typography>
      ),
    },
    {
      id: "qualifications",
      label: "Qualification",
      minWidth: 150,
      sortable: false,
      render: (row: any) => (
        <Box>
          <Typography variant="body2">{row.qualifications}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.experience} years exp.
          </Typography>
        </Box>
      ),
    },
    {
      id: "email",
      label: "Contact",
      minWidth: 200,
      sortable: false,
      render: (row: any) => (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <MailIcon fontSize="small" color="action" />
            <Typography variant="body2" noWrap>
              {row.email}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Phone fontSize="small" color="action" />
            <Typography variant="body2">{row.phone}</Typography>
          </Box>
        </Box>
      ),
    },
  ];

  const rowActions: RowAction[] = [
    {
      label: "View",
      icon: <Visibility fontSize="small" />,
      onClick: (row: any) => handleViewTeacher(row),
      tooltip: "View Profile",
      color: "info",
    },
    {
      label: "Edit",
      icon: <Edit fontSize="small" />,
      onClick: (row: any) => handleEditTeacher(row),
      tooltip: "Edit Teacher",
      color: "warning",
    },
    {
      label: "Delete",
      icon: <Delete fontSize="small" />,
      onClick: (row: any) => handleDeleteTeacher(row),
      tooltip: "Delete Teacher",
      color: "error",
    },
  ];
  const handleAddTeacher = () => {
    window.location.href = "/dashboard/teacher/new";
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Container maxWidth="xl" sx={{ p: { xs: "4px", mt: 4 } }}>
        <CraftTable
          title="Teachers Management"
          columns={columns}
          data={getFilteredData()}
          loading={isLoading}
          rowActions={rowActions}
          searchable={true}
          filterable={true}
          sortable={true}
          onAdd={handleAddTeacher}
          pagination={true}
          selectable={true}
          onSortChange={handleSortChange}
          onSearchChange={handleSearchChange}
          idField="_id"
          defaultSortColumn="teacherSerial"
          defaultSortDirection="asc"
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
          emptyStateMessage="No teachers found matching your search criteria"
          showRowNumbers={false}
          actionColumnWidth={140}
          actionMenuLabel="Actions"
          elevation={2}
          borderRadius={3}
          dense={false}
          striped={true}
          hover={true}
          stickyHeader={true}
          serverSideSorting={true}
        />


      </Container>
    </Box>
  );
}
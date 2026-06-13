/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";


import {
  useDeleteStaffMutation,
  useGetAllStaffQuery,
} from "@/redux/api/staffApi";
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
import CraftTable, { Column, RowAction } from "@/components/Table";
import FileDownloadIcon from "@mui/icons-material/FileDownload";



export default function StaffList() {
  const theme = useTheme();
  const router = useRouter();
  const [staffs, setStaffs] = useState<any[]>([]);

  // Filters
  const [filterDepartment, setFilterDepartment] = useState("all");

  // Pagination & Search
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Build sort string for backend
  const getSortString = () => {
    if (!sortColumn) return "-createdAt";
    return sortDirection === "desc" ? `-${sortColumn}` : sortColumn;
  };

  const {
    data: staffData,
    isLoading,
    refetch,
  } = useGetAllStaffQuery({
    limit: rowsPerPage,
    page: page + 1,
    searchTerm: searchTerm,
    sort: getSortString(),
  });

  const [deleteStaff] = useDeleteStaffMutation();

  useEffect(() => {
    if (staffData && staffData.data && !isLoading) {
      const formattedStaffs = staffData.data.map(
        (staff: any, index: number) => {
          // Handle Department logic: staffDepartment or department
          const department = staff.staffDepartment || staff.department || "Not Specified";

          // Handle Designation logic
          const designation = staff.designation || staff.staffType || "Staff";

          const status =
            staff.status?.toLowerCase() === "active"
              ? ("Active" as any)
              : ("Inactive" as any);

          return {
            id: index + 1,
            _id: staff._id,
            name: staff.name || "Unknown",
            staffPhoto: staff.staffPhoto || "",
            department: department,
            designation: designation,
            status: status,
            email: staff.email || "Not Available",
            phone: staff.phone || "Not Available",
            staffId: staff.staffId || "",
            joinDate: staff.joiningDate
              ? new Date(staff.joiningDate).toLocaleDateString()
              : "Not Available",
            monthlySalary: staff.monthlySalary || 0,
          };
        },
      );

      setStaffs(formattedStaffs);
    }
  }, [staffData, isLoading]);

  const handleViewStaff = (staff: any) => {
  };

  const handleEditStaff = (staff: any) => {
    router.push(`/dashboard/staff/update/${staff._id}`);
  };

  const handleDeleteStaff = async (staff: any) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You want to delete ${staff.name}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await deleteStaff(staff._id).unwrap();

        Swal.fire({
          title: "Deleted!",
          text: `${staff.name} has been deleted successfully.`,
          icon: "success",
        });

        refetch();
      }
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.data?.message || "Failed to delete staff",
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


  // Filter data locally only for the Department Chips (Search & Sort are server-side)
  const getFilteredData = () => {
    if (filterDepartment === "all") return staffs;
    return staffs.filter((staff) => staff.department === filterDepartment);
  };

  const columns: Column[] = [
    {
      id: "staffPhoto",
      label: "Photo",
      minWidth: 70,
      align: "center",
      type: "avatar",
      sortable: false,
      render: (row: any) => (
        <Avatar
          src={row.staffPhoto}
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
      label: "Staff Name",
      minWidth: 180,
      sortable: true,
      render: (row: any) => (
        <Box>
          <Typography variant="body1" fontWeight={600}>
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {row.staffId}
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
      id: "designation",
      label: "Role / Designation",
      minWidth: 150,
      sortable: false,
      render: (row: any) => (
        <Box>
          <Typography variant="body2">{row.designation}</Typography>
          <Typography variant="caption" color="text.secondary">
            Joined: {row.joinDate}
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
      onClick: (row: any) => handleViewStaff(row),
      tooltip: "View Profile",
      color: "info",
    },
    {
      label: "Edit",
      icon: <Edit fontSize="small" />,
      onClick: (row: any) => handleEditStaff(row),
      tooltip: "Edit Staff",
      color: "warning",
    },
    {
      label: "Delete",
      icon: <Delete fontSize="small" />,
      onClick: (row: any) => handleDeleteStaff(row),
      tooltip: "Delete Staff",
      color: "error",
    },
  ];

  const handleAddStaff = () => {
    window.location.href = "/dashboard/staff/new";
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Container maxWidth="xl" sx={{ p: { xs: "4px", mt: 4 } }}>
        <CraftTable
          title="Staff Management"
          columns={columns}
          data={getFilteredData()}
          loading={isLoading}
          rowActions={rowActions}
          searchable={true}
          filterable={true}
          sortable={true}
          onAdd={handleAddStaff}
          pagination={true}
          selectable={true}
          onSortChange={handleSortChange}
          onSearchChange={handleSearchChange}
          idField="_id"
          defaultSortColumn="createdAt"
          defaultSortDirection="desc"
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
          emptyStateMessage="No staff found matching your search criteria"
          showRowNumbers={true}
          rowNumberHeader="SN"
          actionColumnWidth={140}
          actionMenuLabel="Actions"
          elevation={2}
          borderRadius={3}
          dense={false}
          striped={true}
          hover={true}
          stickyHeader={true}
          serverSideSorting={true}
          bulkActions={[
            {
              label: "Export Selected",
              icon: <FileDownloadIcon />,
              onClick: (selectedRows) => {
                console.log("Export selected rows:", selectedRows);
              },
            },
          ]}
        />


      </Container>
    </Box>
  );
}
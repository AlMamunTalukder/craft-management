/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Box,
  Grid,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Container,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Search,
  Add,
  School,
  CardGiftcard,
  Edit,
  MonetizationOn,
  AccountBalance,
  Delete,
} from "@mui/icons-material";
import { GlassCard } from "@/style/customStyle";
import Swal from "sweetalert2";
import { TExpense } from "@/interface";
import AddExpenseModal from "../_components/AddExpenseModal";
import { useGetAllExpenseCategoriesQuery } from "@/redux/api/expenseCategoryApi";
import {
  useDeleteExpenseMutation,
  useGetAllExpensesQuery,
} from "@/redux/api/expenseApi";

export default function ExpenseManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editData, setEditData] = useState<TExpense | null>(null);
  const [deleteIncome] = useDeleteExpenseMutation();
  const { data, isLoading } = useGetAllExpensesQuery({});
  const expenseRecords = data?.data?.expenses || [];
  const { data: expenseCategories } = useGetAllExpenseCategoriesQuery({});

  const handleDeleteIncome = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You want to delete this Expense?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await deleteIncome(id).unwrap();

        Swal.fire({
          title: "Deleted!",
          text: `Expense has been deleted successfully.`,
          icon: "success",
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.data?.message || "Failed to delete Expense",
        icon: "error",
      });
    }
  };

  const getStatusChip = (status: string) => {
    const statusLower = status?.toLowerCase() || "completed";

    switch (statusLower) {
      case "received":
      case "completed":
        return (
          <Chip
            size="small"
            label={status}
            sx={{
              bgcolor: "#e8f5e8",
              color: "#2e7d32",
              fontWeight: 600,
              borderRadius: "20px",
              textTransform: "capitalize",
            }}
          />
        );

      case "pending":
        return (
          <Chip
            size="small"
            label={status}
            sx={{
              bgcolor: "#fff3e0",
              color: "#f57c00",
              fontWeight: 600,
              borderRadius: "20px",
              textTransform: "capitalize",
            }}
          />
        );

      case "overdue":
        return (
          <Chip
            size="small"
            label={status}
            sx={{
              bgcolor: "#ffebee",
              color: "#d32f2f",
              fontWeight: 600,
              borderRadius: "20px",
              textTransform: "capitalize",
            }}
          />
        );

      default:
        return (
          <Chip
            size="small"
            label={status}
            sx={{
              bgcolor: "#e0e0e0",
              color: "#424242",
              fontWeight: 600,
              borderRadius: "20px",
              textTransform: "capitalize",
            }}
          />
        );
    }
  };

  const formatDate = (date: string | Date | undefined | null) => {
    if (!date) return "-";
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? "-" : parsed.toLocaleDateString("en-GB");
  };

  const getIncomeIcon = (category: string) => {
    const cat = (category || "").toLowerCase();
    if (
      cat.includes("student") ||
      cat.includes("ছাত্র") ||
      cat.includes("tuition")
    ) {
      return <School />;
    } else if (cat.includes("donation") || cat.includes("দান")) {
      return <CardGiftcard />;
    } else if (cat.includes("grant") || cat.includes("অনুদান")) {
      return <AccountBalance />;
    } else {
      return <MonetizationOn />;
    }
  };

  const handleEdit = (expense: TExpense) => {
    setEditData(expense);
    setOpen(true);
  };

  const handleAddNew = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 3, textAlign: "center" }}>
          <Typography variant="body1">Loading expense data...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3 } }}>
      <Box sx={{ py: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "1.15rem", sm: "1.4rem" },
              }}
            >
              Expense Management
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
              ব্যয় ব্যবস্থাপনা - স্কুলের সকল খরচ ট্র্যাকিং ও নিয়ন্ত্রণ
            </Typography>
          </Box>
          <Button
            onClick={handleAddNew}
            variant="contained"
            startIcon={<Add />}
            size="small"
            sx={{
              alignSelf: { xs: "flex-start", sm: "center" },
              borderRadius: "10px",
              px: 2.5,
              py: 0.8,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.25)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(211, 47, 47, 0.35)",
              },
            }}
          >
            Add Expense
          </Button>
        </Box>

        <GlassCard>
          <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "0.95rem", sm: "1.1rem" },
                  }}
                >
                  Expense Records
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  }}
                >
                  খরচের বিস্তারিত রেকর্ড ({expenseRecords.length} টি এন্ট্রি)
                </Typography>
              </Box>
            </Box>

            {/* Filters */}
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="খরচের বিবরণ খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    sx={{ borderRadius: "10px" }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    {expenseCategories?.data?.data?.map(
                      (Expense: any, index: number) => (
                        <MenuItem key={index} value={Expense._id}>
                          {Expense.name}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: "10px" }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="received">Received</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="overdue">Cancel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Expense Table */}
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              <Table
                size="small"
                sx={{ minWidth: isMobile ? 480 : undefined }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", py: 1 }}>
                      Source & Description
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", py: 1 }}>
                      Amount
                    </TableCell>
                    {!isMobile && (
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", py: 1 }}>
                        Category
                      </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", py: 1 }}>
                      Date
                    </TableCell>
                    {!isMobile && (
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", py: 1 }}>
                        Status
                      </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem", py: 1 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenseRecords?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isMobile ? 4 : 6}
                        sx={{ textAlign: "center", py: 3 }}
                      >
                        <Typography variant="body1" sx={{ color: "#666" }}>
                          কোন ব্যায়ের রেকর্ড পাওয়া যায়নি
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenseRecords?.map((Expense: TExpense) => (
                      <TableRow
                        key={Expense._id}
                        hover
                        sx={{
                          "&:hover": { bgcolor: "#f8f9fa" },
                        }}
                      >
                        <TableCell sx={{ py: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: "1rem",
                                bgcolor: "#e3f2fd",
                                color: "#1976d2",
                              }}
                            >
                              {getIncomeIcon(Expense.category?.name || "")}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, lineHeight: 1.3 }}
                              >
                                {Expense.category?.name || "Other"}
                              </Typography>
                              {Expense.note && (
                                <Typography
                                  variant="caption"
                                  noWrap
                                  sx={{
                                    color: "#888",
                                    display: "block",
                                    maxWidth: 220,
                                  }}
                                >
                                  {Expense.note}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "#4CAF50" }}
                          >
                            ৳ {(Expense.totalAmount || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                        {!isMobile && (
                          <TableCell sx={{ py: 1 }}>
                            <Chip
                              label={Expense.category?.name || "Other"}
                              variant="outlined"
                              size="small"
                              sx={{
                                borderRadius: "20px",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        )}
                        <TableCell sx={{ py: 1, whiteSpace: "nowrap" }}>
                          {formatDate(Expense.expenseDate)}
                        </TableCell>
                        {!isMobile && (
                          <TableCell sx={{ py: 1 }}>
                            {getStatusChip(Expense.status || "completed")}
                          </TableCell>
                        )}
                        <TableCell sx={{ py: 1 }}>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <IconButton
                              onClick={() => handleEdit(Expense)}
                              size="small"
                              sx={{
                                bgcolor: "#e3f2fd",
                                color: "#1976d2",
                                "&:hover": { bgcolor: "#bbdefb" },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteIncome(Expense._id)}
                              size="small"
                              sx={{
                                bgcolor: "#fdecea",
                                color: "#d32f2f",
                                "&:hover": { bgcolor: "#f8d7da" },
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </GlassCard>

        <AddExpenseModal open={open} onClose={handleClose} id={editData?._id} />
      </Box>
    </Container>
  );
}

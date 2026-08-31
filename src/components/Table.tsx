/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BulkAction, Column, EnhancedTableProps, RowAction } from "@/interface/table";
import { ActionButton, GradientCard, SearchField, StyledTableHead, StyledTableRow } from "@/style/table";
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  CheckCircle,
  Clear,
  Error,
  FileDownload,
  FilterList,
  Info,
  MoreVert,
  Print,
  Refresh,
  Search,
  Sort,
  ViewColumn
} from "@mui/icons-material";
import {
  Avatar,
  Backdrop,
  Badge,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Zoom,
  alpha,
  useTheme
} from "@mui/material";
import { format } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";


const CraftTable: React.FC<EnhancedTableProps> = ({
  title,
  subtitle,
  columns,
  data,
  loading = false,
  error,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onRefresh,
  onExport,
  onPrint,
  onAdd,
  onSortChange,
  onSearchChange,
  rowActions = [],
  bulkActions = [],
  selectable = false,
  searchable = true,
  filterable = true,
  sortable = true,
  pagination = true,
  serverSideSorting = false,
  emptyStateMessage = "No data available",
  className,
  idField = "id",
  defaultSortColumn = "",
  defaultSortDirection = "asc",
  height,
  maxHeight = "70vh",
  stickyHeader = true,
  dense = false,
  striped = true,
  hover = true,
  showToolbar = true,
  customToolbar,
  elevation = 0,
  borderRadius = 3,
  cardSx = {},
  headerBackgroundColor,
  showRowNumbers = false,
  rowNumberHeader = "#",
  actionColumnWidth = 120,
  actionMenuLabel = "Actions",
  loadingOverlay = true,
  fadeIn = true,
}) => {
  const theme = useTheme();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState(defaultSortColumn || "");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    defaultSortDirection,
  );
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [currentRow, setCurrentRow] = useState<any>(null);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(
    columns.reduce(
      (acc, column) => ({ ...acc, [column.id]: column.visible !== false }),
      {},
    ),
  );
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pageState, setPageState] = useState(page);
  const [rowsPerPageState, setRowsPerPageState] = useState(rowsPerPage);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Sync with props
  useEffect(() => {
    setPageState(page);
  }, [page]);

  useEffect(() => {
    setRowsPerPageState(rowsPerPage);
  }, [rowsPerPage]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filteredData = [...data];

    // Apply search filter (only for client-side filtering when not using server-side)
    if (searchTerm && !serverSideSorting) {
      filteredData = filteredData.filter((row) =>
        columns.some((column) => {
          if (!column.visible && column.visible !== undefined) return false;
          const value = row[column.id];
          return (
            value !== null &&
            value !== undefined &&
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          );
        }),
      );
    }

    // Apply column filters (client-side only)
    if (!serverSideSorting) {
      Object.entries(filters).forEach(([columnId, filterValue]) => {
        if (filterValue) {
          filteredData = filteredData.filter((row) => {
            const value = row[columnId];
            return (
              value !== null &&
              value !== undefined &&
              String(value).toLowerCase().includes(filterValue.toLowerCase())
            );
          });
        }
      });
    }

    // Apply sorting (client-side only when not using server-side sorting)
    if (sortColumn && !serverSideSorting) {
      filteredData.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filteredData;
  }, [
    data,
    searchTerm,
    filters,
    sortColumn,
    sortDirection,
    columns,
    serverSideSorting,
  ]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination || serverSideSorting) return processedData;

    const startIndex = pageState * rowsPerPageState;
    return processedData.slice(startIndex, startIndex + rowsPerPageState);
  }, [
    processedData,
    pageState,
    rowsPerPageState,
    pagination,
    serverSideSorting,
  ]);

  // Event handlers
  const handleSort = (columnId: string) => {
    if (!sortable) return;

    const isAsc = sortColumn === columnId && sortDirection === "asc";
    const newDirection = isAsc ? "desc" : "asc";

    setSortDirection(newDirection);
    setSortColumn(columnId);

    // Call server-side sort if enabled
    if (serverSideSorting && onSortChange) {
      onSortChange(columnId, newDirection);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelectedRows = paginatedData.map((row) => row[idField]);
      setSelectedRows(newSelectedRows);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelectedRows = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelectedRows);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPageState(newPage);
    if (onPageChange) onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPageState(newRowsPerPage);
    setPageState(0);
    if (onRowsPerPageChange) onRowsPerPageChange(newRowsPerPage);
  };

  const handleFilterChange = (columnId: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnId]: value }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
    if (onSearchChange) onSearchChange("");
  };

  const handleToggleColumnVisibility = (columnId: string) => {
    setColumnVisibility((prev) => ({ ...prev, [columnId]: !prev[columnId] }));
  };

  const handleRowAction = (action: RowAction, row: any) => {
    if (action.disabled && action.disabled(row)) return;
    action.onClick(row);
  };

  const handleBulkAction = (action: BulkAction) => {
    const selectedData = data.filter((row) =>
      selectedRows.includes(row[idField]),
    );
    if (action.disabled && action.disabled(selectedData)) return;
    action.onClick(selectedData);
  };

  const handleActionMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    row: any,
  ) => {
    setActionMenuAnchor(event.currentTarget);
    setCurrentRow(row);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setCurrentRow(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debouncing
    const timeout = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(value);
      }
    }, 500);

    setSearchTimeout(timeout);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    if (onSearchChange) {
      onSearchChange("");
    }
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  };

  // Render cell content based on column type
  const renderCellContent = (column: Column, row: any) => {
    const value = row[column.id];

    if (column.render) {
      return column.render(row);
    }

    if (column.format) {
      return column.format(value);
    }

    switch (column.type) {
      case "boolean":
        return (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            {value ? (
              <CheckCircle color="success" fontSize="small" />
            ) : (
              <Error color="error" fontSize="small" />
            )}
          </Box>
        );

      case "status":
        const getStatusConfig = (status: string) => {
          switch (status?.toLowerCase()) {
            case "active":
            case "completed":
            case "success":
            case "paid":
              return { color: "success", label: status || "Active" };
            case "inactive":
            case "pending":
            case "warning":
            case "partial":
              return { color: "warning", label: status || "Pending" };
            case "error":
            case "failed":
            case "cancelled":
            case "unpaid":
              return { color: "error", label: status || "Error" };
            default:
              return { color: "default", label: status || "Unknown" };
          }
        };

        const statusConfig = getStatusConfig(value);
        return (
          <Chip
            label={statusConfig.label}
            color={statusConfig.color as any}
            size="small"
            variant="filled"
            sx={{
              fontWeight: "bold",
              borderRadius: "6px",
              boxShadow: theme.shadows[1],
            }}
          />
        );

      case "date":
        try {
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">
                {format(new Date(value), "MMM dd, yyyy")}
              </Typography>
            </Box>
          );
        } catch (e) {
          return value;
        }

      case "avatar":
        return (
          <Avatar
            sx={{
              width: 36,
              height: 36,
              boxShadow: theme.shadows[1],
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
            src={value}
          >
            {row.name?.charAt(0) || "U"}
          </Avatar>
        );

      case "progress":
        const percentage = Math.min(100, Math.max(0, Number(value) || 0));
        return (
          <Box sx={{ minWidth: 120 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              {percentage.toFixed(0)}%
            </Typography>
          </Box>
        );

      default:
        return (
          <Typography variant="body2" noWrap>
            {value}
          </Typography>
        );
    }
  };

  // Loading overlay
  if (loading && loadingOverlay) {
    return (
      <Fade in={loading}>
        <Box
          sx={{
            position: "relative",
            height: height || 400,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Backdrop
            sx={{
              color: "#fff",
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(5px)",
            }}
            open={loading}
          >
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress
                size={60}
                thickness={4}
                sx={{
                  color: theme.palette.primary.main,
                  mb: 2,
                }}
              />
              <Typography variant="h6" color="text.primary">
                Loading data...
              </Typography>
            </Box>
          </Backdrop>
        </Box>
      </Fade>
    );
  }

  // Error state
  if (error) {
    return (
      <GradientCard
        sx={{
          height,
          overflow: "hidden",
          borderRadius,
          ...cardSx,
        }}
        elevation={elevation}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: height || 400,
            p: 3,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Error color="error" sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h6" color="error" gutterBottom>
            Error loading data
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 3 }}
          >
            {error}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={onRefresh}
            sx={{
              borderRadius: "10px",
              px: 3,
              py: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            Try Again
          </Button>
        </Box>
      </GradientCard>
    );
  }

  // Separate row actions into direct buttons and menu items
  const directActions = rowActions.filter(
    (action) =>
      !action.inMenu || action.alwaysShow || action.label === "Delete",
  );
  const menuActions = rowActions.filter(
    (action) =>
      action.inMenu && action.label !== "Delete" && !action.alwaysShow,
  );

  // Calculate total rows count (for server-side pagination)
  const totalRowCount = serverSideSorting
    ? data.length > 0
      ? 1000
      : 0
    : processedData.length;

  return (
    <Fade in={true} timeout={300}>
      <GradientCard
        className={className}
        sx={{
          height,
          overflow: "hidden",
          borderRadius: 10,
          ...cardSx,
        }}
        elevation={0}
      >
        {/* Modern Toolbar */}
        {showToolbar && (
          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: `1px solid #f1f5f9`,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              alignItems: { md: "center" },
              justifyContent: "space-between",
              backgroundColor: "#ffffff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
              {title && (
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      color: "#0f172a",
                      fontSize: "1.05rem",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                    }}
                    noWrap
                  >
                    {title}
                  </Typography>
                  {subtitle && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 0.25, color: "#64748b", fontSize: "0.8125rem", lineHeight: 1.4 }}
                      noWrap
                    >
                      {subtitle}
                    </Typography>
                  )}
                </Box>
              )}
              {customToolbar}
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {searchable && (
                <SearchField
                  size="small"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          edge="end"
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 280 }}
                />
              )}

              {filterable && !serverSideSorting && (
                <Tooltip title="Filters">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      <Badge
                        badgeContent={
                          Object.keys(filters).filter((key) => filters[key])
                            .length
                        }
                        color="primary"
                        sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", minWidth: 16, height: 16 } }}
                      >
                        <FilterList sx={{ fontSize: 18 }} />
                      </Badge>
                    }
                    onClick={(e) => setFilterAnchor(e.currentTarget)}
                    sx={{
                      borderRadius: "10px",
                      borderColor: "#e2e8f0",
                      color: "#475569",
                      fontWeight: 500,
                      fontSize: "0.8125rem",
                      textTransform: "none",
                      backgroundColor: "#ffffff",
                      "&:hover": {
                        borderColor: "#cbd5e1",
                        backgroundColor: "#f8fafc",
                      },
                    }}
                  >
                    Filters
                  </Button>
                </Tooltip>
              )}

              <Tooltip title="Column settings">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ViewColumn sx={{ fontSize: 18 }} />}
                  onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
                  sx={{
                    borderRadius: "10px",
                    borderColor: "#e2e8f0",
                    color: "#475569",
                    fontWeight: 500,
                    fontSize: "0.8125rem",
                    textTransform: "none",
                    backgroundColor: "#ffffff",
                    "&:hover": {
                      borderColor: "#cbd5e1",
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  Columns
                </Button>
              </Tooltip>

              {onAdd && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Add sx={{ fontSize: 18 }} />}
                  onClick={onAdd}
                  disableElevation
                  sx={{
                    borderRadius: "10px",
                    px: 2.2,
                    py: 0.7,
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    textTransform: "none",
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    "&:hover": {
                      backgroundColor: "#1e293b",
                    },
                  }}
                >
                  Add New
                </Button>
              )}

              <Box sx={{ display: "flex", gap: 0.5 }}>
                {onRefresh && (
                  <Tooltip title="Refresh">
                    <ActionButton size="small" onClick={onRefresh}>
                      <Refresh />
                    </ActionButton>
                  </Tooltip>
                )}

                {onExport && (
                  <Tooltip title="Export">
                    <ActionButton size="small" onClick={onExport}>
                      <FileDownload />
                    </ActionButton>
                  </Tooltip>
                )}

                {onPrint && (
                  <Tooltip title="Print">
                    <ActionButton size="small" onClick={onPrint}>
                      <Print />
                    </ActionButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* Modern Bulk actions */}
        {selectable && selectedRows.length > 0 && (
          <Zoom in={selectedRows.length > 0}>
            <Paper
              sx={{
                py: 1.5,
                px: 2,
                mx: 2,
                mt: 2,
                borderRadius: "12px",
                backgroundColor: "#f8fafc",
                border: `1px solid #e2e8f0`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
              elevation={0}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle sx={{ fontSize: 16, color: "#fff" }} />
                </Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: "#0f172a", fontSize: "0.875rem" }}>
                  {selectedRows.length} selected
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {bulkActions.map((action, index) => (
                  <Button
                    key={index}
                    size="small"
                    variant="outlined"
                    startIcon={action.icon}
                    onClick={() => handleBulkAction(action)}
                    disabled={
                      action.disabled &&
                      action.disabled(
                        data.filter((row) =>
                          selectedRows.includes(row[idField]),
                        ),
                      )
                    }
                    sx={{
                      borderRadius: "8px",
                      borderColor: "#e2e8f0",
                      color: "#334155",
                      fontWeight: 500,
                      fontSize: "0.8125rem",
                      textTransform: "none",
                      backgroundColor: "#ffffff",
                      "&:hover": {
                        borderColor: "#cbd5e1",
                        backgroundColor: "#f1f5f9",
                      },
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            </Paper>
          </Zoom>
        )}

        {/* Modern Table */}
        <TableContainer sx={{ maxHeight, overflow: "auto", "&::-webkit-scrollbar": { height: 6, width: 6 }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#e2e8f0", borderRadius: 999 } }}>
          <Table stickyHeader={stickyHeader} size={dense ? "small" : "medium"} sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <StyledTableHead>
              <TableRow>
                {showRowNumbers && (
                  <TableCell
                    align="center"
                    sx={{
                      width: 48,
                      color: "#94a3b8",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  >
                    {rowNumberHeader}
                  </TableCell>
                )}
                {selectable && (
                  <TableCell
                    padding="checkbox"
                    sx={{
                      width: 48,
                    }}
                  >
                    <Checkbox
                      indeterminate={
                        selectedRows.length > 0 &&
                        selectedRows.length < paginatedData.length
                      }
                      checked={
                        paginatedData.length > 0 &&
                        selectedRows.length === paginatedData.length
                      }
                      onChange={handleSelectAll}
                      size="small"
                      sx={{
                        color: "#cbd5e1",
                        "&.Mui-checked": {
                          color: "#0f172a",
                        },
                        "&.MuiCheckbox-indeterminate": {
                          color: "#0f172a",
                        },
                        padding: 0.5,
                      }}
                    />
                  </TableCell>
                )}

                {columns.map(
                  (column) =>
                    columnVisibility[column.id] !== false && (
                      <TableCell
                        key={column.id}
                        align={column.align || "left"}
                        style={{ minWidth: column.minWidth }}
                        sortDirection={
                          sortColumn === column.id ? sortDirection : false
                        }
                        sx={{
                          cursor: column.sortable ? "pointer" : "default",
                          userSelect: "none",
                          "&:hover": column.sortable
                            ? {
                              color: "#0f172a",
                            }
                            : {},
                        }}
                        onClick={() => column.sortable && handleSort(column.id)}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            justifyContent:
                              column.align === "right"
                                ? "flex-end"
                                : column.align === "center"
                                  ? "center"
                                  : "flex-start",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                              color: sortColumn === column.id ? "#0f172a" : "#475569",
                            }}
                          >
                            {column.label}
                          </Typography>
                          {column.sortable && sortColumn === column.id ? (
                            sortDirection === "asc" ? (
                              <ArrowUpward sx={{ fontSize: 14, color: "#0f172a" }} />
                            ) : (
                              <ArrowDownward sx={{ fontSize: 14, color: "#0f172a" }} />
                            )
                          ) : column.sortable ? (
                            <Sort sx={{ fontSize: 14, color: "#cbd5e1" }} />
                          ) : null}
                        </Box>
                      </TableCell>
                    ),
                )}

                {rowActions.length > 0 && (
                  <TableCell
                    align="right"
                    sx={{
                      width: actionColumnWidth,
                      color: "#475569",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {actionMenuLabel}
                  </TableCell>
                )}
              </TableRow>
            </StyledTableHead>

            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.filter((c) => columnVisibility[c.id] !== false)
                        .length +
                      (showRowNumbers ? 1 : 0) +
                      (selectable ? 1 : 0) +
                      (rowActions.length > 0 ? 1 : 0)
                    }
                    align="center"
                    sx={{ py: 6, borderBottom: "none" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1.5,
                        py: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "12px",
                          backgroundColor: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Info sx={{ fontSize: 24, color: "#94a3b8" }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 600, fontSize: "0.875rem" }}>
                        {emptyStateMessage}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.8125rem" }}>
                        Try adjusting search or filters
                      </Typography>
                      {(searchTerm || Object.keys(filters).length > 0) && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleClearFilters}
                          sx={{
                            borderRadius: "8px",
                            mt: 1,
                          }}
                        >
                          Clear all filters
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <StyledTableRow
                    key={row[idField]}
                    selected={selectedRows.includes(row[idField])}
                    className={hover ? "MuiTableRow-hover" : ""}
                    sx={{
                      backgroundColor:
                        striped && index % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff",
                    }}
                  >
                    {showRowNumbers && (
                      <TableCell align="center" sx={{ color: "#94a3b8", fontSize: "0.8125rem" }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "#64748b", fontSize: "0.8125rem", fontWeight: 500 }}
                        >
                          {pageState * rowsPerPageState + index + 1}
                        </Typography>
                      </TableCell>
                    )}
                    {selectable && (
                      <TableCell padding="checkbox" sx={{ py: 0 }}>
                        <Checkbox
                          size="small"
                          checked={selectedRows.includes(row[idField])}
                          onChange={() => handleSelectRow(row[idField])}
                          sx={{
                            color: "#cbd5e1",
                            "&.Mui-checked": {
                              color: "#0f172a",
                            },
                            padding: 0.5,
                          }}
                        />
                      </TableCell>
                    )}

                    {columns.map(
                      (column) =>
                        columnVisibility[column.id] !== false && (
                          <TableCell
                            key={column.id}
                            align={column.align || "left"}
                            sx={{
                              py: dense ? 1 : 2,
                            }}
                          >
                            {renderCellContent(column, row)}
                          </TableCell>
                        ),
                    )}

                    {rowActions.length > 0 && (
                      <TableCell align="right" sx={{ py: dense ? 1 : 1.2, pr: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          {/* Direct action buttons */}
                          {directActions.map((action, actionIndex) => (
                            <Tooltip
                              key={actionIndex}
                              title={action.tooltip || action.label}
                            >
                              <ActionButton
                                size="small"
                                onClick={() => handleRowAction(action, row)}
                                disabled={
                                  action.disabled && action.disabled(row)
                                }
                                sx={{
                                  backgroundColor: action.color
                                    ? alpha(
                                      theme.palette[action.color].main,
                                      0.1,
                                    )
                                    : undefined,
                                  color: action.color
                                    ? theme.palette[action.color].main
                                    : undefined,
                                }}
                              >
                                {action.icon}
                              </ActionButton>
                            </Tooltip>
                          ))}

                          {/* Action menu for additional actions */}
                          {menuActions.length > 0 && (
                            <>
                              <Tooltip title="More actions">
                                <ActionButton
                                  size="small"
                                  onClick={(e) => handleActionMenuClick(e, row)}
                                >
                                  <MoreVert />
                                </ActionButton>
                              </Tooltip>
                              <Menu
                                anchorEl={actionMenuAnchor}
                                // CRITICAL FIX: Use idField instead of hardcoded 'id'
                                open={Boolean(
                                  actionMenuAnchor &&
                                  currentRow?.[idField] === row?.[idField],
                                )}
                                onClose={handleActionMenuClose}
                                PaperProps={{
                                  sx: {
                                    borderRadius: "12px",
                                    mt: 1,
                                    minWidth: 160,
                                    boxShadow: theme.shadows[8],
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                  },
                                }}
                              >
                                {menuActions.map((action, actionIndex) => (
                                  <MenuItem
                                    key={actionIndex}
                                    onClick={() => {
                                      handleRowAction(action, row);
                                      handleActionMenuClose();
                                    }}
                                    disabled={
                                      action.disabled && action.disabled(row)
                                    }
                                    sx={{
                                      borderRadius: "8px",
                                      mx: 1,
                                      my: 0.5,
                                      "&:hover": {
                                        backgroundColor: alpha(
                                          theme.palette.primary.main,
                                          0.1,
                                        ),
                                      },
                                    }}
                                  >
                                    <ListItemIcon
                                      sx={{
                                        color: action.color
                                          ? theme.palette[action.color].main
                                          : "inherit",
                                      }}
                                    >
                                      {action.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={action.label}
                                      primaryTypographyProps={{
                                        variant: "body2",
                                        fontWeight: 500,
                                      }}
                                    />
                                  </MenuItem>
                                ))}
                              </Menu>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </StyledTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modern Pagination */}
        {pagination && (
          <Box sx={{ borderTop: "1px solid #f1f5f9", backgroundColor: "#ffffff" }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={serverSideSorting ? totalRowCount : processedData.length}
              rowsPerPage={rowsPerPageState}
              page={pageState}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                "& .MuiTablePagination-toolbar": {
                  px: 2.5,
                  py: 1,
                  minHeight: 52,
                  gap: 1,
                },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                  fontWeight: 500,
                  color: "#64748b",
                  fontSize: "0.8125rem",
                },
                "& .MuiTablePagination-select": {
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                },
                "& .MuiIconButton-root": {
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  width: 32,
                  height: 32,
                  "&:hover": { backgroundColor: "#f8fafc", borderColor: "#cbd5e1" },
                  "&.Mui-disabled": { borderColor: "#f1f5f9", backgroundColor: "#f8fafc" },
                },
              }}
            />
          </Box>
        )}

        {/* Enhanced Filter menu */}
        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={() => setFilterAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              mt: 1,
              minWidth: 300,
              boxShadow: theme.shadows[8],
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Filters
            </Typography>
            <Divider sx={{ mb: 2, opacity: 0.5 }} />
            {columns
              .filter(
                (column) =>
                  column.filterable && columnVisibility[column.id] !== false,
              )
              .map((column) => (
                <Box key={column.id} sx={{ mb: 2.5 }}>
                  {column.filterOptions ? (
                    <FormControl fullWidth size="small">
                      <InputLabel>{column.label}</InputLabel>
                      <Select
                        value={filters[column.id] || ""}
                        onChange={(e) =>
                          handleFilterChange(column.id, e.target.value)
                        }
                        label={column.label}
                        sx={{ borderRadius: "8px" }}
                      >
                        <MenuItem value="">All</MenuItem>
                        {column.filterOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      size="small"
                      fullWidth
                      label={column.label}
                      value={filters[column.id] || ""}
                      onChange={(e) =>
                        handleFilterChange(column.id, e.target.value)
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                        },
                      }}
                    />
                  )}
                </Box>
              ))}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 3,
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                disabled={Object.keys(filters).length === 0 && !searchTerm}
                sx={{ borderRadius: "8px", flex: 1 }}
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                onClick={() => setFilterAnchor(null)}
                sx={{
                  borderRadius: "8px",
                  flex: 1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                }}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Menu>

        {/* Enhanced Column visibility menu */}
        <Menu
          anchorEl={columnMenuAnchor}
          open={Boolean(columnMenuAnchor)}
          onClose={() => setColumnMenuAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              mt: 1,
              minWidth: 220,
              boxShadow: theme.shadows[8],
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Columns
            </Typography>
            <Divider sx={{ mb: 2, opacity: 0.5 }} />
            {columns.map((column) => (
              <MenuItem
                key={column.id}
                onClick={() => handleToggleColumnVisibility(column.id)}
                sx={{
                  borderRadius: "8px",
                  my: 0.5,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={columnVisibility[column.id] !== false}
                    size="small"
                    sx={{
                      color: alpha(theme.palette.primary.main, 0.6),
                      "&.Mui-checked": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={column.label}
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: 500,
                  }}
                />
              </MenuItem>
            ))}
          </Box>
        </Menu>
      </GradientCard>
    </Fade>
  );
};

export default CraftTable;

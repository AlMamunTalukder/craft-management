/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Inventory2 as Inventory2Icon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { PageHeader, PageAction } from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import {
  useGetAllAssetsQuery,
  useGetAssetSummaryQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} from "@/redux/api/assetApi";
import type { TAsset } from "@/interface";

const ASSET_CATEGORIES = [
  "Furniture",
  "Electronics",
  "Computer",
  "Books",
  "Stationery",
  "Sports",
  "Vehicle",
  "Building",
  "Kitchen",
  "Medical",
  "Other",
];

const CONDITIONS = ["new", "good", "fair", "poor", "damaged", "disposed"];

const formatTaka = (n: number) =>
  (n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

const AssetPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<TAsset | null>(null);
  const [form, setForm] = useState<any>({
    name: "",
    category: "",
    quantity: 1,
    unitPrice: 0,
    purchaseDate: "",
    vendor: "",
    location: "",
    condition: "new",
    warrantyTill: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useGetAllAssetsQuery({
    page,
    limit,
    searchTerm,
    category,
    condition,
  });
  const { data: summaryData } = useGetAssetSummaryQuery({});
  const [createAsset] = useCreateAssetMutation();
  const [updateAsset] = useUpdateAssetMutation();
  const [deleteAsset] = useDeleteAssetMutation();

  const assets: TAsset[] = data?.data?.data || [];
  const meta = data?.data?.meta || { page: 1, total: 0, totalPage: 1, limit: 10 };
  const summary = summaryData?.data;

  const totalValue = summary?.totals?.totalValue || 0;
  const totalQuantity = summary?.totals?.totalQuantity || 0;
  const itemCount = summary?.totals?.itemCount || 0;
  const disposed = summary?.disposed || 0;
  const byCategory = summary?.byCategory || [];

  const statCards = [
    { label: "Total Value", value: `৳${formatTaka(totalValue)}`, color: "#2e7d32" },
    { label: "Total Items", value: itemCount, color: "#6366f1" },
    { label: "Total Quantity", value: totalQuantity, color: "#1976d2" },
    { label: "Disposed", value: disposed, color: "#d32f2f" },
  ];

  const openCreate = () => {
    setEditData(null);
    setForm({
      name: "",
      category: "",
      quantity: 1,
      unitPrice: 0,
      purchaseDate: "",
      vendor: "",
      location: "",
      condition: "new",
      warrantyTill: "",
      note: "",
    });
    setOpen(true);
  };

  const openEdit = (asset: TAsset) => {
    setEditData(asset);
    setForm({
      name: asset.name,
      category: asset.category,
      quantity: asset.quantity,
      unitPrice: asset.unitPrice,
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.slice(0, 10) : "",
      vendor: asset.vendor || "",
      location: asset.location || "",
      condition: asset.condition,
      warrantyTill: asset.warrantyTill ? asset.warrantyTill.slice(0, 10) : "",
      note: asset.note || "",
    });
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.name || !form.category) {
      Swal.fire("Missing Fields", "Name and category are required.", "warning");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity) || 0,
        unitPrice: Number(form.unitPrice) || 0,
      };
      const res: any = editData
        ? await updateAsset({ id: editData._id, data: payload })
        : await createAsset(payload);
      if (res?.error) throw new Error(res.error?.data?.message || "Save failed");
      Swal.fire("Saved!", "Asset saved. Total value calculated automatically.", "success");
      setOpen(false);
    } catch (err: any) {
      Swal.fire("Error", err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (asset: TAsset) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete "${asset.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete!",
    });
    if (!result.isConfirmed) return;
    try {
      const res: any = await deleteAsset(asset._id);
      if (res?.error) throw new Error(res.error?.data?.message || "Delete failed");
      Swal.fire("Deleted!", "Asset deleted.", "success");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Delete failed", "error");
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader
        title="Asset & Inventory"
        subtitle="Track school assets, value and condition"
        action={
          <PageAction onClick={openCreate} label="Add Asset" icon={<AddIcon />} />
        }
      />

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {statCards.map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper
              sx={{
                p: 1.5,
                borderRadius: "10px",
                textAlign: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                borderTop: `3px solid ${s.color}`,
              }}
            >
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: s.color }}>
                {s.value}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#666", fontWeight: 600 }}>
                {s.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {byCategory.length > 0 && (
        <Paper sx={{ p: 1.5, mb: 2, borderRadius: "10px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, mb: 1 }}>
            Value by Category
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
            {byCategory.slice(0, 8).map((c: any) => {
              const max = byCategory[0]?.totalPrice || 1;
              const pct = ((c.totalPrice / max) * 100).toFixed(1);
              return (
                <Box key={c._id}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", mb: 0.3 }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                      {c._id}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#666" }}>
                      ৳{formatTaka(c.totalPrice)} ({c.quantity} pcs)
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: "#f1f5f9", borderRadius: "6px", height: 8 }}>
                    <Box
                      sx={{
                        width: `${pct}%`,
                        height: 8,
                        borderRadius: "6px",
                        background: "linear-gradient(90deg, #6366f1, #4f46e5)",
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>
      )}

      <Paper sx={{ p: 1.5, mb: 2, borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 1.5,
          }}
        >
          <TextField
            size="small"
            placeholder="Search asset..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#999" }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            size="small"
            select
            label="Category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {ASSET_CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Condition"
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Conditions</MenuItem>
            {CONDITIONS.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Rows"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50].map((n) => (
              <MenuItem key={n} value={n}>{n} / page</MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Table size="small" sx={{ minWidth: 880 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f6fa" }}>
              {["Asset", "Category", "Qty", "Unit Price", "Total Value", "Location", "Condition", "Actions"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#555", py: 1.2 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5, color: "#999" }}>
                  No assets found. Click &quot;Add Asset&quot; to record one.
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset._id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Inventory2Icon sx={{ fontSize: 18, color: "#6366f1" }} />
                      <Box>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{asset.name}</Typography>
                        {asset.note && (
                          <Typography sx={{ fontSize: "0.65rem", color: "#999" }}>{asset.note}</Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>{asset.category}</TableCell>
                  <TableCell sx={{ fontSize: "0.78rem", fontWeight: 600 }}>{asset.quantity}</TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>৳{formatTaka(asset.unitPrice)}</TableCell>
                  <TableCell sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#2e7d32" }}>
                    ৳{formatTaka(asset.totalPrice)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem", color: "#666" }}>{asset.location || "-"}</TableCell>
                  <TableCell><StatusChip status={asset.condition} /></TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.3 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(asset)} sx={{ color: "#f57c00" }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(asset)} sx={{ color: "#d32f2f" }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {meta.totalPage > 1 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1.5, alignItems: "center" }}>
          <Button size="small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Page {page} of {meta.totalPage} ({meta.total})
          </Typography>
          <Button size="small" disabled={page >= meta.totalPage} onClick={() => setPage(page + 1)}>Next</Button>
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {editData ? "Edit Asset" : "Add Asset"}
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            <TextField size="small" label="Asset Name *" name="name" value={form.name} onChange={handleChange} sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }} />
            <TextField size="small" select label="Category *" name="category" value={form.category} onChange={handleChange}>
              <MenuItem value="">Select Category</MenuItem>
              {ASSET_CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" select label="Condition" name="condition" value={form.condition} onChange={handleChange}>
              {CONDITIONS.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" type="number" label="Quantity" name="quantity" value={form.quantity} onChange={handleChange} />
            <TextField size="small" type="number" label="Unit Price (৳)" name="unitPrice" value={form.unitPrice} onChange={handleChange} />
            <TextField size="small" type="date" label="Purchase Date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField size="small" type="date" label="Warranty Till" name="warrantyTill" value={form.warrantyTill} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField size="small" label="Vendor / Supplier" name="vendor" value={form.vendor} onChange={handleChange} />
            <TextField size="small" label="Location" name="location" value={form.location} onChange={handleChange} />
            <TextField
              size="small"
              label="Note"
              name="note"
              multiline
              rows={2}
              value={form.note}
              onChange={handleChange}
              sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}
            />
          </Box>
          <Box
            sx={{
              mt: 1.5,
              bgcolor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              px: 1.5,
              py: 1,
            }}
          >
            <Typography sx={{ fontSize: "0.78rem", color: "#166534" }}>
              Total value will be calculated automatically:{" "}
              <b>৳{formatTaka((Number(form.quantity) || 0) * (Number(form.unitPrice) || 0))}</b>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button size="small" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            size="small"
            variant="contained"
            disabled={saving}
            onClick={handleSave}
            sx={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", fontWeight: 600, textTransform: "none" }}
          >
            {saving ? "Saving..." : "Save Asset"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetPage;

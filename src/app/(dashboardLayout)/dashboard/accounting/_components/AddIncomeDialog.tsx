/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Grid,
  Button,
  Box,
  Divider,
  InputAdornment,
  Avatar,
  TextField,
  Chip,
} from "@mui/material";
import {
  Close,
  Add,
  Delete,
  Receipt,
  Category,
  Payments,
  CalendarToday,
  Person,
  Tag,
  School,
  CheckCircle,
  ContentCopy,
  AttachFile,
} from "@mui/icons-material";
import CraftForm from "@/components/Forms/Form";
import CraftSelect from "@/components/Forms/Select";
import { categoryStatusOptions, paymentOptions } from "@/options";
import CraftTextArea from "@/components/Forms/TextArea";
import CraftDatePicker from "@/components/Forms/DatePicker";
import toast from "react-hot-toast";
import {
  useCreateIncomeMutation,
  useGetSingleIncomeQuery,
  useUpdateIncomeMutation,
  useGetAllIncomesQuery,
} from "@/redux/api/incomeApi";
import { useEffect, useMemo, useState } from "react";
import { useGetAllIncomeCategoriesQuery } from "@/redux/api/incomeCategoryApi";
import { useGetAllStudentsQuery } from "@/redux/api/studentApi";
import CategoryAutoComplete from "@/utils/CategoryAutoComplete";
import { LoadingState } from "@/components/common/LoadingState";
import { Autocomplete } from "@mui/material";

interface IncomeItem {
  id: number;
  source: string;
  amount: string;
}

export default function AddIncomeModal({ id, open, onClose }: { open: boolean; onClose: () => void; id?: string }) {
  const [createIncome] = useCreateIncomeMutation();
  const [updateIncome] = useUpdateIncomeMutation();
  const { data: singleIncome, isLoading: singleIncomeLoading } = useGetSingleIncomeQuery(id as string, { skip: !id });

  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([{ id: 1, source: "", amount: "" }]);
  const [referenceNo, setReferenceNo] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("Cash");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const { data: incomeCategories } = useGetAllIncomeCategoriesQuery({});
  const { data: allIncomes } = useGetAllIncomesQuery({});
  const { data: studentsData } = useGetAllStudentsQuery({ limit: 50, searchTerm: studentSearch });
  const studentsList: any[] = Array.isArray((studentsData as any)?.data?.students)
    ? (studentsData as any).data.students
    : Array.isArray((studentsData as any)?.data)
      ? (studentsData as any).data
      : Array.isArray((studentsData as any)?.data?.data)
        ? (studentsData as any).data.data
        : [];
  const lastIncome = allIncomes?.data?.incomes?.[0];

  const incomeCategoryOption = useMemo(() => {
    if (!incomeCategories?.data?.data) return [];
    return incomeCategories.data.data.map((cat: any) => ({ title: cat.name, value: cat._id }));
  }, [incomeCategories?.data?.data]);

  const totalAmount = useMemo(() => incomeItems.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0), [incomeItems]);

  const handleAddItem = () => setIncomeItems((p) => [...p, { id: Math.max(...p.map((x) => x.id)) + 1, source: "", amount: "" }]);
  const handleRemove = (id: number) => { if (incomeItems.length > 1) setIncomeItems((p) => p.filter((x) => x.id !== id)); };
  const handleChange = (id: number, field: keyof IncomeItem, v: string) => setIncomeItems((p) => p.map((x) => (x.id === id ? { ...x, [field]: v } : x)));

  const handleSubmit = async (data: any) => {
    if (incomeItems.some((it) => !it.source.trim() || !it.amount)) { toast.error("Add source and amount for each item"); return; }
    const cleaned = incomeItems.map((it) => ({ source: it.source, description: "", amount: Number(it.amount) }));
    if (selectedStudent && cleaned.length === 1 && !cleaned[0].source) cleaned[0].source = `${selectedStudent.name} - ${selectedStudent.studentId || selectedStudent._id}`;
    const payload = {
      ...data,
      incomeItems: cleaned,
      totalAmount,
      category: data.category?.[0]?.value || data.category?.value || null,
      referenceNo: referenceNo || undefined,
      accountNo: accountNo || undefined,
      transactionId: transactionId || undefined,
      student: selectedStudent?._id || undefined,
      studentName: selectedStudent?.name || undefined,
      studentId: selectedStudent?.studentId || undefined,
      studentRoll: selectedStudent?.studentClassRoll || selectedStudent?.rollNumber || undefined,
    };
    try {
      if (id) {
        const res = await updateIncome({ id, data: payload }).unwrap();
        if (res.success) { toast.success("Income updated"); onClose(); }
      } else {
        const res = await createIncome(payload).unwrap();
        if (res.success) { toast.success("Income added"); onClose(); setIncomeItems([{ id: 1, source: "", amount: "" }]); setReferenceNo(""); setAccountNo(""); setTransactionId(""); setSelectedPaymentMethod("Cash"); setSelectedStudent(null); setStudentSearch(""); }
      }
    } catch (e: any) { toast.error(e?.data?.message || "Failed"); }
  };

  useEffect(() => {
    if (singleIncome?.data?.paymentMethod) setSelectedPaymentMethod(singleIncome.data.paymentMethod);
    if (singleIncome?.data?.accountNo) setAccountNo(singleIncome.data.accountNo);
    if (singleIncome?.data?.transactionId) setTransactionId(singleIncome.data.transactionId);
    if (singleIncome?.data?.referenceNo) setReferenceNo(singleIncome.data.referenceNo);
    if (singleIncome?.data?.student) setSelectedStudent(singleIncome.data.student);
  }, [singleIncome]);
  useEffect(() => {
    if (id && singleIncome?.data) setIncomeItems(singleIncome.data.incomeItems.map((it: any, i: number) => ({ id: i + 1, source: it.source, amount: String(it.amount) })));
    else if (!id) setIncomeItems([{ id: 1, source: "", amount: "" }]);
  }, [id, singleIncome]);

  const defaultValues = id && singleIncome?.data
    ? { category: singleIncome.data.category ? [{ label: singleIncome.data.category.name, value: singleIncome.data.category._id }] : [], paymentMethod: singleIncome.data.paymentMethod, status: singleIncome.data.status, incomeDate: singleIncome.data.incomeDate, note: singleIncome.data.note }
    : { category: [], paymentMethod: "Cash", status: "completed", incomeDate: new Date(), note: "" };

  if (singleIncomeLoading) return <LoadingState />;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 2.2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#4F0187", fontSize: 14 }}><Receipt sx={{ fontSize: 16 }} /></Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1, color: "#0f172a", fontSize: "1.05rem" }}>{id ? "Edit Income" : "Add Income"}</Typography>
              
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ bgcolor: "#f1f5f9" }}><Close fontSize="small" /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: "#fff" }}>
        <CraftForm onSubmit={handleSubmit} defaultValues={defaultValues}>
          <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Row 1: Category + Payment */}
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <CategoryAutoComplete name="category" label="Category *" options={incomeCategoryOption} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CraftSelect size="small" margin="none" name="paymentMethod" label="Payment Method *" items={paymentOptions} onChange={(v) => setSelectedPaymentMethod(v)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc", fontSize: "0.875rem" } }} />
              </Grid>
            </Grid>

            {/* Account / Transaction when not cash - right after Payment, before Student */}
            {selectedPaymentMethod && selectedPaymentMethod.toLowerCase() !== "cash" && (
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Account No (optional)" placeholder="017xx / Bank AC" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" } }} InputProps={{ startAdornment: <InputAdornment position="start"><Payments sx={{ fontSize: 16, color: "#94a3b8" }} /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Transaction ID (optional)" placeholder="TXN12345" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" } }} InputProps={{ startAdornment: <InputAdornment position="start"><Tag sx={{ fontSize: 16, color: "#94a3b8" }} /></InputAdornment> }} />
                </Grid>
              </Grid>
            )}

            {/* Student - optional but prominent when needed */}
            <Box>
              <Typography variant="caption" fontWeight={700} sx={{ color: "#0f172a", display: "flex", alignItems: "center", gap: 0.6, mb: 0.8 }}>
                <Person sx={{ fontSize: 14, color: "#0ea5e9" }} /> Student (if this income is from a student)
                <Chip label="Optional" size="small" sx={{ height: 18, fontSize: 10, bgcolor: "#f1f5f9", ml: 1 }} />
              </Typography>
              <Autocomplete
                options={studentsList}
                getOptionLabel={(o: any) => `${o.name} - ${o.studentId || o._id}`}
                value={selectedStudent}
                onChange={(_, v) => setSelectedStudent(v)}
                inputValue={studentSearch}
                onInputChange={(_, v) => setStudentSearch(v)}
                renderOption={(p, o: any) => (
                  <li {...p} key={o._id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Avatar sx={{ width: 26, height: 26, bgcolor: "#e0f2fe", color: "#0369a1", fontSize: 11 }}>{o.name?.charAt(0)}</Avatar>
                      <Box><Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>{o.name}</Typography><Typography variant="caption" sx={{ color: "#64748b", fontSize: 11 }}>{o.studentId} • {o.className?.[0]?.className || o.class || ""}</Typography></Box>
                    </Box>
                  </li>
                )}
                renderInput={(params) => <TextField {...params} placeholder="Search by name or ID..." size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" } }} InputProps={{ ...params.InputProps, startAdornment: <><InputAdornment position="start"><Person sx={{ fontSize: 16, color: "#94a3b8" }} /></InputAdornment>{params.InputProps.startAdornment}</> }} />}
                noOptionsText="Type to search students"
              />
              {selectedStudent && <Chip label={`${selectedStudent.name} - ${selectedStudent.studentId}`} size="small" color="primary" onDelete={() => { setSelectedStudent(null); setStudentSearch(""); }} sx={{ mt: 1, borderRadius: 1 }} />}
            </Box>

            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}><CraftSelect size="small" margin="none" name="status" label="Status" items={categoryStatusOptions} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc", fontSize: "0.875rem" } }} /></Grid>
              <Grid item xs={12} sm={6}><CraftDatePicker size="small" margin="none" name="incomeDate" label="Date *" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc", fontSize: "0.875rem" } }} /></Grid>
            </Grid>

            <Divider />

            {/* Income Items - simple list */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.2 }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#0f172a", display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Tag sx={{ fontSize: 16, color: "#16a34a" }} /> Income Items 
                  <Chip label={`${incomeItems.length}`} size="small" sx={{ height: 18, fontSize: 11, bgcolor: "#dcfce7", color: "#166534" }} />
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {!id && lastIncome && <Button size="small" startIcon={<ContentCopy sx={{ fontSize: 14 }} />} onClick={() => { if (lastIncome?.incomeItems?.length) { setIncomeItems(lastIncome.incomeItems.map((it: any, i: number) => ({ id: i + 1, source: it.source, amount: String(it.amount) }))); toast.success("Copied last"); } }} sx={{ textTransform: "none", fontSize: 11, borderRadius: 2 }}>Copy last</Button>}
                  <Button size="small" variant="contained" startIcon={<Add sx={{ fontSize: 14 }} />} onClick={handleAddItem} sx={{ borderRadius: 2, bgcolor: "#0f172a", textTransform: "none", fontSize: 12, px: 1.5, "&:hover": { bgcolor: "#1e293b" } }}>Add</Button>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                {incomeItems.map((it, idx) => (
                  <Box key={it.id} sx={{ display: "flex", gap: 1, alignItems: "flex-start", p: 1.2, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#fff" }}>

                    <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#475569", flexShrink: 0, mt: 0.8 }}>{idx + 1}</Box>

                    <Box sx={{ flex: 1, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
                      <TextField size="small" label="Source *" placeholder="Donation / Rent" value={it.source} onChange={(e) => handleChange(it.id, "source", e.target.value)} sx={{ flex: 1.2, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" } }} />

                      <TextField size="small" label="Amount (৳) *" type="number" placeholder="0" value={it.amount} onChange={(e) => handleChange(it.id, "amount", e.target.value)} sx={{ flex: 0.7, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" } }} InputProps={{ startAdornment: <InputAdornment position="start">৳</InputAdornment> }} />
                    </Box>
                    {incomeItems.length > 1 ? <IconButton size="small" onClick={() => handleRemove(it.id)} sx={{ color: "#ef4444", bgcolor: "#fef2f2", mt: 0.5 }}><Delete fontSize="small" /></IconButton> : <Box sx={{  }} />}
                  </Box>
                ))}
              </Box>


            </Box>

            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Reference No" placeholder="INV-001 (optional)" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" } }} InputProps={{ startAdornment: <InputAdornment position="start"><AttachFile sx={{ fontSize: 16, color: "#94a3b8" }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: "#f1f8e9", border: "1px solid #dcfce7", display: "flex", justifyContent: "space-between", alignItems: "center", height: 40 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><CheckCircle sx={{ fontSize: 16, color: "#16a34a" }} /> Total</Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ color: "#16a34a", fontSize: "1.05rem" }}>৳{totalAmount.toLocaleString()}</Typography>
                </Box>
              </Grid>
            </Grid>

            <CraftTextArea name="note" label="Note (optional)" placeholder="Any remark..." />
            
          </Box>

          <DialogActions sx={{ px: 2.5, py: 2, borderTop: "1px solid #f1f5f9", gap: 1 }}>
            <Button onClick={onClose} variant="text" sx={{ borderRadius: 2, textTransform: "none", color: "#475569" }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={totalAmount === 0} sx={{ borderRadius: 2, bgcolor: "#4F0187", textTransform: "none", fontWeight: 700, px: 3, "&:hover": { bgcolor: "#3c0166" } }}>
              {id ? "Update" : "Save Income"}
            </Button>
          </DialogActions>
        </CraftForm>
      </DialogContent>
    </Dialog>
  );
}

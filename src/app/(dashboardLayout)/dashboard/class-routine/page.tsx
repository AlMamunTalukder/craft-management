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
  Chip,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { PageHeader, PageAction } from "@/components/common/PageHeader";
import {
  useGetWeekRoutineQuery,
  useCreateRoutineMutation,
  useUpdateRoutineMutation,
  useDeleteRoutineMutation,
} from "@/redux/api/routineApi";
import { useGetAllClassesQuery } from "@/redux/api/classApi";
import { useGetAllSubjectsQuery } from "@/redux/api/subjectApi";
import { useGetAllTeachersQuery } from "@/redux/api/teacherApi";
import { useGetAllSectionsQuery } from "@/redux/api/sectionApi";
import type { TRoutine } from "@/interface";

const WEEK_DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const DAY_COLORS: Record<string, string> = {
  Saturday: "#6366f1",
  Sunday: "#f57c00",
  Monday: "#2e7d32",
  Tuesday: "#1976d2",
  Wednesday: "#9c27b0",
  Thursday: "#d32f2f",
  Friday: "#546e7a",
};

const emptyPeriod = { subject: "", teacher: "", startTime: "", endTime: "", room: "", isBreak: false };

const ClassRoutinePage = () => {
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<TRoutine | null>(null);
  const [form, setForm] = useState<any>({
    className: "",
    section: "",
    day: "Saturday",
    academicYear: "",
    periods: [{ ...emptyPeriod }],
  });
  const [saving, setSaving] = useState(false);

  const { data: classesData } = useGetAllClassesQuery({ limit: 100, page: 1 });
  const { data: subjectsData } = useGetAllSubjectsQuery({ limit: 100, page: 1 });
  const { data: teachersData } = useGetAllTeachersQuery({ limit: 100, page: 1, sort: 'teacherSerial' } as any);
  const { data: sectionsData } = useGetAllSectionsQuery({ limit: 100, page: 1 });

  const classes = classesData?.data?.classes || [];
  const subjects = subjectsData?.data?.subjects || [];
  const teachers = [...(teachersData?.data || [])].sort((a: any, b: any) => {
    const aHas = !!a.teacherSerial; const bHas = !!b.teacherSerial;
    if (aHas && !bHas) return -1; if (!aHas && bHas) return 1; if (!aHas && !bHas) return 0;
    const aNum = parseInt(String(a.teacherSerial), 10); const bNum = parseInt(String(b.teacherSerial), 10);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return String(a.teacherSerial).localeCompare(String(b.teacherSerial), 'en', { numeric: true });
  });
  const sections = sectionsData?.data?.sections || [];

  const { data, isLoading, refetch } = useGetWeekRoutineQuery(
    { className, section: section || undefined, academicYear: academicYear || undefined },
    { skip: !className },
  );

  const [createRoutine] = useCreateRoutineMutation();
  const [updateRoutine] = useUpdateRoutineMutation();
  const [deleteRoutine] = useDeleteRoutineMutation();

  const week: Record<string, TRoutine[]> = data?.data?.week || {};

  const openCreate = () => {
    setEditData(null);
    setForm({
      className,
      section,
      day: "Saturday",
      academicYear: academicYear || String(new Date().getFullYear()),
      periods: [{ ...emptyPeriod }],
    });
    setOpen(true);
  };

  const openEdit = (routine: TRoutine) => {
    setEditData(routine);
    setForm({
      className: routine.className?._id || className,
      section: routine.section || "",
      day: routine.day,
      academicYear: routine.academicYear || academicYear || String(new Date().getFullYear()),
      periods:
        routine.periods?.map((p) => ({
          subject: p.subject,
          teacher:
            p.teacher && typeof p.teacher === "object" ? p.teacher._id : p.teacher || "",
          startTime: p.startTime,
          endTime: p.endTime,
          room: p.room || "",
          isBreak: p.isBreak || false,
        })) || [{ ...emptyPeriod }],
    });
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePeriodChange = (i: number, field: string, value: any) => {
    const periods = [...form.periods];
    periods[i] = { ...periods[i], [field]: value };
    setForm({ ...form, periods });
  };

  const handleSave = async () => {
    if (!form.className || !form.day) {
      Swal.fire("Missing Fields", "Class and day are required.", "warning");
      return;
    }
    const validPeriods = form.periods.filter(
      (p: any) => p.subject && p.startTime && p.endTime,
    );
    if (validPeriods.length === 0) {
      Swal.fire("Missing Periods", "Add at least one period with subject and time.", "warning");
      return;
    }
    const payload = {
      className: form.className,
      section: form.section || undefined,
      day: form.day,
      academicYear: form.academicYear || undefined,
      periods: validPeriods.map((p: any) => ({
        subject: p.subject,
        teacher: p.teacher || undefined,
        startTime: p.startTime,
        endTime: p.endTime,
        room: p.room || undefined,
        isBreak: p.isBreak,
      })),
    };
    setSaving(true);
    try {
      const res: any = editData
        ? await updateRoutine({ id: editData._id, data: payload })
        : await createRoutine(payload);
      if (res?.error) {
        const msg = res.error?.data?.message || "Failed to save";
        if (msg.includes("Teacher already has a class")) {
          Swal.fire("Teacher Conflict", msg, "warning");
        } else {
          throw new Error(msg);
        }
      } else {
        Swal.fire("Saved!", "Routine saved successfully.", "success");
        setOpen(false);
        refetch();
      }
    } catch (err: any) {
      Swal.fire("Error", err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (routine: TRoutine) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete routine for ${routine.day}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete!",
    });
    if (!result.isConfirmed) return;
    try {
      const res: any = await deleteRoutine(routine._id);
      if (res?.error) throw new Error(res.error?.data?.message || "Delete failed");
      Swal.fire("Deleted!", "Routine deleted.", "success");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Delete failed", "error");
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader
        title="Class Routine"
        subtitle="Weekly timetable with automatic teacher conflict detection"
        action={
          <PageAction onClick={openCreate} label="Add Routine" icon={<AddIcon />} />
        }
      />

      <Paper sx={{ p: 1.5, mb: 2, borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 1.5 }}>
          <TextField
            size="small"
            select
            label="Class *"
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
              setSection("");
            }}
          >
            <MenuItem value="">Select Class</MenuItem>
            {classes.map((c: any) => (
              <MenuItem key={c._id} value={c._id}>
                {c.className}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <MenuItem value="">All Sections</MenuItem>
            {sections.map((s: any) => (
              <MenuItem key={s._id} value={s.name || s.sectionName || s.title}>
                {s.name || s.sectionName || s.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Academic Year (optional)"
            placeholder="e.g. 2026"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
        </Box>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={30} />
        </Box>
      ) : !className ? (
        <Paper sx={{ p: 4, textAlign: "center", color: "#999", borderRadius: "10px" }}>
          Select a class to view its weekly routine.
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {WEEK_DAYS.map((day) => {
            const routines = week[day] || [];
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={day} sx={{ display: "flex" }}>
                <Paper
                  sx={{
                    width: "100%",
                    borderRadius: "10px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: DAY_COLORS[day],
                      color: "#fff",
                      px: 1.5,
                      py: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>{day}</Typography>
                    <IconButton size="small" onClick={() => openCreate()} sx={{ color: "#fff" }}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ p: 1 }}>
                    {routines.length === 0 && (
                      <Typography sx={{ fontSize: "0.72rem", color: "#aaa", textAlign: "center", py: 2 }}>
                        No classes
                      </Typography>
                    )}
                    {routines.map((r) => (
                      <Box
                        key={r._id}
                        sx={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          mb: 1,
                          p: 1,
                          bgcolor: "#fafbff",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                          <Chip
                            size="small"
                            label={r.section || "No Section"}
                            sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#eef2ff", color: "#4338ca", fontWeight: 600 }}
                          />
                          <Box>
                            <Tooltip title="Edit">
                              <IconButton size="small" sx={{ p: 0.3 }} onClick={() => openEdit(r)}>
                                <EditIcon sx={{ fontSize: 15, color: "#f57c00" }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" sx={{ p: 0.3 }} onClick={() => handleDelete(r)}>
                                <DeleteIcon sx={{ fontSize: 15, color: "#d32f2f" }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        {r.periods?.map((p, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              py: 0.5,
                              borderTop: idx > 0 ? "1px dashed #e5e7eb" : "none",
                            }}
                          >
                            <Box>
                              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>
                                {p.isBreak ? "Break" : p.subject}
                              </Typography>
                              {!p.isBreak && p.teacher && (
                                <Typography sx={{ fontSize: "0.65rem", color: "#888" }}>
                                  {(p.teacher as any)?.name || p.teacher || ""}
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography sx={{ fontSize: "0.68rem", color: "#666", display: "flex", alignItems: "center", gap: 0.3 }}>
                                <AccessTimeIcon sx={{ fontSize: 12 }} />
                                {p.startTime} - {p.endTime}
                              </Typography>
                              {p.room && (
                                <Typography sx={{ fontSize: "0.62rem", color: "#aaa" }}>Room: {p.room}</Typography>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {editData ? "Edit Routine" : "Add Routine"}
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, gap: 1.5, mb: 2 }}>
            <TextField
              size="small"
              select
              label="Class *"
              name="className"
              value={form.className}
              onChange={handleChange}
              sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}
            >
              <MenuItem value="">Select Class</MenuItem>
              {classes.map((c: any) => (
                <MenuItem key={c._id} value={c._id}>{c.className}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" select label="Section" name="section" value={form.section} onChange={handleChange}>
              <MenuItem value="">None</MenuItem>
              {sections.map((s: any) => (
                <MenuItem key={s._id} value={s.name || s.sectionName || s.title}>
                  {s.name || s.sectionName || s.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField size="small" select label="Day *" name="day" value={form.day} onChange={handleChange}>
              {WEEK_DAYS.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" label="Academic Year" name="academicYear" placeholder="e.g. 2026" value={form.academicYear} onChange={handleChange} />
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#555" }}>
            Periods
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {form.periods.map((p: any, i: number) => (
              <Box key={i} sx={{ p: 1.2, border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr auto" }, gap: 1 }}>
                  <TextField
                    size="small"
                    select
                    label={p.isBreak ? "Break" : "Subject *"}
                    value={p.subject}
                    onChange={(e) => handlePeriodChange(i, "subject", e.target.value)}
                    sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}
                  >
                    <MenuItem value="">Select Subject</MenuItem>
                    {subjects.map((s: any) => (
                      <MenuItem key={s._id} value={s.subjectName || s.name || s.title}>
                        {s.subjectName || s.name || s.title}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    select
                    label="Teacher"
                    value={p.teacher}
                    onChange={(e) => handlePeriodChange(i, "teacher", e.target.value)}
                    disabled={p.isBreak}
                  >
                    <MenuItem value="">None</MenuItem>
                    {teachers.map((t: any) => (
                      <MenuItem key={t._id} value={t._id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    type="time"
                    label="Start"
                    value={p.startTime}
                    onChange={(e) => handlePeriodChange(i, "startTime", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <TextField
                      size="small"
                      type="time"
                      label="End"
                      value={p.endTime}
                      onChange={(e) => handlePeriodChange(i, "endTime", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <Tooltip title="Delete period">
                      <IconButton
                        size="small"
                        color="error"
                        disabled={form.periods.length === 1}
                        onClick={() => setForm({ ...form, periods: form.periods.filter((_: any, j: number) => j !== i) })}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1.5, mt: 1, alignItems: "center" }}>
                  <TextField
                    size="small"
                    label="Room (optional)"
                    value={p.room}
                    onChange={(e) => handlePeriodChange(i, "room", e.target.value)}
                    sx={{ width: 140 }}
                  />
                  <Chip
                    size="small"
                    label="Break"
                    onClick={() => {
                      const periods = [...form.periods];
                      periods[i] = { ...periods[i], isBreak: !periods[i].isBreak, teacher: "" };
                      setForm({ ...form, periods });
                    }}
                    sx={{
                      cursor: "pointer",
                      bgcolor: p.isBreak ? "#ffebee" : "#f5f5f5",
                      color: p.isBreak ? "#d32f2f" : "#666",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            ))}
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setForm({ ...form, periods: [...form.periods, { ...emptyPeriod }] })}
              sx={{ alignSelf: "flex-start" }}
            >
              Add Period
            </Button>
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
            {saving ? "Saving..." : "Save Routine"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassRoutinePage;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { LoadingState } from "@/components/common/LoadingState";
import { StudentFormWrapper } from "@/components/student/StudentFormWrapper";
import { admissionToFormValues, formToAdmissionPayload } from "@/components/student/studentFieldMappers";
import {
  useGetSingleAdmissionApplicationQuery,
  useUpdateAdmissionApplicationMutation,
} from "@/redux/api/admissionApplication";
import { ArrowBack, School } from "@mui/icons-material";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Divider,
  Paper,
  Snackbar,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

export default function EditAdmissionApplication() {
  const router = useRouter();
  const theme = useTheme();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const from = searchParams.get("from") || "pending";

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const {
    data: singleApplication,
    isLoading,
    error: fetchError,
  } = useGetSingleAdmissionApplicationQuery({ id });

  const [updateApplication, { isLoading: isUpdating }] =
    useUpdateAdmissionApplicationMutation();

  const handleSubmit = async (formData: any) => {
    try {
      const apiData = formToAdmissionPayload(formData);
      const res = await updateApplication({ id, data: apiData }).unwrap();
      if (res.success) {
        router.push(`/dashboard/online-application/${from}`);
      }
    } catch (error: any) {
      console.error("Update failed:", error);
      setSnackbar({
        open: true,
        message:
          error?.data?.message || "আপডেট ব্যর্থ হয়েছে, আবার চেষ্টা করুন",
        severity: "error",
      });
    }
  };

  const handleCancel = () => router.back();

  if (isLoading) return <LoadingState />;
  if (fetchError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">ডেটা লোড করতে সমস্যা হয়েছে</Alert>
        <Button startIcon={<ArrowBack />} onClick={handleCancel} sx={{ mt: 2 }}>
          ফিরে যান
        </Button>
      </Box>
    );
  }

  const d = singleApplication?.data;
  const defaultValues = admissionToFormValues(d);

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        minHeight: "100vh",
        bgcolor: alpha(theme.palette.primary.main, 0.02),
      }}
    >
      <Paper
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 4,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        {/* Header - kept same design */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              }}
            >
              <School />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                ভর্তি আবেদন সম্পাদনা
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleCancel}
            sx={{ borderRadius: 2 }}
          >
            ফিরে যান
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Single source of truth - same design everywhere */}
        <StudentFormWrapper
          defaultValues={defaultValues}
          formKey={d?._id ?? "edit-form"}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isUpdating}
          mode="admission"
          submitLabel="সংরক্ষণ করুন"
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

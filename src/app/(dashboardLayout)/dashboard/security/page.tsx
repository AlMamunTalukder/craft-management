/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import {
  Key as KeyIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Visibility,
  VisibilityOff,
  VpnKey as VpnKeyIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues } from "react-hook-form";
import * as z from "zod";
import Cookies from "js-cookie";
import { PageHeader } from "@/components/common/PageHeader";
import CraftForm from "@/components/Forms/Form";
import CraftInput from "@/components/Forms/Input";
import { useChangePasswordMutation } from "@/redux/features/auth/auth.api";

const changePasswordSchema = z
  .object({
    oldPassword: z
      .string({ required_error: "Current password is required" })
      .min(1, "Current password is required"),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z
      .string({ required_error: "Please confirm your new password" })
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  });

const SecurityPage = () => {
  const router = useRouter();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    Cookies.remove("accessToken", { path: "/" });
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
    localStorage.clear();
    router.push("/");
  };

  const handleSubmit = async (data: FieldValues) => {
    try {
      const res = await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }).unwrap();

      if (res?.success) {
        toast.success("Password changed successfully! Please login again.");
        setTimeout(handleLogout, 1500);
      } else {
        toast.error(res?.message || "Failed to change password");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to change password",
      );
    }
  };

  const passwordInputProps = (show: boolean, toggle: () => void) => ({
    endAdornment: (
      <InputAdornment position="end">
        <IconButton onClick={toggle} edge="end" size="small">
          {show ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  });

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
      <PageHeader
        title="Security & Password"
        subtitle="Change your account password securely"
      />

      <Card
        sx={{
          maxWidth: 620,
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(99, 102, 241, 0.12)",
          border: "1px solid rgba(99, 102, 241, 0.15)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            background: alpha("#6366f1", 0.08),
            borderBottom: "1px solid rgba(99, 102, 241, 0.15)",
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#fff",
            }}
          >
            <VpnKeyIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Change Password
            </Typography>
            <Typography variant="caption" sx={{ color: "#666" }}>
              You will be logged out after a successful password change
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <CraftForm
            onSubmit={handleSubmit}
            resolver={zodResolver(changePasswordSchema)}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 0.75 }}
                >
                  <LockIcon sx={{ fontSize: 16, color: "#6366f1" }} />
                  Current Password
                </Typography>
                <CraftInput
                  type={showOld ? "text" : "password"}
                  name="oldPassword"
                  placeholder="Enter your current password"
                  fullWidth
                  InputProps={passwordInputProps(showOld, () => setShowOld(!showOld))}
                />
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 0.75 }}
                >
                  <KeyIcon sx={{ fontSize: 16, color: "#6366f1" }} />
                  New Password
                </Typography>
                <CraftInput
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter a new password (min 6 characters)"
                  fullWidth
                  InputProps={passwordInputProps(showNew, () => setShowNew(!showNew))}
                />
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 0.75 }}
                >
                  <SecurityIcon sx={{ fontSize: 16, color: "#6366f1" }} />
                  Confirm New Password
                </Typography>
                <CraftInput
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter the new password"
                  fullWidth
                  InputProps={passwordInputProps(showConfirm, () => setShowConfirm(!showConfirm))}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={<VpnKeyIcon />}
                sx={{
                  mt: 1,
                  py: 1.2,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
                  "&:hover": { boxShadow: "0 6px 16px rgba(99, 102, 241, 0.35)" },
                }}
              >
                {isLoading ? "Changing Password..." : "Change Password"}
              </Button>
            </Stack>
          </CraftForm>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SecurityPage;

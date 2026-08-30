// components/admission/AdmissionDetailModal.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close, Print } from "@mui/icons-material";


import { StatusChip } from "./UtilityComponents";

import { AdmissionDetailModalProps } from "@/interface/admission";
import { StudentDetailsView } from "@/components/student/StudentDetailsView";


const Transition = React.forwardRef(function Transition(props: any, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const AdmissionDetailModal = ({
  open,
  onClose,
  application,
  loading,
}: AdmissionDetailModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Loading state
  if (loading) {
    return (
      <Dialog open={open} maxWidth="lg" fullWidth>
        <DialogContent>
          <Typography align="center" py={4}>
            Loading application details...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!application) return null;

  const _id = (application as any)?._id;
  const status = (application as any)?.status;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.98)} 100%)`,
        },
      }}
    >
      {/* Header - minimal with status and close, details header is inside StudentDetailsView */}
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Application Details
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <StatusChip status={status} />
          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.1),
              "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.2) },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Body - Single source of truth */}
      <DialogContent dividers sx={{ p: isMobile ? 2 : 3 }}>
        <StudentDetailsView data={application} mode="admission" />
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<Close />}
          size={isMobile ? "small" : "medium"}
        >
          বন্ধ করুন
        </Button>
        <Button
          variant="contained"
          onClick={() => window.open(`/admissions/${_id}/print`, "_blank")}
          startIcon={<Print />}
          size={isMobile ? "small" : "medium"}
        >
          প্রিন্ট
        </Button>
      </DialogActions>
    </Dialog>
  );
};
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CraftForm from "@/components/Forms/Form";
import { alpha, Box, Button, CircularProgress, Paper, Typography, useTheme } from "@mui/material";
import { Save, ArrowBack } from "@mui/icons-material";
import React from "react";
import {
  StudentPersonalSection,
  StudentAcademicSection,
  StudentParentSection,
  StudentAddressSection,
  StudentFamilyEnvironmentSection,
  StudentBehaviorSection,
  StudentDocumentsSection,
} from "./StudentFormSections";

export interface StudentFormWrapperProps {
  defaultValues: Record<string, any>;
  formKey?: string | number;
  onSubmit: (data: any) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "admission" | "student" | "enrollment";
  submitLabel?: string;
  showCancel?: boolean;
}

/**
 * Single Form Wrapper - used by ALL edit/create pages
 * Ensures same design in every place
 */
export const StudentFormWrapper = ({
  defaultValues,
  formKey,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "admission",
  submitLabel = "সংরক্ষণ করুন",
  showCancel = true,
}: StudentFormWrapperProps) => {
  const theme = useTheme();

  return (
    <CraftForm onSubmit={onSubmit} defaultValues={defaultValues} key={formKey as any}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <StudentPersonalSection mode={mode} />
        <StudentAcademicSection mode={mode} />
        <StudentParentSection />
        <StudentAddressSection mode={mode} />
        <StudentFamilyEnvironmentSection />
        <StudentBehaviorSection />
        <StudentDocumentsSection />

        {/* Submit */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
          {showCancel && onCancel && (
            <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: 2, px: 4 }} startIcon={<ArrowBack />}>
              বাতিল / Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
            sx={{
              borderRadius: 2,
              px: 4,
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
            }}
          >
            {isSubmitting ? "সংরক্ষণ হচ্ছে..." : submitLabel}
          </Button>
        </Box>
      </Box>
    </CraftForm>
  );
};

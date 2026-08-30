/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Grid2 as Grid } from "@mui/material";
import CraftSelectWithIcon from "@/components/Forms/selectWithIcon";
import CraftInputWithIcon from "@/components/Forms/inputWithIcon";
import { STUDENT_CATEGORIES } from "@/constant/studentCategory";
import { Person } from "@mui/icons-material";

/**
 * Shared student fields - used by StudentForm, OnlineApplication edit, EnrollmentForm
 * Centralizes category and common student info to avoid duplication
 *
 * SINGLE IMPORT POINT for all student-related components.
 * All pages should import from @/components/student/StudentCommonFields
 * or @/components/student/*
 */
export const StudentCategoryField = () => (
  <Grid size={{ xs: 12, md: 3 }}>
    <CraftSelectWithIcon
      name="category"
      label="Category"
      placeholder="Select Student Type"
      items={STUDENT_CATEGORIES.map((c) => c.value)}
      adornment={<Person color="action" />}
    />
  </Grid>
);

export const StudentInfoFields = () => (
  <>
    <Grid size={{ xs: 12, md: 6 }}>
      <CraftInputWithIcon
        name="StudentName"
        label="Student Name (Bangla)"
        placeholder="বাংলায় নাম"
      />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <CraftInputWithIcon
        name="studentName"
        label="Student Name (English)"
        placeholder="Name in English"
      />
    </Grid>
  </>
);

// Re-exports - Single place to import everything (for reduce code & optimized)
// Usage: import { StudentDetailsView, admissionToFormValues } from "@/components/student/StudentCommonFields";
export * from "./studentFieldMappers";
export * from "./fieldMapTable";
export * from "./StudentFormSections";
export * from "./StudentDetailsView";
export * from "./StudentFormWrapper";

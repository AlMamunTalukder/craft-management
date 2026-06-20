// components/admission/AdmissionDetailModal.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Slide,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close, Print } from "@mui/icons-material";


import { PersonInfoCard } from "./UtilityComponents";
import { AddressCard } from "./UtilityComponents";

import { StatusChip } from "./UtilityComponents";

import { FamilyRestroom } from "@mui/icons-material";
import { AdmissionDetailModalProps, ProcessedApplicationData } from "@/interface/admission";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { AcademicInfoSection } from "./AcademicInfoSection";
import { FamilyEnvironmentSection } from "./FamilyEnvironmentSection";
import { BehaviorSkillsSection } from "./BehaviorSkillsSection";
import { DocumentsSection } from "./DocumentsSection";
import { TermsAcceptedSection } from "./TermsAcceptedSection";


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

  // Process data
  const data = useMemo<ProcessedApplicationData | null>(() => {
    if (!application) return null;

    const {
      applicationId,
      _id,
      status,
      academicYear,
      department: topDepartment,
      class: studentClassTop,
      nameBangla: topNameBangla,
      nameEnglish: topNameEnglish,
      mobile: topMobile,
      fatherMobile: topFatherMobile,
      studentInfo = {},
      parentInfo = {},
      address = {},
      academicInfo = {},
      familyEnvironment = {},
      behaviorSkills = {},
      documents = {},
      termsAccepted = false,
    } = application;

    const {
      nameBangla,
      nameEnglish,
      dateOfBirth,
      age,
      gender,
      bloodGroup,
      nationality = "Bangladeshi",
      nidBirth,
      department,
      class: studentClass,
      session,
      studentPhoto,
    } = studentInfo;

    const { father = {}, mother = {}, guardian = {} } = parentInfo;

    return {
      applicationId: applicationId || _id?.slice(-6).toUpperCase() || "N/A",
      _id,
      status,
      displayNameBangla: nameBangla || topNameBangla,
      displayNameEnglish: nameEnglish || topNameEnglish,
      displayDepartment: department || topDepartment,
      displayClass: studentClass || studentClassTop,
      displayMobile: topMobile,
      displayFatherMobile: topFatherMobile,
      studentInfo: {
        nameBangla,
        nameEnglish,
        dateOfBirth,
        age,
        gender,
        bloodGroup,
        nationality,
        nidBirth,
        studentPhoto,
        session: session || academicYear,
      },
      academicInfo,
      familyEnvironment,
      behaviorSkills,
      documents,
      termsAccepted,
      parents: { father, mother, guardian },
      addresses: {
        present: address?.present || {},
        permanent: address?.permanent || {},
      },
    };
  }, [application]);

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

  if (!data) return null;

  const {
    applicationId,
    _id,
    status,
    displayNameBangla,
    displayNameEnglish,
    displayDepartment,
    displayClass,
    studentInfo,
    academicInfo,
    familyEnvironment,
    behaviorSkills,
    documents,
    termsAccepted,
    parents,
    addresses,
  } = data;

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
      {/* Header */}
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={studentInfo.studentPhoto}
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                boxShadow: theme.shadows[3],
              }}
            >
              {displayNameBangla?.charAt(0) || "S"}
            </Avatar>
            <Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight="bold"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {displayNameBangla || displayNameEnglish || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Application ID: {applicationId}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
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
        </Box>
      </DialogTitle>

      {/* Body */}
      <DialogContent dividers sx={{ p: isMobile ? 2 : 3 }}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <PersonalInfoSection
              studentInfo={studentInfo}
              displayNameBangla={displayNameBangla}
              displayNameEnglish={displayNameEnglish}
            />
          </Grid>

          {/* Academic Information */}
          <Grid item xs={12} md={6}>
            <AcademicInfoSection
              studentInfo={studentInfo}
              academicInfo={academicInfo}
              displayDepartment={displayDepartment}
              displayClass={displayClass}
            />
          </Grid>

          {/* Father's Information */}
          <Grid item xs={12} md={6}>
            <PersonInfoCard
              title="পিতার তথ্য"
              person={parents.father}
              icon={FamilyRestroom}
              color="info"
            />
          </Grid>

          {/* Mother's Information */}
          <Grid item xs={12} md={6}>
            <PersonInfoCard
              title="মাতার তথ্য"
              person={parents.mother}
              icon={FamilyRestroom}
              color="secondary"
            />
          </Grid>

          {/* Guardian's Information */}
          {parents.guardian?.nameBangla && (
            <Grid item xs={12} md={6}>
              <PersonInfoCard
                title="অভিভাবকের তথ্য"
                person={parents.guardian}
                icon={FamilyRestroom}
                color="warning"
                showRelation
                showAddress
              />
            </Grid>
          )}

          {/* Present Address */}
          <Grid item xs={12} md={6}>
            <AddressCard
              title="বর্তমান ঠিকানা"
              address={addresses.present}
              color="primary"
              icon={FamilyRestroom}
            />
          </Grid>

          {/* Permanent Address */}
          <Grid item xs={12} md={6}>
            <AddressCard
              title="স্থায়ী ঠিকানা"
              address={addresses.permanent}
              color="info"
              icon={FamilyRestroom}
            />
          </Grid>

          {/* Family Environment */}
          <Grid item xs={12} md={6}>
            <FamilyEnvironmentSection familyEnvironment={familyEnvironment} />
          </Grid>

          {/* Behavior & Skills */}
          <Grid item xs={12} md={6}>
            <BehaviorSkillsSection behaviorSkills={behaviorSkills} />
          </Grid>

          {/* Documents */}
          <Grid item xs={12}>
            <DocumentsSection documents={documents} />
          </Grid>

          {/* Terms Accepted */}
          <Grid item xs={12}>
            <TermsAcceptedSection termsAccepted={termsAccepted} />
          </Grid>
        </Grid>
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
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CraftInput from "@/components/Forms/Input";
import CraftInputWithIcon from "@/components/Forms/inputWithIcon";
import CraftSelect from "@/components/Forms/Select";
import CraftSelectWithIcon from "@/components/Forms/selectWithIcon";
import CraftIntAutoCompleteWithIcon from "@/components/Forms/AutocompleteWithIcon";
import CraftRadioGroup from "@/components/Forms/CraftRadioGroup";
import CraftCheckbox from "@/components/Forms/CraftCheckbox";
import CraftSwitch from "@/components/Forms/switch";
import FileUploadWithIcon from "@/components/Forms/Upload";
import { STUDENT_CATEGORIES } from "@/constant/studentCategory";
import {
  angerOptions,
  behaviorGeneralOptions,
  frequencyOptions,
  interestOptions,
  obedienceOptions,
  yesNoOptions,
  yesNoSometimesOptions,
  yesNoTryingOptions,
} from "@/options/application";
import { bloodGroups, genderOptions } from "@/options";
import { useGetAllClassesQuery } from "@/redux/api/classApi";
import { useGetAllSectionsQuery } from "@/redux/api/sectionApi";
import {
  Assignment,
  Badge,
  Bloodtype,
  Cake,
  CalendarMonth,
  Class,
  FamilyRestroom,
  Home,
  LocationOn,
  Person,
  Phone,
  School,
  Timeline,
  Work,
} from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid2 as Grid,
  Paper,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

// ---------------------------------------------------------------------------
// Shared constants - centralized
// ---------------------------------------------------------------------------
const hifzClassValues = ["Nurani", "Nazera", "Hifz", "Sunani"];
const academicClassValues = ["Pre_one", "One", "Two", "Three", "Four_boys", "Four_girls", "Five", "Six", "Seven", "Eight"];
const getClassItemsByDept = (dept: string): string[] => {
  if (dept === "hifz") return hifzClassValues;
  if (dept === "academic") return academicClassValues;
  return [];
};
const departmentItems = ["hifz", "academic"];

// ---------------------------------------------------------------------------
// Small reusable: DepartmentAwareClassSelect (used in Admission Edit)
// ---------------------------------------------------------------------------
export const DepartmentAwareClassSelect = ({
  defaultDept,
}: {
  defaultDept?: string;
  defaultClass?: string;
}) => {
  const { watch, setValue } = useFormContext();
  const selectedDept = watch("studentDepartment") || watch("studentDept") || defaultDept;
  const currentDept = selectedDept || defaultDept || "";
  const classItems = getClassItemsByDept(currentDept);

  useEffect(() => {
    if (!selectedDept) return;
    const valid = getClassItemsByDept(selectedDept);
    const currentClass = watch("className");
    // Only clear if current is string and not in valid list; if array, don't clear
    if (typeof currentClass === "string" && currentClass && !valid.includes(currentClass)) {
      setValue("className", "");
    }
  }, [selectedDept, watch, setValue]);

  return (
    <CraftSelect fullWidth label="Class" name="className" items={classItems} size="small" required />
  );
};

// ---------------------------------------------------------------------------
// 1. Personal Info Section - Unified (works for Admission + Student)
// ---------------------------------------------------------------------------
export const StudentPersonalSection = ({ mode = "admission" }: { mode?: "admission" | "student" | "enrollment" }) => {
  const theme = useTheme();
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.02), border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}` }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15), color: "primary.main" }}><Person /></Avatar>
          <Typography variant="h6" fontWeight="bold">১. শিক্ষার্থীর তথ্য / Personal Information</Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FileUploadWithIcon name="studentPhoto" label="Student Photo" />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <CraftInput fullWidth label="শিক্ষার্থীর নাম (বাংলা)" name="studentNameBangla" size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CraftInput fullWidth label="Student Name (English)" name="studentName" size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CraftSelect fullWidth label="লিঙ্গ / Gender" name="gender" items={genderOptions} size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CraftInput fullWidth label="জন্ম তারিখ" name="dateOfBirth" type="date" size="small" InputProps={{ startAdornment: <Cake sx={{ color: "text.secondary", mr: 1 }} /> } as any} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CraftSelect fullWidth label="বিভাগ" name="studentDepartment" items={departmentItems} size="small" required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                {mode === "admission" ? (
                  <DepartmentAwareClassSelect />
                ) : (
                  <StudentClassAutoComplete />
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CraftSelect fullWidth label="Category" name="category" items={STUDENT_CATEGORIES.map((c) => c.value)} size="small" required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CraftInput fullWidth label="সেশন" name="session" size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CraftInput fullWidth label="জাতীয় পরিচয়পত্র/জন্ম নিবন্ধন" name="nidBirth" size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CraftSelect fullWidth label="রক্তের গ্রুপ" name="bloodGroup" items={bloodGroups} size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CraftInput fullWidth label="জাতীয়তা" name="nationality" size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CraftInput fullWidth label="Mobile No" name="mobileNo" placeholder="01XXXXXXXXX" size="small" InputProps={{ startAdornment: <Phone sx={{ color: "text.secondary", mr: 1 }} /> } as any} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Helper for Student mode - autocomplete multi class
const StudentClassAutoComplete = () => {
  const [page] = useState(0);
  const [searchTerm] = useState("");
  const { data: classData } = useGetAllClassesQuery({ limit: 20, page: page + 1, searchTerm });
  const classOption = useMemo(() => {
    if (!classData?.data?.classes) return [];
    return classData.data.classes.map((clg: any) => ({ label: clg?.className, value: clg?._id }));
  }, [classData]);
  return (
    <CraftIntAutoCompleteWithIcon name="className" label="Class" placeholder="Select Class" options={classOption} fullWidth multiple icon={<Class color="primary" />} />
  );
};

// ---------------------------------------------------------------------------
// 2. Academic Info Section - Unified
// ---------------------------------------------------------------------------
export const StudentAcademicSection = ({ mode = "admission" }: { mode?: "admission" | "student" | "enrollment" }) => {
  const theme = useTheme();
  const [page] = useState(0);
  const [searchTerm] = useState("");
  const { data: sectionData } = useGetAllSectionsQuery({ limit: 10, page: page + 1, searchTerm });
  const sectionOption = useMemo(() => {
    if (!sectionData?.data?.sections) return [];
    return sectionData.data.sections.map((sec: any) => ({ label: sec.name, value: sec._id }));
  }, [sectionData]);

  if (mode === "admission") {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.02), border: `1px solid ${alpha(theme.palette.info.main, 0.12)}` }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.15), color: "info.main" }}><School /></Avatar>
            <Typography variant="h6" fontWeight="bold">২. পূর্ববর্তী একাডেমিক তথ্য</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}><CraftInput fullWidth label="পূর্ববর্তী প্রতিষ্ঠানের নাম" name="previousInstitution" size="small" /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><CraftInput fullWidth label="পূর্ববর্তী শ্রেণি" name="previousClass" size="small" /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><CraftInput fullWidth label="সর্বশেষ জিপিএ" name="gpa" size="small" /></Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // enrollment mode - string section, group/shift as in EnrollmentForm
  if (mode === "enrollment") {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.02), border: `1px solid ${alpha(theme.palette.success.main, 0.12)}` }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.15), color: "success.main" }}><School /></Avatar>
            <Typography variant="h6" fontWeight="bold">Academic Information</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}><CraftInput fullWidth label="Roll Number" name="rollNumber" size="small" /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><CraftSelect fullWidth label="Section" name="section" items={["A", "B", "C"]} size="small" /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><CraftSelect fullWidth label="Group" name="group" items={["Science", "Commerce", "Arts"]} size="small" /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><CraftInput fullWidth label="Optional Subject" name="optionalSubject" size="small" /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><CraftSelect fullWidth label="Shift" name="shift" items={["Morning", "Day", "Evening"]} size="small" /></Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // student mode - array sections/sessions
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: alpha("#009688", 0.02), border: `1px solid ${alpha("#009688", 0.12)}` }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Avatar sx={{ bgcolor: alpha("#009688", 0.15), color: "#00796B" }}><School /></Avatar>
          <Typography variant="h6" fontWeight="bold">Academic Information</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}><CraftInput fullWidth label="Roll Number" name="rollNumber" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><CraftInput fullWidth label="Batch" name="batch" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><CraftSelect fullWidth label="Status" name="status" items={["active", "inactive", "graduated"]} size="small" /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftIntAutoCompleteWithIcon name="section" label="Section" placeholder="Select Section" options={sectionOption} fullWidth multiple icon={<Class color="primary" />} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftIntAutoCompleteWithIcon name="activeSession" label="Active Session" placeholder="Select Session" options={[]} fullWidth multiple icon={<CalendarMonth color="primary" />} /></Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// 3. Parent Info Section
// ---------------------------------------------------------------------------
export const StudentParentSection = () => {
  const theme = useTheme();
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.secondary.main, 0.03), border: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}` }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.15), color: "secondary.main" }}><FamilyRestroom /></Avatar>
          <Typography variant="h6" fontWeight="bold">৩. অভিভাবকের তথ্য / Parent & Guardian</Typography>
        </Box>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "info.main", mb: 2 }}>পিতার তথ্য / Father</Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="পিতার নাম (বাংলা)" name="fatherNameBangla" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="Father's Name (English)" name="fatherName" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="পেশা" name="fatherProfession" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="শিক্ষাগত যোগ্যতা" name="fatherEducation" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><CraftInput fullWidth label="মোবাইল" name="fatherMobile" size="small" required /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><CraftInput fullWidth label="WhatsApp" name="fatherWhatsapp" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><CraftInput fullWidth label="NID" name="fatherNid" size="small" /></Grid>
        </Grid>

        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "secondary.main", mb: 2 }}>মাতার তথ্য / Mother</Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="মাতার নাম (বাংলা)" name="motherNameBangla" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="Mother's Name (English)" name="motherName" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="পেশা" name="motherProfession" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="শিক্ষাগত যোগ্যতা" name="motherEducation" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><CraftInput fullWidth label="মোবাইল" name="motherMobile" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><CraftInput fullWidth label="WhatsApp" name="motherWhatsapp" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><CraftInput fullWidth label="NID" name="motherNid" size="small" /></Grid>
        </Grid>

        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "warning.main", mb: 2 }}>অভিভাবক (যদি পিতা-মাতা ব্যতীত)</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="অভিভাবকের নাম (বাংলা)" name="guardianNameBangla" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="Guardian (English)" name="guardianName" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="সম্পর্ক" name="guardianRelation" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="মোবাইল" name="guardianMobile" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="WhatsApp" name="guardianWhatsapp" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="পেশা" name="guardianProfession" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftInput fullWidth label="ঠিকানা" name="guardianAddress" size="small" multiline rows={2} /></Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// 4. Address Section
// ---------------------------------------------------------------------------
export const StudentAddressSection = ({ mode = "admission" }: { mode?: "admission" | "student" | "enrollment" }) => {
  const theme = useTheme();
  const { watch, setValue } = useFormContext();
  const sameAsPermanent = watch("sameAsPermanent") || false;
  // Present is first, so watch present to sync to permanent when switch ON
  const village = watch("village");
  const postOffice = watch("postOffice");
  const postCode = watch("postCode");
  const policeStation = watch("policeStation");
  const district = watch("district");

  const handleSameToggle = (checked: boolean) => {
    setValue("sameAsPermanent", checked);
    if (checked) {
      // Present (first) -> Permanent (second) : user-friendly, present already filled
      setValue("permVillage", watch("village") || "");
      setValue("permPostOffice", watch("postOffice") || "");
      setValue("permPostCode", watch("postCode") || "");
      setValue("permPoliceStation", watch("policeStation") || "");
      setValue("permDistrict", watch("district") || "");
    }
  };

  // Live sync: when present fields change while switch is ON, auto-update permanent (present first)
  useEffect(() => {
    if (!sameAsPermanent) return;
    setValue("permVillage", village || "");
    setValue("permPostOffice", postOffice || "");
    setValue("permPostCode", postCode || "");
    setValue("permPoliceStation", policeStation || "");
    setValue("permDistrict", district || "");
  }, [village, postOffice, postCode, policeStation, district, sameAsPermanent, setValue]);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.02), border: `1px solid ${alpha(theme.palette.warning.main, 0.12)}` }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.15), color: "warning.main" }}><Home /></Avatar>
          <Typography variant="h6" fontWeight="bold">৪. ঠিকানা / Address</Typography>
          
        </Box>
        {/* Present first as requested */}
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "primary.main", mb: 2 }}>বর্তমান ঠিকানা / Present Address</Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="গ্রাম/এলাকা" name="village" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="ডাকঘর" name="postOffice" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 2 }}><CraftInput fullWidth label="পোস্ট কোড" name="postCode" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 2 }}><CraftInput fullWidth label="থানা" name="policeStation" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 2 }}><CraftInput fullWidth label="জেলা" name="district" size="small" /></Grid>
        </Grid>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "info.main", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>স্থায়ী ঠিকানা / Permanent Address {sameAsPermanent && <Typography variant="caption" color="primary.main" sx={{ ml: 1 }}>(Same as Present)</Typography>}
        {/* Switch at top right side - user-friendly, present first */}
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1, px: 2, py: 0.5, borderRadius: 2, bgcolor: sameAsPermanent ? alpha(theme.palette.primary.main, 0.08) : "transparent", border: sameAsPermanent ? `1px solid ${alpha(theme.palette.primary.main, 0.15)}` : "1px solid transparent" }}>
            <Typography variant="body2" fontWeight={sameAsPermanent ? 600 : 400} color={sameAsPermanent ? "primary.main" : "text.secondary"}>Same as Present</Typography>
            <Switch checked={sameAsPermanent} onChange={(e) => handleSameToggle(e.target.checked)} color="primary" size="small" />
          </Box>
        
        </Typography>
        <Grid container spacing={2} sx={{ opacity: sameAsPermanent ? 0.6 : 1 }}>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="গ্রাম/এলাকা" name="permVillage" size="small" required disabled={sameAsPermanent} /></Grid>
          <Grid size={{ xs: 12, md: 3 }}><CraftInput fullWidth label="ডাকঘর" name="permPostOffice" size="small" required disabled={sameAsPermanent} /></Grid>
          <Grid size={{ xs: 12, md: 2 }}><CraftInput fullWidth label="পোস্ট কোড" name="permPostCode" size="small" disabled={sameAsPermanent} /></Grid>
          <Grid size={{ xs: 12, md: 2 }}><CraftInput fullWidth label="থানা" name="permPoliceStation" size="small" required disabled={sameAsPermanent} /></Grid>
          <Grid size={{ xs: 12, md: 2 }}><CraftInput fullWidth label="জেলা" name="permDistrict" size="small" required disabled={sameAsPermanent} /></Grid>
        </Grid>
        {/* Enrollment: previous school (was in AddressDocumentsStep) */}
        {mode === "enrollment" && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "text.primary", mb: 2 }}>Previous School / পূর্ববর্তী প্রতিষ্ঠান</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}><CraftInput fullWidth label="Previous Institution" name="formerInstitution" placeholder="Previous Institution" size="small" /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><CraftInput fullWidth label="Previous Address" name="formerVillage" placeholder="Previous Address" size="small" /></Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// 5. Family Environment
// ---------------------------------------------------------------------------
export const StudentFamilyEnvironmentSection = () => {
  const theme = useTheme();
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: alpha("#FF9800", 0.04), border: `1px solid ${alpha("#FF9800", 0.15)}` }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Avatar sx={{ bgcolor: alpha("#FF9800", 0.15), color: "#E65100" }}><Home /></Avatar>
          <Typography variant="h6" fontWeight="bold">৫. পারিবারিক পরিবেশ</Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="halalIncome" label="আপনার পরিবারের উপার্জন ১০০% হালাল কি?" row options={yesNoOptions} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="parentsPrayer" label="পিতা-মাতা নিয়মিত ৫ ওয়াক্ত নামাজ পড়েন কি?" row options={yesNoOptions} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="addiction" label="পরিবারের কোন সদস্য মাদক/নেশায় আক্রান্ত?" row options={yesNoOptions} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="tv" label="বাসায় টেলিভিশন আছে কি?" row options={yesNoOptions} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="quranRecitation" label="বাসায় নিয়মিত কুরআন তিলাওয়াত করা হয়?" row options={yesNoSometimesOptions} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="purdah" label="পরিবারের সদস্যরা পর্দা পালন করে কি?" row options={yesNoTryingOptions} /></Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// 6. Behavior & Skills
// ---------------------------------------------------------------------------
export const StudentBehaviorSection = () => {
  const theme = useTheme();
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.02), border: `1px solid ${alpha(theme.palette.error.main, 0.12)}` }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.15), color: "error.main" }}><Timeline /></Avatar>
          <Typography variant="h6" fontWeight="bold">৬. আচরণ ও দক্ষতা</Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}><CraftInput fullWidth label="দৈনিক কত সময় মোবাইল ব্যবহার করে?" name="mobileUsage" placeholder="যেমন: ১ ঘণ্টা" size="small" /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="generalBehavior" label="সন্তানের আচরণ কেমন?" row options={behaviorGeneralOptions} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="obedience" label="পিতা-মাতার কথা শোনে?" row options={obedienceOptions} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="elderBehavior" label="বড়দের সাথে আচরণ?" row options={behaviorGeneralOptions} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="youngerBehavior" label="ছোটদের সাথে আচরণ?" row options={behaviorGeneralOptions} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="lyingStubbornness" label="মিথ্যা বলে বা জেদ করে?" row options={frequencyOptions} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="studyInterest" label="পড়ালেখায় আগ্রহ?" row options={interestOptions} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="religiousInterest" label="ধর্মীয় কাজে আগ্রহ?" row options={interestOptions} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><CraftRadioGroup name="angerControl" label="রাগ নিয়ন্ত্রণ?" row options={angerOptions} /></Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// 7. Documents + Terms
// ---------------------------------------------------------------------------
export const StudentDocumentsSection = () => {
  const theme = useTheme();
  const { watch, setValue } = useFormContext();
  const termsAccepted = watch("termsAccepted") || false;
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.02), border: `1px solid ${alpha(theme.palette.success.main, 0.15)}` }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.15), color: "success.main" }}><Assignment /></Avatar>
          <Typography variant="h6" fontWeight="bold">৭. ডকুমেন্টস</Typography>
        </Box>
        <Box sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05), border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`, mb: 3 }}>
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>ভর্তির সময় এই কাগজপত্রগুলো অফিসে জমা দেওয়া <strong>বাধ্যতামূলক</strong>।</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}><CraftCheckbox name="photographs" label="ছবি" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}><CraftCheckbox name="birthCertificate" label="জন্ম নিবন্ধন সনদ" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}><CraftCheckbox name="markSheet" label="মার্কশিট" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}><CraftCheckbox name="transferCertificate" label="ট্রান্সফার সার্টিফিকেট" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}><CraftCheckbox name="characterCertificate" label="চরিত্র সনদপত্র" /></Grid>
          </Grid>
        </Box>
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2" fontWeight="bold">শর্তাবলী / Terms</Typography>
            <FormControlLabel
              control={<Switch checked={termsAccepted} onChange={(e) => setValue("termsAccepted", e.target.checked)} color="primary" />}
              label="আমি ভর্তির সকল শর্ত মেনে নিচ্ছি"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

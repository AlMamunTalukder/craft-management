/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import type React from "react";

import { LoadingState } from "@/components/common/LoadingState";
import CraftIntAutoCompleteWithIcon from "@/components/Forms/AutocompleteWithIcon";
import CraftForm from "@/components/Forms/Form";
import CraftInputWithIcon from "@/components/Forms/inputWithIcon";
import CraftSelectWithIcon from "@/components/Forms/selectWithIcon";
import FileUploadWithIcon from "@/components/Forms/Upload";
import { batches, bloodGroup } from "@/options";
import { useGetAllClassesQuery } from "@/redux/api/classApi";
import { useGetAllSectionsQuery } from "@/redux/api/sectionApi";
import { useGetAllSessionsQuery } from "@/redux/api/sessionApi";
import {
  useCreateStudentsMutation,
  useGetSingleStudentQuery,
  useUpdateStudentMutation,
} from "@/redux/api/studentApi";
import {
  Badge,
  Bloodtype,
  Cake,
  CalendarMonth,
  CheckCircle,
  Class,
  ContactPhone,
  Contacts,
  CreditCard,
  Description,
  DriveFileRenameOutline,
  Home,
  LocationOn,
  People,
  Person,
  Phone,
  Save,
  School,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Snackbar,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FieldValues } from "react-hook-form";
import toast from "react-hot-toast";

interface StudentFormProps {
  id?: string;
}

const StudentForm = ({ id }: StudentFormProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [createStudents] = useCreateStudentsMutation();
  const [updateStudent] = useUpdateStudentMutation();

  const { data, isLoading } = useGetSingleStudentQuery(
    { id },
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    }
  );

  console.log('single student ', data);

  const router = useRouter();

  const [formData, setFormData] = useState({
    sameAsPermanent: false,
  });

  const [defaultValues, setDefaultValues] = useState<any>({});

  useEffect(() => {
    if (data?.data) {
      const studentData = data.data;

      console.log('Original Documents from API:', studentData.documents); // Debug log

      setFormData({
        sameAsPermanent: studentData.sameAsPermanent || false,
      });

      // Handle class mapping
      const classArray = studentData.className || [];
      const mappedClasses = Array.isArray(classArray)
        ? classArray.map((cls: any) => ({
          label: cls?.className || cls,
          value: cls?._id || cls,
        }))
        : [];

      // Handle section mapping
      const sectionArray = studentData.section || [];
      const mappedSections = Array.isArray(sectionArray)
        ? sectionArray.map((sec: any) => ({
          label: sec?.name || sec,
          value: sec?._id || sec,
        }))
        : [];

      // Handle session mapping
      const sessionArray = studentData.activeSession || [];
      const mappedSessions = Array.isArray(sessionArray)
        ? sessionArray.map((ses: any) => ({
          label: ses?.sessionName || ses,
          value: ses?._id || ses,
        }))
        : [];

      // Get address data
      const permanentAddress = studentData.permanentAddress || {};
      const presentAddress = studentData.presentAddress || {};

      // Get parent info
      const parentInfo = studentData.parentInfo || {};
      const fatherInfo = parentInfo.father || {};
      const motherInfo = parentInfo.mother || {};
      const guardianInfo = parentInfo.guardian || {};

      // Get behavior skills
      const behaviorSkills = studentData.behaviorSkills || {};

      // Get family environment
      const familyEnvironment = studentData.familyEnvironment || {};

      // Get previous school
      const previousSchool = studentData.previousSchool || {};

      // Get documents - Ensure proper boolean conversion
      const documents = studentData.documents || {};

      // CRITICAL FIX: Explicitly convert to boolean
      const birthCertificate = documents.birthCertificate === true;
      const transferCertificate = documents.transferCertificate === true;
      const markSheet = documents.markSheet === true;
      const characterCertificate = documents.characterCertificate === true;
      const photographs = documents.photographs === true;

      console.log('Processed Documents values:', {
        birthCertificate,
        transferCertificate,
        markSheet,
        characterCertificate,
        photographs
      });

      const formDefaultValues = {
        // Personal Information
        name: studentData.name || "",
        nameBangla: studentData.nameBangla || "",
        smartIdCard: studentData.smartIdCard || "",
        email: studentData.email || "",
        studentDepartment: studentData.studentDepartment || studentData.department || "",
        mobile: studentData.mobile || "",
        birthDate: studentData.birthDate ? studentData.birthDate.split('T')[0] : "",
        birthRegistrationNo: studentData.birthRegistrationNo || "",
        bloodGroup: studentData.bloodGroup || "",
        gender: studentData.gender || "",
        nationality: studentData.nationality || "Bangladeshi",
        studentPhoto: studentData.studentPhoto || "",

        // Father's Information
        fatherName: fatherInfo.nameEnglish || fatherInfo.nameBangla || "",
        fatherMobile: fatherInfo.mobile || "",
        fatherProfession: fatherInfo.profession || "",
        fatherEducation: fatherInfo.education || "",
        fatherWhatsapp: fatherInfo.whatsapp || "",

        // Mother's Information
        motherName: motherInfo.nameEnglish || motherInfo.nameBangla || "",
        motherMobile: motherInfo.mobile || "",
        motherProfession: motherInfo.profession || "",
        motherEducation: motherInfo.education || "",
        motherWhatsapp: motherInfo.whatsapp || "",

        // Guardian's Information
        guardianName: guardianInfo.nameEnglish || guardianInfo.nameBangla || "",
        guardianMobile: guardianInfo.mobile || "",
        guardianRelation: guardianInfo.relation || "",
        guardianProfession: guardianInfo.profession || "",
        guardianAddress: guardianInfo.address || "",
        guardianWhatsapp: guardianInfo.whatsapp || "",

        // Permanent Address
        permanentVillage: permanentAddress.village || "",
        permanentPostOffice: permanentAddress.postOffice || "",
        permanentPostCode: permanentAddress.postCode || "",
        permanentPoliceStation: permanentAddress.policeStation || "",
        permanentDistrict: permanentAddress.district || "",

        // Present Address
        presentVillage: presentAddress.village || "",
        presentPostOffice: presentAddress.postOffice || "",
        presentPostCode: presentAddress.postCode || "",
        presentPoliceStation: presentAddress.policeStation || "",
        presentDistrict: presentAddress.district || "",

        // Academic Information
        className: mappedClasses,
        studentClassRoll: studentData.studentClassRoll || "",
        batch: studentData.batch || "",
        section: mappedSections,
        activeSession: mappedSessions,
        status: studentData.status || "",
        studentType: studentData.studentType || studentData.category || "",
        academicYear: studentData.academicYear || "",
        session: studentData.session || "",
        additionalNote: studentData.additionalNote || "",

        // Behavior Skills
        generalBehavior: behaviorSkills.generalBehavior || "",
        elderBehavior: behaviorSkills.elderBehavior || "",
        youngerBehavior: behaviorSkills.youngerBehavior || "",
        obedience: behaviorSkills.obedience || "",
        angerControl: behaviorSkills.angerControl || "",
        lyingStubbornness: behaviorSkills.lyingStubbornness || "",
        studyInterest: behaviorSkills.studyInterest || "",
        religiousInterest: behaviorSkills.religiousInterest || "",
        mobileUsage: behaviorSkills.mobileUsage || "",

        // Family Environment
        parentsPrayer: familyEnvironment.parentsPrayer || "",
        purdah: familyEnvironment.purdah || "",
        quranRecitation: familyEnvironment.quranRecitation || "",
        halalIncome: familyEnvironment.halalIncome || "",
        addiction: familyEnvironment.addiction || "",
        tv: familyEnvironment.tv || "",

        // Previous School
        previousInstitution: previousSchool.institution || "",
        previousAddress: previousSchool.address || "",

        // Documents - Use the explicitly converted boolean values
        birthCertificate: birthCertificate,
        transferCertificate: transferCertificate,
        markSheet: markSheet,
        characterCertificate: characterCertificate,
        photographs: photographs,
      };

      setDefaultValues(formDefaultValues);
    }
  }, [data]);

  const [page] = useState(0);
  const [rowsPerPage] = useState(10);
  const [searchTerm] = useState("");

  const { data: classData } = useGetAllClassesQuery({
    limit: rowsPerPage,
    page: page + 1,
    searchTerm: searchTerm,
  });
  const { data: sectionData } = useGetAllSectionsQuery({
    limit: rowsPerPage,
    page: page + 1,
    searchTerm: searchTerm,
  });
  const { data: sessionData } = useGetAllSessionsQuery({
    limit: rowsPerPage,
    page: page + 1,
    searchTerm: searchTerm,
  });

  const classOption = useMemo(() => {
    if (!classData?.data?.classes) return [];
    return classData?.data?.classes.map((clg: any) => ({
      label: clg?.className,
      value: clg?._id,
    }));
  }, [classData]);

  const sectionOption = useMemo(() => {
    if (!sectionData?.data?.sections) return [];
    return sectionData?.data?.sections.map((sec: any) => ({
      label: sec.name,
      value: sec._id,
    }));
  }, [sectionData]);

  const sessionOption = useMemo(() => {
    if (!sessionData?.data?.sessions) return [];
    return sessionData?.data?.sessions.map((sec: any) => ({
      label: sec.sessionName,
      value: sec._id,
    }));
  }, [sessionData]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (data: FieldValues) => {
    if (!data.name) {
      toast.error("Student name is required!");
      return;
    }
    if (!data.studentDepartment) {
      toast.error("Student department is required!");
      return;
    }

    const classArray = Array.isArray(data.className)
      ? data.className.map((item: any) => item.value || item)
      : data.className
        ? [data.className]
        : [];

    const sectionArray = Array.isArray(data.section)
      ? data.section.map((item: any) => item.value || item)
      : data.section
        ? [data.section]
        : [];

    const sessionArray = Array.isArray(data.activeSession)
      ? data.activeSession.map((item: any) => item.value || item)
      : data.activeSession
        ? [data.activeSession]
        : [];

    const permanentAddress = {
      village: data.permanentVillage || "",
      postOffice: data.permanentPostOffice || "",
      postCode: data.permanentPostCode || "",
      policeStation: data.permanentPoliceStation || "",
      district: data.permanentDistrict || "",
    };

    let presentAddress = {
      village: data.presentVillage || "",
      postOffice: data.presentPostOffice || "",
      postCode: data.presentPostCode || "",
      policeStation: data.presentPoliceStation || "",
      district: data.presentDistrict || "",
    };

    if (formData.sameAsPermanent) {
      presentAddress = { ...permanentAddress };
    }

    const submissionData = {
      // Personal Information
      name: data.name,
      nameBangla: data.nameBangla || "",
      smartIdCard: data.smartIdCard || "",
      email: data.email || "",
      studentDepartment: data.studentDepartment,
      mobile: data.mobile || "",
      birthDate: data.birthDate || "",
      birthRegistrationNo: data.birthRegistrationNo || "",
      bloodGroup: data.bloodGroup || "",
      gender: data.gender || "",
      nationality: data.nationality || "Bangladeshi",
      studentPhoto: data.studentPhoto || "",

      // Parent Information
      parentInfo: {
        father: {
          nameEnglish: data.fatherName || "",
          mobile: data.fatherMobile || "",
          profession: data.fatherProfession || "",
          education: data.fatherEducation || "",
          whatsapp: data.fatherWhatsapp || "",
        },
        mother: {
          nameEnglish: data.motherName || "",
          mobile: data.motherMobile || "",
          profession: data.motherProfession || "",
          education: data.motherEducation || "",
          whatsapp: data.motherWhatsapp || "",
        },
        guardian: {
          nameEnglish: data.guardianName || "",
          mobile: data.guardianMobile || "",
          relation: data.guardianRelation || "",
          profession: data.guardianProfession || "",
          address: data.guardianAddress || "",
          whatsapp: data.guardianWhatsapp || "",
        },
      },

      // Address Information
      permanentAddress: permanentAddress,
      presentAddress: presentAddress,
      sameAsPermanent: formData.sameAsPermanent,

      // Academic Information
      className: classArray,
      studentClassRoll: data.studentClassRoll || "",
      batch: data.batch || "",
      section: sectionArray,
      activeSession: sessionArray,
      status: data.status || "",
      studentType: data.studentType || "",
      academicYear: data.academicYear || "",
      session: data.session || "",
      additionalNote: data.additionalNote || "",

      // Behavior Skills
      behaviorSkills: {
        generalBehavior: data.generalBehavior || "",
        elderBehavior: data.elderBehavior || "",
        youngerBehavior: data.youngerBehavior || "",
        obedience: data.obedience || "",
        angerControl: data.angerControl || "",
        lyingStubbornness: data.lyingStubbornness || "",
        studyInterest: data.studyInterest || "",
        religiousInterest: data.religiousInterest || "",
        mobileUsage: data.mobileUsage || "",
      },

      // Family Environment
      familyEnvironment: {
        parentsPrayer: data.parentsPrayer || "",
        purdah: data.purdah || "",
        quranRecitation: data.quranRecitation || "",
        halalIncome: data.halalIncome || "",
        addiction: data.addiction || "",
        tv: data.tv || "",
      },

      // Previous School
      previousSchool: {
        institution: data.previousInstitution || "",
        address: data.previousAddress || "",
      },

      // Documents
      documents: {
        birthCertificate: data.birthCertificate || false,
        transferCertificate: data.transferCertificate || false,
        markSheet: data.markSheet || false,
        characterCertificate: data.characterCertificate || false,
        photographs: data.photographs || false,
      },
    };

    try {
      if (id) {
        const res = await updateStudent({
          id,
          data: submissionData,
        }).unwrap();
        if (res.success) {
          toast.success("Student updated successfully!");
          setTimeout(() => {
            router.push("/dashboard/student/list");
          }, 1500);
        }
      } else {
        const res = await createStudents(submissionData).unwrap();
        if (res.success) {
          toast.success("Student registered successfully!");
          setTimeout(() => {
            router.push("/dashboard/student/list");
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(
        error.data?.message || "An error occurred while submitting the form"
      );
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "primary",
        pt: { xs: 1, sm: 2, md: 3 },
        pb: { xs: 4, sm: 6, md: 8 },
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Container maxWidth="xl" disableGutters={isMobile}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: { xs: 2, sm: 3, md: 4 } }}>
          <Person sx={{ fontSize: { xs: 30, sm: 35, md: 40 }, mr: 2, color: "primary.main" }} />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              color: "primary.main"
            }}
          >
            {id ? "Edit Student" : "New Student Registration"}
          </Typography>
        </Box>
      </Container>

      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <CraftForm
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          key={
            Object.keys(defaultValues).length > 0
              ? "form-with-data"
              : "empty-form"
          }
        >
          <Paper
            elevation={3}
            sx={{
              borderRadius: { xs: 2, sm: 3, md: 4 },
              overflow: "hidden",
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              mb: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Box sx={{ p: { xs: 1.5, sm: 2, md: 4 } }}>
              {/* Personal Information Section */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  <Person sx={{ mr: 2, color: "primary.main" }} />
                  Personal Information
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="name"
                      label={
                        <span>
                          Student Name <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      placeholder="e.g., John Smith"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <DriveFileRenameOutline
                            sx={{ color: "text.secondary", mr: 1 }}
                          />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="nameBangla"
                      label="Student Name (Bangla)"
                      placeholder="ছাত্রের নাম (বাংলা)"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <DriveFileRenameOutline
                            sx={{ color: "text.secondary", mr: 1 }}
                          />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftSelectWithIcon
                      name="studentDepartment"
                      size="medium"
                      label={
                        <span>
                          Student Department{" "}
                          <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      placeholder="Student Department"
                      items={["hifz", "academic"]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="smartIdCard"
                      label="Smart ID Card"
                      placeholder="e.g., SMART-001"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Badge sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftSelectWithIcon
                      name="gender"
                      size="medium"
                      label="Gender"
                      placeholder="Select Gender"
                      items={["male", "female", "other"]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="mobile"
                      label="Mobile Number"
                      placeholder="e.g., +1 234 567 8900"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Phone sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftSelectWithIcon
                      name="bloodGroup"
                      size="medium"
                      label="Blood Group"
                      placeholder="Select blood group"
                      items={bloodGroup}
                      adornment={<Bloodtype color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="birthDate"
                      label="Birth Date"
                      type="date"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Cake sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="birthRegistrationNo"
                      label="Birth Registration No."
                      placeholder="Birth Registration Number"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <CreditCard sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="nationality"
                      label="Nationality"
                      placeholder="e.g., Bangladeshi"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Person sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="email"
                      label="Email"
                      placeholder="e.g., example@gmail.com"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <DriveFileRenameOutline
                            sx={{ color: "text.secondary", mr: 1 }}
                          />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FileUploadWithIcon
                      name="studentPhoto"
                      label="Student Photo"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: { xs: 3, sm: 4 } }} />

              {/* Family Information Section */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  <People sx={{ mr: 2, color: "primary.main" }} />
                  Family Information
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: 500, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    >
                      Father's Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="fatherName"
                      label="Father's Name"
                      placeholder="Father's Name"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Person sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="fatherMobile"
                      label="Father's Mobile"
                      placeholder="Father's Mobile"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Phone sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="fatherProfession"
                      label="Father's Profession"
                      placeholder="Father's Profession"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Person sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="fatherEducation"
                      label="Father's Education"
                      placeholder="Father's Education"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <School sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="fatherWhatsapp"
                      label="Father's WhatsApp"
                      placeholder="Father's WhatsApp"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Phone sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: 500, fontSize: { xs: "0.9rem", sm: "1rem" }, mt: { xs: 1, sm: 2 } }}
                    >
                      Mother's Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="motherName"
                      label="Mother's Name"
                      placeholder="Mother's Name"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Person sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="motherMobile"
                      label="Mother's Mobile"
                      placeholder="Mother's Mobile"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Phone sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="motherProfession"
                      label="Mother's Profession"
                      placeholder="Mother's Profession"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Person sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="motherEducation"
                      label="Mother's Education"
                      placeholder="Mother's Education"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <School sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="motherWhatsapp"
                      label="Mother's WhatsApp"
                      placeholder="Mother's WhatsApp"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Phone sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: 500, fontSize: { xs: "0.9rem", sm: "1rem" }, mt: { xs: 1, sm: 2 } }}
                    >
                      Guardian's Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="guardianName"
                      label="Guardian's Name"
                      placeholder="Guardian's Name"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Contacts sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="guardianMobile"
                      label="Guardian's Mobile"
                      placeholder="Guardian's Mobile"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <ContactPhone
                            sx={{ color: "text.secondary", mr: 1 }}
                          />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="guardianRelation"
                      label="Relation with Guardian"
                      placeholder="e.g., Father, Mother, Uncle"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <People sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="guardianProfession"
                      label="Guardian's Profession"
                      placeholder="Guardian's Profession"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Person sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="guardianAddress"
                      label="Guardian's Address"
                      placeholder="Guardian's Address"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <LocationOn sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="guardianWhatsapp"
                      label="Guardian's WhatsApp"
                      placeholder="Guardian's WhatsApp"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Phone sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: { xs: 3, sm: 4 } }} />

              {/* Address Information Section */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  <Home sx={{ mr: 2, color: "primary.main" }} />
                  Address Information
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: 500, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    >
                      Permanent Address
                    </Typography>
                    <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
                      <Grid container spacing={{ xs: 2, sm: 2 }}>
                        <Grid item xs={12}>
                          <CraftInputWithIcon
                            fullWidth
                            label="Village"
                            name="permanentVillage"
                            placeholder="Village"
                            size="medium"
                            InputProps={{
                              startAdornment: (
                                <LocationOn
                                  sx={{ color: "text.secondary", mr: 1 }}
                                />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <CraftInputWithIcon
                            fullWidth
                            name="permanentPostOffice"
                            label="Post Office"
                            placeholder="Post Office"
                            size="medium"
                            InputProps={{
                              startAdornment: (
                                <LocationOn
                                  sx={{ color: "text.secondary", mr: 1 }}
                                />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <CraftInputWithIcon
                            fullWidth
                            name="permanentPostCode"
                            label="Post Code"
                            placeholder="Post Code"
                            size="medium"
                            InputProps={{
                              startAdornment: (
                                <LocationOn
                                  sx={{ color: "text.secondary", mr: 1 }}
                                />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <CraftInputWithIcon
                            fullWidth
                            name="permanentPoliceStation"
                            label="Police Station"
                            placeholder="Police Station"
                            size="medium"
                            InputProps={{
                              startAdornment: (
                                <LocationOn
                                  sx={{ color: "text.secondary", mr: 1 }}
                                />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <CraftInputWithIcon
                            fullWidth
                            name="permanentDistrict"
                            label="District"
                            placeholder="District"
                            size="medium"
                            InputProps={{
                              startAdornment: (
                                <LocationOn
                                  sx={{ color: "text.secondary", mr: 1 }}
                                />
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                        Present Address
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            name="sameAsPermanent"
                            checked={formData.sameAsPermanent || false}
                            onChange={handleSwitchChange}
                            color="primary"
                          />
                        }
                        label="Same as Permanent"
                        sx={{ mr: 0 }}
                      />
                    </Box>
                    <Card
                      variant="outlined"
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        opacity: formData.sameAsPermanent ? 0.7 : 1,
                      }}
                    >
                      <Grid container spacing={{ xs: 2, sm: 2 }}>
                        <Grid item xs={12}>
                          <CraftInputWithIcon
                            fullWidth
                            name="presentVillage"
                            label="Village"
                            placeholder="Village"
                            size="medium"
                            disabled={formData.sameAsPermanent}
                            InputProps={{
                              startAdornment: (
                                <LocationOn
                                  sx={{ color: "text.secondary", mr: 1 }}
                                />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <CraftInputWithIcon
                            fullWidth
                            name="presentPostOffice"
                            label="Post Office"
                            placeholder="Post Office"
                            size="medium"
                            disabled={formData.sameAsPermanent}
                            InputProps={{
                              startAdornment: (
                                <LocationOn
                                  sx={{ color: "text.secondary", mr: 1 }}
                                />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <CraftInputWithIcon
                            fullWidth
                            name="presentPostCode"
                            label="Post Code"
                            placeholder="Post Code"
                            size="medium"
                            disabled={formData.sameAsPermanent}
                            InputProps={{
                              startAdornment: (
                                <LocationOn
                                  sx={{ color: "text.secondary", mr: 1 }}
                                />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <CraftInputWithIcon
                            fullWidth
                            name="presentPoliceStation"
                            label="Police Station"
                            placeholder="Police Station"
                            size="medium"
                            disabled={formData.sameAsPermanent}
                            InputProps={{
                              startAdornment: (
                                <LocationOn
                                  sx={{ color: "text.secondary", mr: 1 }}
                                />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <CraftInputWithIcon
                            fullWidth
                            name="presentDistrict"
                            label="District"
                            placeholder="District"
                            size="medium"
                            disabled={formData.sameAsPermanent}
                            InputProps={{
                              startAdornment: (
                                <LocationOn
                                  sx={{ color: "text.secondary", mr: 1 }}
                                />
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: { xs: 3, sm: 4 } }} />

              {/* Academic Information Section */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  <School sx={{ mr: 2, color: "primary.main" }} />
                  Academic Information
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={3}>
                    <CraftIntAutoCompleteWithIcon
                      name="className"
                      label="Class"
                      placeholder="Select Class"
                      options={classOption}
                      fullWidth
                      multiple
                      icon={<Class color="primary" />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="studentClassRoll"
                      label="Class Roll"
                      placeholder="Class Roll"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Badge sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <CraftSelectWithIcon
                      name="batch"
                      size="medium"
                      label="Batch"
                      placeholder="Select Batch"
                      items={batches}
                      adornment={<People color="action" />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <CraftIntAutoCompleteWithIcon
                      name="section"
                      size="medium"
                      placeholder="Select Section"
                      label="Section"
                      options={sectionOption}
                      fullWidth
                      multiple
                      icon={<Class color="primary" />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <CraftIntAutoCompleteWithIcon
                      name="activeSession"
                      size="medium"
                      placeholder="Select Active Session"
                      options={sessionOption}
                      label="Active Session"
                      fullWidth
                      multiple
                      icon={<CalendarMonth color="primary" />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <CraftSelectWithIcon
                      name="status"
                      size="medium"
                      label="Status"
                      placeholder="Select Status"
                      items={["active", "inactive", "graduated"]}
                      adornment={<CheckCircle color="action" />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <CraftSelectWithIcon
                      name="studentType"
                      size="medium"
                      label="Category"
                      placeholder="Select Student Type"
                      items={['Residential',
                        'Non-Residential',
                        'Day Care',
                        'Non-Residential One Meal',
                        'Day Care One Meal',]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="academicYear"
                      label="Academic Year"
                      placeholder="e.g., 2026-2027"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <CalendarMonth sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <CraftInputWithIcon
                      fullWidth
                      name="session"
                      label="Session"
                      placeholder="e.g., 2026"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <CalendarMonth sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <CraftInputWithIcon
                      fullWidth
                      name="additionalNote"
                      label="Additional Notes"
                      placeholder="Additional Notes"
                      size="medium"
                      multiline
                      rows={3}
                      InputProps={{
                        startAdornment: (
                          <Description
                            sx={{
                              color: "text.secondary",
                              mr: 1,
                              alignSelf: "flex-start",
                              mt: 1.5,
                            }}
                          />
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: { xs: 3, sm: 4 } }} />

              {/* Behavior Skills Section */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  <People sx={{ mr: 2, color: "primary.main" }} />
                  Behavior & Skills
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <CraftSelectWithIcon
                      name="generalBehavior"
                      size="medium"
                      label="General Behavior"
                      placeholder="Select"
                      items={["Very Good", "Good", "Average", "Needs Improvement"]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CraftSelectWithIcon
                      name="elderBehavior"
                      size="medium"
                      label="Behavior with Elders"
                      placeholder="Select"
                      items={["Very Good", "Good", "Average", "Needs Improvement"]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CraftSelectWithIcon
                      name="youngerBehavior"
                      size="medium"
                      label="Behavior with Younger"
                      placeholder="Select"
                      items={["Very Good", "Good", "Average", "Needs Improvement"]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CraftSelectWithIcon
                      name="obedience"
                      size="medium"
                      label="Obedience"
                      placeholder="Select"
                      items={["Always", "Somewhat", "Sometimes", "Rarely"]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CraftSelectWithIcon
                      name="angerControl"
                      size="medium"
                      label="Anger Control"
                      placeholder="Select"
                      items={["Excellent", "Good", "Needs Improvement", "Poor"]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CraftSelectWithIcon
                      name="lyingStubbornness"
                      size="medium"
                      label="Lying / Stubbornness"
                      placeholder="Select"
                      items={["Never", "Rarely", "Sometimes", "Often"]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CraftSelectWithIcon
                      name="studyInterest"
                      size="medium"
                      label="Study Interest"
                      placeholder="Select"
                      items={["High", "Moderate", "Low", "Very Low"]}
                      adornment={<School color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CraftSelectWithIcon
                      name="religiousInterest"
                      size="medium"
                      label="Religious Interest"
                      placeholder="Select"
                      items={["High", "Moderate", "Low", "Very Low"]}
                      adornment={<School color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CraftInputWithIcon
                      fullWidth
                      name="mobileUsage"
                      label="Mobile Usage (Daily)"
                      placeholder="e.g., ৫ মিনিট"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Phone sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: { xs: 3, sm: 4 } }} />

              {/* Family Environment Section */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  <Home sx={{ mr: 2, color: "primary.main" }} />
                  Family Environment
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={3}>
                    <CraftSelectWithIcon
                      name="parentsPrayer"
                      size="medium"
                      label="Parents Prayer"
                      placeholder="Select"
                      items={["Yes", "No", "Sometimes"]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftSelectWithIcon
                      name="purdah"
                      size="medium"
                      label="Purdah"
                      placeholder="Select"
                      items={["Yes", "No", "Sometimes"]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftSelectWithIcon
                      name="quranRecitation"
                      size="medium"
                      label="Quran Recitation"
                      placeholder="Select"
                      items={["Regularly", "Sometimes", "Rarely", "Never"]}
                      adornment={<School color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftSelectWithIcon
                      name="halalIncome"
                      size="medium"
                      label="Halal Income"
                      placeholder="Select"
                      items={["Yes", "No", "Partially"]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftSelectWithIcon
                      name="addiction"
                      size="medium"
                      label="Addiction"
                      placeholder="Select"
                      items={["Yes", "No"]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <CraftSelectWithIcon
                      name="tv"
                      size="medium"
                      label="TV at Home"
                      placeholder="Select"
                      items={["Yes", "No"]}
                      adornment={<Person color="action" />}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: { xs: 3, sm: 4 } }} />

              {/* Previous School Section */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  <School sx={{ mr: 2, color: "primary.main" }} />
                  Previous School Information
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <CraftInputWithIcon
                      fullWidth
                      name="previousInstitution"
                      label="Previous Institution"
                      placeholder="Previous School/Madrasa Name"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <School sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CraftInputWithIcon
                      fullWidth
                      name="previousAddress"
                      label="Previous Institution Address"
                      placeholder="Address"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <LocationOn sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: { xs: 3, sm: 4 } }} />

              {/* Documents Section */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  <Description sx={{ mr: 2, color: "primary.main" }} />
                  Documents
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="birthCertificate"
                          color="primary"
                          checked={defaultValues?.birthCertificate || false}
                          onChange={(e) => {
                            const newValue = e.target.checked;
                            setDefaultValues((prev: any) => ({
                              ...prev,
                              birthCertificate: newValue
                            }));
                          }}
                        />
                      }
                      label="Birth Certificate"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="transferCertificate"
                          color="primary"
                          checked={defaultValues?.transferCertificate || false}
                          onChange={(e) => {
                            const newValue = e.target.checked;
                            setDefaultValues((prev: any) => ({
                              ...prev,
                              transferCertificate: newValue
                            }));
                          }}
                        />
                      }
                      label="Transfer Certificate"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="markSheet"
                          color="primary"
                          checked={defaultValues?.markSheet || false}
                          onChange={(e) => {
                            const newValue = e.target.checked;
                            setDefaultValues((prev: any) => ({
                              ...prev,
                              markSheet: newValue
                            }));
                          }}
                        />
                      }
                      label="Mark Sheet"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="characterCertificate"
                          color="primary"
                          checked={defaultValues?.characterCertificate || false}
                          onChange={(e) => {
                            const newValue = e.target.checked;
                            setDefaultValues((prev: any) => ({
                              ...prev,
                              characterCertificate: newValue
                            }));
                          }}
                        />
                      }
                      label="Character Certificate"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="photographs"
                          color="primary"
                          checked={defaultValues?.photographs || false}
                          onChange={(e) => {
                            const newValue = e.target.checked;
                            setDefaultValues((prev: any) => ({
                              ...prev,
                              photographs: newValue
                            }));
                          }}
                        />
                      }
                      label="Photographs"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: { xs: 3, sm: 4 } }} />

              {/* Form Actions */}
              <Box
                sx={{
                  mt: { xs: 3, sm: 4 },
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<Save />}
                  fullWidth={isMobile}
                  sx={{
                    borderRadius: 100,
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                    boxShadow: "0 4px 10px rgba(33, 150, 243, 0.3)",
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  {id ? "Update Student" : "Register Student"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </CraftForm>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentForm;
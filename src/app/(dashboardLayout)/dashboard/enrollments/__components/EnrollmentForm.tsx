/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CraftIntAutoCompleteWithIcon from "@/components/Forms/AutocompleteWithIcon";
import { StudentFormWrapper } from "@/components/student/StudentFormWrapper";
import { admissionToFormValues, enrollmentToFormValues } from "@/components/student/studentFieldMappers";
import { STUDENT_CATEGORIES } from "@/constant/studentCategory";
import { useAcademicOption } from "@/hooks/useAcademicOption";
import {
  useCreateEnrollmentMutation,
  useGetSingleEnrollmentQuery,
  useUpdateEnrollmentMutation,
} from "@/redux/api/enrollmentApi";
import { useGetAllAdmissionApplicationsQuery } from "@/redux/api/admissionApplication";
import { Assignment, Check, FileCopy, Payment, Save, School } from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import PrintModal from "../../student/profile/__components/PrintModal";

// Category options
const CATEGORY_OPTIONS = STUDENT_CATEGORIES.map((c) => ({ label: c.label, value: c.value }));

// AdmissionApplicationSelector — kept same as before for auto-fill
const AdmissionApplicationSelector = ({ onSelect }: { onSelect: (application: any) => void }) => {
  const theme = useTheme();
  const { data: applicationsData, isLoading } = useGetAllAdmissionApplicationsQuery({ limit: 100, status: "approved" });
  const options = applicationsData?.data?.map((app: any) => ({
    label: `${app.applicationId || app._id} - ${app.studentInfo?.nameEnglish || app.studentInfo?.nameBangla || "Unknown"}`,
    value: app._id,
    application: app,
  })) || [];
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const handleApplicationSelect = (event: any, value: any) => {
    if (value && value.application) {
      setSelectedApp(value.application);
      onSelect(value.application);
      toast.success(`Application for ${value.application?.studentInfo?.nameBangla || "Student"} loaded`);
    } else setSelectedApp(null);
  };
  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", top: 0, right: 0, p: 1 }}>
        <Chip icon={<FileCopy fontSize="small" />} label="Auto-fill from Application" size="small" color="primary" variant="outlined" />
      </Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <CraftIntAutoCompleteWithIcon name="admissionApplication" label="Select Admission Application" placeholder="Search by ID or Student Name..." options={options} size="medium" multiple={false} icon={<Assignment color="primary" />} onChange={handleApplicationSelect} loading={isLoading} fullWidth helperText="Select an approved application to auto-fill the form" />
        </Grid>
        <Grid item xs={12} md={4}>
          {selectedApp && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <Chip label={`Status: ${selectedApp.status}`} color={selectedApp.status === "approved" ? "success" : "warning"} size="small" />
              <Chip label={`ID: ${selectedApp.applicationId || selectedApp._id?.slice(-6)}`} variant="outlined" size="small" />
              {selectedApp.studentInfo && <Chip label={`Class: ${selectedApp.studentInfo.class}`} variant="outlined" size="small" color="primary" />}
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

const EnrollmentForm = ({ applicationId, admissionApplications }: any) => {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [enrolledStudentData, setEnrolledStudentData] = useState<any>(null);
  const [isApplicationLoading, setIsApplicationLoading] = useState(false);

  const { classOptions } = useAcademicOption();
  const [createEnrollment] = useCreateEnrollmentMutation();
  const [updateEnrollment] = useUpdateEnrollmentMutation();
  const { data: singleEnrollment, isLoading: enrollmentLoading } = useGetSingleEnrollmentQuery(id ? { id } : undefined, { skip: !id });

  const [submitting, setSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (id && singleEnrollment && classOptions.length > 0) {
      const transformedData = enrollmentToFormValues(singleEnrollment, classOptions);
      if (transformedData) {
        setDefaultValues(transformedData);
        setFormKey((prev) => prev + 1);
      }
    } else if (applicationId && admissionApplications?.data?.length > 0) {
      setIsApplicationLoading(true);
      const application = admissionApplications.data[0];
      const formData = admissionToFormValues(application, classOptions);
      if (formData) {
        // Ensure enrollment-specific aliases + className must be array for Autocomplete multiple
        const enrollmentFormData: any = {
          ...formData,
          mobileNo: (formData as any).fatherMobile || formData.mobileNo || "",
          studentName: formData.studentName || (formData as any).name || "",
          studentNameBangla: formData.studentNameBangla || (formData as any).nameBangla || "",
          className: (formData as any).classNameArray || (formData.className ? [{ label: formData.className, value: formData.className }] : []),
        };
        // Ensure section is string for enrollment (not array)
        if (Array.isArray(enrollmentFormData.section)) enrollmentFormData.section = enrollmentFormData.section[0] || "";
        setDefaultValues(enrollmentFormData);
        setFormKey((prev) => prev + 1);
        toast.success(`Application ${application.applicationId} loaded successfully`);
      } else toast.error("Failed to load application data");
      setIsApplicationLoading(false);
    } else if (!id && !applicationId) {
      setDefaultValues({
        studentId: "",
        studentNameBangla: "",
        studentPhoto: "",
        fatherNameBangla: "",
        motherNameBangla: "",
        studentName: "",
        mobileNo: "",
        session: new Date().getFullYear().toString(),
        category: "Residential",
        dateOfBirth: "",
        nidBirth: "",
        bloodGroup: "",
        nationality: "Bangladeshi",
        fatherName: "",
        fatherMobile: "",
        fatherNid: "",
        fatherProfession: "",
        fatherIncome: 0,
        motherName: "",
        motherMobile: "",
        motherNid: "",
        motherProfession: "",
        motherIncome: 0,
        className: [],
        studentDepartment: "hifz",
        rollNumber: "",
        section: "",
        group: "",
        optionalSubject: "",
        shift: "",
        admissionType: "",
        village: "",
        postOffice: "",
        postCode: "",
        policeStation: "",
        district: "",
        permVillage: "",
        permPostOffice: "",
        permPostCode: "",
        permPoliceStation: "",
        permDistrict: "",
        guardianName: "",
        guardianRelation: "",
        guardianMobile: "",
        guardianVillage: "",
        formerInstitution: "",
        formerVillage: "",
        birthCertificate: false,
        transferCertificate: false,
        characterCertificate: false,
        markSheet: false,
        photographs: false,
        termsAccepted: false,
        sameAsPermanent: false,
      });
      setFormKey((prev) => prev + 1);
    }
  }, [id, applicationId, singleEnrollment, admissionApplications, classOptions]);

  const handleApplicationSelect = useCallback((application: any) => {
    if (!application) return;
    const formData = admissionToFormValues(application, classOptions);
    if (formData) {
      const enrollmentFormData: any = {
        ...formData,
        mobileNo: (formData as any).fatherMobile || formData.mobileNo || "",
        studentName: formData.studentName || "",
        studentNameBangla: formData.studentNameBangla || "",
        className: (formData as any).classNameArray || (formData.className ? [{ label: formData.className, value: formData.className }] : []),
      };
      if (Array.isArray(enrollmentFormData.section)) enrollmentFormData.section = enrollmentFormData.section[0] || "";
      setFormKey((prev) => prev + 1);
      toast.success(`Application data loaded for ${formData.studentNameBangla || formData.studentName}`);
    } else toast.error("Failed to load application data");
  }, [classOptions]);

  const handleFinishProcess = () => {
    setOpenSuccessModal(false);
    setOpenPrintModal(false);
    router.push(`/dashboard/student/list`);
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      const { studentIdSelect, studentNameSelect, ...submitData } = data;

      if (!submitData.studentName) { toast.error("Student name is required"); setSubmitting(false); return; }
      if (!submitData.mobileNo) { toast.error("Mobile number is required"); setSubmitting(false); return; }
      if (!submitData.className || submitData.className.length === 0) { toast.error("Class selection is required"); setSubmitting(false); return; }
      if (!submitData.category) { toast.error("Category selection is required"); setSubmitting(false); return; }

      const classNameArray = submitData.className.map((cls: any) => cls.value || cls).filter(Boolean);
      if (!classNameArray.length) { toast.error("Class selection is required"); setSubmitting(false); return; }

      const studentPhotoValue = typeof submitData.studentPhoto === "string" && submitData.studentPhoto.startsWith("data:") ? "" : submitData.studentPhoto || "";

      const finalSubmitData: any = {
        studentName: submitData.studentName || "",
        nameBangla: submitData.studentNameBangla || "",
        studentPhoto: studentPhotoValue,
        mobileNo: submitData.mobileNo || "",
        rollNumber: submitData.rollNumber || "",
        birthDate: submitData.dateOfBirth ? new Date(submitData.dateOfBirth).toISOString() : "",
        birthRegistrationNo: submitData.nidBirth || "",
        bloodGroup: submitData.bloodGroup || "",
        nationality: submitData.nationality || "Bangladeshi",
        className: classNameArray,
        section: submitData.section || "",
        roll: submitData.rollNumber || "",
        session: submitData.session || String(new Date().getFullYear()),
        group: submitData.group || "",
        category: submitData.category || "Residential",
        studentDepartment: submitData.studentDepartment || "hifz",
        fatherName: submitData.fatherName || "",
        fatherNameBangla: submitData.fatherNameBangla || "",
        fatherMobile: submitData.fatherMobile || "",
        fatherNid: submitData.fatherNid || "",
        fatherProfession: submitData.fatherProfession || "",
        fatherIncome: Number(submitData.fatherIncome) || 0,
        fatherWhatsapp: submitData.fatherWhatsapp || "",
        fatherEducation: submitData.fatherEducation || "",
        motherName: submitData.motherName || "",
        motherNameBangla: submitData.motherNameBangla || "",
        motherMobile: submitData.motherMobile || "",
        motherNid: submitData.motherNid || "",
        motherProfession: submitData.motherProfession || "",
        motherIncome: Number(submitData.motherIncome) || 0,
        motherWhatsapp: submitData.motherWhatsapp || "",
        motherEducation: submitData.motherEducation || "",
        guardianName: submitData.guardianName || "",
        guardianRelation: submitData.guardianRelation || "",
        guardianMobile: submitData.guardianMobile || "",
        guardianWhatsapp: submitData.guardianWhatsapp || "",
        guardianProfession: submitData.guardianProfession || "",
        guardianVillage: submitData.guardianVillage || submitData.guardianAddress || "",
        presentAddress: { village: submitData.village || "", postOffice: submitData.postOffice || "", postCode: submitData.postCode || "", policeStation: submitData.policeStation || "", district: submitData.district || "" },
        permanentAddress: { village: submitData.permVillage || "", postOffice: submitData.permPostOffice || "", postCode: submitData.permPostCode || "", policeStation: submitData.permPoliceStation || "", district: submitData.permDistrict || "" },
        previousSchool: { institution: submitData.formerInstitution || "", address: submitData.formerVillage || "" },
        documents: { birthCertificate: Boolean(submitData.birthCertificate), transferCertificate: Boolean(submitData.transferCertificate), characterCertificate: Boolean(submitData.characterCertificate), markSheet: Boolean(submitData.markSheet), photographs: Boolean(submitData.photographs) },
        termsAccepted: Boolean(submitData.termsAccepted),
        familyEnvironment: submitData.familyEnvironment,
        behaviorSkills: submitData.behaviorSkills,
      };

      let res;
      if (id) res = await updateEnrollment({ id, data: finalSubmitData }).unwrap();
      else res = await createEnrollment({ data: finalSubmitData, applicationId }).unwrap();

      if (res?.success) {
        toast.success(res?.message || "Student enrolled successfully");
        setEnrolledStudentData(res.data);
        setOpenSuccessModal(true);
      } else throw new Error(res?.message || "Failed to enroll student");
    } catch (err: any) {
      let errorMessage = "Failed to enroll student!";
      if (err?.data?.message) errorMessage = err.data.message;
      else if (err?.data?.errorSources?.[0]?.message) errorMessage = err.data.errorSources[0].message;
      else if (err?.message) errorMessage = err.message;
      toast.error(errorMessage);
      console.error("Submission error:", err);
    } finally { setSubmitting(false); }
  };

  if (enrollmentLoading || isApplicationLoading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  }

  if (!defaultValues) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ bgcolor: alpha(theme.palette.background.default, 0.5), minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3, background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" sx={{ width: "100%", flex: 1 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}><School sx={{ color: "#fff", fontSize: 32 }} /></Avatar>
            <Box ml={2} display="flex" justifyContent="space-between" alignItems="center" sx={{ width: "100%", flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.primary" }}>Student Enrollment</Typography>
              {admissionApplications?.data?.[0] && (
                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {admissionApplications.data[0].studentInfo?.nameEnglish || admissionApplications.data[0].studentInfo?.nameBangla || "Student Name"}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>

        {!id && !applicationId && <AdmissionApplicationSelector onSelect={handleApplicationSelect} />}

        {/* Replaced 4 custom steps (StudentInformationStep, AcademicStep, ParentGuardianStep, AddressDocumentsStep) with single shared wrapper */}
        <Paper elevation={0} sx={{ p: 0, borderRadius: 3, background: "#fff", boxShadow: "0 4px 30px rgba(0,0,0,0.03)", overflow: "visible", minHeight: 600 }}>
          <CardContent sx={{ p: 4 }}>
            <StudentFormWrapper
              defaultValues={defaultValues}
              formKey={formKey}
              onSubmit={handleSubmit}
              isSubmitting={submitting}
              mode="enrollment"
              submitLabel={id ? "Update Enrollment" : "Submit Application"}
              showCancel={false}
            />
          </CardContent>
        </Paper>
      </Container>

      <Dialog open={openSuccessModal} onClose={() => {}} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2, textAlign: "center" } }}>
        <DialogContent sx={{ py: 4 }}>
          <Avatar sx={{ bgcolor: "success.main", width: 64, height: 64, margin: "0 auto 16px" }}><Check sx={{ fontSize: 40, color: "#fff" }} /></Avatar>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Enrollment Successful!</Typography>
          <Typography variant="body2" color="text.secondary">Student has been enrolled successfully for the session {new Date().getFullYear()}.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Name: <strong>{enrolledStudentData?.studentName}</strong></Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3, flexDirection: "column" }}>
          <Box sx={{ display: "flex", gap: 2, width: "100%", justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={() => { setOpenSuccessModal(false); const sid = enrolledStudentData?.data?.student?._id || enrolledStudentData?.data?._id || enrolledStudentData?._id; router.push(`/dashboard/student/profile/${sid}?tab=3`); }} startIcon={<Payment />} sx={{ borderRadius: 2, px: 3 }}>Pay Now</Button>
          </Box>
          <Button variant="text" onClick={() => { setOpenSuccessModal(false); setOpenPrintModal(false); router.push(`/dashboard/student/list`); }}>Close & Go to List</Button>
        </DialogActions>
      </Dialog>

      <PrintModal open={openPrintModal} setOpen={setOpenPrintModal} receipt={enrolledStudentData?.data?.receipt} student={enrolledStudentData?.data?.student || enrolledStudentData} onClose={() => { setTimeout(() => { window.location.href = "/dashboard/student/list"; }, 100); }} />
    </Box>
  );
};

export default EnrollmentForm;

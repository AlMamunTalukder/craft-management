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
import { Assignment, Check, FileCopy, Payment, Save, School, Celebration, AccountBalanceWallet, Visibility, ArrowForward } from "@mui/icons-material";
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
  const [submittedInfo, setSubmittedInfo] = useState<any>(null);
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

      // Keep submitted names for success popup (actual student name — not reused legacy student)
      setSubmittedInfo({
        studentName: finalSubmitData.studentName,
        nameBangla: finalSubmitData.nameBangla,
        category: finalSubmitData.category,
        className: classNameArray.join(", "),
      });
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
    <Box sx={{ bgcolor: "#f6f7fb", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            "&::after": { content: '""', position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", bgcolor: alpha("#fff", 0.08) },
          }}
        >
          <Box display="flex" alignItems="center" sx={{ width: "100%", flex: 1, position: "relative", zIndex: 1 }}>
            <Avatar sx={{ bgcolor: alpha("#fff", 0.22), width: 56, height: 56, border: `2px solid ${alpha("#fff", 0.3)}` }}><School sx={{ color: "#fff", fontSize: 30 }} /></Avatar>
            <Box ml={2} display="flex" justifyContent="space-between" alignItems="center" sx={{ width: "100%", flex: 1, flexWrap: "wrap", gap: 1 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>Student Enrollment</Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>Fill related fields step-by-step • Category & Class drive automatic fee generation</Typography>
              </Box>
              {admissionApplications?.data?.[0] && (
                <Chip
                  icon={<Celebration sx={{ color: "#fff !important" }} />}
                  label={admissionApplications.data[0].studentInfo?.nameEnglish || admissionApplications.data[0].studentInfo?.nameBangla || "Selected"}
                  sx={{ bgcolor: alpha("#fff", 0.18), color: "#fff", fontWeight: 700, border: `1px solid ${alpha("#fff",0.25)}` }}
                />
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

      <Dialog open={openSuccessModal} onClose={() => {}} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden", p: 0 } }}>
        <Box sx={{ background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", p: 3, textAlign: "center", color: "white" }}>
          <Avatar sx={{ bgcolor: alpha("#fff", 0.22), width: 72, height: 72, margin: "0 auto 12px", border: `3px solid ${alpha("#fff",0.4)}` }}><Celebration sx={{ fontSize: 38, color: "#fff" }} /></Avatar>
          <Typography variant="h5" fontWeight={800}>Enrollment Successful! 🎉</Typography>
          <Typography variant="body2" sx={{ opacity: 0.95, mt: 0.5 }}>Session {new Date().getFullYear()} • Fees auto-generated for this student</Typography>
        </Box>
        <DialogContent sx={{ py: 3, textAlign: "center" }}>
          {(() => {
            // Prioritize actual submitted name (Talukder) over any reused legacy student
            const st = enrolledStudentData?.student || enrolledStudentData?.data?.student || enrolledStudentData;
            const actualNameBangla = submittedInfo?.nameBangla || st?.nameBangla || "";
            const actualNameEn = submittedInfo?.studentName || st?.name || "";
            const displayName = actualNameBangla || actualNameEn || "Student";
            const displaySecond = actualNameBangla && actualNameEn && actualNameBangla !== actualNameEn ? actualNameEn : "";
            const sId = st?.studentId || st?.studentCode || "—";
            const sClass = submittedInfo?.className || (Array.isArray(st?.className) ? st.className.map((c: any) => c?.className || c).join(", ") : st?.class || st?.className?.className || "—");
            const sCat = submittedInfo?.category || st?.category || st?.studentType || "Residential";
            return (
              <>
                <Chip icon={<Check sx={{ fontSize: 16 }} />} label={displayName} color="success" sx={{ fontWeight: 700, px: 1.5, py: 1, fontSize: "0.95rem" }} />
                {displaySecond && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{displaySecond}</Typography>}
                {applicationId && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>Application {applicationId} • {displayName}</Typography>}
                <Box sx={{ display: "flex", gap: 1, mt: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
                  <Chip label={`ID: ${sId}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  <Chip label={`Class: ${sClass}`} size="small" color="primary" variant="outlined" />
                  <Chip label={sCat} size="small" color="secondary" variant="outlined" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.6 }}>
                  Due fees are now ready. Collect payment instantly without visiting <b>/fees/generate</b>.
                </Typography>
                <Paper elevation={0} sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.06), border: `1px dashed ${alpha(theme.palette.info.main, 0.2)}`, textAlign: "left" }}>
                  <Typography variant="caption" fontWeight={700} color="info.main" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Visibility sx={{ fontSize: 14 }} /> Where to find payment if you skip now?
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, lineHeight: 1.5 }}>
                    Go to <b>Dashboard → Student List</b> → search by <b>Name / ID ({sId})</b> → click <b>Eye (View)</b> → open <b>Due Fees</b> tab (tab=3) → <b>Pay Now</b>.
                  </Typography>
                </Paper>
              </>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 1.5, pb: 3, px: 3, flexDirection: "column" }}>
          <Box sx={{ display: "flex", gap: 1.5, width: "100%", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => { setOpenSuccessModal(false); const sid = enrolledStudentData?.data?.student?._id || enrolledStudentData?.data?._id || enrolledStudentData?._id; router.push(`/dashboard/student/profile/${sid}?tab=3`); }}
              startIcon={<AccountBalanceWallet />}
              endIcon={<ArrowForward />}
              sx={{
                flex: 1,
                minWidth: 160,
                py: 1.4,
                borderRadius: 2,
                fontWeight: 800,
                textTransform: "none",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": { background: "linear-gradient(135deg, #5a6fd6 0%, #6a3fb5 100%)" },
                boxShadow: "0 6px 16px rgba(102,126,234,0.35)",
              }}
            >
              Pay Now
            </Button>
            <Button
              variant="outlined"
              onClick={() => { setOpenSuccessModal(false); const sid = enrolledStudentData?.data?.student?._id || enrolledStudentData?.data?._id || enrolledStudentData?._id; if (sid) router.push(`/dashboard/student/profile/${sid}`); }}
              startIcon={<Visibility />}
              sx={{ borderRadius: 2, fontWeight: 600, textTransform: "none", minWidth: 130 }}
            >
              View Profile
            </Button>
          </Box>
          <Button variant="text" size="small" onClick={() => { setOpenSuccessModal(false); setOpenPrintModal(false); router.push(`/dashboard/student/list`); }} sx={{ textTransform: "none" }}>
            Close & Go to Student List →
          </Button>
        </DialogActions>
      </Dialog>

      <PrintModal open={openPrintModal} setOpen={setOpenPrintModal} receipt={enrolledStudentData?.data?.receipt} student={enrolledStudentData?.data?.student || enrolledStudentData} onClose={() => { setTimeout(() => { window.location.href = "/dashboard/student/list"; }, 100); }} />
    </Box>
  );
};

export default EnrollmentForm;

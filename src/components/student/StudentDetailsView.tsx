/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { formatDate } from "@/utils/formateDate";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Assignment,
  Bloodtype,
  CalendarToday,
  CheckCircleOutline,
  CancelOutlined,
  Description,
  FamilyRestroom,
  Fingerprint,
  Flag,
  Home,
  LocalPhone,
  Map,
  Person,
  School,
  Wc,
  Female,
  Male,
  WhatsApp as WhatsAppIcon,
} from "@mui/icons-material";
import React, { useMemo } from "react";
import { DEPARTMENT_COLORS, DEPARTMENT_LABELS, DOCUMENT_LABELS, getStatusConfig } from "@/constant/admissionConstants";
import { admissionToFormValues, studentToFormValues } from "./studentFieldMappers";

// ---------------------------------------------------------------------------
// Small internal helpers - reused from UtilityComponents but self-contained
// ---------------------------------------------------------------------------
const InfoRow = ({ label, value, icon }: { label: string; value?: any; icon?: React.ReactNode }) => (
  <TableRow>
    <TableCell sx={{ border: "none", fontWeight: "bold", width: "40%", py: 1 }}>{label}</TableCell>
    <TableCell sx={{ border: "none", py: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon}
        <Typography variant="body2">{value || "N/A"}</Typography>
      </Box>
    </TableCell>
  </TableRow>
);

const DepartmentChip = ({ department }: { department?: string }) => {
  const normalized = department?.toLowerCase() || "";
  const color = DEPARTMENT_COLORS[normalized] || "#6B7280";
  const label = DEPARTMENT_LABELS[normalized] || department || "N/A";
  return (
    <Chip label={label} size="small" sx={{ backgroundColor: `${color}20`, color, fontWeight: 600, borderRadius: "8px", border: `1px solid ${color}30` }} />
  );
};

const StatusChip = ({ status }: { status?: string }) => {
  const config = getStatusConfig(status);
  return <Chip label={config.label} color={config.color as any} size="small" sx={{ fontWeight: 600, borderRadius: "8px" }} />;
};

const GenderIcon = ({ gender }: { gender?: string }) => {
  switch (gender?.toLowerCase()) {
    case "male": return <Male sx={{ color: "#3B82F6" }} />;
    case "female": return <Female sx={{ color: "#EC4899" }} />;
    default: return <Wc sx={{ color: "#8B5CF6" }} />;
  }
};

const DocumentItem = ({ label, value }: { label: string; value?: boolean }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, borderRadius: 2, bgcolor: value ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1) }}>
      {value ? <CheckCircleOutline color="success" fontSize="small" /> : <CancelOutlined color="error" fontSize="small" />}
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Unified Details View - Single design for ALL details pages
// Supports both Admission application object and Student object
// ---------------------------------------------------------------------------
export interface StudentDetailsViewProps {
  data: any; // admission application or student
  mode: "admission" | "student";
  title?: string;
}

export const StudentDetailsView = ({ data, mode, title }: StudentDetailsViewProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const normalized = useMemo(() => {
    if (!data) return null;
    const raw = data.data || data;
    // Use mappers to normalize
    if (mode === "admission") {
      const fv = admissionToFormValues(raw);
      const s = raw.studentInfo || {};
      const a = raw.academicInfo || {};
      const p = raw.parentInfo || {};
      const addr = raw.address || {};
      return {
        photo: s.studentPhoto || fv.studentPhoto,
        nameBangla: s.nameBangla || fv.studentNameBangla,
        nameEnglish: s.nameEnglish || fv.studentName,
        gender: s.gender || fv.gender,
        dob: s.dateOfBirth || fv.dateOfBirth,
        age: s.age || fv.age,
        bloodGroup: s.bloodGroup || fv.bloodGroup,
        nationality: s.nationality || fv.nationality,
        nidBirth: s.nidBirth || fv.nidBirth,
        department: s.department || fv.studentDepartment,
        className: s.class || fv.className,
        session: s.session || raw.academicYear || fv.session,
        status: raw.status || fv._status,
        applicationId: raw.applicationId || raw._id?.slice(-6).toUpperCase() || "N/A",
        _id: raw._id,
        academicInfo: a,
        familyEnvironment: raw.familyEnvironment || {},
        behaviorSkills: raw.behaviorSkills || {},
        documents: raw.documents || {},
        termsAccepted: raw.termsAccepted || false,
        parents: { father: p.father || {}, mother: p.mother || {}, guardian: p.guardian || {} },
        addresses: { present: addr.present || {}, permanent: addr.permanent || {} },
      };
    } else {
      // student mode
      const fv = studentToFormValues(raw);
      const s = raw;
      return {
        photo: s.studentPhoto || fv.studentPhoto,
        nameBangla: s.nameBangla || fv.studentNameBangla,
        nameEnglish: s.name || fv.studentName,
        gender: s.gender || fv.gender,
        dob: s.birthDate || fv.dateOfBirth,
        age: (s as any).age || fv.age,
        bloodGroup: s.bloodGroup || fv.bloodGroup,
        nationality: s.nationality || fv.nationality,
        nidBirth: s.birthRegistrationNo || s.nidBirth || fv.nidBirth,
        department: s.studentDepartment || (s as any).department || fv.studentDepartment,
        className: Array.isArray(s.className) ? (s.className[0]?.className || s.className[0]) : s.className || fv.className,
        session: s.session || fv.session,
        status: s.status || fv.status,
        applicationId: s.studentId || s._id?.slice(-6).toUpperCase() || "N/A",
        _id: s._id,
        academicInfo: { previousSchool: s.previousSchool?.institution || "", previousClass: "", gpa: "" },
        familyEnvironment: s.familyEnvironment || {},
        behaviorSkills: s.behaviorSkills || {},
        documents: s.documents || {},
        termsAccepted: (s as any).termsAccepted || false,
        parents: { father: s.parentInfo?.father || {}, mother: s.parentInfo?.mother || {}, guardian: s.parentInfo?.guardian || {} },
        addresses: { present: s.presentAddress || {}, permanent: s.permanentAddress || {} },
      };
    }
  }, [data, mode]);

  if (!normalized) return <Typography align="center" py={4}>No data available</Typography>;

  const docList = DOCUMENT_LABELS.map(({ key, label }) => ({ key, label, value: (normalized.documents as any)?.[key] || false }));
  const completedDocs = docList.filter((d) => d.value).length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
        <Avatar src={normalized.photo} sx={{ width: 56, height: 56, border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
          {normalized.nameBangla?.charAt(0) || normalized.nameEnglish?.charAt(0) || "S"}
        </Avatar>
        <Box>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {normalized.nameBangla || normalized.nameEnglish || "N/A"}
          </Typography>
          <Typography variant="body2" color="text.secondary">{title || (mode === "admission" ? `Application ID: ${normalized.applicationId}` : `Student ID: ${normalized.applicationId}`)}</Typography>
        </Box>
        <Box sx={{ ml: "auto" }}><StatusChip status={normalized.status} /></Box>
      </Box>

      <Grid container spacing={3}>
        {/* Personal */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, height: "100%" }}>
            <CardHeader avatar={<Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}><Person /></Avatar>} title="ব্যক্তিগত তথ্য" titleTypographyProps={{ fontWeight: "bold", variant: isMobile ? "subtitle1" : "h6" }} />
            <Divider />
            <CardContent>
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "transparent" }}>
                <Table size="small"><TableBody>
                  <InfoRow label="নাম (বাংলা)" value={normalized.nameBangla} />
                  <InfoRow label="নাম (ইংরেজি)" value={normalized.nameEnglish} />
                  <InfoRow label="জন্ম তারিখ" value={normalized.dob ? formatDate(normalized.dob) : "N/A"} icon={<CalendarToday fontSize="small" sx={{ color: theme.palette.primary.main }} />} />
                  <InfoRow label="বয়স" value={normalized.age ? `${normalized.age} বছর` : "N/A"} />
                  <InfoRow label="লিঙ্গ" value={normalized.gender || "N/A"} icon={<GenderIcon gender={normalized.gender} />} />
                  <InfoRow label="রক্তের গ্রুপ" value={normalized.bloodGroup || "N/A"} icon={<Bloodtype fontSize="small" sx={{ color: theme.palette.error.main }} />} />
                  <InfoRow label="জাতীয়তা" value={normalized.nationality || "N/A"} icon={<Flag fontSize="small" sx={{ color: theme.palette.success.main }} />} />
                  <InfoRow label="এনআইডি/জন্ম নিবন্ধন" value={normalized.nidBirth || "N/A"} icon={<Fingerprint fontSize="small" sx={{ color: theme.palette.info.main }} />} />
                </TableBody></Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Academic */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`, height: "100%" }}>
            <CardHeader avatar={<Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}><School /></Avatar>} title="একাডেমিক তথ্য" titleTypographyProps={{ fontWeight: "bold", variant: isMobile ? "subtitle1" : "h6" }} />
            <Divider />
            <CardContent>
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "transparent" }}>
                <Table size="small"><TableBody>
                  <TableRow><TableCell sx={{ border: "none", fontWeight: "bold", width: "40%", py: 1 }}>বিভাগ</TableCell><TableCell sx={{ border: "none", py: 1 }}><DepartmentChip department={normalized.department} /></TableCell></TableRow>
                  <TableRow><TableCell sx={{ border: "none", fontWeight: "bold", py: 1 }}>শ্রেণি</TableCell><TableCell sx={{ border: "none", py: 1 }}><Chip label={typeof normalized.className === "string" ? normalized.className : (normalized.className as any)?.label || "N/A"} size="small" sx={{ fontWeight: 600 }} /></TableCell></TableRow>
                  <InfoRow label="সেশন" value={normalized.session || "N/A"} />
                  <InfoRow label="পূর্ববর্তী প্রতিষ্ঠান" value={normalized.academicInfo?.previousSchool || "N/A"} />
                  <InfoRow label="পূর্ববর্তী শ্রেণি" value={normalized.academicInfo?.previousClass || "N/A"} />
                  <TableRow><TableCell sx={{ border: "none", fontWeight: "bold", py: 1 }}>সর্বশেষ জিপিএ</TableCell><TableCell sx={{ border: "none", py: 1 }}><Chip label={normalized.academicInfo?.gpa || "N/A"} size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} /></TableCell></TableRow>
                </TableBody></Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Father */}
        <Grid item xs={12} md={6}>
          <PersonInfoCard title="পিতার তথ্য" person={normalized.parents.father} color="info" />
        </Grid>
        {/* Mother */}
        <Grid item xs={12} md={6}>
          <PersonInfoCard title="মাতার তথ্য" person={normalized.parents.mother} color="secondary" />
        </Grid>
        {/* Guardian if exists */}
        {normalized.parents.guardian?.nameBangla || normalized.parents.guardian?.nameEnglish ? (
          <Grid item xs={12} md={6}>
            <PersonInfoCard title="অভিভাবকের তথ্য" person={normalized.parents.guardian} color="warning" showRelation showAddress />
          </Grid>
        ) : null}

        {/* Present Address */}
        <Grid item xs={12} md={6}>
          <AddressCard title="বর্তমান ঠিকানা" address={normalized.addresses.present} color="primary" />
        </Grid>
        {/* Permanent Address */}
        <Grid item xs={12} md={6}>
          <AddressCard title="স্থায়ী ঠিকানা" address={normalized.addresses.permanent} color="info" />
        </Grid>

        {/* Family Environment */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}` }}>
            <CardHeader avatar={<Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}><FamilyRestroom /></Avatar>} title="পারিবারিক পরিবেশ" titleTypographyProps={{ fontWeight: "bold", variant: isMobile ? "subtitle1" : "h6" }} />
            <Divider />
            <CardContent>
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "transparent" }}>
                <Table size="small"><TableBody>
                  <InfoRow label="হালাল আয়" value={(normalized.familyEnvironment as any)?.halalIncome} />
                  <InfoRow label="মা-বাবার নামাজ" value={(normalized.familyEnvironment as any)?.parentsPrayer} />
                  <InfoRow label="নেশা/অনিষ্টকর অভ্যাস" value={(normalized.familyEnvironment as any)?.addiction} />
                  <InfoRow label="টিভি দেখা" value={(normalized.familyEnvironment as any)?.tv} />
                  <InfoRow label="কুরআন তিলাওয়াত" value={(normalized.familyEnvironment as any)?.quranRecitation} />
                  <InfoRow label="পর্দা পালন" value={(normalized.familyEnvironment as any)?.purdah} />
                </TableBody></Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Behavior */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
            <CardHeader avatar={<Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}><Person /></Avatar>} title="আচরণ ও দক্ষতা" titleTypographyProps={{ fontWeight: "bold", variant: isMobile ? "subtitle1" : "h6" }} />
            <Divider />
            <CardContent>
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "transparent" }}>
                <Table size="small"><TableBody>
                  <InfoRow label="মোবাইল ব্যবহার" value={(normalized.behaviorSkills as any)?.mobileUsage} />
                  <InfoRow label="সাধারণ আচরণ" value={(normalized.behaviorSkills as any)?.generalBehavior} />
                  <InfoRow label="আনুগত্য" value={(normalized.behaviorSkills as any)?.obedience} />
                  <InfoRow label="বড়দের সাথে ব্যবহার" value={(normalized.behaviorSkills as any)?.elderBehavior} />
                  <InfoRow label="ছোটদের সাথে ব্যবহার" value={(normalized.behaviorSkills as any)?.youngerBehavior} />
                  <InfoRow label="মিথ্যা/একগুঁয়েমি" value={(normalized.behaviorSkills as any)?.lyingStubbornness} />
                  <InfoRow label="পড়াশোনায় আগ্রহ" value={(normalized.behaviorSkills as any)?.studyInterest} />
                  <InfoRow label="ধর্মীয় আগ্রহ" value={(normalized.behaviorSkills as any)?.religiousInterest} />
                  <InfoRow label="রাগ নিয়ন্ত্রণ" value={(normalized.behaviorSkills as any)?.angerControl} />
                </TableBody></Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Documents */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` }}>
            <CardHeader avatar={<Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}><Description /></Avatar>} title="প্রদত্ত ডকুমেন্টসমূহ" titleTypographyProps={{ fontWeight: "bold", variant: isMobile ? "subtitle1" : "h6" }} action={<Chip label={`${completedDocs}/${docList.length} সম্পন্ন`} color={completedDocs === docList.length ? "success" : "warning"} size="small" />} />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {docList.map((doc) => (
                  <Grid item xs={12} sm={6} md={4} key={doc.key}><DocumentItem label={doc.label} value={doc.value} /></Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Terms */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {normalized.termsAccepted ? <CheckCircleOutline color="success" /> : <CancelOutlined color="error" />}
              <Typography variant="body2">{normalized.termsAccepted ? "শর্তাবলী গৃহীত হয়েছে" : "শর্তাবলী গৃহীত হয়নি"}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Internal PersonInfoCard + AddressCard (self-contained copies to keep single file reusable)
const PersonInfoCard = ({ title, person, color, showRelation = false, showAddress = false }: { title: string; person?: any; color: "info" | "secondary" | "warning"; showRelation?: boolean; showAddress?: boolean }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  if (!person?.nameBangla && !person?.nameEnglish && !person?.name) return null;
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette[color].main, 0.1)}` }}>
      <CardHeader avatar={<Avatar sx={{ bgcolor: alpha(theme.palette[color].main, 0.1), color: theme.palette[color].main }}><FamilyRestroom /></Avatar>} title={title} titleTypographyProps={{ fontWeight: "bold", variant: isMobile ? "subtitle1" : "h6" }} />
      <Divider />
      <CardContent>
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "transparent" }}>
          <Table size="small"><TableBody>
            <InfoRow label="নাম (বাংলা)" value={person?.nameBangla} />
            <InfoRow label="নাম (ইংরেজি)" value={person?.nameEnglish || person?.name} />
            <InfoRow label="পেশা" value={person?.profession} />
            <InfoRow label="শিক্ষাগত যোগ্যতা" value={person?.education} />
            <InfoRow label="মোবাইল" value={person?.mobile} icon={<LocalPhone fontSize="small" sx={{ color: theme.palette.success.main }} />} />
            <InfoRow label="WhatsApp" value={person?.whatsapp} icon={<WhatsAppIcon fontSize="small" sx={{ color: "#25D366" }} />} />
            {showRelation && <InfoRow label="সম্পর্ক" value={person?.relation} />}
            {showAddress && <InfoRow label="ঠিকানা" value={person?.address} />}
          </TableBody></Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const AddressCard = ({ title, address, color }: { title: string; address?: any; color: "primary" | "info" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const Icon = Home;
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette[color].main, 0.1)}` }}>
      <CardHeader avatar={<Avatar sx={{ bgcolor: alpha(theme.palette[color].main, 0.1), color: theme.palette[color].main }}><Home /></Avatar>} title={title} titleTypographyProps={{ fontWeight: "bold", variant: isMobile ? "subtitle1" : "h6" }} />
      <Divider />
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Map color={color} fontSize="small" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="body2">{address?.village || "N/A"},<br />{address?.postOffice || "N/A"}{address?.postCode ? `- ${address.postCode}` : ""}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>থানা: {address?.policeStation || "N/A"}<br />জেলা: {address?.district || "N/A"}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

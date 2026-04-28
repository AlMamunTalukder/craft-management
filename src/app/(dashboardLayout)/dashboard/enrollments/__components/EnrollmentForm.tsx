/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import CraftIntAutoCompleteWithIcon from "@/components/Forms/AutocompleteWithIcon";
import CraftForm from "@/components/Forms/Form";
import FileUploadWithIcon from "@/components/Forms/Upload";
import CraftInputWithIcon from "@/components/Forms/inputWithIcon";
import CraftSelectWithIcon from "@/components/Forms/selectWithIcon";
import { useAcademicOption } from "@/hooks/useAcademicOption";
import { bloodGroups } from "@/options";
import {
  useCreateEnrollmentMutation,
  useGetSingleEnrollmentQuery,
  useUpdateEnrollmentMutation,
} from "@/redux/api/enrollmentApi";
import { useGetAllStudentsQuery } from "@/redux/api/studentApi";
import { useGetAllAdmissionApplicationsQuery } from "@/redux/api/admissionApplication";
import {
  AccessTime,
  AccountCircle,
  ArrowBack,
  ArrowForward,
  Book,
  Cake,
  CalendarMonth,
  Check,
  Class,
  Close,
  Description,
  FamilyRestroom,
  Flag,
  Group,
  Home,
  Person,
  Phone,
  Print,
  School,
  School as SchoolIcon,
  Work,
  WhatsApp,
  School as EducationIcon,
  Assignment,
  FileCopy,
  Save,
} from "@mui/icons-material";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Switch,
  Typography,
  useTheme,
  Chip,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import PrintModal from "../../student/profile/__components/PrintModal";

const fadeInSlideUp = {
  animation: "fadeInSlideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
  "@keyframes fadeInSlideUp": {
    "0%": { opacity: 0, transform: "translateY(15px)" },
    "100%": { opacity: 1, transform: "translateY(0)" },
  },
};

const getFirstIncompleteStep = (formData: any): number => {
  if (
    !formData.studentName ||
    !formData.mobileNo ||
    !formData.studentDepartment
  )
    return 0;
  if (!formData.className || formData.className.length === 0) return 1;
  if (!formData.fatherName || !formData.fatherMobile || !formData.motherName)
    return 2;
  const hasPermanentAddress =
    formData.permVillage || formData.permDistrict || formData.permPoliceStation;
  const hasPresentAddress =
    formData.village || formData.district || formData.policeStation;
  if (!hasPermanentAddress && !hasPresentAddress) return 3;
  return 3;
};

// Category options
const CATEGORY_OPTIONS = [
  { label: "Residential", value: "Residential" },
  { label: "Non-Residential", value: "Non-Residential" },
  { label: "Day Care", value: "Day Care" },
  { label: "Day Care One Meal", value: "Day Care One Meal" },
  { label: "Non-Residential One Meal", value: "Non-Residential One Meal" },
];

// ─── AdmissionApplicationSelector ────────────────────────────────────────────────
const AdmissionApplicationSelector = ({
  onSelect,
}: {
  onSelect: (application: any) => void;
}) => {
  const theme = useTheme();
  const { data: applicationsData, isLoading } =
    useGetAllAdmissionApplicationsQuery({
      limit: 100,
      status: "approved",
    });

  const options =
    applicationsData?.data?.map((app: any) => ({
      label: `${app.applicationId || app._id} - ${app.studentInfo?.nameEnglish || app.studentInfo?.nameBangla || "Unknown"}`,
      value: app._id,
      application: app,
    })) || [];

  const [selectedApp, setSelectedApp] = useState<any>(null);

  const handleApplicationSelect = (event: any, value: any) => {
    if (value && value.application) {
      setSelectedApp(value.application);
      onSelect(value.application);
      toast.success(
        `Application for ${value.application?.studentInfo?.nameBangla || "Student"} loaded`,
      );
    } else {
      setSelectedApp(null);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "absolute", top: 0, right: 0, p: 1 }}>
        <Chip
          icon={<FileCopy fontSize="small" />}
          label="Auto-fill from Application"
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <CraftIntAutoCompleteWithIcon
            name="admissionApplication"
            label="Select Admission Application"
            placeholder="Search by ID or Student Name..."
            options={options}
            size="medium"
            multiple={false}
            icon={<Assignment color="primary" />}
            onChange={handleApplicationSelect}
            loading={isLoading}
            fullWidth
            helperText="Select an approved application to auto-fill the form"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          {selectedApp && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Chip
                label={`Status: ${selectedApp.status}`}
                color={
                  selectedApp.status === "approved" ? "success" : "warning"
                }
                size="small"
              />
              <Chip
                label={`ID: ${selectedApp.applicationId || selectedApp._id?.slice(-6)}`}
                variant="outlined"
                size="small"
              />
              {selectedApp.studentInfo && (
                <Chip
                  label={`Class: ${selectedApp.studentInfo.class}`}
                  variant="outlined"
                  size="small"
                  color="primary"
                />
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

// ─── StudentInformationStep ──────────────────────────────────────────────────────
const StudentInformationStep = () => (
  <Box sx={{ ...fadeInSlideUp }}>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 2, color: "text.primary" }}
        >
          Personal Details
        </Typography>
      </Grid>
      <Grid item xs={12} md={4}>
        <FileUploadWithIcon name="studentPhoto" label="Student Photo" />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          fullWidth
          margin="none"
          size="medium"
          label={
            <span>
              Student Name <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="studentNameBangla"
          placeholder="Student Name (বাংলায়)"
          InputProps={{
            startAdornment: <Person sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          margin="none"
          size="medium"
          fullWidth
          label={
            <span>
              Student Name (English)<span style={{ color: "red" }}>*</span>
            </span>
          }
          name="studentName"
          placeholder="Full Name in English"
          InputProps={{
            startAdornment: <Person sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          margin="none"
          size="medium"
          fullWidth
          label={
            <span>
              Mobile No<span style={{ color: "red" }}>*</span>
            </span>
          }
          name="mobileNo"
          placeholder="01XXXXXXXXX"
          InputProps={{
            startAdornment: <Phone sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          margin="none"
          size="medium"
          fullWidth
          label="Session"
          name="session"
          placeholder="2024-2025"
          InputProps={{
            startAdornment: (
              <CalendarMonth sx={{ color: "text.secondary", mr: 1 }} />
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftSelectWithIcon
          margin="none"
          size="medium"
          name="studentDepartment"
          label={
            <span>
              Student Department<span style={{ color: "red" }}>*</span>
            </span>
          }
          placeholder="Student Department"
          items={["hifz", "academic"]}
          adornment={<Person color="action" />}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          margin="none"
          size="medium"
          fullWidth
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          InputProps={{
            startAdornment: <Cake sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          margin="none"
          size="medium"
          fullWidth
          label="NID/Birth Reg. No"
          name="nidBirth"
          placeholder="1234567890"
          InputProps={{
            startAdornment: (
              <Description sx={{ color: "text.secondary", mr: 1 }} />
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftSelectWithIcon
          margin="none"
          size="medium"
          name="bloodGroup"
          label="Blood Group"
          placeholder="Select Blood Group"
          items={bloodGroups}
          adornment={<Person color="action" />}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          margin="none"
          size="medium"
          fullWidth
          label="Nationality"
          name="nationality"
          placeholder="Bangladeshi"
          InputProps={{
            startAdornment: <Flag sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftSelectWithIcon
          margin="none"
          size="medium"
          name="category"
          label={
            <span>
              Category <span style={{ color: "red" }}>*</span>
            </span>
          }
          placeholder="Select Category"
          items={CATEGORY_OPTIONS.map((opt) => opt.label)}
          adornment={<School color="action" />}
        />
      </Grid>
    </Grid>
  </Box>
);

// ─── AcademicStep ────────────────────────────────────────────────────────────────
const AcademicStep = ({ classOptions }: any) => {
  const { watch } = useFormContext();
  const selectedClass = watch("className");
  return (
    <Box sx={{ ...fadeInSlideUp }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mb: 2, color: "text.primary" }}
          >
            Academic Details
          </Typography>
          {selectedClass && selectedClass.length > 0 && (
            <Alert
              severity="info"
              icon={<Check />}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              <Typography variant="body2">
                Selected class "
                {selectedClass.map((cls: any) => cls.label || cls).join(", ")}"
              </Typography>
            </Alert>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <CraftIntAutoCompleteWithIcon
            margin="none"
            size="medium"
            name="className"
            label={
              <span>
                Class <span style={{ color: "red" }}>*</span>
              </span>
            }
            placeholder="Select Class"
            options={classOptions}
            fullWidth
            multiple
            icon={<Class color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CraftInputWithIcon
            margin="none"
            size="medium"
            fullWidth
            label="Roll Number"
            name="rollNumber"
            placeholder="Enter Roll No"
            InputProps={{
              startAdornment: <Class sx={{ color: "text.secondary", mr: 1 }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CraftSelectWithIcon
            margin="none"
            size="medium"
            name="section"
            label="Section"
            items={["A", "B", "C"]}
            adornment={<Group />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CraftSelectWithIcon
            margin="none"
            size="medium"
            name="group"
            label="Group"
            items={["Science", "Commerce", "Arts"]}
            adornment={<School />}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CraftInputWithIcon
            margin="none"
            size="medium"
            fullWidth
            label="Optional Subject"
            name="optionalSubject"
            placeholder="e.g. Higher Math / ICT"
            InputProps={{
              startAdornment: <Book sx={{ color: "text.secondary", mr: 1 }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CraftSelectWithIcon
            margin="none"
            size="medium"
            name="shift"
            label="Shift"
            items={["Morning", "Day", "Evening"]}
            adornment={<AccessTime />}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

// ─── ParentGuardianStep ─────────────────────────────────────────────────────────
const ParentGuardianStep = () => (
  <Box sx={{ ...fadeInSlideUp }}>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 2, color: "text.primary" }}
        >
          Parent & Guardian
        </Typography>
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label={
            <span>
              Father's Name English <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="fatherName"
          placeholder="Father Name English"
          InputProps={{
            startAdornment: <Person sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label={
            <span>
              Father's Name Bangla <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="fatherNameBangla"
          placeholder="Father's Name (বাংলায়)"
          InputProps={{
            startAdornment: <Person sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label={
            <span>
              Mobile No <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="fatherMobile"
          placeholder="01XXXXXXXXX"
          InputProps={{
            startAdornment: <Phone sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="NID/Passport No"
          name="fatherNid"
          placeholder="1234567890"
          InputProps={{
            startAdornment: (
              <Description sx={{ color: "text.secondary", mr: 1 }} />
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="Profession"
          name="fatherProfession"
          placeholder="Occupation"
          InputProps={{
            startAdornment: <Work sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="Monthly Income"
          name="fatherIncome"
          placeholder="BDT"
          type="number"
          InputProps={{
            startAdornment: <Work sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="WhatsApp"
          name="fatherWhatsapp"
          placeholder="WhatsApp Number"
          InputProps={{
            startAdornment: (
              <WhatsApp sx={{ color: "text.secondary", mr: 1 }} />
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="Education"
          name="fatherEducation"
          placeholder="Education"
          InputProps={{
            startAdornment: (
              <EducationIcon sx={{ color: "text.secondary", mr: 1 }} />
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label={
            <span>
              Mother's Name English <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="motherName"
          placeholder="Mother Name English"
          InputProps={{
            startAdornment: <Person sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label={
            <span>
              Mother's Name Bangla<span style={{ color: "red" }}>*</span>
            </span>
          }
          name="motherNameBangla"
          placeholder="Mother's Name (বাংলায়)"
          InputProps={{
            startAdornment: <Person sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="Mobile"
          name="motherMobile"
          placeholder="01XXXXXXXXX"
          InputProps={{
            startAdornment: <Phone sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="NID/Passport No"
          name="motherNid"
          placeholder="1234567890"
          InputProps={{
            startAdornment: (
              <Description sx={{ color: "text.secondary", mr: 1 }} />
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="Profession"
          name="motherProfession"
          placeholder="Occupation"
          InputProps={{
            startAdornment: <Work sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="Monthly Income"
          name="motherIncome"
          placeholder="BDT"
          type="number"
          InputProps={{
            startAdornment: <Work sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="WhatsApp"
          name="motherWhatsapp"
          placeholder="WhatsApp Number"
          InputProps={{
            startAdornment: (
              <WhatsApp sx={{ color: "text.secondary", mr: 1 }} />
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="Education"
          name="motherEducation"
          placeholder="Education"
          InputProps={{
            startAdornment: (
              <EducationIcon sx={{ color: "text.secondary", mr: 1 }} />
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="Guardian Name"
          name="guardianName"
          placeholder="Guardian Name"
          InputProps={{
            startAdornment: <Person sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="Relation"
          name="guardianRelation"
          placeholder="Relation"
          InputProps={{
            startAdornment: <Person sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="Mobile"
          name="guardianMobile"
          placeholder="01XXXXXXXXX"
          InputProps={{
            startAdornment: <Phone sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="WhatsApp"
          name="guardianWhatsapp"
          placeholder="WhatsApp Number"
          InputProps={{
            startAdornment: (
              <WhatsApp sx={{ color: "text.secondary", mr: 1 }} />
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="Profession"
          name="guardianProfession"
          placeholder="Profession"
          InputProps={{
            startAdornment: <Work sx={{ color: "text.secondary", mr: 1 }} />,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <CraftInputWithIcon
          size="medium"
          margin="none"
          fullWidth
          label="Address"
          name="guardianVillage"
          placeholder="Address"
          InputProps={{
            startAdornment: (
              <Description sx={{ color: "text.secondary", mr: 1 }} />
            ),
          }}
        />
      </Grid>
    </Grid>
  </Box>
);

const DocumentCheckbox = ({ name, label }: { name: string; label: string }) => {
  const { watch, setValue } = useFormContext();
  const isChecked = watch(name) || false;
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={isChecked}
          onChange={(e) => setValue(name, e.target.checked)}
          name={name}
          color="primary"
        />
      }
      label={label}
      sx={{ mb: 1 }}
    />
  );
};

// ─── AddressDocumentsStep ────────────────────────────────────────────────────────
const AddressDocumentsStep = () => {
  const theme = useTheme();
  const { watch, setValue } = useFormContext();
  const termsAccepted = watch("termsAccepted") || false;
  const sameAsPermanent = watch("sameAsPermanent") || false;
  return (
    <Box sx={{ ...fadeInSlideUp }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mb: 2, color: "text.primary" }}
          >
            Address & Documents
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="subtitle1"
            fontWeight="600"
            sx={{ mb: 1, color: "primary.main" }}
          >
            Permanent Address
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <CraftInputWithIcon
            size="medium"
            margin="none"
            fullWidth
            label="Village/Area"
            name="permVillage"
            placeholder="Village/Area"
            InputProps={{
              startAdornment: (
                <Description sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CraftInputWithIcon
            size="medium"
            margin="none"
            fullWidth
            label="Post Office"
            name="permPostOffice"
            placeholder="Post Office"
            InputProps={{
              startAdornment: (
                <Description sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CraftInputWithIcon
            size="medium"
            margin="none"
            fullWidth
            label="Post Code"
            name="permPostCode"
            placeholder="Post Code"
            InputProps={{
              startAdornment: (
                <Description sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CraftInputWithIcon
            size="medium"
            margin="none"
            fullWidth
            label="Thana"
            name="permPoliceStation"
            placeholder="Thana"
            InputProps={{
              startAdornment: (
                <Description sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CraftInputWithIcon
            size="medium"
            margin="none"
            fullWidth
            label="District"
            name="permDistrict"
            placeholder="District"
            InputProps={{
              startAdornment: (
                <Description sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                sx={{ color: "text.primary" }}
              >
                Present Address
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Same as Permanent Address
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={sameAsPermanent}
                  onChange={(e) => {
                    setValue("sameAsPermanent", e.target.checked);
                    if (e.target.checked) {
                      setValue("village", watch("permVillage") || "");
                      setValue("postOffice", watch("permPostOffice") || "");
                      setValue("postCode", watch("permPostCode") || "");
                      setValue(
                        "policeStation",
                        watch("permPoliceStation") || "",
                      );
                      setValue("district", watch("permDistrict") || "");
                    }
                  }}
                  color="primary"
                />
              }
              label="Same as Permanent"
              labelPlacement="start"
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <CraftInputWithIcon
            size="medium"
            margin="none"
            fullWidth
            label="Village/Area"
            name="village"
            placeholder="Village/Area"
            disabled={sameAsPermanent}
            InputProps={{
              startAdornment: (
                <Description sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CraftInputWithIcon
            size="medium"
            margin="none"
            fullWidth
            label="Post Office"
            name="postOffice"
            placeholder="Post Office"
            disabled={sameAsPermanent}
            InputProps={{
              startAdornment: (
                <Description sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CraftInputWithIcon
            size="medium"
            margin="none"
            fullWidth
            label="Post Code"
            name="postCode"
            placeholder="Post Code"
            disabled={sameAsPermanent}
            InputProps={{
              startAdornment: (
                <Description sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CraftInputWithIcon
            size="medium"
            margin="none"
            fullWidth
            label="Thana"
            name="policeStation"
            placeholder="Thana"
            disabled={sameAsPermanent}
            InputProps={{
              startAdornment: (
                <Description sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CraftInputWithIcon
            size="medium"
            margin="none"
            fullWidth
            label="District"
            name="district"
            placeholder="District"
            disabled={sameAsPermanent}
            InputProps={{
              startAdornment: (
                <Description sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CraftInputWithIcon
            size="medium"
            margin="none"
            fullWidth
            label="Previous Institution"
            name="formerInstitution"
            placeholder="Previous Institution"
            InputProps={{
              startAdornment: (
                <School sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CraftInputWithIcon
            size="medium"
            margin="none"
            fullWidth
            label="Previous Address"
            name="formerVillage"
            placeholder="Previous Address"
            InputProps={{
              startAdornment: (
                <Description sx={{ color: "text.secondary", mr: 1 }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              p: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: "bold" }}>
              Documents Provided
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <DocumentCheckbox
                  name="birthCertificate"
                  label="Birth Certificate"
                />
                <DocumentCheckbox
                  name="transferCertificate"
                  label="Transfer Certificate"
                />
                <DocumentCheckbox
                  name="characterCertificate"
                  label="Character Certificate"
                />
                <DocumentCheckbox name="markSheet" label="Mark Sheet" />
                <DocumentCheckbox name="photographs" label="Photographs" />
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              p: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Terms & Conditions
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                I agree to enrollment terms
              </Typography>
            </Box>
            <Switch
              checked={termsAccepted}
              onChange={(e) => setValue("termsAccepted", e.target.checked)}
              name="termsAccepted"
              color="primary"
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

// ─── transformApplicationToFormData ──────────────────────────────────────────────
const transformApplicationToFormData = (
  application: any,
  classOptions: any[],
) => {
  if (!application) return null;
  const studentInfo = application.studentInfo || {};
  const parentInfo = application.parentInfo || {};
  const address = application.address || {};
  const presentAddress = address.present || {};
  const permanentAddress = address.permanent || {};
  const fatherInfo = parentInfo.father || {};
  const motherInfo = parentInfo.mother || {};
  const guardianInfo = parentInfo.guardian || {};
  const documents = application.documents || {};
  const academicInfo = application.academicInfo || {};
  const familyEnvironment = application.familyEnvironment || {};
  const behaviorSkills = application.behaviorSkills || {};

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return null;
    }
  };

  const formatClassForForm = (classData: any) => {
    if (!classData) return [];
    if (typeof classData === "string") {
      const matchedClass = classOptions?.find(
        (opt: any) => opt.label === classData || opt.value === classData,
      );
      return matchedClass
        ? [matchedClass]
        : [{ label: classData, name: classData, value: classData }];
    }
    return [];
  };

  const formattedClass = formatClassForForm(studentInfo.class);

  return {
    studentId: application.applicationId || "",
    studentNameBangla: studentInfo.nameBangla || "",
    studentPhoto: studentInfo.studentPhoto || "",
    studentName: studentInfo.nameEnglish || "",
    mobileNo:
      fatherInfo.mobile || motherInfo.mobile || guardianInfo.mobile || "",
    session: application.academicYear || new Date().getFullYear().toString(),
    category: studentInfo.category || "Residential",
    dateOfBirth: formatDate(studentInfo.dateOfBirth),
    nidBirth: studentInfo.nidBirth || "",
    bloodGroup: studentInfo.bloodGroup || "",
    nationality: studentInfo.nationality || "Bangladeshi",
    age: studentInfo.age || 0,
    department: studentInfo.department || "",
    className: formattedClass,
    studentDepartment: studentInfo.department || "academic",
    rollNumber: "",
    section: "",
    group: "",
    optionalSubject: "",
    shift: studentInfo.session || "",
    fatherName: fatherInfo.nameEnglish || "",
    fatherNameBangla: fatherInfo.nameBangla || "",
    fatherMobile: fatherInfo.mobile || "",
    fatherNid: fatherInfo.nid || "",
    fatherProfession: fatherInfo.profession || "",
    fatherIncome: fatherInfo.income || 0,
    fatherWhatsapp: fatherInfo.whatsapp || "",
    fatherEducation: fatherInfo.education || "",
    motherName: motherInfo.nameEnglish || "",
    motherNameBangla: motherInfo.nameBangla || "",
    motherMobile: motherInfo.mobile || "",
    motherNid: motherInfo.nid || "",
    motherProfession: motherInfo.profession || "",
    motherIncome: motherInfo.income || 0,
    motherWhatsapp: motherInfo.whatsapp || "",
    motherEducation: motherInfo.education || "",
    guardianName: guardianInfo.nameEnglish || "",
    guardianRelation: guardianInfo.relation || "",
    guardianMobile: guardianInfo.mobile || "",
    guardianWhatsapp: guardianInfo.whatsapp || "",
    guardianProfession: guardianInfo.profession || "",
    guardianVillage: guardianInfo.address || "",
    village: presentAddress.village || "",
    postOffice: presentAddress.postOffice || "",
    postCode: presentAddress.postCode || "",
    policeStation: presentAddress.policeStation || "",
    district: presentAddress.district || "",
    permVillage: permanentAddress.village || "",
    permPostOffice: permanentAddress.postOffice || "",
    permPostCode: permanentAddress.postCode || "",
    permPoliceStation: permanentAddress.policeStation || "",
    permDistrict: permanentAddress.district || "",
    formerInstitution: academicInfo.previousSchool || "",
    formerVillage: "",
    birthCertificate: documents.birthCertificate || false,
    transferCertificate: documents.transferCertificate || false,
    characterCertificate: documents.characterCertificate || false,
    markSheet: documents.markSheet || false,
    photographs: documents.photographs || false,
    termsAccepted: application.termsAccepted || false,
    familyEnvironment: {
      halalIncome: familyEnvironment.halalIncome || "",
      parentsPrayer: familyEnvironment.parentsPrayer || "",
      addiction: familyEnvironment.addiction || "",
      tv: familyEnvironment.tv || "",
      quranRecitation: familyEnvironment.quranRecitation || "",
      purdah: familyEnvironment.purdah || "",
    },
    behaviorSkills: {
      mobileUsage: behaviorSkills.mobileUsage || "",
      generalBehavior: behaviorSkills.generalBehavior || "",
      obedience: behaviorSkills.obedience || "",
      elderBehavior: behaviorSkills.elderBehavior || "",
      youngerBehavior: behaviorSkills.youngerBehavior || "",
      lyingStubbornness: behaviorSkills.lyingStubbornness || "",
      studyInterest: behaviorSkills.studyInterest || "",
      religiousInterest: behaviorSkills.religiousInterest || "",
      angerControl: behaviorSkills.angerControl || "",
    },
  };
};

// ─── transformEnrollmentDataToForm ──────────────────────────────────────────────
const transformEnrollmentDataToForm = (
  enrollmentData: any,
  classOptions: any[],
) => {
  if (!enrollmentData?.data) return null;
  const data = enrollmentData.data;

  const parentInfo = data.parentInfo || data.student?.parentInfo || {};
  const fatherInfo = parentInfo.father || {};
  const motherInfo = parentInfo.mother || {};
  const guardianInfo = parentInfo.guardian || {};

  const formatClassForForm = (classData: any) => {
    if (!classData || classData.length === 0) return [];
    if (Array.isArray(classData)) {
      return classData.map((cls: any) => {
        const classId = cls._id || cls;
        const classNameValue = cls.className || cls;
        let matched = classOptions?.find((o: any) => o.value === classId);
        if (!matched)
          matched = classOptions?.find((o: any) => o.label === classNameValue);
        if (!matched)
          matched = {
            label: classNameValue,
            name: classNameValue,
            value: classId,
          };
        return matched;
      });
    }
    const classId = classData._id || classData;
    const classNameValue = classData.className || classData;
    let matched = classOptions?.find((o: any) => o.value === classId);
    if (!matched)
      matched = classOptions?.find((o: any) => o.label === classNameValue);
    if (!matched)
      matched = { label: classNameValue, name: classNameValue, value: classId };
    return [matched];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return null;
    }
  };

  const rawClassName = data.className
    ? Array.isArray(data.className)
      ? data.className
      : [data.className]
    : data.student?.className
      ? Array.isArray(data.student.className)
        ? data.student.className
        : [data.student.className]
      : [];

  const formattedClass = formatClassForForm(rawClassName);

  const guardianName = data.guardianName || guardianInfo.nameEnglish || "";
  const guardianRelation = data.guardianRelation || guardianInfo.relation || "";
  const guardianMobile = data.guardianMobile || guardianInfo.mobile || "";
  const guardianWhatsapp = data.guardianWhatsapp || guardianInfo.whatsapp || "";
  const guardianProfession =
    data.guardianProfession || guardianInfo.profession || "";
  const guardianVillage = data.guardianVillage || guardianInfo.address || "";

  return {
    studentId: data.studentId || data.student?.studentId || "",
    studentNameBangla: data.nameBangla || data.student?.nameBangla || "",
    studentPhoto: data.studentPhoto || data.student?.studentPhoto || "",
    studentName: data.studentName || data.student?.name || "",
    mobileNo: data.mobileNo || data.student?.mobile || "",
    session: data.session || new Date().getFullYear().toString(),
    category:
      data.category ||
      data.studentType ||
      data.student?.category ||
      "Residential",
    dateOfBirth: formatDate(data.birthDate || data.student?.birthDate),
    nidBirth:
      data.birthRegistrationNo || data.student?.birthRegistrationNo || "",
    bloodGroup: data.bloodGroup || data.student?.bloodGroup || "",
    nationality: data.nationality || "Bangladeshi",
    className: formattedClass,
    studentDepartment:
      data.studentDepartment || data.student?.studentDepartment || "hifz",
    rollNumber:
      data.roll || data.rollNumber || data.student?.studentClassRoll || "",
    section: data.section || data.student?.section?.[0] || "",
    group: data.group || data.student?.batch || "",
    optionalSubject: data.optionalSubject || "",
    shift: data.shift || data.student?.session || "",
    admissionType: data.admissionType || "",
    fatherName: data.fatherName || fatherInfo.nameEnglish || "",
    fatherNameBangla: data.fatherNameBangla || fatherInfo.nameBangla || "",
    fatherMobile: data.fatherMobile || fatherInfo.mobile || "",
    fatherNid: data.fatherNid || fatherInfo.nid || "",
    fatherProfession: data.fatherProfession || fatherInfo.profession || "",
    fatherIncome: data.fatherIncome || fatherInfo.income || 0,
    fatherWhatsapp: data.fatherWhatsapp || fatherInfo.whatsapp || "",
    fatherEducation: data.fatherEducation || fatherInfo.education || "",
    motherName: data.motherName || motherInfo.nameEnglish || "",
    motherNameBangla: data.motherNameBangla || motherInfo.nameBangla || "",
    motherMobile: data.motherMobile || motherInfo.mobile || "",
    motherNid: data.motherNid || motherInfo.nid || "",
    motherProfession: data.motherProfession || motherInfo.profession || "",
    motherIncome: data.motherIncome || motherInfo.income || 0,
    motherWhatsapp: data.motherWhatsapp || motherInfo.whatsapp || "",
    motherEducation: data.motherEducation || motherInfo.education || "",
    guardianName,
    guardianRelation,
    guardianMobile,
    guardianWhatsapp,
    guardianProfession,
    guardianVillage,
    village:
      data.presentAddress?.village ||
      data.student?.presentAddress?.village ||
      "",
    postOffice:
      data.presentAddress?.postOffice ||
      data.student?.presentAddress?.postOffice ||
      "",
    postCode:
      data.presentAddress?.postCode ||
      data.student?.presentAddress?.postCode ||
      "",
    policeStation:
      data.presentAddress?.policeStation ||
      data.student?.presentAddress?.policeStation ||
      "",
    district:
      data.presentAddress?.district ||
      data.student?.presentAddress?.district ||
      "",
    permVillage:
      data.permanentAddress?.village ||
      data.student?.permanentAddress?.village ||
      "",
    permPostOffice:
      data.permanentAddress?.postOffice ||
      data.student?.permanentAddress?.postOffice ||
      "",
    permPostCode:
      data.permanentAddress?.postCode ||
      data.student?.permanentAddress?.postCode ||
      "",
    permPoliceStation:
      data.permanentAddress?.policeStation ||
      data.student?.permanentAddress?.policeStation ||
      "",
    permDistrict:
      data.permanentAddress?.district ||
      data.student?.permanentAddress?.district ||
      "",
    formerInstitution:
      data.previousSchool?.institution ||
      data.student?.previousSchool?.institution ||
      "",
    formerVillage:
      data.previousSchool?.address ||
      data.student?.previousSchool?.address ||
      "",
    birthCertificate:
      data.documents?.birthCertificate ??
      data.student?.documents?.birthCertificate ??
      false,
    transferCertificate:
      data.documents?.transferCertificate ??
      data.student?.documents?.transferCertificate ??
      false,
    characterCertificate:
      data.documents?.characterCertificate ??
      data.student?.documents?.characterCertificate ??
      false,
    markSheet:
      data.documents?.markSheet ?? data.student?.documents?.markSheet ?? false,
    photographs:
      data.documents?.photographs ??
      data.student?.documents?.photographs ??
      false,
    termsAccepted: data.termsAccepted ?? data.student?.termsAccepted ?? false,
  };
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
  const { data: singleEnrollment, isLoading: enrollmentLoading } =
    useGetSingleEnrollmentQuery(id ? { id } : undefined, { skip: !id });

  const [submitting, setSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const [formKey, setFormKey] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { label: "Student Info", icon: <AccountCircle /> },
    { label: "Academic Info", icon: <SchoolIcon /> },
    { label: "Parent/Guardian", icon: <FamilyRestroom /> },
    { label: "Address & Docs", icon: <Home /> },
  ];

  useEffect(() => {
    if (id && singleEnrollment && classOptions.length > 0) {
      const transformedData = transformEnrollmentDataToForm(
        singleEnrollment,
        classOptions,
      );
      if (transformedData) {
        setDefaultValues(transformedData);
        setFormKey((prev) => prev + 1);
        setActiveStep(0);
      }
    } else if (applicationId && admissionApplications?.data?.length > 0) {
      setIsApplicationLoading(true);
      const application = admissionApplications.data[0];
      const formData = transformApplicationToFormData(
        application,
        classOptions,
      );
      if (formData) {
        setDefaultValues(formData);
        setFormKey((prev) => prev + 1);
        toast.success(
          `Application ${application.applicationId} loaded successfully`,
        );
        setTimeout(() => setActiveStep(getFirstIncompleteStep(formData)), 300);
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
        dateOfBirth: null,
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
      });
      setFormKey((prev) => prev + 1);
      setActiveStep(0);
    }
  }, [
    id,
    applicationId,
    singleEnrollment,
    admissionApplications,
    classOptions,
  ]);

  const handleApplicationSelect = useCallback(
    (application: any) => {
      if (!application) return;
      const formData = transformApplicationToFormData(
        application,
        classOptions,
      );
      if (formData) {
        setDefaultValues(formData);
        setFormKey((prev) => prev + 1);
        toast.success(
          `Application data loaded for ${formData.studentNameBangla || formData.studentName}`,
        );
        setTimeout(() => setActiveStep(getFirstIncompleteStep(formData)), 300);
      } else toast.error("Failed to load application data");
    },
    [classOptions],
  );

  const handleFinishProcess = () => {
    setOpenSuccessModal(false);
    setOpenPrintModal(false);
    router.push(`/dashboard/student/list`);
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      const { studentIdSelect, studentNameSelect, ...submitData } = data;

      if (!submitData.studentName) {
        toast.error("Student name is required");
        setSubmitting(false);
        return;
      }
      if (!submitData.mobileNo) {
        toast.error("Mobile number is required");
        setSubmitting(false);
        return;
      }
      if (!submitData.className || submitData.className.length === 0) {
        toast.error("Class selection is required");
        setSubmitting(false);
        return;
      }
      if (!submitData.category) {
        toast.error("Category selection is required");
        setSubmitting(false);
        return;
      }

      const classNameArray = submitData.className
        .map((cls: any) => cls.value || cls)
        .filter(Boolean);
      if (!classNameArray.length) {
        toast.error("Class selection is required");
        setSubmitting(false);
        return;
      }

      const studentPhotoValue =
        typeof submitData.studentPhoto === "string" &&
        submitData.studentPhoto.startsWith("data:")
          ? ""
          : submitData.studentPhoto || "";

      const finalSubmitData: any = {
        studentName: submitData.studentName || "",
        nameBangla: submitData.studentNameBangla || "",
        studentPhoto: studentPhotoValue,
        mobileNo: submitData.mobileNo || "",
        rollNumber: submitData.rollNumber || "",
        birthDate: submitData.dateOfBirth
          ? new Date(submitData.dateOfBirth).toISOString()
          : "",
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
        guardianVillage: submitData.guardianVillage || "",
        presentAddress: {
          village: submitData.village || "",
          postOffice: submitData.postOffice || "",
          postCode: submitData.postCode || "",
          policeStation: submitData.policeStation || "",
          district: submitData.district || "",
        },
        permanentAddress: {
          village: submitData.permVillage || "",
          postOffice: submitData.permPostOffice || "",
          postCode: submitData.permPostCode || "",
          policeStation: submitData.permPoliceStation || "",
          district: submitData.permDistrict || "",
        },
        previousSchool: {
          institution: submitData.formerInstitution || "",
          address: submitData.formerVillage || "",
        },
        documents: {
          birthCertificate: Boolean(submitData.birthCertificate),
          transferCertificate: Boolean(submitData.transferCertificate),
          characterCertificate: Boolean(submitData.characterCertificate),
          markSheet: Boolean(submitData.markSheet),
          photographs: Boolean(submitData.photographs),
        },
        termsAccepted: Boolean(submitData.termsAccepted),
        familyEnvironment: submitData.familyEnvironment,
        behaviorSkills: submitData.behaviorSkills,
      };

      let res;
      if (id)
        res = await updateEnrollment({ id, data: finalSubmitData }).unwrap();
      else
        res = await createEnrollment({
          data: finalSubmitData,
          applicationId,
        }).unwrap();

      if (res?.success) {
        toast.success(res?.message || "Student enrolled successfully");
        setEnrolledStudentData(res.data);
        setOpenSuccessModal(true);
      } else {
        throw new Error(res?.message || "Failed to enroll student");
      }
    } catch (err: any) {
      let errorMessage = "Failed to enroll student!";
      if (err?.data?.message) errorMessage = err.data.message;
      else if (err?.data?.errorSources?.[0]?.message)
        errorMessage = err.data.errorSources[0].message;
      else if (err?.message) errorMessage = err.message;
      toast.error(errorMessage);
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveStep((prev) => prev + 1);
    document
      .getElementById("form-content-wrapper")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveStep((prev) => prev - 1);
    document
      .getElementById("form-content-wrapper")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (enrollmentLoading || isApplicationLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: alpha(theme.palette.background.default, 0.5),
        minHeight: "100vh",
      }}
    >
      <CraftForm
        key={formKey}
        onSubmit={handleSubmit}
        defaultValues={defaultValues}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              borderRadius: 3,
              background: "#fff",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              sx={{ width: "100%", flex: 1 }}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 56,
                  height: 56,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              >
                <School sx={{ color: "#fff", fontSize: 32 }} />
              </Avatar>
              <Box
                ml={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ width: "100%", flex: 1 }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: "text.primary" }}
                >
                  Student Enrollment
                </Typography>
                {admissionApplications?.data?.[0] && (
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {admissionApplications.data[0].studentInfo?.nameEnglish ||
                      admissionApplications.data[0].studentInfo?.nameBangla ||
                      "Student Name"}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>

          {!id && !applicationId && (
            <AdmissionApplicationSelector onSelect={handleApplicationSelect} />
          )}

          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 3,
              background: "#fff",
              boxShadow: "0 4px 30px rgba(0,0,0,0.03)",
              overflow: "visible",
              minHeight: 600,
            }}
          >
            <Box
              sx={{
                px: 4,
                py: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontWeight: 600, letterSpacing: 0.5 }}
              >
                {activeStep + 1} OF {steps.length}
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }} id="form-content-wrapper">
              <Box minHeight={400}>
                {activeStep === 0 && <StudentInformationStep />}
                {activeStep === 1 && (
                  <AcademicStep classOptions={classOptions} />
                )}
                {activeStep === 2 && <ParentGuardianStep />}
                {activeStep === 3 && <AddressDocumentsStep />}
              </Box>
            </CardContent>
          </Paper>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
              px: 1,
            }}
          >
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
              variant="text"
              type="button"
              sx={{
                fontWeight: "bold",
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
                px: 2,
                py: 1.5,
              }}
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
                endIcon={
                  submitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Save />
                  )
                }
                sx={{
                  borderRadius: 2,
                  px: 5,
                  py: 1.5,
                  fontWeight: "bold",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                  textTransform: "none",
                }}
              >
                {submitting
                  ? "Submitting..."
                  : id
                    ? "Update Enrollment"
                    : "Submit Application"}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                type="button"
                sx={{
                  borderRadius: 2,
                  px: 5,
                  py: 1.5,
                  fontWeight: "bold",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                  textTransform: "none",
                }}
              >
                Continue
              </Button>
            )}
          </Box>
        </Container>

        <Dialog
          open={openSuccessModal}
          onClose={() => {}}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, p: 2, textAlign: "center" } }}
        >
          <DialogContent sx={{ py: 4 }}>
            <Avatar
              sx={{
                bgcolor: "success.main",
                width: 64,
                height: 64,
                margin: "0 auto 16px",
              }}
            >
              <Check sx={{ fontSize: 40, color: "#fff" }} />
            </Avatar>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Enrollment Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Student has been enrolled successfully for the session{" "}
              {new Date().getFullYear()}.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Name: <strong>{enrolledStudentData?.studentName}</strong>
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "center",
              gap: 2,
              pb: 3,
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                width: "100%",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  setOpenSuccessModal(false);
                  setOpenPrintModal(true);
                }}
                startIcon={<Print />}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Print Receipt
              </Button>
            </Box>
            <Button variant="text" onClick={handleFinishProcess}>
              Close & Go to List
            </Button>
          </DialogActions>
        </Dialog>

        <PrintModal
          open={openPrintModal}
          setOpen={setOpenPrintModal}
          receipt={enrolledStudentData?.data?.receipt}
          student={enrolledStudentData?.data?.student || enrolledStudentData}
          onClose={() => {
            setTimeout(() => {
              window.location.href = "/dashboard/student/list";
            }, 100);
          }}
        />
      </CraftForm>
    </Box>
  );
};

export default EnrollmentForm;

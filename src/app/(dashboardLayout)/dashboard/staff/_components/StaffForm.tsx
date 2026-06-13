/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import CraftDatePicker from "@/components/Forms/DatePicker";
import CraftForm from "@/components/Forms/Form";
import CraftInputWithIcon from "@/components/Forms/inputWithIcon";
import MultiFileUploadController from "@/components/Forms/multiFileUploadController";
import CraftSelectWithIcon from "@/components/Forms/selectWithIcon";
import {
  bloodGroup,
  departments,
  genders,
  maritalStatuses,
  statusOptions,
} from "@/options";
import {
  useCreateStaffMutation,
  useGetSingleStaffQuery,
  useUpdateStaffMutation,
} from "@/redux/api/staffApi";
import {
  Apartment,
  ArrowBack,
  AttachMoney,
  Badge,
  Bloodtype,
  BusinessCenter,
  CalendarMonth,
  CardMembership,
  CheckCircle,
  DriveFileRenameOutline,
  Email,
  Group,
  LocationOn,
  Person,
  Phone,
  Save,
  School,
  VerifiedUser,
  Wc,
  Work,
} from "@mui/icons-material";
import {
  Backdrop,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface StaffFormProps {
  id?: string;
}

export default function StaffForm({ id }: StaffFormProps = {}) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const getGridSize = () => {
    if (isMobile) return 12;
    if (isTablet) return 6;
    return 3;
  };

  const gridSize = getGridSize();

  // Removed Snackbar state
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<any>({});

  // Mutations and Queries
  const [createStaff] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation({});
  const { data: singleStaff, isLoading } = useGetSingleStaffQuery(
    { id },
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    if (singleStaff && singleStaff.data) {
      const staff = singleStaff.data;

      const formDefaultValues = {
        // Basic Information
        staffId: staff.staffId || "",
        staffSerial: staff.staffSerial || "",
        smartIdCard: staff.smartIdCard || "",
        staffDepartment: staff.staffDepartment || "",
        name: staff.name || "",
        phone: staff.phone || "",
        email: staff.email || "",
        dateOfBirth: staff.dateOfBirth || "",
        bloodGroup: staff.bloodGroup || "",
        gender: staff.gender || "",
        nationality: staff.nationality || "",
        religion: staff.religion || "",
        maritalStatus: staff.maritalStatus || "",

        // Address Information
        address: staff.permanentAddress?.address || "",
        village: staff.permanentAddress?.village || "",
        postOffice: staff.permanentAddress?.postOffice || "",
        thana: staff.permanentAddress?.thana || "",
        district: staff.permanentAddress?.district || "",
        state: staff.permanentAddress?.state || "",
        country: staff.permanentAddress?.country || "",
        zipCode: staff.permanentAddress?.zipCode || "",

        sameAsPermanent: staff.sameAsPermanent || false,
        currentAddress: {
          address: staff.currentAddress?.address || "",
          village: staff.currentAddress?.village || "",
          postOffice: staff.currentAddress?.postOffice || "",
          thana: staff.currentAddress?.thana || "",
          district: staff.currentAddress?.district || "",
          state: staff.currentAddress?.state || "",
          country: staff.currentAddress?.country || "",
          zipCode: staff.currentAddress?.zipCode || "",
        },

        // Professional Information
        department: staff.department || "", // From Schema
        joiningDate: staff.joiningDate || "",
        monthlySalary: staff.monthlySalary || "",

        // Educational Information
        degree: staff.educationalQualifications?.[0]?.degree || "",
        institution: staff.educationalQualifications?.[0]?.institution || "",
        specialization:
          staff.educationalQualifications?.[0]?.specialization || "",
        year: staff.educationalQualifications?.[0]?.year || "",

        // Certifications
        certificateName: staff.certifications?.[0]?.certificateName || "",
        issuedBy: staff.certifications?.[0]?.issuedBy || "",
        certificateYear: staff.certifications?.[0]?.year || "",
        certificateDescription:
          staff.certifications?.[0]?.description || "",

        // Work Experience
        organization: staff.workExperience?.[0]?.organization || "",
        position: staff.workExperience?.[0]?.position || "",
        from: staff.workExperience?.[0]?.from || "",
        to: staff.workExperience?.[0]?.to || "",
        description: staff.workExperience?.[0]?.description || "",

        // Additional Information
        status: staff.status || "Active",

        // Files
        staffPhoto: staff.staffPhoto,
        resumeDoc: staff.resumeDoc,
        certificateDoc: staff.certificateDoc,
        nationalIdDoc: staff.nationalIdDoc,
      };
      setDefaultValues(formDefaultValues);
    }
  }, [singleStaff]);

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const addressInput = document.querySelector(
        '[name="address"]',
      ) as HTMLInputElement;
      const villageInput = document.querySelector(
        '[name="village"]',
      ) as HTMLInputElement;
      const postOfficeInput = document.querySelector(
        '[name="postOffice"]',
      ) as HTMLInputElement;
      const thanaInput = document.querySelector(
        '[name="thana"]',
      ) as HTMLInputElement;
      const districtInput = document.querySelector(
        '[name="district"]',
      ) as HTMLInputElement;
      const stateInput = document.querySelector(
        '[name="state"]',
      ) as HTMLInputElement;
      const countryInput = document.querySelector(
        '[name="country"]',
      ) as HTMLInputElement;
      const zipCodeInput = document.querySelector(
        '[name="zipCode"]',
      ) as HTMLInputElement;

      const currentAddressFields = {
        address: addressInput?.value || "",
        village: villageInput?.value || "",
        postOffice: postOfficeInput?.value || "",
        thana: thanaInput?.value || "",
        district: districtInput?.value || "",
        state: stateInput?.value || "",
        country: countryInput?.value || "",
        zipCode: zipCodeInput?.value || "",
      };

      const currentAddressInputs = document.querySelectorAll(
        '[name^="currentAddress."]',
      );
      if (currentAddressInputs.length > 0) {
        currentAddressInputs.forEach((input: any) => {
          const fieldName = input.name.replace("currentAddress.", "");
          if (
            currentAddressFields[fieldName as keyof typeof currentAddressFields]
          ) {
            input.value =
              currentAddressFields[
              fieldName as keyof typeof currentAddressFields
              ];
            const event = new Event("input", { bubbles: true });
            input.dispatchEvent(event);
          }
        });
      }
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    if (!data.name) {
      toast.error("Staff name is required!");
      setIsSubmitting(false);
      return;
    }
    if (!data.phone) {
      toast.error("Phone number is required!");
      setIsSubmitting(false);
      return;
    }
    if (!data.email) {
      toast.error("Email is required!");
      setIsSubmitting(false);
      return;
    }

    try {
      // Construct Payload strictly according to staff.model.ts
      const submissionData = {
        // Basic Info
        staffId: data.staffId,
        staffSerial: data.staffSerial ? Number(data.staffSerial) : undefined,
        smartIdCard: data.smartIdCard,
        staffDepartment: data.staffDepartment,
        name: data.name,
        phone: data.phone,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        bloodGroup: data.bloodGroup,
        gender: data.gender,
        nationality: data.nationality,
        religion: data.religion,
        maritalStatus: data.maritalStatus,

        // Documents
        staffPhoto: data.staffPhoto,
        resumeDoc: data.resumeDoc,
        certificateDoc: data.certificateDoc,
        nationalIdDoc: data.nationalIdDoc,

        // Address
        permanentAddress: {
          address: data.address,
          village: data.village,
          postOffice: data.postOffice,
          thana: data.thana,
          district: data.district,
          state: data.state,
          country: data.country,
          zipCode: data.zipCode,
        },

        currentAddress: data.sameAsPermanent
          ? {
            address: data.address,
            village: data.village,
            postOffice: data.postOffice,
            thana: data.thana,
            district: data.district,
            state: data.state,
            country: data.country,
            zipCode: data.zipCode,
          }
          : {
            address: data.currentAddress?.address || "",
            village: data.currentAddress?.village || "",
            postOffice: data.currentAddress?.postOffice || "",
            thana: data.currentAddress?.thana || "",
            district: data.currentAddress?.district || "",
            state: data.currentAddress?.state || "",
            country: data.currentAddress?.country || "",
            zipCode: data.currentAddress?.zipCode || "",
          },

        sameAsPermanent: data.sameAsPermanent || false,

        // Professional Info (Only fields in schema)
        department: data.department,
        joiningDate: data.joiningDate,
        monthlySalary: data.monthlySalary ? Number(data.monthlySalary) : undefined,

        // Arrays
        educationalQualifications: data.degree
          ? [
            {
              degree: data.degree,
              institution: data.institution,
              year: data.year,
              specialization: data.specialization,
            },
          ]
          : [],

        certifications: data.certificateName
          ? [
            {
              certificateName: data.certificateName,
              issuedBy: data.issuedBy,
              year: data.certificateYear,
              description: data.certificateDescription,
            },
          ]
          : [],

        workExperience: data.organization
          ? [
            {
              organization: data.organization,
              position: data.position,
              from: data.from,
              to: data.to,
              description: data.description,
            },
          ]
          : [],

        // Status
        status: data.status || "Active",
      };

      if (id) {
        const res = await updateStaff({ id, data: submissionData }).unwrap();
        if (res.success) {
          toast.success("Staff updated successfully!");
          setSuccess(true);
          setTimeout(() => {
            router.push("/dashboard/staff/list");
          }, 2000);
        }
      } else {
        const res = await createStaff(submissionData).unwrap();
        if (res.success) {
          toast.success("Staff registered successfully!");
          setSuccess(true);
          setTimeout(() => {
            router.push("/dashboard/staff/list");
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(
        error.data?.message || "Failed to process staff information",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  const sectionTitleSx = {
    fontWeight: 600,
    mb: 3,
    color: "#4F0187",
    fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
  };

  const subtitleSx = {
    fontWeight: 500,
    fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f9f9f9, #f0f0f0)",
        pt: { xs: 1, sm: 2 },
        pb: { xs: 4, sm: 8 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #4F0187 0%, #4F0187 100%)",
          color: "white",
          py: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 4 },
          borderRadius: { xs: 0, md: "0 0 20px 20px" },
          boxShadow: "0 4px 20px rgba(79, 1, 135, 0.4)",
        }}
      >
        <Container maxWidth="xl" sx={{ p: { xs: "8px", sm: "16px" } }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Person sx={{ fontSize: { xs: 30, sm: 40 }, mr: 2 }} />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              {id ? "Edit Staff" : "New Staff Registration"}
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ p: { xs: "8px", sm: "16px" } }}>
        <Box sx={{ mb: 3 }}>
          <Link href="/dashboard/staff/list" passHref>
            <Button
              startIcon={<ArrowBack />}
              variant="outlined"
              sx={{
                borderRadius: 100,
                borderColor: "rgba(0,0,0,0.12)",
                color: "text.secondary",
                px: { xs: 2, sm: 3 },
                py: { xs: 0.5, sm: 0.75 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Back to Staff List
            </Button>
          </Link>
        </Box>

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
              mb: 4,
            }}
          >
            <Box sx={{ p: { xs: 1.5, sm: 2, md: 4 } }}>
              {/* Section 1: Basic Information */}
              <Typography variant="h5" sx={sectionTitleSx}>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label={
                      <span>
                        Full Name <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="name"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <DriveFileRenameOutline
                          sx={{
                            color: "text.secondary",
                            mr: 1,
                            fontSize: { xs: 18, sm: 20 },
                          }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Staff Serial"
                    name="staffSerial"
                    type="number"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <Badge sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftSelectWithIcon
                    name="staffDepartment"
                    size="small"
                    label="Staff Department"
                    placeholder="Select Department"
                    items={["Admin", "Account", "General Staff"]}
                    adornment={<Apartment color="action" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Smart ID Card"
                    name="smartIdCard"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <CardMembership
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label={
                      <span>
                        Phone Number <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="phone"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <Phone sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label={
                      <span>
                        Email Address <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="email"
                    type="email"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <Email sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftDatePicker
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftSelectWithIcon
                    name="bloodGroup"
                    size="small"
                    label="Blood Group"
                    placeholder="Select blood group"
                    items={bloodGroup}
                    adornment={<Bloodtype color="action" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftSelectWithIcon
                    name="gender"
                    size="small"
                    label="Gender"
                    placeholder="Select Gender"
                    items={genders}
                    adornment={<Wc color="action" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Nationality"
                    name="nationality"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <LocationOn sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Religion"
                    name="religion"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <VerifiedUser sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftSelectWithIcon
                    name="maritalStatus"
                    size="small"
                    label="Marital Status"
                    placeholder="Select Marital Status"
                    items={maritalStatuses}
                    adornment={<Group color="action" />}
                  />
                </Grid>
              </Grid>

              {/* Section 2: Documents */}
              <Typography
                variant="h5"
                sx={{ ...sectionTitleSx, mt: { xs: 3, sm: 4, md: 5 } }}
              >
                Documents & Files
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={6}>
                  <MultiFileUploadController
                    name="staffPhoto"
                    label="Staff Photo"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <MultiFileUploadController
                    name="resumeDoc"
                    label="CV / Resume"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <MultiFileUploadController
                    name="certificateDoc"
                    label="Certificates"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <MultiFileUploadController
                    name="nationalIdDoc"
                    label="National ID"
                  />
                </Grid>
              </Grid>

              {/* Section 3: Address Information */}
              <Typography
                variant="h5"
                sx={{ ...sectionTitleSx, mt: { xs: 3, sm: 4, md: 5 } }}
              >
                Address Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={subtitleSx}>
                    Permanent Address
                  </Typography>
                  <Card
                    variant="outlined"
                    sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}
                  >
                    <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
                      <Grid item xs={12}>
                        <CraftInputWithIcon
                          fullWidth
                          label="Address Line"
                          name="address"
                          size="small"
                          multiline
                          rows={2}
                          InputProps={{
                            startAdornment: (
                              <LocationOn
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
                      <Grid item xs={12} sm={6}>
                        <CraftInputWithIcon
                          fullWidth
                          label="Village/Area"
                          name="village"
                          size="small"
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
                          label="Post Office"
                          name="postOffice"
                          size="small"
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
                          label="Thana/Police Station"
                          name="thana"
                          size="small"
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
                          label="District"
                          name="district"
                          size="small"
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
                          label="State/Province"
                          name="state"
                          size="small"
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
                          label="Country"
                          name="country"
                          size="small"
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
                          label="Zip/Postal Code"
                          name="zipCode"
                          size="small"
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
                    <Typography variant="subtitle1" sx={subtitleSx}>
                      Present Address
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          name="sameAsPermanent"
                          onChange={handleSwitchChange}
                          color="primary"
                          size={isMobile ? "small" : "medium"}
                        />
                      }
                      label="Same as Permanent"
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        },
                      }}
                    />
                  </Box>
                  <Card
                    variant="outlined"
                    sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}
                  >
                    <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
                      <Grid item xs={12}>
                        <CraftInputWithIcon
                          fullWidth
                          label="Address Line"
                          name="currentAddress.address"
                          size="small"
                          multiline
                          rows={2}
                          InputProps={{
                            startAdornment: (
                              <LocationOn
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
                      <Grid item xs={12} sm={6}>
                        <CraftInputWithIcon
                          fullWidth
                          label="Village/Area"
                          name="currentAddress.village"
                          size="small"
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
                          label="Post Office"
                          name="currentAddress.postOffice"
                          size="small"
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
                          label="Thana/Police Station"
                          name="currentAddress.thana"
                          size="small"
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
                          label="District"
                          name="currentAddress.district"
                          size="small"
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
                          label="State/Province"
                          name="currentAddress.state"
                          size="small"
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
                          label="Country"
                          name="currentAddress.country"
                          size="small"
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
                          label="Zip/Postal Code"
                          name="currentAddress.zipCode"
                          size="small"
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

              {/* Section 4: Professional Information */}
              <Typography
                variant="h5"
                sx={{ ...sectionTitleSx, mt: { xs: 3, sm: 4, md: 5 } }}
              >
                Professional Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftSelectWithIcon
                    name="department"
                    size="small"
                    label="Department"
                    placeholder="Select Department"
                    items={departments}
                    adornment={<Apartment color="action" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftDatePicker
                    fullWidth
                    label="Joining Date"
                    name="joiningDate"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Monthly Salary"
                    name="monthlySalary"
                    type="number"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <AttachMoney sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Section 5: Educational Information */}
              <Typography
                variant="h5"
                sx={{ ...sectionTitleSx, mt: { xs: 3, sm: 4, md: 5 } }}
              >
                Educational Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Degree/Certificate"
                    name="degree"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <School sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Institution"
                    name="institution"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <BusinessCenter
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Year of Completion"
                    name="year"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <CalendarMonth
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Specialization"
                    name="specialization"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <School sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Section 6: Certifications */}
              <Typography
                variant="h5"
                sx={{ ...sectionTitleSx, mt: { xs: 3, sm: 4, md: 5 } }}
              >
                Certifications
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Certificate Name"
                    name="certificateName"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <CardMembership
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Issued By"
                    name="issuedBy"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <BusinessCenter
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Year"
                    name="certificateYear"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <CalendarMonth
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Description"
                    name="certificateDescription"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <CardMembership
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Section 7: Work Experience */}
              <Typography
                variant="h5"
                sx={{ ...sectionTitleSx, mt: { xs: 3, sm: 4, md: 5 } }}
              >
                Work Experience
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Organization"
                    name="organization"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <BusinessCenter
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Position"
                    name="position"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <Work sx={{ color: "text.secondary", mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="From (Year)"
                    name="from"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <CalendarMonth
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftInputWithIcon
                    fullWidth
                    label="To (Year or Present)"
                    name="to"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <CalendarMonth
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CraftInputWithIcon
                    fullWidth
                    label="Description"
                    name="description"
                    multiline
                    rows={2}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <BusinessCenter
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

              {/* Section 8: Additional Information */}
              <Typography
                variant="h5"
                sx={{ ...sectionTitleSx, mt: { xs: 3, sm: 4, md: 5 } }}
              >
                Additional Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                <Grid item xs={12} sm={6} md={gridSize}>
                  <CraftSelectWithIcon
                    name="status"
                    size="small"
                    label="Status"
                    placeholder="Select Status"
                    items={statusOptions}
                    adornment={<VerifiedUser color="action" />}
                  />
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Box
                sx={{
                  mt: 5,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                }}
              >

                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<Save />}
                  disabled={isSubmitting}
                  sx={{
                    borderRadius: 100,
                    px: 6,
                    py: 1.2,
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                    boxShadow: "0 4px 10px rgba(33, 150, 243, 0.3)",
                  }}
                >
                  {id ? "Update Staff" : "Register Staff"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </CraftForm>

      </Container>
    </Box>
  );
}
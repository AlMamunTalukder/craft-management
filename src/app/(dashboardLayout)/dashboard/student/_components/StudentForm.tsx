/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { LoadingState } from "@/components/common/LoadingState";
import { StudentFormWrapper } from "@/components/student/StudentFormWrapper";
import { studentToFormValues, formToStudentPayload } from "@/components/student/studentFieldMappers";
import {
  useCreateStudentsMutation,
  useGetSingleStudentQuery,
  useUpdateStudentMutation,
} from "@/redux/api/studentApi";
import { Person } from "@mui/icons-material";
import {
  alpha,
  Box,
  Container,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface StudentFormProps {
  id?: string;
}

const StudentForm = ({ id }: StudentFormProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  const [createStudents, { isLoading: isCreating }] = useCreateStudentsMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

  const { data, isLoading } = useGetSingleStudentQuery(
    { id },
    { skip: !id, refetchOnMountOrArgChange: true }
  );

  const isSubmitting = isCreating || isUpdating;

  const handleSubmit = async (formData: any) => {
    if (!formData.studentName && !formData.name) {
      toast.error("Student name is required!");
      return;
    }
    if (!formData.studentDepartment && !formData.studentDept) {
      toast.error("Student department is required!");
      return;
    }
    const submissionData = formToStudentPayload(formData);
    try {
      if (id) {
        const res = await updateStudent({ id, data: submissionData }).unwrap();
        if (res.success) {
          toast.success("Student updated successfully!");
          setTimeout(() => router.push("/dashboard/student/list"), 1000);
        }
      } else {
        const res = await createStudents(submissionData).unwrap();
        if (res.success) {
          toast.success("Student registered successfully!");
          setTimeout(() => router.push("/dashboard/student/list"), 1000);
        }
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.data?.message || "An error occurred while submitting the form");
    }
  };

  const handleCancel = () => router.push("/dashboard/student/list");

  if (isLoading) return <LoadingState />;

  const defaultValues = data?.data ? studentToFormValues(data.data) : {
    studentName: "",
    studentNameBangla: "",
    studentDepartment: "hifz",
    gender: "",
    nationality: "Bangladeshi",
    category: "Residential",
    session: new Date().getFullYear().toString(),
    className: [],
    section: [],
    activeSession: [],
    termsAccepted: false,
    sameAsPermanent: false,
  };

  const formKey = data?.data?._id ?? (id ? `edit-${id}` : "create-form");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: { xs: 1, sm: 2, md: 3 },
        pb: { xs: 4, sm: 6, md: 8 },
        px: { xs: 1, sm: 2, md: 3 },
        bgcolor: alpha(theme.palette.primary.main, 0.02),
      }}
    >
      <Container maxWidth="xl" disableGutters={isMobile}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: { xs: 2, sm: 3, md: 4 } }}>
          <Person sx={{ fontSize: { xs: 30, sm: 35, md: 40 }, mr: 2, color: "primary.main" }} />
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" }, color: "primary.main" }}
          >
            {id ? "Edit Student" : "New Student Registration"}
          </Typography>
        </Box>
      </Container>

      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Paper elevation={3} sx={{ borderRadius: { xs: 2, sm: 3, md: 4 }, overflow: "hidden", p: { xs: 1.5, sm: 2, md: 4 } }}>
          <StudentFormWrapper
            defaultValues={defaultValues}
            formKey={formKey}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            mode="student"
            submitLabel={id ? "Update Student" : "Register Student"}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default StudentForm;

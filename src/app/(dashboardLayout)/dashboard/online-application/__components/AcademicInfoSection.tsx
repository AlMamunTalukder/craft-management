// components/admission/AcademicInfoSection.tsx

import React from "react";
import {
    alpha,
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { School } from "@mui/icons-material";
import { InfoRow, DepartmentChip } from "./UtilityComponents";
import { AcademicInfo, StudentInfo } from "@/interface/admission";

interface AcademicInfoSectionProps {
    studentInfo: StudentInfo;
    academicInfo: AcademicInfo;
    displayDepartment?: string;
    displayClass?: string;
}

export const AcademicInfoSection = ({
    studentInfo,
    academicInfo,
    displayDepartment,
    displayClass,
}: AcademicInfoSectionProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                height: "100%",
            }}
        >
            <CardHeader
                avatar={
                    <Avatar
                        sx={{
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                        }}
                    >
                        <School />
                    </Avatar>
                }
                title="একাডেমিক তথ্য"
                titleTypographyProps={{
                    fontWeight: "bold",
                    variant: isMobile ? "subtitle1" : "h6",
                }}
            />
            <Divider />
            <CardContent>
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "transparent" }}>
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ border: "none", fontWeight: "bold", width: "40%", py: 1 }}>
                                    বিভাগ
                                </TableCell>
                                <TableCell sx={{ border: "none", py: 1 }}>
                                    <DepartmentChip department={displayDepartment} />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ border: "none", fontWeight: "bold", py: 1 }}>
                                    শ্রেণি
                                </TableCell>
                                <TableCell sx={{ border: "none", py: 1 }}>
                                    <Chip label={displayClass || "N/A"} size="small" sx={{ fontWeight: 600 }} />
                                </TableCell>
                            </TableRow>
                            <InfoRow label="সেশন" value={studentInfo.session || "N/A"} />
                            <InfoRow label="পূর্ববর্তী প্রতিষ্ঠান" value={academicInfo?.previousSchool || "N/A"} />
                            <InfoRow label="পূর্ববর্তী শ্রেণি" value={academicInfo?.previousClass || "N/A"} />
                            <TableRow>
                                <TableCell sx={{ border: "none", fontWeight: "bold", py: 1 }}>
                                    সর্বশেষ জিপিএ
                                </TableCell>
                                <TableCell sx={{ border: "none", py: 1 }}>
                                    <Chip
                                        label={academicInfo?.gpa || "N/A"}
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};
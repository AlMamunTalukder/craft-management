// components/admission/PersonalInfoSection.tsx

import React from "react";
import {
    alpha,
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Paper,
    Table,
    TableBody,
    TableContainer,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {
    Bloodtype,
    CalendarToday,
    Fingerprint,
    Flag,
    Person,
} from "@mui/icons-material";
import { GenderIcon, InfoRow } from "./UtilityComponents";

import { formatDate } from "@/utils/formateDate";
import { StudentInfo } from "@/interface/admission";

interface PersonalInfoSectionProps {
    studentInfo: StudentInfo;
    displayNameBangla?: string;
    displayNameEnglish?: string;
}

export const PersonalInfoSection = ({
    studentInfo,
    displayNameBangla,
    displayNameEnglish,
}: PersonalInfoSectionProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                height: "100%",
            }}
        >
            <CardHeader
                avatar={
                    <Avatar
                        sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                        }}
                    >
                        <Person />
                    </Avatar>
                }
                title="ব্যক্তিগত তথ্য"
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
                            <InfoRow label="নাম (বাংলা)" value={displayNameBangla} />
                            <InfoRow label="নাম (ইংরেজি)" value={displayNameEnglish} />
                            <InfoRow
                                label="জন্ম তারিখ"
                                value={studentInfo.dateOfBirth ? formatDate(studentInfo.dateOfBirth) : "N/A"}
                                icon={<CalendarToday fontSize="small" sx={{ color: theme.palette.primary.main }} />}
                            />
                            <InfoRow label="বয়স" value={studentInfo.age ? `${studentInfo.age} বছর` : "N/A"} />
                            <InfoRow
                                label="লিঙ্গ"
                                value={studentInfo.gender || "N/A"}
                                icon={<GenderIcon gender={studentInfo.gender} />}
                            />
                            <InfoRow
                                label="রক্তের গ্রুপ"
                                value={studentInfo.bloodGroup || "N/A"}
                                icon={<Bloodtype fontSize="small" sx={{ color: theme.palette.error.main }} />}
                            />
                            <InfoRow
                                label="জাতীয়তা"
                                value={studentInfo.nationality || "N/A"}
                                icon={<Flag fontSize="small" sx={{ color: theme.palette.success.main }} />}
                            />
                            <InfoRow
                                label="এনআইডি/জন্ম নিবন্ধন"
                                value={studentInfo.nidBirth || "N/A"}
                                icon={<Fingerprint fontSize="small" sx={{ color: theme.palette.info.main }} />}
                            />
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};
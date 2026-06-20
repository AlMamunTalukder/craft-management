// components/admission/FamilyEnvironmentSection.tsx

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
import { FamilyRestroom } from "@mui/icons-material";
import { InfoRow } from "./UtilityComponents";
import { FamilyEnvironment } from "@/interface/admission";

interface FamilyEnvironmentSectionProps {
    familyEnvironment?: FamilyEnvironment;
}

export const FamilyEnvironmentSection = ({
    familyEnvironment,
}: FamilyEnvironmentSectionProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
            }}
        >
            <CardHeader
                avatar={
                    <Avatar
                        sx={{
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: theme.palette.warning.main,
                        }}
                    >
                        <FamilyRestroom />
                    </Avatar>
                }
                title="পারিবারিক পরিবেশ"
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
                            <InfoRow label="হালাল আয়" value={familyEnvironment?.halalIncome} />
                            <InfoRow label="মা-বাবার নামাজ" value={familyEnvironment?.parentsPrayer} />
                            <InfoRow label="নেশা/অনিষ্টকর অভ্যাস" value={familyEnvironment?.addiction} />
                            <InfoRow label="টিভি দেখা" value={familyEnvironment?.tv} />
                            <InfoRow label="কুরআন তিলাওয়াত" value={familyEnvironment?.quranRecitation} />
                            <InfoRow label="পর্দা পালন" value={familyEnvironment?.purdah} />
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};
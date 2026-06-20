// components/admission/TermsAcceptedSection.tsx

import React from "react";
import {
    Card,
    CardContent,
    Chip,
    Typography,
} from "@mui/material";
import {
    CancelOutlined,
    CheckCircleOutline,
} from "@mui/icons-material";

interface TermsAcceptedSectionProps {
    termsAccepted: boolean;
}

export const TermsAcceptedSection = ({
    termsAccepted,
}: TermsAcceptedSectionProps) => {
    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                border: (theme) => `1px solid ${theme.palette.info.main}20`,
            }}
        >
            <CardContent
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="body1" fontWeight="bold">
                    শর্তাবলী গ্রহণ করেছেন?
                </Typography>
                <Chip
                    icon={termsAccepted ? <CheckCircleOutline /> : <CancelOutlined />}
                    label={termsAccepted ? "হ্যাঁ" : "না"}
                    color={termsAccepted ? "success" : "error"}
                    variant="filled"
                    size="small"
                    sx={{ fontWeight: 600, minWidth: 80 }}
                />
            </CardContent>
        </Card>
    );
};
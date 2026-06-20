// components/admission/DocumentsSection.tsx

import React from "react";
import {
    alpha,
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Grid,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { Description } from "@mui/icons-material";
import { DocumentItem } from "./UtilityComponents";
import { DOCUMENT_LABELS } from "@/constant/admissionConstants";
import { Documents } from "@/interface/admission";

interface DocumentsSectionProps {
    documents?: Documents;
}

export const DocumentsSection = ({ documents }: DocumentsSectionProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const documentList = DOCUMENT_LABELS.map(({ key, label }) => ({
        key,
        label,
        value: documents?.[key] || false,
    }));

    const completedDocs = documentList.filter((d) => d.value).length;

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
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
                        <Description />
                    </Avatar>
                }
                title="প্রদত্ত ডকুমেন্টসমূহ"
                titleTypographyProps={{
                    fontWeight: "bold",
                    variant: isMobile ? "subtitle1" : "h6",
                }}
                action={
                    <Chip
                        label={`${completedDocs}/${documentList.length} সম্পন্ন`}
                        color={completedDocs === documentList.length ? "success" : "warning"}
                        size="small"
                    />
                }
            />
            <Divider />
            <CardContent>
                <Grid container spacing={2}>
                    {documentList.map((doc) => (
                        <Grid item xs={12} sm={6} md={4} key={doc.key}>
                            <DocumentItem label={doc.label} value={doc.value} />
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};
// components/admission/BehaviorSkillsSection.tsx

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
import { Person } from "@mui/icons-material";
import { InfoRow } from "./UtilityComponents";
import { BehaviorSkills } from "@/interface/admission";

interface BehaviorSkillsSectionProps {
    behaviorSkills?: BehaviorSkills;
}

export const BehaviorSkillsSection = ({
    behaviorSkills,
}: BehaviorSkillsSectionProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            }}
        >
            <CardHeader
                avatar={
                    <Avatar
                        sx={{
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: theme.palette.info.main,
                        }}
                    >
                        <Person />
                    </Avatar>
                }
                title="আচরণ ও দক্ষতা"
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
                            <InfoRow label="মোবাইল ব্যবহার" value={behaviorSkills?.mobileUsage} />
                            <InfoRow label="সাধারণ আচরণ" value={behaviorSkills?.generalBehavior} />
                            <InfoRow label="আনুগত্য" value={behaviorSkills?.obedience} />
                            <InfoRow label="বড়দের সাথে ব্যবহার" value={behaviorSkills?.elderBehavior} />
                            <InfoRow label="ছোটদের সাথে ব্যবহার" value={behaviorSkills?.youngerBehavior} />
                            <InfoRow label="মিথ্যা/একগুঁয়েমি" value={behaviorSkills?.lyingStubbornness} />
                            <InfoRow label="পড়াশোনায় আগ্রহ" value={behaviorSkills?.studyInterest} />
                            <InfoRow label="ধর্মীয় আগ্রহ" value={behaviorSkills?.religiousInterest} />
                            <InfoRow label="রাগ নিয়ন্ত্রণ" value={behaviorSkills?.angerControl} />
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};
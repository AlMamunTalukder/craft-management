

import { DEPARTMENT_COLORS, DEPARTMENT_LABELS, getStatusConfig, } from "@/constant/admissionConstants";
import { Address, PersonInfo } from "@/interface/admission";
import {
    CancelOutlined,
    CheckCircleOutline,
    FamilyRestroom,
    Female,
    Home,
    LocalPhone,
    Male,
    Map,
    Wc,
    WhatsApp as WhatsAppIcon
} from "@mui/icons-material";
import {
    alpha,
    Avatar,
    Box,
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
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import React from "react";


export const StatusChip = ({ status }: { status?: string }) => {
    // Use the helper function instead of direct indexing
    const config = getStatusConfig(status);

    return (
        <Chip
            label={config.label}
            color={config.color}
            size="small"
            sx={{
                fontWeight: 600,
                borderRadius: "8px",
                minWidth: { xs: 80, sm: 100 },
            }}
        />
    );
};


export const DepartmentChip = ({ department }: { department?: string }) => {
    const normalizedDept = department?.toLowerCase() || "";
    const color = DEPARTMENT_COLORS[normalizedDept] || "#6B7280";
    const label = DEPARTMENT_LABELS[normalizedDept] || department || "N/A";

    return (
        <Chip
            label={label}
            size="small"
            sx={{
                backgroundColor: `${color}20`,
                color: color,
                fontWeight: 600,
                borderRadius: "8px",
                border: `1px solid ${color}30`,
            }}
        />
    );
};

// ============================================================================
// Gender Icon Component
// ============================================================================

export const GenderIcon = ({ gender }: { gender?: string }) => {
    switch (gender?.toLowerCase()) {
        case "male":
            return <Male sx={{ color: "#3B82F6" }} />;
        case "female":
            return <Female sx={{ color: "#EC4899" }} />;
        default:
            return <Wc sx={{ color: "#8B5CF6" }} />;
    }
};

// ============================================================================
// Info Row Component
// ============================================================================

export const InfoRow = ({
    label,
    value,
    icon,
}: {
    label: string;
    value?: any;
    icon?: React.ReactNode;
}) => (
    <TableRow>
        <TableCell sx={{ border: "none", fontWeight: "bold", width: "40%", py: 1 }}>
            {label}
        </TableCell>
        <TableCell sx={{ border: "none", py: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {icon}
                <Typography variant="body2">{value || "N/A"}</Typography>
            </Box>
        </TableCell>
    </TableRow>
);

// ============================================================================
// Document Item Component
// ============================================================================

export const DocumentItem = ({ label, value }: { label: string; value?: boolean }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                borderRadius: 2,
                bgcolor: value
                    ? (theme) => alpha(theme.palette.success.main, 0.1)
                    : (theme) => alpha(theme.palette.error.main, 0.1),
            }}
        >
            {value ? (
                <CheckCircleOutline color="success" fontSize="small" />
            ) : (
                <CancelOutlined color="error" fontSize="small" />
            )}
            <Typography variant="body2">{label}</Typography>
        </Box>
    );
};

// ============================================================================
// Address Card Component
// ============================================================================

interface AddressCardProps {
    title: string;
    address?: Address;
    color: "primary" | "info";
    icon: typeof Home;
}

export const AddressCard = ({ title, address, color, icon: Icon }: AddressCardProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const IconComponent = Icon;

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
            }}
        >
            <CardHeader
                avatar={
                    <Avatar
                        sx={{
                            bgcolor: alpha(theme.palette[color].main, 0.1),
                            color: theme.palette[color].main,
                        }}
                    >
                        <IconComponent />
                    </Avatar>
                }
                title={title}
                titleTypographyProps={{
                    fontWeight: "bold",
                    variant: isMobile ? "subtitle1" : "h6",
                }}
            />
            <Divider />
            <CardContent>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Map color={color} fontSize="small" sx={{ mt: 0.5 }} />
                    <Box>
                        <Typography variant="body2">
                            {address?.village || "N/A"},
                            <br />
                            {address?.postOffice || "N/A"}
                            {address?.postCode ? `- ${address.postCode}` : ""}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            থানা: {address?.policeStation || "N/A"}
                            <br />
                            জেলা: {address?.district || "N/A"}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

// ============================================================================
// Person Info Card Component
// ============================================================================

interface PersonInfoCardProps {
    title: string;
    person?: PersonInfo;
    icon: typeof FamilyRestroom;
    color: "info" | "secondary" | "warning";
    showRelation?: boolean;
    showAddress?: boolean;
}

export const PersonInfoCard = ({
    title,
    person,
    icon: Icon,
    color,
    showRelation = false,
    showAddress = false,
}: PersonInfoCardProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const IconComponent = Icon;

    if (!person?.nameBangla && !person?.nameEnglish) return null;

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
            }}
        >
            <CardHeader
                avatar={
                    <Avatar
                        sx={{
                            bgcolor: alpha(theme.palette[color].main, 0.1),
                            color: theme.palette[color].main,
                        }}
                    >
                        <IconComponent />
                    </Avatar>
                }
                title={title}
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
                            <InfoRow label="নাম (বাংলা)" value={person?.nameBangla} />
                            <InfoRow label="নাম (ইংরেজি)" value={person?.nameEnglish} />
                            <InfoRow label="পেশা" value={person?.profession} />
                            <InfoRow label="শিক্ষাগত যোগ্যতা" value={person?.education} />
                            <InfoRow
                                label="মোবাইল"
                                value={person?.mobile}
                                icon={<LocalPhone fontSize="small" sx={{ color: theme.palette.success.main }} />}
                            />
                            <InfoRow
                                label="WhatsApp"
                                value={person?.whatsapp}
                                icon={<WhatsAppIcon fontSize="small" sx={{ color: "#25D366" }} />}
                            />
                            {showRelation && <InfoRow label="সম্পর্ক" value={person?.relation} />}
                            {showAddress && <InfoRow label="ঠিকানা" value={person?.address} />}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useGetSingleStaffQuery } from "@/redux/api/staffApi";
import {
    Badge,
    CheckCircle,
    Dashboard,
    Download,
    Edit,
    Email,
    LocationOn,
    MoreVert,
    Person,
    Phone,
    Print,
    Restaurant,
    School,
    Settings,
    Timeline,
    Work
} from "@mui/icons-material";
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import { useEffect, useState } from "react";
import StaffMealAttendance from "./StaffMealAttendance";
import { formatAddress, formatDate } from "@/utils/formateDate";

// Tab Panel component
function TabPanel(props: any) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`staff-tabpanel-${index}`}
            aria-labelledby={`staff-tab-${index}`}
            {...other}
            style={{ padding: "20px 0" }}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

interface PageProps {
    params: {
        id: string;
    };
}


// Main Staff Profile Component
export default function StaffProfile({ params }: PageProps) {
    const { id } = params;
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);

    const { data: singleStaff, isLoading } = useGetSingleStaffQuery({ id });
    const staff = singleStaff?.data;

    useEffect(() => {
        console.log("Staff data:", staff);
    }, [staff]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleMenuClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };


    // Status color mapping
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return theme.palette.success.main;
            case "inactive":
                return theme.palette.error.main;
            default:
                return theme.palette.grey[500];
        }
    };

    // Calculate meal attendance stats
    const mealCount = staff?.mealAttendances?.length || 0;
    const totalMealCost = staff?.mealAttendances?.reduce(
        (sum: number, meal: any) => sum + (meal.mealCost || 0),
        0
    ) || 0;

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
            </Box>
        );
    }

    if (!staff) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h5" color="error">
                        Staff member not found
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header Section */}
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: "16px",
                    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                    color: "white",
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={2}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: { xs: "center", md: "flex-start" },
                            }}
                        >
                            <Avatar
                                src={staff.staffPhoto}
                                alt={staff.name}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    border: "4px solid white",
                                    boxShadow: theme.shadows[3],
                                }}
                            >
                                {!staff.staffPhoto && staff.name?.charAt(0)}
                            </Avatar>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                {staff.name || "N/A"}
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                {staff.department || "Staff"} • Staff ID: {staff.staffId || "N/A"}
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                    justifyContent: { xs: "center", md: "flex-start" },
                                    mt: 1,
                                }}
                            >
                                <Chip
                                    icon={<Badge sx={{ color: "white !important" }} />}
                                    label={`Serial: ${staff.staffSerial || "N/A"}`}
                                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                                />
                                <Chip
                                    icon={<Work sx={{ color: "white !important" }} />}
                                    label={`Joined: ${formatDate(staff.joiningDate)}`}
                                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                                />
                                <Chip
                                    icon={<CheckCircle sx={{ color: "white !important" }} />}
                                    label={`Status: ${staff.status || "N/A"}`}
                                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                                />
                                {mealCount > 0 && (
                                    <Chip
                                        icon={<Restaurant sx={{ color: "white !important" }} />}
                                        label={`${mealCount} Meals`}
                                        sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                                    />
                                )}
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Tooltip title="Edit Profile">
                                <IconButton sx={{ color: "white", bgcolor: "rgba(255,255,255,0.2)" }}>
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="More Options">
                                <IconButton
                                    sx={{ color: "white", bgcolor: "rgba(255,255,255,0.2)" }}
                                    onClick={handleMenuClick}
                                >
                                    <MoreVert />
                                </IconButton>
                            </Tooltip>
                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                                <MenuItem onClick={handleMenuClose}>
                                    <ListItemIcon>
                                        <Download fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Download Profile</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleMenuClose}>
                                    <ListItemIcon>
                                        <Print fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Print Profile</ListItemText>
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={handleMenuClose}>
                                    <ListItemIcon>
                                        <Settings fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Settings</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="staff profile tabs"
                    sx={{
                        "& .MuiTab-root": {
                            minWidth: "auto",
                            px: 3,
                            py: 2,
                        },
                    }}
                >
                    <Tab icon={<Dashboard />} label="Overview" iconPosition="start" />
                    <Tab icon={<Restaurant />} label={`Meal Attendance (${mealCount})`} iconPosition="start" />
                </Tabs>
            </Box>

            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    {/* Personal Information */}
                    <Grid item xs={12} md={4}>
                        <Card elevation={2} sx={{ height: "100%", borderRadius: "12px" }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    gutterBottom
                                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                >
                                    <Person color="primary" /> Personal Information
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <List disablePadding>
                                    <ListItem disablePadding sx={{ mb: 2 }}>
                                        <ListItemIcon>
                                            <Email color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Email"
                                            secondary={staff.email || "N/A"}
                                            primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                                            secondaryTypographyProps={{ variant: "body1" }}
                                        />
                                    </ListItem>
                                    <ListItem disablePadding sx={{ mb: 2 }}>
                                        <ListItemIcon>
                                            <Phone color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Phone"
                                            secondary={staff.phone || "N/A"}
                                            primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                                            secondaryTypographyProps={{ variant: "body1" }}
                                        />
                                    </ListItem>
                                    <ListItem disablePadding sx={{ mb: 2 }}>
                                        <ListItemIcon>
                                            <LocationOn color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Address"
                                            secondary={formatAddress(staff.currentAddress)}
                                            primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                                            secondaryTypographyProps={{ variant: "body1" }}
                                        />
                                    </ListItem>
                                    <ListItem disablePadding sx={{ mb: 2 }}>
                                        <ListItemIcon>
                                            <School color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Education"
                                            secondary={staff.educationalQualifications?.[0]?.degree || "N/A"}
                                            primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                                            secondaryTypographyProps={{ variant: "body1" }}
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Employment Information */}
                    <Grid item xs={12} md={4}>
                        <Card elevation={2} sx={{ height: "100%", borderRadius: "12px" }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    gutterBottom
                                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                >
                                    <Work color="primary" /> Employment Information
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <List disablePadding>
                                    <ListItem disablePadding sx={{ mb: 2 }}>
                                        <ListItemText
                                            primary="Staff ID"
                                            secondary={staff.staffId || "N/A"}
                                            primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                                            secondaryTypographyProps={{ variant: "body1", fontWeight: "medium" }}
                                        />
                                    </ListItem>
                                    <ListItem disablePadding sx={{ mb: 2 }}>
                                        <ListItemText
                                            primary="Staff Serial"
                                            secondary={staff.staffSerial || "N/A"}
                                            primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                                            secondaryTypographyProps={{ variant: "body1", fontWeight: "medium" }}
                                        />
                                    </ListItem>
                                    <ListItem disablePadding sx={{ mb: 2 }}>
                                        <ListItemText
                                            primary="Department"
                                            secondary={staff.staffDepartment || staff.department || "N/A"}
                                            primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                                            secondaryTypographyProps={{ variant: "body1", fontWeight: "medium" }}
                                        />
                                    </ListItem>
                                    <ListItem disablePadding sx={{ mb: 2 }}>
                                        <ListItemText
                                            primary="Joining Date"
                                            secondary={formatDate(staff.joiningDate)}
                                            primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                                            secondaryTypographyProps={{ variant: "body1", fontWeight: "medium" }}
                                        />
                                    </ListItem>
                                    <ListItem disablePadding sx={{ mb: 2 }}>
                                        <ListItemText
                                            primary="Monthly Salary"
                                            secondary={`৳${staff.monthlySalary?.toLocaleString() || "N/A"}`}
                                            primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                                            secondaryTypographyProps={{ variant: "body1", fontWeight: "medium", color: "success.main" }}
                                        />
                                    </ListItem>
                                    <ListItem disablePadding sx={{ mb: 2 }}>
                                        <ListItemText
                                            primary="Status"
                                            secondary={
                                                <Chip
                                                    label={staff.status || "N/A"}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getStatusColor(staff.status) + "20",
                                                        color: getStatusColor(staff.status),
                                                        fontWeight: "medium",
                                                    }}
                                                />
                                            }
                                            primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Work Experience */}
                    <Grid item xs={12} md={4}>
                        <Card elevation={2} sx={{ height: "100%", borderRadius: "12px" }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    gutterBottom
                                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                >
                                    <Timeline color="primary" /> Work Experience
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                {staff.workExperience && staff.workExperience.length > 0 ? (
                                    staff.workExperience.map((exp: any, index: number) => (
                                        <Box key={index} sx={{ mb: 3 }}>
                                            <Typography variant="body1" fontWeight="bold">
                                                {exp.position || "Position"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {exp.organization || "Organization"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {exp.from} - {exp.to || "Present"}
                                            </Typography>
                                            {exp.description && (
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    {exp.description}
                                                </Typography>
                                            )}
                                            {index < staff.workExperience.length - 1 && <Divider sx={{ mt: 2 }} />}
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary" textAlign="center">
                                        No work experience recorded
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Educational Qualifications */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2} sx={{ borderRadius: "12px" }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    gutterBottom
                                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                >
                                    <School color="primary" /> Educational Qualifications
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                {staff.educationalQualifications && staff.educationalQualifications.length > 0 ? (
                                    staff.educationalQualifications.map((edu: any, index: number) => (
                                        <Box key={index} sx={{ mb: 2 }}>
                                            <Typography variant="body1" fontWeight="bold">
                                                {edu.degree || "Degree"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {edu.institution || "Institution"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Year: {edu.year || "N/A"} • Specialization: {edu.specialization || "N/A"}
                                            </Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary" textAlign="center">
                                        No educational qualifications recorded
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Certifications */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2} sx={{ borderRadius: "12px" }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    gutterBottom
                                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                >
                                    <CheckCircle color="primary" /> Certifications
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                {staff.certifications && staff.certifications.length > 0 ? (
                                    staff.certifications.map((cert: any, index: number) => (
                                        <Box key={index} sx={{ mb: 2 }}>
                                            <Typography variant="body1" fontWeight="bold">
                                                {cert.certificateName || "Certification"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Issued by: {cert.issuedBy || "N/A"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Year: {cert.year || "N/A"}
                                            </Typography>
                                            {cert.description && (
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    {cert.description}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary" textAlign="center">
                                        No certifications recorded
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Meal Attendance Tab */}
            <TabPanel value={tabValue} index={1}>
                <StaffMealAttendance staff={staff} />
            </TabPanel>
        </Container>
    );
}
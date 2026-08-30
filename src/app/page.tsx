/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import CraftForm from "@/components/Forms/Form";
import CraftInput from "@/components/Forms/Input";
import { useLoginMutation } from "@/redux/features/auth/auth.api";
import { zodResolver } from "@hookform/resolvers/zod";

import { storeUserInfo } from "@/services/auth.services";
import Cookies from "js-cookie";

import {
  AdminPanelSettings,
  Architecture,
  ArrowForward,
  AutoAwesome,
  Celebration,
  Diamond,
  EmojiEvents,
  Grade,
  Handshake,
  Key,
  Login as LoginIcon,
  MenuBook,
  Paid,
  School,
  Security,
  Star,
  TouchApp,
  TrendingUp,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Fade,
  Grid,
  Grow,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
  Zoom,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FieldValues, useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import bg from "../assets/img/bg.webp";
import logo from "../assets/img/logo/logo.png";
import { roleConfig } from "@/config/roleConfig";

type UserRole =
  | "superadmin"
  | "admin"
  | "teacher"
  | "accountant"
  | "student"
  | null;

const loginSchema = z.object({
  credential: z
    .string({
      required_error: "Please enter your email, phone or student ID",
    })
    .min(1, "Credential is required"),
  password: z
    .string({
      required_error: "Please enter your password",
    })
    .min(1, "Password is required"),
});

// ----- Domain credentials map -----
const DOMAIN_CREDENTIALS: Record<
  string,
  { credential: string; password: string }
> = {
  "craft.janataautosolution.com": {
    credential: "admin@gmail.com",
    password: "Admin!@#super33",
  },
  localhost: {
    credential: "admin@gmail.com",
    password: "Admin!@#super33",
  },
};

// ----- Helper: flexible domain matching -----
const getDomainCredentials = (hostname: string) => {
  // 1. Exact match
  if (DOMAIN_CREDENTIALS[hostname]) {
    return DOMAIN_CREDENTIALS[hostname];
  }
  // 2. Check if hostname ends with any of the keys (for subdomains like www.craft...)
  for (const [domain, creds] of Object.entries(DOMAIN_CREDENTIALS)) {
    if (hostname.endsWith(domain) || hostname.includes(domain)) {
      return creds;
    }
  }
  return null;
};

const LoginDashboard = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [hoveredRole, setHoveredRole] = useState<UserRole>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      delay: number;
      color: string;
    }>
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // ----- Domain detection (with fallback) -----
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const domainDefaults = getDomainCredentials(hostname);
  const defaultFormValues = domainDefaults
    ? {
        credential: domainDefaults.credential,
        password: domainDefaults.password,
      }
    : {};

  // ----- Debug: log the detected hostname (remove in production) -----
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("🔍 [Login] Detected hostname:", window.location.hostname);
      console.log("🔍 [Login] Matched credentials:", domainDefaults);
    }
  }, [domainDefaults]);

  const particleColors = [
    "#FF3366",
    "#7C3AED",
    "#06B6D4",
    "#F59E0B",
    "#10B981",
  ];

  useEffect(() => {
    setAnimateCards(true);
    const newParticles = Array.from({ length: isMobile ? 30 : 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (isMobile ? 3 : 5) + 2,
      delay: Math.random() * 15,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
    }));
    setParticles(newParticles);
  }, [isMobile]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setShowLoginForm(true);

    setTimeout(() => {
      const element = document.getElementById("login-form-section");
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: isMobile ? "start" : "center",
        });
      }
    }, 100);
  };

  const handleBackToRoles = () => {
    setShowLoginForm(false);
    setSelectedRole(null);
    setTimeout(() => {
      const element = document.getElementById("role-section");
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const handleSubmit = async (data: FieldValues) => {
    if (!selectedRole) {
      toast.error("Please select a role first!");
      return;
    }

    const loginData = {
      ...data,
      role: selectedRole,
    };

    try {
      const res = await login(loginData).unwrap();

      if (res?.success) {
        toast.success(
          res.message ||
            `Welcome to Craft International Institute! Login Successful!`,
        );

        storeUserInfo({ accessToken: res.data.accessToken });
        Cookies.set("accessToken", res.data.accessToken, { path: "/" });
        if (res.data.refreshToken)
          Cookies.set("refreshToken", res.data.refreshToken, { path: "/" });

        router.push("/dashboard");
      } else {
        toast.error("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err?.data?.message || err?.message || "An error occurred during login.";
      toast.error(errorMessage);
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        overflowY: "auto",
        background: `radial-gradient(ellipse at 20% 30%, #0a0a2a, #000000)`,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Animated Background */}
      <Box>
        <Image
          src={bg}
          alt="Craft International Institute Background"
          fill
          style={{
            objectFit: "cover",
            objectPosition: "center",
            opacity: 0.06,
          }}
          quality={100}
          priority
        />
      </Box>

      {/* Animated Grid Pattern */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(79,1,135,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,1,135,0.05) 1px, transparent 1px)
          `,
          backgroundSize: isMobile ? "30px 30px" : "50px 50px",
          animation: "gridMove 20s linear infinite",
        }}
      />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: "fixed",
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, ${particle.color}, transparent)`,
            borderRadius: "50%",
            animation: `floatParticle ${15 + particle.delay}s linear infinite`,
            animationDelay: `${particle.delay}s`,
            zIndex: 0,
            opacity: 0.4,
            display: isMobile && particle.size < 3 ? "none" : "block",
          }}
        />
      ))}

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes floatParticle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(79,1,135,0.3); }
          50% { box-shadow: 0 0 50px rgba(79,1,135,0.6); }
        }
        @media (max-width: 600px) {
          @keyframes cardFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
        }
      `}</style>

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 2,
          py: { xs: 2, sm: 3, md: 4, lg: 6 },
          px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
        }}
      >
        {!showLoginForm ? (
          <>
            {/* Hero Section */}
            <Box
              sx={{
                textAlign: "center",
                mb: { xs: 3, sm: 4, md: 5, lg: 6 },
                perspective: "1000px",
              }}
            >
              <Zoom in timeout={800}>
                <Box
                  sx={{
                    display: "inline-block",
                    transform: isDesktop ? "rotateX(5deg)" : "none",
                    "&:hover": {
                      transform: isDesktop
                        ? "rotateX(0deg) scale(1.02)"
                        : "none",
                      transition: "transform 0.3s",
                    },
                  }}
                >
                  <Image
                    src={logo}
                    alt="Craft International Institute"
                    height={isMobile ? 60 : isTablet ? 80 : 100}
                    width={isMobile ? 180 : isTablet ? 240 : 280}
                    style={{
                      objectFit: "contain",
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                </Box>
              </Zoom>

              <Fade in timeout={1000}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: {
                      xs: "1.5rem",
                      sm: "2rem",
                      md: "3rem",
                      lg: "4rem",
                    },
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg, #FFFFFF, #E0D4FF, #4F0187, #9A5AE3, #FFFFFF)",
                    backgroundSize: "300% 300%",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    mt: { xs: 1, sm: 2 },
                    mb: { xs: 0.5, sm: 1 },
                    animation: "gradientShift 6s ease infinite",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    px: { xs: 1, sm: 0 },
                  }}
                >
                  Craft International Institute
                </Typography>
              </Fade>

            </Box>

            {/* Role Selection Cards */}
            <Box id="role-section">
            

              <Grid
                container
                spacing={{ xs: 1.5, sm: 2, md: 3 }}
                justifyContent="center"
              >
                {(
                  Object.keys(roleConfig) as Array<keyof typeof roleConfig>
                ).map((role, index) => (
                  <Grid
                    item
                    xs={6}
                    sm={6}
                    md={4}
                    lg={2.4}
                    key={role}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Grow in={animateCards} timeout={500 + index * 150}>
                      <Card
                        onClick={() => handleRoleSelect(role)}
                        onMouseEnter={() => setHoveredRole(role)}
                        onMouseLeave={() => setHoveredRole(null)}
                        sx={{
                          cursor: "pointer",
                          width: "100%",
                          maxWidth: { xs: "100%", sm: 280, md: 260, lg: 240 },
                          transition:
                            "all 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
                          transform:
                            !isMobile && hoveredRole === role
                              ? "translateY(-25px) scale(1.03) rotateY(5deg)"
                              : "translateY(0) scale(1)",
                          background: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)`,
                          backdropFilter: "blur(20px)",
                          borderRadius: { xs: 3, sm: 4, md: 5, lg: 6 },
                          border: `2px solid ${alpha(roleConfig[role].color, hoveredRole === role ? 0.8 : 0.4)}`,
                          boxShadow:
                            !isMobile && hoveredRole === role
                              ? `0 30px 50px -20px ${roleConfig[role].glowColor}, inset 0 1px 0 ${alpha(roleConfig[role].color, 0.3)}`
                              : "0 15px 35px -15px rgba(0,0,0,0.3)",
                          position: "relative",
                          overflow: "hidden",
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            inset: 0,
                            background: roleConfig[role].bgImage,
                            opacity: hoveredRole === role ? 0.5 : 0,
                            transition: "opacity 0.5s",
                          },
                        }}
                      >
                        {/* Animated shine effect */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: "-100%",
                            width: "100%",
                            height: "100%",
                            background: `linear-gradient(90deg, transparent, ${alpha(roleConfig[role].color, 0.2)}, transparent)`,
                            transition: "left 0.6s",
                            "&:hover": { left: "100%" },
                          }}
                        />

                        <CardContent
                          sx={{
                            textAlign: "center",
                            py: { xs: 2, sm: 2.5, md: 3, lg: 4 },
                            px: { xs: 1.5, sm: 2, md: 2.5 },
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          {/* Rank Badge */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: { xs: 6, sm: 8, md: 12 },
                              right: { xs: 6, sm: 8, md: 12 },
                              background: roleConfig[role].gradient,
                              borderRadius: "25px",
                              px: { xs: 0.8, sm: 1, md: 1.2 },
                              py: { xs: 0.3, sm: 0.4, md: 0.5 },
                              fontSize: {
                                xs: "0.55rem",
                                sm: "0.6rem",
                                md: "0.7rem",
                              },
                              fontWeight: "bold",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Star
                              sx={{ fontSize: { xs: 8, sm: 10, md: 12 } }}
                            />
                            <span>{roleConfig[role].rank}</span>
                          </Box>

                          {/* Icon */}
                          <Box
                            sx={{
                              mb: { xs: 1.5, sm: 2, md: 2.5 },
                              transform:
                                !isMobile && hoveredRole === role
                                  ? "scale(1.15) rotate(8deg)"
                                  : "scale(1)",
                              transition:
                                "transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)",
                              color: roleConfig[role].color,
                              display: "inline-block",
                              filter: `drop-shadow(0 0 10px ${alpha(roleConfig[role].color, 0.3)})`,
                            }}
                          >
                            {roleConfig[role].icon}
                          </Box>

                          {/* Label */}
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 800,
                              fontSize: {
                                xs: "0.95rem",
                                sm: "1.1rem",
                                md: "1.3rem",
                                lg: "1.5rem",
                              },
                              background: roleConfig[role].gradient,
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              color: "transparent",
                              mb: 0.5,
                            }}
                          >
                            {roleConfig[role].label}
                          </Typography>

                          {/* Description */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: "rgba(255,255,255,0.7)",
                              fontWeight: 500,
                              mb: { xs: 1, sm: 1.5, md: 2 },
                              fontSize: {
                                xs: "0.65rem",
                                sm: "0.7rem",
                                md: "0.8rem",
                              },
                              display: { xs: "none", sm: "block" },
                            }}
                          >
                            {roleConfig[role].description}
                          </Typography>

                          {/* Access Button */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.5,
                              color: roleConfig[role].color,
                              opacity: hoveredRole === role ? 1 : 0.7,
                              transition: "opacity 0.3s",
                            }}
                          >
                            {isMobile ? (
                              <TouchApp sx={{ fontSize: { xs: 12, sm: 14 } }} />
                            ) : (
                              <Key sx={{ fontSize: { xs: 12, sm: 14 } }} />
                            )}
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: "0.6rem", sm: "0.65rem" },
                              }}
                            >
                              {isMobile ? "Tap to Access" : "Click to Access"}
                            </Typography>
                            <ArrowForward
                              sx={{ fontSize: { xs: 12, sm: 14 } }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Stats Section */}
            
          </>
        ) : (
          /* Login Form Section */
          <Fade in={showLoginForm} timeout={600}>
            <Box id="login-form-section">
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <Button
                  onClick={handleBackToRoles}
                  sx={{
                    color: "white",
                    borderColor: "rgba(79,1,135,0.3)",
                    borderRadius: "30px",
                    px: { xs: 2, sm: 3 },
                    py: { xs: 0.5, sm: 0.75 },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    "&:hover": {
                      borderColor: selectedRole
                        ? roleConfig[selectedRole].color
                        : "#4F0187",
                      bgcolor: selectedRole
                        ? alpha(roleConfig[selectedRole].color, 0.1)
                        : alpha("#4F0187", 0.1),
                      transform: "translateX(-5px)",
                      transition: "all 0.3s",
                    },
                  }}
                  variant="outlined"
                  startIcon={
                    <ArrowForward
                      sx={{
                        transform: "rotate(180deg)",
                        fontSize: { xs: 16, sm: 20 },
                      }}
                    />
                  }
                >
                  Back to Portals
                </Button>
              </Box>

              <Box
                sx={{
                  maxWidth: { xs: "100%", sm: 500, md: 550 },
                  mx: "auto",
                  px: { xs: 0, sm: 1 },
                }}
              >
                <Card
                  sx={{
                    borderRadius: { xs: 3, sm: 4, md: 5, lg: 6 },
                    background: `linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)`,
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: selectedRole
                      ? `0 30px 60px ${alpha(roleConfig[selectedRole].color, 0.3)}, 0 0 0 2px ${alpha(roleConfig[selectedRole].color, 0.3)}`
                      : "0 30px 60px rgba(0,0,0,0.3)",
                    transition: "box-shadow 0.3s",
                  }}
                >
                  {/* Animated Gradient Border */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: { xs: "4px", sm: "6px", md: "8px" },
                      background: selectedRole
                        ? roleConfig[selectedRole].gradient
                        : "linear-gradient(90deg, #FF3366, #7C3AED, #06B6D4, #F59E0B, #10B981)",
                      backgroundSize: "300% 100%",
                      animation: "gradientShift 3s ease infinite",
                    }}
                  />

                  <Box sx={{ p: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
                    {/* Selected Role Badge */}
                    <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: { xs: 1, sm: 1.5 },
                          px: { xs: 2, sm: 2.5, md: 3 },
                          py: { xs: 0.75, sm: 0.875, md: 1 },
                          borderRadius: "50px",
                          background: selectedRole
                            ? alpha(roleConfig[selectedRole].color, 0.1)
                            : "rgba(0,0,0,0.05)",
                          mb: { xs: 1.5, sm: 2, md: 2.5 },
                          transition: "all 0.3s",
                          border: selectedRole
                            ? `1px solid ${alpha(roleConfig[selectedRole].color, 0.3)}`
                            : "none",
                        }}
                      >
                        {selectedRole && (
                          <Box
                            sx={{
                              color: roleConfig[selectedRole].color,
                              display: "flex",
                            }}
                          >
                            {roleConfig[selectedRole].icon}
                          </Box>
                        )}
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: {
                              xs: "0.85rem",
                              sm: "1rem",
                              md: "1.1rem",
                            },
                            color: selectedRole
                              ? roleConfig[selectedRole].color
                              : "text.primary",
                          }}
                        >
                          {selectedRole
                            ? `${roleConfig[selectedRole].label} Portal`
                            : "Select a Portal"}
                        </Typography>
                      </Box>

                      <Image
                        src={logo}
                        alt="Craft International Institute"
                        height={isMobile ? 45 : isTablet ? 55 : 65}
                        width={isMobile ? 140 : isTablet ? 170 : 200}
                        style={{ objectFit: "contain", margin: "0 auto" }}
                      />
                    </Box>

                    <CraftForm
                      onSubmit={handleSubmit}
                      resolver={zodResolver(loginSchema)}
                      defaultValues={defaultFormValues}
                    >
                      <FormValuesSetter
                        defaultValues={defaultFormValues}
                        enabled={!!domainDefaults}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: { xs: 1.5, sm: 2, md: 2.5 },
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              mb: 0.5,
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            {selectedRole && roleConfig[selectedRole]?.icon}
                            <span
                              style={{
                                color: selectedRole
                                  ? roleConfig[selectedRole].color
                                  : "#4F0187",
                              }}
                            >
                              Credential (Email / ID / Phone)
                            </span>
                          </Typography>
                          <CraftInput
                            type="text"
                            name="credential"
                            placeholder=""
                            fullWidth
                            size="medium"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                transition: "all 0.3s",
                                "&:hover fieldset": {
                                  borderColor: selectedRole
                                    ? roleConfig[selectedRole].color
                                    : "#4F0187",
                                  borderWidth: 2,
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: selectedRole
                                    ? roleConfig[selectedRole].color
                                    : "#4F0187",
                                  borderWidth: 2,
                                  boxShadow: `0 0 0 3px ${alpha(selectedRole ? roleConfig[selectedRole].color : "#4F0187", 0.1)}`,
                                },
                              },
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              mb: 0.5,
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            <Security
                              sx={{
                                fontSize: { xs: 14, sm: 16 },
                                color: selectedRole
                                  ? roleConfig[selectedRole].color
                                  : "#4F0187",
                              }}
                            />
                            <span
                              style={{
                                color: selectedRole
                                  ? roleConfig[selectedRole].color
                                  : "#4F0187",
                              }}
                            >
                              Password
                            </span>
                          </Typography>
                          <CraftInput
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            size="medium"
                            name="password"
                            placeholder=""
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    edge="end"
                                    sx={{
                                      color: selectedRole
                                        ? roleConfig[selectedRole].color
                                        : "#4F0187",
                                    }}
                                  >
                                    {showPassword ? (
                                      <VisibilityOff
                                        sx={{ fontSize: { xs: 18, sm: 20 } }}
                                      />
                                    ) : (
                                      <Visibility
                                        sx={{ fontSize: { xs: 18, sm: 20 } }}
                                      />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                transition: "all 0.3s",
                                "&:hover fieldset": {
                                  borderColor: selectedRole
                                    ? roleConfig[selectedRole].color
                                    : "#4F0187",
                                  borderWidth: 2,
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: selectedRole
                                    ? roleConfig[selectedRole].color
                                    : "#4F0187",
                                  borderWidth: 2,
                                  boxShadow: `0 0 0 3px ${alpha(selectedRole ? roleConfig[selectedRole].color : "#4F0187", 0.1)}`,
                                },
                              },
                            }}
                          />
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Link
                            href="/forgot-password"
                            style={{
                              fontSize: "0.7rem",
                              color: selectedRole
                                ? roleConfig[selectedRole].color
                                : "#4F0187",
                              textDecoration: "none",
                              fontWeight: 600,
                              transition: "all 0.3s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.textDecoration =
                                "underline";
                              e.currentTarget.style.opacity = "0.8";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.textDecoration = "none";
                              e.currentTarget.style.opacity = "1";
                            }}
                          >
                            Forgot Password?
                          </Link>
                          <Link
                            href="/help"
                            style={{
                              fontSize: "0.7rem",
                              color: "#666",
                              textDecoration: "none",
                              transition: "all 0.3s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = selectedRole
                                ? roleConfig[selectedRole].color
                                : "#4F0187";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#666";
                            }}
                          >
                            Need Help?
                          </Link>
                        </Box>

                        <Button
                          type="submit"
                          disabled={isLoading || !selectedRole}
                          fullWidth
                          sx={{
                            py: { xs: 1.2, sm: 1.4, md: 1.6 },
                            borderRadius: 3,
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                            fontWeight: 700,
                            textTransform: "none",
                            background: selectedRole
                              ? roleConfig[selectedRole].gradient
                              : "#cccccc",
                            backgroundSize: "200% 100%",
                            color: "white",
                            transition: "all 0.3s",
                            position: "relative",
                            overflow: "hidden",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              width: "0",
                              height: "0",
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.3)",
                              transform: "translate(-50%, -50%)",
                              transition: "width 0.6s, height 0.6s",
                            },
                            "&:hover::before": {
                              width: "300px",
                              height: "300px",
                            },
                            "&:hover": {
                              transform: "translateY(-3px)",
                              boxShadow: selectedRole
                                ? `0 8px 25px ${alpha(roleConfig[selectedRole].color, 0.4)}`
                                : "0 8px 25px rgba(0,0,0,0.2)",
                              backgroundSize: "100% 100%",
                            },
                            "&:disabled": {
                              background: "#cccccc",
                            },
                          }}
                        >
                          {isLoading ? (
                            "Authenticating..."
                          ) : (
                            <>
                              <LoginIcon
                                sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }}
                              />
                              Login{" "}
                              {selectedRole
                                ? roleConfig[selectedRole].label
                                : "Your"}{" "}
                              Portal
                              
                            </>
                          )}
                        </Button>

                        
                      </Box>
                    </CraftForm>
                  </Box>
                </Card>
              </Box>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default LoginDashboard;

// ----- Helper component to manually set form values (fallback) -----
const FormValuesSetter = ({
  defaultValues,
  enabled,
}: {
  defaultValues: { credential?: string; password?: string };
  enabled: boolean;
}) => {
  const { setValue } = useFormContext();

  useEffect(() => {
    if (enabled && defaultValues) {
      if (defaultValues.credential) {
        setValue("credential", defaultValues.credential);
      }
      if (defaultValues.password) {
        setValue("password", defaultValues.password);
      }
    }
  }, [enabled, defaultValues, setValue]);

  return null;
};

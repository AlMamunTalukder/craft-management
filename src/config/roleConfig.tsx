import {
  AdminPanelSettings,
  Diamond,
  Grade,
  MenuBook,
  Paid
} from "@mui/icons-material";

export const roleConfig = {
  superadmin: {
    label: "Super Admin",
    shortLabel: "Super",
    icon: <Diamond sx={{ fontSize: { xs: 36, sm: 44, md: 52, lg: 60 } }} />,
    color: "#FF3366",
    gradient: "linear-gradient(135deg, #FF3366 0%, #FF6B9D 100%)",
    darkGradient: "linear-gradient(135deg, #E91E63 0%, #FF3366 100%)",
    description: "Ultimate System Control",
    badgeColor: "#FF3366",
    glowColor: "rgba(255, 51, 102, 0.5)",
    rank: "💎 Supreme",
    bgImage:
      "radial-gradient(circle at 30% 20%, rgba(255,51,102,0.15), transparent)",
  },
  admin: {
    label: "Admin",
    shortLabel: "Admin",
    icon: (
      <AdminPanelSettings
        sx={{ fontSize: { xs: 36, sm: 44, md: 52, lg: 60 } }}
      />
    ),
    color: "#7C3AED",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
    darkGradient: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
    description: "Full Management Access",
    badgeColor: "#7C3AED",
    glowColor: "rgba(124, 58, 237, 0.5)",
    rank: "👑 Leader",
    bgImage:
      "radial-gradient(circle at 70% 30%, rgba(124,58,237,0.12), transparent)",
  },
  teacher: {
    label: "Teacher",
    shortLabel: "Teacher",
    icon: <MenuBook sx={{ fontSize: { xs: 36, sm: 44, md: 52, lg: 60 } }} />,
    color: "#06B6D4",
    gradient: "linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)",
    darkGradient: "linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)",
    description: "Education Excellence",
    badgeColor: "#06B6D4",
    glowColor: "rgba(6, 182, 212, 0.5)",
    rank: "📖 Mentor",
    bgImage:
      "radial-gradient(circle at 40% 60%, rgba(6,182,212,0.12), transparent)",
  },
  accountant: {
    label: "Accountant",
    shortLabel: "Account",
    icon: <Paid sx={{ fontSize: { xs: 36, sm: 44, md: 52, lg: 60 } }} />,
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
    darkGradient: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
    description: "Financial Management",
    badgeColor: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.5)",
    rank: "💰 Finance",
    bgImage:
      "radial-gradient(circle at 60% 40%, rgba(245,158,11,0.12), transparent)",
  },
  student: {
    label: "Student",
    shortLabel: "Student",
    icon: <Grade sx={{ fontSize: { xs: 36, sm: 44, md: 52, lg: 60 } }} />,
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
    darkGradient: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
    description: "Learning Journey",
    badgeColor: "#10B981",
    glowColor: "rgba(16, 185, 129, 0.5)",
    rank: "🎓 Learner",
    bgImage:
      "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.1), transparent)",
  },
};
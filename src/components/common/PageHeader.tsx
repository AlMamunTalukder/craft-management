/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography, Button, SxProps } from "@mui/material";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  gradient?: string;
  sx?: SxProps;
}

const PageHeader = ({
  title,
  subtitle,
  action,
  gradient = "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
  sx,
}: PageHeaderProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "center" },
        gap: 1.5,
        mb: 2,
        ...sx,
      }}
    >
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: gradient,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: { xs: "1.15rem", sm: "1.4rem" },
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Box sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
          {action}
        </Box>
      )}
    </Box>
  );
};

interface PageActionProps {
  onClick: () => void;
  label: string;
  icon?: ReactNode;
  gradient?: string;
}

const PageAction = ({
  onClick,
  label,
  icon,
  gradient = "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
}: PageActionProps) => {
  return (
    <Button
      onClick={onClick}
      variant="contained"
      startIcon={icon}
      size="small"
      sx={{
        borderRadius: "10px",
        px: 2.5,
        py: 0.8,
        textTransform: "none",
        fontWeight: 600,
        background: gradient,
        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
        "&:hover": { boxShadow: "0 6px 16px rgba(99, 102, 241, 0.35)" },
      }}
    >
      {label}
    </Button>
  );
};

export { PageHeader, PageAction };

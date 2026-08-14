import { Chip } from "@mui/material";

interface StatusChipProps {
  status: string;
  size?: "small" | "medium";
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  approved: { bg: "#e8f5e8", color: "#2e7d32" },
  paid: { bg: "#e8f5e8", color: "#2e7d32" },
  completed: { bg: "#e8f5e8", color: "#2e7d32" },
  published: { bg: "#e8f5e8", color: "#2e7d32" },
  new: { bg: "#e8f5e8", color: "#2e7d32" },
  good: { bg: "#e8f5e8", color: "#2e7d32" },
  pending: { bg: "#fff3e0", color: "#f57c00" },
  draft: { bg: "#e3f2fd", color: "#1976d2" },
  fair: { bg: "#fff3e0", color: "#f57c00" },
  rejected: { bg: "#ffebee", color: "#d32f2f" },
  damaged: { bg: "#ffebee", color: "#d32f2f" },
  disposed: { bg: "#eceff1", color: "#546e7a" },
  poor: { bg: "#ffebee", color: "#d32f2f" },
  fail: { bg: "#ffebee", color: "#d32f2f" },
  inactive: { bg: "#eceff1", color: "#546e7a" },
};

const StatusChip = ({ status, size = "small" }: StatusChipProps) => {
  const key = (status || "").toLowerCase();
  const colors = STATUS_COLORS[key] || { bg: "#eceff1", color: "#546e7a" };

  return (
    <Chip
      size={size}
      label={status}
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        borderRadius: "20px",
        textTransform: "capitalize",
        fontSize: size === "small" ? "0.72rem" : "0.8rem",
      }}
    />
  );
};

export default StatusChip;

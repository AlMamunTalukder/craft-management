/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Typography, Box, alpha } from "@mui/material";
import { AccountBalanceWallet, Paid, Discount, WarningAmber, TrendingUp } from "@mui/icons-material";

interface FeeSummaryCardsProps {
    type: 'due' | 'paid';
    summary: {
        totalFees?: number;
        totalPaid?: number;
        totalDue?: number;
        totalDiscount?: number;
        totalWaiver?: number;
        totalAdjustments?: number;
    };
    lateFeeSummary: {
        totalLateFees: number;
        totalCustomized: number;
        totalOverdue?: number;
    };
}

const cards = (isDue: boolean, summary: any, lateFeeSummary: any) => [
  {
    label: isDue ? "Total Due Fees" : "Total Paid Fees",
    value: `৳${(summary.totalFees || 0).toLocaleString()}`,
    sub: isDue ? `${summary.totalDue ? `${summary.totalDue.toLocaleString()} due` : "All pending"} • ${summary.totalAdjustments ? `৳${summary.totalAdjustments.toLocaleString()} adj` : "No adjustments"}` : `Net paid`,
    icon: <AccountBalanceWallet />,
    gradient: isDue ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
  {
    label: isDue ? "Amount Due" : "Amount Paid",
    value: `৳${(isDue ? summary.totalDue : summary.totalPaid || 0).toLocaleString()}`,
    sub: isDue ? "Pay now to clear" : "Thank you!",
    icon: isDue ? <WarningAmber /> : <Paid />,
    gradient: isDue ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    label: "Adjustments",
    value: `৳${(summary.totalAdjustments || 0).toLocaleString()}`,
    sub: `Discount ৳${(summary.totalDiscount||0).toLocaleString()} • Waiver ৳${(summary.totalWaiver||0).toLocaleString()}`,
    icon: <Discount />,
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    label: isDue ? "Late Fees" : "Late Fee Paid",
    value: `৳${(lateFeeSummary.totalLateFees || 0).toLocaleString()}`,
    sub: `Customized ${lateFeeSummary.totalCustomized}${isDue && lateFeeSummary.totalOverdue!==undefined ? ` • Overdue ${lateFeeSummary.totalOverdue}` : ""}`,
    icon: <TrendingUp />,
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  },
];

const FeeSummaryCards = ({ type, summary, lateFeeSummary }: FeeSummaryCardsProps) => {
    const isDue = type === 'due';
    const list = cards(isDue, summary, lateFeeSummary);
    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4,1fr)" }, gap: 2, mb: 3 }}>
            {list.map((c, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  p: 2.2,
                  borderRadius: 3,
                  background: c.gradient,
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  minHeight: 110,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    right: -20,
                    bottom: -20,
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    bgcolor: alpha("#fff", 0.12),
                  }
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, opacity: 0.95 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha("#fff",0.22), display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {c.icon}
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", opacity: 0.95 }}>{c.label}</Typography>
                </Box>
                <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>{c.value}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.92, fontSize: "0.7rem", lineHeight: 1.2 }}>{c.sub}</Typography>
              </Paper>
            ))}
        </Box>
    );
};

export default FeeSummaryCards;

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// FullScreenLoader - for initial app / auth / layout (covers whole site)
export const FullScreenLoader: React.FC<{ text?: string }> = ({ text = "Loading Craft International..." }) => (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 2,
      bgcolor: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(6px)",
    }}
  >
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: 2,
        bgcolor: "#4F0187",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: 14,
        letterSpacing: 1,
        boxShadow: "0 8px 24px rgba(79,1,135,0.25)",
      }}
    >
      CII
    </Box>
    <CircularProgress size={28} sx={{ color: "#4F0187" }} />
    <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600 }}>
      {text}
    </Typography>
  </Box>
);

export default FullScreenLoader;

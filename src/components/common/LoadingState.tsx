import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// PageLoader - for page content only (keeps header/sidebar visible)
export const LoadingState: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400, py: 10, gap: 1.5 }}>
    <CircularProgress size={32} sx={{ color: "#4F0187" }} />
    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>Loading...</Typography>
  </Box>
);

// Also export as PageLoader alias
export const PageLoader = LoadingState;
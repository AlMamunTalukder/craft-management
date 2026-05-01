// src/app/dashboard/daily-meal-report/update/page.tsx
'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography, Paper, Button } from '@mui/material';
import MealForm from '../add/__components/MealForm';

const UpdateContent = () => {
  const searchParams = useSearchParams();
  const attendanceId = searchParams.get('id');

  if (!attendanceId) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', m: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          No attendance ID provided
        </Typography>
        <Button variant="contained" href="/dashboard/daily-meal-report">
          Back to List
        </Button>
      </Paper>
    );
  }

  return <MealForm isUpdate={true} attendanceId={attendanceId} />;
};

const UpdateMealAttendancePage = () => {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    }>
      <UpdateContent />
    </Suspense>
  );
};

export default UpdateMealAttendancePage;
'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography, Paper, Button } from '@mui/material';
import MealForm from '../add/__components/MealForm';

const UpdateContent = () => {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  if (mode !== 'monthly-update') {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', m: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Invalid Update Mode
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please use the edit button from the attendance list page to update monthly attendance.
        </Typography>
        <Button variant="contained" href="/dashboard/daily-meal-report">
          Back to List
        </Button>
      </Paper>
    );
  }

  const classId = searchParams.get('classId') || '';
  const className = searchParams.get('className') || '';
  const month = searchParams.get('month') || '';
  const academicYear = searchParams.get('academicYear') || '';

  if (!month) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', m: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Month parameter is missing
        </Typography>
        <Button variant="contained" href="/dashboard/daily-meal-report">
          Back to List
        </Button>
      </Paper>
    );
  }

  if (!classId && !className) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', m: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Class information is missing
        </Typography>
        <Button variant="contained" href="/dashboard/daily-meal-report">
          Back to List
        </Button>
      </Paper>
    );
  }

  return (
    <MealForm
      isMonthlyUpdate={true}
      monthlyUpdateClassId={classId}
      monthlyUpdateClassName={className}
      monthlyUpdateMonth={month}
      monthlyUpdateAcademicYear={academicYear}
    />
  );
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
'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import UpdateMealForm from '../add/__components/MealForm';

const UpdateContent = () => {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  if (mode !== 'monthly-update') {
    return <Paper sx={{ p: 4, textAlign: 'center', m: 3 }}><Typography variant="h6" color="error">Invalid Access</Typography></Paper>;
  }

  const personType = (searchParams.get('personType') as 'student' | 'teacher' | 'staff') || 'student';
  const className = searchParams.get('className') || '';
  const month = searchParams.get('month') || '';
  const academicYear = searchParams.get('academicYear') || '';

  if (!month) {
    return <Paper sx={{ p: 4, textAlign: 'center', m: 3 }}><Typography variant="h6" color="error">Missing Month Parameter</Typography></Paper>;
  }

  return (
    <UpdateMealForm
      initialPersonType={personType}
      monthlyUpdateClassName={className}
      monthlyUpdateMonth={month}
      monthlyUpdateAcademicYear={academicYear}
    />
  );
};

const UpdateMealAttendancePage = () => (
  <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>}>
    <UpdateContent />
  </Suspense>
);

export default UpdateMealAttendancePage;
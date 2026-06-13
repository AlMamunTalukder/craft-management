// src/components/mealAttendance/AttendanceDetailsModal.tsx
'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Avatar,
  Stack,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  Event as EventIcon,
  Class as ClassIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Restaurant as FoodIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import CraftModal from '@/components/Shared/Modal';


interface StudentInfo {
  _id: string;
  studentId: string;
  name: string;
  nameBangla: string;
  className: string[];
}

interface AttendanceRecord {
  _id: string;
  academicYear: string;
  student: StudentInfo;
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  totalMeals: number;
  mealCost: number;
  mealRate: number;
  month: string;
  createdAt: string;
  updatedAt: string;
  isAbsent: boolean;
  isHoliday: boolean;
}

interface AttendanceDetailsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedRecord: AttendanceRecord | null;
  onDelete?: (record: AttendanceRecord) => void;
  getClassName: (classIds: string[]) => string;
}

const AttendanceDetailsModal: React.FC<AttendanceDetailsModalProps> = ({
  open,
  setOpen,
  selectedRecord,
  onDelete,
  getClassName,
}) => {
  const theme = useTheme();

  // Render Meal status icon
  const renderMealStatus = (value: boolean) => {
    return value ? (
      <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 28 }} />
    ) : (
      <CancelIcon sx={{ color: '#f44336', fontSize: 28 }} />
    );
  };

  if (!selectedRecord) return null;

  return (
    <CraftModal
      open={open}
      setOpen={setOpen}
      title="Attendance Details"
      size="lg"
    >
      <Box>
        {/* Student Information Section */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="primary.main"
            gutterBottom
            display="flex"
            alignItems="center"
            gap={1}
          >
            <PersonIcon />
            Student Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 56,
                    height: 56,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Student Name
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedRecord.student?.name || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedRecord.student?.nameBangla || ''}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Student ID
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedRecord.student?.studentId || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Class
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {getClassName(selectedRecord.student?.className || [])}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Attendance Information Section */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.04),
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="info.main"
            gutterBottom
            display="flex"
            alignItems="center"
            gap={1}
          >
            <EventIcon />
            Attendance Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <EventIcon color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {dayjs(selectedRecord.date).format('DD MMMM YYYY, dddd')}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ClassIcon color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Academic Year
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedRecord.academicYear || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <ScheduleIcon color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Month
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {dayjs(selectedRecord.month).format('MMMM YYYY')}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Meal Details Section */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.success.main, 0.04),
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="success.main"
            gutterBottom
            display="flex"
            alignItems="center"
            gap={1}
          >
            <FoodIcon />
            Meal Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Breakfast
                </Typography>
                {renderMealStatus(selectedRecord.breakfast)}
                <Typography variant="body2" fontWeight="bold" mt={1}>
                  {selectedRecord.breakfast ? 'Taken' : 'Not Taken'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Lunch
                </Typography>
                {renderMealStatus(selectedRecord.lunch)}
                <Typography variant="body2" fontWeight="bold" mt={1}>
                  {selectedRecord.lunch ? 'Taken' : 'Not Taken'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Dinner
                </Typography>
                {renderMealStatus(selectedRecord.dinner)}
                <Typography variant="body2" fontWeight="bold" mt={1}>
                  {selectedRecord.dinner ? 'Taken' : 'Not Taken'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Summary Section */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.warning.main, 0.04),
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="warning.main"
            gutterBottom
            display="flex"
            alignItems="center"
            gap={1}
          >
            <FoodIcon />
            Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Meals
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  color="primary.main"
                  sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}
                >
                  {selectedRecord.totalMeals || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Cost
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  color="success.main"
                  sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}
                >
                  ৳{selectedRecord.mealCost || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Rate: ৳{selectedRecord.mealRate || 55}/meal)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Meta Information */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Record ID: {selectedRecord._id}
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            Created: {dayjs(selectedRecord.createdAt).format('DD MMM YYYY, hh:mm A')}
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            Last Updated: {dayjs(selectedRecord.updatedAt).format('DD MMM YYYY, hh:mm A')}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Close
          </Button>
          {onDelete && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                onDelete(selectedRecord);
                setOpen(false);
              }}
            >
              Delete Record
            </Button>
          )}
        </Box>
      </Box>
    </CraftModal>
  );
};

export default AttendanceDetailsModal;
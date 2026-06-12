/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import CraftModal from "@/components/Shared/Modal";
import { Avatar, Box, Chip, Divider, Grid, Typography, Paper } from "@mui/material";

export default function FeeDetailsModal({ open, setOpen, selectedFee }: any) {
  if (!selectedFee) return null;

  // Calculate discount and waiver totals
  const totalDiscount = selectedFee.discount || 0;
  const totalWaiver = selectedFee.waiver || 0;
  const advanceUsed = selectedFee.advanceUsed || 0;
  const paidAmount = selectedFee.paidAmount || 0;
  const dueAmount = selectedFee.dueAmount || 0;
  const totalAmount = selectedFee.amount || 0;

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get class name from className array if needed
  const getClassName = () => {
    if (selectedFee.class) return selectedFee.class;
    if (selectedFee.student?.className && selectedFee.student.className[0]) {
      return selectedFee.student.className[0].className;
    }
    return "N/A";
  };

  // Get student ID
  const getStudentId = () => {
    return selectedFee.student?.studentId || selectedFee.student?.id || "N/A";
  };

  return (
    <CraftModal open={open} setOpen={setOpen} title="Fee Details" size="lg">
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Student Information Header */}
          <Grid item xs={12}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                color: "primary.main",
                borderBottom: "2px solid",
                borderColor: "primary.main",
                pb: 1,
              }}
            >
              Student Information
            </Typography>
          </Grid>

          {/* Student Avatar and Name */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                sx={{ width: 60, height: 60, mr: 2, bgcolor: "primary.main" }}
              >
                {selectedFee.student?.name?.charAt(0) || "S"}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {selectedFee.student?.name || "N/A"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Student ID: {getStudentId()}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Status and ID */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { md: "right" } }}>
              <Chip
                label={selectedFee.status?.toUpperCase() || "UNKNOWN"}
                color={
                  selectedFee.status === "paid"
                    ? "success"
                    : selectedFee.status === "partial"
                      ? "warning"
                      : "error"
                }
                sx={{ fontWeight: "bold", mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Fee ID: {selectedFee._id}
              </Typography>
              {selectedFee.academicYear && (
                <Typography variant="body2" color="text.secondary">
                  Academic Year: {selectedFee.academicYear}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Academic Information */}
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              Class
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {getClassName()}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              Month
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {selectedFee.month || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              Current Month
            </Typography>
            <Chip
              label={selectedFee.isCurrentMonth ? "Yes" : "No"}
              color={selectedFee.isCurrentMonth ? "success" : "default"}
              size="small"
            />
          </Grid>

          {/* Fee Type */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                color: "primary.main",
                borderBottom: "2px solid",
                borderColor: "primary.main",
                pb: 1,
              }}
            >
              Fee Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Fee Type
            </Typography>
            <Chip
              label={selectedFee.feeType?.toUpperCase() || "N/A"}
              color="primary"
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Due Date
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {formatDate(selectedFee.dueDate)}
            </Typography>
          </Grid>

          {/* Amount Breakdown */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: "#f5f5f5", mt: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Amount Breakdown
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    ৳{totalAmount.toLocaleString()}
                  </Typography>
                </Grid>

                {totalDiscount > 0 && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Discount
                    </Typography>
                    <Typography variant="h6" color="error.main" fontWeight="bold">
                      -৳{totalDiscount.toLocaleString()}
                    </Typography>
                  </Grid>
                )}

                {totalWaiver > 0 && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Waiver
                    </Typography>
                    <Typography variant="h6" color="error.main" fontWeight="bold">
                      -৳{totalWaiver.toLocaleString()}
                    </Typography>
                  </Grid>
                )}

                {advanceUsed > 0 && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Advance Used
                    </Typography>
                    <Typography variant="h6" color="warning.main" fontWeight="bold">
                      ৳{advanceUsed.toLocaleString()}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Paid Amount
                  </Typography>
                  <Typography variant="h6" color={paidAmount > 0 ? "success.main" : "text.secondary"} fontWeight="bold">
                    ৳{paidAmount.toLocaleString()}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Due Amount
                  </Typography>
                  <Typography variant="h6" color={dueAmount > 0 ? "error.main" : "success.main"} fontWeight="bold">
                    ৳{dueAmount.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>


          {/* Note Section */}
          {selectedFee.note && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: "primary.main",
                  borderBottom: "2px solid",
                  borderColor: "primary.main",
                  pb: 1,
                }}
              >
                Additional Notes
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1">{selectedFee.note}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </CraftModal>
  );
}
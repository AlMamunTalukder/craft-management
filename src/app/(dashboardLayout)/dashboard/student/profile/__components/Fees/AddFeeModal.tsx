/* eslint-disable @typescript-eslint/no-explicit-any */
import CraftForm from "@/components/Forms/Form";
import CraftModal from "@/components/Shared/Modal";
import { useAcademicOption } from "@/hooks/useAcademicOption";
import { AddFeeModalProps } from "@/interface/fees";
import { useCreateFeeMutation } from "@/redux/api/feesApi";
import { FeeItem } from "@/types/feeCollection";
import { CalendarMonth } from "@mui/icons-material";
import {
  Alert,
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FieldValues } from "react-hook-form";
import toast from "react-hot-toast";
import { CustomCraftInput, CustomCraftIntAutoCompleteWithIcon } from "./CustomInputs";
import DynamicFeeFields from "./DynamicFeeFields";
import {
  calculateFinalAmount,
  extractMonthData,
  getAcademicYear,
  getMonthOptions,
  validateFeeItems,
  CURRENT_MONTH,
  CURRENT_YEAR,

} from "./feeHelpers";
import { MONTHS } from "@/constant/month";

const AddFeeModal = ({ open, setOpen, student, refetch }: AddFeeModalProps) => {
  const [createFee, { isLoading }] = useCreateFeeMutation();
  const { classOptions } = useAcademicOption();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(CURRENT_MONTH);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const feeItemsRef = useRef<FeeItem[]>([]);

  const formattedClassOptions = useMemo(
    () => classOptions.map((option: any) => ({
      ...option,
      label: option.label || option.name || "Unnamed Class",
      value: option.value || option.id || "",
    })),
    [classOptions]
  );

  // Set selected class from student data
  useEffect(() => {
    if (!student) return;

    const getClassValue = () => {
      if (Array.isArray(student.className)) {
        const firstClass = student.className[0];
        if (firstClass?.className) return firstClass.className;
        if (typeof firstClass === "object") return firstClass.name || firstClass.label || firstClass.className || "";
        if (typeof firstClass === "string") {
          const match = formattedClassOptions.find((opt: any) => opt.value === firstClass);
          return match ? match.label : firstClass;
        }
      }
      if (typeof student.className === "string") {
        const match = formattedClassOptions.find((opt: any) => opt.value === student.className);
        return match ? match.label : student.className;
      }
      return student.class || "";
    };

    setSelectedClass(getClassValue());
  }, [student, formattedClassOptions]);

  const handleItemsChange = useCallback((items: FeeItem[]) => {
    feeItemsRef.current = items;
  }, []);

  const createSingleFee = async (item: FeeItem, monthStr: string, academicYear: string) => {
    const amount = item.amount || 0;
    const feeType = item.feeType.trim();
    const actualDiscount = Math.min(item.discount || 0, amount);
    const finalAmount = calculateFinalAmount(amount, actualDiscount);

    return await createFee({
      studentId: student?._id,
      student: student?._id,
      amount: finalAmount,
      feeType,
      academicYear,
      enrollment: student?.enrollment?._id || null,
      class: selectedClass,
      month: monthStr,
      discount: actualDiscount,
      waiver: 0,
      paidAmount: 0,
      isCurrentMonth: true,
    }).unwrap();
  };

  const createMonthlyFees = async (
    item: FeeItem,
    startMonthIndex: number,
    selectedMonthName: string,
    academicYear: string
  ) => {
    const amount = item.amount || 0;
    const feeType = item.feeType.trim();
    const actualDiscount = Math.min(item.discount || 0, amount);
    const finalAmount = calculateFinalAmount(amount, actualDiscount);
    const createdFees = [];

    for (let monthIndex = startMonthIndex; monthIndex < MONTHS.length; monthIndex++) {
      const monthLabel = `${MONTHS[monthIndex]}-${CURRENT_YEAR}`;
      const monthlyFeeType = `${feeType} - ${MONTHS[monthIndex]}`;

      const result = await createFee({
        studentId: student?._id,
        student: student?._id,
        amount: finalAmount,
        feeType: monthlyFeeType,
        academicYear,
        enrollment: student?.enrollment?._id || null,
        class: selectedClass,
        month: monthLabel,
        discount: actualDiscount,
        waiver: 0,
        paidAmount: 0,
        isCurrentMonth: MONTHS[monthIndex] === selectedMonthName,
      }).unwrap();

      createdFees.push(result);
    }

    return createdFees;
  };

  const handleSubmit = async (data: FieldValues) => {
    const items = feeItemsRef.current;

    if (!student?._id) {
      toast.error("Student information not found");
      return;
    }
    if (!selectedClass) {
      toast.error("Please select a class");
      return;
    }
    if (!validateFeeItems(items)) {
      toast.error("Please fill in valid fee types and amounts for all items");
      return;
    }

    const { monthStr: selectedMonthStr, monthName: selectedMonthName } = extractMonthData(data.month, selectedMonth);
    const currentMonthIndex = MONTHS.indexOf(selectedMonthName);
    const academicYear = String(data.academicYear || getAcademicYear());

    setIsSubmitting(true);
    const createdFees: any[] = [];

    try {
      for (const item of items) {
        const isMonthly = item.isMonthly || item.feeType.toLowerCase().includes("monthly");

        if (isMonthly) {
          const monthlyFees = await createMonthlyFees(item, currentMonthIndex, selectedMonthName, academicYear);
          createdFees.push(...monthlyFees);
        } else {
          const singleFee = await createSingleFee(item, selectedMonthStr, academicYear);
          createdFees.push(singleFee);
        }
      }

      if (!createdFees.length) {
        toast.error("No valid fee items to create. Please check amounts and fee types.");
        return;
      }

      toast.success(`${createdFees.length} fee(s) created successfully!`);
      if (refetch) refetch();
      setOpen(false);
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error?.data?.message || error?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultFormValues = {
    academicYear: getAcademicYear(),
    month: `${CURRENT_MONTH}-${CURRENT_YEAR}`,
  };

  return (
    <CraftModal open={open} setOpen={setOpen} title="Add New Fees" size="xl">
      <CraftForm onSubmit={handleSubmit} defaultValues={defaultFormValues}>
        <Grid container spacing={3}>
          {/* Student Information */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                Student: {student?.studentName || student?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Class: {selectedClass || "N/A"} | ID: {student?.studentId || "N/A"}
              </Typography>
            </Alert>
          </Grid>

          {/* Month Selection */}
          <Grid item xs={12} md={6}>
            <CustomCraftIntAutoCompleteWithIcon
              name="month"
              label="Month"
              placeholder="Select Month"
              options={getMonthOptions()}
              fullWidth
              required
              icon={<CalendarMonth color="primary" />}
              multiple={false}
              freeSolo={false}
              onChange={(_: any, value: any) => {
                if (value?.label) setSelectedMonth(value.label.split("-")[0]);
              }}
            />
          </Grid>

          {/* Academic Year */}
          <Grid item xs={12} md={6}>
            <CustomCraftInput
              name="academicYear"
              label="Academic Year"
              fullWidth
              size="small"
              value={getAcademicYear()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonth sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Dynamic Fee Fields */}
          <Grid item xs={12}>
            <DynamicFeeFields
              selectedClass={selectedClass}
              selectedMonth={selectedMonth}
              onItemsChange={handleItemsChange}
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading || isSubmitting || !selectedClass}
              startIcon={isLoading || isSubmitting ? <CircularProgress size={20} /> : undefined}
              sx={{
                width: '200px',
                margin: '0 auto',
                display: 'block',
                textTransform: "none",
                fontWeight: "bold"
              }}
            >
              {isLoading || isSubmitting ? "Adding Fees..." : "Add Fees"}
            </Button>
          </Grid>
        </Grid>
      </CraftForm>
    </CraftModal>
  );
};

export default AddFeeModal;
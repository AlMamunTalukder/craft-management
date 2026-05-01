/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Add as AddIcon,
  Class,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

import CraftAutoComplete from "@/components/Forms/AutoComplete";
import CraftIntAutoCompleteWithIcon from "@/components/Forms/AutocompleteWithIcon";
import CraftForm from "@/components/Forms/Form";
import CraftInput from "@/components/Forms/Input";
import CraftModal from "@/components/Shared/Modal";
import { useAcademicOption } from "@/hooks/useAcademicOption";
import {
  useCreateFeeCategoryMutation,
  useGetSingleFeeCategoryQuery,
  useUpdateFeeCategoryMutation,
} from "@/redux/api/feeCategoryApi";
import { buttonStyle, inputStyle } from "@/style/customStyle";
import toast from "react-hot-toast";
import { FieldValues } from "react-hook-form";
import { CATEGORY_OPTIONS, FEE_TYPE_OPTIONS } from "@/options/feeCategory";

// ─── Types ────────────────────────────────────────────────────────────────────
type FeeItem = {
  tempId?: number;
  feeType: { title: string }[];
  amount: string;
  _id?: string;
};

// ─── FeeItemsField ────────────────────────────────────────────────────────────
const FeeItemsField = ({
  feeItems,
  onAdd,
  onRemove,
}: {
  feeItems: FeeItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}) => {
  return (
    <Grid item xs={12}>
      <Paper
        sx={{
          p: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" component="div">
            Fee Items <span style={{ color: "red" }}>*</span>
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAdd}
            size="small"
          >
            Add Fee Item
          </Button>
        </Box>

        {feeItems.length === 0 ? (
          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", py: 3, fontStyle: "italic" }}
          >
            No fee items added.
          </Typography>
        ) : (
          feeItems.map((item: FeeItem, index: number) => (
            <Box
              key={item.tempId || item._id || index}
              sx={{
                mb: 2,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.default",
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <CraftAutoComplete
                    fullWidth
                    label="Fee Type"
                    name={`feeItems.${index}.feeType`}
                    margin="none"
                    options={FEE_TYPE_OPTIONS}
                    sx={inputStyle}
                    placeholder="Select fee type"
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <CraftInput
                    fullWidth
                    label="Amount"
                    name={`feeItems.${index}.amount`}
                    type="number"
                    margin="none"
                    sx={inputStyle}
                    placeholder="Enter amount"
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={2}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <IconButton
                    onClick={() => onRemove(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          ))
        )}
      </Paper>
    </Grid>
  );
};

// ─── FeeCategoryFormInner ─────────────────────────────────────────────────────
function FeeCategoryFormInner({
  id,
  setOpen,
  feeItems,
  setFeeItems,
  classOptions,
  isSubmitting,
  isLoading,
}: any) {
  const { setValue, getValues } = useFormContext();
  const totalLoading = isLoading || isSubmitting;

  const handleAddFeeItem = () => {
    const newItem: FeeItem = { tempId: Date.now(), feeType: [], amount: "" };
    const updated = [...feeItems, newItem];
    setFeeItems(updated);
    setValue("feeItems", updated, { shouldDirty: true });
  };

  const handleRemoveFeeItem = (index: number) => {
    const currentRHFItems = getValues("feeItems") || [];
    const updatedRHFItems = currentRHFItems.filter((_: any, i: number) => i !== index);
    const updatedStateItems = feeItems.filter((_: any, i: number) => i !== index);
    setFeeItems(updatedStateItems);
    setValue("feeItems", updatedRHFItems, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Class selector */}
        <Grid item xs={6} sm={6}>
          <CraftIntAutoCompleteWithIcon
            name="classes"
            label={
              <span>
                Class{!id && "es"} <span style={{ color: "red" }}>*</span>
                {!id && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    (Select multiple for multiple classes)
                  </Typography>
                )}
              </span>
            }
            placeholder={id ? "Select Class" : "Select Classes"}
            options={classOptions}
            freeSolo
            fullWidth
            icon={<Class color="primary" />}
            sx={inputStyle}
            multiple={!id}
          />
        </Grid>

        {/* Category selector */}
        <Grid item xs={12} sm={6}>
          <CraftAutoComplete
            fullWidth
            label="Category"
            name="category"
            options={CATEGORY_OPTIONS}
            sx={inputStyle}
            placeholder="Select category"
          />
        </Grid>

        {/* Fee Items */}
        <FeeItemsField
          feeItems={feeItems}
          onAdd={handleAddFeeItem}
          onRemove={handleRemoveFeeItem}
        />
      </Grid>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "flex-end",
          pt: 3,
          mt: 3,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          type="button"
          variant="outlined"
          onClick={() => setOpen(false)}
          disabled={totalLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          endIcon={
            totalLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={buttonStyle}
          disabled={totalLoading}
        >
          {totalLoading ? "Saving..." : id ? "Update" : "Save"}
        </Button>
      </Box>
    </Box>
  );
}

// ─── FeeCategoryModal ─────────────────────────────────────────────────────────
export default function FeeCategoryModal({ open, setOpen, id }: any) {
  const [createFeeCategory] = useCreateFeeCategoryMutation();
  const [updateFeeCategory] = useUpdateFeeCategoryMutation();

  const { data: singleFee, isLoading } = useGetSingleFeeCategoryQuery(id, {
    skip: !id,
  });

  const { classOptions } = useAcademicOption();

  const [feeItems, setFeeItems] = useState<FeeItem[]>([
    { tempId: Date.now(), feeType: [], amount: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Normalize feeType ────────────────────────────────────────────────────
  const normalizeFeeType = (feeTypeData: any): string => {
    if (!feeTypeData) return "";
    if (typeof feeTypeData === "string") return feeTypeData;
    if (Array.isArray(feeTypeData)) {
      if (feeTypeData[0]?.title) return feeTypeData[0].title;
      if (typeof feeTypeData[0] === "string") return feeTypeData[0];
      return "";
    }
    if (feeTypeData?.title) return feeTypeData.title;
    return "";
  };

  // ─── Default Values ───────────────────────────────────────────────────────
  const defaultValues = useMemo(() => {
    // ✅ UPDATE MODE: singleFee data is loaded
    if (id && singleFee?.data && classOptions?.length > 0) {
      // Find matching class option by label (className from backend)
      const matchedClass = classOptions.find(
        (option: any) => option.label === singleFee.data.className
      );

      // Build fee items from backend data
      const backendFeeItems: FeeItem[] = singleFee.data.feeItems?.map((item: any) => ({
        tempId: Date.now() + Math.random(),
        feeType: item.feeType ? [{ title: item.feeType }] : [],
        amount: item.amount?.toString() || "",
        _id: item._id,
      })) || [{ tempId: Date.now(), feeType: [], amount: "" }];

      return {
        // ✅ KEY FIX: multiple={false} → pass single object, NOT array
        // CraftIntAutoCompleteWithIcon with multiple=false expects: { label, value }
        classes: matchedClass ?? null,

        // Category: CraftAutoComplete expects array of { title }
        category: singleFee.data.categoryName
          ? [{ title: singleFee.data.categoryName }]
          : [],

        feeItems: backendFeeItems,
      };
    }

    // ✅ CREATE MODE
    return {
      // multiple={true} → pass array
      classes: [],
      category: [],
      feeItems: [{ tempId: Date.now(), feeType: [], amount: "" }],
    };
  }, [id, singleFee, classOptions]);

  // ─── Sync feeItems state when data loads ──────────────────────────────────
  useEffect(() => {
    if (id && singleFee?.data) {
      const backendFeeItems: FeeItem[] = singleFee.data.feeItems?.map((item: any) => ({
        tempId: Date.now() + Math.random(),
        feeType: item.feeType ? [{ title: item.feeType }] : [],
        amount: item.amount?.toString() || "",
        _id: item._id,
      })) || [{ tempId: Date.now(), feeType: [], amount: "" }];
      setFeeItems(backendFeeItems);
    } else if (!id && open) {
      setFeeItems([{ tempId: Date.now(), feeType: [], amount: "" }]);
    }
  }, [id, singleFee, open]);

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (data: FieldValues) => {
    // Validate class
    if (!data.classes || (Array.isArray(data.classes) && data.classes.length === 0)) {
      return toast.error("Please select at least one class");
    }
    // Validate category
    if (!data.category || data.category.length === 0) {
      return toast.error("Please select a category");
    }
    // Validate fee items exist
    if (!data.feeItems || data.feeItems.length === 0) {
      return toast.error("Please add at least one fee item");
    }

    // Build valid fee items
    const validFeeItems = data.feeItems
      .map((item: any, index: number) => {
        const feeTypeValue = normalizeFeeType(item.feeType);
        if (!feeTypeValue || feeTypeValue.trim() === "") return null;

        const amountValue = Number(item.amount);
        if (!item.amount || isNaN(amountValue) || amountValue <= 0) {
          toast.error(`Invalid amount for: ${feeTypeValue || `Item ${index + 1}`}`);
          return null;
        }

        return {
          feeType: feeTypeValue,
          amount: amountValue,
          ...(item._id && { _id: item._id }),
        };
      })
      .filter(Boolean);

    if (validFeeItems.length === 0) {
      return toast.error("Please add valid fee items");
    }

    // Check duplicates
    const feeTypeSet = new Set<string>();
    for (const item of validFeeItems) {
      if (feeTypeSet.has(item.feeType)) {
        return toast.error(`Duplicate fee type: ${item.feeType}`);
      }
      feeTypeSet.add(item.feeType);
    }

    const categoryName =
      data.category[0]?.title || normalizeFeeType(data.category);

    // ✅ Parse className correctly for both modes:
    // UPDATE: data.classes = { label: "Sunani", value: "..." } (single object)
    // CREATE: data.classes = [{ label: "Sunani", value: "..." }, ...] (array)
    const classesRaw = data.classes;
    const classNames: string[] = Array.isArray(classesRaw)
      ? classesRaw.map((cls: any) => cls.label || cls).filter(Boolean)
      : classesRaw?.label
        ? [classesRaw.label]
        : typeof classesRaw === "string"
          ? [classesRaw]
          : [];

    if (classNames.length === 0) {
      return toast.error("Please select a valid class");
    }

    setIsSubmitting(true);

    try {
      if (id) {
        // ── UPDATE ──────────────────────────────────────────────────────────
        const submitData = {
          categoryName,
          className: classNames[0],
          feeItems: validFeeItems,
        };

        console.log("✅ Update payload:", JSON.stringify(submitData, null, 2));

        const res = await updateFeeCategory({ id, data: submitData }).unwrap();

        if (res?.success) {
          toast.success(res.message || "Updated successfully!");
          setOpen(false);
        } else {
          toast.error(res?.message || "Update failed!");
        }
      } else {
        // ── CREATE ──────────────────────────────────────────────────────────
        const feeCategoriesData = classNames.map((className: string) => ({
          categoryName,
          className,
          feeItems: validFeeItems.map((item: any) => ({
            feeType: item.feeType,
            amount: item.amount,
          })),
        }));

        console.log("✅ Create payload:", JSON.stringify(feeCategoriesData, null, 2));

        const res = await createFeeCategory(feeCategoriesData).unwrap();

        if (res?.success) {
          toast.success(
            classNames.length > 1
              ? `${classNames.length} fee categories created successfully!`
              : "Fee category created successfully!"
          );
          setOpen(false);
        }
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err?.data?.message || "Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = id ? "Update Fee Category" : "Add New Fee Category";

  return (
    <CraftModal open={open} setOpen={setOpen} title={title} size="lg">
      {isLoading && id ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <CraftForm
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          // ✅ Key changes when: id changes, modal opens/closes, or data loads
          // classOptions added so key updates when options finally arrive
          key={`${id ?? "create"}-${open}-${singleFee ? "loaded" : "empty"}-${classOptions?.length ?? 0}`}
        >
          <FeeCategoryFormInner
            id={id}
            open={open}
            setOpen={setOpen}
            feeItems={feeItems}
            setFeeItems={setFeeItems}
            classOptions={classOptions}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
          />
        </CraftForm>
      )}
    </CraftModal>
  );
}
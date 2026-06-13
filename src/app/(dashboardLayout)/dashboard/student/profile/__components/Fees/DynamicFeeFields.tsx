/* eslint-disable @typescript-eslint/no-explicit-any */
import { FeeItem } from "@/types/feeCollection";
import { Add, Payment } from "@mui/icons-material";
import {
    Box,
    Button,
    CardContent,
    Grid,
    Paper,
    Typography,
    alpha,
    useTheme,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import FeeItemRow from "./FeeItemRow";

const generateUniqueId = () => `${Date.now()}_${Math.random()}`;

const createEmptyFeeItem = (): FeeItem => ({
    id: generateUniqueId(),
    feeType: "",
    amount: 0,
    discount: 0,
    isMonthly: false,
});

interface DynamicFeeFieldsProps {
    selectedClass: string;
    selectedMonth?: string;
    onItemsChange: (items: FeeItem[]) => void;
}

const DynamicFeeFields = ({
    selectedClass,
    onItemsChange,
}: DynamicFeeFieldsProps) => {
    const theme = useTheme();
    const [feeItems, setFeeItems] = useState<FeeItem[]>([createEmptyFeeItem()]);

    useEffect(() => {
        setFeeItems([createEmptyFeeItem()]);
    }, [selectedClass]);

    useEffect(() => {
        onItemsChange(feeItems);
    }, [feeItems, onItemsChange]);

    const updateItem = useCallback((itemId: string, field: keyof FeeItem, val: any) => {
        setFeeItems((prev) =>
            prev.map((item) => (item.id === itemId ? { ...item, [field]: val } : item))
        );
    }, []);

    const removeItem = useCallback((itemId: string) => {
        setFeeItems((prev) => prev.filter((item) => item.id !== itemId));
    }, []);

    const addItem = useCallback(() => {
        setFeeItems((prev) => [...prev, createEmptyFeeItem()]);
    }, []);

    if (!selectedClass) {
        return (
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ textAlign: "center", py: 4, color: "text.disabled" }}>
                    <Payment sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2">Select a class first to load fees</Typography>
                </Box>
            </CardContent>
        );
    }

    if (feeItems.length === 0) {
        return (
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ textAlign: "center", py: 4, color: "text.disabled" }}>
                    <Payment sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2">No fee items found for this class</Typography>
                    <Button variant="outlined" sx={{ mt: 2 }} startIcon={<Add />} onClick={addItem}>
                        Add Custom Item
                    </Button>
                </Box>
            </CardContent>
        );
    }

    return (
        <CardContent sx={{ p: 3 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 1,
                }}
            >
                <Grid container spacing={2}>
                    {/* Table Header */}
                    <Grid item xs={12}>
                        <Grid
                            container
                            spacing={2}
                            sx={{ mb: 1, pb: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}
                        >
                            {["FEE TYPE", "AMOUNT (৳)", "DISCOUNT (৳)", ""].map((header, index) => (
                                <Grid item xs={index === 3 ? 1 : index === 0 ? 5 : 3} key={header}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                        {header}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                    {/* Fee Items Rows */}
                    {feeItems.map((item) => (
                        <FeeItemRow
                            key={item.id}
                            item={item}
                            selectedClass={selectedClass}
                            onRemove={() => removeItem(item.id)}
                            onFieldChange={(field, val) => updateItem(item.id, field, val)}
                        />
                    ))}

                    {/* Add Button */}
                    <Grid item xs={12} display="flex" justifyContent="flex-end">
                        <Button
                            onClick={addItem}
                            size="medium"
                            variant="contained"
                            disabled={!selectedClass}
                            sx={{ textTransform: "none", fontWeight: "bold" }}
                        >
                            <Add sx={{ fontSize: 18, mr: 0.5 }} /> Add Item
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </CardContent>
    );
};

export default DynamicFeeFields;
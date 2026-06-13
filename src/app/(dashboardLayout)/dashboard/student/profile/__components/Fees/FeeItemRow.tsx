/* eslint-disable @typescript-eslint/no-explicit-any */
import { FeeItem } from "@/types/feeCollection";
import { Delete, Description } from "@mui/icons-material";
import {
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { useEffect, useRef } from "react";

const stopEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
    }
};

interface FeeItemRowProps {
    item: FeeItem;
    selectedClass: string;
    onRemove: () => void;
    onFieldChange: (field: keyof FeeItem, val: any) => void;
}

const FeeItemRow = ({
    item,
    selectedClass,
    onRemove,
    onFieldChange,
}: FeeItemRowProps) => {
    const amountRef = useRef<HTMLInputElement>(null);
    const discountRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (amountRef.current && document.activeElement !== amountRef.current) {
            amountRef.current.value = String(item.amount || "");
        }
    }, [item.amount]);

    useEffect(() => {
        if (discountRef.current && document.activeElement !== discountRef.current) {
            discountRef.current.value = String(item.discount || "");
        }
    }, [item.discount]);

    const handleFeeTypeChange = (value: string) => {
        const trimmedValue = value.trim();
        onFieldChange("feeType", trimmedValue);
        onFieldChange("isMonthly", trimmedValue.toLowerCase().includes("monthly"));
    };

    const handleAmountChange = (value: string) => {
        const numValue = parseFloat(value) || 0;
        if (numValue !== item.amount) onFieldChange("amount", numValue);
    };

    const handleDiscountChange = (value: string) => {
        const numValue = parseFloat(value) || 0;
        if (numValue !== item.discount) onFieldChange("discount", numValue);
    };

    return (
        <Grid item xs={12}>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Grid item xs={5}>
                    <TextField
                        fullWidth
                        size="small"
                        defaultValue={item.feeType}
                        placeholder="Fee name…"
                        disabled={!selectedClass}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Description color="disabled" sx={{ fontSize: 16 }} />
                                </InputAdornment>
                            ),
                        }}
                        onBlur={(e) => handleFeeTypeChange(e.target.value)}
                        onKeyDown={stopEnter}
                    />
                </Grid>

                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        inputRef={amountRef}
                        defaultValue={item.amount || ""}
                        placeholder="0"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Typography variant="body2" color="text.secondary">৳</Typography>
                                </InputAdornment>
                            ),
                        }}
                        onBlur={(e) => handleAmountChange(e.target.value)}
                        onKeyDown={stopEnter}
                    />
                </Grid>

                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        inputRef={discountRef}
                        defaultValue={item.discount || ""}
                        placeholder="0"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Typography variant="body2" color="text.secondary">৳</Typography>
                                </InputAdornment>
                            ),
                        }}
                        onBlur={(e) => handleDiscountChange(e.target.value)}
                        onKeyDown={stopEnter}
                    />
                </Grid>

                <Grid item xs={1} sx={{ display: "flex", justifyContent: "center" }}>
                    <Tooltip title="Remove">
                        <IconButton size="small" onClick={onRemove} sx={{ color: "error.main" }}>
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default FeeItemRow;
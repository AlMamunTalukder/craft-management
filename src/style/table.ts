import { alpha, Card, IconButton, styled, TableHead, TableRow, TextField } from "@mui/material";

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
    "& .MuiTableCell-head": {
        backgroundColor: theme.palette.mode === "dark" ? "#1e1b2e" : "#f8fafc",
        color: theme.palette.text.secondary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontWeight: 600,
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        paddingTop: 14,
        paddingBottom: 14,
        whiteSpace: "nowrap",
        "& .MuiBox-root": {
            fontWeight: 600,
        },
    },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:last-child td, &:last-child th": { border: 0 },
    "& td": {
        borderBottom: `1px solid ${theme.palette.mode === "dark" ? alpha(theme.palette.divider, 0.6) : "#f1f5f9"}`,
        paddingTop: 14,
        paddingBottom: 14,
        fontSize: "0.875rem",
        color: theme.palette.text.primary,
    },
    "&.MuiTableRow-hover": {
        transition: "background-color 0.15s ease",
        "&:hover": {
            backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.primary.main, 0.08) : "#f8fafc",
        },
    },
    "&.Mui-selected": {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
        },
    },
}));

export const GradientCard = styled(Card)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 16,
    boxShadow: theme.palette.mode === "dark" ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
}));

export const SearchField = styled(TextField)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.background.paper, 0.6) : "#f8fafc",
        fontSize: "0.875rem",
        height: 40,
        transition: "all 0.15s ease",
        color: theme.palette.text.primary,
        "& fieldset": {
            borderColor: theme.palette.divider,
            borderWidth: 1,
        },
        "&:hover fieldset": {
            borderColor: theme.palette.mode === "dark" ? alpha(theme.palette.primary.main, 0.3) : "#cbd5e1",
        },
        "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
            borderWidth: 1.5,
        },
        "&.Mui-focused": {
            backgroundColor: theme.palette.background.paper,
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
        },
        "& input::placeholder": {
            color: theme.palette.text.secondary,
            opacity: 0.7,
            fontSize: "0.875rem",
        },
        "& input": {
            color: theme.palette.text.primary,
        },
    },
}));

export const ActionButton = styled(IconButton)(({ theme }) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    "&:hover": {
        backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.primary.main, 0.12) : "#f8fafc",
        borderColor: theme.palette.mode === "dark" ? alpha(theme.palette.primary.main, 0.2) : "#cbd5e1",
        color: theme.palette.text.primary,
    },
    transition: "all 0.15s ease",
    "& svg": {
        fontSize: 18,
    },
}));

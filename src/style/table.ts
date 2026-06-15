import { alpha, Card, IconButton, styled, TableHead, TableRow, TextField } from "@mui/material";

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
    "& .MuiTableCell-head": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderBottom: `2px solid ${alpha(theme.palette.primary.dark, 0.3)}`,
        fontWeight: 700,
        fontSize: "0.875rem",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:last-child td, &:last-child th": { border: 0 },
    "&.MuiTableRow-hover": {
        transition: "all 0.2s ease-in-out",
        "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            transform: "translateY(-1px)",
            boxShadow: theme.shadows[1],
        },
    },
    "&.Mui-selected": {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
        },
    },
}));

export const GradientCard = styled(Card)(({ theme }) => ({
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
    backdropFilter: "blur(10px)",
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

export const SearchField = styled(TextField)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        transition: "all 0.2s ease-in-out",
        "&:hover": {
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            boxShadow: theme.shadows[1],
        },
        "&.Mui-focused": {
            backgroundColor: theme.palette.background.paper,
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
    },
}));

export const ActionButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    "&:hover": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        transform: "scale(1.1)",
    },
    transition: "all 0.2s ease-in-out",
}));

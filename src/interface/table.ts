// Types for the table component
export interface Column {
    id: string;
    label: string;
    minWidth?: number;
    align?: "left" | "center" | "right";
    format?: (value: any) => string | React.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
    type?:
    | "text"
    | "number"
    | "date"
    | "boolean"
    | "status"
    | "avatar"
    | "progress";
    visible?: boolean;
    render?: (row: any) => React.ReactNode;
    filterOptions?: { label: string; value: string }[];
}

export interface RowAction {
    label: string;
    icon: React.ReactNode;
    onClick: (row: any) => void;
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
    disabled?: (row: any) => boolean;
    tooltip?: string;
    inMenu?: boolean;
    alwaysShow?: boolean;
}

export interface BulkAction {
    label: string;
    icon: React.ReactNode;
    onClick: (selectedRows: any[]) => void;
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
    disabled?: (selectedRows: any[]) => boolean;
}

export interface EnhancedTableProps {
    title?: string;
    subtitle?: string;
    columns: Column[];
    data: any[];
    loading?: boolean;
    error?: string;
    rowCount?: number;
    page?: number;
    rowsPerPage?: number;
    onPageChange?: (page: number) => void;
    onRowsPerPageChange?: (rowsPerPage: number) => void;
    onRefresh?: () => void;
    onExport?: () => void;
    onPrint?: () => void;
    onAdd?: () => void;
    onSortChange?: (sortColumn: string, sortDirection: "asc" | "desc") => void;
    onSearchChange?: (searchTerm: string) => void;
    rowActions?: RowAction[];
    bulkActions?: BulkAction[];
    selectable?: boolean;
    searchable?: boolean;
    filterable?: boolean;
    sortable?: boolean;
    pagination?: boolean;
    serverSideSorting?: boolean;
    emptyStateMessage?: string;
    className?: string;
    idField?: string;
    defaultSortColumn?: string;
    defaultSortDirection?: "asc" | "desc";
    height?: string | number;
    maxHeight?: string | number;
    stickyHeader?: boolean;
    dense?: boolean;
    striped?: boolean;
    hover?: boolean;
    showToolbar?: boolean;
    customToolbar?: React.ReactNode;
    elevation?: number;
    borderRadius?: number;
    cardSx?: object;
    headerBackgroundColor?: string;
    showRowNumbers?: boolean;
    rowNumberHeader?: string;
    actionColumnWidth?: number;
    actionMenuLabel?: string;
    loadingOverlay?: boolean;
    fadeIn?: boolean;
}

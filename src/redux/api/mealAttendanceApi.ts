// src/redux/api/mealAttendanceApi.ts
import { baseApi } from "./baseApi";

export const mealAttendanceApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // Bulk create/update attendance
        bulkCreateAttendance: build.mutation({
            query: (data) => ({
                url: "/meal-attendance/bulk",
                method: "POST",
                data,
            }),
            invalidatesTags: ["mealAttendance"],
        }),

        // Create single attendance
        createAttendance: build.mutation({
            query: (data) => ({
                url: "/meal-attendance",
                method: "POST",
                data,
            }),
            invalidatesTags: ["mealAttendance"],
        }),

        // Update single attendance
        updateAttendance: build.mutation({
            query: ({ id, data }) => ({
                url: `/meal-attendance/${id}`,
                method: "PUT",
                data,
            }),
            invalidatesTags: ["mealAttendance"],
        }),

        // Get all attendance records with pagination
        getAllAttendanceRecords: build.query({
            query: ({ page = 1, limit = 10, search = "", className = "", date = "", month = "", academicYear, sortColumn = "date", sortDirection = "desc" }) => ({
                url: "/meal-attendance/all",
                method: "GET",
                params: {
                    page,
                    limit,
                    search,
                    className,
                    date,
                    month,
                    academicYear,
                    sortColumn,
                    sortDirection
                },
            }),
            providesTags: ["mealAttendance"],
        }),

        // Get attendance by ID
        getAttendanceById: build.query({
            query: (id) => ({
                url: `/meal-attendance/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "mealAttendance", id }],
        }),

        // Get monthly attendance sheet by class
        getMonthlyAttendanceSheet: build.query({
            query: ({ className, month, academicYear }) => ({
                url: "/meal-attendance/sheet",
                method: "GET",
                params: { class: className, month, academicYear },
            }),
            providesTags: ["mealAttendance"],
        }),

        // Get monthly summary with fees calculation
        getMonthlySummary: build.query({
            query: ({ className, month, academicYear }) => ({
                url: "/meal-attendance/summary",
                method: "GET",
                params: { class: className, month, academicYear },
            }),
            providesTags: ["mealAttendance"],
        }),

        // Get attendance by date range for specific class
        getAttendanceByDateRange: build.query({
            query: ({ className, startDate, endDate, academicYear }) => ({
                url: "/meal-attendance/date-range",
                method: "GET",
                params: { className, startDate, endDate, academicYear },
            }),
            providesTags: ["mealAttendance"],
        }),

        // Get attendance by date range for all students
        getAttendanceByDateRangeForAllStudents: build.query({
            query: ({ startDate, endDate, academicYear }) => ({
                url: "/meal-attendance/date-range/all",
                method: "GET",
                params: { startDate, endDate, academicYear },
            }),
            providesTags: ["mealAttendance"],
        }),

        // Get attendance by specific date
        getAttendanceBySpecificDate: build.query({
            query: ({ className, date, academicYear }) => ({
                url: "/meal-attendance/specific-date",
                method: "GET",
                params: { className, date, academicYear },
            }),
            providesTags: ["mealAttendance"],
        }),

        // Delete attendance record
        deleteAttendance: build.mutation({
            query: (id) => ({
                url: `/meal-attendance/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["mealAttendance"],
        }),
    }),
});

// Export hooks
export const {
    useBulkCreateAttendanceMutation,
    useCreateAttendanceMutation,
    useUpdateAttendanceMutation,
    useGetAllAttendanceRecordsQuery,
    useGetAttendanceByIdQuery,
    useGetMonthlyAttendanceSheetQuery,
    useGetMonthlySummaryQuery,
    useGetAttendanceByDateRangeQuery,
    useGetAttendanceByDateRangeForAllStudentsQuery,
    useGetAttendanceBySpecificDateQuery,
    useDeleteAttendanceMutation,
} = mealAttendanceApi;
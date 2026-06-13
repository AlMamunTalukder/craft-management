
import { baseApi } from "./baseApi";

export const mealAttendanceApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        bulkCreateAttendance: build.mutation({
            query: (data) => ({
                url: "/meal-attendance/bulk",
                method: "POST",
                data,
            }),
            invalidatesTags: ["mealAttendance"],
        }),

        bulkUpdateAttendance: build.mutation({
            query: (data) => ({
                url: "/meal-attendance/bulk",
                method: "PUT",
                data,
            }),
            invalidatesTags: ["mealAttendance"],
        }),

        createAttendance: build.mutation({
            query: (data) => ({
                url: "/meal-attendance",
                method: "POST",
                data,
            }),
            invalidatesTags: ["mealAttendance"],
        }),


        updateAttendance: build.mutation({
            query: ({ id, data }) => ({
                url: `/meal-attendance/${id}`,
                method: "PUT",
                data,
            }),
            invalidatesTags: ["mealAttendance"],
        }),

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

        getAttendanceById: build.query({
            query: (id) => ({
                url: `/meal-attendance/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "mealAttendance", id }],
        }),

        getMonthlyAttendanceSheet: build.query({
            query: ({ className, month, academicYear }) => ({
                url: "/meal-attendance/sheet",
                method: "GET",
                params: { className, month, academicYear },
            }),
            providesTags: ["mealAttendance"],
        }),

        getMonthlySummary: build.query({
            query: ({ className, month, academicYear }) => ({
                url: "/meal-attendance/summary",
                method: "GET",
                params: { className, month, academicYear },
            }),
            providesTags: ["mealAttendance"],
        }),

        getAttendanceByDateRange: build.query({
            query: ({ className, startDate, endDate, academicYear }) => ({
                url: "/meal-attendance/date-range",
                method: "GET",
                params: { className, startDate, endDate, academicYear },
            }),
            providesTags: ["mealAttendance"],
        }),

        getAttendanceByDateRangeForAllStudents: build.query({
            query: ({ startDate, endDate, academicYear }) => ({
                url: "/meal-attendance/date-range/all",
                method: "GET",
                params: { startDate, endDate, academicYear },
            }),
            providesTags: ["mealAttendance"],
        }),

        deleteAttendance: build.mutation({
            query: (id) => ({
                url: `/meal-attendance/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["mealAttendance"],
        }),
        deleteMonthlyAttendance: build.mutation({
            query: ({ className, month, academicYear }) => ({
                url: "/meal-attendance/bulk/month",
                method: "DELETE",
                params: { className, month, academicYear },
            }),
            invalidatesTags: ["mealAttendance"],
        }),
    }),
});

// Export hooks
export const {
    useBulkCreateAttendanceMutation,
    useBulkUpdateAttendanceMutation,
    useCreateAttendanceMutation,
    useUpdateAttendanceMutation,
    useGetAllAttendanceRecordsQuery,
    useGetAttendanceByIdQuery,
    useGetMonthlyAttendanceSheetQuery,
    useGetMonthlySummaryQuery,
    useGetAttendanceByDateRangeQuery,
    useGetAttendanceByDateRangeForAllStudentsQuery,
    useDeleteAttendanceMutation,
    useDeleteMonthlyAttendanceMutation, // Added this
} = mealAttendanceApi;
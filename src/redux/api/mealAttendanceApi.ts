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

        updateAttendance: build.mutation({
            query: ({ id, data }) => ({
                url: `/meal-attendance/${id}`,
                method: "PUT",
                data,
            }),
            invalidatesTags: ["mealAttendance"],
        }),

        getAllAttendanceRecords: build.query({
            query: ({
                page = 1,
                limit = 10,
                search = "",
                personType = "student",
                className = "",
                date = "",
                month = "",
                academicYear,
                sortColumn = "date",
                sortDirection = "desc",
            }) => ({
                url: "/meal-attendance/all",
                method: "GET",
                params: {
                    page,
                    limit,
                    search,
                    personType,
                    className,
                    date,
                    month,
                    academicYear,
                    sortColumn,
                    sortDirection,
                },
            }),
            providesTags: ["mealAttendance"],
        }),

        // ── FIXED: was using `builder` (undefined) — must use `build` to match
        // the destructured parameter name of this endpoints function.
        // Also fixed tag name to "mealAttendance" (lowercase) to match every
        // other endpoint in this file, so cache invalidation actually works
        // together with bulkCreateAttendance / updateAttendance / deleteMonthlyAttendance.
        getCombinedMonthlySheet: build.query<
            any,
            { month: string; academicYear: string; className?: string }
        >({
            query: ({ month, academicYear, className }) => ({
                url: "/meal-attendance/monthly-sheet/combined",
                method: "GET",
                params: { month, academicYear, ...(className ? { className } : {}) },
            }),
            transformResponse: (response: any) => response.data,
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
            query: ({ personType = "student", className, month, academicYear }) => ({
                url: "/meal-attendance/sheet",
                method: "GET",
                params: { personType, className, month, academicYear },
            }),
            providesTags: ["mealAttendance"],
        }),

        getMonthlySummary: build.query({
            query: ({ personType = "student", className, month, academicYear }) => ({
                url: "/meal-attendance/summary",
                method: "GET",
                params: { personType, className, month, academicYear },
            }),
            providesTags: ["mealAttendance"],
        }),

        getAttendanceByStudentAndMonth: build.query({
            query: ({ studentId, month, academicYear }) => ({
                url: `/meal-attendance/student/${studentId}/${month}/${academicYear}`,
                method: "GET",
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
            query: ({ personType = "student", className, month, academicYear }) => ({
                url: "/meal-attendance/bulk/month",
                method: "DELETE",
                params: { personType, className, month, academicYear },
            }),
            invalidatesTags: ["mealAttendance"],
        }),
    }),
});

// Export hooks
export const {
    useBulkCreateAttendanceMutation,
    useUpdateAttendanceMutation,
    useGetAllAttendanceRecordsQuery,
    useGetCombinedMonthlySheetQuery,
    useGetAttendanceByIdQuery,
    useGetMonthlyAttendanceSheetQuery,
    useGetMonthlySummaryQuery,
    useGetAttendanceByStudentAndMonthQuery,
    useDeleteAttendanceMutation,
    useDeleteMonthlyAttendanceMutation,
} = mealAttendanceApi;
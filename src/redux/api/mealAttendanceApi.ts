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
    useGetAttendanceByIdQuery,
    useGetMonthlyAttendanceSheetQuery,
    useGetMonthlySummaryQuery,
    useGetAttendanceByStudentAndMonthQuery,
    useDeleteAttendanceMutation,
    useDeleteMonthlyAttendanceMutation,
} = mealAttendanceApi;
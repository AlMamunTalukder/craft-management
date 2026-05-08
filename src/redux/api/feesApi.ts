
import { baseApi } from "./baseApi";

export const feesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    generateCurrentMonthFees: build.mutation({
      query: () => ({
        url: "/fees/generate",
        method: "POST",
        data: {},
      }),
      invalidatesTags: ["fees", "students"],
    }),
    generateSpecificMonthFees: build.mutation({
      query: ({ month, year }) => ({
        url: "/fees/generate",
        method: "POST",
        data: { month, year },
      }),
      invalidatesTags: ["fees", "students"],
    }),
    generateMealBalance: build.mutation({
      query: ({ month, year, mealRate }) => ({
        url: "/meal-fee/generate-all",
        method: "POST",
        data: { month, year, mealRate },
      }),
      invalidatesTags: ["fees", "students", "mealAttendances"],
    }),


    getFeeGenerationStatus: build.query({
      query: () => ({
        url: "/fees/status",
        method: "GET",
      }),
      providesTags: ["fees"],
    }),

    getStudentMealBalance: build.query({
      query: ({ studentId, month, year }) => ({
        url: `/meal-balance/student/${studentId}`,
        method: "GET",
        params: { month, year },
      }),
      providesTags: ["mealAttendances"],
    }),

    getDueFees: build.query({
      query: ({ limit, page, searchTerm }) => ({
        url: "/fees/due",
        method: "GET",
        params: { page, limit, searchTerm },
      }),
      providesTags: ["fees"],
    }),

    getAllFees: build.query({
      query: ({ limit, page, searchTerm }) => ({
        url: "/fees",
        method: "GET",
        params: { page, limit, searchTerm },
      }),
      providesTags: ["fees"],
    }),

    getSingleFee: build.query({
      query: ({ id }) => ({
        url: `/fees/${id}`,
        method: "GET",
      }),
      providesTags: ["fees"],
    }),

    updateFee: build.mutation({
      query: ({ id, data }) => ({
        url: `/fees/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["fees"],
    }),

    deleteFee: build.mutation({
      query: (id) => ({
        url: `/fees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["fees"],
    }),

    payFee: build.mutation({
      query: (data) => ({
        url: "/fees/pay",
        method: "POST",
        data,
      }),
      invalidatesTags: ["fees"],
    }),

    createFee: build.mutation({
      query: ({ studentId, ...data }) => ({
        url: `/fees/students/${studentId}/fees`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["fees", "students"],
    }),

    getClassWiseFeeSummary: build.query({
      query: ({ academicYear }) => ({
        url: "/fees/class-summary",
        method: "GET",
        params: { academicYear },
      }),
      providesTags: ["fees"],
    }),
  }),
});

export const {
  useGenerateCurrentMonthFeesMutation,
  useGenerateSpecificMonthFeesMutation,
  useGenerateMealBalanceMutation,
  useGetFeeGenerationStatusQuery,
  useGetStudentMealBalanceQuery,
  useGetDueFeesQuery,
  useGetAllFeesQuery,
  useGetSingleFeeQuery,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
  usePayFeeMutation,
  useCreateFeeMutation,
  useGetClassWiseFeeSummaryQuery,
} = feesApi;
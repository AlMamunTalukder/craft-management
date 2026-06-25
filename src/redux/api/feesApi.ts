// src/redux/api/feesApi.ts
import { baseApi } from "./baseApi";
import { TagType } from "./tag-types";

export const feesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    generateFees: build.mutation({
      query: (data: { month: number; year: number }) => ({
        url: "/fees/generate",
        method: "POST",
        data: data,
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

    applyFeeAdjustment: build.mutation({
      query: (data) => ({
        url: "/fee-adjustments",
        method: "POST",
        data: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            baseApi.util.invalidateTags([
              "fees",
              "students",
              "Student",
              "Payment",
            ])
          );
        } catch (error) {
          console.error("Fee adjustment failed:", error);
        }
      },
      invalidatesTags: ["fees", "students", "Student", "Payment"],
    }),

    getDueFees: build.query({
      query: ({ limit, page, searchTerm, year, class: className }) => ({
        url: "/fees/due",
        method: "GET",
        params: { page, limit, searchTerm, year, class: className },
      }),
      providesTags: ["fees", "students"],
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
      invalidatesTags: ["fees", "Payment", "Receipts", "Receipt"],
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


    applyBulkAdjustments: build.mutation({
      query: (data) => ({
        url: "/fee-adjustments/bulk/student",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["fees", "students", "Student", "Payment"],
    }),

  }),
});

export const {
  useGenerateFeesMutation,
  useApplyFeeAdjustmentMutation,
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
  useApplyBulkAdjustmentsMutation
} = feesApi;
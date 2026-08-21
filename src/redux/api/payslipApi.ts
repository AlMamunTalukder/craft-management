import { baseApi } from "./baseApi";

export const payslipApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    generatePayslips: build.mutation({
      query: (data) => ({ url: "/payslip/generate", method: "POST", data }),
      invalidatesTags: ["payslip"],
    }),
    getAllPayslips: build.query({
      query: ({ limit, page, month, year, employeeType, status }) => ({
        url: "/payslip",
        method: "GET",
        params: { page, limit, month, year, employeeType, status },
      }),
      providesTags: ["payslip"],
    }),
    getPayslipSummary: build.query({
      query: () => ({ url: "/payslip/summary", method: "GET" }),
      providesTags: ["payslip"],
    }),
    markPayslipPaid: build.mutation({
      query: (id) => ({ url: `/payslip/${id}/paid`, method: "PATCH" }),
      invalidatesTags: ["payslip"],
    }),
    deletePayslip: build.mutation({
      query: (id) => ({ url: `/payslip/${id}`, method: "DELETE" }),
      invalidatesTags: ["payslip"],
    }),
  }),
});

export const {
  useGeneratePayslipsMutation,
  useGetAllPayslipsQuery,
  useGetPayslipSummaryQuery,
  useMarkPayslipPaidMutation,
  useDeletePayslipMutation,
} = payslipApi;

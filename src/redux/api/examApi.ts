import { baseApi } from "./baseApi";

export const examApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createExam: build.mutation({
      query: (data) => ({ url: "/exam", method: "POST", data }),
      invalidatesTags: ["exam"],
    }),
    getAllExams: build.query({
      query: ({ limit, page, searchTerm, className, status }) => ({
        url: "/exam",
        method: "GET",
        params: { page, limit, searchTerm, className, status },
      }),
      providesTags: ["exam"],
    }),
    getSingleExam: build.query({
      query: (id) => ({ url: `/exam/${id}`, method: "GET" }),
      providesTags: ["exam"],
    }),
    updateExam: build.mutation({
      query: ({ id, data }) => ({ url: `/exam/${id}`, method: "PATCH", data }),
      invalidatesTags: ["exam"],
    }),
    deleteExam: build.mutation({
      query: (id) => ({ url: `/exam/${id}`, method: "DELETE" }),
      invalidatesTags: ["exam"],
    }),
    publishExam: build.mutation({
      query: ({ id, status }) => ({
        url: `/exam/${id}/publish`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: ["exam"],
    }),
    getExamMarks: build.query({
      query: ({ examId, className }) => ({
        url: "/exam/marks",
        method: "GET",
        params: { examId, className },
      }),
      providesTags: ["exam"],
    }),
    upsertExamMarks: build.mutation({
      query: (data) => ({ url: "/exam/marks/bulk", method: "POST", data }),
      invalidatesTags: ["exam"],
    }),
    getExamResults: build.query({
      query: ({ examId, className }) => ({
        url: `/exam/result/${examId}`,
        method: "GET",
        params: { className },
      }),
      providesTags: ["exam"],
    }),
  }),
});

export const {
  useCreateExamMutation,
  useGetAllExamsQuery,
  useGetSingleExamQuery,
  useUpdateExamMutation,
  useDeleteExamMutation,
  usePublishExamMutation,
  useGetExamMarksQuery,
  useUpsertExamMarksMutation,
  useGetExamResultsQuery,
} = examApi;

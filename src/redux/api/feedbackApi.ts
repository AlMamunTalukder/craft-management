import { baseApi } from "./baseApi";

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createFeedback: build.mutation({
      query: (data) => ({
        url: "/feedback",
        method: "POST",
        data,
      }),
      invalidatesTags: ["feedback"],
    }),
    getAllFeedbacks: build.query({
      query: ({
        limit,
        page,
        searchTerm,
        type,
        category,
        priority,
        department,
      }) => ({
        url: "/feedback",
        method: "GET",
        params: {
          page,
          limit,
          searchTerm,
          type,
          category,
          priority,
          department,
        },
      }),
      providesTags: ["feedback"],
    }),
    getSingleFeedback: build.query({
      query: (id: string) => ({
        url: `/feedback/${id}`,
        method: "GET",
      }),
      providesTags: ["feedback"],
    }),
    updateFeedback: build.mutation({
      query: ({ id, data }) => ({
        url: `/feedback/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["feedback"],
    }),
    deleteFeedback: build.mutation({
      query: (id: string) => ({
        url: `/feedback/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["feedback"],
    }),
  }),
});

export const {
  useCreateFeedbackMutation,
  useGetAllFeedbacksQuery,
  useGetSingleFeedbackQuery,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
} = feedbackApi;

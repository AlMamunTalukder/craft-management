import { baseApi } from "./baseApi";

export const leaveApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createLeave: build.mutation({
      query: (data) => ({ url: "/leave", method: "POST", data }),
      invalidatesTags: ["leave"],
    }),
    getAllLeaves: build.query({
      query: ({ limit, page, employeeType, status }) => ({
        url: "/leave",
        method: "GET",
        params: { page, limit, employeeType, status },
      }),
      providesTags: ["leave"],
    }),
    updateLeave: build.mutation({
      query: ({ id, data }) => ({ url: `/leave/${id}`, method: "PATCH", data }),
      invalidatesTags: ["leave"],
    }),
    updateLeaveStatus: build.mutation({
      query: ({ id, status }) => ({
        url: `/leave/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: ["leave"],
    }),
    deleteLeave: build.mutation({
      query: (id) => ({ url: `/leave/${id}`, method: "DELETE" }),
      invalidatesTags: ["leave"],
    }),
  }),
});

export const {
  useCreateLeaveMutation,
  useGetAllLeavesQuery,
  useUpdateLeaveMutation,
  useUpdateLeaveStatusMutation,
  useDeleteLeaveMutation,
} = leaveApi;

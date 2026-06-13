import { baseApi } from "./baseApi";

export const staffApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createStaff: build.mutation({
      query: (data) => ({
        url: "/staff",
        method: "POST",
        // Note: If you are using standard fetchBaseQuery, change 'data' to 'body'
        // If using axios or a custom wrapper, 'data' is usually correct.
        data,
      }),
      invalidatesTags: ["staff"],
    }),

    getAllStaff: build.query({
      // Added 'sort' to arguments to support table sorting
      query: ({ limit, page, searchTerm, sort }) => ({
        url: "/staff",
        method: "GET",
        params: { page, limit, searchTerm, sort },
      }),
      providesTags: ["staff"],
    }),

    getSingleStaff: build.query({
      // Expects an object like { id: "xyz" } from the component
      query: ({ id }) => ({
        url: `/staff/${id}`,
        method: "GET",
      }),
      providesTags: ["staff"],
    }),

    updateStaff: build.mutation({
      query: ({ id, data }) => ({
        url: `/staff/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["staff"],
    }),

    deleteStaff: build.mutation({
      query: (id) => ({
        url: `/staff/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["staff"],
    }),
  }),
});

export const {
  useCreateStaffMutation,
  useGetAllStaffQuery,
  useGetSingleStaffQuery,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} = staffApi;
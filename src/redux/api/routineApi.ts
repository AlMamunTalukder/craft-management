import { baseApi } from "./baseApi";

export const routineApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createRoutine: build.mutation({
      query: (data) => ({ url: "/routine", method: "POST", data }),
      invalidatesTags: ["routine"],
    }),
    getAllRoutines: build.query({
      query: (params) => ({
        url: "/routine",
        method: "GET",
        params,
      }),
      providesTags: ["routine"],
    }),
    getWeekRoutine: build.query({
      query: ({ className, section, academicYear }) => ({
        url: "/routine/week",
        method: "GET",
        params: { className, section, academicYear },
      }),
      providesTags: ["routine"],
    }),
    getSingleRoutine: build.query({
      query: (id) => ({ url: `/routine/${id}`, method: "GET" }),
      providesTags: ["routine"],
    }),
    updateRoutine: build.mutation({
      query: ({ id, data }) => ({
        url: `/routine/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["routine"],
    }),
    deleteRoutine: build.mutation({
      query: (id) => ({ url: `/routine/${id}`, method: "DELETE" }),
      invalidatesTags: ["routine"],
    }),
  }),
});

export const {
  useCreateRoutineMutation,
  useGetAllRoutinesQuery,
  useGetWeekRoutineQuery,
  useGetSingleRoutineQuery,
  useUpdateRoutineMutation,
  useDeleteRoutineMutation,
} = routineApi;

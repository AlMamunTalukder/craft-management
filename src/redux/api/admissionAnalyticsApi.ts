import { baseApi } from "./baseApi";

export const admissionAnalyticsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdmissionStats: build.query({
      query: ({ year }) => ({
        url: "/admission-stats",
        method: "GET",
        params: { year },
      }),
      providesTags: ["admission-stats"],
    }),
  }),
});

export const { useGetAdmissionStatsQuery } = admissionAnalyticsApi;

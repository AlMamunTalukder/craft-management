import { baseApi } from "./baseApi";

export const assetApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createAsset: build.mutation({
      query: (data) => ({ url: "/asset", method: "POST", data }),
      invalidatesTags: ["asset"],
    }),
    getAllAssets: build.query({
      query: ({ limit, page, searchTerm, category, condition }) => ({
        url: "/asset",
        method: "GET",
        params: { page, limit, searchTerm, category, condition },
      }),
      providesTags: ["asset"],
    }),
    getAssetSummary: build.query({
      query: () => ({ url: "/asset/summary", method: "GET" }),
      providesTags: ["asset"],
    }),
    updateAsset: build.mutation({
      query: ({ id, data }) => ({ url: `/asset/${id}`, method: "PATCH", data }),
      invalidatesTags: ["asset"],
    }),
    deleteAsset: build.mutation({
      query: (id) => ({ url: `/asset/${id}`, method: "DELETE" }),
      invalidatesTags: ["asset"],
    }),
  }),
});

export const {
  useCreateAssetMutation,
  useGetAllAssetsQuery,
  useGetAssetSummaryQuery,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} = assetApi;

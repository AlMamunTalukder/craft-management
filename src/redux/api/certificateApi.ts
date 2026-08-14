import { baseApi } from "./baseApi";

export const certificateApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createCertificate: build.mutation({
      query: (data) => ({ url: "/certificate", method: "POST", data }),
      invalidatesTags: ["certificate"],
    }),
    getAllCertificates: build.query({
      query: (params) => ({
        url: "/certificate",
        method: "GET",
        params,
      }),
      providesTags: ["certificate"],
    }),
    getSingleCertificate: build.query({
      query: (id) => ({ url: `/certificate/${id}`, method: "GET" }),
      providesTags: ["certificate"],
    }),
    updateCertificate: build.mutation({
      query: ({ id, data }) => ({
        url: `/certificate/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["certificate"],
    }),
    deleteCertificate: build.mutation({
      query: (id) => ({ url: `/certificate/${id}`, method: "DELETE" }),
      invalidatesTags: ["certificate"],
    }),
    getIdCards: build.query({
      query: ({ className, department }) => ({
        url: "/certificate/id-cards",
        method: "GET",
        params: { className, department },
      }),
    }),
  }),
});

export const {
  useCreateCertificateMutation,
  useGetAllCertificatesQuery,
  useGetSingleCertificateQuery,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,
  useGetIdCardsQuery,
} = certificateApi;

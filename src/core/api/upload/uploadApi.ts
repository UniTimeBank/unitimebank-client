import { baseApi } from "../baseApi";

export type DirectUploadPurpose =
  "AVATAR" | "CHAT_ATTACHMENT" | "REPORT_EVIDENCE";

export interface DirectUploadRequest {
  file: File;
  purpose: DirectUploadPurpose;
  bookingId?: string;
}

export interface DirectUploadAsset {
  publicId: string;
  secureUrl: string;
  bytes: number;
  format?: string;
  resourceType: "image" | "raw" | "video";
  originalFilename?: string;
}

interface SignedUploadResponse {
  apiKey: string;
  signature: string;
  uploadUrl: string;
  uploadParams: Record<string, string | number | boolean>;
  constraints: {
    maxBytes: number;
    allowedMimeTypes: string[];
  };
}

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  bytes: number;
  format?: string;
  resource_type: "image" | "raw" | "video";
  original_filename?: string;
  error?: { message?: string };
}

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFileDirect: builder.mutation<DirectUploadAsset, DirectUploadRequest>({
      queryFn: async (
        { file, purpose, bookingId },
        _api,
        _extraOptions,
        baseQuery,
      ) => {
        const signatureResult = await baseQuery({
          url: "/uploads/signature",
          method: "POST",
          body: {
            purpose,
            bookingId,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            fileSize: file.size,
          },
        });

        if (signatureResult.error) return { error: signatureResult.error };
        const signature = signatureResult.data as SignedUploadResponse;
        if (!signature?.uploadUrl || !signature.signature) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Backend không trả về chữ ký upload hợp lệ",
            },
          };
        }

        if (file.size > signature.constraints.maxBytes) {
          return {
            error: {
              status: 400,
              data: { message: "File vượt quá dung lượng cho phép" },
            },
          };
        }
        if (
          signature.constraints.allowedMimeTypes.length > 0 &&
          !signature.constraints.allowedMimeTypes.includes(file.type)
        ) {
          return {
            error: {
              status: 400,
              data: { message: "Định dạng file không được phép" },
            },
          };
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signature.apiKey);
        formData.append("signature", signature.signature);
        Object.entries(signature.uploadParams).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        try {
          const response = await fetch(signature.uploadUrl, {
            method: "POST",
            body: formData,
          });
          const result = (await response.json()) as CloudinaryUploadResponse;
          if (!response.ok || !result.public_id || !result.secure_url) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: result.error?.message || "Cloudinary upload thất bại",
                data: {
                  message:
                    result.error?.message || "Cloudinary upload thất bại",
                },
              },
            };
          }

          return {
            data: {
              publicId: result.public_id,
              secureUrl: result.secure_url,
              bytes: result.bytes,
              format: result.format,
              resourceType: result.resource_type,
              originalFilename: result.original_filename,
            },
          };
        } catch (error: unknown) {
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Không thể kết nối Cloudinary",
            },
          };
        }
      },
    }),
  }),
});

export const { useUploadFileDirectMutation } = uploadApi;

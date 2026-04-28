import { api } from "@/lib/axios";

export type UploadedImage = {
  key: string;
  bucket: string;
  contentType: string;
  imageUrl: string;
};

export async function uploadImage(file: File, folder = "images") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await api.post<UploadedImage>("/storage/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

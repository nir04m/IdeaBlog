import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export interface UploadedMedia {
  id: number;
  url: string;
  type: string;
}

export type MediaItem = {
  id: number;
  url: string;
  type?: string | null;
  createdAt: string;
};

// Allow both shapes (your backend might return { media: {...} } or { url: "..." })
export type UploadedMediaT =
  | { media: MediaItem }
  | { url: string };

export function getUploadedUrl(resp: UploadedMediaT): string {
  if ("media" in resp) return resp.media.url;
  if ("url" in resp) return resp.url;
  throw new Error("Upload response did not include a URL");
}

const mediaService = {
  uploadForPost: async (postId: number, file: File): Promise<UploadedMedia> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post(`/posts/${postId}/media`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // backend returns { message, media: { id, url, type, ... } }
    return res.data.media as UploadedMedia;
  },

  async listForPost(postId: number): Promise<MediaItem[]> {
    const res = await api.get<{ media: MediaItem[] }>(`/posts/${postId}/media`);
    return res.data.media ?? [];
  },

  async deleteMedia(mediaId: number): Promise<void> {
    await api.delete(`/media/${mediaId}`);
  },

};

export default mediaService;

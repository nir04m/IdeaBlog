import axios from "axios";
import api from "./api";

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
//   withCredentials: true,
// });

export type MediaItem = {
  id: number;
  url: string;
  type?: string | null;
  createdAt: string;
};

export type UploadResponse = {
  media: MediaItem; // your backend returns { message, media: {...} }
};

const mediaService = {
  /** POST /posts/:postId/media  -> { media } */
  async uploadForPost(postId: number, file: File): Promise<MediaItem> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post<UploadResponse>(`/posts/${postId}/media`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.media;
  },

  /** GET /posts/:postId/media -> { media: MediaItem[] } */
  async listForPost(postId: number): Promise<MediaItem[]> {
    const res = await api.get<{ media: MediaItem[] }>(`/posts/${postId}/media`);
    return res.data.media ?? [];
  },

  /** DELETE /media/:id */
  async deleteMedia(mediaId: number): Promise<void> {
    await api.delete(`/media/${mediaId}`);
  },

  /**
   * Best-effort: find the media for a post that corresponds to the current image.
   * Prefer the exact URL match; otherwise fall back to the newest media item.
   * Returns true if it attempted a delete (and 2xx), false if nothing to delete.
   */
  async deleteCurrentCover(postId: number, currentImageUrl?: string | null): Promise<boolean> {
    const list = await this.listForPost(postId);
    if (!list || list.length === 0) return false;

    let target: MediaItem | undefined;
    if (currentImageUrl) {
      target = list.find(m => m.url === currentImageUrl);
    }
    if (!target) {
      // assume server returns media sorted old→new (if not, sort by createdAt)
      target = list[list.length - 1];
    }
    if (!target) return false;

    try {
      await this.deleteMedia(target.id);
      return true;
    } catch {
      // non-fatal
      return false;
    }
  },
};

export default mediaService;

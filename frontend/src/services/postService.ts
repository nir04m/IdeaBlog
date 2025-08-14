import axios from "axios";

export interface Post {
  id: number;
  userId: number;
  categoryId: number;
  categoryName?: string; 
  tagId: number | null;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorPicture: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  categoryId: number;
  imageUrl?: string;
}

export interface CreatedPostResponse {
  // support either shape from your backend
  postId?: number;
  post?: { id: number; imageUrl?: string | null };
}

export type UpdatePostInput = {
  title: string;
  content: string;
  categoryId: number;
  imageUrl?: string | null;
  previousImageUrl?: string | null;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

const postService = {
  getAllPosts: async (): Promise<Post[]> => {
    const res = await api.get<{ posts: Post[] }>("/posts");
    return res.data.posts;
  },

  getPostById: async (id: number): Promise<Post> => {
    const res = await api.get<{ post: Post }>(`/posts/${id}`);
    return res.data.post;
  },

  // accept the lean payload, not the full Post
  create: async (data: CreatePostInput): Promise<CreatedPostResponse> => {
    const res = await api.post("/posts", data);
    return res.data;
  },

  // update imageUrl after media upload
  updateImage: async (postId: number, imageUrl: string) => {
    const res = await api.put(`/posts/${postId}`, { imageUrl });
    return res.data;
  },

  getByUser: async (userId: number): Promise<Post[]> => {
    const res = await api.get<{ posts: Post[] }>(`/users/${userId}/posts`);
    return res.data.posts;
  },

  update: async (id: number, data: UpdatePostInput) => {
    const res = await api.put(`/posts/${id}`, data);
    return res.data;
  },

};

export default postService;

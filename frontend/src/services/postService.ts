// src/services/postService.ts

import axios from "axios";

export interface Post {
  id: number;
  userId: number;
  categoryId: number;
  tagId: number | null;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

const postService = {
  /** GET http://localhost:5000/api/posts → { posts: Post[] } */
  getAllPosts: async (): Promise<Post[]> => {
    const res = await api.get<{ posts: Post[] }>("/posts");
    return res.data.posts;
  },

  /** GET http://localhost:5000/api/posts/:id → { post: Post } */
  getPostById: async (id: number): Promise<Post> => {
    const res = await api.get<{ post: Post }>(`/posts/${id}`);
    return res.data.post;
  },
};

export default postService;

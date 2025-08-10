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
  authorName: string;
  authorPicture: string;
}

export type NewPostInput  = {
  title: string;
  content: string;
  categoryId: number;
  imageUrl?: string | null;
};

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
  create: async (data: NewPostInput ) => {
    const res = await api.post("/posts", data);
    return res.data;
  },
};

export default postService;

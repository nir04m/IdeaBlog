import axios from "axios";
import api from "./api";

export type Category = { id: number; name: string; slug: string };

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
//   withCredentials: true,
// });

const categoriesService = {
  list: async (): Promise<Category[]> => {
    const res = await api.get<{ categories: Category[] }>("/categories");
    // Adjust to match your backend response shape
    return res.data.categories ?? res.data as any;
  },
};

export default categoriesService;

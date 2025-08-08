// src/services/userService.ts
import axios from "axios";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio: string | null;
  profilePicture: string | null;
  createdAt: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // if you’re using cookies/sessions
});

export default {
  /** GET /api/user/profile (or whatever your backend route is) */
  getProfile: async (): Promise<UserProfile> => {
    const res = await api.get<{ user: UserProfile }>("/user");
    return res.data.user;
  },
};

// src/services/userService.ts
import axios from "axios";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio: string | null;
  profilePicture: string | null;
  onboarded: boolean;           
  createdAt: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export default {
  getProfile: async (): Promise<UserProfile> => {
    const res = await api.get<{ user: UserProfile }>("/user");
    return res.data.user;
  },

  // handy for the regular Edit Profile page (does NOT mark onboarded)
  updateMe: async (payload: {
    username?: string;
    bio?: string | null;
    profilePicture?: string | null;
  }) => {
    const res = await api.put("/user", payload);
    return res.data;
  },

  logout: () => api.post('/auth/logout'),
};





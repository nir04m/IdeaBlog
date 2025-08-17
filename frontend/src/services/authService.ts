// src/services/authService.ts
import axios from "axios";
import api from "./api";

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth",
//   withCredentials: true,
// });

const authService = {
  register: (data: RegisterPayload) =>
    api.post("/auth/register", data).then((res) => res.data),
  login: (data: LoginPayload) =>
    api.post("/auth/login", data).then((res) => res.data),
  logout: () => api.post("/auth/logout").then((res) => res.data),
};

export default authService;

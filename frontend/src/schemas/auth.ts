// src/schemas/auth.ts
import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(2, "Username too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "At least 6 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;

import type { NextApiRequest, NextApiResponse } from "next";
import { auth0 } from "@/lib/auth0";

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  try {
    await auth0.handleLogin(req, res);
  } catch (e) {
    console.error(e);
    res.status(500).end("Login error");
  }
}

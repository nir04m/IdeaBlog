// pages/api/auth/callback.js
import { auth0 } from "@/lib/auth0";

export default async function callback(req, res) {
  await auth0.handleCallback(req, res);
}

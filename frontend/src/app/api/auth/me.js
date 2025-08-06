// pages/api/auth/me.js
import { auth0 } from "@/lib/auth0";

export default async function me(req, res) {
  await auth0.handleProfile(req, res);
}

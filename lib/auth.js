import { cookies } from "next/headers";

export async function isLoggedIn() {
  const c = await cookies();
  return c.get("session")?.value === "authenticated";
}
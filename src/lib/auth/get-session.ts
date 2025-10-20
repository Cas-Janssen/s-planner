import { cache } from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export const getServerSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
});

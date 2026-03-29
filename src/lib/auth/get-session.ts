import { cache } from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { Session } from "@/lib/auth/auth-client";

export const getServerSession = cache(async (): Promise<Session | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return null;
  }
  return session;
});

"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "#/public/globe.svg";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import NavbarProfileButton from "./profile-button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Header() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="flex items-center justify-between p-4 bg-blue-600 text-white">
      <Link href="/">
        <Image src={logo} alt="Logo" width={50} height={50} />
      </Link>

      <div className="flex gap-2 items-center">
        {isPending ? (
          <Skeleton className="h-10 w-10 rounded-full" />
        ) : !session?.user ? (
          <>
            <Button variant="outline" asChild>
              <Link href="/sign-in">Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </>
        ) : (
          <NavbarProfileButton session={session} />
        )}
      </div>
    </header>
  );
}

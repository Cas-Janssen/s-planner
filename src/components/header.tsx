import Link from "next/link";
import Image from "next/image";
import logo from "#/public/globe.svg";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "./ui/button";

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="flex items-center justify-between p-4 bg-blue-600 text-white">
      <Link href="/">
        <Image src={logo} alt="Logo" width={50} height={50} />
      </Link>
      <nav className="flex gap-4">
        <Link className="hover:underline" href="/">
          Home
        </Link>
        <Link className="hover:underline" href="/boards">
          Boards
        </Link>
        {!session ? (
          <>
            <Button variant="outline">
              <Link className="hover:underline" href="/sign-in">
                Login
              </Link>
            </Button>
            <Button variant="outline">
              <Link className="hover:underline" href="/sign-up">
                Sign Up
              </Link>
            </Button>
          </>
        ) : undefined}
        {/* TODO: add nice account menu where the user can view account, change account and sign-out */}
      </nav>
    </header>
  );
}

"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import UserAvatar from "./user-avatar";

export default function NavbarProfileButton({ session }: { session: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
        onError: (error) => {
          console.error("Logout failed:", error);
        },
      },
    });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="hover:cursor-pointer focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      >
        <Button
          variant="default"
          className="p-0 bg-transparent hover:bg-transparent"
        >
          {session.user && (
            <UserAvatar
              name={session.user.name ?? "User"}
              imageURL={session.user.image ?? null}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/boards">Boards</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/organizations">Organizations</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

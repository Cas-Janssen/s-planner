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
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "./mode-toggle";

export function NavbarClient() {
  const { data: session, isPending } = authClient.useSession();

  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
          toast.success("Successfully logged out.");
        },
        onError: () => {
          toast.error("Failed to log out. Please try again.");
        },
      },
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <ModeToggle />
      {session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="hover:cursor-pointer focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <Button
              variant="default"
              className="bg-transparent p-0 hover:bg-transparent"
            >
              {session.user && (
                <UserAvatar
                  name={session.user.name}
                  imageURL={session.user.image ?? null}
                />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Profile</Link>
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
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium"
            asChild
          >
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button size="sm" className="text-sm font-medium" asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </>
      )}
    </div>
  );
}

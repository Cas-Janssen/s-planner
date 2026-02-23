"use client";

import { BoardWithDetails, BoardMemberWithUser } from "@/types/database";
import { BoardRole } from "@prisma/client";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";

async function removeBoardMember(boardId: string, userId: string) {
  const response = await fetch(`/api/boards/${boardId}/members/${userId}`, {
    method: "DELETE",
  });
  return response.json();
}

async function updateMemberRole(
  boardId: string,
  userId: string,
  newRole: BoardRole,
) {
  const response = await fetch(`/api/boards/${boardId}/members/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: newRole }),
  });
  return response.json();
}

export default function MembersPanel({
  board,
  currentUserRole,
  canManage,
}: {
  board: BoardWithDetails;
  currentUserRole: BoardRole;
  canManage: boolean;
}) {
  const [members, setMembers] = useState(board.members);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (memberId: string) => {
    setRemoving(memberId);
    const res = await removeBoardMember(board.id, memberId);
    setRemoving(null);

    if (res?.error) {
      alert(`Error: ${res.error}`);
      return;
    }

    setMembers((prev) => prev.filter((m) => m.userId !== memberId));
  };

  const handleRoleChange = async (memberId: string, newRole: BoardRole) => {
    const res = await updateMemberRole(board.id, memberId, newRole);

    if (res?.error) {
      alert(`Error: ${res.error}`);
      return;
    }

    setMembers((prev) =>
      prev.map((m) => (m.userId === memberId ? { ...m, role: newRole } : m)),
    );
  };

  const getRoleBadgeVariant = (
    role: BoardRole,
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (role === BoardRole.MANAGER) return "default";
    if (role === BoardRole.MEMBER) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground text-sm">
        {members.length} member{members.length !== 1 ? "s" : ""}
      </div>

      <div className="max-h-[600px] space-y-2 overflow-y-auto">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <div className="flex flex-1 items-center gap-3">
              <UserAvatar
                name={member.user?.name || member.user?.email || "Member"}
                imageURL={member.user?.image || null}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">
                  {member.user?.name || member.user?.email}
                </div>
                <div className="text-muted-foreground truncate text-xs">
                  {member.user?.email}
                </div>
              </div>
            </div>

            {canManage ? (
              <div className="ml-2 flex items-center gap-2">
                <select
                  value={member.role}
                  onChange={(e) =>
                    handleRoleChange(member.userId, e.target.value as BoardRole)
                  }
                  className="border-input bg-background h-8 rounded-md border px-2 text-xs"
                >
                  <option value={BoardRole.MANAGER}>Manager</option>
                  <option value={BoardRole.MEMBER}>Member</option>
                  <option value={BoardRole.VIEWER}>Viewer</option>
                </select>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={removing === member.userId}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove member</AlertDialogTitle>
                      <AlertDialogDescription>
                        Remove{" "}
                        <strong>
                          {member.user?.name || member.user?.email}
                        </strong>{" "}
                        from this board?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemove(member.userId)}
                        disabled={removing === member.userId}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {removing === member.userId ? "Removing..." : "Remove"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <Badge variant={getRoleBadgeVariant(member.role)}>
                {member.role}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

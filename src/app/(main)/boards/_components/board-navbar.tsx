"use client";

import { BoardRole } from "@prisma/client";
import { BoardWithDetails } from "@/types/database";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { inviteBoardMember } from "@/lib/actions/board-actions";
import { toast } from "sonner";
import { BoardManagementDialog } from "./dialog/board-management-dialog";

export default function BoardNavbar({
  board,
  role,
  canManage,
}: {
  board: BoardWithDetails;
  role: BoardRole;
  canManage: boolean;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<BoardRole>(BoardRole.MEMBER);
  const [isInviting, setIsInviting] = useState(false);

  const submitInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsInviting(true);
    const formData = new FormData();
    formData.append("boardId", board.id);
    formData.append("email", email);
    formData.append("role", inviteRole);

    const res = await inviteBoardMember(formData);
    setIsInviting(false);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success("Invite sent");
    setEmail("");
    setInviteOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-foreground text-2xl font-semibold">
          {board.title}
        </h1>
        <p className="text-muted-foreground text-sm">Role: {role}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex -space-x-2">
          {board.members.map((member) => (
            <div
              key={member.id}
              title={member.user?.name || member.user?.email || "Member"}
              className="border-background rounded-full border-2"
            >
              <UserAvatar
                name={member.user?.name || member.user?.email || "Member"}
                imageURL={member.user?.image || null}
              />
            </div>
          ))}
        </div>

        <BoardManagementDialog
          board={board}
          currentUserRole={role}
          canManage={canManage}
        />

        {canManage && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Invite</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={submitInvite}>
                <DialogHeader>
                  <DialogTitle>Invite member</DialogTitle>
                  <DialogDescription>
                    Add someone to this board with a specific role.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="invite-email">Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="person@example.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="invite-role">Role</Label>
                    <select
                      id="invite-role"
                      value={inviteRole}
                      onChange={(e) =>
                        setInviteRole(e.target.value as BoardRole)
                      }
                      className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                    >
                      <option value={BoardRole.MANAGER}>Manager</option>
                      <option value={BoardRole.MEMBER}>Member</option>
                      <option value={BoardRole.VIEWER}>Viewer</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isInviting}>
                    {isInviting ? "Inviting..." : "Send invite"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

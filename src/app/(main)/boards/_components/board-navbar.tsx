"use client";

import { BoardRole, BoardType } from "@prisma/client";
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
import { useEffect, useRef, useState, useTransition } from "react";
import { inviteBoardMember, updateBoard } from "@/lib/actions/board-actions";
import { toast } from "sonner";
import { BoardManagementDialog } from "./dialog/board-management-dialog";
import { Badge } from "@/components/ui/badge";
import { Globe, Lock, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState(board.title);
  const [boardType, setBoardType] = useState<BoardType>(board.type);
  const [isSaving, startSaving] = useTransition();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBoardTitle(board.title);
    setBoardType(board.type);
  }, [board.title, board.type]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const commitTitleEdit = () => {
    const next = boardTitle.trim();
    if (!next) {
      setBoardTitle(board.title);
      setIsEditingTitle(false);
      return;
    }
    if (next === board.title) {
      setIsEditingTitle(false);
      return;
    }
    setIsEditingTitle(false);
    startSaving(async () => {
      const res = await updateBoard(board.id, { title: next });
      if (res?.error) {
        toast.error(res.error);
        setBoardTitle(board.title);
      } else {
        toast.success("Board title updated");
      }
    });
  };

  const handleTypeChange = (newType: string) => {
    const type = newType as BoardType;
    const prev = boardType;
    setBoardType(type);
    startSaving(async () => {
      const res = await updateBoard(board.id, { type });
      if (res?.error) {
        toast.error(res.error);
        setBoardType(prev);
      } else {
        toast.success(`Board is now ${type.toLowerCase()}`);
      }
    });
  };

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
      <div className="flex items-center gap-3">
        <div>
          {canManage && isEditingTitle ? (
            <Input
              ref={titleInputRef}
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value.slice(0, 100))}
              onBlur={commitTitleEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitleEdit();
                if (e.key === "Escape") {
                  setBoardTitle(board.title);
                  setIsEditingTitle(false);
                }
              }}
              disabled={isSaving}
              maxLength={100}
              className="text-foreground focus:border-primary h-auto border-transparent bg-transparent px-1 text-2xl font-semibold outline-none"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-foreground text-2xl font-semibold">
                {boardTitle}
              </h1>
              {canManage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsEditingTitle(true)}
                  title="Edit board title"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
          <div className="mt-1 flex items-center gap-2">
            <p className="text-muted-foreground text-sm">Role: {role}</p>
            {canManage ? (
              <Select
                value={boardType}
                onValueChange={handleTypeChange}
                disabled={isSaving}
              >
                <SelectTrigger className="h-6 w-[110px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BoardType.PRIVATE}>
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-3 w-3" /> Private
                    </span>
                  </SelectItem>
                  <SelectItem value={BoardType.PUBLIC}>
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3 w-3" /> Public
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="text-xs">
                {boardType === BoardType.PUBLIC ? (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Public
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Private
                  </span>
                )}
              </Badge>
            )}
          </div>
        </div>
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
                    <Select
                      value={inviteRole}
                      onValueChange={(value) =>
                        setInviteRole(value as BoardRole)
                      }
                    >
                      <SelectTrigger id="invite-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BoardRole.MANAGER}>
                          Manager
                        </SelectItem>
                        <SelectItem value={BoardRole.MEMBER}>Member</SelectItem>
                        <SelectItem value={BoardRole.VIEWER}>Viewer</SelectItem>
                      </SelectContent>
                    </Select>
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

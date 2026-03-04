"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { acceptInvite, declineInvite } from "@/lib/actions/invite-actions";
import { Check, X, Mail } from "lucide-react";

interface Invite {
  id: string;
  role: string;
  board: { id: string; title: string };
  invitedBy: { name: string; email: string };
  createdAt: string | Date;
}

export function BoardInvites({ invites: initial }: { invites: Invite[] }) {
  const [invites, setInvites] = useState(initial);
  const [pending, setPending] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (invites.length === 0) return null;

  const handleAccept = (id: string) => {
    setPending(id);
    startTransition(async () => {
      const res = await acceptInvite(id);
      setPending(null);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Invite accepted! You've been added to the board.");
      setInvites((prev) => prev.filter((i) => i.id !== id));
    });
  };

  const handleDecline = (id: string) => {
    setPending(id);
    startTransition(async () => {
      const res = await declineInvite(id);
      setPending(null);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Invite declined");
      setInvites((prev) => prev.filter((i) => i.id !== id));
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <CardTitle>Board Invites</CardTitle>
          <Badge variant="secondary">{invites.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between gap-3 rounded-md border p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium">{invite.board.title}</p>
              <p className="text-muted-foreground text-sm">
                Invited by {invite.invitedBy.name || invite.invitedBy.email} as{" "}
                <Badge variant="outline" className="ml-1 text-xs">
                  {invite.role.toLowerCase()}
                </Badge>
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                onClick={() => handleAccept(invite.id)}
                disabled={pending === invite.id}
              >
                <Check className="mr-1 h-4 w-4" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(invite.id)}
                disabled={pending === invite.id}
              >
                <X className="mr-1 h-4 w-4" />
                Decline
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { BoardWithDetails } from "@/types/database";
import { BoardRole } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Activity, Users } from "lucide-react";
import ActivityPanel from "../activity-panel";
import MembersPanel from "../members-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BoardManagementDialogProps {
  board: BoardWithDetails;
  currentUserRole: BoardRole;
  canManage: boolean;
}

export function BoardManagementDialog({
  board,
  currentUserRole,
  canManage,
}: BoardManagementDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("activity");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title="Board management"
          className="h-10 w-10"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Board Management</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-4">
            <ActivityPanel activities={board.activities} />
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            <MembersPanel
              board={board}
              currentUserRole={currentUserRole}
              canManage={canManage}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

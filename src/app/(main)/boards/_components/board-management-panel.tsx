"use client";

import { useState } from "react";
import { BoardWithDetails } from "@/types/database";
import { BoardRole } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivityPanel from "./activity-panel";
import MembersPanel from "./members-panel";
import { Activity, Users } from "lucide-react";

export default function BoardManagementPanel({
  board,
  currentUserRole,
  canManage,
}: {
  board: BoardWithDetails;
  currentUserRole: BoardRole;
  canManage: boolean;
}) {
  const [activeTab, setActiveTab] = useState("activity");

  return (
    <div className="bg-card mt-6 w-full rounded-lg border p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
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
    </div>
  );
}

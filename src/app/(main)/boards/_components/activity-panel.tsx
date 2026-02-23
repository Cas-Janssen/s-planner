import { ActivityWithUser } from "@/types/database";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function ActivityPanel({
  activities,
}: {
  activities: ActivityWithUser[];
}) {
  const [filter, setFilter] = useState<string>("all");

  const activityTypeMap: Record<string, string> = {
    CREATED_BOARD: "board",
    UPDATED_BOARD: "board",
    DELETED_BOARD: "board",
    CREATED_COLUMN: "column",
    UPDATED_COLUMN: "column",
    DELETED_COLUMN: "column",
    MOVED_COLUMN: "column",
    CREATED_TASK: "task",
    UPDATED_TASK: "task",
    DELETED_TASK: "task",
    MOVED_TASK: "task",
    INVITED_MEMBER: "member",
    UPDATED_DEADLINE: "task",
    UPDATED_ASSIGNEES: "task",
  };

  const filtered =
    filter === "all"
      ? activities
      : activities.filter(
          (a) => activityTypeMap[a.type] === filter || a.type === filter,
        );

  if (!activities.length) {
    return (
      <div className="text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm">
        No activity yet. Start creating tasks and collaborating!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium">Filter:</label>
        <div className="flex flex-wrap gap-1">
          {["all", "board", "column", "task", "member"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="max-h-[600px] space-y-3 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm">
            No {filter} activities found.
          </div>
        ) : (
          filtered.map((activity) => {
            const typeLabel = activity.type
              .split("_")
              .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
              .join(" ");

            return (
              <div
                key={activity.id}
                className="space-y-1 rounded-md border p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-foreground font-medium">
                      {activity.user?.name || "Unknown user"}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {activity.message || typeLabel.toLowerCase()}
                    </div>
                  </div>
                  <div className="text-muted-foreground text-xs whitespace-nowrap">
                    {formatTimestamp(new Date(activity.createdAt))}
                  </div>
                </div>
                {activity.metadata && (
                  <details className="text-muted-foreground cursor-pointer text-xs">
                    <summary className="hover:text-foreground">Details</summary>
                    <pre className="bg-muted mt-1 overflow-x-auto rounded p-2 text-xs">
                      {JSON.stringify(activity.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

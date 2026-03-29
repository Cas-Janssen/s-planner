import { ActivityWithUser } from "@/types/database";
import { formatTimestamp } from "@/lib/utils";

export default function ActivityFeed({
  activities,
}: {
  activities: ActivityWithUser[];
}) {
  if (!activities.length) {
    return (
      <div className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-md border p-4">
      <h3 className="text-sm font-semibold">Activity</h3>
      <div className="mt-3 space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="text-muted-foreground text-sm">
            <div className="text-foreground">
              <span className="font-medium">
                {activity.user?.name || "Unknown user"}
              </span>{" "}
              {activity.message ||
                activity.type.replace(/_/g, " ").toLowerCase()}
            </div>
            <div className="text-muted-foreground text-xs">
              {formatTimestamp(new Date(activity.createdAt))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

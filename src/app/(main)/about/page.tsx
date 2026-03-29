import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function AboutPage() {
  return (
    <main className="flex justify-center p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>About This Planner App</CardTitle>
          <CardDescription>
            A simple, focused planner to help you organize tasks, manage boards,
            and collaborate in real time.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-muted rounded-md p-4 text-sm">
              ✅ Drag-and-drop task management
            </div>
            <div className="bg-muted rounded-md p-4 text-sm">
              🧩 Customizable boards &amp; columns
            </div>
            <div className="bg-muted rounded-md p-4 text-sm">
              ⚡ Real-time updates and activity feed
            </div>
            <div className="bg-muted rounded-md p-4 text-sm">
              🔒 Authentication and user profiles
            </div>
          </div>

          <p className="text-muted-foreground mt-4 text-sm">
            My goal is to provide a seamless, intuitive experience so you can
            focus on what matters: getting things done. Thanks for using the
            planner — made by Cas (student).
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

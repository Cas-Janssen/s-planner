import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Users, List, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Organize Your Projects,
          <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {" "}
            Achieve Your Goals
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg md:text-xl">
          The ultimate project management tool for students. Collaborate with
          your team, track your progress, and get things done—all in one place.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="min-w-[200px]">
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-w-[200px]">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
          Everything you need to stay organized
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <List className="text-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Kanban Boards</h3>
              <p className="text-muted-foreground text-sm">
                Visualize your workflow with intuitive drag-and-drop boards
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <Users className="text-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Team Collaboration</h3>
              <p className="text-muted-foreground text-sm">
                Work together seamlessly with real-time updates and
                notifications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <CheckCircle2 className="text-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Task Management</h3>
              <p className="text-muted-foreground text-sm">
                Track deadlines, assign tasks, and monitor completion status
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <BarChart3 className="text-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Activity Tracking</h3>
              <p className="text-muted-foreground text-sm">
                Stay informed with detailed activity logs and progress insights
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-primary/5 mx-auto mt-20 max-w-4xl rounded-lg p-8 text-center md:p-12">
        <h2 className="text-3xl font-bold md:text-4xl">
          Ready to boost your productivity?
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
          Join thousands of students organizing their projects and achieving
          their goals
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/sign-up">Start Your Journey Today</Link>
        </Button>
      </div>
    </div>
  );
}

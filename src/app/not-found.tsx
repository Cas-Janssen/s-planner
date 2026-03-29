import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="from-background via-background to-muted/20 flex min-h-screen items-center justify-center bg-linear-to-br px-4">
      <div className="max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="from-primary to-primary/60 animate-pulse bg-linear-to-r bg-clip-text text-8xl font-bold text-transparent">
            404
          </h1>
          <div className="from-primary to-primary/40 mx-auto h-1 w-20 rounded-full bg-linear-to-r"></div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-bold">Page Not Found</h2>
          <p className="text-muted-foreground text-lg">
            The page you're looking for doesn't exist or has been moved. Let's
            get you back on track.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/boards">View Boards</Link>
          </Button>
        </div>

        <div className="pt-8">
          <div className="bg-muted/30 border-border/50 relative h-24 overflow-hidden rounded-lg border">
            <div className="via-primary/10 animate-shimmer absolute inset-0 bg-linear-to-r from-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

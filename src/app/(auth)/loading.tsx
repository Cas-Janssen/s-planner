import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingAuthComponents() {
  return (
    <div
      className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center p-4"
      aria-busy="true"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            <Skeleton className="h-6 w-24" />
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            <Skeleton className="h-4 w-40" />
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="flex w-full flex-col items-center justify-between gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex w-full justify-center border-t pt-4">
            <Skeleton className="h-4 w-64" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

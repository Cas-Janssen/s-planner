import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function BoardLoadingSkeleton() {
  const columnColors = ["bg-gray-700", "bg-blue-900/80", "bg-purple-900/80"];

  return (
    <div className="flex w-full grow flex-col">
      <div className="mx-auto w-full max-w-screen-2xl px-4">
        <div className="grid grid-cols-[1fr,auto] items-center gap-4 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex w-[95vw] grow flex-row overflow-x-auto">
        <ScrollArea className="flex w-auto grow rounded-md whitespace-nowrap">
          <div className="mx-auto flex w-fit flex-row pr-2">
            {columnColors.map((color, i) => (
              <div
                key={i}
                className={`group relative m-2 w-xs self-start overflow-hidden rounded-lg ${color}`}
              >
                <div className="grid grid-rows-[auto,1fr,auto]">
                  <div className="grid grid-cols-[1fr,auto] items-start gap-2 px-2 py-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <Skeleton className="mt-1 h-5 w-32 bg-slate-300/20" />
                      <Skeleton className="h-6 w-8 rounded-full bg-purple-600/50" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8 bg-slate-300/20" />
                      <Skeleton className="h-8 w-8 bg-slate-300/20" />
                    </div>
                  </div>

                  <div className="min-w-0 overflow-y-auto px-2 pb-2">
                    <div className="max-h-[55vh] min-h-[100px] space-y-2 md:max-h-[65vh]">
                      {[1, 2, 3].map((j) => (
                        <div
                          key={j}
                          className="bg-card hover:border-border m-2 w-auto min-w-0 cursor-pointer rounded-md border border-transparent px-3 py-3 shadow-sm transition-colors"
                        >
                          <Skeleton className="mb-2 h-4 w-full" />
                          <Skeleton className="mb-2 h-4 w-3/4" />

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-4 w-10" />
                          </div>

                          <div className="mt-2 flex -space-x-2">
                            <Skeleton className="border-background h-7 w-7 rounded-full border-2" />
                            <Skeleton className="border-background h-7 w-7 rounded-full border-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-700 p-2">
                    <Skeleton className="h-9 w-full bg-slate-300/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="pointer-events-auto absolute right-4 bottom-4">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

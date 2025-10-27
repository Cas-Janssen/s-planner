import { ColumnWithTasks } from "@/types/database";
import { Button } from "@/components/ui/button";
import { ChevronsLeftRight } from "lucide-react";

export default function CollapsedColumn({
  column,
  onToggle,
  disabled,
}: {
  column: ColumnWithTasks;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="w-8r relative m-2 h-full min-h-0 overflow-hidden rounded-lg bg-black">
      <div
        className="m-1 mt-2 flex flex-row items-center gap-2 text-center text-slate-200 select-none"
        style={{ writingMode: "vertical-rl" }}
      >
        <span
          className="overflow-hidden font-bold whitespace-nowrap"
          style={{
            maxInlineSize: "25rem",
            textOverflow: "ellipsis",
            lineHeight: 1.1,
          }}
          title={column.title}
          aria-label={column.title}
        >
          {column.title}
        </span>
        <span className="inline-block rounded-full bg-purple-600 px-2 py-1 text-xs font-semibold text-white">
          {column.tasks.length}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          disabled={disabled}
          aria-label="Expand column"
          className="inline-flex"
        >
          <ChevronsLeftRight className="h-4 w-4 text-gray-400" />
        </Button>
      </div>
    </div>
  );
}

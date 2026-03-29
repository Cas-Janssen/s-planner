import { ColumnWithTasks } from "@/types/database";
import { Button } from "@/components/ui/button";
import { ChevronsLeftRight } from "lucide-react";
import { COLUMN_COLOR_MAP } from "@/lib/constants";

export default function CollapsedColumn({
  column,
  onToggle,
  disabled,
  canEdit,
}: {
  column: ColumnWithTasks;
  onToggle: () => void;
  disabled?: boolean;
  canEdit: boolean;
}) {
  const bgColor = COLUMN_COLOR_MAP[column.color] || "bg-gray-700";

  return (
    <div
      className={`relative m-2 w-10 shrink-0 self-start overflow-hidden rounded-lg ${bgColor}`}
    >
      <div
        className="flex items-center gap-2 p-2 text-center text-slate-200 select-none"
        style={{ writingMode: "vertical-rl" }}
      >
        <span
          className="overflow-hidden font-bold whitespace-nowrap"
          style={{
            maxInlineSize: "18rem",
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
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            disabled={disabled}
            aria-label="Expand column"
            className="inline-flex"
            data-no-dnd
          >
            <ChevronsLeftRight className="h-4 w-4 text-gray-400" />
          </Button>
        )}
      </div>
    </div>
  );
}

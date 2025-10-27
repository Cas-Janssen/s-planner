import { Button } from "@/components/ui/button";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";

export default function EditColumnDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Ellipsis className="h-4 w-4 text-gray-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Column Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>Move Column</DropdownMenuItem>
          <DropdownMenuItem>Add task</DropdownMenuItem>
          <DropdownMenuItem>Copy all tasks</DropdownMenuItem>
          <DropdownMenuItem>Change Color</DropdownMenuItem>
          <DropdownMenuItem>Duplicate Column</DropdownMenuItem>
          <DropdownMenuItem>Remove Column</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

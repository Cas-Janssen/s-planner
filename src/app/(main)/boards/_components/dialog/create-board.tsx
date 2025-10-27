"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBoard } from "@/lib/actions/board-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusIcon, CheckIcon, LockIcon, GlobeIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BoardType } from "@prisma/client";

type Template = "trello" | "kanban" | "custom";

const templates = [
  {
    id: "trello" as Template,
    name: "Trello Board",
    description: "Simple 3-column board",
    columns: ["To Do", "In Progress", "Done"],
  },
  {
    id: "kanban" as Template,
    name: "Kanban Board",
    description: "Full workflow with 5 columns",
    columns: ["Backlog", "To Do", "In Progress", "Review", "Done"],
  },
  {
    id: "custom" as Template,
    name: "Blank Board",
    description: "Start with an empty board and add your own columns",
    columns: [],
  },
];

const boardTypes = [
  {
    value: BoardType.PRIVATE,
    label: "Private",
    description: "Only invited members can access",
    icon: LockIcon,
  },
  {
    value: BoardType.PUBLIC,
    label: "Public",
    description: "Anyone with the link can view",
    icon: GlobeIcon,
  },
];

export function CreateBoardDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"template" | "details">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<Template>("trello");
  const [boardTitle, setBoardTitle] = useState("");
  const [boardType, setBoardType] = useState<BoardType>(BoardType.PRIVATE);
  const router = useRouter();

  function handleTemplateSelect(template: Template) {
    setSelectedTemplate(template);
    setStep("details");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", boardTitle);
    formData.append("template", selectedTemplate);
    formData.append("type", boardType);

    const result = await createBoard(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success && result?.boardId) {
      setOpen(false);
      resetForm();
      router.push(`/boards/${result.boardId}`);
    }
  }

  function resetForm() {
    setStep("template");
    setSelectedTemplate("trello");
    setBoardTitle("");
    setBoardType(BoardType.PRIVATE);
    setError(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Create Board
        </Button>
      </DialogTrigger>
      <DialogContent>
        {step === "template" ? (
          <div className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Choose a Template</DialogTitle>
              <DialogDescription>
                Select a template to get started quickly
              </DialogDescription>
            </DialogHeader>
            <ScrollArea>
              <div className="grid gap-3 sm:gap-4 py-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    {template.columns.length > 0 && (
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          {template.columns.map((col) => (
                            <div
                              key={col}
                              className="px-2 sm:px-3 py-1 bg-secondary rounded-md text-xs sm:text-sm"
                            >
                              {col}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <DialogHeader className="px-4 sm:px-6 pt-6">
              <DialogTitle>Board Details</DialogTitle>
              <DialogDescription>
                {templates.find((t) => t.id === selectedTemplate)?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 px-4 sm:px-6 py-4 overflow-y-auto">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Board Name</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="My Project Board"
                    value={boardTitle}
                    onChange={(e) => setBoardTitle(e.target.value)}
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Board Visibility</Label>
                  <div className="grid gap-2">
                    {boardTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <Card
                          key={type.value}
                          className={`cursor-pointer transition-all ${
                            boardType === type.value
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => setBoardType(type.value)}
                        >
                          <CardHeader className="p-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-md ${
                                  boardType === type.value
                                    ? "bg-primary/10"
                                    : "bg-secondary"
                                }`}
                              >
                                <Icon
                                  className={`h-4 w-4 ${
                                    boardType === type.value
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-sm font-medium">
                                    {type.label}
                                  </CardTitle>
                                  {boardType === type.value && (
                                    <CheckIcon className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                                <CardDescription className="text-xs mt-1">
                                  {type.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {selectedTemplate !== "custom" && (
                  <div className="grid gap-2">
                    <Label>Columns Preview</Label>
                    <div className="flex gap-2 flex-wrap">
                      {templates
                        .find((t) => t.id === selectedTemplate)
                        ?.columns.map((col) => (
                          <div
                            key={col}
                            className="px-2 sm:px-3 py-1 bg-secondary rounded-md text-xs sm:text-sm flex items-center gap-1"
                          >
                            <CheckIcon className="h-3 w-3" />
                            {col}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {selectedTemplate === "custom" && (
                  <div className="grid gap-2">
                    <Label>Info</Label>
                    <p className="text-sm text-muted-foreground">
                      Your board will be created empty. You can add columns
                      after creation.
                    </p>
                  </div>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </div>
            <DialogFooter className="px-4 sm:px-6 pb-6 flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("template")}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                {loading ? "Creating..." : "Create Board"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

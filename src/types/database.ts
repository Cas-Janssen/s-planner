import { Prisma } from "@prisma/client";

export type Task = Prisma.TaskGetPayload<{}>;

export type Column = Prisma.ColumnGetPayload<{}>;

export type ColumnWithTasks = Prisma.ColumnGetPayload<{
  include: {
    tasks: true;
  };
}>;

export type BoardWithDetails = Prisma.BoardGetPayload<{
  include: {
    columns: {
      include: {
        tasks: true;
      };
    };
  };
}>;

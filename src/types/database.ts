import { Prisma } from "@prisma/client";

export type Task = Prisma.TaskGetPayload<{}>;

export type TaskWithMembers = Prisma.TaskGetPayload<{
  include: {
    members: true;
  };
}>;

export type Column = Prisma.ColumnGetPayload<{}>;

export type ColumnWithTasks = Prisma.ColumnGetPayload<{
  include: {
    tasks: {
      include: {
        members: true;
      };
    };
  };
}>;

export type BoardMemberWithUser = Prisma.BoardMemberGetPayload<{
  include: {
    user: true;
  };
}>;

export type ActivityWithUser = Prisma.ActivityGetPayload<{
  include: {
    user: true;
  };
}>;

export type BoardWithDetails = Prisma.BoardGetPayload<{
  include: {
    columns: {
      include: {
        tasks: {
          include: {
            members: true;
          };
        };
      };
    };
    members: {
      include: {
        user: true;
      };
    };
    activities: {
      include: {
        user: true;
      };
    };
  };
}>;

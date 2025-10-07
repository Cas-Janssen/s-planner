import { Prisma } from "@prisma/client";

export type BoardWithDetails = Prisma.BoardGetPayload<{
  include: {
    columns: {
      include: {
        tasks: true;
      };
    };
  };
}>;

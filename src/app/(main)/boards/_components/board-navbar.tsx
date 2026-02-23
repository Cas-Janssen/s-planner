import { Board } from "@prisma/client";

export default function BoardNavbar({ board }: { board: Board }) {
  return (
    <>
      <div>{board.title}</div>
    </>
  );
}

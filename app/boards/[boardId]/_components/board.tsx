import { Board, Column, Task } from "@prisma/client";

interface BoardContainerProps {
  readonly data: Board & {
    readonly columns: (Column & {
      readonly tasks: Task[];
    })[];
  };
}

export default function BoardContainer({ data }: BoardContainerProps) {
  return (
    <div>
      <h2>{data.title}</h2>
      <p>Board ID: {data.id}</p>
      <p>Created: {data.createdAt.toLocaleDateString()}</p>
      <div>
        <div>
          <h3>Columns ({data.columns.length})</h3>
          {data.columns.map((column) => (
            <div
              key={column.id}
              style={{
                border: "1px solid #ccc",
                margin: "10px",
                padding: "10px",
              }}
            >
              <h4>{column.title}</h4>
              <p>Tasks: {column.tasks.length}</p>
              <ul>
                {column.tasks.map((task) => (
                  <li key={task.id}>
                    <strong>{task.title}</strong>
                    {task.description && <p>{task.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

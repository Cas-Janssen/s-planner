import { BoardWithDetails } from "@/prisma/prismaTypes";

export default function BoardContainer({
  data,
}: {
  readonly data: BoardWithDetails;
}) {
  return (
    <div className="p-5 max-w-6xl mx-auto pb-15">
      <div className="mb-8 border-b-2 border-gray-200 pb-5">
        <h2 className="text-3xl font-bold text-gray-800 mb-2.5">
          {data.title}
        </h2>
        <p className="text-gray-600 text-sm my-1.5">Board ID: {data.id}</p>
        <p className="text-gray-600 text-sm my-1.5">
          Created: {data.createdAt.toLocaleDateString()}
        </p>
      </div>

      <div className="mt-5">
        <h3 className="text-2xl text-gray-800 mb-5">
          Columns ({data.columns.length})
        </h3>
        <div className="flex gap-5 flex-wrap">
          {data.columns.map((column) => (
            <div
              key={column.id}
              className="border border-gray-400 rounded-lg p-4 bg-gray-50 min-w-[300px] flex-1 shadow-sm"
            >
              <h4 className="text-xl text-gray-800 mb-2.5 border-b border-gray-300 pb-1.5">
                {column.title}
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                Tasks: {column.tasks.length}
              </p>
              <ul className="list-none p-0 m-0">
                {column.tasks.map((task, index) => (
                  <li
                    key={task.id}
                    className={`bg-white border border-gray-300 rounded-md p-3 shadow-sm ${
                      index !== column.tasks.length - 1 ? "mb-2.5" : ""
                    }`}
                  >
                    <strong className="text-gray-800 text-base block mb-1.5">
                      {task.title}
                    </strong>
                    {task.description && (
                      <p className="text-gray-600 text-sm mt-2 leading-5">
                        {task.description}
                      </p>
                    )}
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

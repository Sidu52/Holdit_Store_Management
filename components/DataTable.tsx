import React from "react";
import { AlertCircle } from "lucide-react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
}

export function DataTable<T>({ columns, data, isLoading, error }: DataTableProps<T>) {
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in">
        <AlertCircle className="w-5 h-5" />
        <p className="font-medium text-sm">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
        <div className="h-12 bg-gray-50 border-b border-gray-200" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b border-gray-100 last:border-0" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-gray-200 text-gray-500 shadow-sm text-sm">
        No records found.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50/80 text-gray-600 uppercase text-xs font-semibold border-b border-gray-200">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  {typeof col.accessor === "function"
                    ? col.accessor(row)
                    // @ts-ignore
                    : String(row[col.accessor] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

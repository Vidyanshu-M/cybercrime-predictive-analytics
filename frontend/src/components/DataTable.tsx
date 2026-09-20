import React from 'react';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No records found.'
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center text-slate-400 text-xs">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-slate-800/80">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-cyber-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-cyber-800/40 transition-colors group">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-4 py-3 font-normal ${col.className || ''}`}>
                    {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey] ?? '') : null)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

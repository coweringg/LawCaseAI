import React from 'react'

interface TableColumn<T> {
  key: keyof T
  title: string
  render?: (value: any, item: T, index: number) => React.ReactNode
  className?: string
}

interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className = ''
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-white/5">
        <thead>
          <tr className="border-b border-white/5">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ${
                  column.className || ''
                }`}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-white/[0.02] transition-colors group">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-slate-300 group-hover:text-white transition-colors ${
                    column.className || ''
                  }`}
                >
                  {column.render
                    ? column.render(item[column.key], item, index)
                    : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

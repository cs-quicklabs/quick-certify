import React from 'react';
import { TableHeader } from './table-header';

export interface TableColumn<T = unknown> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  /**
   * Flex utility class(es) applied to each cell when `responsive` mode is on.
   * Defaults to `flex-1 min-w-0` for all but the last column, which uses `shrink-0`.
   */
  flexClass?: string;
}

export interface TableProps<T = unknown> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  className?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  onRowClick?: (item: T, index: number) => void;
  scrollable?: boolean;
  /** Viewport-relative max height used when `scrollable` is true. Defaults to `50svh`. */
  maxHeight?: string;
  /**
   * When true, renders a flex-based layout instead of an HTML table.
   * Column headers are hidden on mobile and shown on `sm+` screens.
   * Works well for simple listing pages (e.g. settings).
   */
  responsive?: boolean;
}

export function Table<T = unknown>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...',
  className = '',
  rowClassName = '',
  onRowClick,
  scrollable = false,
  maxHeight = '50svh',
  responsive = false,
}: TableProps<T>) {
  const getRowClassName = (item: T, index: number): string => {
    const base = 'hover:bg-gray-100';
    const custom = typeof rowClassName === 'function' ? rowClassName(item, index) : rowClassName;
    const clickable = onRowClick ? 'cursor-pointer' : '';
    return `${base} ${custom} ${clickable}`.trim();
  };

  /* ─── Responsive flex layout ─── */
  if (responsive) {
    const scrollClass = scrollable ? `overflow-y-auto` : '';
    const heightStyle = scrollable ? { maxHeight } : undefined;

    if (isLoading) {
      return <div className="text-center py-8 text-gray-500">{loadingMessage}</div>;
    }

    if (data.length === 0) {
      return <p className="text-sm text-gray-500">{emptyMessage}</p>;
    }

    return (
      <div
        className={`border border-gray-200 rounded-sm overflow-hidden flex flex-col ${className}`}
      >
        {/* Header row — hidden on mobile */}
        <div
          className={`hidden sm:grid bg-gray-50 border-b border-gray-200 shrink-0`}
          style={{ gridTemplateColumns: columns.map(() => 'auto').join(' ') }}
        >
          {columns.map((col, i) => (
            <div
              key={col.key}
              className={`px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                i === columns.length - 1 ? 'text-right' : ''
              } ${col.headerClassName ?? ''}`}
            >
              {col.header}
            </div>
          ))}
        </div>

        {/* Scrollable rows */}
        <div className={scrollClass} style={heightStyle}>
          {data.map((item, index) => {
            const evenOdd = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            const custom =
              typeof rowClassName === 'function' ? rowClassName(item, index) : rowClassName;
            const clickable = onRowClick ? 'cursor-pointer' : '';

            return (
              <div
                key={index}
                className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 ${evenOdd} ${custom} ${clickable}`}
                onClick={() => onRowClick?.(item, index)}
              >
                {columns.map((col, colIndex) => {
                  const defaultFlex =
                    col.flexClass ??
                    (colIndex === columns.length - 1 ? 'shrink-0' : 'flex-1 min-w-0');

                  return (
                    <div key={col.key} className={`${defaultFlex} ${col.className ?? ''}`}>
                      {col.render
                        ? col.render(item, index)
                        : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ─── Standard HTML table layout ─── */
  return (
    <div className="w-full text-sm text-left text-gray-500">
      <div className={`overflow-hidden ${className}`}>
        <div
          className={scrollable ? 'overflow-y-auto' : 'overflow-x-auto'}
          style={scrollable ? { maxHeight } : undefined}
        >
          <table className="w-full text-sm text-left text-gray-500">
            <thead
              className={`text-xs font-semibold text-gray-700 uppercase bg-gray-50 ${
                scrollable ? 'sticky top-0 z-10' : ''
              }`}
            >
              <tr>
                {columns.map((column) => (
                  <TableHeader
                    key={column.key}
                    className={`px-6 py-3.5 ${column.headerClassName || ''}`}
                  >
                    {column.header}
                  </TableHeader>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                    {loadingMessage && (
                      <p className="mt-2 text-sm text-gray-500">{loadingMessage}</p>
                    )}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={index}
                    className={getRowClassName(item, index)}
                    onClick={() => onRowClick?.(item, index)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-3.5 whitespace-nowrap ${column.className || ''}`}
                      >
                        {column.render
                          ? column.render(item, index)
                          : ((item as Record<string, unknown>)[column.key] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

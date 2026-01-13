import React from 'react';
import { TableHeader } from './table-header';

export interface TableColumn<T = unknown> {
    key: string;
    header: string;
    render?: (item: T, index: number) => React.ReactNode;
    className?: string;
    headerClassName?: string;
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
}

/**
 * Generic Table Component
 *
 * A reusable table component that can be used across the application
 * Supports custom column rendering, loading states, and empty states
 */
export function Table<T = unknown>({
    columns,
    data,
    isLoading = false,
    emptyMessage = 'No data available',
    loadingMessage = 'Loading...',
    className = '',
    rowClassName = '',
    onRowClick,
}: TableProps<T>) {
    const getRowClassName = (item: T, index: number): string => {
        const baseClasses = 'border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700';
        const customClasses = typeof rowClassName === 'function' ? rowClassName(item, index) : rowClassName;
        const clickableClass = onRowClick ? 'cursor-pointer' : '';
        return `${baseClasses} ${customClasses} ${clickableClass}`.trim();
    };

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        {columns.map((column) => (
                            <TableHeader key={column.key} className={column.headerClassName}>
                                {column.header}
                            </TableHeader>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
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
                                        className={`px-4 py-1.5 whitespace-nowrap ${column.className || ''}`}
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
    );
}


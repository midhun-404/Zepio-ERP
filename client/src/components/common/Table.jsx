import React from 'react';

export const Table = ({ headers, children }) => {
    return (
        <div className="w-full overflow-auto rounded-lg border border-border bg-white shadow-sm">
            <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-gray-50/50">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                    {children}
                </tbody>
            </table>
        </div>
    );
};

export const TableRow = ({ children, className = '' }) => (
    <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>
        {children}
    </tr>
);

export const TableCell = ({ children, className = '' }) => (
    <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>
        {children}
    </td>
);

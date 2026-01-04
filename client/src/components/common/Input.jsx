import React from 'react';

export const Input = ({
    label,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-secondary mb-1">
                    {label}
                </label>
            )}
            <input
                className={`flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-danger focus-visible:ring-danger' : 'border-border'
                    }`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-danger">{error}</p>
            )}
        </div>
    );
};

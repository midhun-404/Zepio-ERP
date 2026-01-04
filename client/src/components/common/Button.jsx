import React from 'react';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-white border border-border text-primary hover:bg-gray-100',
        accent: 'bg-accent text-white hover:bg-accent/90',
        danger: 'bg-danger text-white hover:bg-danger/90',
        ghost: 'hover:bg-gray-100 text-secondary'
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-8 text-base'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

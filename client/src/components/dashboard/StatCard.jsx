import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, color, loading, trend }) => (
    <div className="card p-6 bg-white border border-border flex flex-col justify-between h-full">
        <div>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted">{title}</p>
                <div className={`p-2 rounded-full ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            {loading ? (
                <div className="h-8 w-24 bg-gray-100 animate-pulse rounded mt-2"></div>
            ) : (
                <h3 className="text-2xl font-bold mt-2 text-primary">{value}</h3>
            )}
        </div>
        <div className="mt-4">
            <p className="text-xs text-muted font-medium">{subtext}</p>
            {trend && <p className="text-xs text-green-600 font-bold mt-1">{trend}</p>}
        </div>
    </div>
);

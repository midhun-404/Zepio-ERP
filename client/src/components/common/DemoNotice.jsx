import React from 'react';

const DemoNotice = () => {
    return (
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs sm:text-sm font-medium py-2 px-4 text-center shadow-sm relative z-[9999]">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs uppercase tracking-wider border border-white/10">
                    Demo Mode
                </span>
                <span className="opacity-95">
                    You are viewing a demonstration version. Data modifications are temporary.
                </span>
            </div>
        </div>
    );
};

export default DemoNotice;

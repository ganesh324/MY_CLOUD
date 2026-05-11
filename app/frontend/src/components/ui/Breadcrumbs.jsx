import React from 'react';
import { ChevronRight, HardDrive } from 'lucide-react';

export default function Breadcrumbs({ path, onNavigate }) {
    const MOUNT = '/mnt/Drive1';
    const displayPath = (path || '').replace(MOUNT, '').replace(/^\//, '');
    const parts = displayPath ? displayPath.split('/').filter(Boolean) : [];

    return (
        <nav className="flex items-center gap-1.5 text-xs font-bold text-slate-400 flex-wrap">
            {/* Drive root */}
            <button
                onClick={() => onNavigate(MOUNT)}
                className="flex items-center gap-1.5 hover:text-blue-600 transition-colors group"
            >
                <div className="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <HardDrive size={11} />
                </div>
                <span>Drive1</span>
            </button>

            {/* Path segments */}
            {parts.map((part, i) => {
                const fullPath = MOUNT + '/' + parts.slice(0, i + 1).join('/');
                const isLast = i === parts.length - 1;
                return (
                    <React.Fragment key={i}>
                        <ChevronRight size={12} className="text-slate-300" />
                        <button
                            onClick={() => onNavigate(fullPath)}
                            className={`hover:text-blue-600 transition-colors max-w-[160px] truncate ${isLast ? 'text-slate-700' : ''}`}
                            title={part}
                        >
                            {part}
                        </button>
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ path, onNavigate }) {
    const parts = path ? path.split('/') : [];
    return (
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <button onClick={() => onNavigate("")} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <Home size={14} /> <span>Root</span>
            </button>
            {parts.map((part, i) => (
                <React.Fragment key={i}>
                    <ChevronRight size={12} />
                    <button onClick={() => onNavigate(parts.slice(0, i + 1).join('/'))} className="hover:text-blue-600">
                        {part}
                    </button>
                </React.Fragment>
            ))}
        </nav>
    );
}
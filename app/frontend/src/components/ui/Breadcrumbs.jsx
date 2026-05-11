import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ path, onNavigate }) {
    const displayPath = (path || '').replace('/mnt/Drive1', '').replace(/^\//, '');
    const parts = displayPath ? displayPath.split('/') : [];
    
    return (
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <button onClick={() => onNavigate("/mnt/Drive1")} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <Home size={14} /> <span>Root</span>
            </button>
            {parts.map((part, i) => {
                if (!part) return null;
                const fullPath = '/mnt/Drive1/' + parts.slice(0, i + 1).join('/');
                return (
                    <React.Fragment key={i}>
                        <ChevronRight size={12} />
                        <button onClick={() => onNavigate(fullPath)} className="hover:text-blue-600">
                            {part}
                        </button>
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
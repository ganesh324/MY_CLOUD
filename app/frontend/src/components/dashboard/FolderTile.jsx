import React from 'react';
import { Folder } from 'lucide-react';

export default function FolderTile({ name, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-105 transition-all group w-full aspect-square"
        >
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-4">
                <Folder size={48} fill="currentColor" fillOpacity={0.2} />
            </div>
            <span className="font-bold text-slate-700 truncate w-full text-center px-2">
                {name}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                Directory
            </span>
        </button>
    );
}
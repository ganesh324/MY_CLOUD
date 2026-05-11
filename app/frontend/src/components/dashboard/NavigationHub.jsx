import React from 'react';
import { HardDrive, FolderHeart, MoreHorizontal } from 'lucide-react';

export default function NavigationHub() {
    const favorites = [
        { name: 'Family Photos', path: 'photos/family' },
        { name: 'Work Docs', path: 'work/projects' },
        { name: 'Movie Library', path: 'media/movies' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Pinned Drive */}
            <div className="p-5 rounded-2xl border bg-blue-600 border-blue-600 shadow-lg shadow-blue-100 flex items-center gap-4 cursor-pointer">
                <div className="p-3 rounded-xl bg-blue-500 text-white">
                    <HardDrive size={24} />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="font-bold truncate text-sm text-white">Main Drive</span>
                    <span className="text-[10px] uppercase font-bold tracking-tight text-blue-100">1.4TB Seagate</span>
                </div>
            </div>

            {/* Favorite Folders */}
            {favorites.map((fav) => (
                <div key={fav.path} className="p-5 rounded-2xl border bg-white border-slate-200 hover:border-blue-300 shadow-sm flex items-center gap-4 cursor-pointer transition-all group">
                    <div className="p-3 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <FolderHeart size={24} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-bold truncate text-sm text-slate-800">{fav.name}</span>
                        <span className="text-[10px] uppercase font-bold tracking-tight text-slate-400">Favorite</span>
                    </div>
                </div>
            ))}

            {/* More Button */}
            <button className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
                <MoreHorizontal size={24} />
                <span className="text-[10px] font-bold mt-1 uppercase">More</span>
            </button>
        </div>
    );
}
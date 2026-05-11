import React from 'react';

export default function StatTile({ label, count, color, icon }) {
    const colors = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        rose: "text-rose-600 bg-rose-50 border-rose-100",
        purple: "text-purple-600 bg-purple-50 border-purple-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    };

    return (
        <div className="p-5 rounded-2xl border bg-white shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${colors[color]}`}>{icon}</div>
                <span className="text-2xl font-black text-slate-800">{count.toLocaleString()}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        </div>
    );
}
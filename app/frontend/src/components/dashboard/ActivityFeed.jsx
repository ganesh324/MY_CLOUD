import React from 'react';
import { File, Folder, MoreVertical } from 'lucide-react';

export default function ActivityFeed({ files, loading, onNavigate }) {
    if (loading) return <div className="p-12 text-center text-slate-400 font-bold animate-pulse">Scanning Drive...</div>;

    return (
        <table className="w-full text-left">
            <tbody className="divide-y divide-slate-50">
                {files.map((file) => (
                    <tr
                        key={file.id}
                        onClick={() => file.is_directory && onNavigate(file.filename)}
                        className="group hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <td className="px-8 py-5 flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${file.is_directory ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                {file.is_directory ? <Folder size={18} /> : <File size={18} />}
                            </div>
                            <span className="font-bold text-slate-700 text-sm">{file.filename}</span>
                        </td>
                        <td className="px-8 py-5 text-right">
                            <button className="p-2 text-slate-300 hover:text-slate-600"><MoreVertical size={16} /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
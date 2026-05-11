import React from 'react';
import { File, Folder, MoreVertical } from 'lucide-react';

export default function ActivityFeed({ files = [], loading, onNavigate, apiUrl }) {
    if (loading) return <div className="p-12 text-center text-slate-400 font-bold animate-pulse">Scanning Drive...</div>;

    const isPreviewable = (file) => {
        if (!file || !file.extension) return false;
        const imgExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
        const vidExts = ["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm"];
        return imgExts.includes(file.extension.toLowerCase()) || vidExts.includes(file.extension.toLowerCase());
    };

    return (
        <table className="w-full text-left">
            <tbody className="divide-y divide-slate-50">
                {files && files.map((file) => (
                    <tr
                        key={file.id}
                        onClick={() => file.is_directory && onNavigate(file.path)}
                        className="group hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <td className="px-8 py-5 flex items-center gap-4">
                            <div className={`p-0 overflow-hidden rounded-xl w-10 h-10 flex items-center justify-center ${file.is_directory ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                {file.is_directory ? (
                                    <Folder size={18} />
                                ) : isPreviewable(file) ? (
                                    <img 
                                        src={`${apiUrl}/thumbnails/${file.id}`} 
                                        alt="" 
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                ) : (
                                    <File size={18} />
                                )}
                                <div style={{ display: 'none' }}>
                                    <File size={18} />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-700 text-sm">{file.filename}</span>
                                {!file.is_directory && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{file.extension}</span>}
                            </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                            <button className="p-2 text-slate-300 hover:text-slate-600" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
                {(!files || files.length === 0) && (
                    <tr>
                        <td colSpan="2" className="px-8 py-12 text-center text-slate-400 text-sm font-medium">
                            No items found
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
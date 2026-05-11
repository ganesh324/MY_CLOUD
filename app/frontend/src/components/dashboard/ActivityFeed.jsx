import React, { useState, useRef, useEffect } from 'react';
import { File, Folder, Star, MoreVertical, Trash2, Pencil } from 'lucide-react';

function ContextMenu({ x, y, file, onClose, onDelete, onRename, onToggleFavorite }) {
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    return (
        <div
            ref={ref}
            style={{ position: 'fixed', top: y, left: x, zIndex: 1000 }}
            className="bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200 py-2 min-w-[180px]"
        >
            <button
                onClick={() => { onToggleFavorite(file); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
                <Star size={15} className={file.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'} />
                {file.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
            <button
                onClick={() => { onRename(file); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
                <Pencil size={15} className="text-slate-400" />
                Rename
            </button>
            <div className="my-1 border-t border-slate-50" />
            <button
                onClick={() => { onDelete(file); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
                <Trash2 size={15} />
                Delete
            </button>
        </div>
    );
}

export default function ActivityFeed({ files = [], loading, onNavigate, onRefresh, apiUrl, viewMode = 'list' }) {
    const [contextMenu, setContextMenu] = useState(null);

    if (loading) return <div className="p-12 text-center text-slate-400 font-bold animate-pulse">Scanning Drive...</div>;

    const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
    const VIDEO_EXTS = ["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm"];

    const isPreviewable = (file) => {
        if (!file?.extension) return false;
        return [...IMAGE_EXTS, ...VIDEO_EXTS].includes(file.extension.toLowerCase());
    };

    const handleContextMenu = (e, file) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, file });
    };

    const handleToggleFavorite = async (file) => {
        const formData = new FormData();
        formData.append('path', file.path);
        try {
            await fetch(`${apiUrl}/files/favorite`, { method: 'POST', body: formData });
            if (onRefresh) onRefresh();
        } catch (err) { console.error('Favorite toggle failed', err); }
    };

    const handleDelete = async (file) => {
        const label = file.is_directory ? 'folder' : 'file';
        if (!window.confirm(`⚠️ Delete "${file.name}"?\n\nThis will permanently delete this ${label}${file.is_directory ? ' and ALL its contents' : ''} from the drive.`)) return;
        try {
            const res = await fetch(`${apiUrl}/files/delete?path=${encodeURIComponent(file.path)}`, { method: 'DELETE' });
            if (res.ok) { if (onRefresh) onRefresh(); }
            else { const err = await res.json(); alert(`Error: ${err.detail}`); }
        } catch (err) { console.error('Delete failed', err); }
    };

    const handleRename = async (file) => {
        const newName = window.prompt(`Rename "${file.name}" to:`, file.name);
        if (!newName || newName === file.name) return;
        const formData = new FormData();
        formData.append('path', file.path);
        formData.append('new_name', newName);
        try {
            const res = await fetch(`${apiUrl}/files/rename`, { method: 'POST', body: formData });
            if (res.ok) { if (onRefresh) onRefresh(); }
            else { const err = await res.json(); alert(`Error: ${err.detail}`); }
        } catch (err) { console.error('Rename failed', err); }
    };

    const empty = (
        <div className="p-12 text-center text-slate-400 text-sm font-medium">No items found</div>
    );

    // ─── GRID VIEW ─────────────────────────────────────────────────────────────
    if (viewMode === 'grid') {
        if (!files || files.length === 0) return empty;
        return (
            <>
                {contextMenu && (
                    <ContextMenu x={contextMenu.x} y={contextMenu.y} file={contextMenu.file}
                        onClose={() => setContextMenu(null)} onDelete={handleDelete}
                        onRename={handleRename} onToggleFavorite={handleToggleFavorite} />
                )}
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            onClick={() => file.is_directory && onNavigate && onNavigate(file.path)}
                            onContextMenu={(e) => handleContextMenu(e, file)}
                            className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all ${file.is_directory ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            {/* Thumbnail / Icon */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 ${file.is_directory ? 'bg-blue-50' : 'bg-slate-100'}`}>
                                {file.is_directory ? (
                                    <Folder size={32} className="text-blue-500" />
                                ) : isPreviewable(file) ? (
                                    <>
                                        <img
                                            src={`${apiUrl}/thumbnails/${file.id}`}
                                            alt=""
                                            className="w-full h-full object-cover rounded-2xl"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                        />
                                        <div style={{ display: 'none' }} className="w-full h-full items-center justify-center">
                                            <File size={28} className="text-slate-400" />
                                        </div>
                                    </>
                                ) : (
                                    <File size={28} className="text-slate-400" />
                                )}
                            </div>

                            {/* Name */}
                            <span className="text-xs font-semibold text-slate-600 text-center truncate w-full" title={file.name}>
                                {file.name}
                            </span>

                            {/* Action buttons — top-right overlay on hover */}
                            <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(file); }}
                                    className={`p-1 rounded-lg transition-all hover:bg-amber-50 ${file.is_favorite ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}
                                >
                                    <Star size={13} className={file.is_favorite ? 'fill-amber-400' : ''} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleContextMenu(e, file); }}
                                    className="p-1 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    <MoreVertical size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    }

    // ─── LIST VIEW ─────────────────────────────────────────────────────────────
    return (
        <>
            {contextMenu && (
                <ContextMenu x={contextMenu.x} y={contextMenu.y} file={contextMenu.file}
                    onClose={() => setContextMenu(null)} onDelete={handleDelete}
                    onRename={handleRename} onToggleFavorite={handleToggleFavorite} />
            )}
            <table className="w-full text-left">
                <tbody className="divide-y divide-slate-50">
                    {files && files.map((file) => (
                        <tr
                            key={file.id}
                            onClick={() => file.is_directory && onNavigate && onNavigate(file.path)}
                            onContextMenu={(e) => handleContextMenu(e, file)}
                            className={`group hover:bg-slate-50 transition-all ${file.is_directory ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            <td className="px-8 py-4 flex items-center gap-4">
                                <div className={`overflow-hidden rounded-xl w-10 h-10 flex-shrink-0 flex items-center justify-center ${file.is_directory ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {file.is_directory ? (
                                        <Folder size={18} />
                                    ) : isPreviewable(file) ? (
                                        <>
                                            <img
                                                src={`${apiUrl}/thumbnails/${file.id}`}
                                                alt=""
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                            />
                                            <div style={{ display: 'none' }} className="w-full h-full items-center justify-center">
                                                <File size={18} />
                                            </div>
                                        </>
                                    ) : (
                                        <File size={18} />
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-slate-700 text-sm truncate">{file.name}</span>
                                    {!file.is_directory && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{file.extension}</span>}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(file); }}
                                        className={`p-2 rounded-xl transition-all hover:bg-amber-50 ${file.is_favorite ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}
                                    >
                                        <Star size={16} className={file.is_favorite ? 'fill-amber-400' : ''} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleContextMenu(e, file); }}
                                        className="p-2 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {(!files || files.length === 0) && (
                        <tr><td colSpan="2">{empty}</td></tr>
                    )}
                </tbody>
            </table>
        </>
    );
}
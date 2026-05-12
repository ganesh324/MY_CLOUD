import React, { useRef } from 'react';
import { Search, Plus, User, Menu, ShieldCheck } from 'lucide-react';
import API_URL, { STORAGE_ROOT } from '../../config';

async function readErrorDetail(res) {
    try {
        const j = await res.json();
        return typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail ?? j);
    } catch {
        return res.statusText || `HTTP ${res.status}`;
    }
}

export default function Header({ username, currentPath, onRefresh, onSearch }) {
    const fileInputRef = useRef(null);

    const handleSearch = async (e) => {
        const q = e.target.value;
        if (!q || q.length < 2) {
            if (!q || q.length === 0) onSearch(null);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/search?q=${q}`);
            const data = await res.json();
            onSearch(data);
        } catch (err) {
            console.error("Search failed", err);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', currentPath || STORAGE_ROOT);

        try {
            const res = await fetch(`${API_URL}/files/upload`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) {
                alert(await readErrorDetail(res));
                return;
            }
            onRefresh();
        } catch (err) {
            console.error("Upload failed", err);
            alert(err?.message || 'Upload failed');
        }
    };

    const handleNewFolder = async () => {
        const name = window.prompt("Enter folder name:");
        if (!name) return;

        const formData = new FormData();
        formData.append('name', name);
        formData.append('path', currentPath || STORAGE_ROOT);

        try {
            const res = await fetch(`${API_URL}/files/mkdir`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) {
                alert(await readErrorDetail(res));
                return;
            }
            onRefresh();
        } catch (err) {
            console.error("Mkdir failed", err);
            alert(err?.message || 'Could not create folder (check API URL and that the backend is running)');
        }
    };

    return (
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-8 gap-8">
            <div className="flex items-center gap-3 min-w-max">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <ShieldCheck size={24} />
                </div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight hidden lg:block">eeti<span className="text-blue-600">cloud</span></h1>
            </div>

            <div className="relative flex-1 group max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search your drive..."
                    onChange={handleSearch}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
                />
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                        title="Upload File"
                    >
                        <Plus size={20} />
                        <span className="hidden xl:inline text-xs font-bold">Upload</span>
                    </button>
                    
                    <button 
                        onClick={handleNewFolder}
                        className="bg-slate-800 hover:bg-black text-white p-3 rounded-2xl transition-all shadow-lg shadow-slate-100 flex items-center gap-2"
                        title="New Folder"
                    >
                        <Plus size={20} className="rotate-45" />
                        <span className="hidden xl:inline text-xs font-bold">New Folder</span>
                    </button>
                </div>

                <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-800">{username}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
                        <User size={20} />
                    </div>
                </div>

                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Menu size={24} />
                </button>
            </div>
        </header>
    );
}
import { Search, Plus, User, Menu, ShieldCheck } from 'lucide-react';

export default function Header({ username, onLogout }) {
    return (
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-8 gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3 min-w-max">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <ShieldCheck size={24} />
                </div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight hidden lg:block">eeti<span className="text-blue-600">cloud</span></h1>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 group max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search your drive..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-100 transition-all"
                />
            </div>

            {/* Actions & User */}
            <div className="flex items-center gap-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl transition-all shadow-lg shadow-blue-100">
                    <Plus size={20} />
                </button>

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
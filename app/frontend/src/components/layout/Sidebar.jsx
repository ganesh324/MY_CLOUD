import { Home, FolderOpen, Star, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar({ isOpen, onToggle, currentMenu, onMenuChange, stats }) {
    const menuItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'all', icon: FolderOpen, label: 'All Files' },
        { id: 'favorites', icon: Star, label: 'Favorites' },
        { id: 'shared', icon: Share2, label: 'Shared' },
    ];

    // Storage Calculations
    const capacity = stats?.capacity_bytes || 1.4 * 1024 * 1024 * 1024 * 1024;
    const totalUsed = stats?.total_size || 0;
    const imgUsed = stats?.image_size || 0;
    const vidUsed = stats?.video_size || 0;
    const musUsed = stats?.music_size || 0;
    const otherUsed = Math.max(0, totalUsed - (imgUsed + vidUsed + musUsed));
    
    const usedPercent = Math.min(100, (totalUsed / capacity) * 100);
    const circumference = 126; // Approx for semi-circle
    
    const getDash = (bytes) => (bytes / capacity) * circumference;
    
    const imgDash = getDash(imgUsed);
    const vidDash = getDash(vidUsed);
    const musDash = getDash(musUsed);
    const otherDash = getDash(otherUsed);

    return (
        <aside className={`bg-white border-r border-slate-100 flex flex-col transition-all duration-300 relative ${isOpen ? 'w-72' : 'w-20'}`}>
            {/* Collapse Toggle */}
            <button 
                onClick={onToggle}
                className="absolute -right-3 top-8 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 shadow-sm z-10 transition-colors"
            >
                {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            <div className="flex-1 mt-8 space-y-2 px-4">
                {menuItems.map((item) => (
                    <button 
                        key={item.id} 
                        onClick={() => onMenuChange(item.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${currentMenu === item.id ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                    >
                        <item.icon size={20} />
                        {isOpen && <span className="font-bold text-sm">{item.label}</span>}
                    </button>
                ))}
            </div>

            {/* Storage Stats */}
            <div className="p-6">
                <div className={`bg-slate-50 rounded-[2rem] border border-slate-100 transition-all ${isOpen ? 'p-6' : 'p-2'}`}>
                    {isOpen ? (
                        <div className="flex flex-col items-center">
                            <div className="relative w-40 h-24 mb-4 overflow-hidden">
                                <svg viewBox="0 0 100 50" className="w-full h-full">
                                    {/* Base (Empty/Gray) */}
                                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                                    
                                    {/* Category Segments */}
                                    {/* Images */}
                                    <path 
                                        d="M 10 50 A 40 40 0 0 1 90 50" 
                                        fill="none" stroke="#4c6ef5" strokeWidth="12"
                                        strokeDasharray={`${imgDash} ${circumference}`}
                                    />
                                    {/* Videos */}
                                    <path 
                                        d="M 10 50 A 40 40 0 0 1 90 50" 
                                        fill="none" stroke="#339af0" strokeWidth="12"
                                        strokeDasharray={`${vidDash} ${circumference}`}
                                        transform={`rotate(${(imgUsed / capacity) * 180}, 50, 50)`}
                                    />
                                    {/* Music */}
                                    <path 
                                        d="M 10 50 A 40 40 0 0 1 90 50" 
                                        fill="none" stroke="#20c997" strokeWidth="12"
                                        strokeDasharray={`${musDash} ${circumference}`}
                                        transform={`rotate(${((imgUsed + vidUsed) / capacity) * 180}, 50, 50)`}
                                    />
                                    {/* Others */}
                                    <path 
                                        d="M 10 50 A 40 40 0 0 1 90 50" 
                                        fill="none" stroke="#f76707" strokeWidth="12"
                                        strokeDasharray={`${otherDash} ${circumference}`}
                                        transform={`rotate(${((imgUsed + vidUsed + musUsed) / capacity) * 180}, 50, 50)`}
                                    />

                                    {/* Needle */}
                                    <g transform={`rotate(${ usedPercent * 1.8 - 90 }, 50, 50)`} className="transition-transform duration-1000 ease-in-out">
                                        <line x1="50" y1="50" x2="50" y2="15" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="50" cy="50" r="3" fill="#1e293b" />
                                    </g>
                                </svg>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                    <span className="text-xl font-black text-slate-800">{Math.round(usedPercent)}%</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Storage Distribution</p>
                                <div className="flex flex-wrap justify-center gap-2 mt-2">
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#4c6ef5] rounded-full"></div><span className="text-[8px] font-bold text-slate-500">Images</span></div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#339af0] rounded-full"></div><span className="text-[8px] font-bold text-slate-500">Videos</span></div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#20c997] rounded-full"></div><span className="text-[8px] font-bold text-slate-500">Music</span></div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#f76707] rounded-full"></div><span className="text-[8px] font-bold text-slate-500">Others</span></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                             <div className="w-1.5 h-8 bg-white rounded-full overflow-hidden relative shadow-sm">
                                <div className="absolute bottom-0 w-full bg-blue-600" style={{ height: `${usedPercent}%` }}></div>
                             </div>
                             <span className="text-[8px] font-black text-slate-400">{Math.round(usedPercent)}%</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
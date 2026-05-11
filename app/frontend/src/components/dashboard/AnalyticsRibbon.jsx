import { Image, Video, FileText, Folder, Music, MoreVertical } from 'lucide-react';

export default function AnalyticsRibbon({ stats, onCategorySelect }) {
    const categories = [
        { id: 'Images', label: 'Images', icon: Image, bg: 'bg-blue-600', count: stats.images || 0 },
        { id: 'Videos', label: 'Videos', icon: Video, bg: 'bg-indigo-500', count: stats.videos || 0 },
        { id: 'Music', label: 'Music', icon: Music, bg: 'bg-emerald-500', count: stats.music || 0 },
        { id: 'Files', label: 'Files', icon: FileText, bg: 'bg-orange-500', count: stats.files || 0 },
        { id: 'Folders', label: 'Folders', icon: Folder, bg: 'bg-teal-600', count: stats.folders || 0 },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map((cat) => (
                <div 
                    key={cat.id} 
                    onClick={() => onCategorySelect(cat.id)}
                    className={`${cat.bg} p-6 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer text-white relative min-h-[160px] flex flex-col justify-between`}
                >
                    {/* Top Section */}
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <cat.icon size={20} />
                        </div>
                        <MoreVertical size={18} className="text-white/60" />
                    </div>

                    {/* Bottom Section */}
                    <div className="mt-8">
                        <h3 className="text-xl font-bold">{cat.label}</h3>
                        <p className="text-xs font-medium text-white/80 mt-1">{cat.count.toLocaleString()} files</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
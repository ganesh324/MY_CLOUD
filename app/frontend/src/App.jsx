import React, { useState, useEffect } from 'react';
import API_URL from './config';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AnalyticsRibbon from './components/dashboard/AnalyticsRibbon';
import ActivityFeed from './components/dashboard/ActivityFeed';
import Breadcrumbs from './components/ui/Breadcrumbs';

export default function App() {
  const [currentPath, setCurrentPath] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentMenu, setCurrentMenu] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState({ recent_files: [], favorite_folders: [], stats: {} });
  const [explorerFiles, setExplorerFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/load`);
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  };

  const fetchExplorer = async () => {
    if (currentMenu === "home" && !activeCategory) {
      setCurrentPath("");
      return;
    }

    setLoading(true);
    const categoryParam = activeCategory ? `&category=${activeCategory}` : "";
    const pathParam = currentPath ? `path=${currentPath}` : "path=";
    
    try {
      const res = await fetch(`${API_URL}/files?${pathParam}${categoryParam}`);
      const data = await res.json();
      setExplorerFiles(data);
    } catch (err) {
      console.error("Explorer fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchExplorer();
  }, [currentPath, activeCategory, currentMenu]);

  const handleSearch = (results) => {
    if (!results) {
      setCurrentMenu("home");
      fetchData();
      return;
    }
    setExplorerFiles(results);
    setCurrentMenu("search");
  };

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    setCurrentMenu("all");
    if (currentPath === "") setCurrentPath("");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        currentMenu={currentMenu}
        onMenuChange={(menu) => {
          setCurrentMenu(menu);
          setActiveCategory(null);
          if (menu === "home") setCurrentPath("");
        }}
        stats={dashboardData.stats}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          username="Ganesh" 
          currentPath={currentPath} 
          onRefresh={fetchData}
          onSearch={handleSearch}
        />

        <main className="flex-1 overflow-y-auto p-8 space-y-12">
          
          {/* BREADCRUMBS (Only show when not on home) */}
          {(currentPath !== "" || activeCategory) && (
            <div className="flex items-center justify-between">
              <Breadcrumbs path={currentPath} onNavigate={setCurrentPath} />
              {activeCategory && (
                <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-blue-100">
                  Filtering by {activeCategory}
                  <button onClick={() => setActiveCategory(null)} className="hover:text-blue-200 ml-1">×</button>
                </div>
              )}
            </div>
          )}

          {/* DASHBOARD VIEW (HOME) */}
          {currentMenu === "home" && !activeCategory && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Overview</h3>
                <button 
                  onClick={() => {
                    fetch(`${API_URL}/dashboard/load`)
                      .then(res => res.json())
                      .then(data => setDashboardData(data));
                  }}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 flex items-center gap-1"
                >
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                  Refresh Live Stats
                </button>
              </div>
              
              <AnalyticsRibbon stats={dashboardData.stats} onCategorySelect={handleCategorySelect} />

              <section className="mt-12">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Favorite Folders</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {dashboardData.favorite_folders.map(folder => (
                    <button key={folder.path} onClick={() => { setCurrentPath(folder.path); setCurrentMenu("all"); }} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center group">
                      <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{folder.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="mt-12">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Recent Activity</h3>
                <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                  <ActivityFeed files={dashboardData.recent_files} apiUrl={API_URL} />
                </div>
              </section>
            </>
          )}

          {/* EXPLORER / ALL FILES VIEW */}
          {(currentMenu !== "home" || activeCategory) && (
            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                 <span className="font-bold text-slate-800">
                    {currentMenu === 'search' ? 'Search Results' : currentMenu === 'favorites' ? 'Favorite Items' : currentMenu === 'shared' ? 'Shared with Me' : `Contents of ${currentPath || 'Root'}`}
                 </span>
              </div>
              <ActivityFeed
                files={explorerFiles}
                loading={loading}
                apiUrl={API_URL}
                onNavigate={(path) => {
                  setCurrentPath(path);
                  setCurrentMenu("all");
                }}
              />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
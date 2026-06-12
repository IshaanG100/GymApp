import { Activity, Dumbbell, LayoutDashboard, Camera, History as HistoryIcon } from 'lucide-react';

export function Layout({ children, currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'dashboard', icon: <LayoutDashboard size={22} strokeWidth={2.5} /> },
    { id: 'history', icon: <HistoryIcon size={22} strokeWidth={2.5} /> },
    { id: 'workout', icon: <Dumbbell size={22} strokeWidth={2.5} /> },
    { id: 'physio', icon: <Activity size={22} strokeWidth={2.5} /> },
    { id: 'gallery', icon: <Camera size={22} strokeWidth={2.5} /> }
  ];

  return (
    <div className="app-container">
      <main className="main-content">
        {children}
      </main>
      
      <nav className="floating-pill-nav">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`nav-pill-btn ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => setCurrentTab(tab.id)}
          >
            {tab.icon}
          </button>
        ))}
      </nav>
    </div>
  );
}

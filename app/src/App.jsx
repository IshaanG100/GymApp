import { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkoutLogger from './pages/WorkoutLogger';
import PhysioTracker from './pages/PhysioTracker';
import ProgressCharts from './pages/ProgressCharts';
import History from './pages/History';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const { loading } = useData();

  if (loading) {
    return <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {currentTab === 'dashboard' && <Dashboard />}
      {currentTab === 'history' && <History />}
      {currentTab === 'workout' && <WorkoutLogger />}
      {currentTab === 'physio' && <PhysioTracker />}
      {currentTab === 'gallery' && <ProgressCharts />}
    </Layout>
  );
}

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;

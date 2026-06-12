import { createContext, useContext, useState, useEffect } from 'react';
import * as db from '../lib/db';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [physioLogs, setPhysioLogs] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const wLogs = await db.getWorkoutLogs();
      const pLogs = await db.getPhysioLogs();
      const phs = await db.getPhotos();
      const stgs = await db.getSettings();
      setWorkoutLogs(wLogs);
      setPhysioLogs(pLogs);
      setPhotos(phs);
      setSettings(stgs);
      setLoading(false);
    }
    loadData();
  }, []);

  const addWorkout = async (log) => {
    const newLog = await db.addWorkoutLog(log);
    setWorkoutLogs(prev => {
      const next = [newLog, ...prev];
      return next.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  };

  const removeWorkoutLog = async (id) => {
    await db.deleteWorkoutLog(id);
    setWorkoutLogs(prev => prev.filter(log => log.id !== id));
  };

  const addPhysio = async (log) => {
    const newLog = await db.addPhysioLog(log);
    setPhysioLogs(prev => {
      const next = [newLog, ...prev];
      return next.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  };

  const removePhysioLog = async (id) => {
    await db.deletePhysioLog(id);
    setPhysioLogs(prev => prev.filter(log => log.id !== id));
  };

  const addPhoto = async (data) => {
    const newPhoto = await db.addPhoto(data);
    setPhotos(prev => {
      const next = [newPhoto, ...prev];
      return next.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  };

  const removePhoto = async (id) => {
    await db.deletePhoto(id);
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    await db.saveSettings(updated);
    setSettings(updated);
  };

  return (
    <DataContext.Provider value={{ 
      workoutLogs, 
      physioLogs, 
      photos,
      settings, 
      addWorkout, 
      removeWorkoutLog,
      addPhysio, 
      removePhysioLog,
      addPhoto,
      removePhoto,
      updateSettings,
      loading 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);

import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

// Initialize distinct stores
export const workoutLogsStore = localforage.createInstance({ name: 'GymApp', storeName: 'workout_logs' });
export const physioLogsStore = localforage.createInstance({ name: 'GymApp', storeName: 'physio_logs' });
export const settingsStore = localforage.createInstance({ name: 'GymApp', storeName: 'settings' });
export const photosStore = localforage.createInstance({ name: 'GymApp', storeName: 'progress_photos' });

// --- WORKOUT LOGS ---
export async function addWorkoutLog(logEntry) {
  const id = uuidv4();
  const entry = { ...logEntry, id, timestamp: Date.now() };
  await workoutLogsStore.setItem(id, entry);
  return entry;
}

export async function getWorkoutLogs() {
  const logs = [];
  await workoutLogsStore.iterate((value) => {
    logs.push(value);
  });
  return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function deleteWorkoutLog(id) {
  await workoutLogsStore.removeItem(id);
}

export async function deletePhysioLog(id) {
  await physioLogsStore.removeItem(id);
}

export async function getBestSet(exerciseName) {
  const logs = await getWorkoutLogs();
  const exerciseLogs = logs.filter(log => log.exercise === exerciseName);
  let bestSet = null;
  let maxWt = 0;
  let maxRepsForMaxWt = 0;
  for (const log of exerciseLogs) {
    for (let i = 1; i <= 6; i++) {
      if (log[`set${i}Wt`] && log[`set${i}Reps`] && log[`set${i}Wt`] !== 'BW') {
        const wt = parseFloat(log[`set${i}Wt`]);
        const reps = parseFloat(log[`set${i}Reps`]);
        if (wt > maxWt) {
          maxWt = wt;
          maxRepsForMaxWt = reps;
          bestSet = { wt, reps, vol: wt * reps };
        } else if (wt === maxWt && reps > maxRepsForMaxWt) {
          maxRepsForMaxWt = reps;
          bestSet = { wt, reps, vol: wt * reps };
        }
      }
    }
  }
  return bestSet;
}

export async function exportAllData() {
  const workouts = await getWorkoutLogs();
  const physio = await getPhysioLogs();
  return { workouts, physio };
}

// --- PHYSIO LOGS ---
export async function addPhysioLog(logEntry) {
  const id = uuidv4();
  const entry = { ...logEntry, id, timestamp: Date.now() };
  await physioLogsStore.setItem(id, entry);
  return entry;
}

export async function getPhysioLogs() {
  const logs = [];
  await physioLogsStore.iterate((value) => {
    logs.push(value);
  });
  return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// --- PROGRESS PHOTOS ---
export async function addPhoto(photoData) {
  const id = uuidv4();
  const entry = { id, dataUrl: photoData.dataUrl, notes: photoData.notes, date: new Date().toISOString() };
  await photosStore.setItem(id, entry);
  return entry;
}

export async function getPhotos() {
  const photos = [];
  await photosStore.iterate((value) => {
    photos.push(value);
  });
  return photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function deletePhoto(id) {
  await photosStore.removeItem(id);
}

// --- SETTINGS ---
export async function saveSettings(settings) {
  await settingsStore.setItem('user_settings', settings);
}

export async function getSettings() {
  const defaultSettings = { theme: 'dark' };
  const settings = await settingsStore.getItem('user_settings');
  return settings || defaultSettings;
}

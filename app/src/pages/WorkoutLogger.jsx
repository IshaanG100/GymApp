import { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { WORKOUT_ROUTINES } from '../data/seed';
import * as db from '../lib/db';
import { ChevronLeft, Play, Plus, Minus, Timer } from 'lucide-react';

export default function WorkoutLogger() {
  const { addWorkout } = useData();
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  
  if (!selectedRoutine) {
    return (
      <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
        <header style={{ marginBottom: '28px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '4px' }}>Today's Training ⚡️</p>
          <h1 style={{ fontSize: '2.8rem', lineHeight: 1.1 }}>Programs 🏆</h1>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {WORKOUT_ROUTINES.map(routine => (
            <div 
              key={routine.id} 
              className={`vibrant-card card-${routine.theme}`}
              onClick={() => setSelectedRoutine(routine)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, opacity: 0.85, textTransform: 'uppercase' }}>
                    {routine.exercises.length} Exercises
                  </span>
                  <h2 style={{ fontSize: '2.5rem', marginTop: '4px' }}>{routine.sessionName}</h2>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play fill="currentColor" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <ActiveWorkout routine={selectedRoutine} onBack={() => setSelectedRoutine(null)} addWorkout={addWorkout} />;
}

// Confetti component
function Confetti() {
  const emojis = ['🎉', '🏆', '💪', '🔥', '⭐', '💥', '🎊'];
  const pieces = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    emoji: emojis[i % emojis.length],
    left: Math.random() * 100,
    delay: Math.random() * 2,
    size: 0.8 + Math.random() * 1.2
  })), []);

  return (
    <div className="confetti-container">
      {pieces.map(p => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, fontSize: `${p.size}rem` }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

function ActiveWorkout({ routine, onBack, addWorkout }) {
  const [exercisesData, setExercisesData] = useState([]);
  const [workoutState, setWorkoutState] = useState({});
  const [showBestSets, setShowBestSets] = useState({});
  const [sessionNotes, setSessionNotes] = useState('');

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Workout elapsed timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Rest timer
  const REST_DURATION = 120;
  const [restSeconds, setRestSeconds] = useState(0);
  const [restActive, setRestActive] = useState(false);

  useEffect(() => {
    if (!restActive || restSeconds <= 0) {
      if (restActive && restSeconds <= 0) {
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        // Send notification if app is in background
        if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
          new Notification('🔥 Rest Over!', {
            body: 'Time to hit your next set!',
            icon: '/icon-192.png',
            tag: 'rest-timer',
            requireInteraction: true
          });
        }
      }
      return;
    }
    const timeout = setTimeout(() => setRestSeconds(s => s - 1), 1000);
    return () => clearTimeout(timeout);
  }, [restActive, restSeconds]);

  const startRest = () => { setRestSeconds(REST_DURATION); setRestActive(true); };
  const skipRest = () => { setRestSeconds(0); setRestActive(false); };

  // PR celebration
  const [prList, setPrList] = useState(null);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleBestSet = (exName) => {
    setShowBestSets(prev => ({ ...prev, [exName]: !prev[exName] }));
  };

  useEffect(() => {
    async function fetchBestSets() {
      if (!routine || routine.exercises.length === 0) return;
      const data = await Promise.all(routine.exercises.map(async (ex) => {
        const bestSet = await db.getBestSet(ex.name);
        return { ...ex, bestSet };
      }));
      setExercisesData(data);

      const initialState = {};
      data.forEach(ex => {
        initialState[ex.name] = {
          notes: '',
          setsData: Array.from({ length: ex.sets }).map(() => ({ wt: '', reps: '' }))
        };
      });
      setWorkoutState(initialState);
    }
    fetchBestSets();
  }, [routine]);

  const updateSetData = (exName, setIndex, field, value) => {
    setWorkoutState(prev => {
      const exState = prev[exName];
      const newSets = [...exState.setsData];
      newSets[setIndex] = { ...newSets[setIndex], [field]: value };
      return { ...prev, [exName]: { ...exState, setsData: newSets } };
    });
  };

  const addSet = (exName) => {
    setWorkoutState(prev => {
      const exState = prev[exName];
      return { ...prev, [exName]: { ...exState, setsData: [...exState.setsData, { wt: '', reps: '' }] } };
    });
  };

  const removeSet = (exName) => {
    setWorkoutState(prev => {
      const exState = prev[exName];
      if (exState.setsData.length <= 1) return prev;
      return { ...prev, [exName]: { ...exState, setsData: exState.setsData.slice(0, -1) } };
    });
  };

  const handleFinishWorkout = async () => {
    if (!window.confirm("Finish this workout?")) return;

    let prs = [];

    for (const ex of exercisesData) {
      const exState = workoutState[ex.name];
      if (exState && exState.setsData.some(s => s.wt || s.reps)) {
        // Check for PR (based solely on weight, with reps breaking ties)
        let currentMaxWt = 0;
        let currentRepsForMaxWt = 0;
        exState.setsData.forEach(s => {
          if (s.wt && s.wt !== 'BW') {
            const wt = parseFloat(s.wt) || 0;
            const reps = parseFloat(s.reps) || 0;
            if (wt > currentMaxWt) {
              currentMaxWt = wt;
              currentRepsForMaxWt = reps;
            } else if (wt === currentMaxWt && reps > currentRepsForMaxWt) {
              currentRepsForMaxWt = reps;
            }
          }
        });

        if (ex.bestSet) {
          if (currentMaxWt > ex.bestSet.wt) {
            prs.push(ex.name);
          } else if (currentMaxWt === ex.bestSet.wt && currentRepsForMaxWt > ex.bestSet.reps) {
            prs.push(ex.name);
          }
        } else if (currentMaxWt > 0) {
          prs.push(ex.name);
        }

        const logEntry = {
          date: new Date().toISOString(),
          sessionName: routine.sessionName,
          exercise: ex.name,
          duration: elapsedSeconds,
          sessionNotes,
          notes: exState.notes
        };
        exState.setsData.forEach((s, i) => {
          if (s.wt || s.reps) {
            logEntry[`set${i+1}Wt`] = s.wt;
            logEntry[`set${i+1}Reps`] = s.reps;
          }
        });
        await addWorkout(logEntry);
      }
    }

    if (prs.length > 0) {
      setPrList(prs);
      setTimeout(() => onBack(), 3500);
    } else {
      onBack();
    }
  };

  if (Object.keys(workoutState).length === 0) return null;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
      {/* PR Celebration Overlay */}
      {prList && (
        <>
          <Confetti />
          <div className="pr-overlay" onClick={() => onBack()}>
            <h2 style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉</h2>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '24px', textAlign: 'center' }}>NEW PERSONAL RECORD!</h2>
            {prList.map(name => (
              <p key={name} style={{ fontSize: '1.25rem', color: 'var(--accent-color)', fontWeight: 700, marginBottom: '8px' }}>💪 {name}</p>
            ))}
            <p style={{ color: 'var(--text-muted)', marginTop: '24px', fontSize: '0.9rem' }}>Tap to continue</p>
          </div>
        </>
      )}

      {/* Rest Timer Bar */}
      {restActive && (
        <div className={`rest-timer-bar ${restSeconds <= 0 ? 'done' : ''}`}>
          <span>{restSeconds > 0 ? `⏱ ${formatTime(restSeconds)}` : '🔥 GO!'}</span>
          <button className="rest-skip-btn" onClick={skipRest}>
            {restSeconds > 0 ? 'Skip' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <ChevronLeft size={28} />
          </button>
          <h1 style={{ fontSize: '1.75rem' }}>{routine.sessionName}</h1>
        </div>
        <div className="workout-timer">
          <Timer size={16} /> {formatTime(elapsedSeconds)}
        </div>
      </header>

      {/* Exercise Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {exercisesData.map((ex) => (
          <div key={ex.name} className="glass-panel" style={{ padding: '16px 8px' }}>
            <div style={{ padding: '0 8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>{ex.name}</h3>
              {ex.bestSet && (
                <button 
                  onClick={() => toggleBestSet(ex.name)}
                  style={{ background: 'var(--surface-color-hover)', border: '1px solid var(--surface-border)', padding: '6px 12px', borderRadius: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}
                >
                  {showBestSets[ex.name] ? `🔥 Best: ${ex.bestSet.wt} × ${ex.bestSet.reps}` : '🏆 PR'}
                </button>
              )}
            </div>

            <table className="set-table">
              <thead>
                <tr>
                  <th>SET</th>
                  <th>LBS</th>
                  <th>REPS</th>
                </tr>
              </thead>
              <tbody>
                {workoutState[ex.name]?.setsData.map((set, i) => (
                  <tr key={i} className="set-row">
                    <td><div className="set-num">{i + 1}</div></td>
                    <td>
                      <input 
                        type="number" 
                        className="input-field" 
                        value={set.wt}
                        onChange={(e) => updateSetData(ex.name, i, 'wt', e.target.value)}
                        placeholder="-"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="input-field" 
                        value={set.reps}
                        onChange={(e) => updateSetData(ex.name, i, 'reps', e.target.value)}
                        placeholder="-"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add/Remove Set */}
            <div className="set-actions">
              <button className="set-action-btn" onClick={() => removeSet(ex.name)}><Minus size={16} /></button>
              <button className="set-action-btn" onClick={() => addSet(ex.name)}><Plus size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Session Notes */}
      <div className="glass-panel" style={{ marginTop: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Session Notes 📝</label>
        <textarea 
          className="input-field" 
          rows="3" 
          value={sessionNotes} 
          onChange={e => setSessionNotes(e.target.value)} 
          placeholder="How did you feel? Energy, mood, pump..."
          style={{ resize: 'none' }}
        />
      </div>

      {/* Rest Timer Button */}
      <button className="rest-start-btn" onClick={startRest}>
        <Timer size={18} /> Start Rest Timer ({REST_DURATION}s)
      </button>

      {/* Finish Button */}
      <div style={{ marginTop: '16px' }}>
        <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', background: 'var(--accent-color)', color: '#000', fontWeight: 700, borderRadius: '16px', border: 'none', cursor: 'pointer' }} onClick={handleFinishWorkout}>
          ✅ Finish Workout
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useData } from '../context/DataContext';
import { PHYSIO_EXERCISES } from '../data/seed';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';

export default function PhysioTracker() {
  const { physioLogs, addPhysio } = useData();
  const [formData, setFormData] = useState({
    duration: '',
    exercises: [],
    painLevel: 5,
    bodyArea: '',
    sets: '',
    notes: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExerciseToggle = (ex) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.includes(ex) 
        ? prev.exercises.filter(e => e !== ex)
        : [...prev.exercises, ex]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Save one log per exercise for proper History display
    for (const exercise of formData.exercises) {
      await addPhysio({
        date: new Date().toISOString(),
        exercise,
        painLevel: formData.painLevel,
        duration: formData.duration,
        bodyArea: formData.bodyArea,
        sets: formData.sets,
        notes: formData.notes
      });
    }
    // If no exercises selected, save as general session
    if (formData.exercises.length === 0) {
      await addPhysio({
        date: new Date().toISOString(),
        exercise: 'General Session',
        painLevel: formData.painLevel,
        duration: formData.duration,
        bodyArea: formData.bodyArea,
        sets: formData.sets,
        notes: formData.notes
      });
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setFormData({ duration: '', exercises: [], painLevel: 5, bodyArea: '', sets: '', notes: '' });
  };

  // Group recent logs by date for display
  const recentDates = [...new Set(physioLogs.map(l => format(new Date(l.date), 'yyyy-MM-dd')))].slice(0, 7);

  return (
    <div className="physio-tracker animate-fade-in" style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem' }}>Physio Tracker 🏥</h1>
        <p style={{ color: 'var(--text-muted)' }}>Log your rehabilitation sessions</p>
      </header>

      {showSuccess && (
        <div style={{ background: 'var(--accent-color)', color: '#000', padding: '14px 20px', borderRadius: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, animation: 'fadeIn 0.3s ease' }}>
          <CheckCircle size={20} /> Session Logged Successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
        <div style={{ background: 'linear-gradient(135deg, #FF2D55, #AF52DE)', borderRadius: '20px 20px 0 0', padding: '20px', color: '#fff' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>New Session ✨</h2>
          <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>Log your rehab work</p>
        </div>
        <div className="glass-panel" style={{ borderRadius: '0 0 20px 20px', marginTop: '-1px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Duration (mins)</label>
            <input required type="number" className="input-field" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Sets Completed</label>
            <input required type="number" className="input-field" value={formData.sets} onChange={e => setFormData({...formData, sets: e.target.value})} />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Body Area</label>
          <input required type="text" placeholder="e.g. Left Knee, Shoulder" className="input-field" value={formData.bodyArea} onChange={e => setFormData({...formData, bodyArea: e.target.value})} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Pain Level (1-10): <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{formData.painLevel}</span></label>
          <input 
            type="range" 
            min="1" max="10" 
            value={formData.painLevel} 
            onChange={e => setFormData({...formData, painLevel: e.target.value})} 
            style={{ width: '100%', accentColor: 'var(--primary-color)' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Exercises Done</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PHYSIO_EXERCISES.map(ex => (
              <button
                key={ex}
                type="button"
                style={{ 
                  cursor: 'pointer', 
                  border: '1px solid var(--surface-border)',
                  background: formData.exercises.includes(ex) ? 'var(--primary-color)' : 'var(--surface-inset)',
                  color: formData.exercises.includes(ex) ? 'white' : 'var(--text-primary)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleExerciseToggle(ex)}
              >
                {formData.exercises.includes(ex) ? '✓ ' : ''}{ex}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Notes</label>
          <textarea className="input-field" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>✅ Log Physio Session</button>
        </div>
      </form>

      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Recent History 📋</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentDates.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No physio sessions logged yet.</p>
          ) : recentDates.map(dateStr => {
            const logsForDate = physioLogs.filter(l => format(new Date(l.date), 'yyyy-MM-dd') === dateStr);
            return (
              <div key={dateStr} className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>{format(new Date(dateStr), 'dd MMM yyyy')}</strong>
                  <span className="badge badge-secondary" style={{ background: 'var(--primary-color)' }}>Pain: {logsForDate[0]?.painLevel}/10</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{logsForDate[0]?.duration} mins • {logsForDate[0]?.bodyArea}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {logsForDate.map(log => (
                    <span key={log.id} style={{ background: 'var(--surface-inset)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>{log.exercise}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

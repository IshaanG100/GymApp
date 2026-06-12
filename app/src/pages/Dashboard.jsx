import { useData } from '../context/DataContext';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import * as db from '../lib/db';
import { Download } from 'lucide-react';
import { useMemo } from 'react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '💪' };
  return { text: 'Good Evening', emoji: '🌙' };
}

export default function Dashboard() {
  const { workoutLogs, physioLogs, photos } = useData();
  const greeting = getGreeting();

  const today = new Date();
  const startOfWk = startOfWeek(today, { weekStartsOn: 1 });
  const endOfWk = endOfWeek(today, { weekStartsOn: 1 });
  
  const sessionsThisWeek = workoutLogs.filter(log => {
    const d = new Date(log.date);
    return d >= startOfWk && d <= endOfWk;
  });
  const uniqueDatesThisWeek = new Set(sessionsThisWeek.map(log => format(new Date(log.date), 'yyyy-MM-dd'))).size;

  const totalVolumeThisWeek = sessionsThisWeek.reduce((acc, log) => {
    let vol = 0;
    for (let i = 1; i <= 6; i++) {
      vol += (parseFloat(log[`set${i}Wt`]) || 0) * (parseInt(log[`set${i}Reps`]) || 0);
    }
    return acc + vol;
  }, 0);

  const physioThisWeek = physioLogs.filter(log => {
    const d = new Date(log.date);
    return d >= startOfWk && d <= endOfWk;
  });
  const uniquePhysioDates = new Set(physioThisWeek.map(log => format(new Date(log.date), 'yyyy-MM-dd'))).size;

  const dailyPhoto = useMemo(() => {
    if (photos.length === 0) return null;
    const dayIndex = today.getDate() % photos.length;
    return photos[dayIndex];
  }, [photos, today.getDate()]);

  const handleExport = async () => {
    const data = await db.exportAllData();
    const rows = ['Date,Session,Exercise,Set,Weight(lbs),Reps'];
    data.workouts.forEach(log => {
      for (let i = 1; i <= 6; i++) {
        if (log[`set${i}Wt`] || log[`set${i}Reps`]) {
          rows.push(`${format(new Date(log.date), 'yyyy-MM-dd')},${log.sessionName},${log.exercise},${i},${log[`set${i}Wt`] || ''},${log[`set${i}Reps`] || ''}`);
        }
      }
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gymapp_export_${format(today, 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const gymPct = Math.min((uniqueDatesThisWeek / 5) * 100, 100);
  const physioPct = Math.min((uniquePhysioDates / 4) * 100, 100);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
      {/* Personalized Header */}
      <header style={{ marginBottom: '32px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '4px', fontWeight: 500 }}>{greeting.text} {greeting.emoji}</p>
        <h1 style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: '4px' }}>Ishaan Gill</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{format(today, 'EEEE, MMMM d')}</p>
      </header>

      {/* Weekly Goals with Progress Bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)', borderRadius: '24px', padding: '22px', color: '#fff', boxShadow: '0 6px 20px rgba(0,122,255,0.3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-15px', fontSize: '4rem', opacity: 0.15 }}>🏋️</div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.85, letterSpacing: '0.08em', marginBottom: '10px' }}>GYM THIS WEEK</p>
          <h2 style={{ fontSize: '2.8rem', color: '#fff', lineHeight: 1, marginBottom: '12px' }}>{uniqueDatesThisWeek}<span style={{ fontSize: '1.1rem', opacity: 0.6 }}> / 5</span></h2>
          <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.2)' }}>
            <div style={{ height: '100%', borderRadius: '3px', background: '#fff', width: `${gymPct}%`, transition: 'width 0.8s ease' }} />
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #AF52DE, #FF2D55)', borderRadius: '24px', padding: '22px', color: '#fff', boxShadow: '0 6px 20px rgba(175,82,222,0.3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-15px', fontSize: '4rem', opacity: 0.15 }}>🏥</div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.85, letterSpacing: '0.08em', marginBottom: '10px' }}>PHYSIO THIS WEEK</p>
          <h2 style={{ fontSize: '2.8rem', color: '#fff', lineHeight: 1, marginBottom: '12px' }}>{uniquePhysioDates}<span style={{ fontSize: '1.1rem', opacity: 0.6 }}> / 4</span></h2>
          <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.2)' }}>
            <div style={{ height: '100%', borderRadius: '3px', background: '#fff', width: `${physioPct}%`, transition: 'width 0.8s ease' }} />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', borderLeft: '4px solid #FF9500', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.05em' }}>WEEKLY VOLUME</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FF9500', fontFamily: 'var(--font-display)' }}>{totalVolumeThisWeek.toLocaleString()}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>lbs moved 💥</p>
        </div>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', borderLeft: '4px solid #34C759', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.05em' }}>CURRENT STREAK</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34C759', fontFamily: 'var(--font-display)' }}>{uniqueDatesThisWeek} days</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>this week 🔥</p>
        </div>
      </div>

      {/* Daily Progress Photo */}
      {dailyPhoto && (
        <div style={{ borderRadius: '24px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }}>
          <div style={{ position: 'relative' }}>
            <img src={dailyPhoto.dataUrl} alt="Progress" style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75))' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>PROGRESS PHOTO</p>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>📸 {format(new Date(dailyPhoto.date), 'MMMM d, yyyy')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Export */}
      <button className="export-btn" onClick={handleExport}>
        <Download size={18} /> Export Workout Data
      </button>
    </div>
  );
}

import { useState } from 'react';
import { useData } from '../context/DataContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isSameMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Dumbbell, Activity, Trash2 } from 'lucide-react';

export default function History() {
  const { workoutLogs, physioLogs, removeWorkoutLog, removePhysioLog } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  // Get logs for the selected date
  const selectedWorkoutLogs = workoutLogs.filter(log => isSameDay(new Date(log.date), selectedDate));
  const selectedPhysioLogs = physioLogs.filter(log => isSameDay(new Date(log.date), selectedDate));
  const selectedSessionName = selectedWorkoutLogs.length > 0 ? selectedWorkoutLogs[0].sessionName : null;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>History 📖</h1>
          <p style={{ color: 'var(--text-muted)' }}>Calendar View</p>
        </div>
      </header>

      {/* Calendar Header */}
      <div className="vibrant-card" style={{ padding: '20px 16px', background: 'var(--surface-color)', border: '1px solid var(--surface-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '8px' }}><ChevronLeft /></button>
          <h2 style={{ fontSize: '1.25rem' }}>{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '8px' }}><ChevronRight /></button>
        </div>

        {/* Days of Week */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {['M','T','W','T','F','S','S'].map((day, i) => (
            <div key={i} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isDayToday = isToday(day);

            const wLogs = workoutLogs.filter(log => isSameDay(new Date(log.date), day));
            const pLogs = physioLogs.filter(log => isSameDay(new Date(log.date), day));
            const hasWorkout = wLogs.length > 0;
            const hasPhysio = pLogs.length > 0;
            
            let sessionEmoji = '';
            if (hasWorkout) {
              const name = wLogs[0].sessionName.toLowerCase();
              if (name.includes('leg')) sessionEmoji = '🦵';
              else if (name.includes('push') || name.includes('upper')) sessionEmoji = '🏋️‍♂️';
              else if (name.includes('pull') || name.includes('arm')) sessionEmoji = '💪';
              else sessionEmoji = '🔥';
            }

            return (
              <div 
                key={day.toString()} 
                onClick={() => setSelectedDate(day)}
                style={{ 
                  aspectRatio: '1', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--primary-color)' : (isDayToday ? 'var(--surface-inset)' : 'transparent'),
                  color: isSelected ? '#fff' : (isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)'),
                  opacity: isCurrentMonth ? 1 : 0.4,
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>{format(day, dateFormat)}</span>
                <div style={{ display: 'flex', gap: '2px', marginTop: '2px', minHeight: '12px' }}>
                  {hasWorkout && <span style={{ fontSize: '0.6rem' }}>{sessionEmoji}</span>}
                  {hasPhysio && <span style={{ fontSize: '0.6rem' }}>🏥</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>{format(selectedDate, 'EEEE, MMM d')}</h3>
        
        {selectedWorkoutLogs.length === 0 && selectedPhysioLogs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Rest Day</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedWorkoutLogs.length > 0 && (
              <div className="vibrant-card" style={{ padding: '16px', background: 'var(--surface-color)', border: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Dumbbell color="var(--primary-color)" size={20} />
                  <h4 style={{ fontSize: '1.1rem' }}>{selectedSessionName} Workout</h4>
                  {selectedWorkoutLogs[0]?.duration && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      ⏱ {Math.floor(selectedWorkoutLogs[0].duration / 60)}m {selectedWorkoutLogs[0].duration % 60}s
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedWorkoutLogs.map(log => (
                    <div key={log.id} style={{ background: 'var(--surface-inset)', borderRadius: '12px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h5 style={{ color: 'var(--primary-color)' }}>{log.exercise}</h5>
                        <button style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }} onClick={() => { if(window.confirm('Delete this exercise log?')) removeWorkoutLog(log.id) }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.875rem' }}>
                        {[1,2,3,4,5,6].map(i => {
                          if (log[`set${i}Wt`] || log[`set${i}Reps`]) {
                            return (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '4px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Set {i}</span>
                                <span>{log[`set${i}Wt`] || '-'} lbs × {log[`set${i}Reps`] || '-'}</span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedWorkoutLogs[0]?.sessionNotes && (
                  <div style={{ marginTop: '12px', padding: '12px', background: 'var(--surface-inset)', borderRadius: '12px', borderLeft: '3px solid var(--primary-color)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>📝 Session Notes</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selectedWorkoutLogs[0].sessionNotes}</p>
                  </div>
                )}
              </div>
            )}

            {selectedPhysioLogs.length > 0 && (
              <div className="vibrant-card" style={{ padding: '16px', background: 'var(--surface-color)', border: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Activity color="var(--warning-color)" size={20} />
                  <h4 style={{ fontSize: '1.1rem' }}>Physio Session</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedPhysioLogs.map(log => (
                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-inset)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{log.exercise}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{log.painLevel} Pain • {log.duration}s</span>
                      </div>
                      <button style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '8px' }} onClick={() => { if(window.confirm('Delete physio log?')) removePhysioLog(log.id) }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

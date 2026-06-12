import { useState, useMemo, useRef } from 'react';
import { useData } from '../context/DataContext';
import { GYM_EXERCISES } from '../data/seed';
import { format } from 'date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Camera, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ProgressCharts() {
  const [activeTab, setActiveTab] = useState('charts');

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Progress 📈</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track your gains</p>
      </header>

      <div style={{ display: 'flex', background: 'var(--surface-inset)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
        <button 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'charts' ? 'var(--surface-color)' : 'transparent', color: activeTab === 'charts' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: '0.2s', boxShadow: activeTab === 'charts' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          onClick={() => setActiveTab('charts')}
        >Charts</button>
        <button 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'gallery' ? 'var(--surface-color)' : 'transparent', color: activeTab === 'gallery' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: '0.2s', boxShadow: activeTab === 'gallery' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          onClick={() => setActiveTab('gallery')}
        >Gallery</button>
      </div>

      {activeTab === 'charts' ? <ChartsView /> : <GalleryView />}
    </div>
  );
}

function ChartsView() {
  const { workoutLogs } = useData();
  const [selectedExercise, setSelectedExercise] = useState('Leg Press');

  const chartData = useMemo(() => {
    const logs = workoutLogs
      .filter(log => log.exercise === selectedExercise && (log.set1Wt || log.set2Wt || log.set3Wt || log.set4Wt || log.set5Wt || log.set6Wt))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      labels: logs.map(log => format(new Date(log.date), 'MMM d')),
      datasets: [{
        label: `${selectedExercise} (Max lbs)`,
        data: logs.map(log => { let m=0; for(let i=1;i<=6;i++){const w=parseFloat(log[`set${i}Wt`])||0; if(w>m)m=w;} return m; }),
        borderColor: '#007AFF',
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        tension: 0.4, pointBackgroundColor: '#34C759', pointBorderColor: '#fff',
        pointRadius: 5, borderWidth: 2, fill: true,
      }]
    };
  }, [workoutLogs, selectedExercise]);

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top', labels: { color: '#3a3a3c' } } },
    scales: {
      y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { color: '#86868b' } },
      x: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { color: '#86868b' } }
    }
  };

  return (
    <div>
      <div className="glass-panel" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Select Exercise</label>
        <select className="input-field" value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)}>
          {GYM_EXERCISES.map(ex => (<option key={ex} value={ex}>{ex}</option>))}
        </select>
      </div>
      <div className="glass-panel" style={{ minHeight: '300px' }}>
        {chartData.labels.length > 0 ? <Line options={options} data={chartData} />
        : <div style={{ display: 'flex', height: '300px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data logged yet.</div>}
      </div>
    </div>
  );
}

// Fullscreen photo viewer with swipe
function PhotoViewer({ photos, startIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => { touchStartX.current = e.changedTouches[0].screenX; };
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) > 60) {
      if (delta > 0 && currentIndex < photos.length - 1) setCurrentIndex(i => i + 1);
      if (delta < 0 && currentIndex > 0) setCurrentIndex(i => i - 1);
    }
  };

  const photo = photos[currentIndex];
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column' }}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={28} /></button>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{format(new Date(photo.date), 'MMM d, yyyy')}</span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{currentIndex + 1} / {photos.length}</span>
      </div>
      {/* Photo */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '0 8px' }}>
        <img src={photo.dataUrl} alt="Progress" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} />
      </div>
      {/* Navigation dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '16px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        {photos.length <= 12 && photos.map((_, i) => (
          <div key={i} onClick={() => setCurrentIndex(i)} style={{ width: i === currentIndex ? '20px' : '8px', height: '8px', borderRadius: '4px', background: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.3)', transition: '0.3s', cursor: 'pointer' }} />
        ))}
        {photos.length > 12 && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Swipe to browse</span>}
      </div>
      {/* Desktop arrows */}
      {currentIndex > 0 && (
        <button onClick={() => setCurrentIndex(i => i-1)} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}><ChevronLeft size={24} /></button>
      )}
      {currentIndex < photos.length - 1 && (
        <button onClick={() => setCurrentIndex(i => i+1)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}><ChevronRight size={24} /></button>
      )}
    </div>
  );
}

function GalleryView() {
  const { photos, addPhoto, removePhoto } = useData();
  const fileInputRef = useRef();
  const [viewerIndex, setViewerIndex] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { addPhoto({ dataUrl: reader.result, notes: '' }); };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {viewerIndex !== null && <PhotoViewer photos={photos} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem' }}>📸 Memories</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{photos.length} photos</p>
        </div>
        <button onClick={() => fileInputRef.current.click()} style={{ background: 'var(--primary-color)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
          <Camera size={18} /> Add
        </button>
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '3rem', marginBottom: '12px' }}>📷</p>
          <p style={{ fontWeight: 600 }}>No photos yet</p>
          <p style={{ fontSize: '0.85rem' }}>Take your first progress picture!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', borderRadius: '16px', overflow: 'hidden' }}>
          {photos.map((photo, index) => (
            <div key={photo.id} style={{ position: 'relative', aspectRatio: '1', cursor: 'pointer' }} onClick={() => setViewerIndex(index)}>
              <img src={photo.dataUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
                <p style={{ color: '#fff', fontSize: '0.6rem', fontWeight: 600 }}>{format(new Date(photo.date), 'MMM d')}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete?')) removePhoto(photo.id); }} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

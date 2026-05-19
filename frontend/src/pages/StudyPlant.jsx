import { useState, useEffect } from 'react';
import { HiOutlineLightningBolt, HiOutlineClock, HiOutlineFire, HiOutlineChartBar, HiOutlineRefresh } from 'react-icons/hi';
import { getTimerStats, getTimerSessions, deleteTimerSession } from '../api';
import toast from 'react-hot-toast';

const PLANT_LEVELS = [
  { level: 1, name: 'Seed',        emoji: '🌱', minXP: 0,    maxXP: 50,   desc: 'Just planted. Start studying to grow!',                color: '#10b981' },
  { level: 2, name: 'Sprout',      emoji: '🌿', minXP: 50,   maxXP: 150,  desc: 'Growing nicely. Keep up the momentum!',                color: '#10b981' },
  { level: 3, name: 'Sapling',     emoji: '🌾', minXP: 150,  maxXP: 300,  desc: 'Roots are deep. Your knowledge is solid!',             color: '#06b6d4' },
  { level: 4, name: 'Bush',        emoji: '🌳', minXP: 300,  maxXP: 500,  desc: 'Branching out across many DevOps topics!',             color: '#6366f1' },
  { level: 5, name: 'Young Tree',  emoji: '🌲', minXP: 500,  maxXP: 800,  desc: 'Standing tall. A serious DevOps practitioner!',        color: '#8b5cf6' },
  { level: 6, name: 'Tree',        emoji: '🌴', minXP: 800,  maxXP: 1200, desc: 'Towering achievement. Almost at mastery!',             color: '#f59e0b' },
  { level: 7, name: 'Ancient Tree',emoji: '🎋', minXP: 1200, maxXP: null, desc: 'Master of the DevOps craft. Legendary status!',        color: '#ef4444' },
];

function getLevel(xp) {
  for (let i = PLANT_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= PLANT_LEVELS[i].minXP) return PLANT_LEVELS[i];
  }
  return PLANT_LEVELS[0];
}

function formatMin(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function StudyPlant() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, sessRes] = await Promise.all([getTimerStats(), getTimerSessions({ limit: 10 })]);
      setStats(sRes.data.data);
      setSessions(sessRes.data.data);
    } catch (_) { toast.error('Failed to load plant data'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTimerSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      toast.success('Session removed');
      fetchData();
    } catch (_) { toast.error('Failed to delete session'); }
  };

  const triggerAnimate = () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 1200);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const xp = stats?.totalXP || 0;
  const currentLevel = getLevel(xp);
  const nextLevel = PLANT_LEVELS.find((l) => l.level === currentLevel.level + 1);
  const pct = nextLevel
    ? Math.min(100, ((xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100)
    : 100;

  const topicEntries = Object.entries(stats?.topicBreakdown || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>🌱 Study Plant</h2>
        <p>Your plant grows as you complete focus sessions — keep studying to level up!</p>
      </div>

      <div className="plant-layout">
        {/* Plant Display */}
        <div className="card plant-display-card">
          <div className="plant-stage" onClick={triggerAnimate} title="Click to cheer!">
            <div className={`plant-emoji-giant ${animating ? 'bounce' : ''}`}>
              {currentLevel.emoji}
            </div>
            <div className="plant-particles">
              {animating && ['✨', '⚡', '🌟', '💫'].map((p, i) => (
                <span key={i} className={`particle p${i}`}>{p}</span>
              ))}
            </div>
          </div>

          <div className="plant-level-badge" style={{ color: currentLevel.color, borderColor: currentLevel.color + '44', background: currentLevel.color + '11' }}>
            Level {currentLevel.level}
          </div>
          <div className="plant-name-title">{currentLevel.name}</div>
          <div className="plant-desc">{currentLevel.desc}</div>

          {/* XP Progress bar */}
          <div className="plant-xp-section">
            <div className="plant-xp-top">
              <span className="plant-xp-label">⚡ {xp} XP</span>
              {nextLevel && <span className="plant-xp-next">Next: {nextLevel.name} at {nextLevel.minXP} XP</span>}
            </div>
            <div className="plant-xp-track">
              <div
                className="plant-xp-fill"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel?.color || currentLevel.color})` }}
              />
            </div>
            <div className="plant-xp-pct">{Math.round(pct)}% to next level</div>
          </div>

          {/* Level roadmap */}
          <div className="plant-roadmap">
            {PLANT_LEVELS.map((lvl) => {
              const reached = xp >= lvl.minXP;
              const isCurrent = lvl.level === currentLevel.level;
              return (
                <div key={lvl.level} className={`roadmap-step ${reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`} title={`${lvl.name}: ${lvl.minXP}+ XP`}>
                  <span className="roadmap-emoji">{lvl.emoji}</span>
                  {lvl.level < PLANT_LEVELS.length && (
                    <div className={`roadmap-line ${reached && lvl.level < currentLevel.level ? 'filled' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="plant-right">
          {/* Quick stats */}
          <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 20 }}>
            <div className="card stat-card gradient-1">
              <div className="stat-card-header">
                <span className="stat-card-label">Total Time</span>
                <div className="stat-card-icon icon-1"><HiOutlineClock /></div>
              </div>
              <div className="stat-card-value">{formatMin(stats?.totalMinutes || 0)}</div>
              <div className="stat-card-sub">{stats?.totalSessions || 0} sessions</div>
            </div>
            <div className="card stat-card gradient-4">
              <div className="stat-card-header">
                <span className="stat-card-label">This Week</span>
                <div className="stat-card-icon icon-4"><HiOutlineFire /></div>
              </div>
              <div className="stat-card-value">{formatMin(stats?.weekMinutes || 0)}</div>
              <div className="stat-card-sub">{stats?.weekSessions || 0} sessions</div>
            </div>
          </div>

          {/* Topic breakdown */}
          {topicEntries.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="chart-title"><HiOutlineChartBar /> Focus by Topic</div>
              <div className="topic-list">
                {topicEntries.slice(0, 6).map(([topic, minutes]) => {
                  const max = topicEntries[0][1];
                  return (
                    <div key={topic} className="topic-item">
                      <span className="topic-name">{topic}</span>
                      <div className="topic-bar-container">
                        <div className="topic-bar-fill" style={{ width: `${(minutes / max) * 100}%` }} />
                      </div>
                      <span className="topic-count">{formatMin(minutes)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent sessions */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="chart-title" style={{ margin: 0 }}><HiOutlineLightningBolt /> Recent Sessions</div>
              <button className="btn-icon" onClick={fetchData} title="Refresh"><HiOutlineRefresh /></button>
            </div>
            {sessions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No sessions yet. Start the Focus Timer to earn XP!</p>
            ) : (
              <div className="sessions-list">
                {sessions.map((s) => (
                  <div key={s._id} className="session-row">
                    <div className="session-mode-icon">
                      {s.mode === 'pomodoro' ? '🍅' : s.mode === 'stopwatch' ? '⏱️' : '⏳'}
                    </div>
                    <div className="session-info">
                      <div className="session-topic">{s.topic}</div>
                      <div className="session-meta">{formatMin(s.durationMinutes)} · {new Date(s.completedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="session-xp">+{s.xpEarned} XP ⚡</div>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(s._id)}
                      title="Remove"
                      style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

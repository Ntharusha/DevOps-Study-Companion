import { useState, useEffect, useRef, useCallback } from 'react';
import { HiOutlinePlay, HiOutlinePause, HiOutlineRefresh, HiOutlineCheck, HiOutlineClock, HiOutlineFire, HiOutlineLightningBolt, HiOutlineChevronUp, HiOutlineChevronDown } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { saveTimerSession, getTimerStats } from '../api';

const TOPICS = ['Docker', 'Kubernetes', 'Linux', 'CI/CD', 'AWS', 'Terraform', 'Ansible', 'Git', 'Networking', 'Monitoring', 'Security', 'Scripting', 'Jenkins', 'Other'];

const MODES = [
  { key: 'pomodoro', label: 'Pomodoro', icon: '🍅', defaultWork: 25, defaultBreak: 5 },
  { key: 'stopwatch', label: 'Stopwatch', icon: '⏱️', defaultWork: 0, defaultBreak: 0 },
  { key: 'countdown', label: 'Countdown', icon: '⏳', defaultWork: 45, defaultBreak: 10 },
];

function pad(n) { return String(n).padStart(2, '0'); }

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export default function FocusTimer() {
  const [mode, setMode] = useState('pomodoro');
  const [topic, setTopic] = useState('Docker');
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('work'); // 'work' | 'break'
  const [autoBreak, setAutoBreak] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef(null);
  const startedAt = useRef(null);
  const elapsedSeconds = useRef(0);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getTimerStats();
      setStats(data.data);
    } catch (_) {}
  };

  // Notify if permission available
  const notify = useCallback((msg) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('DevOps Companion', { body: msg, icon: '/favicon.ico' });
    }
    toast.success(msg);
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getTotalSeconds = useCallback(() => {
    if (mode === 'stopwatch') return 0;
    return (phase === 'work' ? workMinutes : breakMinutes) * 60;
  }, [mode, phase, workMinutes, breakMinutes]);

  useEffect(() => {
    if (!running) {
      setSeconds(getTotalSeconds());
    }
  }, [mode, workMinutes, breakMinutes, phase]);

  const handleComplete = useCallback(async () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    const mins = mode === 'stopwatch'
      ? Math.round(elapsedSeconds.current / 60)
      : (phase === 'work' ? workMinutes : breakMinutes);

    if (phase === 'work' && mins > 0) {
      setSessionCount((c) => c + 1);
      notify(`🍅 Focus session done! ${mins} min of ${topic}`);
      // Save session
      setSaving(true);
      try {
        await saveTimerSession({
          mode,
          topic,
          durationMinutes: mins,
          breakMinutes,
          completed: true,
        });
        fetchStats();
      } catch (_) {}
      setSaving(false);

      if (autoBreak && mode !== 'stopwatch') {
        setPhase('break');
        setSeconds(breakMinutes * 60);
        setRunning(true);
      } else {
        setPhase('work');
        setSeconds(getTotalSeconds());
      }
    } else if (phase === 'break') {
      notify('☕ Break over! Time to focus.');
      setPhase('work');
      setSeconds(workMinutes * 60);
    }
    elapsedSeconds.current = 0;
  }, [mode, phase, workMinutes, breakMinutes, topic, autoBreak, notify, getTotalSeconds]);

  useEffect(() => {
    if (running) {
      startedAt.current = Date.now();
      intervalRef.current = setInterval(() => {
        if (mode === 'stopwatch') {
          elapsedSeconds.current += 1;
          setSeconds((s) => s + 1);
        } else {
          setSeconds((s) => {
            if (s <= 1) {
              handleComplete();
              return 0;
            }
            return s - 1;
          });
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, handleComplete]);

  const handleStart = () => {
    if (mode === 'stopwatch') {
      setSeconds(0);
      elapsedSeconds.current = 0;
    }
    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setPhase('work');
    elapsedSeconds.current = 0;
    setSeconds(mode === 'stopwatch' ? 0 : workMinutes * 60);
  };

  const handleModeChange = (m) => {
    setMode(m.key);
    setRunning(false);
    setPhase('work');
    elapsedSeconds.current = 0;
    setWorkMinutes(m.defaultWork || 25);
    setBreakMinutes(m.defaultBreak || 5);
    setSeconds((m.defaultWork || 25) * 60);
  };

  const totalSeconds = mode === 'stopwatch' ? seconds : getTotalSeconds();
  const progress = mode === 'stopwatch'
    ? Math.min((seconds / (workMinutes * 60 || 1)) * 100, 100)
    : totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;

  const circumference = 2 * Math.PI * 110;
  const strokeDash = circumference - (progress / 100) * circumference;

  const plantLevel = stats?.plantLevel;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>🍅 Focus Timer</h2>
        <p>Pomodoro, Stopwatch & Countdown — track every DevOps session</p>
      </div>

      <div className="timer-layout">
        {/* Left: Timer */}
        <div className="timer-main">
          {/* Mode Tabs */}
          <div className="timer-mode-tabs">
            {MODES.map((m) => (
              <button
                key={m.key}
                className={`timer-mode-tab ${mode === m.key ? 'active' : ''}`}
                onClick={() => handleModeChange(m)}
                id={`timer-mode-${m.key}`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {/* Phase badge */}
          {mode !== 'stopwatch' && (
            <div className={`timer-phase-badge ${phase}`}>
              {phase === 'work' ? '🎯 Focus Time' : '☕ Break Time'}
            </div>
          )}

          {/* SVG Circle Timer */}
          <div className="timer-circle-wrapper">
            <svg className="timer-svg" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="110" className="timer-track" />
              <circle
                cx="120" cy="120" r="110"
                className={`timer-progress ${phase}`}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                transform="rotate(-90 120 120)"
              />
            </svg>
            <div className="timer-center">
              <div className="timer-display">{formatTime(seconds)}</div>
              <div className="timer-label">
                {phase === 'break' ? 'Break' : topic}
              </div>
              {saving && <div className="timer-saving">Saving… ✨</div>}
            </div>
          </div>

          {/* Controls */}
          <div className="timer-controls">
            {!running ? (
              <button className="btn btn-primary timer-btn-lg" onClick={handleStart} id="timer-start">
                <HiOutlinePlay /> {seconds === 0 && mode !== 'stopwatch' ? 'Restart' : 'Start'}
              </button>
            ) : (
              <button className="btn btn-secondary timer-btn-lg" onClick={() => setRunning(false)} id="timer-pause">
                <HiOutlinePause /> Pause
              </button>
            )}
            <button className="btn btn-secondary" onClick={handleReset} id="timer-reset">
              <HiOutlineRefresh /> Reset
            </button>
            {running && mode === 'stopwatch' && (
              <button className="btn btn-primary" onClick={handleComplete} id="timer-done">
                <HiOutlineCheck /> Done
              </button>
            )}
          </div>

          {/* Session counter */}
          <div className="timer-session-dots">
            {[1,2,3,4].map((i) => (
              <div key={i} className={`session-dot ${sessionCount >= i ? 'filled' : ''}`} />
            ))}
            <span className="timer-session-label">{sessionCount} sessions today</span>
          </div>
        </div>

        {/* Right: Settings & Stats */}
        <div className="timer-sidebar-panel">
          {/* Topic */}
          <div className="card timer-config-card">
            <div className="timer-config-title">⚙️ Session Settings</div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Topic</label>
              <select className="form-select" value={topic} onChange={(e) => setTopic(e.target.value)} id="timer-topic">
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            {mode !== 'stopwatch' && (
              <>
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Work Duration</label>
                  <div className="timer-num-input">
                    <button onClick={() => setWorkMinutes((v) => Math.max(5, v - 5))}><HiOutlineChevronDown /></button>
                    <span>{workMinutes} min</span>
                    <button onClick={() => setWorkMinutes((v) => Math.min(120, v + 5))}><HiOutlineChevronUp /></button>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Break Duration</label>
                  <div className="timer-num-input">
                    <button onClick={() => setBreakMinutes((v) => Math.max(1, v - 1))}><HiOutlineChevronDown /></button>
                    <span>{breakMinutes} min</span>
                    <button onClick={() => setBreakMinutes((v) => Math.min(30, v + 1))}><HiOutlineChevronUp /></button>
                  </div>
                </div>
                <label className="timer-toggle-row">
                  <input type="checkbox" checked={autoBreak} onChange={(e) => setAutoBreak(e.target.checked)} id="timer-autobreak" />
                  <span>Auto-start breaks</span>
                </label>
              </>
            )}
          </div>

          {/* Plant card */}
          {plantLevel && (
            <div className="card timer-plant-card">
              <div className="plant-emoji">{plantLevel.emoji}</div>
              <div className="plant-name">{plantLevel.name}</div>
              <div className="plant-xp-bar-wrap">
                <div
                  className="plant-xp-bar-fill"
                  style={{
                    width: plantLevel.next
                      ? `${Math.min(100, (stats.totalXP / plantLevel.next) * 100)}%`
                      : '100%',
                  }}
                />
              </div>
              <div className="plant-xp-label">
                {stats.totalXP} XP {plantLevel.next ? `/ ${plantLevel.next}` : '(MAX)'}
              </div>
            </div>
          )}

          {/* Quick stats */}
          {stats && (
            <div className="card timer-stats-mini">
              <div className="timer-stat-row">
                <HiOutlineClock /> <span>{Math.round(stats.totalMinutes / 60 * 10) / 10}h total</span>
              </div>
              <div className="timer-stat-row">
                <HiOutlineFire /> <span>{stats.weekSessions} sessions this week</span>
              </div>
              <div className="timer-stat-row">
                <HiOutlineLightningBolt /> <span>{stats.totalSessions} all-time sessions</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

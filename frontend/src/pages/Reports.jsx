import { useState, useEffect } from 'react';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineFire,
  HiOutlineBeaker,
  HiOutlineExclamation,
  HiOutlineTerminal,
} from 'react-icons/hi';
import { getWeeklyReport, getSkillScore } from '../api';

function Reports() {
  const [report, setReport] = useState(null);
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('weekly');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [weeklyRes, skillRes] = await Promise.all([getWeeklyReport(), getSkillScore()]);
      setReport(weeklyRes.data.data);
      setSkill(skillRes.data.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const maxDailyHours = report ? Math.max(...report.dailyBreakdown.map((d) => d.hours), 1) : 1;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>📈 Reports & Skill Score</h2>
        <p>Your learning analytics and progression</p>
      </div>

      {/* Tab Switch */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-sm)', width: 'fit-content' }}>
        {['weekly', 'skill'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className="btn btn-sm" style={{
            background: tab === t ? 'var(--accent-primary)' : 'transparent',
            color: tab === t ? 'white' : 'var(--text-secondary)',
            border: 'none',
            textTransform: 'capitalize',
          }}>
            {t === 'weekly' ? '📊 Weekly Report' : '🎯 Skill Score'}
          </button>
        ))}
      </div>

      {/* WEEKLY REPORT TAB */}
      {tab === 'weekly' && report && (
        <>
          <div style={{ marginBottom: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            📅 {report.period.start} → {report.period.end}
          </div>

          {/* Summary Stats */}
          <div className="stats-grid">
            <div className="card stat-card gradient-1">
              <div className="stat-card-header">
                <span className="stat-card-label">Sessions</span>
                <div className="stat-card-icon icon-1"><HiOutlineCalendar /></div>
              </div>
              <div className="stat-card-value">{report.summary.totalEntries}</div>
              <div className="stat-card-sub">{report.summary.activeDays}/7 active days</div>
            </div>
            <div className="card stat-card gradient-2">
              <div className="stat-card-header">
                <span className="stat-card-label">Hours</span>
                <div className="stat-card-icon icon-2"><HiOutlineClock /></div>
              </div>
              <div className="stat-card-value">{report.summary.totalHours}h</div>
              <div className="stat-card-sub">This week</div>
            </div>
            <div className="card stat-card gradient-3">
              <div className="stat-card-header">
                <span className="stat-card-label">Consistency</span>
                <div className="stat-card-icon icon-3"><HiOutlineFire /></div>
              </div>
              <div className="stat-card-value">{report.summary.consistencyScore}%</div>
              <div className="stat-card-sub">Weekly consistency</div>
            </div>
            <div className="card stat-card gradient-5">
              <div className="stat-card-header">
                <span className="stat-card-label">XP Earned</span>
                <div className="stat-card-icon icon-5">⚡</div>
              </div>
              <div className="stat-card-value">{report.weeklyXP}</div>
              <div className="stat-card-sub">This week</div>
            </div>
          </div>

          {/* Daily Chart */}
          <div className="card chart-card" style={{ marginBottom: '20px' }}>
            <div className="chart-title">📊 Daily Activity</div>
            <div className="weekly-chart">
              {report.dailyBreakdown.map((day) => (
                <div key={day.date} className="weekly-bar-wrapper">
                  <div className="weekly-bar-value">{day.hours > 0 ? `${day.hours}h` : ''}</div>
                  <div className="weekly-bar" style={{ height: `${(day.hours / maxDailyHours) * 120}px` }} />
                  <div className="weekly-bar-label">{day.dayName}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="charts-grid">
            {/* Topics This Week */}
            <div className="card chart-card">
              <div className="chart-title">📚 Topics Covered</div>
              {report.topics.length > 0 ? (
                <div className="topic-list">
                  {report.topics.sort((a, b) => b.hours - a.hours).map((t) => (
                    <div key={t.topic} className="topic-item">
                      <span className="topic-name">{t.topic}</span>
                      <div className="topic-bar-container">
                        <div className="topic-bar-fill" style={{ width: `${(t.hours / Math.max(...report.topics.map((x) => x.hours))) * 100}%` }} />
                      </div>
                      <span className="topic-count">{t.hours}h</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No topics this week</p>
              )}
            </div>

            {/* Extras */}
            <div className="card chart-card">
              <div className="chart-title">🔧 Activity Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlineBeaker /> Labs</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{report.labs.completed}/{report.labs.total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlineExclamation /> Errors</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{report.errors.resolved}/{report.errors.total} resolved</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><HiOutlineTerminal /> New Commands</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{report.newCommands}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <div className="difficulty-grid">
                    {Object.entries(report.difficulty).map(([level, count]) => (
                      <div key={level} className="difficulty-item">
                        <div className="difficulty-dot" style={{ backgroundColor: level === 'Easy' ? '#10b981' : level === 'Medium' ? '#f59e0b' : level === 'Hard' ? '#ef4444' : '#8b5cf6' }} />
                        <span className="difficulty-label">{level}</span>
                        <span className="difficulty-value">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SKILL SCORE TAB */}
      {tab === 'skill' && skill && (
        <>
          {/* Level Card */}
          <div className="card" style={{ marginBottom: '24px', padding: '32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--gradient-primary)' }} />
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
              {skill.level <= 2 ? '🌱' : skill.level <= 4 ? '🌿' : skill.level <= 6 ? '🌳' : skill.level <= 8 ? '⭐' : '👑'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Level {skill.level}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>{skill.title}</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {skill.totalXP} XP
            </div>

            {/* Progress Bar */}
            {skill.nextLevel && (
              <div style={{ marginTop: '20px', maxWidth: '400px', margin: '20px auto 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <span>Lvl {skill.level}</span>
                  <span>{skill.progress}%</span>
                  <span>Lvl {skill.nextLevel.level} — {skill.nextLevel.title}</span>
                </div>
                <div style={{ height: '10px', background: 'var(--bg-input)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${skill.progress}%`, background: 'var(--gradient-primary)', borderRadius: '5px', transition: 'width 1s ease' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {skill.nextLevel.xpNeeded - skill.totalXP} XP to next level
                </div>
              </div>
            )}

            {skill.currentStreak > 0 && (
              <div className="streak-fire" style={{ justifyContent: 'center', marginTop: '16px', fontSize: '1rem' }}>
                🔥 {skill.currentStreak} day streak!
              </div>
            )}
          </div>

          {/* XP Breakdown */}
          <div className="charts-grid">
            <div className="card chart-card">
              <div className="chart-title">⚡ XP Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Study Entries', xp: skill.breakdown.entriesXP, icon: '📚', color: '#6366f1' },
                  { label: 'Labs Completed', xp: skill.breakdown.labsXP, icon: '🧪', color: '#06b6d4' },
                  { label: 'Errors Resolved', xp: skill.breakdown.errorsXP, icon: '⚠️', color: '#10b981' },
                  { label: 'Commands Saved', xp: skill.breakdown.commandsXP, icon: '💻', color: '#f59e0b' },
                  { label: 'Streak Bonus', xp: skill.breakdown.streakBonus, icon: '🔥', color: '#ef4444' },
                ].map((item) => {
                  const maxXP = Math.max(skill.breakdown.entriesXP, skill.breakdown.labsXP, skill.breakdown.errorsXP, skill.breakdown.commandsXP, skill.breakdown.streakBonus, 1);
                  return (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.icon} {item.label}</span>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{item.xp} XP</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(item.xp / maxXP) * 100}%`, background: item.color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Topic Skills */}
            <div className="card chart-card">
              <div className="chart-title">🎯 Topic Skills</div>
              {skill.topicSkills.length > 0 ? (
                <div className="topic-list">
                  {skill.topicSkills.slice(0, 8).map((ts) => {
                    const maxSkillXP = Math.max(...skill.topicSkills.map((s) => s.xp), 1);
                    return (
                      <div key={ts.topic} className="topic-item">
                        <span className="topic-name">{ts.topic}</span>
                        <div className="topic-bar-container">
                          <div className="topic-bar-fill" style={{ width: `${(ts.xp / maxSkillXP) * 100}%` }} />
                        </div>
                        <span className="topic-count">{ts.xp} XP</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No topic data yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;

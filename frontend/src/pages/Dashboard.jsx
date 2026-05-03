import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineFire,
  HiOutlineTrendingUp,
  HiOutlineAcademicCap,
  HiOutlineLightningBolt,
} from 'react-icons/hi';
import { getStats } from '../api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getStats();
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <h3>No Data Yet</h3>
        <p>Start by logging your first DevOps learning session</p>
        <Link to="/new" className="btn btn-primary">
          <HiOutlineLightningBolt /> Log First Entry
        </Link>
      </div>
    );
  }

  const maxWeeklyHours = Math.max(
    ...stats.weeklyActivity.map((d) => d.hours),
    1
  );
  const maxTopicCount = Math.max(
    ...stats.topicDistribution.map((t) => t.count),
    1
  );
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>📊 Dashboard</h2>
        <p>Your DevOps learning progress at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="card stat-card gradient-1">
          <div className="stat-card-header">
            <span className="stat-card-label">Study Days</span>
            <div className="stat-card-icon icon-1">
              <HiOutlineCalendar />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalStudyDays}</div>
          <div className="stat-card-sub">Total active days</div>
        </div>

        <div className="card stat-card gradient-4">
          <div className="stat-card-header">
            <span className="stat-card-label">Current Streak</span>
            <div className="stat-card-icon icon-4">
              <HiOutlineFire />
            </div>
          </div>
          <div className="stat-card-value">
            {stats.currentStreak}{' '}
            <span style={{ fontSize: '1rem' }}>
              {stats.currentStreak > 0 ? '🔥' : ''}
            </span>
          </div>
          <div className="stat-card-sub">
            Longest: {stats.longestStreak} days
          </div>
        </div>

        <div className="card stat-card gradient-2">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Hours</span>
            <div className="stat-card-icon icon-2">
              <HiOutlineClock />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalHours}h</div>
          <div className="stat-card-sub">
            Avg {stats.avgHoursPerDay}h/day
          </div>
        </div>

        <div className="card stat-card gradient-3">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Entries</span>
            <div className="stat-card-icon icon-3">
              <HiOutlineAcademicCap />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalEntries}</div>
          <div className="stat-card-sub">Learning sessions logged</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Weekly Activity */}
        <div className="card chart-card">
          <div className="chart-title">
            <HiOutlineTrendingUp /> Weekly Activity
          </div>
          <div className="weekly-chart">
            {stats.weeklyActivity.map((day) => (
              <div key={day.date} className="weekly-bar-wrapper">
                <div className="weekly-bar-value">
                  {day.hours > 0 ? `${day.hours}h` : ''}
                </div>
                <div
                  className={`weekly-bar ${
                    day.date === todayStr ? 'today' : ''
                  }`}
                  style={{
                    height: `${(day.hours / maxWeeklyHours) * 120}px`,
                  }}
                />
                <div className="weekly-bar-label">{day.dayName}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Distribution */}
        <div className="card chart-card">
          <div className="chart-title">
            <HiOutlineAcademicCap /> Topics
          </div>
          {stats.topicDistribution.length > 0 ? (
            <div className="topic-list">
              {stats.topicDistribution
                .sort((a, b) => b.count - a.count)
                .slice(0, 6)
                .map((topic) => (
                  <div key={topic.topic} className="topic-item">
                    <span className="topic-name">{topic.topic}</span>
                    <div className="topic-bar-container">
                      <div
                        className="topic-bar-fill"
                        style={{
                          width: `${(topic.count / maxTopicCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="topic-count">{topic.hours}h</span>
                  </div>
                ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No topics tracked yet
            </p>
          )}
        </div>
      </div>

      {/* Difficulty Distribution */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="chart-title">Difficulty Breakdown</div>
        <div className="difficulty-grid">
          {Object.entries(stats.difficultyDistribution).map(
            ([level, count]) => (
              <div key={level} className="difficulty-item">
                <div
                  className="difficulty-dot"
                  style={{
                    backgroundColor:
                      level === 'Easy'
                        ? '#10b981'
                        : level === 'Medium'
                        ? '#f59e0b'
                        : level === 'Hard'
                        ? '#ef4444'
                        : '#8b5cf6',
                  }}
                />
                <span className="difficulty-label">{level}</span>
                <span className="difficulty-value">{count}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

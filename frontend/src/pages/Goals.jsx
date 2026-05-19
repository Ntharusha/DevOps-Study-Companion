import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineX, HiOutlineCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../api';

const TOPICS = ['Docker', 'Kubernetes', 'Linux', 'CI/CD', 'AWS', 'Terraform', 'Ansible', 'Git', 'Networking', 'Monitoring', 'Security', 'Scripting', 'Jenkins', 'Other'];
const TOPIC_COLORS = {
  Docker: '#06b6d4', Kubernetes: '#3b82f6', Linux: '#f59e0b', 'CI/CD': '#10b981',
  AWS: '#f97316', Terraform: '#8b5cf6', Ansible: '#ec4899', Git: '#ef4444',
  Networking: '#06b6d4', Monitoring: '#10b981', Security: '#ef4444', Scripting: '#f59e0b',
  Jenkins: '#6366f1', Other: '#94a3b8',
};

function getCurrentWeekLabel() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export default function Goals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState({ topic: 'Docker', targetHours: 5, notes: '' });
  const week = getCurrentWeekLabel();

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try {
      const res = await getGoals({ week });
      setData(res.data.data);
    } catch (_) { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, weekLabel: week, color: TOPIC_COLORS[form.topic] || '#6366f1' };
      if (editGoal) {
        const res = await updateGoal(editGoal._id, payload);
        setData((prev) => ({
          ...prev,
          goals: prev.goals.map((g) => g._id === editGoal._id ? { ...res.data.data, actualHours: g.actualHours } : g),
        }));
        toast.success('Goal updated!');
      } else {
        await createGoal(payload);
        await fetchGoals();
        toast.success('Goal set! 🎯');
      }
      resetForm();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save goal'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await deleteGoal(id);
      setData((prev) => ({ ...prev, goals: prev.goals.filter((g) => g._id !== id) }));
      toast.success('Goal removed');
    } catch (_) { toast.error('Failed to delete'); }
  };

  const handleEdit = (goal) => {
    setEditGoal(goal);
    setForm({ topic: goal.topic, targetHours: goal.targetHours, notes: goal.notes || '' });
    setShowForm(true);
  };

  const resetForm = () => { setForm({ topic: 'Docker', targetHours: 5, notes: '' }); setEditGoal(null); setShowForm(false); };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const goals = data?.goals || [];
  const summary = data?.summary || {};
  const totalPct = summary.totalTarget > 0 ? Math.min(100, (summary.totalActual / summary.totalTarget) * 100) : 0;

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>🎯 Study Goals</h2>
          <p>Set weekly hour targets per topic — track your progress in real time</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="goals-week-badge">Week {week.split('-W')[1]}, {week.split('-W')[0]}</span>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} id="add-goal-btn">
            <HiOutlinePlus /> New Goal
          </button>
        </div>
      </div>

      {/* Weekly summary card */}
      <div className="card goals-summary-card">
        <div className="goals-summary-top">
          <div>
            <div className="goals-summary-title">This Week's Progress</div>
            <div className="goals-summary-nums">
              <span className="goals-actual">{summary.totalActual}h</span>
              <span className="goals-divider">/</span>
              <span className="goals-target">{summary.totalTarget}h target</span>
            </div>
          </div>
          <div className={`goals-pct-badge ${totalPct >= 100 ? 'done' : ''}`}>
            {Math.round(totalPct)}%
          </div>
        </div>
        <div className="goals-master-bar">
          <div className="goals-master-fill" style={{ width: `${totalPct}%` }} />
        </div>
        {totalPct >= 100 && (
          <div className="goals-completed-msg">🏆 Weekly goal achieved! Great work!</div>
        )}
      </div>

      {/* Goals grid */}
      <div className="goals-grid">
        {goals.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <h3>No Goals This Week</h3>
            <p>Set topic-based hour targets to stay focused and motivated</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <HiOutlinePlus /> Set First Goal
            </button>
          </div>
        )}

        {goals.map((goal) => {
          const pct = goal.targetHours > 0 ? Math.min(100, (goal.actualHours / goal.targetHours) * 100) : 0;
          const color = goal.color || TOPIC_COLORS[goal.topic] || '#6366f1';
          const done = pct >= 100;
          return (
            <div key={goal._id} className={`card goal-card ${done ? 'done' : ''}`}>
              <div className="goal-card-header">
                <div className="goal-topic-badge" style={{ background: color + '22', color }}>
                  {goal.topic}
                </div>
                <div className="goal-card-actions">
                  {done && <HiOutlineCheck style={{ color: 'var(--success)', fontSize: '1.1rem' }} />}
                  <button className="btn-icon" onClick={() => handleEdit(goal)} title="Edit"><HiOutlinePencil /></button>
                  <button className="btn-icon" onClick={() => handleDelete(goal._id)} title="Delete" style={{ color: 'var(--error)' }}><HiOutlineTrash /></button>
                </div>
              </div>

              <div className="goal-hours-row">
                <span className="goal-actual-h" style={{ color }}>{goal.actualHours}h</span>
                <span className="goal-sep"> / </span>
                <span className="goal-target-h">{goal.targetHours}h</span>
              </div>

              <div className="goal-bar-wrap">
                <div className="goal-bar-fill" style={{ width: `${pct}%`, background: color }} />
              </div>

              <div className="goal-pct-label" style={{ color: done ? 'var(--success)' : 'var(--text-muted)' }}>
                {done ? '✅ Complete!' : `${Math.round(pct)}% · ${Math.max(0, goal.targetHours - goal.actualHours).toFixed(1)}h left`}
              </div>

              {goal.notes && <div className="goal-notes">{goal.notes}</div>}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 className="modal-title" style={{ margin: 0 }}>{editGoal ? 'Edit Goal' : '🎯 New Weekly Goal'}</h3>
              <button className="btn-icon" onClick={resetForm}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Topic *</label>
                <select className="form-select" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} id="goal-topic-select">
                  {TOPICS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Target Hours This Week *</label>
                <input type="number" className="form-input" min={0.5} max={100} step={0.5} required value={form.targetHours} onChange={(e) => setForm({ ...form, targetHours: parseFloat(e.target.value) })} id="goal-hours-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-textarea" style={{ minHeight: 70 }} placeholder="Focus areas, resources, etc." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="goal-save-btn">{editGoal ? 'Save Changes' : 'Set Goal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

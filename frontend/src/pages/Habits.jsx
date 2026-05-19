import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineCheck, HiOutlineFire, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getHabits, createHabit, toggleHabitComplete, deleteHabit, updateHabit } from '../api';

const CATEGORIES = ['Practice', 'Reading', 'Lab', 'Review', 'Project', 'Other'];
const ICONS = ['⚡', '📖', '🧪', '🔁', '🚀', '💡', '🐳', '☸️', '🔧', '📝', '🎯', '🌐'];
const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getTodayStr() { return new Date().toISOString().split('T')[0]; }
function getThisWeekDates() {
  const today = new Date();
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', category: 'Practice', targetDaysPerWeek: 5, icon: '⚡', color: '#6366f1' });
  const today = getTodayStr();
  const weekDates = getThisWeekDates();

  useEffect(() => { fetchHabits(); }, []);

  const fetchHabits = async () => {
    try {
      const { data } = await getHabits();
      setHabits(data.data);
    } catch (_) { toast.error('Failed to load habits'); }
    finally { setLoading(false); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleHabitComplete(id);
      setHabits((prev) => prev.map((h) => h._id === id ? data.data : h));
    } catch (_) { toast.error('Failed to update habit'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editHabit) {
        const { data } = await updateHabit(editHabit._id, form);
        setHabits((prev) => prev.map((h) => h._id === editHabit._id ? data.data : h));
        toast.success('Habit updated!');
      } else {
        const { data } = await createHabit(form);
        setHabits((prev) => [...prev, data.data]);
        toast.success('Habit created! 🎯');
      }
      resetForm();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save habit'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this habit?')) return;
    try {
      await deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h._id !== id));
      toast.success('Habit deleted');
    } catch (_) { toast.error('Failed to delete'); }
  };

  const handleEdit = (habit) => {
    setEditHabit(habit);
    setForm({ name: habit.name, description: habit.description || '', category: habit.category, targetDaysPerWeek: habit.targetDaysPerWeek, icon: habit.icon, color: habit.color });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ name: '', description: '', category: 'Practice', targetDaysPerWeek: 5, icon: '⚡', color: '#6366f1' });
    setEditHabit(null);
    setShowForm(false);
  };

  const isDoneToday = (habit) => habit.completions?.some((c) => c.date === today);
  const isDoneOnDay = (habit, date) => habit.completions?.some((c) => c.date === date);
  const weekCount = (habit) => weekDates.filter((d) => isDoneOnDay(habit, d)).length;

  // Summary stats
  const totalHabits = habits.length;
  const completedToday = habits.filter(isDoneToday).length;
  const totalStreaks = habits.reduce((a, h) => a + (h.currentStreak || 0), 0);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>📅 Habits Tracker</h2>
          <p>Build consistent DevOps routines — track weekly habits & streaks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="add-habit-btn">
          <HiOutlinePlus /> New Habit
        </button>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="card stat-card gradient-1">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Habits</span>
            <div className="stat-card-icon icon-1">📅</div>
          </div>
          <div className="stat-card-value">{totalHabits}</div>
          <div className="stat-card-sub">Active habits</div>
        </div>
        <div className="card stat-card gradient-3">
          <div className="stat-card-header">
            <span className="stat-card-label">Done Today</span>
            <div className="stat-card-icon icon-3"><HiOutlineCheck /></div>
          </div>
          <div className="stat-card-value">{completedToday}/{totalHabits}</div>
          <div className="stat-card-sub">{totalHabits > 0 ? Math.round(completedToday/totalHabits*100) : 0}% completion</div>
        </div>
        <div className="card stat-card gradient-4">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Streaks</span>
            <div className="stat-card-icon icon-4"><HiOutlineFire /></div>
          </div>
          <div className="stat-card-value">{totalStreaks} 🔥</div>
          <div className="stat-card-sub">Combined streak days</div>
        </div>
      </div>

      {/* Day header row */}
      {habits.length > 0 && (
        <div className="habits-week-header">
          <div className="habit-name-col" />
          {DAYS.map((d, i) => {
            const isToday = weekDates[i] === today;
            return (
              <div key={d} className={`habit-day-col ${isToday ? 'today' : ''}`}>{d}</div>
            );
          })}
          <div className="habit-streak-col">Streak</div>
          <div className="habit-actions-col" />
        </div>
      )}

      {/* Habit rows */}
      <div className="habits-list">
        {habits.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No Habits Yet</h3>
            <p>Build consistency by adding your first DevOps habit</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <HiOutlinePlus /> Add First Habit
            </button>
          </div>
        )}

        {habits.map((habit) => {
          const done = isDoneToday(habit);
          const wCount = weekCount(habit);
          return (
            <div key={habit._id} className={`habit-row card ${done ? 'done' : ''}`}>
              <div className="habit-name-col">
                <div className="habit-icon" style={{ background: habit.color + '22', color: habit.color }}>{habit.icon}</div>
                <div>
                  <div className="habit-label">{habit.name}</div>
                  <div className="habit-sub">{habit.category} · {habit.targetDaysPerWeek}×/week · {wCount}/{habit.targetDaysPerWeek} this week</div>
                </div>
              </div>

              {weekDates.map((date, i) => {
                const completed = isDoneOnDay(habit, date);
                const isToday = date === today;
                return (
                  <div key={date} className="habit-day-col">
                    <button
                      className={`habit-day-btn ${completed ? 'checked' : ''} ${isToday ? 'today' : ''}`}
                      style={completed ? { background: habit.color, borderColor: habit.color } : {}}
                      onClick={isToday ? () => handleToggle(habit._id) : undefined}
                      disabled={!isToday}
                      title={isToday ? (completed ? 'Mark incomplete' : 'Mark complete') : date}
                    >
                      {completed ? '✓' : ''}
                    </button>
                  </div>
                );
              })}

              <div className="habit-streak-col">
                <span className="streak-fire">
                  {habit.currentStreak > 0 ? `🔥 ${habit.currentStreak}` : `—`}
                </span>
              </div>

              <div className="habit-actions-col">
                <button className="btn-icon" onClick={() => handleEdit(habit)} title="Edit"><HiOutlinePencil /></button>
                <button className="btn-icon" onClick={() => handleDelete(habit._id)} title="Delete" style={{ color: 'var(--error)' }}><HiOutlineTrash /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 className="modal-title" style={{ margin: 0 }}>{editHabit ? 'Edit Habit' : '✨ New Habit'}</h3>
              <button className="btn-icon" onClick={resetForm}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Habit Name *</label>
                <input className="form-input" placeholder="e.g. Practice kubectl daily" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} id="habit-name-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Target Days/Week</label>
                  <input type="number" className="form-input" min={1} max={7} value={form.targetDaysPerWeek} onChange={(e) => setForm({ ...form, targetDaysPerWeek: parseInt(e.target.value) })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Icon</label>
                <div className="icon-picker">
                  {ICONS.map((ic) => (
                    <button type="button" key={ic} className={`icon-btn ${form.icon === ic ? 'selected' : ''}`} onClick={() => setForm({ ...form, icon: ic })}>{ic}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div className="color-picker">
                  {COLORS.map((c) => (
                    <button type="button" key={c} className={`color-btn ${form.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="habit-save-btn">{editHabit ? 'Save Changes' : 'Create Habit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

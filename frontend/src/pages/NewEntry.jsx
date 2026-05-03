import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLightningBolt, HiOutlineCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { createEntry } from '../api';

const TOPICS = [
  'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'AWS', 'Terraform',
  'Ansible', 'Git', 'Networking', 'Monitoring', 'Security',
  'Scripting', 'Nginx', 'Jenkins', 'Other',
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert'];

function NewEntry() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    topic: '',
    description: '',
    timeSpent: '',
    difficulty: '',
    notes: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic || !form.description || !form.timeSpent || !form.difficulty) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await createEntry({
        ...form,
        timeSpent: parseFloat(form.timeSpent),
      });
      toast.success('Entry logged successfully! 🎉');
      navigate('/entries');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create entry';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>⚡ Log Daily Work</h2>
        <p>Record what you learned today</p>
      </div>

      <div className="card form-container">
        <form onSubmit={handleSubmit} id="new-entry-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="entry-date">Date</label>
              <input
                type="date"
                id="entry-date"
                name="date"
                className="form-input"
                value={form.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="entry-time">Time Spent (hours)</label>
              <input
                type="number"
                id="entry-time"
                name="timeSpent"
                className="form-input"
                value={form.timeSpent}
                onChange={handleChange}
                placeholder="e.g. 2.5"
                min="0.25"
                max="24"
                step="0.25"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="entry-topic">Topic</label>
              <select
                id="entry-topic"
                name="topic"
                className="form-select"
                value={form.topic}
                onChange={handleChange}
              >
                <option value="">Select topic...</option>
                {TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="entry-difficulty">Difficulty</label>
              <select
                id="entry-difficulty"
                name="difficulty"
                className="form-select"
                value={form.difficulty}
                onChange={handleChange}
              >
                <option value="">Select difficulty...</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="entry-description">
              What did you do? *
            </label>
            <textarea
              id="entry-description"
              name="description"
              className="form-textarea"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your learning activity..."
              rows="3"
              maxLength="500"
            />
            <div style={{
              textAlign: 'right',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: '4px'
            }}>
              {form.description.length}/500
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="entry-notes">
              Additional Notes (optional)
            </label>
            <textarea
              id="entry-notes"
              name="notes"
              className="form-textarea"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any extra notes, links, or observations..."
              rows="2"
              maxLength="1000"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="submit-entry-btn"
            >
              {loading ? (
                <>Saving...</>
              ) : (
                <>
                  <HiOutlineCheck /> Save Entry
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/entries')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewEntry;

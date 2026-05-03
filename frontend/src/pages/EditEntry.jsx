import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getEntry, updateEntry } from '../api';

const TOPICS = [
  'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'AWS', 'Terraform',
  'Ansible', 'Git', 'Networking', 'Monitoring', 'Security',
  'Scripting', 'Nginx', 'Jenkins', 'Other',
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert'];

function EditEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: '',
    topic: '',
    description: '',
    timeSpent: '',
    difficulty: '',
    notes: '',
  });

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    try {
      const { data } = await getEntry(id);
      const entry = data.data;
      setForm({
        date: new Date(entry.date).toISOString().split('T')[0],
        topic: entry.topic,
        description: entry.description,
        timeSpent: entry.timeSpent.toString(),
        difficulty: entry.difficulty,
        notes: entry.notes || '',
      });
    } catch (err) {
      toast.error('Entry not found');
      navigate('/entries');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEntry(id, {
        ...form,
        timeSpent: parseFloat(form.timeSpent),
      });
      toast.success('Entry updated! ✅');
      navigate('/entries');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>✏️ Edit Entry</h2>
        <p>Update your learning log</p>
      </div>

      <div className="card form-container">
        <form onSubmit={handleSubmit} id="edit-entry-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-date">Date</label>
              <input
                type="date"
                id="edit-date"
                name="date"
                className="form-input"
                value={form.date}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-time">Time Spent (hours)</label>
              <input
                type="number"
                id="edit-time"
                name="timeSpent"
                className="form-input"
                value={form.timeSpent}
                onChange={handleChange}
                min="0.25"
                max="24"
                step="0.25"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-topic">Topic</label>
              <select
                id="edit-topic"
                name="topic"
                className="form-select"
                value={form.topic}
                onChange={handleChange}
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-difficulty">Difficulty</label>
              <select
                id="edit-difficulty"
                name="difficulty"
                className="form-select"
                value={form.difficulty}
                onChange={handleChange}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              name="description"
              className="form-textarea"
              value={form.description}
              onChange={handleChange}
              rows="3"
              maxLength="500"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-notes">Notes</label>
            <textarea
              id="edit-notes"
              name="notes"
              className="form-textarea"
              value={form.notes}
              onChange={handleChange}
              rows="2"
              maxLength="1000"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              id="save-edit-btn"
            >
              {saving ? 'Saving...' : <><HiOutlineCheck /> Save Changes</>}
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

export default EditEntry;

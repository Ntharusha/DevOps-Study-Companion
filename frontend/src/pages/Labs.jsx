import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineBeaker,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineExclamation,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getLabs, createLab, deleteLab, updateLab } from '../api';

const TOPICS = [
  'Docker','Kubernetes','Linux','CI/CD','AWS','Terraform',
  'Ansible','Git','Networking','Monitoring','Security',
  'Scripting','Nginx','Jenkins','Other',
];

function Labs() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    topic: '',
    description: '',
    environment: '',
  });

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const { data } = await getLabs();
      setLabs(data.data);
    } catch (err) {
      toast.error('Failed to load labs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.topic) {
      toast.error('Title and topic are required');
      return;
    }
    try {
      const { data } = await createLab(form);
      setLabs([data.data, ...labs]);
      setForm({ title: '', topic: '', description: '', environment: '' });
      setShowForm(false);
      toast.success('Lab session created! 🧪');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lab');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await updateLab(id, { status });
      setLabs(labs.map((l) => (l._id === id ? data.data : l)));
      toast.success(`Lab marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteLab(deleteId);
      setLabs(labs.filter((l) => l._id !== deleteId));
      toast.success('Lab deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
    setDeleteId(null);
  };

  const statusColors = {
    'in-progress': { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' },
    completed: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981' },
    failed: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' },
    paused: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' },
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>🧪 Lab Logger</h2>
          <p>Track hands-on practice sessions with commands and errors</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} id="new-lab-btn">
          <HiOutlinePlusCircle /> New Lab
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Lab Title *</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Docker multi-stage build"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Topic *</label>
                <select className="form-select" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                  <option value="">Select...</option>
                  {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What are you practicing?" />
              </div>
              <div className="form-group">
                <label className="form-label">Environment</label>
                <input className="form-input" value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })} placeholder="e.g. Ubuntu 22.04, WSL2" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary btn-sm"><HiOutlineCheck /> Create</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Labs List */}
      {labs.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🧪</div>
          <h3>No Labs Yet</h3>
          <p>Start a lab session to track your hands-on practice</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Start First Lab</button>
        </div>
      ) : (
        <div className="entries-list">
          {labs.map((lab) => (
            <div key={lab._id} className="card entry-card">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span className="entry-topic">{lab.title}</span>
                  <span className="entry-tag" style={{
                    background: statusColors[lab.status]?.bg,
                    color: statusColors[lab.status]?.color,
                  }}>
                    {lab.status}
                  </span>
                </div>
                <div className="entry-description">{lab.description || lab.topic}</div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>📁 {lab.topic}</span>
                  <span>📝 {lab.steps?.length || 0} steps</span>
                  <span><HiOutlineExclamation style={{ verticalAlign: 'middle' }} /> {lab.labErrors?.length || 0} errors</span>
                  {lab.environment && <span>💻 {lab.environment}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                <Link to={`/labs/${lab._id}`} className="btn btn-secondary btn-sm">Open</Link>
                {lab.status !== 'completed' && (
                  <button className="btn-icon" title="Mark Complete" onClick={() => handleStatusChange(lab._id, 'completed')} style={{ color: 'var(--success)' }}>
                    <HiOutlineCheck />
                  </button>
                )}
                <button className="btn-icon" onClick={() => setDeleteId(lab._id)} style={{ color: 'var(--error)' }}>
                  <HiOutlineTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete Lab?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>This will permanently remove this lab and all its steps and errors.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}><HiOutlineTrash /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Labs;

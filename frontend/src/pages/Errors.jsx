import { useState, useEffect } from 'react';
import {
  HiOutlinePlusCircle,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineExclamation,
  HiOutlineLightBulb,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getErrors, createError, deleteError, resolveError, suggestFixes } from '../api';

const CATEGORIES = [
  'Docker','Kubernetes','Linux','Git','AWS','Terraform',
  'Ansible','Networking','Nginx','CI/CD','Monitoring',
  'Security','Scripting','Other',
];

function Errors() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [resolvedFilter, setResolvedFilter] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [form, setForm] = useState({
    error: '', context: '', solution: '', category: '', severity: 'medium', tags: '',
  });

  useEffect(() => {
    fetchErrors();
  }, [search, catFilter, resolvedFilter]);

  const fetchErrors = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      if (resolvedFilter) params.resolved = resolvedFilter;
      const { data } = await getErrors(params);
      setErrors(data.data);
    } catch (err) {
      toast.error('Failed to load errors');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.error || !form.category) {
      toast.error('Error message and category are required');
      return;
    }
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [] };
      const { data } = await createError(payload);
      if (data.duplicate) {
        toast.success('Duplicate error found — occurrence count incremented');
      } else {
        toast.success('Error logged! 📝');
      }
      setErrors([data.data, ...errors.filter((er) => er._id !== data.data._id)]);
      setForm({ error: '', context: '', solution: '', category: '', severity: 'medium', tags: '' });
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log error');
    }
  };

  const handleResolve = async (id) => {
    try {
      const { data } = await resolveError(id);
      setErrors(errors.map((er) => er._id === id ? data.data : er));
      toast.success(data.data.resolved ? 'Marked as resolved ✅' : 'Marked as unresolved');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteError(id);
      setErrors(errors.filter((er) => er._id !== id));
      toast.success('Error deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSuggest = async () => {
    if (!form.error) { toast.error('Enter an error to get suggestions'); return; }
    try {
      const { data } = await suggestFixes(form.error);
      setSuggestions(data.data);
      setShowSuggestions(true);
      if (data.data.length === 0) toast('No similar errors found', { icon: '🔍' });
    } catch (err) {
      toast.error('Suggestion lookup failed');
    }
  };

  const severityColors = {
    low: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
    medium: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    high: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    critical: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>⚠️ Error Memory</h2>
          <p>Track errors, find patterns, and remember solutions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} id="new-error-btn">
          <HiOutlinePlusCircle /> Log Error
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(239,68,68,0.15)' }}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Error Message *</label>
              <textarea className="form-textarea" value={form.error} onChange={(e) => setForm({ ...form, error: e.target.value })} placeholder="Paste the error message here..." rows="2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleSuggest} style={{ marginTop: '8px' }}>
                <HiOutlineLightBulb /> Find Similar Solutions
              </button>
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981', marginBottom: '12px' }}>💡 Similar errors with solutions:</div>
                {suggestions.map((s, i) => (
                  <div key={i} style={{ marginBottom: '10px', padding: '10px', background: 'var(--bg-card)', borderRadius: '6px' }}>
                    <code style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{s.error.substring(0, 100)}</code>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Fix: {s.solution}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Seen {s.occurrences}x • {s.category}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select className="form-select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Context</label>
              <input className="form-input" value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} placeholder="What were you doing when this happened?" />
            </div>
            <div className="form-group">
              <label className="form-label">Solution</label>
              <textarea className="form-textarea" value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} placeholder="How did you fix it?" rows="2" />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary btn-sm"><HiOutlineCheck /> Save</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setShowForm(false); setShowSuggestions(false); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <HiOutlineSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search errors..." style={{ paddingLeft: '36px', fontSize: '0.85rem' }} />
        </div>
        <select className="form-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-select" value={resolvedFilter} onChange={(e) => setResolvedFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="true">Resolved</option>
          <option value="false">Unresolved</option>
        </select>
      </div>

      {/* Errors List */}
      {errors.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3>No Errors Logged</h3>
          <p>Log your first error and its solution to start building your knowledge base</p>
        </div>
      ) : (
        <div className="entries-list">
          {errors.map((err) => (
            <div key={err._id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="entry-tag" style={{
                    background: severityColors[err.severity]?.bg,
                    color: severityColors[err.severity]?.color,
                  }}>{err.severity}</span>
                  <span className="entry-tag" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>{err.category}</span>
                  {err.resolved && <span className="entry-tag tag-easy">✅ Resolved</span>}
                  {err.occurrences > 1 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--warning)', fontWeight: 700 }}>
                      ⚡ {err.occurrences}x
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-icon" onClick={() => handleResolve(err._id)} title={err.resolved ? 'Mark unresolved' : 'Mark resolved'} style={{ color: err.resolved ? 'var(--success)' : 'var(--text-muted)' }}>
                    <HiOutlineCheck />
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(err._id)} style={{ color: 'var(--error)' }}>
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#ef4444', display: 'block', padding: '10px', background: 'var(--bg-input)', borderRadius: '6px', marginBottom: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {err.error}
              </code>
              {err.context && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>📋 {err.context}</p>}
              {err.solution && (
                <div style={{ padding: '10px', background: 'rgba(16,185,129,0.06)', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.1)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>SOLUTION:</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{err.solution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Errors;

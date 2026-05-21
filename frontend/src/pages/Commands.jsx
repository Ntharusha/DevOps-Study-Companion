import { useState, useEffect } from 'react';
import {
  HiOutlinePlusCircle,
  HiOutlineSearch,
  HiOutlineClipboardCopy,
  HiOutlineStar,
  HiOutlineTrash,
  HiOutlineCheck,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getCommands, createCommand, deleteCommand, toggleFavorite, useCommand } from '../api';

const CATEGORIES = [
  'Docker','Kubernetes','Linux','Git','AWS','Terraform',
  'Ansible','Networking','Nginx','CI/CD','Monitoring',
  'Security','Scripting','Other',
];

function Commands() {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [form, setForm] = useState({ title: '', command: '', description: '', category: '', tags: '' });

  useEffect(() => {
    fetchCommands();
  }, [search, catFilter, favOnly]);

  const fetchCommands = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      if (favOnly) params.favorite = 'true';
      const { data } = await getCommands(params);
      setCommands(data.data);
    } catch (err) {
      toast.error('Failed to load commands');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.command || !form.category) {
      toast.error('Title, command, and category are required');
      return;
    }
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [] };
      const { data } = await createCommand(payload);
      setCommands([data.data, ...commands]);
      setForm({ title: '', command: '', description: '', category: '', tags: '' });
      setShowForm(false);
      toast.success('Command saved! 💾');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleCopy = async (cmd) => {
    try {
      await navigator.clipboard.writeText(cmd.command);
      await useCommand(cmd._id);
      setCommands(commands.map((c) => c._id === cmd._id ? { ...c, useCount: c.useCount + 1 } : c));
      toast.success('Copied to clipboard! 📋');
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleFavorite = async (id) => {
    try {
      const { data } = await toggleFavorite(id);
      setCommands(commands.map((c) => c._id === id ? data.data : c));
    } catch {
      toast.error('Failed to toggle favorite');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCommand(id);
      setCommands(commands.filter((c) => c._id !== id));
      toast.success('Command deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>💻 Command Library</h2>
          <p>Save and quickly reuse your DevOps commands</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} id="new-command-btn">
          <HiOutlinePlusCircle /> Add Command
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. List running containers" />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Docker, Python, Git"
                  list="categories-list"
                  required
                />
                <datalist id="categories-list">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Command *</label>
              <input className="form-input" value={form.command} onChange={(e) => setForm({ ...form, command: e.target.value })} placeholder="docker ps -a" style={{ fontFamily: 'var(--font-mono)' }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this command does" />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="container, list, ps" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary btn-sm"><HiOutlineCheck /> Save</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <HiOutlineSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search commands..." style={{ paddingLeft: '36px', fontSize: '0.85rem' }} />
        </div>
        <select className="form-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className={`btn btn-sm ${favOnly ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFavOnly(!favOnly)}>
          <HiOutlineStar /> Favorites
        </button>
      </div>

      {/* Commands Grid */}
      {commands.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">💻</div>
          <h3>No Commands Saved</h3>
          <p>Start building your DevOps command library</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {commands.map((cmd) => (
            <div key={cmd._id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>{cmd.title}</div>
                  <span className="entry-tag" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>{cmd.category}</span>
                </div>
                <button className="btn-icon" onClick={() => handleFavorite(cmd._id)} style={{ color: cmd.isFavorite ? '#f59e0b' : 'var(--text-muted)' }}>
                  <HiOutlineStar />
                </button>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent-secondary)', marginBottom: '10px', overflow: 'auto', whiteSpace: 'nowrap' }}>
                $ {cmd.command}
              </div>
              {cmd.description && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{cmd.description}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Used {cmd.useCount}x</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(cmd)}>
                    <HiOutlineClipboardCopy /> Copy
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(cmd._id)} style={{ color: 'var(--error)' }}>
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Commands;

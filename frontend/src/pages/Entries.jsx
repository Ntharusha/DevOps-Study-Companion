import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlusCircle,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getEntries, deleteEntry } from '../api';

function Entries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ topic: '', difficulty: '' });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, [filter]);

  const fetchEntries = async () => {
    try {
      const params = {};
      if (filter.topic) params.topic = filter.topic;
      if (filter.difficulty) params.difficulty = filter.difficulty;
      const { data } = await getEntries(params);
      setEntries(data.data);
    } catch (err) {
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEntry(deleteId);
      setEntries(entries.filter((e) => e._id !== deleteId));
      toast.success('Entry deleted');
    } catch (err) {
      toast.error('Failed to delete entry');
    }
    setDeleteId(null);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleString('en-US', { month: 'short' }),
    };
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
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h2>📋 All Entries</h2>
          <p>{entries.length} learning sessions recorded</p>
        </div>
        <Link to="/new" className="btn btn-primary" id="add-new-entry-btn">
          <HiOutlinePlusCircle /> New Entry
        </Link>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="form-select"
          value={filter.topic}
          onChange={(e) => setFilter({ ...filter, topic: e.target.value })}
          id="filter-topic"
        >
          <option value="">All Topics</option>
          {[
            'Docker','Kubernetes','Linux','CI/CD','AWS','Terraform',
            'Ansible','Git','Networking','Monitoring','Security',
            'Scripting','Nginx','Jenkins','Other',
          ].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          className="form-select"
          value={filter.difficulty}
          onChange={(e) =>
            setFilter({ ...filter, difficulty: e.target.value })
          }
          id="filter-difficulty"
        >
          <option value="">All Difficulties</option>
          {['Easy', 'Medium', 'Hard', 'Expert'].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {(filter.topic || filter.difficulty) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setFilter({ topic: '', difficulty: '' })}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No Entries Found</h3>
          <p>
            {filter.topic || filter.difficulty
              ? 'Try clearing filters'
              : 'Start logging your DevOps learning journey'}
          </p>
          <Link to="/new" className="btn btn-primary">
            Log Your First Entry
          </Link>
        </div>
      ) : (
        <div className="entries-list">
          {entries.map((entry, i) => {
            const { day, month } = formatDate(entry.date);
            return (
              <div
                key={entry._id}
                className="card entry-card"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="entry-date-badge">
                  <span className="day">{day}</span>
                  <span className="month">{month}</span>
                </div>
                <div className="entry-info">
                  <div className="entry-topic">{entry.topic}</div>
                  <div className="entry-description">
                    {entry.description}
                  </div>
                </div>
                <div className="entry-meta">
                  <span
                    className={`entry-tag tag-${entry.difficulty.toLowerCase()}`}
                  >
                    {entry.difficulty}
                  </span>
                  <span className="entry-hours">{entry.timeSpent}h</span>
                </div>
                <div className="entry-actions">
                  <Link
                    to={`/edit/${entry._id}`}
                    className="btn-icon"
                    title="Edit"
                  >
                    <HiOutlinePencil />
                  </Link>
                  <button
                    className="btn-icon"
                    onClick={() => setDeleteId(entry._id)}
                    title="Delete"
                    style={{ color: 'var(--error)' }}
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">Delete Entry?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              This action cannot be undone. The entry will be permanently
              removed.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                id="confirm-delete-btn"
              >
                <HiOutlineTrash /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Entries;

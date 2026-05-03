import { useState, useEffect } from 'react';
import { 
  HiOutlineLightningBolt, 
  HiOutlinePlusCircle, 
  HiOutlineSearch, 
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineStar,
  HiOutlineAcademicCap
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getMemoryItems, createMemoryItem, reviewMemoryItem, deleteMemoryItem } from '../api';

const CATEGORIES = ['Commands', 'Concepts', 'Networking', 'Architecture', 'Troubleshooting', 'Other'];

function MemoryBank() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [revealed, setRevealed] = useState({});
  const [form, setForm] = useState({ concept: '', explanation: '', category: 'Concepts' });

  useEffect(() => {
    fetchItems();
  }, [search, category]);

  const fetchItems = async () => {
    try {
      const { data } = await getMemoryItems({ search, category });
      setItems(data.data);
    } catch (err) {
      toast.error('Failed to load memory bank');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createMemoryItem(form);
      setItems([data.data, ...items]);
      setForm({ concept: '', explanation: '', category: 'Concepts' });
      setShowForm(false);
      toast.success('Added to Memory Bank!');
    } catch (err) {
      toast.error('Failed to add item');
    }
  };

  const handleReview = async (id, strength) => {
    try {
      const { data } = await reviewMemoryItem(id, strength);
      setItems(items.map(item => item._id === id ? data.data : item));
      toast.success('Progress updated!');
      // Auto-hide the answer after review
      setRevealed(prev => ({ ...prev, [id]: false }));
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this from your memory bank?')) return;
    try {
      await deleteMemoryItem(id);
      setItems(items.filter(item => item._id !== id));
      toast.success('Removed');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const toggleReveal = (id) => {
    setRevealed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>🧠 Memory Bank</h2>
          <p>Don't forget the important stuff. Use spaced repetition to master DevOps concepts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <HiOutlinePlusCircle /> Add Item
        </button>
      </div>

      <div className="filter-bar" style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <div className="input-with-icon" style={{ flex: 1, minWidth: '250px' }}>
          <HiOutlineSearch className="input-icon" />
          <input 
            className="form-input" 
            placeholder="Search concepts or explanations..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <select className="form-select" style={{ width: '200px' }} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '25px', border: '1px solid var(--accent-primary)' }}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Concept / Question *</label>
              <input 
                className="form-input" 
                value={form.concept} 
                onChange={(e) => setForm({ ...form, concept: e.target.value })} 
                placeholder="e.g. Difference between soft link and hard link"
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Explanation / Answer *</label>
              <textarea 
                className="form-textarea" 
                rows="3"
                value={form.explanation} 
                onChange={(e) => setForm({ ...form, explanation: e.target.value })} 
                placeholder="The detailed answer you want to remember..."
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Save to Bank</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="memory-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {items.map(item => (
          <div key={item._id} className="card memory-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className="entry-tag" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>{item.category}</span>
                <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                  {[...Array(5)].map((_, i) => (
                    <HiOutlineStar key={i} style={{ opacity: i < item.strength ? 1 : 0.2 }} />
                  ))}
                </div>
              </div>
              <button className="btn-icon" onClick={() => handleDelete(item._id)} style={{ color: 'var(--error)' }}><HiOutlineTrash /></button>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px' }}>{item.concept}</h3>
            
            <button className="btn btn-secondary btn-sm" onClick={() => toggleReveal(item._id)} style={{ width: '100%', marginBottom: revealed[item._id] ? '15px' : '0' }}>
              {revealed[item._id] ? <><HiOutlineChevronUp /> Hide Answer</> : <><HiOutlineChevronDown /> Reveal Answer</>}
            </button>

            {revealed[item._id] && (
              <div className="reveal-content animate-in" style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-primary)' }}>
                <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '20px' }}>{item.explanation}</p>
                
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>How well do you know this?</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <button 
                        key={lvl} 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleReview(item._id, lvl)}
                        style={{ flex: 1, padding: '8px' }}
                      >
                        {lvl === 1 ? 'Hard' : lvl === 5 ? 'Easy' : lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              Next review: {new Date(item.nextReview).toLocaleDateString()}
            </div>
          </div>
        ))}

        {items.length === 0 && !loading && (
          <div className="empty-state">
            <HiOutlineAcademicCap style={{ fontSize: '3rem', opacity: 0.2 }} />
            <h3>Your Memory Bank is empty</h3>
            <p>Add concepts, commands, or architecture details you want to memorize.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '15px' }}>Add First Item</button>
          </div>
        )}
      </div>

      <style>{`
        .memory-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .memory-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
}

export default MemoryBank;

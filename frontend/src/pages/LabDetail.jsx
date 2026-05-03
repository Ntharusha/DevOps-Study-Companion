import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlinePlusCircle,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineExclamation,
  HiOutlineTerminal,
  HiOutlineArrowLeft,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getLab, addLabStep, addLabError, updateLab } from '../api';

function LabDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStepForm, setShowStepForm] = useState(false);
  const [showErrorForm, setShowErrorForm] = useState(false);
  const [stepForm, setStepForm] = useState({ command: '', output: '', notes: '', status: 'success' });
  const [errorForm, setErrorForm] = useState({ error: '', fix: '' });

  useEffect(() => {
    fetchLab();
  }, [id]);

  const fetchLab = async () => {
    try {
      const { data } = await getLab(id);
      setLab(data.data);
    } catch (err) {
      toast.error('Lab not found');
      navigate('/labs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = async (e) => {
    e.preventDefault();
    if (!stepForm.command) { toast.error('Command is required'); return; }
    try {
      const { data } = await addLabStep(id, stepForm);
      setLab(data.data);
      setStepForm({ command: '', output: '', notes: '', status: 'success' });
      setShowStepForm(false);
      toast.success('Step added');
    } catch (err) {
      toast.error('Failed to add step');
    }
  };

  const handleAddError = async (e) => {
    e.preventDefault();
    if (!errorForm.error) { toast.error('Error message is required'); return; }
    try {
      const { data } = await addLabError(id, errorForm);
      setLab(data.data);
      setErrorForm({ error: '', fix: '' });
      setShowErrorForm(false);
      toast.success('Error logged');
    } catch (err) {
      toast.error('Failed to log error');
    }
  };

  const statusIcon = {
    success: { icon: '✅', color: '#10b981' },
    error: { icon: '❌', color: '#ef4444' },
    warning: { icon: '⚠️', color: '#f59e0b' },
    info: { icon: 'ℹ️', color: '#3b82f6' },
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!lab) return null;

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/labs')} style={{ marginBottom: '16px' }}>
          <HiOutlineArrowLeft /> Back to Labs
        </button>
        <div className="page-header">
          <h2>🧪 {lab.title}</h2>
          <p>{lab.topic} {lab.environment ? `• ${lab.environment}` : ''}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowStepForm(!showStepForm)}>
          <HiOutlineTerminal /> Add Command Step
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowErrorForm(!showErrorForm)} style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
          <HiOutlineExclamation /> Log Error
        </button>
      </div>

      {/* Add Step Form */}
      {showStepForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '0.95rem', fontWeight: 700 }}>Add Command Step</h4>
          <form onSubmit={handleAddStep}>
            <div className="form-group">
              <label className="form-label">Command *</label>
              <input className="form-input" value={stepForm.command} onChange={(e) => setStepForm({ ...stepForm, command: e.target.value })} placeholder="$ docker build -t myapp ." style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Output</label>
              <textarea className="form-textarea" value={stepForm.output} onChange={(e) => setStepForm({ ...stepForm, output: e.target.value })} placeholder="Command output..." rows="2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-input" value={stepForm.notes} onChange={(e) => setStepForm({ ...stepForm, notes: e.target.value })} placeholder="What this does..." />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={stepForm.status} onChange={(e) => setStepForm({ ...stepForm, status: e.target.value })}>
                  <option value="success">✅ Success</option>
                  <option value="error">❌ Error</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="info">ℹ️ Info</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary btn-sm"><HiOutlineCheck /> Add</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowStepForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Error Form */}
      {showErrorForm && (
        <div className="card" style={{ marginBottom: '20px', borderColor: 'rgba(239,68,68,0.2)' }}>
          <h4 style={{ marginBottom: '16px', fontSize: '0.95rem', fontWeight: 700, color: '#ef4444' }}>Log Error</h4>
          <form onSubmit={handleAddError}>
            <div className="form-group">
              <label className="form-label">Error Message *</label>
              <textarea className="form-textarea" value={errorForm.error} onChange={(e) => setErrorForm({ ...errorForm, error: e.target.value })} placeholder="Error: permission denied..." rows="2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Fix / Solution</label>
              <textarea className="form-textarea" value={errorForm.fix} onChange={(e) => setErrorForm({ ...errorForm, fix: e.target.value })} placeholder="How you fixed it..." rows="2" />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary btn-sm"><HiOutlineCheck /> Log Error</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowErrorForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Steps Timeline */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>📝 Command Steps ({lab.steps.length})</h3>
        {lab.steps.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No steps recorded yet. Add your first command above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lab.steps.map((step, i) => (
              <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${statusIcon[step.status]?.color || '#64748b'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{i + 1}</span>
                  <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>$ {step.command}</code>
                </div>
                {step.output && (
                  <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', margin: '6px 0', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'auto', maxHeight: '120px', whiteSpace: 'pre-wrap' }}>{step.output}</pre>
                )}
                {step.notes && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{step.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Errors */}
      {lab.labErrors.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: '#ef4444' }}>⚠️ Errors ({lab.labErrors.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lab.labErrors.map((err, i) => (
              <div key={i} style={{ padding: '12px', background: 'rgba(239,68,68,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.1)' }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#ef4444' }}>{err.error}</code>
                {err.fix && (
                  <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(16,185,129,0.06)', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.1)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>FIX:</span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{err.fix}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LabDetail;

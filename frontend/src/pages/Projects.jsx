import { useState, useEffect } from 'react';
import { 
  HiOutlineFolderAdd, 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineExternalLink,
  HiOutlineLightningBolt
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getProjects, createProject, updateProject, deleteProject, addProjectTime } from '../api';

const STATUS_OPTIONS = ['planning', 'in-progress', 'completed', 'on-hold'];

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [timeModal, setTimeModal] = useState(null); // project id
  const [addedHours, setAddedHours] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'planning',
    technologies: '',
    githubUrl: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        technologies: form.technologies.split(',').map(t => t.trim()).filter(t => t),
      };
      const { data } = await createProject(payload);
      setProjects([data.data, ...projects]);
      setShowForm(false);
      setForm({ name: '', description: '', status: 'planning', technologies: '', githubUrl: '' });
      toast.success('Project added successfully!');
    } catch (err) {
      toast.error('Failed to create project');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await updateProject(id, { status });
      setProjects(projects.map(p => p._id === id ? data.data : p));
      toast.success(`Project marked as ${status}`);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleAddTime = async (e) => {
    e.preventDefault();
    if (!addedHours || isNaN(addedHours)) return;
    try {
      const { data } = await addProjectTime(timeModal, addedHours);
      setProjects(projects.map(p => p._id === timeModal ? data.data : p));
      setTimeModal(null);
      setAddedHours('');
      toast.success(`Added ${addedHours} hours!`);
    } catch (err) {
      toast.error('Failed to add time');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'on-hold': return '#f59e0b';
      default: return '#64748b';
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>📁 Project Tracker</h2>
          <p>Manage your DevOps projects and track time spent on each.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <HiOutlineFolderAdd /> New Project
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input 
                className="form-input" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
                placeholder="e.g. Kubernetes Monitoring Stack"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="form-textarea" 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                placeholder="What is this project about?"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Technologies (comma separated)</label>
                <input 
                  className="form-input" 
                  value={form.technologies} 
                  onChange={(e) => setForm({ ...form, technologies: e.target.value })} 
                  placeholder="Docker, Prometheus, Grafana"
                />
              </div>
              <div className="form-group">
                <label className="form-label">GitHub URL</label>
                <input 
                  className="form-input" 
                  value={form.githubUrl} 
                  onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} 
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Create Project</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {projects.map(project => (
          <div key={project._id} className="card project-card" style={{ position: 'relative', borderLeft: `4px solid ${getStatusColor(project.status)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div className={`entry-tag tag-${project.status.replace('-', '')}`}>{project.status}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-icon" onClick={() => setTimeModal(project._id)} title="Add Time"><HiOutlineClock /></button>
                <button className="btn-icon" onClick={() => handleDelete(project._id)} style={{ color: 'var(--error)' }}><HiOutlineTrash /></button>
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>{project.name}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>{project.description}</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {project.technologies.map(tech => (
                <span key={tech} className="entry-tag" style={{ background: 'var(--bg-input)', fontSize: '0.7rem' }}>{tech}</span>
              ))}
            </div>

            <div className="project-stats" style={{ display: 'flex', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time Spent</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{project.timeSpent}h</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Started</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{new Date(project.startDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              {project.status !== 'completed' && (
                <button className="btn btn-secondary btn-sm" onClick={() => handleStatusChange(project._id, 'completed')}>
                  <HiOutlineCheckCircle /> Mark Complete
                </button>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                  <HiOutlineExternalLink /> GitHub
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !showForm && (
        <div className="empty-state">
          <HiOutlineFolderAdd style={{ fontSize: '3rem', opacity: 0.2 }} />
          <h3>No projects tracked yet</h3>
          <p>Start tracking your side projects and time spent on them.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '15px' }}>
            Add Your First Project
          </button>
        </div>
      )}

      {/* Time Modal */}
      {timeModal && (
        <div className="modal-overlay" onClick={() => setTimeModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Add Time Worked</h3>
            <p>How many hours did you spend on this project today?</p>
            <form onSubmit={handleAddTime} style={{ marginTop: '16px' }}>
              <input 
                autoFocus
                className="form-input" 
                type="number" 
                step="0.5"
                placeholder="Hours (e.g. 2.5)" 
                value={addedHours} 
                onChange={(e) => setAddedHours(e.target.value)}
                required
              />
              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">Add Time</button>
                <button type="button" className="btn btn-secondary" onClick={() => setTimeModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;

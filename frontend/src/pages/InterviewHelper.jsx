import { useState, useEffect } from 'react';
import {
  HiOutlineQuestionMarkCircle,
  HiOutlineLightBulb,
  HiOutlineStar,
  HiOutlineRefresh,
  HiOutlineBookOpen,
  HiOutlinePlusCircle,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import {
  getInterviewQuestions,
  getRandomQuestions,
  toggleQuestionFavorite,
  createInterviewQuestion,
  seedInterviewBank,
} from '../api';

const CATEGORIES = [
  'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'AWS', 'Terraform',
  'Ansible', 'Git', 'Networking', 'Monitoring', 'Security',
  'General', 'System Design', 'Other',
];

function InterviewHelper() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('bank'); // 'bank' or 'mock'
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    answer: '',
    category: 'General',
    difficulty: 'Easy',
  });
  const [revealedAnswers, setRevealedAnswers] = useState({});

  useEffect(() => {
    if (mode === 'bank') {
      fetchQuestions();
    } else {
      startMock();
    }
  }, [mode, search, category]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await getInterviewQuestions({ search, category });
      setQuestions(data.data);
    } catch (err) {
      toast.error('Failed to load question bank');
    } finally {
      setLoading(false);
    }
  };

  const startMock = async () => {
    setLoading(true);
    setRevealedAnswers({});
    try {
      const { data } = await getRandomQuestions({ count: 5, category });
      setQuestions(data.data);
    } catch (err) {
      toast.error('Failed to start mock interview');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (id) => {
    try {
      const { data } = await toggleQuestionFavorite(id);
      setQuestions(questions.map((q) => (q._id === id ? data.data : q)));
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createInterviewQuestion(newQuestion);
      setQuestions([data.data, ...questions]);
      setShowForm(false);
      setNewQuestion({ question: '', answer: '', category: 'General', difficulty: 'Easy' });
      toast.success('Question added to bank');
    } catch (err) {
      toast.error('Failed to add question');
    }
  };

  const handleSeed = async () => {
    const loadingToast = toast.loading('Seeding question bank...');
    try {
      const { data } = await seedInterviewBank();
      toast.success(`Successfully seeded ${data.count} questions!`, { id: loadingToast });
      fetchQuestions();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to seed question bank';
      toast.error(msg, { id: loadingToast });
    }
  };

  const toggleAnswer = (id) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>🎓 DevOps Interview Helper</h2>
          <p>Master your DevOps intern interviews with our curated question bank and mock sessions.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={`btn ${mode === 'bank' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('bank')}>
            <HiOutlineBookOpen /> Question Bank
          </button>
          <button className={`btn ${mode === 'mock' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('mock')}>
            <HiOutlineRefresh /> Mock Interview
          </button>
        </div>
      </div>

      {mode === 'bank' && (
        <div className="filter-bar">
          <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
            <input
              className="form-input"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-secondary" onClick={() => setShowForm(!showForm)}>
            <HiOutlinePlusCircle /> Add Question
          </button>
        </div>
      )}

      {showForm && mode === 'bank' && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Question</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Answer</label>
              <textarea
                className="form-textarea"
                rows="3"
                value={newQuestion.answer}
                onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={newQuestion.category}
                  onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                  placeholder="e.g. General, Docker, Git"
                  list="categories-list"
                  required
                />
                <datalist id="categories-list">
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select
                  className="form-select"
                  value={newQuestion.difficulty}
                  onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Save to Bank</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <HiOutlineQuestionMarkCircle style={{ fontSize: '3rem', opacity: 0.3 }} />
          <h3>No questions found</h3>
          <p>Try adjusting your filters or prepopulate your bank with our curated questions.</p>
          <button className="btn btn-primary" onClick={handleSeed} style={{ marginTop: '15px' }}>
            <HiOutlineRefresh /> Seed with Curated Questions
          </button>
        </div>
      ) : (
        <div className="entries-list">
          {mode === 'mock' && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <button className="btn btn-secondary" onClick={startMock}>
                <HiOutlineRefresh /> Generate New Mock Set
              </button>
            </div>
          )}
          {questions.map((q) => (
            <div key={q._id} className="card" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className={`entry-tag tag-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                  <span className="entry-tag" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>{q.category}</span>
                </div>
                <button className="btn-icon" onClick={() => handleFavorite(q._id)} style={{ color: q.isFavorite ? '#f59e0b' : 'inherit' }}>
                  <HiOutlineStar />
                </button>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>Q: {q.question}</h4>
              
              <button className="btn btn-secondary btn-sm" onClick={() => toggleAnswer(q._id)}>
                {revealedAnswers[q._id] ? 'Hide Answer' : 'Show Answer'}
              </button>

              {revealedAnswers[q._id] && (
                <div style={{ marginTop: '15px', padding: '15px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-primary)' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', color: 'var(--accent-primary)' }}>
                    <HiOutlineLightBulb /> <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Suggested Answer</span>
                  </div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{q.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InterviewHelper;

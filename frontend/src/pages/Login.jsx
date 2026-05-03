import { useState } from 'react';
import { HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { login } from '../api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login({ username, password });
      if (data.success) {
        localStorage.setItem('devops_user', JSON.stringify(data.user));
        onLogin(data.user);
        toast.success('Welcome back, ' + data.user.username);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-in">
        <div className="login-header">
          <div className="login-logo">🚀</div>
          <h2>DevOps Companion</h2>
          <p>Sign in to your learning dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-with-icon">
              <HiOutlineUser className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <HiOutlineLockClosed className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Personal Use Only • Ghost69</p>
        </div>
      </div>
      
      <style>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--bg-main);
          padding: 20px;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          background: var(--bg-card);
          padding: 40px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
        }
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .login-logo {
          font-size: 3rem;
          margin-bottom: 16px;
        }
        .login-header h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 8px;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .login-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .input-with-icon {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .input-with-icon .form-input {
          padding-left: 40px;
        }
        .btn-block {
          width: 100%;
          margin-top: 24px;
          padding: 12px;
          font-weight: 700;
        }
        .login-footer {
          margin-top: 32px;
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-color);
          padding-top: 24px;
        }
      `}</style>
    </div>
  );
}

export default Login;

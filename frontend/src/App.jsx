import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NewEntry from './pages/NewEntry';
import Entries from './pages/Entries';
import EditEntry from './pages/EditEntry';
import Labs from './pages/Labs';
import LabDetail from './pages/LabDetail';
import Commands from './pages/Commands';
import Errors from './pages/Errors';
import Reports from './pages/Reports';
import InterviewHelper from './pages/InterviewHelper';
import Projects from './pages/Projects';
import MemoryBank from './pages/MemoryBank';
import Login from './pages/Login';
import { HiMenu } from 'react-icons/hi';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('devops_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('devops_user');
    setUser(null);
  };

  if (loading) return null;

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="bottom-right" />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          user={user}
          onLogout={handleLogout}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewEntry />} />
            <Route path="/entries" element={<Entries />} />
            <Route path="/edit/:id" element={<EditEntry />} />
            <Route path="/labs" element={<Labs />} />
            <Route path="/labs/:id" element={<LabDetail />} />
            <Route path="/commands" element={<Commands />} />
            <Route path="/errors" element={<Errors />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/interview" element={<InterviewHelper />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/memory" element={<MemoryBank />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          id="mobile-menu-toggle"
        >
          <HiMenu />
        </button>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'toast-custom',
          duration: 3000,
        }}
      />
    </BrowserRouter>
  );
}

export default App;

import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { HiMenu } from 'react-icons/hi';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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

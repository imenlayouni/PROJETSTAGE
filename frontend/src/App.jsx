import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import './styles/Sidebar.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskManagement from './pages/TaskManagement';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Employees from './pages/Employees';
import Chat from './pages/Chat';

import Sidebar from './components/Sidebar';

// Protected Route Component
function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Watches route/location changes and updates authentication state from localStorage
function AuthWatcher({ setIsAuthenticated }) {
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, [location, setIsAuthenticated]);

  return null;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      {/* AuthWatcher updates isAuthenticated when route/location changes (so login navigation shows sidebar without reload) */}
      <AuthWatcher setIsAuthenticated={setIsAuthenticated} />
      <div>
        {isAuthenticated && <Sidebar />}

        <div className={isAuthenticated ? 'has-sidebar' : ''}>
          {isAuthenticated && (
            <header className="topbar">
              <div className="profile-area">
                <div className="profile-name">{JSON.parse(localStorage.getItem('user') || 'null')?.name}</div>
                <div className="profile-icon">{(JSON.parse(localStorage.getItem('user') || 'null')?.name || 'U').charAt(0).toUpperCase()}</div>
              </div>
            </header>
          )}

          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <TaskManagement />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            {/* Default Route */}
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo">📋</div>
        <div className="app-name">Task Manager</div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/tasks">Tasks</Link></li>
          <li><Link to="/calendar">Calendar</Link></li>
          <li><Link to="/employees">Employees</Link></li>
          <li><Link to="/chat">Chat</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
      </nav>

      <div className="sidebar-bottom">
        <div className="user-info">
          <div className="avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
          <div className="user-details">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
 

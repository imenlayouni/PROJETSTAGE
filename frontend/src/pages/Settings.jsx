import React, { useState, useEffect } from 'react';
import '../styles/Settings.css';

function Settings() {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    language: 'en'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id) return;

    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/settings/${user.id}`);
        if (!response.ok) return;
        const data = await response.json();
        setSettings({
          theme: data.theme || 'light',
          notifications: typeof data.notifications === 'boolean' ? data.notifications : true,
          language: data.language || 'en'
        });
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };

    fetchSettings();
  }, [user.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
  const response = await fetch(`/api/settings/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings');
      }
    } catch (err) {
      setMessage('Error saving settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your preferences</p>
      </div>

      <div className="settings-card">
        <h2>Profile</h2>
        <div className="setting-item">
          <label>Email:</label>
          <p className="setting-value">{user.email}</p>
        </div>
        <div className="setting-item">
          <label>Name:</label>
          <p className="setting-value">{user.name}</p>
        </div>
      </div>

      <div className="settings-card">
        <h2>Preferences</h2>
        
        <div className="setting-item">
          <label htmlFor="theme">Theme</label>
          <select 
            id="theme"
            name="theme" 
            value={settings.theme} 
            onChange={handleChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div className="setting-item">
          <label htmlFor="language">Language</label>
          <select 
            id="language"
            name="language" 
            value={settings.language} 
            onChange={handleChange}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div className="setting-item checkbox">
          <input
            type="checkbox"
            id="notifications"
            name="notifications"
            checked={settings.notifications}
            onChange={handleChange}
          />
          <label htmlFor="notifications">Enable Notifications</label>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="settings-actions">
        <button 
          className="btn-primary" 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
        <button className="btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Settings;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/Header';
import '../styles/Settings.css';

export const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    theme: theme || 'light',
    autoReminders: true,
    smartRevisionReminders: true,
    reminderTime: '09:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await settingsAPI.getSettings();
      if (data.success && data.preferences) {
        setSettings(data.preferences);
      } else if (data.preferences) {
        setSettings(data.preferences);
      } else {
        // Fallback to defaults if no preferences returned
        setSettings({
          theme: 'light',
          autoReminders: true,
          smartRevisionReminders: true,
          reminderTime: '09:00'
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      // Set defaults on error
      setSettings({
        theme: 'light',
        autoReminders: true,
        smartRevisionReminders: true,
        reminderTime: '09:00'
      });
      setError('Using default settings');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setSettings({ ...settings, theme: newTheme });
    if (newTheme !== theme) {
      toggleTheme();
    }
  };

  const handleAutoRemindersChange = () => {
    setSettings({ ...settings, autoReminders: !settings.autoReminders });
  };

  const handleSmartRevisionRemindersChange = () => {
    setSettings({ ...settings, smartRevisionReminders: !settings.smartRevisionReminders });
  };

  const handleReminderTimeChange = (e) => {
    setSettings({ ...settings, reminderTime: e.target.value });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const data = await settingsAPI.updateSettings(
        settings.theme,
        settings.autoReminders,
        settings.smartRevisionReminders,
        settings.reminderTime
      );

      if (data.success) {
        setMessage('✅ Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <Header />
        <div className="settings-container">
          <div className="loader">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <Header />
      <div className="settings-container">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>

        <div className="settings-header">
          <h1>⚙️ Settings</h1>
          <p className="subtitle">Customize your learning experience</p>
        </div>

        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">ℹ️ {error} (using default settings)</div>}

        <div className="settings-content">
          {/* Appearance Settings */}
          <div className="settings-section">
            <h2 className="section-title">🎨 Appearance</h2>
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Theme</label>
                <p className="setting-description">Choose your preferred color scheme</p>
              </div>
              <div className="theme-selector">
                <button
                  className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  ☀️ Light
                </button>
                <button
                  className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          </div>

          {/* Reminders Settings */}
          <div className="settings-section">
            <h2 className="section-title">🔔 Reminders & Notifications</h2>
            
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Smart Revision Reminders</label>
                <p className="setting-description">
                  Receive automatic reminders for topics due for revision (Day 7, 30 schedule)
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.smartRevisionReminders}
                  onChange={handleSmartRevisionRemindersChange}
                />
                <span className="slider"></span>
              </label>
            </div>

            {settings.smartRevisionReminders && (
              <div className="setting-item">
                <div className="setting-info">
                  <label className="setting-label">Reminder Time</label>
                  <p className="setting-description">
                    When should we remind you about your revisions?
                  </p>
                </div>
                <input
                  type="time"
                  className="time-input"
                  value={settings.reminderTime}
                  onChange={handleReminderTimeChange}
                />
              </div>
            )}

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">General Notifications</label>
                <p className="setting-description">
                  Receive general app notifications and updates
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoReminders}
                  onChange={handleAutoRemindersChange}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Revision System Info */}
          <div className="settings-section info-section">
            <h2 className="section-title">📚 Smart Revision System</h2>
            <div className="info-box">
              <p className="info-title">How our revision system works:</p>
              <ul className="info-list">
                <li>
                  <span className="stage">Stage 1:</span>
                  <span className="details">Day 7 → Initial reinforcement (prepare for long-term storage)</span>
                </li>
                <li>
                  <span className="stage">Stage 2:</span>
                  <span className="details">Day 30 → Long-term retention (permanent memory)</span>
                </li>
              </ul>
              
              <p className="info-title mt-3">Adaptive Learning:</p>
              <ul className="info-list">
                <li>
                  <span className="score">Score &lt; 60%:</span>
                  <span className="details">Shorter intervals (0.7x multiplier) for extra practice</span>
                </li>
                <li>
                  <span className="score">Score 60-80%:</span>
                  <span className="details">Standard intervals for steady progress</span>
                </li>
                <li>
                  <span className="score">Score &gt; 80%:</span>
                  <span className="details">Longer intervals (1.5x multiplier) for confident retention</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button
            className="btn-save"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : '✓ Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

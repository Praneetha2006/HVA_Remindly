import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

export const Header = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>Remindly</h1>
        </div>
        <div className="user-info">
          <span className="points">🎯 {user.totalPoints} Points</span>
          <span className="streak">🔥 {user.streak} Streak</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

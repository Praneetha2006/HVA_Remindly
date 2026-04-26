import React, { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';
import '../styles/Leaderboard.css';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await leaderboardAPI.getLeaderboard();
        if (data.success) {
          setLeaderboard(data.leaderboard);
        } else {
          setError(data.message || 'Failed to load leaderboard');
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p className="subtitle">Top performers on Remindly</p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loader">Loading leaderboard...</div>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="leaderboard-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="rank-col">Rank</th>
                <th className="name-col">Name</th>
                <th className="points-col">Points</th>
                <th className="streak-col">Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, index) => (
                <tr key={user._id || index} className={`rank-${user.rank} ${user.rank <= 3 ? 'top-3' : ''}`}>
                  <td className="rank-cell">
                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                  </td>
                  <td className="name-cell">{user.name}</td>
                  <td className="points-cell">{user.points}</td>
                  <td className="streak-cell">🔥 {user.streak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

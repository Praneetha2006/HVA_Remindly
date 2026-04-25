import React, { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';
import { Header } from '../components/Header';
import '../styles/Leaderboard.css';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await leaderboardAPI.getLeaderboard();
        if (data.success) {
          setLeaderboard(data.leaderboard);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="leaderboard">
      <Header />
      <div className="leaderboard-container">
        <h2>🏆 Leaderboard</h2>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Points</th>
              <th>Streak</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user) => (
              <tr key={user.rank} className={user.rank <= 3 ? 'top-3' : ''}>
                <td className="rank">
                  {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                </td>
                <td>{user.name}</td>
                <td className="points">{user.points}</td>
                <td className="streak">🔥 {user.streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

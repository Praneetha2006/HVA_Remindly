import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, topicsAPI } from "../services/api";
import "../styles/Dashboard.css";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user and topics data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch user data
        const userData = await authAPI.getCurrentUser();
        if (userData.success) {
          setUser(userData.user);
        }

        // Fetch topics data
        const topicsData = await topicsAPI.getAllTopics();
        if (topicsData.success && topicsData.topics) {
          setTopics(topicsData.topics);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let overdue = 0;
    let dueToday = 0;
    let revised = 0;

    topics.forEach(topic => {
      if (topic.nextRevisionAt) {
        // Parse the date string (YYYY-MM-DD format) to avoid timezone issues
        const dateString = typeof topic.nextRevisionAt === 'string' 
          ? topic.nextRevisionAt.split('T')[0] 
          : new Date(topic.nextRevisionAt).toISOString().split('T')[0];
        const [year, month, day] = dateString.split('-');
        const revisionDate = new Date(year, month - 1, day);
        
        const timeDiff = revisionDate - today;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 0) overdue++;
        else if (daysDiff === 0) dueToday++;
      }
      if (topic.status === 'completed') revised++;
    });

    return {
      totalTopics: topics.length,
      overdue,
      dueToday,
      revised,
      thisWeek: Math.floor(topics.length * 0.3)
    };
  };

  // Get revision items for today
  const getRevisionItems = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return topics
      .filter(topic => {
        if (!topic.nextRevisionAt) return false;
        
        // Parse the date string (YYYY-MM-DD format) to avoid timezone issues
        const dateString = typeof topic.nextRevisionAt === 'string' 
          ? topic.nextRevisionAt.split('T')[0] 
          : new Date(topic.nextRevisionAt).toISOString().split('T')[0];
        const [year, month, day] = dateString.split('-');
        const revisionDate = new Date(year, month - 1, day);
        
        const timeDiff = revisionDate - today;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        // Show topics that are overdue or due today
        return daysDiff <= 0;
      })
      .sort((a, b) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Parse dates for both topics
        const aDateString = typeof a.nextRevisionAt === 'string' 
          ? a.nextRevisionAt.split('T')[0] 
          : new Date(a.nextRevisionAt).toISOString().split('T')[0];
        const [aYear, aMonth, aDay] = aDateString.split('-');
        const aDate = new Date(aYear, aMonth - 1, aDay);
        
        const bDateString = typeof b.nextRevisionAt === 'string' 
          ? b.nextRevisionAt.split('T')[0] 
          : new Date(b.nextRevisionAt).toISOString().split('T')[0];
        const [bYear, bMonth, bDay] = bDateString.split('-');
        const bDate = new Date(bYear, bMonth - 1, bDay);
        
        // Overdue items first (older dates), then due today
        return aDate - bDate;
      })
      .slice(0, 3);
  };

  // Get dot color based on revision date
  const getDotColor = (topic) => {
    if (!topic.nextRevisionAt) return 'blue';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateString = typeof topic.nextRevisionAt === 'string' 
      ? topic.nextRevisionAt.split('T')[0] 
      : new Date(topic.nextRevisionAt).toISOString().split('T')[0];
    const [year, month, day] = dateString.split('-');
    const revisionDate = new Date(year, month - 1, day);
    
    const timeDiff = revisionDate - today;
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 0) return 'red';
    if (daysDiff === 0) return 'purple';
    return 'green';
  };

  // Get badge class based on revision date
  const getBadgeClass = (topic) => {
    if (!topic.nextRevisionAt) return 'upcoming';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateString = typeof topic.nextRevisionAt === 'string' 
      ? topic.nextRevisionAt.split('T')[0] 
      : new Date(topic.nextRevisionAt).toISOString().split('T')[0];
    const [year, month, day] = dateString.split('-');
    const revisionDate = new Date(year, month - 1, day);
    
    const timeDiff = revisionDate - today;
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 0) return 'overdue';
    if (daysDiff === 0) return 'today';
    return 'upcoming';
  };

  // Get status label based on revision date
  const getStatusLabel = (topic) => {
    if (!topic.nextRevisionAt) return 'Upcoming';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateString = typeof topic.nextRevisionAt === 'string' 
      ? topic.nextRevisionAt.split('T')[0] 
      : new Date(topic.nextRevisionAt).toISOString().split('T')[0];
    const [year, month, day] = dateString.split('-');
    const revisionDate = new Date(year, month - 1, day);
    
    const timeDiff = revisionDate - today;
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 0) return 'Overdue';
    if (daysDiff === 0) return 'Due Today';
    return 'Upcoming';
  };

  // Get revision info text
  const getRevisionInfo = (topic) => {
    if (!topic.nextRevisionAt) return 'No revision scheduled';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse the date string (YYYY-MM-DD format) to avoid timezone issues
    const dateString = typeof topic.nextRevisionAt === 'string' 
      ? topic.nextRevisionAt.split('T')[0] 
      : new Date(topic.nextRevisionAt).toISOString().split('T')[0];
    const [year, month, day] = dateString.split('-');
    const revisionDate = new Date(year, month - 1, day);

    const timeDiff = revisionDate - today;
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (daysDiff < 0) {
      return `${Math.abs(Math.floor(daysDiff))} days overdue`;
    }
    if (daysDiff === 0) {
      return 'Today';
    }
    return `in ${Math.floor(daysDiff)} days`;
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loader-container">
          <div className="loader">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const revisionItems = getRevisionItems();

  return (
    <div className="dashboard-page">
      <div className="dashboard-top">
        <h1>Dashboard</h1>
        <button
          className="add-topic-small"
          onClick={() => navigate("/add-topic")}
        >
          + Add Topic
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue-border">
          <div className="stat-icon">📚</div>
          <h2>{stats.totalTopics}</h2>
          <p>Total Topics</p>
          <span>+{stats.thisWeek} this week</span>
        </div>

        <div className="stat-card orange-border">
          <div className="stat-icon">⏰</div>
          <h2>{stats.dueToday + stats.overdue}</h2>
          <p>Due Today</p>
          <span>{stats.overdue} overdue</span>
        </div>

        <div className="stat-card green-border">
          <div className="stat-icon">✅</div>
          <h2>{stats.revised}</h2>
          <p>Revised</p>
          <span>Keep it up!</span>
        </div>

        <div className="stat-card purple-border">
          <div className="stat-icon">🏆</div>
          <h2>{user?.totalPoints || 0}</h2>
          <p>Total XP</p>
          <span>Rank #3 globally</span>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="revision-card">
          <div className="card-header">
            <div>
              <h3>Today's Revision Schedule</h3>
              <p>Sorted by urgency</p>
            </div>
            <button onClick={() => navigate('/topics')}>View all →</button>
          </div>

          <div className="revision-list">
            {revisionItems.length === 0 ? (
              <p className="no-items">No revisions due today. Great job! 🎉</p>
            ) : (
              revisionItems.map(topic => {
                const dateString = typeof topic.nextRevisionAt === 'string' 
                  ? topic.nextRevisionAt.split('T')[0] 
                  : new Date(topic.nextRevisionAt).toISOString().split('T')[0];
                const revisionDate = new Date(dateString).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                return (
                  <div key={topic._id} className="revision-item">
                    <div className={`dot ${getDotColor(topic)}`}></div>
                    <div>
                      <h4>{topic.title}</h4>
                      <p>{revisionDate} · {getRevisionInfo(topic)}</p>
                    </div>
                    <span className={`badge ${getBadgeClass(topic)}`}>
                      {getStatusLabel(topic)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="right-column">
          <div className="streak-card">
            <h3>🔥 Streak</h3>
            <h1>{user?.streak || 0}</h1>
            <p>day streak</p>

            <div className="days">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span className="active">S</span>
            </div>
          </div>

          <div className="progress-card">
            <h3>📊 Progress</h3>

            <div className="progress-row">
              <p>
                Completed <span>{stats.revised}/{stats.totalTopics}</span>
              </p>
              <div className="progress-line">
                <div 
                  className="fill green-fill"
                  style={{
                    width: stats.totalTopics > 0 
                      ? `${(stats.revised / stats.totalTopics) * 100}%` 
                      : '0%'
                  }}
                ></div>
              </div>
            </div>

            <div className="progress-row">
              <p>
                Avg Quiz Score <span>{user?.averageScore || 0}%</span>
              </p>
              <div className="progress-line">
                <div 
                  className="fill purple-fill"
                  style={{
                    width: `${user?.averageScore || 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="progress-row">
              <p>
                Week Goal <span>{stats.revised}/{Math.ceil(stats.totalTopics * 0.7)} days</span>
              </p>
              <div className="progress-line">
                <div 
                  className="fill orange-fill"
                  style={{
                    width: stats.totalTopics > 0 
                      ? `${Math.min((stats.revised / Math.ceil(stats.totalTopics * 0.7)) * 100, 100)}%`
                      : '0%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicsAPI } from '../services/api';
import '../styles/MyTopics.css';

export const MyTopics = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await topicsAPI.getAllTopics();
      
      if (data.success && data.topics) {
        // Calculate status if not provided by backend
        const topicsWithStatus = data.topics.map(topic => {
          if (!topic.status) {
            topic.status = calculateStatus(topic.nextRevisionAt);
          }
          return topic;
        });
        setTopics(topicsWithStatus);
      } else {
        setError(data.message || 'Failed to load topics');
      }
    } catch (err) {
      setError('Failed to load topics. Please try again.');
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async (topicId, topicTitle) => {
    if (window.confirm(`Are you sure you want to delete "${topicTitle}"? This action cannot be undone.`)) {
      try {
        const data = await topicsAPI.deleteTopic(topicId);
        if (data.success) {
          setTopics(topics.filter(topic => topic._id !== topicId));
        } else {
          setError('Failed to delete topic');
        }
      } catch (err) {
        setError('Failed to delete topic. Please try again.');
        console.error('Error deleting topic:', err);
      }
    }
  };

  const calculateStatus = (nextRevisionAt) => {
    if (!nextRevisionAt) return 'upcoming';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse date safely using YYYY-MM-DD format (timezone-safe)
    const dateString = typeof nextRevisionAt === 'string' 
      ? nextRevisionAt.split('T')[0] 
      : new Date(nextRevisionAt).toISOString().split('T')[0];
    const [year, month, day] = dateString.split('-');
    const revisionDate = new Date(year, month - 1, day);
    
    const timeDiff = revisionDate - today;
    const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'overdue';
    if (daysDiff === 0) return 'dueToday';
    return 'upcoming';
  };

  const getFilteredTopics = () => {
    if (activeFilter === 'all') return topics;
    return topics.filter(topic => topic.status === activeFilter);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'overdue': return 'Overdue';
      case 'dueToday': return 'Due Today';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      default: return 'Upcoming';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'overdue': return 'badge-overdue';
      case 'dueToday': return 'badge-due-today';
      case 'upcoming': return 'badge-upcoming';
      case 'completed': return 'badge-completed';
      default: return 'badge-upcoming';
    }
  };

  const getMemoryStrengthClass = (strength) => {
    if (strength === undefined) return 'badge-new';
    if (strength >= 70) return 'badge-strong';
    if (strength >= 40) return 'badge-medium';
    return 'badge-weak';
  };

  const getMemoryStrengthText = (strength) => {
    if (strength === undefined) return 'New';
    return `${strength}%`;
  };

  const getDotColor = (status) => {
    switch (status) {
      case 'overdue': return 'dot-red';
      case 'dueToday': return 'dot-orange';
      case 'upcoming': return 'dot-blue';
      case 'completed': return 'dot-green';
      default: return 'dot-blue';
    }
  };

  const getRevisionInfo = (topic) => {
    if (!topic.nextRevisionAt) return 'No reminder scheduled';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse date safely - handle both string and Date objects
    let revisionDate;
    if (typeof topic.nextRevisionAt === 'string') {
      // Handle ISO string or YYYY-MM-DD format
      const dateStr = topic.nextRevisionAt.split('T')[0]; // Get YYYY-MM-DD part
      const [year, month, day] = dateStr.split('-');
      revisionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // Handle Date object
      const dateObj = new Date(topic.nextRevisionAt);
      revisionDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    }
    
    const timeDiff = revisionDate - today;
    const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
    
    // Format date as "Mon, Apr 26"
    const formattedDate = revisionDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    if (daysDiff < 0) {
      const absDays = Math.abs(daysDiff);
      return `${formattedDate} · ${absDays} day${absDays !== 1 ? 's' : ''} overdue`;
    }
    if (daysDiff === 0) {
      return `${formattedDate} · Today`;
    }
    if (daysDiff === 1) {
      return `${formattedDate} · Tomorrow`;
    }
    return `${formattedDate} · in ${daysDiff} days`;
  };

  const filteredTopics = getFilteredTopics();

  return (
    <div className="my-topics-page">
      <div className="my-topics-header">
        <h1>My Topics</h1>
        <button className="add-topic-btn" onClick={() => navigate('/add-topic')}>
          + Add Topic
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${activeFilter === 'overdue' ? 'active' : ''}`}
          onClick={() => setActiveFilter('overdue')}
        >
          Overdue
        </button>
        <button
          className={`filter-btn ${activeFilter === 'dueToday' ? 'active' : ''}`}
          onClick={() => setActiveFilter('dueToday')}
        >
          Due Today
        </button>
        <button
          className={`filter-btn ${activeFilter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveFilter('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          Completed
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loader">Loading topics...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchTopics}>Try Again</button>
        </div>
      )}

      {/* Topics Grid */}
      {!loading && !error && (
        <>
          {filteredTopics.length === 0 ? (
            <div className="empty-state">
              <p>No topics found</p>
              <p className="empty-description">
                {activeFilter === 'all'
                  ? 'Start by adding your first topic!'
                  : `No ${activeFilter} topics yet.`}
              </p>
              <button onClick={() => navigate('/add-topic')} className="empty-add-btn">
                + Add Topic
              </button>
            </div>
          ) : (
            <div className="topics-grid">
              {filteredTopics.map(topic => (
                <div key={topic._id} className="topic-card">
                  {/* Top Row: Category + Status */}
                  <div className="card-top-row">
                    <div className="category-badge">{topic.category || 'General'}</div>
                    <div className={`status-badge ${getStatusBadgeClass(topic.status)}`}>
                      {getStatusLabel(topic.status)}
                    </div>
                  </div>

                  {/* Title Section: Dot + Title + Explanation */}
                  <div className="card-title-section">
                    <div className="title-with-dot">
                      <div className={`colored-dot ${getDotColor(topic.status)}`}></div>
                      <h3 className="topic-title">{topic.title}</h3>
                    </div>
                    <p className="topic-description">{topic.explanation}</p>
                  </div>

                  {/* Revision Info Row: Text + Memory Badge */}
                  <div className="card-revision-row">
                    <span className="revision-text">{getRevisionInfo(topic)}</span>
                    <div className={`memory-badge ${getMemoryStrengthClass(topic.memoryStrength)}`}>
                      {getMemoryStrengthText(topic.memoryStrength)}
                    </div>
                  </div>

                  {/* Bottom Row: Revise Button + Settings Icon */}
                  <div className="card-bottom-row">
                    <button
                      className="revise-btn"
                      onClick={() => navigate(`/topics/${topic._id}`)}
                    >
                      Revise
                    </button>
                    <button
                      className="settings-icon-btn edit-btn"
                      title="Edit topic"
                      onClick={() => navigate(`/topics/${topic._id}/edit`)}
                    >
                      ✏️
                    </button>
                    <button
                      className="settings-icon-btn delete-btn"
                      title="Delete topic"
                      onClick={() => handleDeleteTopic(topic._id, topic.title)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

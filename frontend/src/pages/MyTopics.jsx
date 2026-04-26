import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { topicsAPI } from '../services/api';
import { calculateTopicStatus, getStatusLabel, getStatusBadgeClass, getDotColor, getRevisionInfo } from '../services/topicUtils';
import '../styles/MyTopics.css';

export const MyTopics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchTopics();
  }, [location]); // Refetch whenever location changes (user navigates back)

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await topicsAPI.getAllTopics();
      
      if (data.success && data.topics) {
        // Always recalculate status based on topic data for consistency
        const topicsWithStatus = data.topics.map(topic => {
          topic.status = calculateStatus(topic);
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

  const calculateStatus = (topic) => {
    return calculateTopicStatus(topic);
  };

  const getFilteredTopics = () => {
    if (activeFilter === 'all') return topics;
    return topics.filter(topic => topic.status === activeFilter);
  };

  // Memory strength helpers (unique to MyTopics)
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
          className={`filter-btn ${activeFilter === 'revised' ? 'active' : ''}`}
          onClick={() => setActiveFilter('revised')}
        >
          Revised
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

                  {/* Revision Info Row */}
                  <div className="card-revision-row">
                    <span className="revision-text">{getRevisionInfo(topic)}</span>
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

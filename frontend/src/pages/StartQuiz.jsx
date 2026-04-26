import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicsAPI } from '../services/api';
import '../styles/StartQuiz.css';

export const StartQuiz = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await topicsAPI.getAllTopics();
      
      if (data.success && data.topics) {
        // Filter topics that are due or overdue for revision and not yet revised
        const dueTopics = data.topics.filter(topic => {
          // Skip completed topics
          if (topic.isCompleted) return false;
          
          // Skip recently revised topics
          if (topic.lastRevisedAt) {
            const now = new Date();
            const revisionTime = new Date(topic.lastRevisedAt);
            const timeDiff = now.getTime() - revisionTime.getTime();
            const minutesDiff = Math.floor(timeDiff / (1000 * 60));
            
            if (minutesDiff < 2) {
              return false;
            }
          }
          
          if (!topic.nextRevisionAt) return false;
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const dateString = typeof topic.nextRevisionAt === 'string'
            ? topic.nextRevisionAt.split('T')[0]
            : new Date(topic.nextRevisionAt).toISOString().split('T')[0];
          
          const [year, month, day] = dateString.split('-');
          const revisionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          
          return revisionDate <= today;
        });
        
        setTopics(dueTopics.sort((a, b) => new Date(a.nextRevisionAt) - new Date(b.nextRevisionAt)));
      }
    } catch (err) {
      setError('Failed to load topics. Please try again.');
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (topicId) => {
    navigate(`/topics/${topicId}`);
  };

  const getStatusLabel = (nextRevisionAt) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateString = typeof nextRevisionAt === 'string'
      ? nextRevisionAt.split('T')[0]
      : new Date(nextRevisionAt).toISOString().split('T')[0];
    
    const [year, month, day] = dateString.split('-');
    const revisionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const timeDiff = revisionDate - today;
    const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      const absDays = Math.abs(daysDiff);
      return `${absDays} day${absDays !== 1 ? 's' : ''} overdue`;
    }
    return 'Due today';
  };

  return (
    <div className="start-quiz-page">
      <div className="quiz-header">
        <h1>📚 Start Quiz</h1>
        <p className="subtitle">Revise topics that are due for study</p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loader">Loading topics...</div>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchTopics}>Try Again</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {topics.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">✨</p>
              <p>No topics due for revision</p>
              <p className="empty-description">All caught up! Check back soon or add new topics.</p>
              <button 
                onClick={() => navigate('/add-topic')} 
                className="empty-add-btn"
              >
                + Add Topic
              </button>
            </div>
          ) : (
            <div className="quiz-topics-list">
              <p className="topic-count">{topics.length} topic{topics.length !== 1 ? 's' : ''} ready to revise</p>
              {topics.map(topic => (
                <div key={topic._id} className="quiz-topic-card">
                  <div className="card-left">
                    <div className="card-category">{topic.category || 'General'}</div>
                    <h3 className="card-title">{topic.title}</h3>
                    <p className="card-description">{topic.explanation}</p>
                    <div className="card-meta">
                      <span className="meta-item">
                        📅 {getStatusLabel(topic.nextRevisionAt)}
                      </span>
                      {topic.memoryStrength !== undefined && (
                        <span className="meta-item">
                          💪 {topic.memoryStrength}% strength
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    className="start-btn"
                    onClick={() => handleStartQuiz(topic._id)}
                  >
                    Start Quiz
                    <span className="arrow">→</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

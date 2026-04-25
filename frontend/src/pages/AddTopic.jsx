import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { topicsAPI } from '../services/api';
import '../styles/AddTopic.css';

export const AddTopic = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  // State management
  const [topicName, setTopicName] = useState('');
  const [content, setContent] = useState('');
  const [remindType, setRemindType] = useState('days'); // 'days' or 'date'
  const [reminderDays, setReminderDays] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load topic data if editing
  useEffect(() => {
    if (isEditMode) {
      const fetchTopic = async () => {
        try {
          const data = await topicsAPI.getTopicById(id);
          if (data.success) {
            const topic = data.topic;
            setTopicName(topic.title);
            setContent(topic.explanation);
            
            // Calculate reminder type and values
            if (topic.nextRevisionAt) {
              const revisionDate = new Date(topic.nextRevisionAt);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              // Format date as YYYY-MM-DD
              const year = revisionDate.getFullYear();
              const month = String(revisionDate.getMonth() + 1).padStart(2, '0');
              const day = String(revisionDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
              
              setReminderDate(formattedDate);
              setRemindType('date');
            }
            
            // Calculate word count
            const words = topic.explanation.trim() === '' ? 0 : topic.explanation.trim().split(/\s+/).length;
            setWordCount(words);
          } else {
            setError('Failed to load topic');
          }
        } catch (err) {
          setError('Failed to load topic. Please try again.');
          console.error('Error fetching topic:', err);
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchTopic();
    }
  }, [id, isEditMode]);

  // Handle content change with word count
  const handleContentChange = (e) => {
    const text = e.target.value;
    setContent(text);

    // Calculate word count
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    setWordCount(words);

    // Clear error when user is typing
    if (error) setError('');
  };

  // Handle topic name change
  const handleTopicNameChange = (e) => {
    setTopicName(e.target.value);
    if (error) setError('');
  };

  // Handle reminder days change
  const handleReminderDaysChange = (e) => {
    const value = e.target.value;
    setReminderDays(value);
    if (error) setError('');
  };

  // Handle reminder date change
  const handleReminderDateChange = (e) => {
    const value = e.target.value;
    setReminderDate(value);
    if (error) setError('');
  };

  // Validation function
  const validate = () => {
    if (!topicName.trim()) {
      setError('Topic name is required');
      return false;
    }

    if (wordCount < 10) {
      setError('Content must have at least 10 words');
      return false;
    }

    if (wordCount > 100) {
      setError('Content must not exceed 100 words');
      return false;
    }

    if (remindType === 'days') {
      if (!reminderDays || reminderDays <= 0) {
        setError('Please enter a valid number of days');
        return false;
      }
      if (reminderDays > 365) {
        setError('Reminder days cannot exceed 365 days');
        return false;
      }
    } else {
      if (!reminderDate) {
        setError('Please select a revision date');
        return false;
      }
      const selectedDate = new Date(reminderDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setError('Please select a future date');
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Calculate the next revision date
      let nextRevisionDate = null;
      
      if (remindType === 'days') {
        // Calculate date by adding days to today
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(reminderDays));
        nextRevisionDate = futureDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      } else if (remindType === 'date') {
        // Use the selected date directly
        nextRevisionDate = reminderDate;
      }

      let data;
      if (isEditMode) {
        // Update existing topic
        data = await topicsAPI.updateTopic(
          id,
          topicName,
          content,
          'general',
          nextRevisionDate
        );
      } else {
        // Create new topic
        data = await topicsAPI.createTopic(
          topicName,
          content,
          nextRevisionDate
        );
      }

      if (data.success) {
        setSuccess(isEditMode ? 'Topic updated successfully!' : 'Topic added successfully!');
        
        // Reset form (only for add mode)
        if (!isEditMode) {
          setTopicName('');
          setContent('');
          setRemindType('days');
          setReminderDays('');
          setReminderDate('');
          setWordCount(0);
        }

        // Navigate after short delay
        setTimeout(() => {
          navigate('/topics');
        }, 800);
      } else {
        setError(data.message || (isEditMode ? 'Failed to update topic' : 'Failed to create topic'));
      }
    } catch (err) {
      const errorMsg = isEditMode ? 'Failed to update topic. Please try again.' : 'Failed to create topic. Please try again.';
      setError(errorMsg);
      console.error('Error submitting topic:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/topics');
  };

  // Check if form is valid
  const isFormValid = topicName.trim() && 
    wordCount >= 10 && 
    wordCount <= 100 && 
    ((remindType === 'days' && reminderDays && reminderDays > 0) || 
     (remindType === 'date' && reminderDate));

  if (initialLoading) {
    return (
      <div className="add-topic-overlay">
        <div className="add-topic-modal">
          <div className="loader">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-topic-overlay">
      <div className="add-topic-modal">
        <h2>{isEditMode ? 'Edit Topic' : 'Add New Topic'}</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Topic Name Field */}
          <div className="form-group">
            <label htmlFor="topicName">Topic Name *</label>
            <input
              id="topicName"
              type="text"
              value={topicName}
              onChange={handleTopicNameChange}
              placeholder="Enter topic name"
              required
              disabled={loading}
            />
          </div>

          {/* Content Field */}
          <div className="form-group">
            <label htmlFor="content">Notes / Content *</label>
            <textarea
              id="content"
              value={content}
              onChange={handleContentChange}
              placeholder="Paste your notes, key points, or a summary to study from..."
              rows="6"
              disabled={loading}
            />
            <div className={`word-count ${wordCount < 10 || wordCount > 100 ? 'invalid' : 'valid'}`}>
              {wordCount} / 100 words
            </div>
            {wordCount < 10 && wordCount > 0 && (
              <p className="help-text">Minimum 10 words required</p>
            )}
            {wordCount > 100 && (
              <p className="help-text">Maximum 100 words allowed</p>
            )}
          </div>

          {/* Reminders Selection */}
          <div className="form-group">
            <label>Revision Reminder *</label>
            
            {/* Toggle between Days and Date */}
            <div className="reminder-type-toggle">
              <button
                type="button"
                className={`toggle-btn ${remindType === 'days' ? 'active' : ''}`}
                onClick={() => {
                  setRemindType('days');
                  setReminderDate('');
                  if (error) setError('');
                }}
                disabled={loading}
              >
                Number of Days
              </button>
              <button
                type="button"
                className={`toggle-btn ${remindType === 'date' ? 'active' : ''}`}
                onClick={() => {
                  setRemindType('date');
                  setReminderDays('');
                  if (error) setError('');
                }}
                disabled={loading}
              >
                Pick a Date
              </button>
            </div>

            {/* Days Input */}
            {remindType === 'days' && (
              <div className="reminder-input-group">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={reminderDays}
                  onChange={handleReminderDaysChange}
                  placeholder="Enter number of days (1-365)"
                  disabled={loading}
                />
                <span className="reminder-helper">days from today</span>
              </div>
            )}

            {/* Date Input */}
            {remindType === 'date' && (
              <div className="reminder-input-group">
                <input
                  type="date"
                  value={reminderDate}
                  onChange={handleReminderDateChange}
                  disabled={loading}
                  min={new Date().toISOString().split('T')[0]}
                />
                <span className="reminder-helper">select a future date</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid || loading}
            >
              {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Topic' : 'Add Topic')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTopic;

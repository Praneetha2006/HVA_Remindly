/**
 * Utility functions for topic status and display
 */

// Parse revision date safely (handles both string and Date objects)
export const parseRevisionDate = (nextRevisionAt) => {
  const dateString = typeof nextRevisionAt === 'string' 
    ? nextRevisionAt.split('T')[0] 
    : new Date(nextRevisionAt).toISOString().split('T')[0];
  
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  date.setHours(0, 0, 0, 0);
  return date;
};

// Calculate topic status
export const calculateTopicStatus = (topic) => {
  if (topic.isCompleted) return 'completed';
  
  // Check if recently revised (within last 2 minutes)
  if (topic.lastRevisedAt) {
    const now = new Date();
    const revisionTime = new Date(topic.lastRevisedAt);
    const timeDiff = now.getTime() - revisionTime.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesDiff < 2) {
      return 'revised';
    }
  }
  
  if (!topic.nextRevisionAt) return 'upcoming';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const revisionDate = parseRevisionDate(topic.nextRevisionAt);
  const timeDiff = revisionDate.getTime() - today.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) return 'overdue';
  if (daysDiff === 0) return 'dueToday';
  return 'upcoming';
};

// Get status label
export const getStatusLabel = (status) => {
  const labels = {
    'overdue': 'Overdue',
    'dueToday': 'Due Today',
    'upcoming': 'Upcoming',
    'revised': 'Recently Revised',
    'completed': 'Completed'
  };
  return labels[status] || 'Upcoming';
};

// Get status badge CSS class
export const getStatusBadgeClass = (status) => {
  const classes = {
    'overdue': 'badge-overdue',
    'dueToday': 'badge-due-today',
    'upcoming': 'badge-upcoming',
    'revised': 'badge-revised',
    'completed': 'badge-completed'
  };
  return classes[status] || 'badge-upcoming';
};

// Get dot color for status
export const getDotColor = (status) => {
  const colors = {
    'overdue': 'dot-red',
    'dueToday': 'dot-orange',
    'upcoming': 'dot-blue',
    'revised': 'dot-purple',
    'completed': 'dot-green'
  };
  return colors[status] || 'dot-blue';
};

// Get revision info text
export const getRevisionInfo = (topic) => {
  if (topic.isCompleted) return 'Completed';
  if (!topic.nextRevisionAt) return 'No reminder scheduled';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const revisionDate = parseRevisionDate(topic.nextRevisionAt);
  const timeDiff = revisionDate.getTime() - today.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
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

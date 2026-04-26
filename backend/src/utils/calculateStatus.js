export const calculateRevisionStatus = (revision) => {
  if (revision.completedDate) {
    return "completed";
  }

  const today = new Date();
  const scheduledDate = new Date(revision.scheduledDate);

  today.setHours(0, 0, 0, 0);
  scheduledDate.setHours(0, 0, 0, 0);

  if (scheduledDate.getTime() === today.getTime()) {
    return "pending";
  }

  if (scheduledDate > today) {
    return "upcoming";
  }

  return "overdue";
};

export const calculateTopicStatus = (topic) => {
  if (topic.isCompleted) {
    return "completed";
  }

  // Check if recently revised (within last 2 minutes to show revision feedback)
  if (topic.lastRevisedAt) {
    const now = new Date();
    const revisionTime = new Date(topic.lastRevisedAt);
    const timeDiff = now.getTime() - revisionTime.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    
    // If revised within last 2 minutes, show as "revised"
    if (minutesDiff < 2) {
      return "revised";
    }
  }

  if (!topic.nextRevisionAt) {
    return "upcoming";
  }

  const today = new Date();
  const revisionDate = new Date(topic.nextRevisionAt);

  today.setHours(0, 0, 0, 0);
  revisionDate.setHours(0, 0, 0, 0);

  const timeDiff = revisionDate.getTime() - today.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    return "overdue";
  }

  if (daysDiff === 0) {
    return "dueToday";
  }

  return "upcoming";
};
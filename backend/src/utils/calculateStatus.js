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
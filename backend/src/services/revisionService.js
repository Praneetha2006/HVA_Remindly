import RevisionSchedule from "../models/RevisionSchedule.js";

export const createRevisionSchedule = async (
  userId,
  topicId,
  intervals
) => {
  const today = new Date();

  const schedules = intervals.map((days, index) => {
    const date = new Date();
    date.setDate(today.getDate() + days);

    return {
      userId,
      topicId,
      revisionNumber: index + 1,
      scheduledDate: date
    };
  });

  await RevisionSchedule.insertMany(schedules);
};
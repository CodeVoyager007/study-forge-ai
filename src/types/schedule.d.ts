// src/types/schedule.d.ts
declare interface ScheduleEntry {
  day: string;
  time: string;
  activity: string;
  subject: string;
}

declare interface StudySchedule {
  title: string;
  description: string;
  schedule: ScheduleEntry[];
}

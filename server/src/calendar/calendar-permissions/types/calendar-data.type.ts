import { Calendar } from "src/calendar/calendar-event/entities/calendar.entity";

export type CalendarData = {
  googleCalendar: Calendar[];
  office365Calendar: Calendar[];
  exchangeCalendar?: Calendar[];
  outlookPlugIn?: Calendar[];
  iCloudCalendar?: Calendar[];
};

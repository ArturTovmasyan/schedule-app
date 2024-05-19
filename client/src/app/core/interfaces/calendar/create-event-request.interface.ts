import { CalendarType } from "../../components/calendar/connect-calendar/connect-calendar.component";

export interface CreateEventRequest {
  title: string,
  description: string,
  meetLink: string,
  start: string,
  end: string,
  syncWith: CalendarType,
  attendees?: string[],
  optionalAttendees?: string[]
}

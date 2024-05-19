export interface CreateEventRequest {
  title: string,
  description: string,
  meetLink: string,
  date?: string,
  start: string,
  end: string,
  syncWith: string,
  attendees?: string[],
  optionalAttendees?: string[]
}

export interface CreateEventRequest {
  title: string,
  description: string,
  start: string,
  end: string,
  calendarId: string,
  entanglesLocation?: string,
  attendees?: string[],
  optionalAttendees?: string[],
  duration?: number,
  phoneNumber?: string,
  address?: string
}

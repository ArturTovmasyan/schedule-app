export interface CreateEventRequest {
  title: string,
  description: string,
  start: string,
  end: string,
  calendarId: string,
  entanglesLocation?: string | null,
  attendees?: string[],
  optionalAttendees?: string[],
  duration?: number,
  phoneNumber?: string,
  address?: string
}

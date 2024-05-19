export interface CreateEventRequest {
  title: string,
  description: string,
  meetLink: string,
  start: string,
  end: string,
  syncWith: string,
  attendees?: string[],
  optionalAttendees?: string[],
  duration?: number,
  phoneNumber?: string,
  address?: string
}

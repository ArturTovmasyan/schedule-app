export interface Invitation {
  id?: string,
  emails: string[],
  duration: string | null,
  message?: string,
  shareMyCalendar?: boolean,
  requestCalendarView?: boolean,
  endDate?: Date | null
}

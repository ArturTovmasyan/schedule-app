export interface SuggestContact {
  id?: string,
  emails: string[],
  message?: string,
  shareMyCalendar?: boolean,
  requestCalendarView?: boolean,
}

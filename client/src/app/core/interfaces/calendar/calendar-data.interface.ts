export interface CalendarData {
  "googleCalendar": Calendar[],
  "office365Calendar": Calendar[],
  "exchangeCalendar"?: Calendar[],
  "outlookPlugIn"?: Calendar[],
  "iCloudCalendar"?: Calendar[]
}

export interface Calendar {
  id: string,
  calendarId: string,
  summary: string
}

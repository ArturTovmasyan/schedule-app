export interface CalendarAccess {
  id: string,
  comment: string,
  timeForAccess: string|null,
  owner: {
    id: string,
    email: string,
    firstName: string,
    lastName: string
  }
}

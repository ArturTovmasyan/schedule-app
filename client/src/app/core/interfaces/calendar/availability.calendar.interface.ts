export interface CalendarAvailability {
  from: string,
  to: string,
  clockType: string,
  timezone: string,
  sunday: boolean | null,
  monday: boolean | null,
  tuesday: boolean | null,
  wednesday: boolean | null,
  thursday: boolean | null,
  friday: boolean | null,
  saturday: boolean | null
}

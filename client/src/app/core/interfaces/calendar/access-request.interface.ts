export interface AccessRequest {
  id?: string,
  toEmails: string[],
  timeForAccess: string | null,
  comment: string,
  status?: string
}

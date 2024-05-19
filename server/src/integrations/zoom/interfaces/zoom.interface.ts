import { MeetViaEnum } from 'src/sharable-links/enums/sharable-links.enum';

export interface IZoomTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: string;
}

export interface ILinkedIntegrations {
  title: string;
  sub_title: string;
  image: string;
  value: MeetViaEnum;
  available: boolean;
}

export interface IZoomMeeting {
  topic: string;
  start_time: string;
  meeting_invitees?: {
    email: string;
  }[];
}

export interface IZoomMeetingResponse {
  uuid: string;
  id: number;
  join_url: string;
  password: string;
  encrypted_password: string;
}

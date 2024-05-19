export interface IZoomTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: string;
}

export interface ILinkedIntegrations {
  title: string;
  sub_title: string;
  image: string;
  value: string;
  available: boolean;
}

export interface IZoomMeeting {
  start_time: Date;
  pre_schedule: boolean;
  meeting_invitees?: [
    {
      email: string;
    },
  ];
  waiting_room: boolean;
  type: number;
  settings?: {
    email_notification: boolean;
  };
}

export interface IZoomMeetingResponse {
  join_url: string;
  host_email: string;
}

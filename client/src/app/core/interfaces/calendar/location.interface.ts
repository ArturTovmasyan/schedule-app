import { MeetViaEnum } from "../../components/calendar/enums/sharable-links.enum";

export interface Location {
  id?: string;
  title: string;
  sub_title?: string;
  image: string;
  value: MeetViaEnum;
  available: boolean;
}

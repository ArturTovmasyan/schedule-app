import { AccessRequest } from "./calendar/access-request.interface";

export interface Notification {
  id: string;
  type: string;
  viewed: boolean;
  createdOn: string;
  accessRequest?: AccessRequest;
  sender: {
    id: string,
    firstName: string,
    lastName: string,
    avatar: string
  };
}

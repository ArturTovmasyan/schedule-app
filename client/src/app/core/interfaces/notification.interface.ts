export interface Notification {
  id: string;
  type: string;
  viewed: boolean;
  createdOn: string;
  accessRequest?: any;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

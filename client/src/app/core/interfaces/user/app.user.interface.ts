export interface ApplicationUser {
  accessToken: string;
  expiresIn: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

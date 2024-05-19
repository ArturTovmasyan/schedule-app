export interface ApplicationUser {
  accessToken: string;
  expiresIn: Date;
  provider?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    stripeCustomerId: string;
  };
}

export interface ApplicationUser {
  accessToken: string;
  expiresIn: Date;
  provider?: string;
  user: {
    id: string;
    fullName?: string;
    avatar?: string;
    firstName: string;
    lastName: string;
    email: string;
    stripeCustomerId: string;
  };
}

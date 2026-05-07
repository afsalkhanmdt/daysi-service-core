export interface SubscriptionDetails {
  familyId: number;
  userId: string;
  subscriptionMonths: number;
  stripeSessionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

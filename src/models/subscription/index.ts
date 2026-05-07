import { Schema, model, models, Document, Model } from 'mongoose';

export interface ISubscriptionDetails extends Document {
  familyId: number;
  userId: string;
  subscriptionMonths: number;
  stripeSessionId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionDetailsSchema = new Schema<ISubscriptionDetails>(
  {
    familyId: { type: Number, required: true },
    userId: { type: String, required: true },
    subscriptionMonths: { type: Number, required: true },
    stripeSessionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, required: true, default: 'pending' },
  },
  { timestamps: true }
);

const SubscriptionDetails: Model<ISubscriptionDetails> =
  models.SubscriptionDetails || model<ISubscriptionDetails>('SubscriptionDetails', SubscriptionDetailsSchema);

export default SubscriptionDetails;

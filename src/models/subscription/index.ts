import { Schema, model, models, Document, Model } from 'mongoose';

export enum OSType {
  IOS = 0,
  Android = 1,
  Web = 2,
}

export enum SubscriptionStatus {
  InProgress = 0,
  Accepted = 1,
  Declined = 2,
}

const osTypeValues = Object.values(OSType).filter(
  (value) => typeof value === 'number'
);

const subscriptionStatusValues = Object.values(SubscriptionStatus).filter(
  (value) => typeof value === 'number'
);

export interface ISubscriptionDetail extends Document {
  FamilyId: number;
  ProductId: string;
  OrderId?: string;
  OSType: OSType;
  ReceiptData: string;
  PurchasedDate: Date;
  SubscriptionStatus: SubscriptionStatus;
  ConsumeStatus: boolean;
  OriginalTransactionId?: string;

  userId?: string;
  subscriptionMonths?: number;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  paymentStatus?: string;
  status?: string;
  userToken?: string;
  amount?: number;
  currency?: string;
  dotnetSynced?: boolean;
  dotnetResponse?: any;
  dotnetError?: string;
}

const SubscriptionDetailSchema = new Schema<ISubscriptionDetail>(
  {
    FamilyId: { type: Number, required: true },
    ProductId: { type: String, required: true },
    OrderId: String,

    OSType: {
      type: Number,
      enum: osTypeValues,
      required: true,
    },

    ReceiptData: {
      type: String,
      required: true,
      unique: true,
    },

    PurchasedDate: {
      type: Date,
      required: true,
    },

    SubscriptionStatus: {
      type: Number,
      enum: subscriptionStatusValues,
      required: true,
    },

    ConsumeStatus: {
      type: Boolean,
      required: true,
    },

    OriginalTransactionId: String,

    userId: String,
    subscriptionMonths: Number,
    stripeSessionId: String,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    paymentStatus: String,
    status: String,
    userToken: String,
    amount: Number,
    currency: String,
    dotnetSynced: Boolean,
    dotnetResponse: Schema.Types.Mixed,
    dotnetError: String,
  },
  { timestamps: true }
);

const SubscriptionDetail: Model<ISubscriptionDetail> =
  models.SubscriptionDetail ||
  model<ISubscriptionDetail>('SubscriptionDetail', SubscriptionDetailSchema);

export default SubscriptionDetail;
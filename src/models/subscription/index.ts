import { Schema, model, models, Document, Model } from "mongoose";

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
}

const SubscriptionDetailSchema = new Schema<ISubscriptionDetail>({
  FamilyId: { type: Number, required: true },
  ProductId: { type: String, required: true },
  OrderId: String,
  OSType: {
    type: Number,
    enum: Object.values(OSType),
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
    enum: Object.values(SubscriptionStatus),
    required: true,
  },
  ConsumeStatus: {
    type: Boolean,
    required: true,
  },
  OriginalTransactionId: String,
});

const SubscriptionDetail: Model<ISubscriptionDetail> =
  models.SubscriptionDetail ||
  model<ISubscriptionDetail>("SubscriptionDetail", SubscriptionDetailSchema);

export default SubscriptionDetail;
import { Schema, model, models, Document, Model } from 'mongoose';




export interface IFamily extends Document {
  name: string;
  holidaysCountryCode?: string;
  registeredDate: Date;
  validTillDate?: Date;
  lastUsed?: Date;
  subscriptionType: string;
  familyActive: boolean;
  familyMemberQty: number;
  defaultAlarm: number;
  specialEventColorCode?: string;
  currencyCode?: string;
  everyoneCreatePmTask: boolean;
  region?: string;
  mailChimpSubscriptionType: string;
}

const FamilySchema = new Schema<IFamily>(
  {
    name: { type: String, required: true },
    holidaysCountryCode: { type: String },
    registeredDate: { type: Date, required: true },
    validTillDate: { type: Date },
    lastUsed: { type: Date },
    subscriptionType: { type: String, enum: ['Basis', 'Premium'], default: 'Basis' },
    familyActive: { type: Boolean, default: true },
    familyMemberQty: { type: Number, default: 5 },
    defaultAlarm: { type: Number, default: 0 },
    specialEventColorCode: { type: String },
    currencyCode: { type: String, maxlength: 10 },
    everyoneCreatePmTask: { type: Boolean, default: false },
    region: { type: String },
    mailChimpSubscriptionType: {
    type: String,
    enum: ['Basis', 'Premium', 'Voucher', 'PremiumToBasis', 'VoucherToBasis'],
    default: 'Basis',
  },
  },
  { timestamps: true }
);
    

const Family: Model<IFamily> = models.Family || model<IFamily>('Family', FamilySchema);

export default Family;
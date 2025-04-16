import { Schema, model, models, Document, Model } from 'mongoose';

export interface IAutoIncrementCounter extends Document {
    fieldName: string;
    seq: number;
}

const AutoIncrementCounterSchema = new Schema<IAutoIncrementCounter>({
    fieldName: { type: String, required: true, unique: true },
    seq: { type: Number, required: true, default: 0 },
});

const AutoIncrementCounter: Model<IAutoIncrementCounter> = models.AutoIncrementCounter || model<IAutoIncrementCounter>('AutoIncrementCounter', AutoIncrementCounterSchema);

export default AutoIncrementCounter;
import { Schema, model, models, Document, Model } from 'mongoose';
import AutoIncrementCounter from '../counter';

export interface IFamily extends Document {
    firstName: string;
    familyId: number;
}

const FamilySchema = new Schema<IFamily>({
    firstName: { type: String, required: true },
    familyId: { type: Number, unique: true },
});

FamilySchema.pre<IFamily>('save', async function (next) {
    if (this.isNew) {
        const counter = await AutoIncrementCounter.findOneAndUpdate(
            { fieldName: `${this.collection.name}.familyId` },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.familyId = counter?.seq || 0;
    }
    next();
});

const Family: Model<IFamily> = models.Family || model<IFamily>('Family', FamilySchema);

export default Family;
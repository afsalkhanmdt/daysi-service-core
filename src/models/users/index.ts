import { Schema, model, models, Document, Model } from 'mongoose';

export interface IUser extends Document {
    firstName: string;
    email: string;
    password: string;
    familyId: number;
    counter: number;
    colorCode: string;
}

const UserSchema = new Schema<IUser>({
    firstName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    familyId: { type: Number, required: true },
    counter: { type: Number, default: 0 },
    colorCode: { type: String, default: '#00BFFF' },
});

const User: Model<IUser> = models.User || model<IUser>('User', UserSchema);

export default User;
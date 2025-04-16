import { Schema, model, models, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    firstName: string;
    email: string;
    password: string;
    familyId: number;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    firstName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    familyId: { type: Number, required: true }
});

const User: Model<IUser> = models.User || model<IUser>('User', UserSchema);

export default User;
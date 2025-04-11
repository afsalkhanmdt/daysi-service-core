import { Schema, model, models, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
});

const User: Model<IUser> = models.User || model<IUser>('User', UserSchema);

export default User;
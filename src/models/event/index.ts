import { Schema, model, models, Document, Model, Types } from 'mongoose';


export interface IEvent extends Document {
    EventsUpdatedOn: Date;
    title: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    participants: string[];
}

const EventSchema = new Schema<IEvent>({
    EventsUpdatedOn: { type: Date, required: true },
    participants: [{ type: String, required: true }],
    title: { type: String, required: true },
    description: { type: String, required: false },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },

});

const Event: Model<IEvent> = models.Event || model<IEvent>('Event', EventSchema);

export default Event;

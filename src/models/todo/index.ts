import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IToDo extends Document {
  toDoTaskId: number;
  familyId: number;
  createdBy: string;
  assignedTo: string;
  toDoGroupId: number;
  description: string;
  note: string;
  private: boolean;
  createdDate: Date;
  closedDate?: Date | null;
  status: string;
  updatedOn: string;
  isForAll: boolean;
}

const ToDoSchema: Schema<IToDo> = new Schema(
  {
    toDoTaskId: { type: Number, required: true },
    familyId: { type: Number, required: true },
    createdBy: { type: String, required: true },
    assignedTo: { type: String, required: true },
    toDoGroupId: { type: Number, required: true },
    description: { type: String, required: true },
    note: { type: String, required: true },
    private: { type: Boolean, default: false },
    createdDate: { type: Date, default: Date.now },
    closedDate: { type: Date },
    status: { type: String, required: true },
    updatedOn: { type: String, required: true },
    isForAll: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ToDo: Model<IToDo> =
  mongoose.models.ToDo || mongoose.model<IToDo>('ToDo', ToDoSchema);

export default ToDo;

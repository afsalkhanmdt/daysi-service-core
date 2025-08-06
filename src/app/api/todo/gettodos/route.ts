import dbConnect from '@/core/db/connect';
import ToDo from '@/models/todo';
import { NextResponse } from 'next/server';

//get todos
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');

    if (!familyId) {
      return NextResponse.json({ error: 'familyId is required' }, { status: 400 });
    }

    const toDos = await ToDo.find({ familyId: Number(familyId) });

    const toDoResponses = toDos.map((eachToDo: any) => ({
      ToDoTaskId: eachToDo.toDoTaskId,
      FamilyId: eachToDo.familyId,
      CreatedBy: eachToDo.createdBy,
      AssignedTo: eachToDo.assignedTo,
      ToDoGroupId: eachToDo.toDoGroupId,
      Description: eachToDo.description,
      Note: eachToDo.note,
      Private: eachToDo.private,
      CreatedDate: eachToDo.createdDate,
      ClosedDate: eachToDo.closedDate ?? null,
      Status: eachToDo.status,
      UpdatedOn: eachToDo.updatedOn,
      IsForAll: eachToDo.isForAll
    }));

    return NextResponse.json(toDoResponses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

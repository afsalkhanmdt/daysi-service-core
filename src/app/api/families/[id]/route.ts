import dbConnect from '@/core/db/connect';
import Family from '@/models/family';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    await dbConnect();

    const family = await Family.findById(params.id);

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    return NextResponse.json(family);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    await dbConnect();

    const family = await Family.findById(params.id);

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    await Family.deleteOne({ _id: params.id });
    return NextResponse.json({ message: 'Family deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


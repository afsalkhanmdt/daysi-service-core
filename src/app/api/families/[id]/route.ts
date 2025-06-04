import dbConnect from '@/core/db/connect';
import Family from '@/models/family';
import { NextRequest, NextResponse } from 'next/server';
import { normalizeKeys } from '../../normalizeKeys';
import { familyUpdateSchema } from './dto';

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

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    const normalizedRequest = normalizeKeys(await request.json());
    const result = familyUpdateSchema.safeParse(normalizedRequest);

    if (!result.success) {
      const { fieldErrors, formErrors } = result.error.flatten();
      return NextResponse.json({ fieldErrors, formErrors }, { status: 400 });
    }

    await dbConnect();

    const family = await Family.findById(params.id);

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    family.set(result.data);
    await family.save();

    return NextResponse.json({ message: 'Family updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import dbConnect from '@/core/db/connect'
import Event from '@/models/event'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const familyId = parseInt(searchParams.get('familyId') || '')

    await dbConnect()

  const events =await Event.find({familyId: familyId})
    if (!events || events.length === 0) {
      return NextResponse.json({ message: 'No events found for this family.' }, { status: 404 })
    }


    return NextResponse.json({ events: events }, { status: 200 })


    
}
      
   catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

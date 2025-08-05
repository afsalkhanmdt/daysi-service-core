import dbConnect from '@/core/db/connect'
import Event from '@/models/event'
import ical from 'ical-generator'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const userId = (await cookies()).get('user-id')?.value
    if (!userId) {
      return new Response('User not authenticated', { status: 401 })
    }

    await dbConnect()
    const events = await Event.find({ participants: userId })

    if (!events || events.length === 0) {
      return new Response('No events found', { status: 404 })
    }

    const calendar = ical({ name: 'My Daysi Events' })

    events.forEach((event) => {
      calendar.createEvent({
        start: event.startDate,
        end: event.endDate,
        summary: event.title,
        description: event.description,
      })
    })

    // Convert to string (.ics format)
    const icsContent = calendar.toString()

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="daysi-events.ics"',
      },
    })
  } catch (err) {
    console.error(err)
    return new Response('Internal Server Error', { status: 500 })
  }
}

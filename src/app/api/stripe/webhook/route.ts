import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/core/db/connect';
import Family from '@/models/family';
import SubscriptionDetails from '@/models/subscription';
import dayjs from 'dayjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleSuccessfulSubscription(session);
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulSubscription(session: Stripe.Checkout.Session) {
  await dbConnect();

  const { familyId, subscriptionMonths } = session.metadata || {};

  if (!familyId || !subscriptionMonths) {
    console.error('Missing metadata in Stripe session');
    return;
  }

  const months = parseInt(subscriptionMonths);
  const validTillDate = dayjs().add(months, 'month').toDate();

  // Update SubscriptionDetails
  await SubscriptionDetails.findOneAndUpdate(
    { stripeSessionId: session.id },
    { status: 'completed' }
  );

  // Update Family
  await Family.findOneAndUpdate(
    { familyId: parseInt(familyId) },
    {
      subscriptionType: 'Premium',
      validTillDate: validTillDate,
    }
  );
}

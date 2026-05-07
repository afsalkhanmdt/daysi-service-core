import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/core/db/connect';
import SubscriptionDetails from '@/models/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { familyId, userId, subscriptionMonths } = await req.json();

    if (!familyId || !userId || !subscriptionMonths) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const priceId1Month = process.env.STRIPE_PRICE_ID_1_MONTH;
    const priceId12Month = process.env.STRIPE_PRICE_ID_12_MONTH;
    const successUrl = process.env.STRIPE_SUCCESS_URL;
    const cancelUrl = process.env.STRIPE_CANCEL_URL;

    if (!stripeSecretKey || !priceId1Month || !priceId12Month || !successUrl || !cancelUrl) {
      console.error('Missing Stripe Environment Variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Stripe environment variables' },
        { status: 500 }
      );
    }

    const priceId = subscriptionMonths === 12 ? priceId12Month : priceId1Month;

    await dbConnect();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        familyId: familyId.toString(),
        userId: userId.toString(),
        subscriptionMonths: subscriptionMonths.toString(),
      },
    });

    // Create a pending subscription record
    await SubscriptionDetails.create({
      familyId,
      userId,
      subscriptionMonths,
      stripeSessionId: session.id,
      amount: session.amount_total || 0,
      currency: session.currency || 'dkk',
      status: 'pending',
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

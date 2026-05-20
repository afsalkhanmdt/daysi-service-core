import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/core/db/connect';
import SubscriptionDetails, { OSType } from '@/models/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const { familyId, userId, subscriptionMonths, membersUpdatedOn } =
      await req.json();


    if (!familyId || !userId || !subscriptionMonths) {
      console.warn('[Checkout] Missing required fields:', { familyId, userId, subscriptionMonths });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!token) {
      console.warn('[Checkout] Missing user token');
      return NextResponse.json(
        { error: 'Missing user token' },
        { status: 401 }
      );
    }

    const priceId1Month = process.env.STRIPE_PRICE_ID_1_MONTH;
    const priceId12Month = process.env.STRIPE_PRICE_ID_12_MONTH;
    const successUrl = process.env.STRIPE_SUCCESS_URL;
    const cancelUrl = process.env.STRIPE_CANCEL_URL;

    if (!priceId1Month || !priceId12Month || !successUrl || !cancelUrl) {
      console.error('[Checkout] Missing Stripe environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Stripe environment variables' },
        { status: 500 }
      );
    }

    const isYearly = Number(subscriptionMonths) === 12;

    const priceId = isYearly ? priceId12Month : priceId1Month;

    const productId = isYearly
      ? 'com.familycal.daysi.one.year.version71'
      : 'com.familycal.daysi.one.month.version71';


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
  productId,
  membersUpdatedOn: membersUpdatedOn || '',
},
    });


    await dbConnect();

await SubscriptionDetails.create({
  FamilyId: Number(familyId),
  ProductId: productId,
  OSType: OSType.Web,
  ReceiptData: session.id,
  OrderId: session.id,
  PurchasedDate: new Date(),
  SubscriptionStatus: 0,
  ConsumeStatus: false,

  userId: userId.toString(),
  subscriptionMonths: Number(subscriptionMonths),
  stripeSessionId: session.id,
  userToken: token,
  amount: session.amount_total || 0,
  currency: session.currency || 'dkk',
  status: 'pending',
});


    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[Checkout] Stripe Checkout Error:', error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
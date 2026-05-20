import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/core/db/connect';
import SubscriptionDetails from '@/models/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const DOTNET_API_URL = process.env.DOTNET_API_URL!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    console.warn('[Webhook] Missing Stripe signature');
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulSubscription(session);
    } 

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Processing failed:', error);

    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulSubscription(session: Stripe.Checkout.Session) {
  await dbConnect();

  const { familyId, productId, membersUpdatedOn } = session.metadata || {};


  if (!familyId || !productId) {
    console.error('[Webhook] Missing familyId or productId in metadata');
    throw new Error('Missing familyId or productId in Stripe metadata');
  }

  const subscription = await SubscriptionDetails.findOne({
    stripeSessionId: session.id,
  });

  if (!subscription) {
    console.error('[Webhook] Subscription record not found for session:', session.id);
    throw new Error(`Subscription record not found for Stripe session: ${session.id}`);
  }

  if (!subscription.userToken) {
    console.error('[Webhook] Missing user token in subscription record');
    throw new Error(`Missing user token for Stripe session: ${session.id}`);
  }

  const token = subscription.userToken;

  await SubscriptionDetails.findOneAndUpdate(
    { stripeSessionId: session.id },
    {
      stripeSessionId: session.id,
      stripeCustomerId:
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id,
      stripeSubscriptionId:
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id,
      paymentStatus: session.payment_status,
      status: 'completed',
    },
    { new: true }
  );

  const purchasePayload = {
    FamilyId: Number(familyId),
    ProductId: productId,
    OrderId: session.id,
    ReceiptData: session.id,
    OSType: 2,
    PurchasedDate: new Date().toISOString(),
    ConsumeStatus: 0,
    SubscriptionStatus: 0,
    MembersUpdatedOn: membersUpdatedOn || '',
  };

  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
  expand: ['subscription'],
});

if (fullSession.payment_status !== 'paid') {
  throw new Error(`Stripe payment not paid. Status: ${fullSession.payment_status}`);
}

const stripeSubscription = fullSession.subscription as Stripe.Subscription;

if (
  !stripeSubscription ||
  !['active', 'trialing'].includes(stripeSubscription.status)
) {
  throw new Error(`Stripe subscription not active. Status: ${stripeSubscription?.status}`);
}


  const response = await fetch(`${DOTNET_API_URL}/api/PurchaseApp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(purchasePayload),
  });

  const result = await response.text();

  if (!response.ok) {
    console.error('[Webhook] .NET API purchase failed');
    await SubscriptionDetails.findOneAndUpdate(
      { stripeSessionId: session.id },
      {
        dotnetSynced: false,
        dotnetError: result,
      }
    );

    throw new Error(`.NET PurchaseApp API failed: ${response.status} ${result}`);
  }

  await SubscriptionDetails.findOneAndUpdate(
    { stripeSessionId: session.id },
    {
      dotnetSynced: true,
      dotnetResponse: result,
    }
  );
}
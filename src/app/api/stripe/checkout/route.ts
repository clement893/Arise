import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const PLANS = {
  individual: {
    name: 'Individual Plan',
    description: 'For professionals seeking personal growth',
    price: 4900, // $49.00 in cents
    features: [
      'All 4 assessments (MBTI, TKI, 360°, Wellness)',
      'Comprehensive leadership report',
      'Personal development plan',
      'Progress tracking dashboard',
      'Email support',
    ],
  },
  coach: {
    name: 'Coach Plan',
    description: 'For coaches and consultants',
    price: 14900, // $149.00 in cents
    features: [
      'Everything in Individual',
      'Up to 25 client accounts',
      'Client management dashboard',
      'White-label reports',
      'Group analytics',
      'Priority support',
    ],
  },
  business: {
    name: 'Business Plan',
    description: 'For organizations and teams',
    price: 49900, // $499.00 in cents
    features: [
      'Everything in Coach',
      'Unlimited team members',
      'Team analytics & insights',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      'SSO integration',
    ],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, userId, userEmail } = body;

    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const plan = PLANS[planId as keyof typeof PLANS];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description,
              metadata: {
                planId,
              },
            },
            unit_amount: plan.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing/cancel`,
      customer_email: userEmail || undefined,
      metadata: {
        userId: userId?.toString() || '',
        planId,
      },
      subscription_data: {
        metadata: {
          userId: userId?.toString() || '',
          planId,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

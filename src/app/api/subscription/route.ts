import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader } from '@/lib/jwt';
import { verifyAccessToken } from '@/lib/jwt';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  });
}

// Helper to get user from Authorization header (consistent with middleware)
function getUserFromRequest(request: NextRequest): number | null {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return null;
  }
  
  const payload = verifyAccessToken(token);
  return payload?.userId || null;
}

// GET - Get subscription info and payment history
export async function GET(request: NextRequest) {
  try {
    const userId = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let invoices: Stripe.Invoice[] = [];
    let upcomingInvoice: Stripe.UpcomingInvoice | null = null;

    // If user has Stripe customer ID, fetch payment history
    if (user.stripeCustomerId) {
      try {
        const stripe = getStripe();
        
        // Get invoices (payment history)
        const invoiceList = await stripe.invoices.list({
          customer: user.stripeCustomerId,
          limit: 10,
        });
        invoices = invoiceList.data;

        // Get upcoming invoice from subscription data
        if (user.stripeSubscriptionId) {
          try {
            // Use subscription to get next billing info
            const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
            // Access properties safely using type assertion
            // Stripe.Subscription has current_period_end but TypeScript may not recognize it in some versions
            const subscription = sub as unknown as {
              current_period_end?: number;
              items?: { data?: Array<{ price?: { unit_amount?: number } }> };
              currency?: string;
            };
            if (subscription && subscription.current_period_end) {
              upcomingInvoice = {
                amount_due: subscription.items?.data?.[0]?.price?.unit_amount || 0,
                currency: subscription.currency || 'usd',
                next_payment_attempt: subscription.current_period_end,
              } as unknown as Stripe.UpcomingInvoice;
            }
          } catch {
            // No upcoming invoice
          }
        }
      } catch (error) {
        console.error('Error fetching Stripe data:', error);
      }
    }

    // Format response
    const response = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        billingCycle: user.billingCycle,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
      },
      subscription: user.subscription ? {
        id: user.subscription.id,
        plan: user.subscription.plan,
        status: user.subscription.status,
        price: user.subscription.price,
        currency: user.subscription.currency,
        billingCycle: user.subscription.billingCycle,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        nextBillingDate: user.subscription.nextBillingDate,
        cancelledAt: user.subscription.cancelledAt,
        hasCoaching: user.subscription.hasCoaching,
        coachingSessions: user.subscription.coachingSessions,
      } : null,
      invoices: invoices.map(inv => ({
        id: inv.id,
        number: inv.number,
        amount: inv.amount_paid,
        currency: inv.currency,
        status: inv.status,
        date: inv.created,
        pdfUrl: inv.invoice_pdf,
        hostedUrl: inv.hosted_invoice_url,
        description: inv.lines.data[0]?.description || 'Subscription',
      })),
      upcomingInvoice: upcomingInvoice ? {
        amount: upcomingInvoice.amount_due,
        currency: upcomingInvoice.currency,
        date: upcomingInvoice.next_payment_attempt,
      } : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// POST - Create customer portal session for managing subscription
export async function POST(request: NextRequest) {
  try {
    const userId = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/dashboard/profile`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const stripe = getStripe();

    // Cancel subscription at period end
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update local subscription status
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

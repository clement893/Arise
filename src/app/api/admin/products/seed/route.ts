import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse } from '@/lib/auth';

const products = [
  // Products from signup/choose-plan
  {
    name: 'Starter',
    planType: 'starter' as const,
    description: 'Perfect for individuals starting their leadership journey',
    monthlyPrice: 4900, // $49 in cents
    annualPrice: 3900, // $39/month in cents (annual billing)
    currency: 'USD',
    features: [
      'All 4 assessments',
      'Personal dashboard',
      'Basic reports',
      'Email support'
    ],
    isActive: true,
    isPopular: false,
    displayOrder: 1,
  },
  {
    name: 'Professional',
    planType: 'professional' as const,
    description: 'For serious leaders committed to growth',
    monthlyPrice: 9900, // $99 in cents
    annualPrice: 7900, // $79/month in cents (annual billing)
    currency: 'USD',
    features: [
      'Everything in Starter',
      'Advanced analytics',
      'Priority support',
      '1-on-1 coaching session'
    ],
    isActive: true,
    isPopular: true,
    displayOrder: 2,
  },
  {
    name: 'Enterprise',
    planType: 'enterprise' as const,
    description: 'For teams and organizations',
    monthlyPrice: 19900, // $199 in cents
    annualPrice: 15900, // $159/month in cents (annual billing)
    currency: 'USD',
    features: [
      'Everything in Professional',
      'Team dashboards',
      'Custom integrations',
      'Dedicated account manager'
    ],
    isActive: true,
    isPopular: false,
    displayOrder: 3,
  },
  // Products from pricing page
  {
    name: 'Individual',
    planType: 'individual' as const,
    description: 'For professionals seeking personal growth',
    monthlyPrice: 4900, // $49 in cents
    annualPrice: 3900, // Assuming same discount
    currency: 'USD',
    features: [
      'All 4 assessments (MBTI, TKI, 360°, Wellness)',
      'Comprehensive leadership report',
      'Personal development plan',
      'Progress tracking dashboard',
      'Email support',
    ],
    isActive: true,
    isPopular: false,
    displayOrder: 4,
  },
  {
    name: 'Coach',
    planType: 'coach' as const,
    description: 'For coaches and consultants',
    monthlyPrice: 14900, // $149 in cents
    annualPrice: 11900, // Assuming 20% discount
    currency: 'USD',
    features: [
      'Everything in Individual',
      'Up to 25 client accounts',
      'Client management dashboard',
      'White-label reports',
      'Group analytics',
      'Priority support',
    ],
    isActive: true,
    isPopular: true,
    displayOrder: 5,
  },
];

// POST - Seed products from signup/pricing pages
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return unauthorizedResponse('Admin access required');
    }

    // Check if Product table exists by trying to count
    try {
      await prisma.product.count();
    } catch (tableError: any) {
      // Table doesn't exist - migration not applied
      if (tableError?.code === 'P2021' || tableError?.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Product table does not exist. Please run the database migration first.',
            details: 'The Product table needs to be created in the database. Run: npx prisma migrate deploy or npx prisma db push'
          },
          { status: 500 }
        );
      }
      throw tableError;
    }

    const results = [];

    for (const product of products) {
      try {
        // Check if product already exists
        const existing = await prisma.product.findUnique({
          where: { planType: product.planType },
        });

        if (existing) {
          const updated = await prisma.product.update({
            where: { planType: product.planType },
            data: product,
          });
          results.push({ action: 'updated', product: updated.name });
        } else {
          const created = await prisma.product.create({
            data: product,
          });
          results.push({ action: 'created', product: created.name });
        }
      } catch (error) {
        console.error(`Error processing product ${product.name}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ action: 'error', product: product.name, error: errorMessage });
      }
    }

    const hasErrors = results.some(r => r.action === 'error');
    
    return NextResponse.json({
      message: hasErrors ? 'Products seeded with some errors' : 'Products seeded successfully',
      results,
    });
  } catch (error) {
    console.error('Seed products error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to seed products',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

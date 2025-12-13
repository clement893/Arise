import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, unauthorizedResponse } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for product
const productSchema = z.object({
  name: z.string().min(1),
  planType: z.enum(['starter', 'individual', 'coach', 'professional', 'enterprise', 'revelation', 'coaching']),
  description: z.string().optional(),
  monthlyPrice: z.number().int().min(0),
  annualPrice: z.number().int().min(0),
  currency: z.string().default('USD'),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

// GET - Récupérer tous les produits
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return unauthorizedResponse('Admin access required');
    }

    const products = await prisma.product.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to get products' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return unauthorizedResponse('Admin access required');
    }

    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid product data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const productData = validation.data;

    // Check if planType already exists
    const existingProduct = await prisma.product.findUnique({
      where: { planType: productData.planType },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this plan type already exists' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        planType: productData.planType,
        description: productData.description,
        monthlyPrice: productData.monthlyPrice,
        annualPrice: productData.annualPrice,
        currency: productData.currency,
        features: productData.features || [],
        isActive: productData.isActive,
        isPopular: productData.isPopular,
        displayOrder: productData.displayOrder,
      },
    });

    return NextResponse.json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

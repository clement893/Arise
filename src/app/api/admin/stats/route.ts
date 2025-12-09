import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const totalUsers = users.length;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Users from last 30 days
    const recentUsers = users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo);
    const previousMonthUsers = users.filter(u => 
      new Date(u.createdAt) >= sixtyDaysAgo && new Date(u.createdAt) < thirtyDaysAgo
    );
    
    const userGrowth = previousMonthUsers.length > 0 
      ? Math.round(((recentUsers.length - previousMonthUsers.length) / previousMonthUsers.length) * 100)
      : recentUsers.length > 0 ? 100 : 0;

    // Active users (logged in within last 7 days or have assessments)
    const activeUsers = users.filter(u => {
      const lastActive = new Date(u.updatedAt);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return lastActive >= sevenDaysAgo;
    }).length;

    const activeRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    // Get assessments count
    const assessments = await prisma.assessmentResult.findMany({
      where: {
        completedAt: { gte: thirtyDaysAgo }
      }
    });
    const assessmentsCompleted = assessments.length;

    // Calculate revenue (simplified - based on subscriptions)
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'active' }
    });
    
    const planPrices: Record<string, number> = {
      starter: 0,
      individual: 49,
      coach: 149,
      business: 499
    };
    
    const totalRevenue = subscriptions.reduce((sum, sub) => {
      return sum + (planPrices[sub.plan] || 0);
    }, 0);

    // Format users for response
    const formattedUsers = users.map(user => {
      // Calculate progress based on assessments
      const progress = Math.floor(Math.random() * 100); // Placeholder - should be calculated from real data
      
      // Determine status
      const lastActive = new Date(user.updatedAt);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgoDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      let status = 'active';
      if (lastActive < thirtyDaysAgoDate) {
        status = 'inactive';
      } else if (lastActive < sevenDaysAgo) {
        status = 'at_risk';
      }

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        plan: user.plan || 'starter',
        createdAt: user.createdAt,
        status,
        progress
      };
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalRevenue,
        assessmentsCompleted,
        userGrowth,
        activeRate,
        revenueGrowth: 24 // Placeholder
      },
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}

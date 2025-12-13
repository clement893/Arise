import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const coachEmail = process.env.COACH_EMAIL || 'clement@clementroy.work';
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: coachEmail }
  });

  if (existingUser) {
    // Update to coach if not already
    if (existingUser.role !== 'coach') {
      await prisma.user.update({
        where: { email: coachEmail },
        data: { 
          role: 'coach',
          userType: 'coach'
        }
      });
      console.log(`✅ User ${coachEmail} updated to coach role`);
    } else {
      console.log(`ℹ️ User ${coachEmail} is already a coach`);
    }
  } else {
    // Use environment variable for password, or generate a secure random one
    let coachPassword = process.env.COACH_PASSWORD;
    let passwordGenerated = false;
    
    if (!coachPassword) {
      // Generate a secure random password
      coachPassword = crypto.randomBytes(16).toString('base64').slice(0, 20) + '!A1';
      passwordGenerated = true;
    }
    
    const hashedPassword = await bcrypt.hash(coachPassword, 12);
    
    await prisma.user.create({
      data: {
        email: coachEmail,
        password: hashedPassword,
        firstName: 'Clement',
        lastName: 'Coach',
        role: 'coach',
        userType: 'coach',
        plan: 'coach',
        isActive: true,
        emailVerified: true
      }
    });
    
    console.log(`✅ Coach user created: ${coachEmail}`);
    console.log(`📧 Email: ${coachEmail}`);
    
    if (passwordGenerated) {
      console.log(`🔑 Generated Password: ${coachPassword}`);
      console.log(`⚠️  IMPORTANT: Save this password now! It won't be shown again.`);
      console.log(`⚠️  Consider setting COACH_PASSWORD environment variable for consistent deployments.`);
    } else {
      console.log(`🔑 Password: (from COACH_PASSWORD environment variable)`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error seeding coach:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


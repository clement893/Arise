import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'clement@clementroy.work';
  const password = 'Coach123!'; // Change this password after first login
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    // Update to coach if not already
    if (existingUser.role !== 'coach') {
      await prisma.user.update({
        where: { email },
        data: { 
          role: 'coach',
          userType: 'coach'
        }
      });
      console.log(`✅ User ${email} updated to coach role`);
    } else {
      console.log(`ℹ️ User ${email} is already a coach`);
    }
  } else {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create coach user
    const user = await prisma.user.create({
      data: {
        email,
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
    
    console.log(`✅ Coach user created successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`⚠️  IMPORTANT: Change this password after first login!`);
    console.log(`\nUser ID: ${user.id}`);
  }
}

main()
  .catch((e) => {
    console.error('Error creating coach:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


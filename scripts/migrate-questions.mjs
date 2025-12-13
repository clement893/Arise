import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TKI Questions - 30 pairs
const tkiQuestions = [
  { pair: 1, statement_a: "I press to get my points across", statement_b: "I try to investigate an issue to find a mutually acceptable solution.", mode_a: "Competing", mode_b: "Collaborating" },
  { pair: 2, statement_a: "I generally pursue my goals firmly.", statement_b: "I try to postpone the issue until I can properly reflect about it", mode_a: "Competing", mode_b: "Avoiding" },
  { pair: 3, statement_a: "I attempt to postpone the issue until I've had some time to think it over.", statement_b: "I give up some points in exchange for others.", mode_a: "Avoiding", mode_b: "Compromising" },
  { pair: 4, statement_a: "I try to win my position.", statement_b: "I might try to soothe the other's feelings and preserve our relationship.", mode_a: "Competing", mode_b: "Accommodating" },
  { pair: 5, statement_a: "I consistently seek the other's help in working out a solution.", statement_b: "I try to do what is necessary to avoid useless tensions.", mode_a: "Collaborating", mode_b: "Avoiding" },
  { pair: 6, statement_a: "I am firm in pursuing my goals.", statement_b: "I try to find a compromise solution.", mode_a: "Competing", mode_b: "Compromising" },
  { pair: 7, statement_a: "I try to find a middle ground.", statement_b: "I attempt to get all concerns and issues immediately out in the open.", mode_a: "Compromising", mode_b: "Collaborating" },
  { pair: 8, statement_a: "I sometimes avoid taking positions that would create controversy.", statement_b: "I will let the other person have some of their positions if they let me have some of mine.", mode_a: "Avoiding", mode_b: "Compromising" },
  { pair: 9, statement_a: "I suggest a middle ground.", statement_b: "I press to get my points made.", mode_a: "Compromising", mode_b: "Competing" },
  { pair: 10, statement_a: "I might try to soothe the other's feelings and preserve our relationship.", statement_b: "I am usually firm in pursuing my goals.", mode_a: "Accommodating", mode_b: "Competing" },
  { pair: 11, statement_a: "I attempt to get all concerns out in the open.", statement_b: "I feel that differences are not always worth worrying about.", mode_a: "Collaborating", mode_b: "Avoiding" },
  { pair: 12, statement_a: "I try to win my position.", statement_b: "Rather than negotiate on things we both disagree, I prefer to stress those things upon which we both agree.", mode_a: "Competing", mode_b: "Accommodating" },
  { pair: 13, statement_a: "I give up some points in exchange for others.", statement_b: "I try to postpone the issue until I have time to think about it.", mode_a: "Compromising", mode_b: "Avoiding" },
  { pair: 14, statement_a: "I consistently seek the other's help in working out a solution.", statement_b: "I try to find a compromise solution.", mode_a: "Collaborating", mode_b: "Compromising" },
  { pair: 15, statement_a: "I feel that differences are not always worth worrying about.", statement_b: "I make some effort to get my way.", mode_a: "Avoiding", mode_b: "Competing" },
  { pair: 16, statement_a: "I sometimes sacrifice my own wishes for the wishes of the other person.", statement_b: "I attempt to get all concerns and issues immediately out in the open.", mode_a: "Accommodating", mode_b: "Collaborating" },
  { pair: 17, statement_a: "I try to find a compromise solution.", statement_b: "I feel that differences are not always worth worrying about.", mode_a: "Compromising", mode_b: "Accommodating" },
  { pair: 18, statement_a: "I am usually firm in pursuing my goals.", statement_b: "I try to find a solution that satisfies both of us.", mode_a: "Competing", mode_b: "Collaborating" },
  { pair: 19, statement_a: "I propose a middle ground.", statement_b: "I am frequently concerned with satisfying all wishes.", mode_a: "Compromising", mode_b: "Collaborating" },
  { pair: 20, statement_a: "I will let the other person have some of their positions if they let me have some of mine.", statement_b: "I attempt to deal with all their and my concerns.", mode_a: "Compromising", mode_b: "Collaborating" },
  { pair: 21, statement_a: "I try to do what is necessary to avoid useless tensions.", statement_b: "I generally pursue my goals firmly.", mode_a: "Avoiding", mode_b: "Competing" },
  { pair: 22, statement_a: "I attempt to postpone the issue until I have had some time to think it over.", statement_b: "I might try to soothe the other's feelings and preserve our relationship.", mode_a: "Avoiding", mode_b: "Accommodating" },
  { pair: 23, statement_a: "I try to find a compromise solution.", statement_b: "I try to win my position.", mode_a: "Compromising", mode_b: "Competing" },
  { pair: 24, statement_a: "I try to do what is necessary to avoid useless tensions.", statement_b: "I sometimes sacrifice my own wishes for the wishes of the other person.", mode_a: "Avoiding", mode_b: "Accommodating" },
  { pair: 25, statement_a: "I consistently seek the other's help in working out a solution.", statement_b: "I am usually firm in pursuing my goals.", mode_a: "Collaborating", mode_b: "Competing" },
  { pair: 26, statement_a: "I try to find a middle ground.", statement_b: "I try to get the other person to settle for a compromise.", mode_a: "Compromising", mode_b: "Competing" },
  { pair: 27, statement_a: "I attempt to get all concerns and issues immediately out in the open.", statement_b: "I attempt to postpone the issue until I've had some time to think it over.", mode_a: "Collaborating", mode_b: "Avoiding" },
  { pair: 28, statement_a: "I sometimes sacrifice my own wishes for the wishes of the other person.", statement_b: "I try to win my position.", mode_a: "Accommodating", mode_b: "Competing" },
  { pair: 29, statement_a: "I give up some points in exchange for others.", statement_b: "I feel that differences are not always worth worrying about.", mode_a: "Compromising", mode_b: "Avoiding" },
  { pair: 30, statement_a: "I try to find a solution that satisfies both of us.", statement_b: "I might try to soothe the other's feelings and preserve our relationship.", mode_a: "Collaborating", mode_b: "Accommodating" },
];

// Wellness Questions
const wellnessQuestions = [
  // Substances (5 questions)
  { id: 1, category: 'substances', text: "I avoid or limit my weekly alcohol consumption to about 2 glasses per week." },
  { id: 2, category: 'substances', text: "I make healthy choices by avoiding tobacco in all forms, such as smoking, vaping, or chewing tobacco." },
  { id: 3, category: 'substances', text: "I take prescription and over-the-counter medications responsibly, following dosage instructions and consulting healthcare providers when needed." },
  { id: 4, category: 'substances', text: "I keep my caffeine consumption within healthy limits, which is no more than 3 cups of coffee or 8 cups of tea per day." },
  { id: 5, category: 'substances', text: "I do not consume illegal drugs and avoid usage of recreational drugs." },
  
  // Exercise (5 questions)
  { id: 6, category: 'exercise', text: "I am regularly active for at least 150 min (1.5h) per week in ways that get my heart rate up, like fast walking, cycling, or swimming." },
  { id: 7, category: 'exercise', text: "I do strength or resistance training, such as weightlifting, bodyweight exercises, or resistance bands, at least 2 times per week." },
  { id: 8, category: 'exercise', text: "I do flexibility or mobility exercises, such as stretching or yoga, at least 2–3 times per week." },
  { id: 9, category: 'exercise', text: "I avoid sitting for longer than 30–60 minutes at a time by standing, walking, or moving around during the day." },
  { id: 10, category: 'exercise', text: "I have the physical and mental energy to stay active, focused, and productive throughout the day." },
  
  // Nutrition (5 questions)
  { id: 11, category: 'nutrition', text: "I make it a habit to eat balanced meals — for example, meals that combine protein (like fish, beans, or eggs), healthy fats (like nuts or olive oil), and complex carbs (like whole grains or vegetables)." },
  { id: 12, category: 'nutrition', text: "Each day, I make sure to eat fruits and vegetables — about 5 or more servings, such as a piece of fruit, a handful of raw veggies, or half a cup of cooked vegetables." },
  { id: 13, category: 'nutrition', text: "I maintain a healthier lifestyle by focusing on nutritious foods while keeping processed foods, sugary drinks, and sweet snacks to a minimum — treating them as occasional rather than everyday choices." },
  { id: 14, category: 'nutrition', text: "I make sure to drink enough water throughout the day, aiming for the recommended amount — about 2.7 liters (91 ounces) for women and 3.8 liters (128 ounces) for men." },
  { id: 15, category: 'nutrition', text: "I consistently follow healthy eating habits (closer to 80%) while allowing some flexibility during the week (closer to 20%)." },
  
  // Sleep (5 questions)
  { id: 16, category: 'sleep', text: "I get 7–9 hours of sleep most nights, supporting my health and daily energy." },
  { id: 17, category: 'sleep', text: "I maintain a regular sleep schedule by going to bed and waking up at consistent times." },
  { id: 18, category: 'sleep', text: "Most nights, my sleep feels restful and restorative, leaving me refreshed in the morning." },
  { id: 19, category: 'sleep', text: "I prepare for restful sleep by limiting caffeine, alcohol, and screen use (such as TV, phone, or computer) in the hours before bed." },
  { id: 20, category: 'sleep', text: "If my sleep is disrupted by stress, noise, or restlessness, I take healthy steps — such as calming my mind, adjusting my environment, or practicing relaxation techniques — to improve my rest." },
  
  // Social (5 questions)
  { id: 21, category: 'social', text: "I have close personal relationships that are strong, supportive, and nurturing, and I feel I can rely on them in times of need." },
  { id: 22, category: 'social', text: "I connect with friends, family, or community several times a week in meaningful ways — such as supportive conversations, shared activities, or quality time together." },
  { id: 23, category: 'social', text: "I feel comfortable seeking support from others when I need it." },
  { id: 24, category: 'social', text: "I choose positive and uplifting social interactions that support my well-being." },
  { id: 25, category: 'social', text: "I balance time with others and time alone in a way that supports my health and happiness — making space for meaningful connection while also honoring my need for rest and personal time." },
  
  // Stress (5 questions)
  { id: 26, category: 'stress', text: "I notice when I am feeling stressed and use healthy strategies — such as deep breathing, taking breaks, or talking to someone — to manage it effectively." },
  { id: 27, category: 'stress', text: "A few times each week, I practice relaxation techniques — such as meditation, stretching, or deep breathing — to help reduce stress and restore calm." },
  { id: 28, category: 'stress', text: "I make time several times a week for hobbies, fun, or personal enjoyment, which helps me relax, recharge, and maintain balance in my life." },
  { id: 29, category: 'stress', text: "I manage my workload in a balanced way, setting healthy limits and taking breaks when needed, so I can stay productive without feeling overwhelmed." },
  { id: 30, category: 'stress', text: "I experience a sense of calm, focus, and emotional balance in my daily life, helping me handle challenges with resilience and clarity." },
];

// 360° Self Assessment Questions
const selfAssessmentQuestions = [
  // Communication (5 questions)
  { id: 1, category: 'communication', text: "I communicate my ideas and expectations clearly and in a way that is easy to understand." },
  { id: 2, category: 'communication', text: "I listen attentively and demonstrate understanding of others' perspectives before responding." },
  { id: 3, category: 'communication', text: "I adapt my communication style to different audiences and situations." },
  { id: 4, category: 'communication', text: "I provide feedback that is respectful, actionable, and supportive of growth." },
  { id: 5, category: 'communication', text: "My communication fosters collaboration, engagement and alignment within the team." },
  
  // Team Culture (5 questions)
  { id: 6, category: 'team_culture', text: "I promote teamwork and support colleagues to achieve shared goals." },
  { id: 7, category: 'team_culture', text: "I treat team members with respect and encourage an inclusive environment where everyone feels valued." },
  { id: 8, category: 'team_culture', text: "I build trust within the team by being reliable, transparent and accountable." },
  { id: 9, category: 'team_culture', text: "I address and resolve conflicts in a constructive and respectful way." },
  { id: 10, category: 'team_culture', text: "I actively contribute to building a positive, motivating and collaborative team culture." },
  
  // Leadership Style (5 questions)
  { id: 11, category: 'leadership', text: "I inspire and motivate others towards a shared vision." },
  { id: 12, category: 'leadership', text: "I demonstrate fairness, integrity and consistency in my leadership." },
  { id: 13, category: 'leadership', text: "I empower others to take ownership and make decisions." },
  { id: 14, category: 'leadership', text: "I adapt my leadership style to different situations and individuals." },
  { id: 15, category: 'leadership', text: "I provide clear direction while also encouraging autonomy." },
  
  // Change Management (5 questions)
  { id: 16, category: 'change', text: "I embrace and adapt effectively to organizational changes." },
  { id: 17, category: 'change', text: "I help others understand and navigate change confidently." },
  { id: 18, category: 'change', text: "I maintain a positive and flexible attitude during transitions." },
  { id: 19, category: 'change', text: "I support the team effectively during challenges linked to change." },
  { id: 20, category: 'change', text: "I actively contribute to driving and sustaining change initiatives." },
  
  // Problem Solving and Decision Making (5 questions)
  { id: 21, category: 'problem_solving', text: "I analyze problems effectively and identify appropriate solutions." },
  { id: 22, category: 'problem_solving', text: "I consider diverse perspectives when solving problems." },
  { id: 23, category: 'problem_solving', text: "I manage disagreements constructively and seek mutually beneficial solutions." },
  { id: 24, category: 'problem_solving', text: "I remain calm and constructive under pressure." },
  { id: 25, category: 'problem_solving', text: "I follow through on problem-solving actions to ensure effective outcomes." },
  
  // Stress Management (5 questions)
  { id: 26, category: 'stress', text: "I manage stress without negatively affecting performance or team dynamics." },
  { id: 27, category: 'stress', text: "I demonstrate resilience and composure under pressure." },
  { id: 28, category: 'stress', text: "I use healthy coping strategies to handle stress effectively." },
  { id: 29, category: 'stress', text: "I support colleagues in managing stress and maintaining well-being." },
  { id: 30, category: 'stress', text: "I balance workload and prioritize effectively to prevent unnecessary stress." },
];

async function migrateQuestions() {
  try {
    console.log('Starting migration of questions to database...');

    // Migrate TKI questions
    console.log('\nMigrating TKI questions...');
    // Delete existing TKI questions
    await prisma.assessmentQuestion.deleteMany({
      where: { assessmentType: 'tki' }
    });
    
    for (const q of tkiQuestions) {
      // For TKI, we store the pair data in the text field as JSON
      const questionText = JSON.stringify({
        pair: q.pair,
        statement_a: q.statement_a,
        statement_b: q.statement_b,
        mode_a: q.mode_a,
        mode_b: q.mode_b,
      });
      
      await prisma.assessmentQuestion.create({
        data: {
          assessmentType: 'tki',
          text: questionText,
          category: 'tki_pair',
          order: q.pair - 1,
        },
      });
    }
    console.log(`✓ Migrated ${tkiQuestions.length} TKI questions`);

    // Migrate Wellness questions
    console.log('\nMigrating Wellness questions...');
    // Delete existing Wellness questions
    await prisma.assessmentQuestion.deleteMany({
      where: { assessmentType: 'wellness' }
    });
    
    for (const q of wellnessQuestions) {
      await prisma.assessmentQuestion.create({
        data: {
          assessmentType: 'wellness',
          text: q.text,
          category: q.category,
          order: q.id - 1,
        },
      });
    }
    console.log(`✓ Migrated ${wellnessQuestions.length} Wellness questions`);

    // Migrate 360° Self Assessment questions
    console.log('\nMigrating 360° Self Assessment questions...');
    // Delete existing 360-self questions
    await prisma.assessmentQuestion.deleteMany({
      where: { assessmentType: '360-self' }
    });
    
    for (const q of selfAssessmentQuestions) {
      await prisma.assessmentQuestion.create({
        data: {
          assessmentType: '360-self',
          text: q.text,
          category: q.category,
          order: q.id - 1,
        },
      });
    }
    console.log(`✓ Migrated ${selfAssessmentQuestions.length} 360° Self Assessment questions`);

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateQuestions();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TKI Questions - format pair with A/B choices
const tkiQuestions = [
  { pair: 1, statement_a: "I press to get my points across", statement_b: "I try to investigate an issue to find a mutually acceptable solution.", mode_a: "Competing", mode_b: "Collaborating" },
  { pair: 2, statement_a: "I generally pursue my goals firmly.", statement_b: "I try to postpone the issue until I can properly reflect about it", mode_a: "Competing", mode_b: "Avoiding" },
  { pair: 3, statement_a: "I attempt to postpone the issue until I've had some time to think it over.", statement_b: "I give up some points in exchange for others.", mode_a: "Avoiding", mode_b: "Compromising" },
  { pair: 4, statement_a: "I try to win my position.", statement_b: "I might try to soothe the other's feelings and preserve our relationship.", mode_a: "Competing", mode_b: "Accommodating" },
  { pair: 5, statement_a: "I consistently seek the other's help in working out a solution.", statement_b: "I try to do what is necessary to avoid useless tensions.", mode_a: "Collaborating", mode_b: "Avoiding" },
  { pair: 6, statement_a: "I am firm in pursuing my goals.", statement_b: "I try to find a compromise solution.", mode_a: "Competing", mode_b: "Compromising" },
  { pair: 7, statement_a: "I try to find a middle ground.", statement_b: "I attempt to get all concerns and issues immediately out in the open.", mode_a: "Compromising", mode_b: "Collaborating" },
  { pair: 8, statement_a: "I sometimes avoid taking positions that would create controversy.", statement_b: "I will let the other person have some of his/her positions if he/she lets me have some of mine.", mode_a: "Avoiding", mode_b: "Compromising" },
  { pair: 9, statement_a: "I suggest a middle ground.", statement_b: "I press to get my points made.", mode_a: "Compromising", mode_b: "Competing" },
  { pair: 10, statement_a: "I might try to soothe the other's feelings and preserve our relationship.", statement_b: "I am usually firm in pursuing my goals.", mode_a: "Accommodating", mode_b: "Competing" },
  { pair: 11, statement_a: "I attempt to get all concerns out in the open.", statement_b: "I feel that differences are not always worth worrying about.", mode_a: "Collaborating", mode_b: "Avoiding" },
  { pair: 12, statement_a: "I try to win my position.", statement_b: "Rather negotiate on things we both disagree, I rather stress those things on upon which we both agree", mode_a: "Competing", mode_b: "Accommodating" },
  { pair: 13, statement_a: "I give up some points in exchange for others.", statement_b: "I try to postpone the issue until I have time to think about it.", mode_a: "Compromising", mode_b: "Avoiding" },
  { pair: 14, statement_a: "I consistently seek the other's help in working out a solution.", statement_b: "I try to find a compromise solution.", mode_a: "Collaborating", mode_b: "Compromising" },
  { pair: 15, statement_a: "I feel that differences are not always worth worrying about.", statement_b: "I make some effort to get my way.", mode_a: "Avoiding", mode_b: "Competing" },
  { pair: 16, statement_a: "I sometimes sacrifice my own wishes for the wishes of the other person.", statement_b: "I attempt to get all concerns and issues immediately out in the open.", mode_a: "Accommodating", mode_b: "Collaborating" },
  { pair: 17, statement_a: "I try to find a compromise solution.", statement_b: "I feel that differences are not always worth worrying about.", mode_a: "Compromising", mode_b: "Accommodating" },
  { pair: 18, statement_a: "I am usually firm in pursuing my goals.", statement_b: "I try to find a solution that satisfies both of us.", mode_a: "Competing", mode_b: "Collaborating" },
  { pair: 19, statement_a: "I propose a middle ground.", statement_b: "I am frequently concerned in satistying all wishes", mode_a: "Compromising", mode_b: "Collaborating" },
  { pair: 20, statement_a: "I will let the other person have some of his/her positions if he/she lets me have some of mine.", statement_b: "I attempt to deal with all his/her and my concerns.", mode_a: "Compromising", mode_b: "Collaborating" },
  { pair: 21, statement_a: "I try to do what is necessary to avoid useless tensions.", statement_b: "I generally pursue my goals firmly.", mode_a: "Avoiding", mode_b: "Competing" },
  { pair: 22, statement_a: "I attempt to postpone the issue until I have had some time to think it over.", statement_b: "I might try to soothe the other's feelings and preserve our relationship.", mode_a: "Avoiding", mode_b: "Accommodating" },
  { pair: 23, statement_a: "I try to find a compromise solution.", statement_b: "I try to win my position.", mode_a: "Compromising", mode_b: "Competing" },
  { pair: 24, statement_a: "I try to do what is necessary to avoid useless tensions.", statement_b: "I sometimes sacrifice my own wishes for the wishes of the other person.", mode_a: "Avoiding", mode_b: "Accommodating" },
  { pair: 25, statement_a: "I consistently seek the other's help in working out a solution.", statement_b: "I am usually firm in pursuing my goals.", mode_a: "Collaborating", mode_b: "Competing" },
  { pair: 26, statement_a: "I try to find a middle ground.", statement_b: "I try to get the other person to settle for a compromise", mode_a: "Compromising", mode_b: "Competing" },
  { pair: 27, statement_a: "I attempt to get all concerns and issues immediately out in the open.", statement_b: "I attempt to postpone the issue until I've had some time to think it over.", mode_a: "Collaborating", mode_b: "Avoiding" },
  { pair: 28, statement_a: "I sometimes sacrifice my own wishes for the wishes of the other person.", statement_b: "I try to win my position.", mode_a: "Accommodating", mode_b: "Competing" },
  { pair: 29, statement_a: "I give up some points in exchange for others.", statement_b: "I feel that differences are not always worth worrying about.", mode_a: "Compromising", mode_b: "Avoiding" },
  { pair: 30, statement_a: "I try to find a solution that satisfies both of us.", statement_b: "I might try to soothe the other's feelings and preserve our relationship.", mode_a: "Collaborating", mode_b: "Accommodating" }
];

// Wellness Questions
const wellnessQuestions = [
  { pillar: "Physical", category: "Substances", question: "I avoid or limit my weekly alcohol consumption to about 2 glasses per week" },
  { pillar: "Physical", category: "Substances", question: "I make healthy choices by avoiding tobacco in all forms, such as smoking, vaping, or chewing tobacco." },
  { pillar: "Physical", category: "Substances", question: "I take prescription and over-the-counter medications responsibly, following dosage instructions and using them only when medically necessary" },
  { pillar: "Physical", category: "Substances", question: "I keep my caffeine consumption within healthy limits, which is no more than 3 cups of coffee or 8 cups of tea per day" },
  { pillar: "Physical", category: "Substances", question: "I do not consume illegal drugs and avoid usage of recreational drugs" },
  { pillar: "Physical", category: "Exercise", question: "I am regularly active for at least 150 min (1.5h) per week in ways that get my heart rate up, like fast walking, jogging, cycling, or sports." },
  { pillar: "Physical", category: "Exercise", question: "I do strength or resistance training, such as weightlifting, bodyweight exercises, or resistance bands, at least twice a week." },
  { pillar: "Physical", category: "Exercise", question: "I do flexibility or mobility exercises, such as stretching or yoga, at least 2-3 times per week" },
  { pillar: "Physical", category: "Exercise", question: "I avoid sitting for longer than 30-60 minutes at a time by standing, walking, or moving around during the day." },
  { pillar: "Physical", category: "Exercise", question: "I have the physical and mental energy to stay active, focused, and productive throughout the day." },
  { pillar: "Physical", category: "Nutrition", question: "I make it a habit to eat balanced meals - for example, meals that combine protein (like fish, beans, or eggs), healthy fats (like nuts or olive oil), and complex carbs (like whole grains or vegetables)." },
  { pillar: "Physical", category: "Nutrition", question: "Each day, I make sure to eat fruits and vegetables - about 5 or more servings, such as a piece of fruit, a handful of raw veggies, or half a cup of cooked vegetables." },
  { pillar: "Physical", category: "Nutrition", question: "I maintain a healthier lifestyle by focusing on nutritious foods while keeping processed foods, sugary drinks, and sweet snacks to a minimum - treating them as occasional rather than everyday choices." },
  { pillar: "Physical", category: "Nutrition", question: "I make sure to drink enough water throughout the day, aiming for the recommended amount - about 2.7 liters (91 ounces) for women and 3.8 liters (128 ounces) for men." },
  { pillar: "Physical", category: "Nutrition", question: "I consistently follow healthy eating habits (closer to 80%) while allowing some flexibility during the week (closer to 20%)" },
  { pillar: "Physical", category: "Sleep", question: "I get 7-9 hours of sleep most nights, supporting my health and daily energy." },
  { pillar: "Physical", category: "Sleep", question: "I maintain a regular sleep schedule by going to bed and waking up at consistent times." },
  { pillar: "Physical", category: "Sleep", question: "Most nights, my sleep feels restful and restorative, leaving me refreshed in the morning." },
  { pillar: "Physical", category: "Sleep", question: "I prepare for restful sleep by limiting caffeine, alcohol, and screen use (such as TV, phone, or computer) in the evening - especially within 1-2 hours before bedtime" },
  { pillar: "Physical", category: "Sleep", question: "If my sleep is disrupted by stress, noise, or restlessness, I take healthy steps - such as calming my mind, creating a quiet environment, or using relaxation techniques - to settle back into restful sleep." },
  { pillar: "Emotional", category: "Social", question: "I have close personal relationships that are strong, supportive, and nurturing, and I feel I can rely on these people when I need help or support." },
  { pillar: "Emotional", category: "Social", question: "I connect with friends, family, or community several times a week in meaningful ways - such as supportive conversations, shared activities, or spending quality time together." },
  { pillar: "Emotional", category: "Social", question: "I feel comfortable seeking support from others when I need it." },
  { pillar: "Emotional", category: "Social", question: "I choose positive and uplifting social interactions that support my well-being." },
  { pillar: "Emotional", category: "Social", question: "I balance time with others and time alone in a way that supports my health and happiness - making space for connection, while also giving myself quiet time to rest, recharge, and take care of personal needs" },
  { pillar: "Mental", category: "Stress", question: "I notice when I am feeling stressed and use healthy strategies - such as deep breathing, taking breaks, exercising, or talking with someone I trust - to manage it as part of my daily life." },
  { pillar: "Mental", category: "Stress", question: "A few times each week, I practice relaxation techniques - such as meditation, stretching, or deep breathing - to calm my mind, release tension, and support my overall well-being." },
  { pillar: "Mental", category: "Stress", question: "I make time several times a week for hobbies, fun, or personal enjoyment, which helps me relax, recharge, and maintain my well-being." },
  { pillar: "Mental", category: "Stress", question: "I manage my workload in a balanced way, setting healthy limits and taking breaks when needed, so I can stay productive without feeling overwhelmed or burned out" },
  { pillar: "Mental", category: "Stress", question: "I experience a sense of calm, focus, and emotional balance in my daily life, helping me handle challenges without feeling overly stressed or unsettled." }
];

// 360 Self Questions
const selfQuestions = [
  { category: "Communication", question: "I communicate my ideas and expectations clearly and in a way that is easy to understand." },
  { category: "Communication", question: "I listen attentively and demonstrate understanding of others' perspectives before responding" },
  { category: "Communication", question: "I adapt my communication style to different audiences and situations." },
  { category: "Communication", question: "I provide feedback that is respectful, actionable, and supportive of growth" },
  { category: "Communication", question: "My communication fosters collaboration, engagement and alignment within the team." },
  { category: "Team Culture", question: "I promote teamwork and support colleagues to achieve shared goals" },
  { category: "Team Culture", question: "I treat team members with respect and encourage an inclusive environment where everyone feels valued." },
  { category: "Team Culture", question: "I build trust within the team by being reliable, transparent and accountable" },
  { category: "Team Culture", question: "I address and resolve conflicts in a constructive and respectful way" },
  { category: "Team Culture", question: "I actively contribute to building a positive, motivating and collaborative team culture." },
  { category: "Leadership Style", question: "I inspire and motivate others towards a shared vision" },
  { category: "Leadership Style", question: "I demonstrate fairness, integrity and consistency in my leadership." },
  { category: "Leadership Style", question: "I empower others to take ownership and make decisions." },
  { category: "Leadership Style", question: "I adapt my leadership style to different situations and individuals." },
  { category: "Leadership Style", question: "I provide clear direction while also encouraging autonomy." },
  { category: "Change Management", question: "I embrace and adapt effectively to organizational changes." },
  { category: "Change Management", question: "I help others understand and navigate change confidently." },
  { category: "Change Management", question: "I maintain a positive and flexible attitude during transitions." },
  { category: "Change Management", question: "I support the team effectively during challenges linked to change." },
  { category: "Change Management", question: "I actively contribute to driving and sustaining change initiatives." },
  { category: "Problem Solving", question: "I analyze problems effectively and identify appropriate solutions." },
  { category: "Problem Solving", question: "I consider diverse perspectives when solving problems." },
  { category: "Problem Solving", question: "I manage disagreements constructively and seek mutually beneficial solutions." },
  { category: "Problem Solving", question: "I remains calm and constructive under pressure." },
  { category: "Problem Solving", question: "I follow through on problem-solving actions to ensure effective outcomes." },
  { category: "Stress Management", question: "I manage stress without negatively affecting performance or team dynamics." },
  { category: "Stress Management", question: "I demonstrate resilience and composure under pressure." },
  { category: "Stress Management", question: "I use healthy coping strategies to handle stress effectively." },
  { category: "Stress Management", question: "I support colleagues in managing stress and maintaining well-being." },
  { category: "Stress Management", question: "I balance workload and prioritize effectively to prevent unnecessary stress." }
];

async function main() {
  console.log('🌱 Starting to seed questions...');

  // Check if questions already exist
  const existingCount = await prisma.assessmentQuestion.count();
  
  if (existingCount > 0) {
    console.log(`ℹ️ ${existingCount} questions already exist in database. Skipping seed.`);
    console.log('   To re-seed, manually delete existing questions first.');
    return;
  }

  // Seed TKI Questions
  console.log('Seeding TKI questions...');
  for (let i = 0; i < tkiQuestions.length; i++) {
    const q = tkiQuestions[i];
    await prisma.assessmentQuestion.create({
      data: {
        assessmentType: 'tki',
        text: `A: ${q.statement_a}\nB: ${q.statement_b}`,
        category: `${q.mode_a} vs ${q.mode_b}`,
        order: i + 1
      }
    });
  }
  console.log(`✅ Seeded ${tkiQuestions.length} TKI questions`);

  // Seed Wellness Questions
  console.log('Seeding Wellness questions...');
  for (let i = 0; i < wellnessQuestions.length; i++) {
    const q = wellnessQuestions[i];
    await prisma.assessmentQuestion.create({
      data: {
        assessmentType: 'wellness',
        text: q.question,
        category: `${q.pillar} - ${q.category}`,
        order: i + 1
      }
    });
  }
  console.log(`✅ Seeded ${wellnessQuestions.length} Wellness questions`);

  // Seed 360 Self Questions
  console.log('Seeding 360° Self questions...');
  for (let i = 0; i < selfQuestions.length; i++) {
    const q = selfQuestions[i];
    await prisma.assessmentQuestion.create({
      data: {
        assessmentType: '360',
        text: q.question,
        category: q.category,
        order: i + 1
      }
    });
  }
  console.log(`✅ Seeded ${selfQuestions.length} 360° Self questions`);

  console.log('✅ All questions seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding questions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

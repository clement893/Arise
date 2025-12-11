'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui';

const sections = [
  {
    title: '1. Information We Collect',
    content: 'We collect information you provide directly to us, including:',
    list: [
      'Account information (name, email, password)',
      'Profile information (job title, organization, demographics)',
      'Assessment responses and results',
      '360-degree feedback from evaluators',
      'Communication preferences',
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: 'We use the information we collect to:',
    list: [
      'Provide, maintain, and improve our services',
      'Generate your assessment results and reports',
      'Personalize your development recommendations',
      'Send you updates and communications',
      'Analyze usage patterns to improve the platform',
    ],
  },
  {
    title: '3. Data Security',
    content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, regular security assessments, and access controls.',
  },
  {
    title: '4. Data Retention',
    content: 'We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time through your account settings or by contacting us.',
  },
  {
    title: '5. Information Sharing',
    content: 'We do not sell your personal information. We may share your information only in the following circumstances: with your consent, with service providers who assist in operating our platform, to comply with legal obligations, or to protect our rights and safety.',
  },
  {
    title: '6. Your Rights',
    content: 'You have the right to:',
    list: [
      'Access your personal information',
      'Correct inaccurate data',
      'Request deletion of your data',
      'Export your data in a portable format',
      'Opt out of marketing communications',
    ],
  },
  {
    title: '7. Cookies and Tracking',
    content: 'We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. You can control cookie preferences through your browser settings.',
  },
  {
    title: '8. Contact Us',
    content: 'If you have questions about this Privacy Policy or our data practices, please contact us at privacy@arise-leadership.com.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Privacy Policy</h1>
          <p className="text-neutral-500 mb-8">Last updated: December 2024</p>

          <Card variant="flat" className="bg-neutral-50">
            <CardContent className="py-6">
              <div className="space-y-8">
                {sections.map((section) => (
                  <section key={section.title}>
                    <h2 className="text-2xl font-semibold text-neutral-900 mb-4">{section.title}</h2>
                    <p className="text-neutral-600 leading-relaxed mb-4">{section.content}</p>
                    {section.list && (
                      <ul className="list-disc pl-6 text-neutral-600 space-y-2">
                        {section.list.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing and using ARISE ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.',
  },
  {
    title: '2. Description of Service',
    content: 'ARISE is a leadership development platform that provides assessment tools, including personality assessments, conflict style assessments, 360-degree feedback, and wellness evaluations. The Service is designed to help individuals and organizations improve their leadership capabilities.',
  },
  {
    title: '3. User Accounts',
    content: 'To access certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.',
  },
  {
    title: '4. Privacy and Data Protection',
    content: 'Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.',
  },
  {
    title: '5. Assessment Results',
    content: 'Assessment results provided by ARISE are for informational and developmental purposes only. They should not be used as the sole basis for employment decisions, clinical diagnoses, or other critical determinations. Results are based on self-reported data and may not reflect complete accuracy.',
  },
  {
    title: '6. Intellectual Property',
    content: 'All content, features, and functionality of the Service, including but not limited to text, graphics, logos, and software, are the exclusive property of ARISE and are protected by international copyright, trademark, and other intellectual property laws.',
  },
  {
    title: '7. Limitation of Liability',
    content: 'ARISE shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service. This limitation applies regardless of the legal theory on which the claim is based.',
  },
  {
    title: '8. Changes to Terms',
    content: 'We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on the Service. Your continued use of the Service after such modifications constitutes your acceptance of the updated terms.',
  },
  {
    title: '9. Contact Information',
    content: 'If you have any questions about these Terms of Service, please contact us at support@arise-leadership.com.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Terms of Service</h1>
          <p className="text-neutral-500 mb-8">Last updated: December 2024</p>

          <Card variant="flat" className="bg-neutral-50">
            <CardContent className="py-6">
              <div className="space-y-8">
                {sections.map((section) => (
                  <section key={section.title}>
                    <h2 className="text-2xl font-semibold text-neutral-900 mb-4">{section.title}</h2>
                    <p className="text-neutral-600 leading-relaxed">{section.content}</p>
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

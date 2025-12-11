'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, Badge } from '@/components/ui';

const values = [
  { icon: '🎯', title: 'Authenticity', description: 'We encourage leaders to embrace their true selves and lead with integrity.' },
  { icon: '📈', title: 'Growth', description: 'We believe in continuous improvement and lifelong learning.' },
  { icon: '🤝', title: 'Collaboration', description: 'We foster connections and support between leaders at all levels.' },
];

const team = [
  { initials: 'CL', name: 'Clement L.', role: 'Founder & CEO', description: 'Passionate about leadership development and organizational transformation.', color: 'bg-primary-500' },
  { initials: 'AR', name: 'ARISE Team', role: 'Development & Support', description: 'A dedicated team committed to building the best leadership platform.', color: 'bg-secondary-500' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="bg-primary-500 py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Empowering Authentic Leaders
            </h1>
            <p className="text-xl text-white/80">
              ARISE is a comprehensive leadership development platform designed to help individuals and organizations unlock their full potential through self-awareness and continuous growth.
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Our Mission</h2>
              <p className="text-neutral-600 leading-relaxed">
                We believe that effective leadership starts with self-understanding. Our mission is to provide accessible, science-based assessment tools that help leaders at all levels discover their strengths, understand their blind spots, and develop actionable plans for growth.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">Our Approach</h2>
              <p className="text-neutral-600 leading-relaxed">
                ARISE integrates four key dimensions of leadership assessment: personality type (MBTI), conflict handling style (TKI), multi-rater feedback (360°), and holistic wellness. This comprehensive approach provides a complete picture of your leadership profile.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-neutral-50 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value) => (
                <Card key={value.title} variant="flat" className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl" aria-hidden="true">{value.icon}</span>
                    </div>
                    <h3 className="font-semibold text-neutral-900 mb-2">{value.title}</h3>
                    <p className="text-neutral-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">Leadership Team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member) => (
              <Card key={member.name} variant="bordered">
                <CardContent className="pt-6 text-center">
                  <div className={`w-20 h-20 ${member.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-3xl text-white font-bold">{member.initials}</span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1">{member.name}</h3>
                  <Badge variant="primary" size="sm" className="mb-3">{member.role}</Badge>
                  <p className="text-neutral-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

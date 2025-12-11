'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                We believe that effective leadership starts with self-understanding. Our mission is to provide accessible, science-based assessment tools that help leaders at all levels discover their strengths, understand their blind spots, and develop actionable plans for growth.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Approach</h2>
              <p className="text-gray-600 leading-relaxed">
                ARISE integrates four key dimensions of leadership assessment: personality type (MBTI), conflict handling style (TKI), multi-rater feedback (360°), and holistic wellness. This comprehensive approach provides a complete picture of your leadership profile.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Authenticity</h3>
                <p className="text-gray-600 text-sm">We encourage leaders to embrace their true selves and lead with integrity.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Growth</h3>
                <p className="text-gray-600 text-sm">We believe in continuous improvement and lifelong learning.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Collaboration</h3>
                <p className="text-gray-600 text-sm">We foster connections and support between leaders at all levels.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Leadership Team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white font-bold">CL</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-center mb-1">Clement L.</h3>
              <p className="text-primary-500 text-center text-sm mb-3">Founder & CEO</p>
              <p className="text-gray-600 text-sm text-center">Passionate about leadership development and organizational transformation.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-20 h-20 bg-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white font-bold">AR</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-center mb-1">ARISE Team</h3>
              <p className="text-primary-500 text-center text-sm mb-3">Development & Support</p>
              <p className="text-gray-600 text-sm text-center">A dedicated team committed to building the best leadership platform.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

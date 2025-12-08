import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#0D5C5C] pt-16 overflow-hidden">
      {/* Vertical lines pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px)',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-block mb-6">
            <span className="text-[#D4A84B] text-sm font-semibold uppercase tracking-wider">
              SaaS-Based Platform
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Empowering<br />
            authentic <span className="text-[#D4A84B]">leaders</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
            A holistic approach to leadership assessment and development
          </p>

          {/* CTA Button */}
          <Link 
            href="/signup"
            className="inline-flex items-center bg-[#2D2D2D] hover:bg-[#1D1D1D] text-white px-6 py-3 rounded-full text-sm font-semibold transition-colors"
          >
            Begin assessment
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Decorative wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="#F5F5F5"
          />
        </svg>
      </div>
    </section>
  );
}

import Link from 'next/link';

export default function ChooseYourPath() {
  const paths = [
    {
      tag: "PERSONAL",
      title: "INDIVIDUAL",
      description: "Self-directed leaders seeking personal growth and development.",
      features: [
        "Complete assessment suite",
        "Personalized leadership profile",
        "Development recommendations",
        "Progress tracking dashboard"
      ],
      cta: "Get started",
      href: "/signup",
      featured: false
    },
    {
      tag: "PROFESSIONAL",
      title: "COACH",
      description: "Coaches and consultants empowering their clients' growth.",
      features: [
        "Multi-client management",
        "White-label reports",
        "Coaching frameworks",
        "Client progress analytics"
      ],
      cta: "Discover",
      href: "/coach",
      featured: false
    },
    {
      tag: "ENTERPRISE",
      title: "BUSINESS",
      description: "Enterprise solutions for teams.",
      features: [
        "Team assessments",
        "Organizational insights",
        "Custom integrations",
        "Dedicated support"
      ],
      cta: "Discover",
      href: "/business",
      featured: false
    }
  ];

  return (
    <section className="bg-[#F5F5F5] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-[#D4A84B] text-sm font-semibold uppercase tracking-wider">
            PRICING
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#2D2D2D]">
            Choose your path
          </h2>
          <p className="mt-4 text-[#2D2D2D]/60 max-w-2xl mx-auto">
            Flexible options to support your leadership development journey
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {paths.map((path, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              {/* Tag */}
              <span className="inline-block px-3 py-1 text-xs font-semibold text-[#D4A84B] bg-[#D4A84B]/10 rounded-full uppercase tracking-wider">
                {path.tag}
              </span>
              
              {/* Title */}
              <h3 className="mt-4 text-2xl font-bold text-[#2D2D2D] tracking-wide">
                {path.title}
              </h3>
              
              {/* Description */}
              <p className="mt-4 text-[#2D2D2D]/60 text-sm leading-relaxed min-h-[48px]">
                {path.description}
              </p>
              
              {/* Features */}
              <ul className="mt-6 space-y-3">
                {path.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-[#2D2D2D]/80">
                    <svg className="w-4 h-4 text-[#0D5C5C] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              {/* CTA */}
              <Link 
                href={path.href}
                className="mt-8 block text-center py-3 px-6 rounded-full text-sm font-semibold transition-colors bg-[#2D2D2D] hover:bg-[#1D1D1D] text-white"
              >
                {path.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

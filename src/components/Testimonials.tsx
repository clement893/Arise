export default function Testimonials() {
  const testimonials = [
    {
      quote: "ARISE transformed how I understand myself as a leader. The integrated approach revealed connections I never would have seen otherwise.",
      author: "Sarah Miller",
      role: "VP Engineering, TechCorp"
    },
    {
      quote: "ARISE transformed how I understand myself as a leader. The integrated approach revealed connections I never would have seen otherwise.",
      author: "Sarah Noel",
      role: "VP Engineering, TechCorp"
    },
    {
      quote: "ARISE transformed how I understand myself as a leader. The integrated approach revealed connections I never would have seen otherwise.",
      author: "Sarah Chen",
      role: "VP Ops"
    }
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <h2 className="text-3xl md:text-4xl font-bold text-[#2D2D2D] mb-12">
          What leaders say
        </h2>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-[#F5F5F5] rounded-2xl p-8"
            >
              {/* Quote */}
              <p className="text-[#2D2D2D]/80 leading-relaxed mb-6 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              
              {/* Author */}
              <div>
                <p className="font-semibold text-[#2D2D2D]">{testimonial.author}</p>
                <p className="text-sm text-[#2D2D2D]/60">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

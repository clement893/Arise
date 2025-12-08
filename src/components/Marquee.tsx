'use client';

export default function Marquee() {
  const text = "Build self-awareness and holistic well-being through comprehensive personality typing, conflict management, 360° feedback, and wellness assessments.";
  
  return (
    <section className="bg-[#F5F5F5] py-4 overflow-hidden border-y border-gray-200">
      <div className="relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-[#0D5C5C] text-sm md:text-base font-medium mx-8">
              ★ {text}
            </span>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}

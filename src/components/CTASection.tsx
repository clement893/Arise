import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#D4A84B] rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-4">
            Ready to elevate your leadership?
          </h2>
          <p className="text-[#2D2D2D]/80 mb-8 max-w-2xl mx-auto">
            Join thousands of leaders transforming their approach to personal growth and organizational change.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="inline-flex items-center justify-center bg-[#2D2D2D] hover:bg-[#1D1D1D] text-white px-6 py-3 rounded-full text-sm font-semibold transition-colors"
            >
              Schedule a demo
            </Link>
            <Link 
              href="/pricing"
              className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-[#2D2D2D] px-6 py-3 rounded-full text-sm font-semibold transition-colors"
            >
              Explore our tools
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

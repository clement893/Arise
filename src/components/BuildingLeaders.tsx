export default function BuildingLeaders() {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left content */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#333333] leading-tight mb-4 sm:mb-6">
              Building<br />leaders
            </h2>
            <p className="text-[#333333] text-base sm:text-lg leading-relaxed">
              Our platform transcends traditional assessments, offering a holistic approach to leadership development by merging 
              modern psychometric frameworks with contemporary wellness practices.
            </p>
          </div>

          {/* Right - Image grid with real photos */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Row 1 */}
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop" 
                alt="Professional woman" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop" 
                alt="Business professional" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300&h=300&fit=crop" 
                alt="Woman leader" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Row 2 */}
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" 
                alt="Professional man" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop" 
                alt="Business woman" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop" 
                alt="Executive" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

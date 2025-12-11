import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';

export default function CTASection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card variant="gradient" className="p-8 md:p-12 text-center">
          <CardContent className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800">
              Ready to elevate your leadership?
            </h2>
            <p className="text-neutral-700/80 max-w-2xl mx-auto">
              Join thousands of leaders transforming their approach to personal growth and organizational change.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button variant="dark" size="lg" asChild>
                <Link href="/signup">
                  Schedule a demo
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-white hover:bg-neutral-100" asChild>
                <Link href="/pricing">
                  Explore our tools
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

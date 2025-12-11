'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignupLayout from '@/components/SignupLayout';
import { Button, Card } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

type UserType = 'individual' | 'coach' | 'business';

export default function SignupStep1() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  const userTypes = [
    {
      id: 'individual' as UserType,
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ),
      title: 'Individual',
      description: 'I want to develop my own leadership skills'
    },
    {
      id: 'coach' as UserType,
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      ),
      title: 'Coach',
      description: 'I help others develop their leadership'
    },
    {
      id: 'business' as UserType,
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
        </svg>
      ),
      title: 'Business',
      description: 'I want to develop leaders in my organization'
    }
  ];

  const handleContinue = () => {
    if (selectedType) {
      localStorage.setItem('signupUserType', selectedType);
      router.push('/signup/plans');
    }
  };

  return (
    <SignupLayout currentStep={1}>
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Who are you?
        </h1>
        <p className="text-white/70">
          Select the option that best describes your situation
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {userTypes.map((type) => (
          <Card
            key={type.id}
            variant={selectedType === type.id ? 'elevated' : 'default'}
            className={`p-6 text-center cursor-pointer transition-all ${
              selectedType === type.id
                ? 'bg-white text-primary-500 ring-4 ring-secondary-500'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            onClick={() => setSelectedType(type.id)}
          >
            <div className={`mx-auto mb-4 ${selectedType === type.id ? 'text-primary-500' : 'text-white'}`}>
              {type.icon}
            </div>
            <h3 className="font-semibold text-lg mb-2">{type.title}</h3>
            <p className={`text-sm ${selectedType === type.id ? 'text-primary-500/70' : 'text-white/60'}`}>
              {type.description}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          variant="secondary"
          size="lg"
          onClick={handleContinue}
          disabled={!selectedType}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </SignupLayout>
  );
}

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type UserType = 'individual' | 'coach' | 'business' | null;
export type PlanType = 'starter' | 'professional' | 'enterprise' | null;
export type BillingCycle = 'monthly' | 'annual';

interface SignupData {
  userType: UserType;
  plan: PlanType;
  billingCycle: BillingCycle;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  phone: string;
}

interface SignupContextType {
  data: SignupData;
  updateData: (updates: Partial<SignupData>) => void;
  resetData: () => void;
}

const defaultData: SignupData = {
  userType: null,
  plan: null,
  billingCycle: 'monthly',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  company: '',
  jobTitle: '',
  phone: '',
};

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export function SignupProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SignupData>(defaultData);

  const updateData = (updates: Partial<SignupData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const resetData = () => {
    setData(defaultData);
  };

  return (
    <SignupContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error('useSignup must be used within a SignupProvider');
  }
  return context;
}

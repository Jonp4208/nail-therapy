'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

type SupabaseContextType = ReturnType<typeof useSupabase>;

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const supabase = useSupabase();

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabaseContext = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabaseContext must be used within a SupabaseProvider');
  }
  return context;
};

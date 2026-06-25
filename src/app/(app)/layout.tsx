import type { ReactNode } from 'react';

import { RootLayoutClient } from '@/components/common/layout-client';
import { Navbar } from '@/components/common/navbar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RootLayoutClient>
      <Navbar />
      {children}
    </RootLayoutClient>
  );
}

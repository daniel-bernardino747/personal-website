'use client';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PageTransitionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <LayoutGroup id="page-root">
      <AnimatePresence mode="popLayout" initial={false}>
        <div key={pathname} style={{ width: '100%' }}>
          {children}
        </div>
      </AnimatePresence>
    </LayoutGroup>
  );
}

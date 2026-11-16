import { RequireAuth } from '@/components/require-auth';
import { SiteHeader } from '@/components/site-header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      </div>
    </RequireAuth>
  );
}

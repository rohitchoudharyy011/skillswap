import { SiteHeader } from '@/components/site-header';
import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="flex justify-center px-4 py-12 sm:py-20">
        <AuthForm mode="login" />
      </main>
    </div>
  );
}

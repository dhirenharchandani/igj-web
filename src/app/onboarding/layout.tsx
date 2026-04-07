import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex justify-center">
      <div className="w-full max-w-md px-6 py-10 pb-16">
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "QuickLearn | Login",
  description: "Login to QuickLearn MCA LBS crash course platform.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative dark:bg-slate-950">
      <Link 
        href="/" 
        className="absolute top-4 left-4 md:top-8 md:left-8 z-20 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-white/50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800/50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Home
      </Link>

      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950"></div>
      
      <div className="w-full max-w-lg relative z-10 animate-fade-in-up">
        {/* Logo / Home Link */}
        <div className="flex justify-center mb-8">
           <Link href="/" className="inline-flex items-center gap-2 group">
              <span className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-indigo-200 shadow-lg group-hover:scale-110 transition-transform dark:shadow-indigo-900/20">
                  QL
              </span>
              <span className="text-2xl font-bold text-slate-900 tracking-tight dark:text-slate-100">QuickLearn</span>
           </Link>
        </div>
        
        <Suspense fallback={<div className="h-96 w-full rounded-3xl bg-slate-100/50 animate-pulse glass" />}>
          <LoginForm />
        </Suspense>

        <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have an account yet?{" "}
                <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all dark:text-indigo-400 dark:hover:text-indigo-300">
                    Sign up now
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}

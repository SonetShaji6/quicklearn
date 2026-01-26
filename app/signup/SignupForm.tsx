"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signupAction } from "./actions";
import { Spinner } from "@/app/components/Spinner";

const initialState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="mt-6 flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:transform-none"
      disabled={pending}
    >
      {pending ? (
        <>
          <Spinner className="mr-2 h-4 w-4 text-white" />
          Creating Account...
        </>
      ) : (
        "Create Account"
      )}
    </button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(async (_prevState: typeof initialState, formData: FormData) => {
    return signupAction(formData);
  }, initialState);

  return (
    <form
      className="glass rounded-3xl p-8 shadow-2xl ring-1 ring-white/50 backdrop-blur-xl animate-fade-in dark:bg-slate-900/50 dark:ring-slate-700/50 dark:shadow-slate-900/20"
      action={formAction}
    >
      <div className="mb-8">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-white">Create Account</h3>
        <p className="text-sm text-slate-500 mt-2 font-medium dark:text-slate-400">Start your learning journey today.</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 dark:text-slate-300" htmlFor="signup-name">
            Full Name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            required
            className="w-full rounded-2xl border-0 bg-slate-100/50 px-5 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 dark:text-slate-300" htmlFor="signup-email">
            Email Address
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border-0 bg-slate-100/50 px-5 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 dark:text-slate-300" htmlFor="signup-phone">
            Phone number
          </label>
          <input
            id="signup-phone"
            name="phone"
            type="tel"
            required
            pattern="[0-9+\-() ]{7,20}"
            className="w-full rounded-2xl border-0 bg-slate-100/50 px-5 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 dark:text-slate-300" htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-2xl border-0 bg-slate-100/50 px-5 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
            placeholder="Create a strong password"
          />
          <p className="text-xs text-slate-400 ml-1 dark:text-slate-400">At least 8 characters.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 dark:text-slate-300" htmlFor="signup-college">
                College
            </label>
            <input
                id="signup-college"
                name="college"
                type="text"
                required
                className="w-full rounded-2xl border-0 bg-slate-100/50 px-5 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
                placeholder="College Name"
            />
            </div>

            <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 dark:text-slate-300" htmlFor="signup-degree">
                Degree
            </label>
            <input
                id="signup-degree"
                name="degree"
                type="text"
                required
                defaultValue="MCA"
                className="w-full rounded-2xl border-0 bg-slate-100/50 px-5 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
            />
            </div>
        </div>

        <div className="space-y-2">
           <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 dark:text-slate-300" htmlFor="payment-proof">
             Payment Proof <span className="font-normal text-slate-400 normal-case dark:text-slate-400">(Screenshot)</span>
           </label>
           <div className="relative group">
             <input
               id="payment-proof"
               name="payment-proof"
               type="file"
               accept="image/png,image/jpeg,application/pdf"
               required
               className="file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 w-full rounded-2xl border-0 bg-slate-100/50 border-slate-200 px-4 py-3 text-sm text-slate-600 transition hover:bg-white focus:outline-none shadow-inner dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
             />
           </div>
        </div>
      </div>

      {state.message && (
        <div
          className={`mt-6 flex items-center gap-3 rounded-xl border p-4 text-sm font-medium ${
            state.success
              ? "border-emerald-100 bg-emerald-50/50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300"
              : "border-rose-100 bg-rose-50/50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300"
          }`}
        >
             {state.success ? (
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

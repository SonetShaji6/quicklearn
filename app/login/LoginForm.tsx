"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { Spinner } from "@/app/components/Spinner";

type LoginState = { success: boolean; message: string; role?: string };
const initialState: LoginState = { success: false, message: "", role: "" };

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
          Signing in...
        </>
      ) : (
        "Login"
      )}
    </button>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") ?? "";
  const [state, formAction] = useActionState<LoginState, FormData>(async (_prevState, formData) => loginAction(formData) as Promise<LoginState>, initialState);

  return (
    <form
      className="glass rounded-3xl p-8 shadow-2xl ring-1 ring-white/50 backdrop-blur-xl animate-fade-in dark:bg-slate-900/50 dark:ring-slate-700/50 dark:shadow-slate-900/20"
      action={formAction}
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-white">Welcome back</h3>
        <p className="text-sm text-slate-500 mt-2 font-medium dark:text-slate-400">Enter your details to access your dashboard.</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 dark:text-slate-300" htmlFor="login-email">
            Email Address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border-0 bg-slate-100/50 px-5 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
            placeholder="name@example.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300" htmlFor="login-password">
              Password
            </label>
            <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300">Forgot password?</a>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            className="w-full rounded-2xl border-0 bg-slate-100/50 px-5 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
            placeholder="••••••••"
          />
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

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
      className="btn-primary w-full !py-3.5 text-sm mt-6"
      disabled={pending}
    >
      {pending ? (
        <>
          <Spinner className="h-4 w-4 text-white" />
          Signing in...
        </>
      ) : (
        <>
          Sign in
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </>
      )}
    </button>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") ?? "";
  const wasKicked = searchParams.get("kicked") === "1";
  const [state, formAction] = useActionState<LoginState, FormData>(async (_prevState, formData) => loginAction(formData) as Promise<LoginState>, initialState);

  return (
    <form
      className="space-y-6"
      action={formAction}
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Welcome back</h3>
        <p className="text-sm text-[var(--text-muted)]">Enter your credentials to access your dashboard.</p>
      </div>

      {wasKicked && !state.message && (
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 p-3.5 text-sm font-medium text-amber-800">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          You were signed out because your account was logged in from another device. Only one session is allowed at a time.
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            className="ql-input"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="login-password">
              Password
            </label>
            <a href="#" className="text-xs font-semibold text-[var(--ql-red)] hover:underline underline-offset-4">Forgot?</a>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            className="ql-input"
            placeholder="••••••••"
          />
        </div>
      </div>

      {state.message && (
        <div
          className={`flex items-center gap-3 rounded-[var(--radius-md)] border p-3.5 text-sm font-medium ${
            state.success
              ? "border-[color:var(--success)]/20 bg-[var(--success-light)] text-[var(--success)]"
              : "border-[color:var(--danger)]/20 bg-[var(--danger-light)] text-[var(--danger)]"
          }`}
        >
          {state.success ? (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";

type LoginState = { success: boolean; message: string; role?: string };
const initialState: LoginState = { success: false, message: "", role: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="mt-6 w-full rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Checking..." : "Login"}
    </button>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") ?? "";
  const [state, formAction] = useActionState<LoginState, FormData>(async (_prevState, formData) => loginAction(formData) as Promise<LoginState>, initialState);

  return (
    <form
      className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-indigo-50"
      action={formAction}
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Login</h3>
          <p className="text-sm text-slate-500">Access your MCA LBS dashboard.</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Secure</span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="you@example.com"
          />
          <p className="text-xs text-rose-500">Required for login.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="••••••••"
          />
          <p className="text-xs text-rose-500">Enter your password to continue.</p>
        </div>
      </div>

      {state.message && (
        <div
          className={`mt-4 rounded-xl border p-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}
        >
          {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

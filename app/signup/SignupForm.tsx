"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signupAction } from "./actions";

const initialState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="mt-6 w-full rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Submitting..." : "Create account"}
    </button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(async (_prevState: typeof initialState, formData: FormData) => {
    return signupAction(formData);
  }, initialState);

  return (
    <form
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-indigo-50"
      action={formAction}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" aria-hidden />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Sign Up</h2>
          <p className="text-sm text-slate-500">Create your crash course account to start learning.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Secure</span>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="signup-name">
            Name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Your full name"
          />
          <p className="text-xs text-rose-500">Required to personalize your dashboard.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="you@example.com"
          />
          <p className="text-xs text-rose-500">We’ll verify this to secure your account.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="signup-phone">
            Phone number
          </label>
          <input
            id="signup-phone"
            name="phone"
            type="tel"
            required
            pattern="[0-9+\-() ]{7,20}"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="e.g. +91 98765 43210"
          />
          <p className="text-xs text-rose-500">Include a reachable number for verification updates.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Create a strong password"
          />
          <p className="text-xs text-rose-500">Use 8+ characters with a mix of symbols.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="signup-college">
            College Name
          </label>
          <input
            id="signup-college"
            name="college"
            type="text"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Your college"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="signup-degree">
            Degree
          </label>
          <input
            id="signup-degree"
            name="degree"
            type="text"
            required
            defaultValue="MCA"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <p className="text-xs text-slate-500">We currently support MCA LBS crash course students.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="payment-proof">
            Payment screenshot (PNG/JPG/PDF, max 5MB)
          </label>
          <input
            id="payment-proof"
            name="payment-proof"
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            required
            className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm"
          />
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

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
      className="btn-primary w-full !py-3.5 text-sm mt-6"
      disabled={pending}
    >
      {pending ? (
        <>
          <Spinner className="h-4 w-4 text-white" />
          Creating Account...
        </>
      ) : (
        <>
          Create Account
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </>
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
      className="ql-card-static p-6 sm:p-8 space-y-6"
      action={formAction}
    >
      <div>
        <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Create Account</h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">Start your learning journey today.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="signup-name">
            Full Name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            required
            className="ql-input"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="signup-email">
            Email Address
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            className="ql-input"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="signup-phone">
            Phone Number
          </label>
          <input
            id="signup-phone"
            name="phone"
            type="tel"
            required
            pattern="[0-9+\-() ]{7,20}"
            className="ql-input"
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            minLength={8}
            className="ql-input"
            placeholder="Create a strong password"
          />
          <p className="text-[11px] text-[var(--text-muted)] ml-0.5">At least 8 characters.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="signup-college">
              College
            </label>
            <input
              id="signup-college"
              name="college"
              type="text"
              required
              className="ql-input"
              placeholder="College Name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="signup-degree">
              Degree
            </label>
            <input
              id="signup-degree"
              name="degree"
              type="text"
              required
              defaultValue="MCA"
              className="ql-input"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="payment-proof">
            Payment Proof <span className="font-normal text-[var(--text-muted)] normal-case">(Screenshot)</span>
          </label>
          <div className="relative">
            <input
              id="payment-proof"
              name="payment-proof"
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              required
              className="file:mr-3 file:py-2 file:px-4 file:rounded-[var(--radius-md)] file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-[var(--ql-red)] file:text-white file:cursor-pointer hover:file:bg-[var(--ql-red-hover)] w-full rounded-[var(--radius-md)] bg-[var(--surface-secondary)] border-[1.5px] border-transparent px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border)] focus:border-[var(--ql-red)] focus:outline-none"
            />
          </div>
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

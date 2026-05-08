"use client";

import { useRef, useState, useTransition } from "react";
import { importQuestionsFromJson } from "./actions";

export function JsonImportForm({ testId, testTitle }: { testId: string; testTitle: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    setMessage(null);
    startTransition(async () => {
      const result = await importQuestionsFromJson(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result?.success) {
        setMessage({ type: "success", text: result.success });
        formRef.current?.reset();
      }
    });
  };

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700">Import questions via JSON — <span className="text-indigo-600">{testTitle}</span></p>
      </div>
      <form ref={formRef} action={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
        <input type="hidden" name="testId" value={testId} />
        <div className="flex-1 w-full space-y-1">
          <label className="text-[11px] font-semibold text-slate-500">Select .json file</label>
          <input
            name="jsonFile"
            type="file"
            accept=".json,application/json"
            required
            className="w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          {isPending ? "Importing…" : "Import JSON"}
        </button>
      </form>

      {message && (
        <p className={`text-xs font-semibold px-3 py-2 rounded-lg ${
          message.type === "success"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-rose-50 text-rose-700"
        }`}>
          {message.text}
        </p>
      )}

      <details className="text-[11px] text-slate-500">
        <summary className="cursor-pointer font-semibold hover:text-indigo-600 transition-colors">Expected JSON format</summary>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-100 p-3 text-[11px] leading-relaxed">{`[
  {
    "text": "What is the capital of India?",
    "option_a": "Mumbai",
    "option_b": "Delhi",
    "option_c": "Chennai",
    "option_d": "Kolkata",
    "correct_index": 1
  }
]

correct_index: 0=A, 1=B, 2=C, 3=D`}</pre>
      </details>
    </div>
  );
}

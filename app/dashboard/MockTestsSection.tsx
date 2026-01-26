"use client";

import { useEffect, useMemo, useState } from "react";
import { submitMockAttempt } from "./mockActions";

type Question = {
  id: string;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_index: number;
};

export type MockTest = {
  id: string;
  title: string;
  category_name: string;
  duration_minutes: number;
  start_at: string;
  questions: Question[];
};

export type MockAttempt = {
  test_id: string;
  answers: number[];
  score: number;
  total: number;
};

type Props = {
  tests: MockTest[];
  attempts: MockAttempt[];
};

export default function MockTestsSection({ tests, attempts }: Props) {
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "taking" | "submitted">("idle");
  const [attemptMap, setAttemptMap] = useState<Map<string, MockAttempt>>(new Map(attempts.map((a) => [a.test_id, a])));
  const [reviewTest, setReviewTest] = useState<MockTest | null>(null);
  const [reviewAnswers, setReviewAnswers] = useState<number[]>([]);

  useEffect(() => {
    setAttemptMap(new Map(attempts.map((a) => [a.test_id, a])));
  }, [attempts]);

  useEffect(() => {
    if (!activeTest || status !== "taking" || !endTime) return;
    const id = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        clearInterval(id);
        submit(activeTest, true);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTest, status, endTime]);

  const availableTests = useMemo(() => {
    const now = Date.now();
    return tests.filter((t) => new Date(t.start_at).getTime() <= now && t.questions.length > 0);
  }, [tests]);

  const startTest = (test: MockTest) => {
    if (attemptMap.has(test.id)) return;
    setActiveTest(test);
    setAnswers(Array(test.questions.length).fill(-1));
    setStatus("taking");
    const durationMs = test.duration_minutes * 60 * 1000;
    setTimeLeft(durationMs);
    setEndTime(Date.now() + durationMs);
  };

  const submit = async (test: MockTest, auto = false) => {
    if (!test) return;
    const correct = test.questions.reduce((acc, q, idx) => (answers[idx] === q.correct_index ? acc + 1 : acc), 0);
    const attempt: MockAttempt = {
      test_id: test.id,
      answers,
      score: correct,
      total: test.questions.length,
    };
    setAttemptMap((prev) => new Map(prev).set(test.id, attempt));
    setStatus("submitted");
    setActiveTest(null);
    await submitMockAttempt(test.id, answers);
    if (auto) {
      alert("Time is up. Your answers were submitted automatically.");
    }
  };

  const openReview = (test: MockTest) => {
    const att = attemptMap.get(test.id);
    if (!att) return;
    setReviewTest(test);
    setReviewAnswers(att.answers ?? []);
  };

  const formatTime = (ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60).toString().padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-4" id="mocktests">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Mock Tests</p>
          <p className="text-sm text-slate-600">Timed MCQs. One attempt per test.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {availableTests.length === 0 && <p className="text-sm text-slate-600">No mock tests available yet.</p>}
        {availableTests.map((t) => {
          const att = attemptMap.get(t.id);
          return (
            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900">{t.title}</p>
                <p className="text-xs text-slate-600">{t.category_name}</p>
                <p className="text-[11px] text-slate-500">Duration: {t.duration_minutes} mins</p>
                <p className="text-[11px] text-slate-500">Questions: {t.questions.length}</p>
              </div>
              <div className="mt-3 flex gap-2">
                {att ? (
                  <div className="flex flex-1 items-center justify-between gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white/70 px-2 py-1 text-[11px] font-semibold text-emerald-800">Completed</span>
                      <span>Score {att.score}/{att.total}</span>
                    </div>
                    <button
                      onClick={() => openReview(t)}
                      className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
                    >
                      View answers
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startTest(t)}
                    className="flex-1 rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    Start test
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeTest && status === "taking" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{activeTest.title}</p>
                <p className="text-xs text-slate-500">Time left: {formatTime(timeLeft)}</p>
              </div>
              <button
                onClick={() => submit(activeTest)}
                className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Submit now
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto divide-y divide-slate-100">
              {activeTest.questions.map((q, idx) => (
                <div key={q.id} className="p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Q{idx + 1}. {q.text}
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:border-indigo-200 ${
                          answers[idx] === optIdx ? "border-indigo-200 bg-indigo-50" : "border-slate-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[idx] === optIdx}
                          onChange={() =>
                            setAnswers((prev) => {
                              const next = [...prev];
                              next[idx] = optIdx;
                              return next;
                            })
                          }
                        />
                        <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reviewTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{reviewTest.title}</p>
                <p className="text-xs text-slate-500">
                  Score {attemptMap.get(reviewTest.id)?.score ?? 0}/{attemptMap.get(reviewTest.id)?.total ?? reviewTest.questions.length}
                </p>
              </div>
              <button
                onClick={() => setReviewTest(null)}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto divide-y divide-slate-100">
              {reviewTest.questions.map((q, idx) => {
                const userAnswer = reviewAnswers[idx];
                const correct = q.correct_index;
                const isCorrect = userAnswer === correct;
                return (
                  <div key={q.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Q{idx + 1}. {q.text}
                        </p>
                        <p className="text-[11px] text-slate-500">Your answer: {userAnswer >= 0 ? String.fromCharCode(65 + userAnswer) : "Not answered"}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, optIdx) => {
                        const isUser = userAnswer === optIdx;
                        const isRight = correct === optIdx;
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
                              isRight
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : isUser
                                  ? "border-rose-200 bg-rose-50 text-rose-800"
                                  : "border-slate-200 bg-white"
                            }`}
                          >
                            <span className="font-semibold text-slate-700">{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                            {isRight && <span className="ml-auto text-[11px] font-semibold text-emerald-700">Correct</span>}
                            {!isRight && isUser && <span className="ml-auto text-[11px] font-semibold text-rose-700">Your pick</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

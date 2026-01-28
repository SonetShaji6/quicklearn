"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Keep track of latest answers for timer-based submission
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Restore active test state from local storage on mount
  useEffect(() => {
    const savedTestId = localStorage.getItem("ql_active_test_id");
    if (savedTestId) {
      const savedEndTime = localStorage.getItem(`ql_test_endtime_${savedTestId}`);
      const savedAnswers = localStorage.getItem(`ql_test_answers_${savedTestId}`);
      const test = tests.find((t) => t.id === savedTestId);

      if (test && savedEndTime) {
        const end = parseInt(savedEndTime, 10);
        const now = Date.now();
        
        if (now < end) {
          // Resume test
          setActiveTest(test);
          setEndTime(end);
          setTimeLeft(end - now);
          if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers));
          } else {
            setAnswers(Array(test.questions.length).fill(-1));
          }
          setStatus("taking");
        } else {
           // Test expired while away - could auto-submit here if desired, 
           // but strictly speaking the attempt wasn't completed in a valid session.
           // Clean up storage so they don't get stuck.
           localStorage.removeItem("ql_active_test_id");
           localStorage.removeItem(`ql_test_endtime_${savedTestId}`);
           localStorage.removeItem(`ql_test_answers_${savedTestId}`);
        }
      }
    }
  }, [tests]);

  // Persist answers to local storage
  useEffect(() => {
    if (status === "taking" && activeTest) {
      localStorage.setItem(`ql_test_answers_${activeTest.id}`, JSON.stringify(answers));
    }
  }, [answers, status, activeTest]);

  useEffect(() => {
    setAttemptMap(new Map(attempts.map((a) => [a.test_id, a])));
  }, [attempts]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === "taking") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    if (status === "taking") {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

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
    const initialAnswers = Array(test.questions.length).fill(-1);
    setAnswers(initialAnswers);
    setStatus("taking");
    const durationMs = test.duration_minutes * 60 * 1000;
    const end = Date.now() + durationMs;
    setTimeLeft(durationMs);
    setEndTime(end);

    // Persist start state
    localStorage.setItem("ql_active_test_id", test.id);
    localStorage.setItem(`ql_test_endtime_${test.id}`, end.toString());
    localStorage.setItem(`ql_test_answers_${test.id}`, JSON.stringify(initialAnswers));
  };

  const submit = async (test: MockTest, auto = false) => {
    if (!test) return;
    
    // Clear persistence immediately to prevent reloading into a finished test
    localStorage.removeItem("ql_active_test_id");
    localStorage.removeItem(`ql_test_endtime_${test.id}`);
    localStorage.removeItem(`ql_test_answers_${test.id}`);

    setSubmittingId(test.id);
    
    // Use ref to get latest answers even in stale closure (timer)
    const currentAnswers = answersRef.current;
    
    const correct = test.questions.reduce((acc, q, idx) => (currentAnswers[idx] === q.correct_index ? acc + 1 : acc), 0);
    const attempt: MockAttempt = {
      test_id: test.id,
      answers: currentAnswers,
      score: correct,
      total: test.questions.length,
    };
    setAttemptMap((prev) => new Map(prev).set(test.id, attempt));
    setStatus("submitted");
    setActiveTest(null);
    await submitMockAttempt(test.id, currentAnswers);
    setSubmittingId(null);
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
    <div className="space-y-6" id="mocktests">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Mock Assessments</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Practice with timed MCQs to test your knowledge.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {availableTests.length === 0 && (
            <div className="col-span-full py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <span className="text-4xl block mb-2">📝</span>
                <p className="text-slate-500 font-medium dark:text-slate-400">No mock tests available yet.</p>
            </div>
        )}
        {availableTests.map((t) => {
          const att = attemptMap.get(t.id);
          return (
            <div
              key={t.id}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/30 dark:hover:shadow-indigo-900/10"
            >
              <div className="mb-4 flex-1 space-y-2">
                <div className="flex items-start justify-between">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-400/20">
                        {t.category_name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono dark:text-slate-500">
                        {t.duration_minutes}m
                    </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors dark:text-slate-100 dark:group-hover:text-indigo-400">
                    {t.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 dark:text-slate-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t.questions.length} Questions
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                {att ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Completed</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Score: {att.score}/{att.total}</span>
                    </div>
                    <button
                      onClick={() => openReview(t)}
                      className="rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-white hover:text-indigo-600 hover:shadow-sm ring-1 ring-slate-200 transition-all dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:ring-slate-700"
                    >
                      Review
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startTest(t)}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 dark:shadow-indigo-900/40"
                  >
                    Start Test
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeTest && status === "taking" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 bg-white/50 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{activeTest.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                        {formatTime(timeLeft)} remaining
                    </p>
                </div>
              </div>
              <button
                onClick={() => submit(activeTest)}
                disabled={!!submittingId}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed dark:shadow-indigo-900/40"
              >
                {submittingId ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting...
                  </>
                ) : (
                  "Submit Test"
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950">
                <div className="max-w-3xl mx-auto space-y-8">
                {activeTest.questions.map((q, idx) => (
                    <div key={q.id} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                            {idx + 1}
                        </span>
                        <div className="flex-1 space-y-4">
                            <p className="text-base font-medium text-slate-900 leading-relaxed dark:text-slate-100">
                                {q.text}
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, optIdx) => (
                                <label
                                    key={optIdx}
                                    className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-200 hover:bg-slate-50 ${
                                    answers[idx] === optIdx 
                                        ? "border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600 shadow-sm dark:border-indigo-500 dark:bg-indigo-900/20" 
                                        : "border-slate-200 hover:border-indigo-200 dark:border-slate-700 dark:hover:border-indigo-500/50 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    className="mt-1"
                                    checked={answers[idx] === optIdx}
                                    onChange={() =>
                                        setAnswers((prev) => {
                                        const next = [...prev];
                                        next[idx] = optIdx;
                                        return next;
                                        })
                                    }
                                    />
                                    <span className="text-sm text-slate-700 font-medium dark:text-slate-300">{opt}</span>
                                </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
          </div>
        </div>
      )}

      {reviewTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 bg-white/50 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Review: {reviewTest.title}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Score: <span className="text-indigo-600 font-bold dark:text-indigo-400">{attemptMap.get(reviewTest.id)?.score ?? 0}</span>
                  <span className="text-slate-300 mx-1 dark:text-slate-600">/</span>
                  {attemptMap.get(reviewTest.id)?.total ?? reviewTest.questions.length}
                </p>
              </div>
              <button
                onClick={() => setReviewTest(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Close Review
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950">
              <div className="max-w-3xl mx-auto space-y-6">
              {reviewTest.questions.map((q, idx) => {
                const userAnswer = reviewAnswers[idx];
                const correct = q.correct_index;
                const isCorrect = userAnswer === correct;
                return (
                  <div key={q.id} className={`rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900 ${isCorrect ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-rose-100 dark:border-rose-900/30'}`}>
                    <div className="flex gap-4">
                      <div className="shrink-0">
                         {isCorrect ? (
                             <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">✓</span>
                         ) : (
                             <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">✕</span>
                         )}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between">
                            <p className="text-base font-medium text-slate-900 dark:text-slate-100">{q.text}</p>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full h-fit ${isCorrect ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"}`}>
                                {isCorrect ? "Correct" : "Incorrect"}
                            </span>
                        </div>
                        
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, optIdx) => {
                            const isUser = userAnswer === optIdx;
                            const isRight = correct === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`flex items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                                  isRight
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                                    : isUser
                                      ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300"
                                      : "border-slate-100 bg-white text-slate-600 opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                }`}
                              >
                                <span className={`font-bold ${isRight ? 'text-emerald-700 dark:text-emerald-400' : (isUser ? 'text-rose-700 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500')}`}>
                                    {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span>{opt}</span>
                                {isRight && <span className="ml-auto text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Correct Answer</span>}
                                {!isRight && isUser && <span className="ml-auto text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Your Answer</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

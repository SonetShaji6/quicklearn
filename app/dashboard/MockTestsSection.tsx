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
           // Test expired while away - clean up storage
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
    
    // Clear persistence immediately
    localStorage.removeItem("ql_active_test_id");
    localStorage.removeItem(`ql_test_endtime_${test.id}`);
    localStorage.removeItem(`ql_test_answers_${test.id}`);

    setSubmittingId(test.id);
    
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

  const timeWarning = timeLeft < 60000; // Less than 1 minute

  return (
    <div className="space-y-5" id="mocktests">
      <div>
        <p className="section-label mb-1">Mock Assessments</p>
        <p className="text-sm text-[var(--text-muted)]">Practice with timed MCQs to test your knowledge.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {availableTests.length === 0 && (
          <div className="col-span-full py-12 text-center rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--border)] bg-[var(--surface-secondary)]">
            <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--accent-light)] text-[var(--ql-red)] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-[var(--text-muted)] font-medium text-sm">No mock tests available yet.</p>
          </div>
        )}
        {availableTests.map((t) => {
          const att = attemptMap.get(t.id);
          return (
            <div
              key={t.id}
              className="group ql-card p-5 flex flex-col"
            >
              <div className="mb-4 flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <span className="badge badge-neutral">{t.category_name}</span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{t.duration_minutes}m</span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--ql-red)] transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {t.questions.length} Questions
                </p>
              </div>

              <div className="mt-auto pt-3 border-t border-[var(--border-subtle)]">
                {att ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="badge badge-success mb-1">Completed</span>
                      <span className="text-sm font-black text-[var(--text-primary)]">Score: {att.score}/{att.total}</span>
                    </div>
                    <button
                      onClick={() => openReview(t)}
                      className="btn-secondary !text-xs !py-2 !px-3"
                    >
                      Review
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startTest(t)}
                    className="btn-primary w-full !text-sm"
                  >
                    Start Test
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Test Taking Modal ─────────────────────────────────── */}
      {activeTest && status === "taking" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--foreground)]/80 backdrop-blur-sm p-4 animate-overlay-in">
          <div className="relative w-full max-w-4xl h-[90vh] flex flex-col ql-card-static overflow-hidden animate-modal-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">{activeTest.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-[var(--radius)] ${
                    timeWarning
                      ? "bg-[var(--danger-light)] text-[var(--danger)] animate-pulse"
                      : "bg-[var(--surface-secondary)] text-[var(--text-secondary)]"
                  }`}>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${timeWarning ? "bg-[var(--danger)]" : "bg-[var(--ql-red)]"}`}></span>
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${timeWarning ? "bg-[var(--danger)]" : "bg-[var(--ql-red)]"}`}></span>
                    </span>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => submit(activeTest)}
                disabled={!!submittingId}
                className="btn-primary !text-sm"
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

            {/* Questions */}
            <div className="flex-1 overflow-y-auto p-6 bg-[var(--surface-secondary)]">
              <div className="max-w-3xl mx-auto space-y-6">
                {activeTest.questions.map((q, idx) => (
                  <div key={q.id} className="ql-card-static p-5">
                    <div className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[var(--accent-light)] text-xs font-bold text-[var(--ql-red)]">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-4">
                        <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                          {q.text}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, optIdx) => (
                            <label
                              key={optIdx}
                              className={`relative flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border p-3.5 transition-all duration-200 ${
                                answers[idx] === optIdx
                                  ? "border-[var(--ql-red)] bg-[var(--accent-light)] shadow-[var(--shadow-xs)]"
                                  : "border-[var(--border)] hover:border-[var(--ql-red)]/50 hover:bg-[var(--surface)]"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                className="mt-0.5 accent-[var(--ql-red)]"
                                checked={answers[idx] === optIdx}
                                onChange={() =>
                                  setAnswers((prev) => {
                                    const next = [...prev];
                                    next[idx] = optIdx;
                                    return next;
                                  })
                                }
                              />
                              <span className="text-sm text-[var(--text-secondary)] font-medium">{opt}</span>
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

      {/* ── Review Modal ──────────────────────────────────────── */}
      {reviewTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--foreground)]/80 backdrop-blur-sm p-4 animate-overlay-in">
          <div className="relative w-full max-w-4xl h-[90vh] flex flex-col ql-card-static overflow-hidden animate-modal-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Review: {reviewTest.title}</h3>
                <p className="text-sm font-medium text-[var(--text-muted)] mt-0.5">
                  Score: <span className="text-[var(--ql-red)] font-black">{attemptMap.get(reviewTest.id)?.score ?? 0}</span>
                  <span className="text-[var(--text-muted)] mx-1">/</span>
                  {attemptMap.get(reviewTest.id)?.total ?? reviewTest.questions.length}
                </p>
              </div>
              <button
                onClick={() => setReviewTest(null)}
                className="btn-secondary !text-xs"
              >
                Close Review
              </button>
            </div>

            {/* Review Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-[var(--surface-secondary)]">
              <div className="max-w-3xl mx-auto space-y-5">
                {reviewTest.questions.map((q, idx) => {
                  const userAnswer = reviewAnswers[idx];
                  const correct = q.correct_index;
                  const isCorrect = userAnswer === correct;
                  return (
                    <div key={q.id} className={`ql-card-static p-5 border-l-4 ${isCorrect ? 'border-l-[var(--success)]' : 'border-l-[var(--danger)]'}`}>
                      <div className="flex gap-3">
                        <div className="shrink-0">
                          {isCorrect ? (
                            <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--success-light)] text-[var(--success)] text-xs font-bold">✓</span>
                          ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] bg-[var(--danger-light)] text-[var(--danger)] text-xs font-bold">✕</span>
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between gap-3">
                            <p className="text-sm font-medium text-[var(--text-primary)]">{q.text}</p>
                            <span className={`badge shrink-0 h-fit ${isCorrect ? "badge-success" : "badge-red"}`}>
                              {isCorrect ? "Correct" : "Wrong"}
                            </span>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, optIdx) => {
                              const isUser = userAnswer === optIdx;
                              const isRight = correct === optIdx;
                              return (
                                <div
                                  key={optIdx}
                                  className={`flex items-start gap-2.5 rounded-[var(--radius-md)] border p-3 text-sm transition-colors ${
                                    isRight
                                      ? "border-[var(--success)]/30 bg-[var(--success-light)] text-[var(--success)]"
                                      : isUser
                                        ? "border-[var(--danger)]/30 bg-[var(--danger-light)] text-[var(--danger)]"
                                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] opacity-60"
                                  }`}
                                >
                                  <span className="font-bold text-xs mt-0.5">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <span className="flex-1 font-medium">{opt}</span>
                                  {isRight && <span className="badge badge-success !text-[9px] shrink-0">Correct</span>}
                                  {!isRight && isUser && <span className="badge badge-red !text-[9px] shrink-0">Your Pick</span>}
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

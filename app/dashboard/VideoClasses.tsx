"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { markLessonComplete } from "./actions";
import { useRouter } from "next/navigation";
import "plyr/dist/plyr.css";

type PlyrInstance = { destroy?: () => void; source?: unknown };
type PlyrConstructor = new (element: unknown, options?: unknown) => PlyrInstance;

function clsx(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

export type VideoCategory = {
  id: string;
  name: string;
  lessons: {
    id: string;
    title: string;
    description: string | null;
    playback_id: string;
    duration: string | null;
  }[];
};

export function VideoClasses({ completed, categories }: { completed: string[]; categories: VideoCategory[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [selectedLesson, setSelectedLesson] = useState<(VideoCategory["lessons"])[number] | null>(categories[0]?.lessons?.[0] ?? null);
  const completedSet = useMemo(() => new Set(completed), [completed]);

  const currentCategory = categories.find((c) => c.id === categoryId) ?? categories[0];

  const handleLessonSelect = (lesson: (VideoCategory["lessons"])[number]) => {
    setSelectedLesson(lesson);
  };

  const handleCompleted = (lesson: (VideoCategory["lessons"])[number]) => {
    if (!lesson) return;
    startTransition(async () => {
      await markLessonComplete(lesson.id);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]" id="videos">
      <div className="space-y-4">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryId(cat.id);
                setSelectedLesson(cat.lessons?.[0] ?? null);
              }}
              className={clsx(
                "rounded-[var(--radius)] border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                categoryId === cat.id
                  ? "border-[var(--ql-red)] bg-[var(--ql-red)] text-white shadow-[var(--shadow-red)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--ql-red)] hover:text-[var(--ql-red)]"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Video Player */}
        <div className="ql-card-static overflow-hidden">
          {selectedLesson ? (
            <div className="relative bg-[var(--foreground)] aspect-video">
              <PlyrEmbed
                playbackId={selectedLesson.playback_id}
                title={selectedLesson.title}
                onMarkComplete={() => handleCompleted(selectedLesson)}
              />
            </div>
          ) : (
            <div className="flex h-64 md:h-96 items-center justify-center text-sm text-[var(--text-muted)] bg-[var(--surface-secondary)]">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--accent-light)] text-[var(--ql-red)] flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-medium">Select a lesson to start watching</p>
              </div>
            </div>
          )}
          <div className="p-5 border-t border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
              {selectedLesson?.title ?? "No Lesson Selected"}
            </h2>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              {selectedLesson?.description || "No description available for this lesson."}
            </p>
          </div>
        </div>
      </div>

      {/* Course content sidebar */}
      <div className="space-y-3 h-fit">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            Course Content
            <span className="badge badge-neutral">{currentCategory?.lessons?.length ?? 0}</span>
          </h3>
          {pending && (
            <span className="badge badge-red animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ql-red)]"></span>
              Saving...
            </span>
          )}
        </div>

        <div className="ql-card-static overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto p-2 space-y-1">
            {(currentCategory?.lessons ?? []).length > 0 ? (
              (currentCategory?.lessons ?? []).map((lesson, index) => {
                const isDone = completedSet.has(lesson.id);
                const isSelected = selectedLesson?.id === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson)}
                    className={clsx(
                      "group w-full rounded-[var(--radius-md)] p-3 text-left transition-all duration-200 border",
                      isSelected
                        ? "bg-[var(--accent-light)] border-[var(--ql-red)]/20 shadow-[var(--shadow-xs)]"
                        : "border-transparent hover:bg-[var(--surface-secondary)] hover:border-[var(--border)]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={clsx(
                        "flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md text-[11px] font-bold transition-colors",
                        isDone
                          ? "bg-[var(--success-light)] text-[var(--success)]"
                          : isSelected
                            ? "bg-[var(--ql-red)] text-white"
                            : "bg-[var(--surface-secondary)] text-[var(--text-muted)] group-hover:bg-[var(--accent-light)] group-hover:text-[var(--ql-red)]"
                      )}>
                        {isDone ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          "text-sm font-semibold truncate transition-colors",
                          isSelected ? "text-[var(--ql-red)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                        )}>
                          {lesson.title}
                        </p>
                        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                          {lesson.duration || "Video"}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0 self-center">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ql-red)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--ql-red)]"></span>
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-[var(--text-muted)] text-sm">
                No lessons found in this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlyrEmbed({ playbackId, title, onMarkComplete }: { playbackId: string; title: string; onMarkComplete: () => void }) {
  const [mounted, setMounted] = useState(false);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const plyrInstance = useRef<PlyrInstance | null>(null);
  // Intentional one-time flag for client render
  useEffect(() => setMounted(true), []);

  const videoId = useMemo(() => {
    try {
      const url = new URL(playbackId);
      const host = url.hostname.replace(/^www\./, "");
      if (!host.includes("youtube.com") && !host.includes("youtu.be")) return null;
      if (host.includes("youtu.be")) {
        return url.pathname.replace(/\//g, "");
      }
      const v = url.searchParams.get("v");
      if (v) return v;
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/embed/")[1];
      }
      return null;
    } catch {
      return null;
    }
  }, [playbackId]);

  const source = useMemo(() => {
    if (!videoId) return null;
    return {
      type: "video" as const,
      title,
      sources: [{ src: videoId, provider: "youtube" as const }],
    };
  }, [videoId, title]);

  // Create Plyr instance once on mount
  useEffect(() => {
    let isActive = true;
    (async () => {
      if (!mounted || !playerRef.current) return;
      const PlyrMod = (await import("plyr")) as unknown as { default?: PlyrConstructor } & PlyrConstructor;
      const PlyrCtor: PlyrConstructor = PlyrMod.default ?? (PlyrMod as PlyrConstructor);
      if (!isActive) return;
      plyrInstance.current = new PlyrCtor(playerRef.current as unknown, {
        captions: { active: true, update: true, language: "en" },
        fullscreen: { enabled: true, fallback: true, iosNative: true },
        youtube: { rel: 0, modestbranding: 1 },
        controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "settings", "pip", "airplay", "fullscreen"],
      });
    })();
    return () => {
      isActive = false;
      plyrInstance.current?.destroy?.();
      plyrInstance.current = null;
    };
  }, [mounted]);

  // Update source when video changes
  useEffect(() => {
    if (!plyrInstance.current || !source) return;
    plyrInstance.current.source = source as unknown;
  }, [source]);

  if (!videoId) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 bg-[var(--surface-secondary)] text-sm text-[var(--text-secondary)]">
        <p>Invalid YouTube URL for this lesson.</p>
        <button
          onClick={onMarkComplete}
          className="btn-primary text-xs !py-2 !px-4"
        >
          Mark as completed
        </button>
      </div>
    );
  }

  if (!mounted || !source) {
    return <div className="aspect-video w-full skeleton" />;
  }

  return (
    <div className="space-y-0">
      <div className="relative">
        <div
          ref={playerRef}
          className="plyr__video-embed aspect-video"
          data-plyr-provider="youtube"
          data-plyr-embed-id={videoId}
        />
      </div>
      <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-secondary)] px-4 py-2.5 text-xs">
        <span className="text-[var(--text-muted)] font-medium">Now playing</span>
        <button
          onClick={onMarkComplete}
          className="rounded-[var(--radius)] bg-[var(--success)] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          ✓ Mark completed
        </button>
      </div>
    </div>
  );
}

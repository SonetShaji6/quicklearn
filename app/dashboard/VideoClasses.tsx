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
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]" id="videos">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryId(cat.id);
                setSelectedLesson(cat.lessons?.[0] ?? null);
              }}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out",
                categoryId === cat.id 
                    ? "border-indigo-200 bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:border-indigo-500 dark:bg-indigo-600 dark:shadow-indigo-900/50" 
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:ring-slate-800">
          {selectedLesson ? (
            <div className="relative bg-slate-900 aspect-video">
                <PlyrEmbed
                playbackId={selectedLesson.playback_id}
                title={selectedLesson.title}
                onMarkComplete={() => handleCompleted(selectedLesson)}
                />
            </div>
          ) : (
            <div className="flex h-64 md:h-96 items-center justify-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
                <div className="text-center">
                    <span className="text-4xl block mb-2">📺</span>
                    Select a lesson to start watching
                </div>
            </div>
          )}
          <div className="p-5">
            <h2 className="text-xl font-bold text-slate-900 mb-2 dark:text-white">
                {selectedLesson?.title ?? "No Lesson Selected"}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400">
                {selectedLesson?.description || "No description available for this lesson."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 h-fit">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Course Content
            <span className="ml-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full dark:bg-slate-800 dark:text-slate-400">
                {currentCategory?.lessons?.length ?? 0} Limit
            </span>
          </h3>
          {pending && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full animate-pulse dark:bg-indigo-900/30 dark:text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                Saving...
            </span>
          )}
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="max-h-[600px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {(currentCategory?.lessons ?? []).length > 0 ? (
                (currentCategory?.lessons ?? []).map((lesson, index) => {
                    const isDone = completedSet.has(lesson.id);
                    const isSelected = selectedLesson?.id === lesson.id;
                    
                    return (
                    <button
                        key={lesson.id}
                        onClick={() => handleLessonSelect(lesson)}
                        className={clsx(
                        "group w-full rounded-xl p-3 text-left transition-all duration-200 border border-transparent",
                        isSelected 
                            ? "bg-indigo-50 border-indigo-100 shadow-sm dark:bg-indigo-900/20 dark:border-indigo-500/30 dark:shadow-indigo-900/10" 
                            : "hover:bg-slate-50 hover:border-slate-100 dark:hover:bg-slate-800/50 dark:hover:border-slate-700"
                        )}
                    >
                        <div className="flex items-start gap-4">
                            <div className={clsx(
                                "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors mt-0.5",
                                isDone ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : (isSelected ? "bg-indigo-200 text-indigo-700 dark:bg-indigo-600 dark:text-white" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700 dark:group-hover:text-indigo-400")
                            )}>
                                {isDone ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={clsx(
                                    "text-sm font-semibold truncate transition-colors",
                                    isSelected ? "text-indigo-900 dark:text-indigo-200" : "text-slate-700 group-hover:text-indigo-700 dark:text-slate-300 dark:group-hover:text-indigo-300"
                                )}>
                                    {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] uppercase font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700">
                                        {lesson.duration || "Video"}
                                    </span>
                                </div>
                            </div>
                            {isSelected && (
                                <div className="flex-shrink-0 self-center">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </button>
                    );
                })
            ) : (
                <div className="p-8 text-center text-slate-500 text-sm dark:text-slate-400">
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
      <div className="flex h-64 flex-col items-center justify-center gap-2 bg-slate-50 text-sm text-slate-600">
        <p>Invalid YouTube URL for this lesson.</p>
        <button
          onClick={onMarkComplete}
          className="rounded-full bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Mark as completed
        </button>
      </div>
    );
  }

  if (!mounted || !source) {
    return <div className="aspect-video w-full bg-slate-100" />;
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
      <div className="mt-0 flex items-center justify-between border border-t-0 border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <span>Watch</span>
        <button
          onClick={onMarkComplete}
          className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          Mark completed
        </button>
      </div>
    </div>
  );
}

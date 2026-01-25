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
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]" id="videos">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryId(cat.id);
                setSelectedLesson(cat.lessons?.[0] ?? null);
              }}
              className={clsx(
                "rounded-full border px-3 py-2 text-sm font-semibold transition",
                categoryId === cat.id ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm" : "border-slate-200 hover:border-indigo-100"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {selectedLesson ? (
            <PlyrEmbed
              playbackId={selectedLesson.playback_id}
              title={selectedLesson.title}
              onMarkComplete={() => handleCompleted(selectedLesson)}
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">Select a lesson to start.</div>
          )}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Lessons</h3>
          {pending && <span className="text-xs text-indigo-600">Updating…</span>}
        </div>
        <div className="space-y-2">
          {(currentCategory?.lessons ?? []).map((lesson) => {
            const isDone = completedSet.has(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => handleLessonSelect(lesson)}
                className={clsx(
                  "w-full rounded-xl border px-3 py-2 text-left transition",
                  selectedLesson?.id === lesson.id ? "border-indigo-200 bg-indigo-50" : "border-slate-200 hover:border-indigo-100"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{lesson.title}</p>
                    <p className="text-xs text-slate-500">{lesson.duration}</p>
                  </div>
                  <span
                    className={clsx(
                      "rounded-full px-2 py-1 text-[11px] font-semibold",
                      isDone ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {isDone ? "Completed" : "Pending"}
                  </span>
                </div>
              </button>
            );
          })}
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

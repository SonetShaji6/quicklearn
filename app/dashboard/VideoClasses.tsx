"use client";

import { useMemo, useState, useTransition } from "react";
import { markLessonComplete } from "./actions";
import { useRouter } from "next/navigation";

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
            <YouTubeEmbed
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

function YouTubeEmbed({ playbackId, title, onMarkComplete }: { playbackId: string; title: string; onMarkComplete: () => void }) {
  const embedUrl = useMemo(() => {
    try {
      const url = new URL(playbackId);
      const host = url.hostname.replace(/^www\./, "");
      if (!host.includes("youtube.com") && !host.includes("youtu.be")) return null;
      let videoId = "";
      if (host.includes("youtu.be")) {
        videoId = url.pathname.replace(/\//g, "");
      } else {
        videoId = url.searchParams.get("v") || "";
        if (!videoId && url.pathname.startsWith("/embed/")) {
          videoId = url.pathname.split("/embed/")[1];
        }
      }
      if (!videoId) return null;
      const params = new URLSearchParams({
        rel: "0",
        modestbranding: "1",
        iv_load_policy: "3",
        controls: "1",
        fs: "1",
        disablekb: "1",
        playsinline: "1",
      });
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    } catch {
      return null;
    }
  }, [playbackId]);

  if (!embedUrl) {
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

  return (
    <div className="relative">
      <iframe
        title={title}
        src={embedUrl}
        className="aspect-video w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-same-origin allow-scripts allow-presentation"
        allowFullScreen
      />
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <span>Watch on YouTube</span>
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

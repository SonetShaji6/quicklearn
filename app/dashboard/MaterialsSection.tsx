"use client";

import { useMemo, useState } from "react";

type BaseMaterial = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  signedUrl: string | null;
};

export type MaterialWithSignedUrl = BaseMaterial;

export type MaterialSection = {
  id: string;
  name: string;
  materials: MaterialWithSignedUrl[];
};

type PreviewKind = "pdf" | "doc" | "unsupported";

type PreviewState = {
  material: MaterialWithSignedUrl;
  kind: PreviewKind;
  previewUrl: string | null;
} | null;

function humanFileType(mime: string | null) {
  if (!mime) return "File";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("word")) return "DOC";
  if (mime.includes("msword") || mime.includes("officedocument")) return "DOC";
  if (mime.includes("zip")) return "ZIP";
  if (mime.includes("image")) return "Image";
  return mime.toUpperCase();
}

function formatBytes(bytes: number | null) {
  if (bytes === null || typeof bytes !== "number") return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function getPreviewKind(mime: string | null): PreviewKind {
  if (!mime) return "unsupported";
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("msword") || mime.includes("wordprocessingml")) return "doc";
  return "unsupported";
}

export default function MaterialsSection({ sections }: { sections: MaterialSection[] }) {
  const normalizedSections = useMemo(() => (sections.length ? sections : []), [sections]);
  const [activeSectionId, setActiveSectionId] = useState(normalizedSections[0]?.id ?? "");
  const [preview, setPreview] = useState<PreviewState>(null);

  const activeSection = normalizedSections.find((s) => s.id === activeSectionId) ?? normalizedSections[0];

  const openPreview = (material: MaterialWithSignedUrl) => {
    const kind = getPreviewKind(material.mime_type);
    if (!material.signedUrl) {
      setPreview({ material, kind: "unsupported", previewUrl: null });
      return;
    }
    let previewUrl: string | null = material.signedUrl;
    if (kind === "doc") {
      previewUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(material.signedUrl)}`;
    }
    setPreview({ material, kind, previewUrl });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">Study Materials</p>
          <p className="text-sm text-slate-600">Preview PDFs and docs, or download any file.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {normalizedSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                activeSectionId === section.id
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm"
                  : "border-slate-200 text-slate-700 hover:border-indigo-100"
              }`}
            >
              {section.name}
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {section.materials.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeSection ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeSection.materials.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              No materials in this category yet.
            </div>
          ) : (
            activeSection.materials.map((mat) => (
              <article
                key={mat.id}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-900 leading-tight break-words">{mat.title}</p>
                      {mat.description && <p className="text-xs text-slate-600 line-clamp-2">{mat.description}</p>}
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">{humanFileType(mat.mime_type)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {formatBytes(mat.size_bytes)}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openPreview(mat)}
                    className="inline-flex flex-1 justify-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    Preview
                  </button>
                  <a
                    href={mat.signedUrl ?? undefined}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 justify-center rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    aria-disabled={!mat.signedUrl}
                  >
                    Download
                  </a>
                </div>

                {mat.signedUrl ? null : (
                  <p className="mt-2 text-[11px] text-rose-600">Link unavailable.</p>
                )}
              </article>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No categories found.</div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{preview.material.title}</p>
                <p className="text-xs text-slate-500">{humanFileType(preview.material.mime_type)}</p>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close preview"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[75vh] overflow-hidden">
              {preview.kind === "pdf" && preview.previewUrl ? (
                <iframe title="PDF preview" src={preview.previewUrl} className="h-[75vh] w-full" />
              ) : preview.kind === "doc" && preview.previewUrl ? (
                <iframe title="Document preview" src={preview.previewUrl} className="h-[75vh] w-full" />
              ) : (
                <div className="flex h-[40vh] flex-col items-center justify-center gap-3 p-6 text-sm text-slate-600">
                  <p>Preview not available for this file type.</p>
                  {preview.material.signedUrl ? (
                    <a
                      href={preview.material.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                      Download file
                    </a>
                  ) : (
                    <p className="text-xs text-rose-600">File link unavailable.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

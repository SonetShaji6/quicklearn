"use client";

import { useMemo, useState } from "react";

type BaseMaterial = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  file_path?: string;
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
  externalUrl: string | null;
} | null;

function humanFileType(mime: string | null, filePath?: string) {
  const lowerMime = mime?.toLowerCase() ?? "";
  const ext = filePath?.split(".").pop()?.toLowerCase();
  if (lowerMime.includes("pdf") || ext === "pdf") return "PDF";
  if (lowerMime.includes("word") || lowerMime.includes("msword") || lowerMime.includes("officedocument") || ext === "doc" || ext === "docx") return "DOC";
  if (lowerMime.includes("zip") || ext === "zip") return "ZIP";
  if (lowerMime.includes("image") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext ?? "")) return "Image";
  if (ext) return ext.toUpperCase();
  if (lowerMime) return lowerMime.toUpperCase();
  return "File";
}

function formatBytes(bytes: number | null) {
  if (bytes === null || typeof bytes !== "number") return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function getPreviewKind(mime: string | null, filePath?: string): PreviewKind {
  const lowerMime = mime?.toLowerCase() ?? "";
  const ext = filePath?.split(".").pop()?.toLowerCase();
  if (lowerMime.includes("pdf") || ext === "pdf") return "pdf";
  if (lowerMime.includes("msword") || lowerMime.includes("wordprocessingml") || ext === "doc" || ext === "docx") return "doc";
  return "unsupported";
}

export default function MaterialsSection({ sections }: { sections: MaterialSection[] }) {
  const normalizedSections = useMemo(() => (sections.length ? sections : []), [sections]);
  const [activeSectionId, setActiveSectionId] = useState(normalizedSections[0]?.id ?? "");
  const [preview, setPreview] = useState<PreviewState>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const activeSection = normalizedSections.find((s) => s.id === activeSectionId) ?? normalizedSections[0];

  const openPreview = (material: MaterialWithSignedUrl) => {
    const kind = getPreviewKind(material.mime_type, material.file_path);
    if (!material.signedUrl) {
      setPreview({ material, kind: "unsupported", previewUrl: null, externalUrl: null });
      return;
    }
    const isMobile = typeof window !== "undefined" && /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  let previewUrl: string | null = null;
  const externalUrl: string | null = material.signedUrl;

    // On mobile, many browsers block or force-download iframes; prefer opening in a new tab there.
    if (!isMobile) {
      if (kind === "pdf") {
        previewUrl = material.signedUrl;
      }
      if (kind === "doc") {
        previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(material.signedUrl)}`;
      }
    }

    setPreview({ material, kind, previewUrl, externalUrl });
    setPreviewLoading(!!previewUrl);
  };

  return (
    <div className="space-y-6" id="materials">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Material Library</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Access your study guides, cheat sheets, and notes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {normalizedSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                activeSectionId === section.id
                  ? "border-indigo-200 bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:border-indigo-500 dark:bg-indigo-600 dark:shadow-indigo-900/50"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
              }`}
            >
              {section.name}
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                 activeSectionId === section.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
              }`}>
                {section.materials.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeSection ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeSection.materials.length === 0 ? (
            <div className="col-span-full py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <span className="text-4xl block mb-2">📂</span>
                <p className="text-slate-500 font-medium dark:text-slate-400">No materials in this category yet.</p>
            </div>
          ) : (
            activeSection.materials.map((mat) => (
              <article
                key={mat.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-100 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-none"
              >
                <div className="space-y-3 mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 dark:bg-indigo-900/30 dark:text-indigo-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {humanFileType(mat.mime_type, mat.file_path)}
                    </span>
                  </div>
                  <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight mb-1 group-hover:text-indigo-700 transition-colors dark:text-slate-100 dark:group-hover:text-indigo-400">{mat.title}</h3>
                      {mat.description && <p className="text-xs text-slate-500 line-clamp-2 dark:text-slate-500">{mat.description}</p>}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
                    {formatBytes(mat.size_bytes)}
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                  <button
                    onClick={() => openPreview(mat)}
                    className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-indigo-600 hover:shadow-sm ring-1 ring-slate-200 hover:ring-indigo-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:ring-slate-700 dark:hover:ring-slate-600"
                  >
                    Preview
                  </button>
                  <a
                    href={mat.signedUrl ?? undefined}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed dark:shadow-indigo-900/40"
                    aria-disabled={!mat.signedUrl}
                  >
                    Download
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">No categories found.</div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-5xl h-[85vh] flex flex-col rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5 overflow-hidden dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 bg-white/50 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hidden sm:block dark:bg-indigo-900/30 dark:text-indigo-400">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate dark:text-white">{preview.material.title}</h3>
                  <p className="text-xs text-slate-500 font-medium dark:text-slate-400">{humanFileType(preview.material.mime_type, preview.material.file_path)} • {formatBytes(preview.material.size_bytes)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0 ml-4">
                {preview.externalUrl && (
                  <a
                    href={preview.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <span>Open Externally</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                )}
                <button
                  onClick={() => setPreview(null)}
                  className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-slate-100 overflow-hidden flex flex-col dark:bg-slate-950">
              {preview.previewUrl ? (
                <>
                  {previewLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
                        <span className="text-xs font-medium text-indigo-600">Loading Preview...</span>
                      </div>
                    </div>
                  )}
                  <iframe
                    title="File preview"
                    src={preview.previewUrl}
                    className="w-full h-full border-0"
                    onLoad={() => setPreviewLoading(false)}
                  />
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-slate-200/50 flex items-center justify-center text-slate-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold mb-1">Preview not available</h4>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">This file type allows downloading but cannot be previewed directly in the browser.</p>
                  </div>
                  {preview.externalUrl ? (
                    <a
                      href={preview.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                    >
                      Download File
                    </a>
                  ) : (
                    <p className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">Download Link Unavailable</p>
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

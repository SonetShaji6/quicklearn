"use client";

import { useMemo, useState, useEffect } from "react";

function clsx(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

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

    window.history.pushState({ previewOpen: true }, "");
    setPreview({ material, kind, previewUrl, externalUrl });
    setPreviewLoading(!!previewUrl);
  };

  const closePreview = () => {
    if (window.history.state?.previewOpen) {
      // Let the popstate listener clear the preview
      window.history.back();
    } else {
      setPreview(null);
    }
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (preview) {
        setPreview(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [preview]);

  return (
    <div className="space-y-5" id="materials">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Material Library</p>
          <p className="text-sm text-[var(--text-muted)]">Access your study guides, cheat sheets, and notes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {normalizedSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={clsx(
                "group rounded-[var(--radius)] border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                activeSectionId === section.id
                  ? "border-[var(--ql-red)] bg-[var(--ql-red)] text-white shadow-[var(--shadow-red)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--ql-red)] hover:text-[var(--ql-red)]"
              )}
            >
              <div className="flex items-center gap-2">
                <span>{section.name}</span>
                <span className={clsx(
                  "px-2 py-0.5 rounded-full text-xs font-black min-w-[24px] text-center shadow-sm",
                  activeSectionId === section.id 
                    ? "bg-white text-[var(--ql-red)]" 
                    : "bg-[var(--surface-tertiary)] text-[var(--text-primary)] group-hover:bg-[var(--ql-red-light)] group-hover:text-[var(--ql-red)]"
                )}>
                  {section.materials.length}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeSection ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeSection.materials.length === 0 ? (
            <div className="col-span-full py-12 text-center rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--border)] bg-[var(--surface-secondary)]">
              <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--accent-light)] text-[var(--ql-red)] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="text-[var(--text-muted)] font-medium text-sm">No materials in this category yet.</p>
            </div>
          ) : (
            activeSection.materials.map((mat) => (
              <article
                key={mat.id}
                className="group ql-card p-5 flex flex-col justify-between"
              >
                <div className="space-y-3 mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--accent-light)] text-[var(--ql-red)] flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--ql-red)] group-hover:text-white group-hover:shadow-[var(--shadow-red)]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span className="badge badge-neutral shrink-0">
                      {humanFileType(mat.mime_type, mat.file_path)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] leading-tight mb-1 group-hover:text-[var(--ql-red)] transition-colors">{mat.title}</h3>
                    {mat.description && <p className="text-xs text-[var(--text-muted)] line-clamp-2">{mat.description}</p>}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--text-muted)]">
                    {formatBytes(mat.size_bytes)}
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => openPreview(mat)}
                    className="btn-secondary flex-1 !text-xs !py-2 !px-3"
                  >
                    Preview
                  </button>
                  <a
                    href={mat.signedUrl ?? undefined}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary flex-1 !text-xs !py-2 !px-3"
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
        <div className="ql-card-static p-8 text-center text-sm text-[var(--text-muted)]">No categories found.</div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--foreground)]/80 backdrop-blur-sm p-4 animate-overlay-in">
          <div className="relative w-full max-w-5xl h-[85vh] flex flex-col ql-card-static overflow-hidden animate-modal-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-[var(--radius)] bg-[var(--accent-light)] text-[var(--ql-red)] flex items-center justify-center hidden sm:flex">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{preview.material.title}</h3>
                  <p className="text-[11px] text-[var(--text-muted)] font-medium">{humanFileType(preview.material.mime_type, preview.material.file_path)} • {formatBytes(preview.material.size_bytes)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-4">
                {preview.externalUrl && (
                  <a
                    href={preview.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost hidden sm:inline-flex !text-xs"
                  >
                    Open Externally
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                )}
                <button
                  onClick={closePreview}
                  className="w-8 h-8 rounded-[var(--radius)] bg-[var(--surface-secondary)] text-[var(--text-muted)] hover:bg-[var(--danger-light)] hover:text-[var(--danger)] transition-colors flex items-center justify-center"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="relative flex-1 bg-[var(--surface-secondary)] overflow-hidden flex flex-col">
              {preview.previewUrl ? (
                <>
                  {previewLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--surface)]/50 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[var(--border)] border-t-[var(--ql-red)]" />
                        <span className="text-xs font-medium text-[var(--ql-red)]">Loading Preview...</span>
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
                  <div className="h-14 w-14 rounded-[var(--radius-xl)] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </div>
                  <div>
                    <h4 className="text-[var(--text-primary)] font-bold mb-1">Preview not available</h4>
                    <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">This file type cannot be previewed in the browser.</p>
                  </div>
                  {preview.externalUrl ? (
                    <a
                      href={preview.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                    >
                      Download File
                    </a>
                  ) : (
                    <span className="badge badge-red">Download Link Unavailable</span>
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

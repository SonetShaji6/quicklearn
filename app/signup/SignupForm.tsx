"use client";

import { useState, useRef, useCallback } from "react";
import { signupAction } from "./actions";
import { Spinner } from "@/app/components/Spinner";

const MAX_CLIENT_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Compress an image file using Canvas API.
 * Resizes to maxDim and converts to JPEG at the given quality.
 * Falls back to the original file if Canvas is unsupported or it's a PDF.
 */
function compressImage(
  file: File,
  maxDim: number = 1200,
  quality: number = 0.7
): Promise<File> {
  return new Promise((resolve) => {
    // Don't compress PDFs — pass them through
    if (file.type === "application/pdf") {
      resolve(file);
      return;
    }

    // If Canvas API is not supported (very old browsers), skip compression
    if (typeof document === "undefined" || !document.createElement) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Only downscale, never upscale
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // Compression didn't help — use original
              resolve(file);
              return;
            }
            const compressed = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, ".jpg"),
              { type: "image/jpeg", lastModified: Date.now() }
            );
            resolve(compressed);
          },
          "image/jpeg",
          quality
        );
      } catch {
        // Canvas security error or OOM — fall back to original
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SignupForm() {
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<{ success: boolean; message: string }>({
    success: false,
    message: "",
  });
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    originalSize: number;
    compressedSize: number | null;
    error: string | null;
  } | null>(null);

  const compressedFileRef = useRef<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      compressedFileRef.current = null;

      if (!file) {
        setFileInfo(null);
        return;
      }

      // Immediate client-side type check
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setFileInfo({
          name: file.name,
          originalSize: file.size,
          compressedSize: null,
          error: "Only PNG, JPG, or PDF files are allowed.",
        });
        return;
      }

      // Check raw size first
      if (file.size > 10 * 1024 * 1024) {
        // 10MB hard cap even before compression
        setFileInfo({
          name: file.name,
          originalSize: file.size,
          compressedSize: null,
          error: "File is too large. Please choose a file under 10 MB.",
        });
        return;
      }

      setFileInfo({
        name: file.name,
        originalSize: file.size,
        compressedSize: null,
        error: null,
      });

      // Compress images to reduce memory usage
      if (file.type.startsWith("image/")) {
        try {
          const compressed = await compressImage(file, 1200, 0.7);
          compressedFileRef.current = compressed;

          if (compressed.size > MAX_CLIENT_FILE_SIZE) {
            setFileInfo({
              name: file.name,
              originalSize: file.size,
              compressedSize: compressed.size,
              error: `File is still ${formatFileSize(compressed.size)} after compression. Please use a smaller image.`,
            });
            return;
          }

          setFileInfo({
            name: file.name,
            originalSize: file.size,
            compressedSize:
              compressed.size !== file.size ? compressed.size : null,
            error: null,
          });
        } catch {
          // Compression failed — use original
          compressedFileRef.current = file;
          if (file.size > MAX_CLIENT_FILE_SIZE) {
            setFileInfo({
              name: file.name,
              originalSize: file.size,
              compressedSize: null,
              error: `File must be under 5 MB. Your file is ${formatFileSize(file.size)}.`,
            });
          }
        }
      } else {
        // PDF
        compressedFileRef.current = file;
        if (file.size > MAX_CLIENT_FILE_SIZE) {
          setFileInfo({
            name: file.name,
            originalSize: file.size,
            compressedSize: null,
            error: `PDF must be under 5 MB. Your file is ${formatFileSize(file.size)}.`,
          });
        }
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (fileInfo?.error) return;
      if (pending) return;

      const form = formRef.current;
      if (!form) return;

      setPending(true);
      setState({ success: false, message: "" });

      try {
        const formData = new FormData(form);

        // Replace the file input with the compressed version
        if (compressedFileRef.current) {
          formData.set("payment-proof", compressedFileRef.current);
        }

        const result = await signupAction(formData);
        setState(result);

        if (result.success && form) {
          form.reset();
          setFileInfo(null);
          compressedFileRef.current = null;
        }
      } catch {
        setState({
          success: false,
          message:
            "Something went wrong. Please check your connection and try again.",
        });
      } finally {
        setPending(false);
      }
    },
    [fileInfo, pending]
  );

  const hasFileError = fileInfo?.error != null;

  return (
    <form
      ref={formRef}
      className="ql-card-static p-6 sm:p-8 space-y-6"
      onSubmit={handleSubmit}
    >
      <div>
        <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
          Create Account
        </h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Start your learning journey today.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
            htmlFor="signup-name"
          >
            Full Name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            required
            className="ql-input"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
            htmlFor="signup-email"
          >
            Email Address
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            className="ql-input"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
            htmlFor="signup-phone"
          >
            Phone Number
          </label>
          <input
            id="signup-phone"
            name="phone"
            type="tel"
            required
            pattern="[0-9+\-() ]{7,20}"
            className="ql-input"
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
            htmlFor="signup-password"
          >
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            minLength={8}
            className="ql-input"
            placeholder="Create a strong password"
          />
          <p className="text-[11px] text-[var(--text-muted)] ml-0.5">
            At least 8 characters.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
              htmlFor="signup-college"
            >
              College
            </label>
            <input
              id="signup-college"
              name="college"
              type="text"
              required
              className="ql-input"
              placeholder="College Name"
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
              htmlFor="signup-degree"
            >
              Degree
            </label>
            <input
              id="signup-degree"
              name="degree"
              type="text"
              required
              defaultValue="MCA"
              className="ql-input"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider"
            htmlFor="payment-proof"
          >
            Payment Proof{" "}
            <span className="font-normal text-[var(--text-muted)] normal-case">
              (Screenshot)
            </span>
          </label>
          <div className="relative">
            <input
              id="payment-proof"
              name="payment-proof"
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              required
              onChange={handleFileChange}
              className="file:mr-3 file:py-2 file:px-4 file:rounded-[var(--radius-md)] file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-[var(--ql-red)] file:text-white file:cursor-pointer hover:file:bg-[var(--ql-red-hover)] w-full rounded-[var(--radius-md)] bg-[var(--surface-secondary)] border-[1.5px] border-transparent px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border)] focus:border-[var(--ql-red)] focus:outline-none"
            />
          </div>

          {/* File info feedback */}
          {fileInfo && (
            <div className="mt-1.5 space-y-1">
              {fileInfo.error ? (
                <p className="text-xs font-medium text-[var(--danger)] flex items-center gap-1.5">
                  <svg
                    className="h-3.5 w-3.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {fileInfo.error}
                </p>
              ) : (
                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-[var(--success)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>
                    {formatFileSize(
                      fileInfo.compressedSize ?? fileInfo.originalSize
                    )}
                    {fileInfo.compressedSize != null && (
                      <span className="text-[var(--success)] font-medium">
                        {" "}
                        (compressed from{" "}
                        {formatFileSize(fileInfo.originalSize)})
                      </span>
                    )}
                  </span>
                </p>
              )}
            </div>
          )}

          <p className="text-[11px] text-[var(--text-muted)] ml-0.5">
            PNG, JPG, or PDF · Max 5 MB · Images are auto-compressed
          </p>
        </div>
      </div>

      {state.message && (
        <div
          className={`flex items-center gap-3 rounded-[var(--radius-md)] border p-3.5 text-sm font-medium ${
            state.success
              ? "border-[color:var(--success)]/20 bg-[var(--success-light)] text-[var(--success)]"
              : "border-[color:var(--danger)]/20 bg-[var(--danger-light)] text-[var(--danger)]"
          }`}
        >
          {state.success ? (
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {state.message}
        </div>
      )}

      <button
        type="submit"
        className="btn-primary w-full !py-3.5 text-sm mt-6"
        disabled={pending || hasFileError}
      >
        {pending ? (
          <>
            <Spinner className="h-4 w-4 text-white" />
            Creating Account...
          </>
        ) : (
          <>
            Create Account
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

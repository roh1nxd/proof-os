"use client";

import { useRef, useState } from "react";

import { Spinner } from "@/components/ui/spinner";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
};

export function AvatarUpload({ value, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    setUploading(true);

    const form = new FormData();
    form.append("avatar", file);

    try {
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const body = (await res.json()) as { avatarUrl?: string; error?: string };
      if (!res.ok) {
        setError(body.error ?? "Upload failed");
        return;
      }
      if (body.avatarUrl) onChange(body.avatarUrl);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <span className="label">Profile photo</span>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="relative h-24 w-24 border-[3px] border-black shadow-[4px_4px_0_#0a0a0a] bg-[#ffe600] overflow-hidden"
          role="img"
          aria-label="Avatar preview"
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-black">
              ?
            </div>
          )}
        </div>

        <div className="flex-1 min-w-[200px]">
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className="upload-zone w-full px-4 py-6 text-center text-xs font-bold uppercase tracking-wider"
          >
            {uploading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Uploading…
              </span>
            ) : (
              "Click to upload · JPG PNG WEBP · max 2MB"
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
          {value ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm mt-2 text-red-600"
              disabled={disabled}
              onClick={() => onChange(null)}
            >
              Remove photo
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="text-xs font-bold text-[#ff006e]">{error}</p> : null}
    </div>
  );
}

"use client";

import { Trash2 } from "lucide-react";
import { FileUpload } from "@/components/shared/form/FileUpload";
import { COURT_CONFIG } from "../config/court.constants";

const ACCEPT = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_SIZE = 5 * 1024 * 1024;

async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/courts/upload", { method: "POST", body: formData });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || COURT_CONFIG.UI.LABELS.PHOTOS.UPLOAD_ERROR);
  }

  const data = await res.json();
  return data.url;
}

/**
 * Manages the court photo list: upload, preview and remove.
 */
export function CourtPhotosManager({ photos = [], onChange }) {
  const { PHOTOS } = COURT_CONFIG.UI.LABELS;

  const handleUploaded = async (file) => {
    const url = await uploadPhoto(file);
    onChange([...photos, url]);
    return url;
  };

  const handleRemove = (index) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{PHOTOS.TITLE}</p>
        <p className="text-xs text-muted-foreground">{PHOTOS.DESCRIPTION}</p>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative overflow-hidden rounded-lg border aspect-[4/3] bg-muted"
            >
              <img src={url} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={PHOTOS.REMOVE}
                className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <FileUpload
        label={PHOTOS.ADD_LABEL}
        onUpload={handleUploaded}
        fileConfig={{ maxSize: MAX_SIZE, accept: ACCEPT }}
      />
    </div>
  );
}

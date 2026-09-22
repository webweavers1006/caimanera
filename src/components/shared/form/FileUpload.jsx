"use client"

import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/features/shared"
import { useFileUpload } from "@/features/shared/hooks/use-file-upload"

const STATUS = {
  IDLE: "idle",
  SUCCESS: "success",
  UPLOADING: "uploading",
  ERROR: "error",
}

/**
 * Generic File Upload component with drag & drop, progress, and preview.
 *
 * @param {Object} props
 * @param {Function} props.onUpload - Async (file) => Promise<string> returning the URL.
 * @param {Object} props.fileConfig - { maxSize, accept, magicBytes }.
 * @param {string} props.currentUrl - Existing URL to show as already uploaded.
 * @param {string} props.label - Label for the upload area.
 * @param {string} props.description - Description shown in the drop zone.
 * @param {Function} props.onChange - Called with the resulting URL.
 * @param {Object} props.labels - Custom labels override.
 */
export function FileUpload(props) {
  const {
    label,
    description,
  } = props

  const {
    inputRef,
    status,
    uploadedUrl,
    fileName,
    errorMsg,
    isDragOver,
    labels,
    allowedExtensions,
    fileConfig,
    handleDrop,
    handleInputChange,
    handleRemove,
  } = useFileUpload(props)

  if (status === STATUS.SUCCESS && (uploadedUrl || (props.mode === "deferred" && fileName))) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/10 p-4">
        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-success truncate">
            {labels.success}
          </p>
          {fileName && (
            <p className="text-xs text-success/70 truncate">{fileName}</p>
          )}
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-destructive" onClick={handleRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click() }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative cursor-pointer rounded-lg border-2 border-dashed p-6 flex flex-col items-center justify-center gap-2 transition-all duration-200",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/30",
          status === STATUS.ERROR && "border-destructive/50 bg-destructive/5",
          status === STATUS.UPLOADING && "pointer-events-none opacity-70"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={allowedExtensions.join(",")}
          className="hidden"
          onChange={handleInputChange}
          disabled={status === STATUS.UPLOADING}
        />

        {status === STATUS.UPLOADING ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{labels.uploading}</p>
          </>
        ) : status === STATUS.ERROR ? (
          <>
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">{labels.error}</p>
            <p className="text-xs text-destructive/80 text-center max-w-xs">{errorMsg}</p>
            <Button type="button" variant="ghost" size="sm" className="mt-1">
              {labels.retry}
            </Button>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-muted-foreground/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">
                {isDragOver ? labels.dropPrompt : labels.dragPrompt}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
              <p className="text-[10px] text-muted-foreground/60">
                {allowedExtensions.join(", ").toUpperCase()} — Máx. {(fileConfig?.maxSize || 5 * 1024 * 1024) / 1024 / 1024}MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import { logger } from "@/features/shared"
import { SHARED_CONFIG } from "@/features/shared"

const FILE_UPLOAD_LABELS = SHARED_CONFIG.UI.LABELS.FILE_UPLOAD;

const STATUS = {
  IDLE: "idle",
  SELECTED: "selected",
  UPLOADING: "uploading",
  SUCCESS: "success",
  ERROR: "error",
}

/**
 * Hook that encapsulates all file upload state, validation, and handling.
 *
 * @param {Object} params
 * @param {Function} params.onUpload - Async (file) => Promise<string> returning the URL.
 * @param {Object} params.fileConfig - { maxSize, accept, magicBytes }.
 * @param {string} [params.currentUrl] - Existing URL to show as already uploaded.
 * @param {Function} [params.onChange] - Called with the resulting URL.
 * @param {Object} [params.labels] - Custom labels override.
 * @param {string} [params.mode] - "instant" | "deferred".
 * @param {Function} [params.onFileSelect] - Deferred mode callback.
 * @param {Function} [params.onFileRemove] - Deferred mode callback.
 * @param {string} [params.deferredFileName] - Deferred mode file name.
 * @returns {Object} Upload state and handlers.
 */
export function useFileUpload({
  onUpload,
  fileConfig,
  currentUrl,
  onChange,
  labels: customLabels,
  mode = "instant",
  onFileSelect,
  onFileRemove,
  deferredFileName,
}) {
  const inputRef = useRef(null)
  const hasDeferredFile = mode === "deferred" && deferredFileName
  const [status, setStatus] = useState(
    currentUrl || hasDeferredFile ? STATUS.SUCCESS : STATUS.IDLE
  )
  const [uploadedUrl, setUploadedUrl] = useState(currentUrl || "")
  const [fileName, setFileName] = useState(hasDeferredFile ? deferredFileName : "")
  const [errorMsg, setErrorMsg] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)

  const allowedExtensions = useMemo(() => fileConfig?.accept || [], [fileConfig])

  const labels = useMemo(() => ({
    noFile: FILE_UPLOAD_LABELS.NO_FILE,
    invalidExtension: FILE_UPLOAD_LABELS.INVALID_EXTENSION(allowedExtensions.join(", ").toUpperCase()),
    invalidContent: FILE_UPLOAD_LABELS.INVALID_CONTENT,
    verifyFailed: FILE_UPLOAD_LABELS.VERIFY_FAILED,
    uploading: FILE_UPLOAD_LABELS.UPLOADING,
    error: FILE_UPLOAD_LABELS.ERROR,
    retry: FILE_UPLOAD_LABELS.RETRY,
    success: mode === "deferred" ? FILE_UPLOAD_LABELS.SUCCESS_DEFERRED : FILE_UPLOAD_LABELS.SUCCESS_INSTANT,
    uploadError: FILE_UPLOAD_LABELS.UPLOAD_ERROR,
    dragPrompt: FILE_UPLOAD_LABELS.DRAG_PROMPT,
    dropPrompt: FILE_UPLOAD_LABELS.DROP_PROMPT,
    ...customLabels,
  }), [allowedExtensions, customLabels, mode])

  const validateFile = useCallback(async (file) => {
    if (!file) return labels.noFile

    const ext = "." + file.name.split(".").pop()?.toLowerCase()
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
      return labels.invalidExtension
    }

    const maxSize = fileConfig?.maxSize || 5 * 1024 * 1024
    if (file.size > maxSize) {
      const mb = (maxSize / 1024 / 1024).toFixed(0)
      return FILE_UPLOAD_LABELS.MAX_SIZE(mb)
    }

    if (fileConfig?.magicBytes) {
      try {
        const buffer = await file.arrayBuffer()
        const header = new Uint8Array(buffer.slice(0, 4))
        const ext2 = file.name.split(".").pop()?.toLowerCase()
        const expected = fileConfig.magicBytes[ext2]

        if (expected) {
          const match = expected.every((byte, i) => header[i] === byte)
          if (!match) return labels.invalidContent
        }
      } catch {
        return labels.verifyFailed
      }
    }

    return null
  }, [allowedExtensions, fileConfig, labels])

  const handleFile = useCallback(async (file) => {
    const validationError = await validateFile(file)
    if (validationError) {
      setStatus(STATUS.ERROR)
      setErrorMsg(validationError)
      return
    }

    setFileName(file.name)
    setStatus(STATUS.SELECTED)

    if (mode === "deferred") {
      setStatus(STATUS.SUCCESS)
      onFileSelect?.(file)
      return
    }

    if (!onUpload) {
      logger.warn("FileUpload: No onUpload handler provided.")
      return
    }

    setStatus(STATUS.UPLOADING)
    setErrorMsg("")

    try {
      const url = await onUpload(file)
      setUploadedUrl(url)
      setStatus(STATUS.SUCCESS)
      onChange?.(url)
    } catch (err) {
      logger.error("FileUpload upload failed:", err)
      setStatus(STATUS.ERROR)
      setErrorMsg(err.message || labels.uploadError)
    }
  }, [validateFile, onUpload, onChange, labels, mode, onFileSelect])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleRemove = useCallback(() => {
    if (mode === "deferred") {
      onFileRemove?.()
    }
    setStatus(STATUS.IDLE)
    setUploadedUrl("")
    setFileName("")
    setErrorMsg("")
    onChange?.("")
    if (inputRef.current) inputRef.current.value = ""
  }, [onChange, mode, onFileRemove])

  return {
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
  }
}

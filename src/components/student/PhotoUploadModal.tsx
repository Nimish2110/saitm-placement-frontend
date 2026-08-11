"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Camera, Upload, RotateCcw, Check } from "lucide-react";

export function PhotoUploadModal({
  open,
  onClose,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}) {
  const [mode, setMode] = useState<"choose" | "camera" | "preview">("choose");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      stream?.getTracks().forEach((t) => t.stop());
      setStream(null);
      setMode("choose");
      setCapturedBlob(null);
      setPreviewUrl(null);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function startCamera() {
    setError("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(s);
      setMode("camera");
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      }, 50);
    } catch {
      setError("Could not access your camera. Check your browser's camera permission, or use Upload instead.");
    }
  }

  function stopCamera() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setPreviewUrl(URL.createObjectURL(blob));
          stopCamera();
          setMode("preview");
        }
      },
      "image/jpeg",
      0.92
    );
  }

  function retake() {
    setCapturedBlob(null);
    setPreviewUrl(null);
    startCamera();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    handleUploadFile(file);
  }

  async function handleUploadFile(file: File) {
    setUploading(true);
    setError("");
    try {
      await onUpload(file);
      onClose();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleUseCaptured() {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], "photo.jpg", { type: "image/jpeg" });
    await handleUploadFile(file);
  }

  return (
    <Modal open={open} onClose={onClose} title="Update Profile Photo" width={480}>
      <p className="text-xs text-muted mb-5">
        Please use a clear, professional photo — Placement Managers will see this when reviewing your profile.
      </p>

      {error && <p className="text-xs text-danger mb-4">{error}</p>}

      {mode === "choose" && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={startCamera}
            className="flex flex-col items-center gap-2 p-6 rounded-[10px] border border-border hover:border-primary hover:bg-primary-50 transition-colors"
          >
            <Camera size={24} className="text-primary" />
            <span className="text-sm font-semibold">Take Photo</span>
            <span className="text-[10.5px] text-muted text-center">Use your camera</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-6 rounded-[10px] border border-border hover:border-primary hover:bg-primary-50 transition-colors"
          >
            <Upload size={24} className="text-primary" />
            <span className="text-sm font-semibold">Upload</span>
            <span className="text-[10.5px] text-muted text-center">Choose from your device</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={handleFileChange} />
        </div>
      )}

      {mode === "camera" && (
        <div>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-[10px] bg-black aspect-square object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1 justify-center" onClick={() => { stopCamera(); setMode("choose"); }}>
              Cancel
            </Button>
            <Button className="flex-1 justify-center" onClick={capturePhoto}>
              <Camera size={14} /> Capture
            </Button>
          </div>
        </div>
      )}

      {mode === "preview" && previewUrl && (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Captured preview" className="w-full rounded-[10px] aspect-square object-cover" />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1 justify-center" onClick={retake} disabled={uploading}>
              <RotateCcw size={14} /> Retake
            </Button>
            <Button className="flex-1 justify-center" onClick={handleUseCaptured} disabled={uploading}>
              <Check size={14} /> {uploading ? "Uploading..." : "Use this photo"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
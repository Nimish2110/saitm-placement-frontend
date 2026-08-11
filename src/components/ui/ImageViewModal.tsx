"use client";

import { Modal } from "@/components/ui/Modal";

export function ImageViewModal({
  open,
  onClose,
  src,
  alt,
}: {
  open: boolean;
  onClose: () => void;
  src: string | null;
  alt: string;
}) {
  if (!src) return null;
  return (
    <Modal open={open} onClose={onClose} title="Profile Photo" width={420}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full rounded-[10px] object-cover" />
    </Modal>
  );
}
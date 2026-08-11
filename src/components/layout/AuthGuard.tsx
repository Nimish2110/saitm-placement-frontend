"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthGuard({
  isAuthed,
  redirectTo,
  children,
}: {
  isAuthed: () => boolean;
  redirectTo: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      router.replace(redirectTo);
    } else {
      setChecked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface-2">
        <div className="text-sm text-muted">Checking session…</div>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { studentAuth } from "@/lib/auth";
import { ApiRequestError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await studentAuth.login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiRequestError ? String(err.body.detail || "Login failed") : "Could not reach the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Student Login</h1>
      <p className="text-[13px] text-muted mb-6">Sign in with your college email and password</p>

      <form onSubmit={handleLogin} autoComplete="off">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">College email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@saitm.ac.in"
              autoComplete="off"
              className="w-full h-11 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full h-11 px-3.5 rounded-[10px] border border-border text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        {error && <p className="text-xs text-danger mt-3">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full justify-center h-11 mt-5">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted mt-6">
        Haven&apos;t received your registration link? <Link href="/register" className="text-primary font-semibold">Learn more</Link>
      </p>
    </div>
  );
}
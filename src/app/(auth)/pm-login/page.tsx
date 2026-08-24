"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { pmAuth } from "@/lib/auth";
import { ApiRequestError } from "@/lib/api";
import { ShieldCheck } from "lucide-react";

export default function PMLoginPage() {
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
      await pmAuth.login(email, password);
      router.push("/pm/students");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.body.detail || "Login failed" : "Could not reach the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck size={18} className="text-primary" />
        <h1 className="text-xl font-bold">Placement Manager Login</h1>
      </div>
      <p className="text-[13px] text-muted mb-6">Sign in with your PM email and password</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-2 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="placementmanager@saitm.ac.in"
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
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full justify-center h-11">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted mt-6">
        New Placement Manager? <Link href="/pm-register" className="text-primary font-semibold">Register</Link>
      </p>
    </div>
  );
}
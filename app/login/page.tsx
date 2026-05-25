"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { resolvePostLoginRedirect } from "@/lib/auth/post-login-redirect";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, isLoading, user, isAdmin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password, nextPath ?? undefined);
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && isAdmin) {
    const destination = resolvePostLoginRedirect(nextPath);
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <p className="text-sm text-slate-600">
          Already signed in as {user.email}.{" "}
          <a href={destination} className="font-medium text-violet-600 hover:underline">
            Go to admin
          </a>
        </p>
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-600">
            Signed in as {user.email} ({user.role}). This account cannot access the admin portal.
          </p>
          <a
            href="/access-denied"
            className="mt-4 inline-block text-sm font-medium text-violet-600 hover:underline"
          >
            View access details
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 to-slate-100 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-lg">
        <div className="space-y-6 p-8">
          <div className="text-center">
            <div className="mb-3 flex justify-center">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-violet-600 text-white">
                <Lock className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Auryn Admin</h1>
            <p className="mt-2 text-sm text-slate-600">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="auryn@gmail.com"
                autoComplete="email"
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full gap-2 bg-violet-600 py-2 hover:bg-violet-700"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">First-time setup</p>
            <p className="mt-1">
              Run <code className="rounded bg-slate-200 px-1">npm run db:seed</code> after migrate.
              Default: auryn@gmail.com (override with ADMIN_EMAIL / ADMIN_PASSWORD in .env).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

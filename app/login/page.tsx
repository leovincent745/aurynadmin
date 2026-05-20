"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      login(email, password);
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600 mx-auto"></div>
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 to-slate-100 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-lg">
        <div className="space-y-6 p-8">
          {/* Header */}
          <div className="text-center">
            <div className="mb-3 flex justify-center">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-violet-600 text-white">
                <Lock className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Auryn Admin
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to your admin account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@auryn.com"
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Password Input */}
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
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2 bg-violet-600 py-2 hover:bg-violet-700"
            >
              Sign In
            </Button>
          </form>

          {/* Demo Info */}
          <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
            <p className="font-semibold">Login Credentials:</p>
            <p className="mt-1">Email: auryn@gmail.com</p>
            <p>Password: 1234567890</p>
          </div>
        </div>
      </div>
    </div>
  );
}

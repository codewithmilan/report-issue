"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, ArrowLeft, ShieldAlert, Lock, Mail, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const result = await login(email, password);

    if (!result.success) {
      setIsLoading(false);
      setErrorMsg(result.error || "Invalid email or password.");
      toast.error(result.error || "Login failed");
      return;
    }

    toast.success("Welcome back, " + (result.user?.name || "User") + "!");

    // Route based on role
    if (result.user?.role === "admin") {
      router.push(redirectUrl && redirectUrl.startsWith("/admin") ? redirectUrl : "/admin/dashboard");
    } else {
      router.push(redirectUrl && redirectUrl.startsWith("/user") ? redirectUrl : "/user/dashboard");
    }
  };

  const handleFillDemo = (type: "admin" | "citizen") => {
    if (type === "admin") {
      setEmail("admin@civicreport.com");
      setPassword("admin123");
    } else {
      setEmail("citizen@community.org");
      setPassword("citizen123");
    }
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">CivicReport</h1>
                <p className="text-xs font-semibold text-blue-600">Enterprise Civic Portal</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border border-slate-200/80 shadow-xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5 text-center">
              <CardTitle className="text-xl font-bold text-slate-900">Sign In to Your Account</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Secure Role-Based Access Control (Admin &amp; Citizen)
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              {errorMsg && (
                <div className="mb-5 p-3.5 text-xs rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 leading-relaxed">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-10 rounded-xl border-slate-200 focus-visible:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 h-10 rounded-xl border-slate-200 focus-visible:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 mt-2 transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Demo Credentials Quick Fill */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Demo Credentials
                  </span>
                  <span className="text-[10px] text-slate-400">Click to autofill</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillDemo("citizen")}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-300 transition text-left text-xs"
                  >
                    <p className="font-semibold text-slate-800">Citizen User</p>
                    <p className="text-[11px] text-slate-500 truncate">citizen@community.org</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo("admin")}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-300 transition text-left text-xs"
                  >
                    <p className="font-semibold text-slate-800">Admin Staff</p>
                    <p className="text-[11px] text-slate-500 truncate">admin@civicreport.com</p>
                  </button>
                </div>
              </div>

              {/* Signup Redirect */}
              <div className="mt-6 text-center text-xs text-slate-500">
                Don&apos;t have an account yet?{" "}
                <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4">
                  Create Account
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

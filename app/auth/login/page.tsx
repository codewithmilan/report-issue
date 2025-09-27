"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (error) {
      alert(error.message);
    } else {
      router.push(role === "admin" ? "/admin" : "/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center justify-center gap-3 mb-4 mt-4">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gray-900">CivicReport</h1>
                <p className="text-sm text-gray-600">Community Issue Reporting</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border border-gray-200 shadow-md rounded-xl overflow-hidden">
            <CardHeader className="bg-white py-4">
              <CardTitle className="text-2xl text-center text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-center text-gray-500">
                Sign in to your account to report and track civic issues
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 bg-white">
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Role Selector */}
                <div className="grid gap-2">
                  <Label htmlFor="role">Select Role</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="mt-4 text-center text-sm text-gray-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
                  >
                    Create one here
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

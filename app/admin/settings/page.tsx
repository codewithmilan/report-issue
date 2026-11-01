"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShieldCheck, Database, Key, Server, Lock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    router.push("/login?redirect=/admin/settings");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl gap-1 text-xs">
              <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
            </Button>
          </Link>
          <h1 className="text-sm font-bold text-white">System &amp; Security Settings</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 pt-8 max-w-4xl space-y-6">
        {/* Security Overview */}
        <Card className="border border-slate-200/90 shadow-xs rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Security Architecture &amp; RBAC</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Role-Based Access Control and Authentication Policy
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-600" /> Password Encryption
                  </span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    bcrypt 10 rounds
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  All citizen and staff passwords are cryptographically salted and hashed. Plaintext passwords are never saved.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" /> JWT Token Session
                  </span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    httpOnly &amp; SameSite
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Signed JSON Web Tokens issued in secure httpOnly cookies to prevent XSS credential theft.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" /> Database &amp; Fallback
                  </span>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                    MongoDB / Mongoose
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Mongoose schemas with ObjectId references, with transparent embedded local fallback ensuring zero service interruption.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-600" /> IDOR &amp; API Guard
                  </span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    Strict Server Checks
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Backend API verification blocks privilege escalation, role manipulation, and unauthorized cross-tenant data access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


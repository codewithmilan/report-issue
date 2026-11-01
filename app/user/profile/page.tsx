"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function UserProfilePage() {
  const router = useRouter();
  const { user, loading, refreshProfile } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/user/profile");
      return;
    }
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
    }
  }, [user, loading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/v1/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, avatar }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully!");
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/60 pb-16">
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/user/dashboard">
            <Button variant="ghost" size="sm" className="rounded-xl gap-1 text-slate-600">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-sm font-bold text-slate-900">User Profile Settings</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 pt-8 max-w-2xl space-y-6">
        <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/60 border-b border-slate-100 p-6 flex flex-row items-center gap-4">
            <img
              src={
                avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "Citizen")}`
              }
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
            />
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">{name}</CardTitle>
              <CardDescription className="text-xs text-slate-500">{user.email}</CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3 mr-1" /> {user.status}
                </Badge>
                <Badge variant="outline" className="text-[10px] capitalize text-slate-600">
                  {user.role} Account
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-9 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email Address (Verified)
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="pl-9 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Email is linked to your login credentials.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                  Contact Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="pl-9 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="avatar" className="text-xs font-semibold text-slate-700">
                  Profile Photo URL
                </Label>
                <Input
                  id="avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="rounded-xl text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Account Created: {formatDate(user.createdAt)}
                </div>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> Save Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


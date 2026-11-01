"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, AuthUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MapPin,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  LogOut,
  Edit3,
  Activity,
  History,
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  priority: "low" | "medium" | "high" | "urgent";
  location?: string;
  imageUrl?: string;
  adminRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface ActivityLog {
  _id: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const { user, loading, logout, refreshProfile } = useAuth();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Edit profile modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Time-based greeting (5am-11:59am Good Morning, 12pm-4:59pm Good Afternoon, 5pm-8:59pm Good Evening, 9pm-4:59am Good Night)
  const getGreeting = (name: string) => {
    const hour = new Date().getHours();
    let timeGreeting = "Good Day";
    if (hour >= 5 && hour < 12) {
      timeGreeting = "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      timeGreeting = "Good Evening";
    } else {
      timeGreeting = "Good Night";
    }
    return `${timeGreeting}, ${name || "Citizen"}!`;
  };

  const loadUserData = async () => {
    setDataLoading(true);
    try {
      // 1. Fetch user's own issues
      const issuesRes = await fetch("/api/v1/issues/my-issues");
      if (issuesRes.ok) {
        const issuesData = await issuesRes.json();
        setIssues(issuesData.issues || []);
      }

      // 2. Fetch user's own activity logs
      const logsRes = await fetch("/api/v1/activity-logs");
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setActivities(logsData.logs || []);
      }
    } catch (err) {
      console.error("Failed to load user dashboard data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/user/dashboard");
      return;
    }

    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || "");
      setEditAvatar(user.avatar || "");
      loadUserData();
    }
  }, [user, loading, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await fetch("/api/v1/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          avatar: editAvatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully!");
      setIsEditOpen(false);
      await refreshProfile();
      await loadUserData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Metrics
  const totalIssues = issues.length;
  const pendingCount = issues.filter((i) => i.status === "pending").length;
  const inProgressCount = issues.filter((i) => i.status === "in_progress").length;
  const resolvedCount = issues.filter((i) => i.status === "resolved").length;
  const rejectedCount = issues.filter((i) => i.status === "rejected").length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 gap-1 font-medium">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 gap-1 font-medium">
            <AlertTriangle className="w-3 h-3" /> In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300 gap-1 font-medium">
            <XCircle className="w-3 h-3" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading || (!user && dataLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-600">Loading your citizen dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/60 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 leading-none block">CivicReport</span>
                <span className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase">Citizen Portal</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/report">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm rounded-xl text-xs font-semibold gap-1.5">
                <Plus className="w-4 h-4" /> Report New Issue
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="rounded-xl text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 pt-6 space-y-6 max-w-6xl">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-white/90">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Personal Citizen Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting(user?.name || "Citizen")}
            </h1>
            <p className="text-sm text-blue-100 max-w-xl">
              Track your reported community issues, monitor city response progress, and update your citizen profile.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-2.5">
            <Link href="/report">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-md rounded-xl text-xs h-10 px-4">
                <Plus className="w-4 h-4 mr-1.5" /> Submit Issue
              </Button>
            </Link>
            <Link href="/user/issues">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-xl text-xs h-10 px-4">
                View All My Issues
              </Button>
            </Link>
          </div>
        </div>

        {/* User Profile Card & Quick Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Details */}
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" /> User Profile
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">Your verified citizen details</CardDescription>
              </div>
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Profile Information</DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Update your display name, contact phone, or profile photo URL.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-name" className="text-xs font-semibold">Full Name</Label>
                      <Input
                        id="edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-phone" className="text-xs font-semibold">Phone Number</Label>
                      <Input
                        id="edit-phone"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-avatar" className="text-xs font-semibold">Profile Photo URL</Label>
                      <Input
                        id="edit-avatar"
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="rounded-xl text-sm"
                      />
                    </div>
                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditOpen(false)}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSavingProfile}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                      >
                        {isSavingProfile ? "Saving..." : "Save Changes"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "Citizen")}`
                  }
                  alt={user?.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 truncate">{user?.name}</h3>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" /> {user?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold px-2 py-0.5">
                      <ShieldCheck className="w-3 h-3 mr-1" /> {user?.status === "active" ? "Active Account" : user?.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] capitalize text-slate-600">
                      {user?.role} Role
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
                  </span>
                  <span className="font-semibold text-slate-800">{user?.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member Since
                  </span>
                  <span className="font-semibold text-slate-800">{formatDate(user?.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Last Login
                  </span>
                  <span className="font-semibold text-slate-800">{formatDate(user?.lastLogin)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">User ID</span>
                  <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {user?._id?.slice(-8) || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics Breakdown */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Total Reports</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {totalIssues}
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900">{totalIssues}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Community submissions</p>
              </div>
            </Card>

            <Card className="border border-amber-200/80 shadow-xs rounded-2xl bg-amber-50/40 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-xs font-semibold">Pending Review</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-amber-900">{pendingCount}</div>
                <p className="text-[11px] text-amber-700 mt-0.5">Awaiting city dispatch</p>
              </div>
            </Card>

            <Card className="border border-blue-200/80 shadow-xs rounded-2xl bg-blue-50/40 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-700">
                <span className="text-xs font-semibold">In Progress</span>
                <AlertTriangle className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-blue-900">{inProgressCount}</div>
                <p className="text-[11px] text-blue-700 mt-0.5">Work crew assigned</p>
              </div>
            </Card>

            <Card className="border border-emerald-200/80 shadow-xs rounded-2xl bg-emerald-50/40 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-xs font-semibold">Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-emerald-900">{resolvedCount}</div>
                <p className="text-[11px] text-emerald-700 mt-0.5">Fixed & closed</p>
              </div>
            </Card>

            {/* Banner card across bottom */}
            <div className="col-span-2 sm:col-span-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Resolution Rate</h4>
                  <p className="text-[11px] text-slate-300">
                    {totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0}% of your reported civic issues have been successfully resolved.
                  </p>
                </div>
              </div>
              <Link href="/issues">
                <Button size="sm" variant="ghost" className="text-xs text-white hover:bg-white/10 rounded-xl">
                  Public Feed <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recently Reported Issues Section */}
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
          <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Recently Reported Issues</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Status and municipal response updates on your submissions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadUserData}
                className="h-8 rounded-lg text-xs font-medium text-slate-600"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh
              </Button>
              <Link href="/user/issues">
                <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold">
                  View All ({totalIssues})
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {issues.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No issues reported yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Notice a pothole, broken streetlight, or water leak in your neighborhood? Submit your first report now.
                </p>
                <Link href="/report">
                  <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Report an Issue
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {issues.slice(0, 5).map((issue) => (
                  <div
                    key={issue._id}
                    className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {issue.title}
                        </span>
                        {getStatusBadge(issue.status)}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{issue.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="font-semibold text-slate-600">{issue.category}</span>
                        {issue.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {issue.location}
                          </span>
                        )}
                        <span>Reported on {formatDate(issue.createdAt)}</span>
                      </div>
                      {issue.adminRemarks && (
                        <div className="mt-2 p-2 rounded-lg bg-blue-50/80 border border-blue-100 text-[11px] text-blue-900 flex items-start gap-1.5">
                          <span className="font-semibold shrink-0">City Update:</span>
                          <span>{issue.adminRemarks}</span>
                        </div>
                      )}
                    </div>

                    <Link href={`/issues/${issue._id}`}>
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 shrink-0">
                        View Details <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Activity & Login History Timeline */}
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
          <CardHeader className="p-5 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" /> User Activity &amp; Login History
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Audit log of your account sign-ins, issue reports, and profile changes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent account activity logged.</p>
            ) : (
              <div className="relative border-l border-slate-200 ml-3 space-y-4 pl-4">
                {activities.slice(0, 8).map((act) => (
                  <div key={act._id} className="relative group">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{act.action.replace(/_/g, " ")}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(act.createdAt)}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{act.description}</p>
                      {act.ipAddress && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          IP: {act.ipAddress}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


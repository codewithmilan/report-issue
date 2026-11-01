"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  MapPin,
  Settings,
  LogOut,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Activity,
  UserCheck,
  UserX,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  BarChart3,
  Loader2,
  Eye,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  totalIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  rejectedIssues: number;
  issuesToday: number;
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  phone?: string;
  avatar?: string;
  status: "active" | "inactive" | "suspended";
  lastLogin?: string;
  createdAt: string;
}

interface IssueItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  imageUrl?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  priority: "low" | "medium" | "high" | "urgent";
  adminRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface ActivityLogItem {
  _id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [issuesList, setIssuesList] = useState<IssueItem[]>([]);
  const [logsList, setLogsList] = useState<ActivityLogItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [issueSearch, setIssueSearch] = useState("");
  const [issueStatusFilter, setIssueStatusFilter] = useState("all");

  // Status update modal state
  const [selectedIssue, setSelectedIssue] = useState<IssueItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>("pending");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // User detail modal state
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedUserActivities, setSelectedUserActivities] = useState<ActivityLogItem[]>([]);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);

  // Greeting
  const getAdminGreeting = (name: string) => {
    const hour = new Date().getHours();
    let timeGreeting = "Good Day";
    if (hour >= 5 && hour < 12) timeGreeting = "Good Morning";
    else if (hour >= 12 && hour < 17) timeGreeting = "Good Afternoon";
    else if (hour >= 17 && hour < 21) timeGreeting = "Good Evening";
    else timeGreeting = "Good Night";
    return `${timeGreeting}, Admin ${name || "Administrator"}!`;
  };

  const loadAllAdminData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [statsRes, usersRes, issuesRes, logsRes] = await Promise.all([
        fetch("/api/v1/analytics"),
        fetch("/api/v1/users"),
        fetch("/api/v1/issues"),
        fetch("/api/v1/activity-logs?limit=50"),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsersList(d.users || []);
      }
      if (issuesRes.ok) {
        const d = await issuesRes.json();
        setIssuesList(d.issues || []);
      }
      if (logsRes.ok) {
        const d = await logsRes.json();
        setLogsList(d.logs || []);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
      toast.error("Failed to load live administration data");
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/admin/dashboard");
        return;
      }
      if (user.role !== "admin") {
        toast.error("Access denied. Administrator privileges required.");
        router.push("/user/dashboard");
        return;
      }
      loadAllAdminData();
    }
  }, [user, loading, router, loadAllAdminData]);

  // Handle status update
  const handleOpenStatusModal = (issue: IssueItem) => {
    setSelectedIssue(issue);
    setNewStatus(issue.status);
    setAdminRemarks(issue.adminRemarks || "");
  };

  const handleSaveIssueStatus = async () => {
    if (!selectedIssue) return;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/v1/issues/${selectedIssue._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update issue status");
        return;
      }

      toast.success("Issue status updated successfully!");
      setSelectedIssue(null);
      await loadAllAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle User Status toggle (Active, Inactive, Suspended)
  const handleUpdateUserStatus = async (userId: string, newStatusVal: "active" | "inactive" | "suspended") => {
    try {
      const res = await fetch(`/api/v1/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatusVal }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update user status");
        return;
      }

      toast.success(`User status changed to ${newStatusVal.toUpperCase()}`);
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatusVal });
      }
      await loadAllAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    }
  };

  // View user details
  const handleViewUser = async (u: UserItem) => {
    setSelectedUser(u);
    setIsLoadingUserDetail(true);
    try {
      const res = await fetch(`/api/v1/users/${u._id}`);
      if (res.ok) {
        const d = await res.json();
        setSelectedUserActivities(d.activityHistory || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingUserDetail(false);
    }
  };

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
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 font-semibold gap-1 text-[11px]">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 font-semibold gap-1 text-[11px]">
            <AlertTriangle className="w-3 h-3" /> In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold gap-1 text-[11px]">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300 font-semibold gap-1 text-[11px]">
            <XCircle className="w-3 h-3" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-[10px]">
            Active
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-semibold text-[10px]">
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-semibold text-[10px]">
            Inactive
          </Badge>
        );
    }
  };

  if (loading || !user || (isLoadingData && !stats)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-700">Verifying Admin session &amp; loading command center...</p>
      </div>
    );
  }

  // Filtered lists
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesStatus = userStatusFilter === "all" || u.status === userStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredIssues = issuesList.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(issueSearch.toLowerCase()) ||
      i.description.toLowerCase().includes(issueSearch.toLowerCase()) ||
      i.userName.toLowerCase().includes(issueSearch.toLowerCase()) ||
      i.userEmail.toLowerCase().includes(issueSearch.toLowerCase());
    const matchesStatus = issueStatusFilter === "all" || i.status === issueStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-white leading-none block">CivicReport</span>
                <span className="text-[10px] font-semibold text-indigo-400 tracking-wider uppercase">Municipal Admin Center</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadAllAdminData}
              className="text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl h-8 gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
            </Button>
            <Link href="/admin/settings">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl h-8 gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" /> Settings
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-xs font-semibold text-rose-300 border-rose-900/60 bg-rose-950/40 hover:bg-rose-900/60 hover:text-white rounded-xl h-8 gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 pt-6 space-y-6 max-w-7xl">
        {/* Admin Welcome Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-300">
              <ShieldCheck className="w-3.5 h-3.5" /> Authorized Administrator Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {getAdminGreeting(user.name)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Complete municipal control panel: dispatch civic reports, manage citizen user records, review platform analytics, and audit security events.
            </p>
          </div>

          <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3 shrink-0">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-12 h-12 rounded-xl object-cover border border-white/20"
            />
            <div className="text-xs">
              <p className="font-bold text-white">{user.name}</p>
              <p className="text-slate-400 text-[11px]">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                Full Security Access
              </span>
            </div>
          </div>
        </div>

        {/* 10 Dashboard Statistics Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <Card className="border border-slate-200/90 shadow-xs rounded-2xl bg-white p-3.5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Users</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats?.totalUsers ?? 0}</div>
            <span className="text-[10px] text-slate-400 mt-1 block">Registered in DB</span>
          </Card>

          <Card className="border border-emerald-200/90 shadow-xs rounded-2xl bg-emerald-50/30 p-3.5">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
              <span>Active Users</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-2">{stats?.activeUsers ?? 0}</div>
            <span className="text-[10px] text-emerald-700 mt-1 block">Good standing</span>
          </Card>

          <Card className="border border-rose-200/90 shadow-xs rounded-2xl bg-rose-50/30 p-3.5">
            <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
              <span>Inactive / Suspended</span>
              <UserX className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-900 mt-2">{stats?.inactiveUsers ?? 0}</div>
            <span className="text-[10px] text-rose-700 mt-1 block">({stats?.suspendedUsers ?? 0} suspended)</span>
          </Card>

          <Card className="border border-indigo-200/90 shadow-xs rounded-2xl bg-indigo-50/30 p-3.5">
            <div className="flex items-center justify-between text-indigo-800 text-xs font-semibold">
              <span>New Users Today</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-900 mt-2">{stats?.newUsersToday ?? 0}</div>
            <span className="text-[10px] text-indigo-700 mt-1 block">Joined in last 24h</span>
          </Card>

          <Card className="border border-purple-200/90 shadow-xs rounded-2xl bg-purple-50/30 p-3.5">
            <div className="flex items-center justify-between text-purple-800 text-xs font-semibold">
              <span>Total Issues</span>
              <Activity className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-900 mt-2">{stats?.totalIssues ?? 0}</div>
            <span className="text-[10px] text-purple-700 mt-1 block">All-time submissions</span>
          </Card>

          <Card className="border border-amber-200/90 shadow-xs rounded-2xl bg-amber-50/30 p-3.5">
            <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
              <span>Pending Review</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-900 mt-2">{stats?.pendingIssues ?? 0}</div>
            <span className="text-[10px] text-amber-700 mt-1 block">Action required</span>
          </Card>

          <Card className="border border-blue-200/90 shadow-xs rounded-2xl bg-blue-50/30 p-3.5">
            <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
              <span>In Progress</span>
              <AlertTriangle className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-900 mt-2">{stats?.inProgressIssues ?? 0}</div>
            <span className="text-[10px] text-blue-700 mt-1 block">Crew dispatched</span>
          </Card>

          <Card className="border border-emerald-200/90 shadow-xs rounded-2xl bg-emerald-50/30 p-3.5">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
              <span>Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-2">{stats?.resolvedIssues ?? 0}</div>
            <span className="text-[10px] text-emerald-700 mt-1 block">Completed &amp; verified</span>
          </Card>

          <Card className="border border-rose-200/90 shadow-xs rounded-2xl bg-rose-50/30 p-3.5">
            <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
              <span>Rejected</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-900 mt-2">{stats?.rejectedIssues ?? 0}</div>
            <span className="text-[10px] text-rose-700 mt-1 block">Invalid / Duplicate</span>
          </Card>

          <Card className="border border-indigo-200/90 shadow-xs rounded-2xl bg-indigo-50/30 p-3.5">
            <div className="flex items-center justify-between text-indigo-800 text-xs font-semibold">
              <span>Issues Today</span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-900 mt-2">{stats?.issuesToday ?? 0}</div>
            <span className="text-[10px] text-indigo-700 mt-1 block">Submitted today</span>
          </Card>
        </div>

        {/* Admin Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl shadow-xs">
            <TabsTrigger value="overview" className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" /> Issue Management ({issuesList.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Users className="w-4 h-4" /> User Management ({usersList.length})
            </TabsTrigger>
            <TabsTrigger value="audit" className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Activity className="w-4 h-4" /> Activity &amp; Audit Logs ({logsList.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Issue Management */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="border border-slate-200 shadow-xs rounded-2xl bg-white overflow-hidden">
              <CardHeader className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">Reported Civic Issues</CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Review community complaints, update lifecycle progress, and attach municipal notes
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search title, street, citizen..."
                      value={issueSearch}
                      onChange={(e) => setIssueSearch(e.target.value)}
                      className="pl-9 h-9 rounded-xl text-xs"
                    />
                  </div>

                  <Select value={issueStatusFilter} onValueChange={setIssueStatusFilter}>
                    <SelectTrigger className="w-36 h-9 rounded-xl text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Issue Details</th>
                        <th className="py-3 px-4">Reporting Citizen</th>
                        <th className="py-3 px-4">Location &amp; GPS</th>
                        <th className="py-3 px-4">Reported At</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredIssues.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No issues match the selected criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredIssues.map((issue) => (
                          <tr key={issue._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4 max-w-xs">
                              <p className="font-bold text-slate-900 truncate">{issue.title}</p>
                              <p className="text-slate-500 text-[11px] line-clamp-1">{issue.description}</p>
                              <span className="inline-block mt-1 bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                                {issue.category}
                              </span>
                              {issue.adminRemarks && (
                                <p className="mt-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                                  Note: {issue.adminRemarks}
                                </p>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    issue.userAvatar ||
                                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(issue.userName)}`
                                  }
                                  alt={issue.userName}
                                  className="w-7 h-7 rounded-full object-cover border"
                                />
                                <div>
                                  <p className="font-semibold text-slate-800">{issue.userName}</p>
                                  <p className="text-[10px] text-slate-400">{issue.userEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              <p className="flex items-center gap-1 font-medium">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                {issue.location || "Not specified"}
                              </p>
                              {issue.latitude !== null && issue.longitude !== null && (
                                <p className="text-[10px] text-slate-400 font-mono pl-4">
                                  {issue.latitude?.toFixed(4)}, {issue.longitude?.toFixed(4)}
                                </p>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                              {formatDate(issue.createdAt)}
                            </td>
                            <td className="py-3.5 px-4">
                              {getStatusBadge(issue.status)}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenStatusModal(issue)}
                                className="h-7 text-xs rounded-lg font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                              >
                                Update Status
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: User Management */}
          <TabsContent value="users" className="space-y-4">
            <Card className="border border-slate-200 shadow-xs rounded-2xl bg-white overflow-hidden">
              <CardHeader className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">User Management Directory</CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Audit registered citizen profiles, review activity histories, and manage status
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 h-9 rounded-xl text-xs"
                    />
                  </div>

                  <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                    <SelectTrigger className="w-36 h-9 rounded-xl text-xs">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="suspended">Suspended Only</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Contact Phone</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Registered Date</th>
                        <th className="py-3 px-4">Last Login</th>
                        <th className="py-3 px-4 text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No users match the search filters.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={
                                    u.avatar ||
                                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`
                                  }
                                  alt={u.name}
                                  className="w-8 h-8 rounded-full object-cover border"
                                />
                                <div>
                                  <p className="font-bold text-slate-900">{u.name}</p>
                                  <p className="text-[11px] text-slate-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {u.phone || "—"}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge variant="outline" className="capitalize text-[10px] font-semibold">
                                {u.role}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4">
                              {getUserStatusBadge(u.status)}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                              {formatDate(u.createdAt)}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                              {formatDate(u.lastLogin)}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewUser(u)}
                                className="h-7 text-xs rounded-lg font-semibold text-slate-600 hover:text-slate-900"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> View
                              </Button>

                              {u.status !== "active" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateUserStatus(u._id, "active")}
                                  className="h-7 text-xs rounded-lg font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                >
                                  Activate
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateUserStatus(u._id, "suspended")}
                                  className="h-7 text-xs rounded-lg font-semibold text-rose-700 border-rose-200 hover:bg-rose-50"
                                >
                                  Suspend
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Activity & Audit Logs */}
          <TabsContent value="audit" className="space-y-4">
            <Card className="border border-slate-200 shadow-xs rounded-2xl bg-white overflow-hidden">
              <CardHeader className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">Application-Wide Audit Trail</CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Real-time security logs: logins, failed authentications, report creations, and administrative updates
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Event Type</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">IP Address</th>
                        <th className="py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            No activity logs found.
                          </td>
                        </tr>
                      ) : (
                        logsList.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="font-mono text-[10px] font-semibold uppercase">
                                {log.action}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-slate-700 font-medium">{log.description}</td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-800">{log.userName || "System"}</span>
                              {log.userEmail && <span className="text-[10px] text-slate-400 block">{log.userEmail}</span>}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.ipAddress || "127.0.0.1"}</td>
                            <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">{formatDate(log.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAL: Update Issue Status & Admin Remarks */}
      <Dialog open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Update Civic Issue Status</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Change the operational lifecycle stage and attach official city notes.
            </DialogDescription>
          </DialogHeader>

          {selectedIssue && (
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-800">{selectedIssue.title}</p>
                <p className="text-slate-500 text-[11px]">Reported by {selectedIssue.userName} ({selectedIssue.userEmail})</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Lifecycle Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="rounded-xl text-sm">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending (Awaiting review)</SelectItem>
                    <SelectItem value="in_progress">In Progress (Crew dispatched)</SelectItem>
                    <SelectItem value="resolved">Resolved (Problem fixed)</SelectItem>
                    <SelectItem value="rejected">Rejected (Invalid or out of scope)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Official Admin Remarks / Resolution Notes</Label>
                <Textarea
                  rows={3}
                  placeholder="e.g. Assigned to Road Crew #4. Work scheduled for Tuesday morning."
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  className="rounded-xl text-sm resize-none"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedIssue(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={handleSaveIssueStatus}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                >
                  {isUpdatingStatus ? "Updating..." : "Save Status"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: View User Profile & Activity */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-xl rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile &amp; Activity Audit</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Detailed citizen account inspection and historical event timeline
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-5 pt-2">
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <img
                  src={
                    selectedUser.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedUser.name)}`
                  }
                  alt={selectedUser.name}
                  className="w-14 h-14 rounded-2xl object-cover border"
                />
                <div className="flex-1">
                  <h4 className="text-base font-bold text-slate-900">{selectedUser.name}</h4>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {getUserStatusBadge(selectedUser.status)}
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {selectedUser.role} Role
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block text-[10px]">Contact Phone</span>
                  <span className="font-semibold text-slate-800">{selectedUser.phone || "Not provided"}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block text-[10px]">Account Created</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedUser.createdAt)}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block text-[10px]">Last Login</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedUser.lastLogin)}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-slate-400 block text-[10px]">Internal User ID</span>
                  <span className="font-mono text-[10px] text-slate-600 truncate block">{selectedUser._id}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Account Governance:</span>
                <div className="flex gap-2">
                  {selectedUser.status !== "active" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateUserStatus(selectedUser._id, "active")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 rounded-xl font-semibold"
                    >
                      Activate User
                    </Button>
                  )}
                  {selectedUser.status !== "suspended" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleUpdateUserStatus(selectedUser._id, "suspended")}
                      className="text-xs h-8 rounded-xl font-semibold"
                    >
                      Suspend User
                    </Button>
                  )}
                </div>
              </div>

              {/* User Activity History */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Recent User Events
                </h5>
                {isLoadingUserDetail ? (
                  <div className="py-6 text-center text-xs text-slate-400">Loading activity...</div>
                ) : selectedUserActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No recorded activity for this user.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedUserActivities.map((act) => (
                      <div key={act._id} className="p-2.5 rounded-lg border border-slate-100 text-xs bg-slate-50/50">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span className="font-bold text-slate-700">{act.action}</span>
                          <span>{formatDate(act.createdAt)}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{act.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

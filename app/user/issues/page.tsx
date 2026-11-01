"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";

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
}

export default function UserIssuesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/user/issues");
      return;
    }
    if (user) {
      fetch("/api/v1/issues/my-issues")
        .then((r) => r.json())
        .then((data) => {
          setIssues(data.issues || []);
        })
        .catch(console.error)
        .finally(() => setDataLoading(false));
    }
  }, [user, loading, router]);

  const filteredIssues = issues.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase()) ||
      (i.location && i.location.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading || dataLoading) {
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
          <h1 className="text-sm font-bold text-slate-900">My Reported Issues</h1>
          <Link href="/report">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs gap-1">
              <Plus className="w-3.5 h-3.5" /> Report Issue
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-6 max-w-4xl space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search my issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 rounded-xl text-xs h-9">
                <SelectValue placeholder="All Statuses" />
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
        </div>

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No issues found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== "all"
                ? "Try clearing your filters or search keywords."
                : "You have not submitted any civic issues yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <Card key={issue._id} className="border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{issue.title}</h3>
                      {getStatusBadge(issue.status)}
                    </div>
                    <span className="text-[11px] text-slate-400">{formatDate(issue.createdAt)}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{issue.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg text-[11px]">
                      {issue.category}
                    </span>
                    {issue.location && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {issue.location}
                      </span>
                    )}
                    <span className="text-[11px] capitalize">Priority: {issue.priority}</span>
                  </div>

                  {issue.adminRemarks && (
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-1">
                      <span className="font-bold text-[11px] text-blue-700 uppercase tracking-wider block">
                        City Administration Remarks:
                      </span>
                      <p>{issue.adminRemarks}</p>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Link href={`/issues/${issue._id}`}>
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-semibold text-blue-600 gap-1">
                        View Public Tracking <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


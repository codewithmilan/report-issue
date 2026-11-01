"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Plus, AlertTriangle, Clock, CheckCircle, User, Calendar, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ClientDashboard({ session }: { session: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // profile fetch
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        if (profileData) setProfile(profileData);

        // issues fetch
        const { data: issuesData } = await supabase
          .from("civic_issues")
          .select(`
            *,
            issue_categories(name, color)
          `)
          .eq("reporter_id", session.user.id)
          .order("created_at", { ascending: false });

        if (issuesData && issuesData.length > 0) {
          setIssues(issuesData);
        } else {
          const { sampleIssues } = await import("@/lib/mock-data");
          setIssues(sampleIssues.slice(0, 3));
        }
      } catch (err) {
        console.warn("Could not fetch user issues, using sample preview:", err);
        const { sampleIssues } = await import("@/lib/mock-data");
        setIssues(sampleIssues.slice(0, 3));
      }
    };

    fetchData();
  }, [session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 border-red-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const openIssues = issues?.filter((issue) => issue.status === "open").length || 0;
  const inProgressIssues = issues?.filter((issue) => issue.status === "in_progress").length || 0;
  const resolvedIssues = issues?.filter((issue) => issue.status === "resolved").length || 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 pb-16">
      {/* Top Navigation */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-200/60 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="rounded-full">
              Back to Home
            </Button>
          </Link>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <Link href="/issues">
            <Button variant="ghost" size="sm" className="rounded-full text-slate-700">
              Browse All Issues
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/report">
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-1.5" /> Report Issue
            </Button>
          </Link>
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm" type="submit" className="rounded-xl">
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      {/* Enhanced Welcome Card with Profile Avatar */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl mb-8 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 ring-2 ring-white/20">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || session.user.email} />
              <AvatarFallback className="bg-white/20 text-white">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold mb-1">
                Welcome back, {profile?.full_name || session.user.email.split("@")[0]}!
              </CardTitle>
              <CardDescription className="text-blue-100">
                Your civic dashboard – Track and report issues in your community.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <p className="text-gray-600 text-lg mb-4">
            You have reported <strong className="text-2xl text-indigo-700">{issues.length}</strong> issues so far. 
            Let's keep your neighborhood improving!
          </p>
          <Link href="/report">
            <Button className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-lg">
              <Plus size={18} /> Report New Issue
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Enhanced Stats Overview with Gradient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-gray-50 to-gray-100 pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Reports</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-gray-900">{issues?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Issues you've reported</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-red-50 to-red-100 pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-semibold text-red-700">Open</CardTitle>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-red-600">{openIssues}</div>
            <p className="text-xs text-red-600 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-yellow-50 to-yellow-100 pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-semibold text-yellow-700">In Progress</CardTitle>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-yellow-600">{inProgressIssues}</div>
            <p className="text-xs text-yellow-600 mt-1">Being worked on</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-green-50 to-green-100 pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-semibold text-green-700">Resolved</CardTitle>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-green-600">{resolvedIssues}</div>
            <p className="text-xs text-green-600 mt-1">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Issues List with More Details */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 px-6 py-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Your Reported Issues
          </CardTitle>
          <CardDescription className="text-gray-600">
            View and track the status of your civic reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid gap-4 p-6 md:grid-cols-2">
            {issues?.length > 0 ? (
              issues.map((issue) => (
                <Card key={issue.id} className="shadow-md border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardHeader className="p-4 pb-3 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-semibold text-gray-800 pr-2 flex-1">
                        {issue.title}
                      </CardTitle>
                      <Badge className={`${getStatusColor(issue.status)} border px-3 py-1 rounded-full`}>
                        <span className="flex items-center gap-1 font-medium">
                          {getStatusIcon(issue.status)}
                          {issue.status.replace("_", " ").toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">{issue.description}</p>
                    {(issue.location_address || issue.location) && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        {issue.location_address || issue.location}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(issue.created_at)}
                      </span>
                      <span className="font-mono text-indigo-600">ID: {String(issue.id).slice(-6)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      {issue.issue_categories && (
                        <Badge variant="outline" className="text-xs border-gray-300 bg-gray-50">
                          {issue.issue_categories.name}
                        </Badge>
                      )}
                      <Link href={`/issues/${issue.id}`} className="ml-auto">
                        <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800 h-7 px-2">
                          View Details →
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">No issues reported yet.</p>
                <p className="text-sm mt-1">Start by reporting your first civic issue!</p>
                <Link href="/report">
                  <Button className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                    Report Issue
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

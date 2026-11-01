import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  User,
  Share2,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { IssueRepo } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function IssueDetailPage({ params }: { params: { id: string } }) {
  const issue = await IssueRepo.findById(params.id);

  if (!issue) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-emerald-500 text-white";
      case "in_progress":
        return "bg-amber-500 text-white";
      case "rejected":
        return "bg-rose-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const getStatusStep = (status: string) => {
    if (status === "resolved") return 3;
    if (status === "in_progress") return 2;
    return 1;
  };

  const currentStep = getStatusStep(issue.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-16">
      {/* Top Bar */}
      <header className="border-b bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/issues">
            <Button variant="ghost" size="sm" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Issues
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/report">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl">
                Report Similar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 pt-8 max-w-5xl space-y-8">
        {/* Title Header Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/60">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className="text-xs uppercase px-3 py-1 font-bold rounded-full bg-blue-600 text-white">
              {issue.category || "Civic Issue"}
            </Badge>

            <Badge className={`text-xs uppercase px-3 py-1 font-semibold rounded-full ${getStatusColor(issue.status)}`}>
              Status: {issue.status.replace("_", " ")}
            </Badge>

            <Badge variant="outline" className="capitalize text-slate-700 font-medium text-xs px-3 py-1 rounded-full border-slate-300">
              Priority: {issue.priority || "Medium"}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            {issue.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-600 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-slate-800">{issue.location || "Location not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Reported by {issue.userName || "Community Citizen"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{new Date(issue.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>
        </div>

        {/* Progress Tracker Card */}
        <Card className="rounded-3xl shadow-lg border-slate-200/60 overflow-hidden bg-white/95">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-slate-900">Resolution Progress</CardTitle>
            <CardDescription>Track lifecycle from initial report to verified municipal completion</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-3 gap-2 text-center relative py-4">
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 shadow-md ${
                    currentStep >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-900">1. Reported</span>
                <span className="text-[11px] text-slate-500 hidden sm:block">Logged in municipal system</span>
              </div>

              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 shadow-md ${
                    currentStep >= 2 ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-900">2. In Progress</span>
                <span className="text-[11px] text-slate-500 hidden sm:block">Assigned to work crew</span>
              </div>

              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 shadow-md ${
                    currentStep >= 3 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-900">3. Resolved</span>
                <span className="text-[11px] text-slate-500 hidden sm:block">Repairs verified complete</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content & Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Description & Photo */}
          <div className="md:col-span-2 space-y-6">
            <Card className="rounded-3xl shadow-lg border-slate-200/60 overflow-hidden bg-white/95">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Issue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-slate-700 leading-relaxed text-base whitespace-pre-line">
                  {issue.description}
                </p>

                {issue.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                    <img
                      src={issue.imageUrl}
                      alt={issue.title}
                      className="w-full h-auto max-h-[460px] object-cover"
                    />
                    <div className="bg-slate-50 p-3 text-xs text-slate-500 border-t border-slate-200 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Attached photographic evidence verified with submission
                    </div>
                  </div>
                )}

                {issue.adminRemarks && (
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Official Municipal Note:
                    </h4>
                    <p className="text-sm font-medium leading-relaxed">{issue.adminRemarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Updates Log */}
            <Card className="rounded-3xl shadow-lg border-slate-200/60 overflow-hidden bg-white/95">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" /> Municipal Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                      CR
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">Civic Dispatch Registry</span>
                        <span className="text-xs text-slate-500">Automated</span>
                      </div>
                      <p className="text-sm text-slate-700">
                        Issue registered into the municipal system. Priority designated as &quot;{issue.priority || "medium"}&quot;.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions & Details */}
          <div className="space-y-6">
            {/* Location Map Pin Details */}
            <Card className="rounded-3xl shadow-lg border-slate-200/60 overflow-hidden bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" /> Location Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-200 h-44 flex flex-col items-center justify-center text-center p-4 border border-blue-200">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg mb-2">
                    <MapPin className="w-6 h-6 animate-bounce" />
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{issue.location || "Community Location"}</p>
                  {issue.latitude !== null && issue.longitude !== null && (
                    <p className="text-xs text-slate-600 mt-1 font-mono">
                      GPS: {issue.latitude?.toFixed(4)}, {issue.longitude?.toFixed(4)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/60 text-xs text-slate-500 space-y-2">
              <p className="font-semibold text-slate-700">Reporting another problem?</p>
              <p>Citizens can report any neighborhood infrastructure issue for prompt municipal action.</p>
              <Link href="/report" className="block pt-1">
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs">
                  Report New Issue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

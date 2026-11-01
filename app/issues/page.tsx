import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, AlertCircle, CheckCircle, Search, Filter, User, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { IssueRepo } from "@/lib/db";

export default async function IssuesPage() {
  const issues = await IssueRepo.getAll();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-16">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full">
                <ArrowLeft className="w-4 h-4 mr-1" /> Home
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Community Civic Issues</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link href="/report">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md rounded-xl text-sm font-semibold">
                <Plus className="w-4 h-4 mr-1.5" /> Report Issue
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm" className="rounded-xl">
                Citizen Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-8 space-y-6">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-md border border-slate-200/60 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-800">Public Community Feed</h2>
            <p className="text-xs text-slate-500">Live verified infrastructure reports from citizens across the city</p>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {issues.length} Issues Active
          </span>
        </div>

        {/* Issues Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <Card key={String(issue._id)} className="flex flex-col bg-white/95 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/70 overflow-hidden hover:-translate-y-1">
              {issue.imageUrl && (
                <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="secondary"
                      className="capitalize font-semibold shadow-md bg-white/90 backdrop-blur-md text-slate-800 text-[11px]"
                    >
                      {issue.priority || "medium"} priority
                    </Badge>
                  </div>
                </div>
              )}

              <CardContent className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-3">
                  <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50/50 text-blue-700 border-blue-200">
                    {issue.category || "General Civic"}
                  </Badge>

                  {issue.status === "resolved" ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle className="h-3.5 w-3.5" /> Resolved
                    </span>
                  ) : issue.status === "in_progress" ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <Clock className="h-3.5 w-3.5" /> In Progress
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      <AlertCircle className="h-3.5 w-3.5" /> Pending
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{issue.title}</h3>
                <p className="text-sm text-slate-600 flex-grow line-clamp-2 leading-relaxed mb-4">{issue.description}</p>

                <div className="space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{issue.location || "Community Location"}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Reported by {issue.userName || "Community Citizen"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    {new Date(issue.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <Link href={`/issues/${issue._id}`}>
                    <Button variant="default" size="sm" className="bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold px-4 transition-colors">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

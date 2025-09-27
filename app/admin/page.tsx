import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server"; // ✅ server client
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle, CheckCircle, Clock, TrendingUp, MapPin, Settings, LogOut, Eye, Calendar, User, Home } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient(); // server-side client

  // Auth check
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser  ();
  if (error || !user) redirect("/auth/login");

  // Check admin/staff
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single();
  if (!profile || !["admin", "staff"].includes(profile.user_type)) redirect("/");

  // Dashboard stats
  const [
    { count: totalIssues },
    { count: openIssues },
    { count: inProgressIssues },
    { count: resolvedIssues },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from("civic_issues").select("*", { count: "exact", head: true }),
    supabase.from("civic_issues").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("civic_issues").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase.from("civic_issues").select("*", { count: "exact", head: true }).eq("status", "resolved"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  // Recent issues
  const { data: recentIssues } = await supabase
    .from("civic_issues")
    .select(`*, issue_categories(name, color), profiles(full_name)`)
    .order("created_at", { ascending: false })
    .limit(5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-800 border-red-200 hover:bg-red-50";
      case "in_progress": return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50";
      case "resolved": return "bg-green-100 text-green-800 border-green-200 hover:bg-green-50";
      case "closed": return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-50";
      default: return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg";
      case "high": return "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg";
      case "medium": return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg";
      case "low": return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg";
      default: return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20px_30px,#0ea5e9,#0ea5e9)]"></div>
      </div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Home Icon - Clickable */}
            <Link href="/">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105">
                <Home className="w-6 h-6 text-white" />
              </div>
            </Link>
            <div className="w-12 h-12 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-sm text-slate-600 font-medium">Municipal Staff Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full shadow-md">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-700 font-semibold">Welcome, {user.email}</span>
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" className="border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all duration-300 shadow-sm hover:shadow-md">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-md overflow-hidden group">
            <CardHeader className="flex justify-between pb-3 bg-gradient-to-r from-slate-50 to-slate-100 group-hover:from-slate-100">
              <CardTitle className="text-lg font-bold text-slate-800">Total Issues</CardTitle>
              <div className="p-3 bg-slate-200/50 rounded-full group-hover:bg-slate-300 transition-colors">
                <AlertTriangle className="h-5 w-5 text-slate-700" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{totalIssues || 0}</div>
              <p className="text-sm text-slate-500 font-medium mt-2">All time</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-md overflow-hidden group">
            <CardHeader className="flex justify-between pb-3 bg-gradient-to-r from-red-50 to-red-100 group-hover:from-red-100">
              <CardTitle className="text-lg font-bold text-slate-800">Open Issues</CardTitle>
              <div className="p-3 bg-red-200/50 rounded-full group-hover:bg-red-300 transition-colors">
                <AlertTriangle className="h-5 w-5 text-red-700" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-extrabold text-red-600">{openIssues || 0}</div>
              <p className="text-sm text-slate-500 font-medium mt-2">Needs attention</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-md overflow-hidden group">
            <CardHeader className="flex justify-between pb-3 bg-gradient-to-r from-yellow-50 to-yellow-100 group-hover:from-yellow-100">
              <CardTitle className="text-lg font-bold text-slate-800">In Progress</CardTitle>
              <div className="p-3 bg-yellow-200/50 rounded-full group-hover:bg-yellow-300 transition-colors">
                <Clock className="h-5 w-5 text-yellow-700" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-extrabold text-yellow-600">{inProgressIssues || 0}</div>
              <p className="text-sm text-slate-500 font-medium mt-2">Being worked on</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-md overflow-hidden group">
            <CardHeader className="flex justify-between pb-3 bg-gradient-to-r from-green-50 to-green-100 group-hover:from-green-100">
              <CardTitle className="text-lg font-bold text-slate-800">Resolved</CardTitle>
              <div className="p-3 bg-green-200/50 rounded-full group-hover:bg-green-300 transition-colors">
                <CheckCircle className="h-5 w-5 text-green-700" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-extrabold text-green-600">{resolvedIssues || 0}</div>
              <p className="text-sm text-slate-500 font-medium mt-2">Completed</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-md overflow-hidden group">
            <CardHeader className="flex justify-between pb-3 bg-gradient-to-r from-blue-50 to-blue-100 group-hover:from-blue-100">
              <CardTitle className="text-lg font-bold text-slate-800">Active Users</CardTitle>
              <div className="p-3 bg-blue-200/50 rounded-full group-hover:bg-blue-300 transition-colors">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-extrabold text-blue-600">{totalUsers || 0}</div>
              <p className="text-sm text-slate-500 font-medium mt-2">Registered citizens</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Issues & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Issues */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
              <CardHeader className="flex justify-between items-center pb-6 bg-gradient-to-r from-slate-50 to-slate-100">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">Recent Issues</CardTitle>
                  <CardDescription className="text-slate-600 mt-1">Latest reported civic issues</CardDescription>
                </div>
                <Link href="/admin/issues">
                  <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-5">
                {recentIssues?.length ? (
                  recentIssues.map(issue => (
                    <div 
                      key={issue.id} 
                      className="flex gap-5 p-6 border border-slate-200/50 rounded-2xl hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-slate-50/50 hover:from-blue-50/30"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-slate-900 text-xl leading-tight pr-4">{issue.title}</h4>
                          {issue.priority && (
                            <Badge className={`${getPriorityColor(issue.priority)} px-3 py-1.5 text-sm font-semibold shadow-sm`}>
                              {issue.priority.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-base text-slate-600 mb-4 line-clamp-3">{issue.description}</p>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="truncate max-w-[250px] font-medium">{issue.location_address}</span>
                          </div>
                          {issue.profiles?.full_name && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-green-500" />
                              <span>by {issue.profiles.full_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <span>{new Date(issue.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 min-w-fit">
                        <Badge 
                          className={`${getStatusColor(issue.status)} px-4 py-2 text-sm font-semibold border shadow-sm hover:scale-105 transition-transform`} 
                          variant="secondary"
                        >
                          {formatStatus(issue.status)}
                        </Badge>
                        {issue.issue_categories && (
                          <Badge variant="outline" className="text-sm border-slate-300 bg-slate-50/50 px-3 py-1.5">
                            {issue.issue_categories.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                    <p className="text-lg font-medium">No recent issues found.</p>
                    <p className="text-sm mt-1">Start monitoring civic reports today!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md h-fit sticky top-8">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-xl font-bold text-slate-800">Quick Actions</CardTitle>
                <CardDescription className="text-slate-600">Admin shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <Link href="/admin/issues">
                  <Button variant="outline" className="w-full justify-start bg-gradient-to-r from-transparent to-blue-50/50 hover:from-blue-100 border-slate-200 transition-all duration-300 shadow-sm hover:shadow-md px-4 py-3">
                    <AlertTriangle className="w-5 h-5 mr-4 text-red-500" />
                    Manage Issues
                  </Button>
                </Link>
                {/* <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start bg-gradient-to-r from-transparent to-blue-50/50 hover:from-blue-100 border-slate-200 transition-all duration-300 shadow-sm hover:shadow-md px-4 py-3">
                    <Users className="w-5 h-5 mr-4 text-blue-500" />
                    User Management
                  </Button>
                </Link> */}
                {/* <Link href="/admin/categories">
                  <Button variant="outline" className="w-full justify-start bg-gradient-to-r from-transparent to-blue-50/50 hover:from-blue-100 border-slate-200 transition-all duration-300 shadow-sm hover:shadow-md px-4 py-3">
                    <Settings className="w-5 h-5 mr-4 text-purple-500" />
                    Categories
                  </Button>
                </Link> */}
                <Link href="/admin/analytics">
                  <Button variant="outline" className="w-full justify-start bg-gradient-to-r from-transparent to-blue-50/50 hover:from-blue-100 border-slate-200 transition-all duration-300 shadow-sm hover:shadow-md px-4 py-3">
                    <TrendingUp className="w-5 h-5 mr-4 text-green-500" />
                    Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

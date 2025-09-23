import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server"; // ✅ server client
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle, CheckCircle, Clock, TrendingUp, MapPin, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = createServerSupabaseClient(); // server-side client

  // Auth check
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
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
      case "open": return "bg-red-100 text-red-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-600">Municipal Staff Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Welcome, {user.email}</span>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIssues || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{openIssues || 0}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inProgressIssues || 0}</div>
              <p className="text-xs text-muted-foreground">Being worked on</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{resolvedIssues || 0}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered citizens</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Issues & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Issues */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex justify-between">
                <div>
                  <CardTitle>Recent Issues</CardTitle>
                  <CardDescription>Latest reported civic issues</CardDescription>
                </div>
                <Link href="/admin/issues">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentIssues?.map(issue => (
                  <div key={issue.id} className="flex justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{issue.title}</h4>
                      <p className="text-sm text-slate-600">{issue.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {issue.location_address}
                        {issue.profiles?.full_name && <span>by {issue.profiles.full_name}</span>}
                        <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(issue.status)} variant="secondary">
                        {issue.status.replace("_", " ")}
                      </Badge>
                      {issue.issue_categories && (
                        <Badge variant="outline" className="text-xs">{issue.issue_categories.name}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Admin shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/issues"><Button variant="outline" className="w-full justify-start bg-transparent"><AlertTriangle className="w-4 h-4 mr-2" />Manage Issues</Button></Link>
                <Link href="/admin/users"><Button variant="outline" className="w-full justify-start bg-transparent"><Users className="w-4 h-4 mr-2" />User Management</Button></Link>
                <Link href="/admin/categories"><Button variant="outline" className="w-full justify-start bg-transparent"><Settings className="w-4 h-4 mr-2" />Categories</Button></Link>
                <Link href="/admin/analytics"><Button variant="outline" className="w-full justify-start bg-transparent"><TrendingUp className="w-4 h-4 mr-2" />Analytics</Button></Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

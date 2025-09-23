import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  Settings,
} from "lucide-react"
import Link from "next/link"

export default async function AnalyticsPage() {
  const supabase = createServerSupabaseClient() // ✅ server-side client

  // Authentication & admin check
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.user_type)) redirect("/")

  // Fetch analytics data
  const [
    { data: issuesByStatusRaw },
    { data: issuesByCategoryRaw },
    { data: issuesByPriorityRaw },
    { data: monthlyTrendsRaw },
    { data: topReportersRaw },
    { data: avgResolutionTimeRaw },
  ] = await Promise.all([
    supabase.from("civic_issues").select("status"),
    supabase.from("civic_issues").select("issue_categories(name)"),
    supabase.from("civic_issues").select("priority"),
    supabase.from("civic_issues").select("created_at").gte("created_at", new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("civic_issues").select("reporter_id, profiles!civic_issues_reporter_id_fkey(full_name)"),
    supabase.from("civic_issues").select("created_at, updated_at").eq("status", "resolved"),
  ])

  // Process fetched data
  const issuesByStatus = issuesByStatusRaw?.reduce((acc: Record<string, number>, issue: any) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1
    return acc
  }, {}) || {}

  const issuesByCategory = issuesByCategoryRaw?.reduce((acc: Record<string, number>, issue: any) => {
    const name = issue.issue_categories?.name || "Other"
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {}) || {}

  const issuesByPriority = issuesByPriorityRaw?.reduce((acc: Record<string, number>, issue: any) => {
    acc[issue.priority] = (acc[issue.priority] || 0) + 1
    return acc
  }, {}) || {}

  const monthlyTrends = monthlyTrendsRaw?.reduce((acc: Record<string, number>, issue: any) => {
    const month = new Date(issue.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {}) || {}

  const topReporters = topReportersRaw?.reduce((acc: Record<string, number>, issue: any) => {
    const name = issue.profiles?.full_name || "Anonymous"
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {}) || {}

  const avgResolutionTime =
    avgResolutionTimeRaw && avgResolutionTimeRaw.length
      ? Math.round(
          avgResolutionTimeRaw.reduce((acc: number, issue: any) => {
            const created = new Date(issue.created_at)
            const resolved = new Date(issue.updated_at)
            return acc + Math.ceil((resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
          }, 0) / avgResolutionTimeRaw.length,
        )
      : 0

  // Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-500"
      case "in_progress":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  // JSX
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Analytics & Reports</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="30">
              <SelectTrigger className="w-32">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.values(issuesByStatus).reduce((a, b) => a + b, 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {issuesByStatus
                  ? Math.round((issuesByStatus.resolved || 0 / Object.values(issuesByStatus).reduce((a, b) => a + b, 0)) * 100)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgResolutionTime} days</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(topReporters).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" /> Issues by Status
              </CardTitle>
              <CardDescription>Current distribution of issue statuses</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(issuesByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${getStatusColor(status)}`} />
                    <span className="capitalize">{status.replace("_", " ")}</span>
                  </div>
                  <span>{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Issues by Priority
              </CardTitle>
              <CardDescription>Priority distribution of reported issues</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(issuesByPriority)
                .sort(([, a], [, b]) => b - a)
                .map(([priority, count]) => (
                  <div key={priority} className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${getPriorityColor(priority)}`} />
                      <span className="capitalize">{priority}</span>
                    </div>
                    <span>{count}</span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

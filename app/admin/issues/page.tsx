import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Filter, MapPin, Clock, User, AlertTriangle, CheckCircle, Settings } from "lucide-react"
import Link from "next/link"

export default async function AdminIssuesPage() {
  const supabase = createServerSupabaseClient() // ✅ server-side client

  // Check authentication and admin status
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()
  if (!profile || !["admin", "staff"].includes(profile.user_type)) redirect("/")

  // Fetch all issues
  const { data: issues } = await supabase
    .from("civic_issues")
    .select(`
      *,
      issue_categories(name, color),
      profiles!civic_issues_reporter_id_fkey(full_name),
      assigned_staff:profiles!civic_issues_assigned_to_fkey(full_name)
    `)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-800"
      case "in_progress": return "bg-yellow-100 text-yellow-800"
      case "resolved": return "bg-green-100 text-green-800"
      case "closed": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500"
      case "high": return "bg-orange-500"
      case "medium": return "bg-yellow-500"
      case "low": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertTriangle className="w-4 h-4" />
      case "in_progress": return <Clock className="w-4 h-4" />
      case "resolved": return <CheckCircle className="w-4 h-4" />
      case "closed": return <CheckCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Issue Management</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader><CardTitle>Filter Issues</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input placeholder="Search issues..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <div className="space-y-4">
          {issues?.map((issue) => (
            <Card key={issue.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{issue.title}</h3>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.priority)}`} />
                      <Badge variant="outline" className="text-xs uppercase">{issue.priority}</Badge>
                    </div>
                    <p className="text-slate-600 mb-3">{issue.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{issue.location_address}</div>
                      <div className="flex items-center gap-1"><User className="w-4 h-4" />Reporter: {issue.profiles?.full_name || "Anonymous"}</div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" />Created: {new Date(issue.created_at).toLocaleDateString()}</div>
                    </div>
                    {issue.assigned_staff && <div className="mt-2 text-sm text-slate-600"><span className="font-medium">Assigned to:</span> {issue.assigned_staff.full_name}</div>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(issue.status)}>
                      <span className="flex items-center gap-1">{getStatusIcon(issue.status)}{issue.status.replace("_", " ")}</span>
                    </Badge>
                    {issue.issue_categories && <Badge variant="outline" className="text-xs">{issue.issue_categories.name}</Badge>}
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="outline">Update Status</Button>
                  <Button size="sm" variant="outline">Assign Staff</Button>
                  <Button size="sm" variant="outline">Add Comment</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!issues || issues.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Issues Found</h3>
            <p className="text-slate-600">No civic issues have been reported yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, AlertCircle, CheckCircle, Search, Filter } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function IssuesPage() {
  const supabase = await createClient()

  // Fetch issues with category information
  const { data: issues } = await supabase
    .from("civic_issues")
    .select(`
      *,
      issue_categories(name, color),
      profiles(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4" />
      case "in_progress":
        return <Clock className="w-4 h-4" />
      case "resolved":
        return <CheckCircle className="w-4 h-4" />
      case "closed":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Community Issues</h1>
                <p className="text-sm text-slate-600">Track and follow civic issues</p>
              </div>
            </div>
            <Link href="/report">
              <Button className="bg-blue-600 hover:bg-blue-700">Report New Issue</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input placeholder="Search issues..." className="pl-10" />
                  </div>
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
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="road">Road & Transportation</SelectItem>
                    <SelectItem value="water">Water & Utilities</SelectItem>
                    <SelectItem value="parks">Parks & Recreation</SelectItem>
                    <SelectItem value="safety">Public Safety</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {issues?.map((issue) => (
            <Card key={issue.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{issue.title}</h3>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.priority)}`} />
                    </div>
                    <p className="text-slate-600 mb-3 line-clamp-2">{issue.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {issue.location_address}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(issue.created_at).toLocaleDateString()}
                      </div>
                      {issue.profiles?.full_name && <span>by {issue.profiles.full_name}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(issue.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(issue.status)}
                        {issue.status.replace("_", " ")}
                      </span>
                    </Badge>
                    {issue.issue_categories && (
                      <Badge variant="outline" className="text-xs">
                        {issue.issue_categories.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!issues ||
          (issues.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Issues Found</h3>
              <p className="text-slate-600 mb-6">Be the first to report a civic issue in your community.</p>
              <Link href="/report">
                <Button className="bg-blue-600 hover:bg-blue-700">Report First Issue</Button>
              </Link>
            </div>
          ))}
      </div>
    </div>
  )
}

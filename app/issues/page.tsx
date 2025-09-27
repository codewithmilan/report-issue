import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, AlertCircle, CheckCircle, Search, Filter, User } from "lucide-react"
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
        return "bg-red-100 text-red-800 border-red-200"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Community Issues</h1>
                <p className="text-sm text-slate-600 font-medium">Track and resolve civic concerns together</p>
              </div>
            </div>
            <Link href="/report">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2">
                Report New Issue
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Filters */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input 
                      placeholder="Search issues by keyword..." 
                      className="pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50" 
                    />
                  </div>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full lg:w-52 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50">
                    <Filter className="w-5 h-5 mr-2 text-slate-500" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 backdrop-blur-sm border-slate-200">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full lg:w-52 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/50">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 backdrop-blur-sm border-slate-200">
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
        <div className="space-y-6">
          {issues?.map((issue) => (
            <Card 
              key={issue.id} 
              className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-slate-900 line-clamp-1 pr-4">{issue.title}</h3>
                      <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority?.charAt(0).toUpperCase() + issue.priority?.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">{issue.description}</p>
                    <div className="flex items-center gap-6 text-sm text-slate-500 bg-slate-50/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{issue.location_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span className="font-medium">{new Date(issue.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      {issue.profiles?.full_name && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-green-500" />
                          <span className="font-medium">by {issue.profiles.full_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 ml-4">
                    <Badge className={`${getStatusColor(issue.status)} px-3 py-2 rounded-full border shadow-sm`}>
                      <span className="flex items-center gap-2 font-medium">
                        {getStatusIcon(issue.status)}
                        {issue.status?.replace("_", " ")}
                      </span>
                    </Badge>
                    {issue.issue_categories && (
                      <Badge 
                        variant="outline" 
                        className="text-xs px-3 py-1 border-slate-300 bg-slate-50 text-slate-700 font-medium rounded-full"
                      >
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
            <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg">
              <AlertCircle className="w-20 h-20 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Issues Found</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">Be the first to report a civic issue in your community and make a difference.</p>
              <Link href="/report">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 rounded-xl">
                  Report First Issue
                </Button>
              </Link>
            </div>
          ))}
      </div>
    </div>
  )
}

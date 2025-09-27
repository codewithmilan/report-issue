import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, AlertCircle, CheckCircle, Search, Filter, User } from "lucide-react"
import Link from "next/link"
import { supabaseServer } from "@/lib/supabase/server"   // ✅ yahan fix kiya hai

export default async function IssuesPage() {
  // ✅ yahan pe pehle galat tha (await createClient), ab sahi hai
  const { data: issues, error } = await supabaseServer
    .from("civic_issues")
    .select(`
      *,
      issue_categories(name, color),
      profiles(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error fetching issues:", error.message)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Input placeholder="Search issues..." className="w-64" />
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" /> Search
          </Button>
        </div>

        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" /> More Filters
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {issues?.map((issue) => (
          <Card key={issue.id} className="flex flex-col">
            <CardContent className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-2">
                <Badge
                  variant="outline"
                  className="px-2 py-1 text-xs"
                  style={{ backgroundColor: issue.issue_categories?.color || "#e2e8f0" }}
                >
                  {issue.issue_categories?.name || "Uncategorized"}
                </Badge>
                {issue.status === "resolved" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : issue.status === "in_progress" ? (
                  <Clock className="h-5 w-5 text-yellow-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>

              <h3 className="text-lg font-semibold mb-2">{issue.title}</h3>
              <p className="text-sm text-gray-600 flex-grow">{issue.description}</p>

              <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                <MapPin className="h-4 w-4" />
                <span>{issue.location}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <User className="h-4 w-4" />
                <span>Reported by {issue.profiles?.full_name || "Anonymous"}</span>
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-gray-400">
                  {new Date(issue.created_at).toLocaleDateString()}
                </span>
                <Link href={`/issues/${issue.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

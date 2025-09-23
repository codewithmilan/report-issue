import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Filter, User, Mail, Calendar, Settings } from "lucide-react"
import Link from "next/link"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Check authentication and admin status
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

  if (!profile || !["admin", "staff"].includes(profile.user_type)) {
    redirect("/")
  }

  // Fetch all users with their issue counts
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      reported_issues:civic_issues!civic_issues_reporter_id_fkey(count)
    `)
    .order("created_at", { ascending: false })

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "staff":
        return "bg-blue-100 text-blue-800"
      case "citizen":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
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
              <h1 className="text-xl font-bold text-slate-900">User Management</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input placeholder="Search users..." className="pl-10" />
                </div>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="staff">Staff Members</SelectItem>
                  <SelectItem value="citizen">Citizens</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users?.map((userProfile) => (
            <Card key={userProfile.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{userProfile.full_name || "Unnamed User"}</h3>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {userProfile.id}
                      </p>
                    </div>
                  </div>
                  <Badge className={getUserTypeColor(userProfile.user_type)}>{userProfile.user_type}</Badge>
                </div>

                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  {userProfile.phone && <p>Phone: {userProfile.phone}</p>}
                  {userProfile.address && <p>Address: {userProfile.address}</p>}
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined: {new Date(userProfile.created_at).toLocaleDateString()}
                  </p>
                  <p>Issues Reported: {userProfile.reported_issues?.[0]?.count || 0}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    View Profile
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!users ||
          (users.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Users Found</h3>
              <p className="text-slate-600">No users have registered yet.</p>
            </div>
          ))}
      </div>
    </div>
  )
}

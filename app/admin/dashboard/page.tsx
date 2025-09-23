"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, Image as ImageIcon, MapPin, List, BarChart3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Issue = {
  id: string
  title: string
  description: string
  status: string
  reporter_id: string
  created_at: string
  image_url?: string
  latitude?: number
  longitude?: number
}

const municipalData = [
  { name: "Municipal Office A", address: "Main Road, City Center", lat: 28.6139, lng: 77.2090, distance: "2 km" },
  { name: "Municipal Office B", address: "Near Bus Stand", lat: 28.6200, lng: 77.2150, distance: "5 km" },
  { name: "Municipal Office C", address: "Station Road", lat: 28.6300, lng: 77.2200, distance: "7 km" },
]

export default function AdminDashboard() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [location, setLocation] = useState("")
  const [nearestOffice, setNearestOffice] = useState<any>(null)

  useEffect(() => {
    const fetchIssues = async () => {
      const { data, error } = await supabase
        .from<Issue>("civic_issues")
        .select("*")
        .order("created_at", { ascending: false })
      if (!error && data) setIssues(data)
      setLoading(false)
    }
    fetchIssues()

    const subscription = supabase
      .channel("public:civic_issues")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "civic_issues" }, (payload) => {
        setIssues((prev) => [payload.new as Issue, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [])

  const getStatusColor = (status: string) => ({
    open: "bg-red-100 text-red-800 border-red-200",
    in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
    closed: "bg-gray-100 text-gray-800 border-gray-200",
  }[status] || "bg-gray-100 text-gray-800 border-gray-200")

  const getStatusIcon = (status: string) => ({
    open: <AlertTriangle className="w-4 h-4" />,
    in_progress: <Clock className="w-4 h-4" />,
    resolved: <CheckCircle className="w-4 h-4" />,
    closed: <CheckCircle className="w-4 h-4" />,
  }[status] || <AlertTriangle className="w-4 h-4" />)

  const totalIssues = issues.length
  const newIssues = issues.filter((i) => i.status === "open").length
  const inProgress = issues.filter((i) => i.status === "in_progress").length
  const resolved = issues.filter((i) => i.status === "resolved").length
  const avgResolution =
    resolved > 0
      ? (
          issues
            .filter((i) => i.status === "resolved")
            .reduce((acc, curr) => {
              const diff = Math.abs(new Date().getTime() - new Date(curr.created_at).getTime())
              return acc + diff
            }, 0) /
          resolved /
          (1000 * 60 * 60 * 24)
        ).toFixed(1)
      : "N/A"

  const filteredIssues = filter === "all" ? issues : issues.filter((i) => i.status === filter)

  const handleSearch = () => {
    if (!location.trim()) return
    setNearestOffice(municipalData[0])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-12 text-black text-center">Admin Dashboard</h1>

        {/* Analytics Cards */}
        <div className="grid gap-6 md:grid-cols-5 mb-12">
          {[
            { label: "Total Issues", value: totalIssues, color: "text-black", icon: <List className="w-6 h-6" />, filter: "all" },
            { label: "New Issues", value: newIssues, color: "text-red-600", icon: <AlertTriangle className="w-6 h-6" />, filter: "open" },
            { label: "In Progress", value: inProgress, color: "text-yellow-600", icon: <Clock className="w-6 h-6" />, filter: "in_progress" },
            { label: "Resolved", value: resolved, color: "text-green-600", icon: <CheckCircle className="w-6 h-6" />, filter: "resolved" },
            { label: "Avg. Resolution", value: `${avgResolution} days`, color: "text-purple-600", icon: <BarChart3 className="w-6 h-6" />, filter: null },
          ].map((card, idx) => (
            <Card
              key={idx}
              className="p-6 bg-gradient-to-r from-gray-100 via-white to-gray-100 rounded-2xl shadow hover:shadow-xl transition-transform transform hover:-translate-y-1 cursor-pointer text-center"
              onClick={() => card.filter && setFilter(card.filter)}
            >
              <div className="mx-auto mb-4 p-2 rounded-full bg-gray-200 w-fit">{card.icon}</div>
              <CardTitle className={`text-xs uppercase tracking-wide font-semibold ${card.color} mb-2`}>{card.label}</CardTitle>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </Card>
          ))}
        </div>

        {/* Issues List */}
        <Card className="bg-white rounded-2xl shadow overflow-hidden mb-12">
          <CardHeader className="bg-gray-100 p-6">
            <CardTitle className="text-2xl font-bold text-black">
              {filter === "all" ? "All Issues" : `${filter.replace("_", " ")} Issues`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Loading issues...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-lg">No reports yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredIssues.map((issue) => (
                  <div key={issue.id} className="flex justify-between items-center p-6 hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-black mb-1 truncate">{issue.title}</h3>
                      <p className="text-gray-600 line-clamp-2 mb-2">{issue.description}</p>
                      <p className="text-gray-400 text-sm">{new Date(issue.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                      <Badge className={`${getStatusColor(issue.status)} border px-3 py-2`}>
                        <div className="flex items-center gap-2 font-semibold">
                          {getStatusIcon(issue.status)}
                          <span className="capitalize">{issue.status.replace("_", " ")}</span>
                        </div>
                      </Badge>
                      <Link href={`/issues/${issue.id}`} className="bg-black text-white px-5 py-2 rounded-xl hover:bg-gray-900 transition-colors font-semibold text-sm">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Uploaded Images */}
        <section className="bg-white rounded-2xl shadow p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-black flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-blue-600" /> Uploaded Images
          </h2>
          {issues.filter((i) => i.image_url).length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {issues.filter((i) => i.image_url).map((issue) => (
                <div key={issue.id} className="overflow-hidden rounded-xl shadow hover:shadow-xl transition-all cursor-pointer bg-gray-50">
                  <img src={issue.image_url} alt={issue.title} className="w-full h-48 object-cover hover:scale-105 transition-transform" />
                  <div className="p-3">
                    <p className="text-sm font-semibold text-black truncate">{issue.title}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No images uploaded yet.</p>
            </div>
          )}
        </section>

        {/* Nearest Office with Embedded Google Map */}
        <section className="bg-white rounded-2xl shadow p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-black flex items-center gap-2">
            <MapPin className="w-7 h-7 text-blue-600" /> Find Nearest Municipal Office
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Enter your location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 rounded-xl border-gray-300 focus:border-blue-500"
            />
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl">
              Search
            </Button>
          </div>

          {nearestOffice && (
            <div className="mt-4 p-4 border border-blue-300 rounded-xl bg-gray-50 shadow-lg">
              <h3 className="font-bold text-lg text-black flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" /> {nearestOffice.name}
              </h3>
              <p className="text-gray-700">{nearestOffice.address}</p>
              <p className="text-gray-500 text-sm">Approx. {nearestOffice.distance || "N/A"} away</p>

              <div className="mt-4 w-full h-64 border-2 border-blue-200 rounded-xl overflow-hidden shadow-md">
                <iframe
                  width="100%"
                  height="100%"
                  loading="lazy"
                  allowFullScreen
                  className="rounded-xl"
                  src={`https://www.google.com/maps?q=${nearestOffice.lat},${nearestOffice.lng}&hl=en&z=15&output=embed`}
                ></iframe>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

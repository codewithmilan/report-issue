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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-gray-900 via-black to-gray-900 bg-clip-text text-transparent mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Monitor civic issues, track progress, and locate nearest offices efficiently.
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-6 md:grid-cols-5 mb-12">
          {[
            { label: "Total Issues", value: totalIssues, color: "text-gray-900", icon: <List className="w-6 h-6" />, filter: "all" },
            { label: "New Issues", value: newIssues, color: "text-red-600", icon: <AlertTriangle className="w-6 h-6" />, filter: "open" },
            { label: "In Progress", value: inProgress, color: "text-yellow-600", icon: <Clock className="w-6 h-6" />, filter: "in_progress" },
            { label: "Resolved", value: resolved, color: "text-green-600", icon: <CheckCircle className="w-6 h-6" />, filter: "resolved" },
            { label: "Avg. Resolution", value: `${avgResolution} days`, color: "text-purple-600", icon: <BarChart3 className="w-6 h-6" />, filter: null },
          ].map((card, idx) => (
            <Card
              key={idx}
              className="group p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border-0 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer text-center relative overflow-hidden"
              onClick={() => card.filter && setFilter(card.filter)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className={`mx-auto mb-4 p-3 rounded-2xl bg-gradient-to-r from-${card.color.replace('text-', '')}-50 to-${card.color.replace('text-', '')}-100 w-fit shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <CardTitle className={`text-xs uppercase tracking-widest font-bold ${card.color} mb-2 drop-shadow-sm`}>
                {card.label}
              </CardTitle>
              <p className={`text-3xl font-extrabold ${card.color} drop-shadow-sm`}>{card.value}</p>
            </Card>
          ))}
        </div>

        {/* Issues List */}
        <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden mb-12 border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center justify-between">
              <span>
                {filter === "all" ? "All Issues" : `${filter.replace("_", " ")} Issues`}
              </span>
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                {filteredIssues.length} {filter === "all" ? "Total" : "Filtered"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-gray-600 mt-4 text-lg font-medium">Loading issues...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-xl font-semibold">No reports yet.</p>
                <p className="text-gray-400 mt-2">Start monitoring civic issues in your area.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredIssues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className="flex justify-between items-center p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-bold text-xl text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                        {issue.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 mb-3 leading-relaxed">{issue.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(issue.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(issue.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                      <Badge className={`${getStatusColor(issue.status)} border px-4 py-3 rounded-full shadow-md hover:shadow-lg transition-shadow`}>
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          {getStatusIcon(issue.status)}
                          <span className="capitalize">{issue.status.replace("_", " ")}</span>
                        </div>
                      </Badge>
                      <Link 
                        href={`/issues/${issue.id}`} 
                        className="bg-gradient-to-r from-black to-gray-900 text-white px-6 py-3 rounded-2xl hover:from-gray-900 hover:to-black transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Uploaded Images */}
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-12 border-0 overflow-hidden">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-blue-600" /> 
            Uploaded Images
            <Badge className="bg-blue-100 text-blue-800 ml-auto px-3 py-1 rounded-full font-semibold">
              {issues.filter((i) => i.image_url).length} Images
            </Badge>
          </h2>
          {issues.filter((i) => i.image_url).length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {issues.filter((i) => i.image_url).map((issue) => (
                <div 
                  key={issue.id} 
                  className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-gray-50 to-white transform hover:scale-105"
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={issue.image_url} 
                      alt={issue.title} 
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {issue.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(issue.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <ImageIcon className="w-20 h-20 text-gray-300 mx-auto mb-6 animate-pulse" />
              <h3 className="text-gray-500 text-2xl font-semibold mb-2">No images uploaded yet.</h3>
              <p className="text-gray-400 text-lg">Encourage users to attach photos for better issue reporting.</p>
            </div>
          )}
        </section>

        {/* Nearest Office with Embedded Google Map */}
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-0">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-green-600" /> 
            Find Nearest Municipal Office
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
            <Input
              placeholder="Enter your location (e.g., address or coordinates)..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 rounded-2xl border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white shadow-sm"
            />
            <Button 
              onClick={handleSearch} 
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>

          {nearestOffice && (
            <div className="mt-6 p-6 border border-green-200 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 shadow-xl animate-fade-in">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3 mb-3">
                <MapPin className="w-6 h-6 text-green-600" /> 
                {nearestOffice.name}
              </h3>
              <p className="text-gray-700 font-medium mb-2">{nearestOffice.address}</p>
              <p className="text-green-600 font-semibold text-lg mb-6">
                Approx. {nearestOffice.distance} away
              </p>

              <div className="w-full h-80 border-2 border-green-200 rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  width="100%"
                  height="100%"
                  loading="lazy"
                  allowFullScreen
                  className="rounded-2xl"
                  src={`https://www.google.com/maps?q=${nearestOffice.lat},${nearestOffice.lng}&hl=en&z=15&output=embed`}
                ></iframe>
              </div>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

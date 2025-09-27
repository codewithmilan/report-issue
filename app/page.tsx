"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, CheckCircle, Clock, AlertTriangle } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  const handleViewIssues = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push("/auth/signup")
    } else {
      router.push("/issues")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-wide">CivicReport</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium hidden sm:block">Community Issue Reporting</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4 sm:gap-6">
            <a href="#hero" className="text-slate-700 hover:text-blue-600 font-medium cursor-pointer">Home</a>
            <a href="#how-it-works" className="text-slate-700 hover:text-blue-600 font-medium cursor-pointer">About</a>
            <a href="#footer" className="text-slate-700 hover:text-blue-600 font-medium cursor-pointer">Contact</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" className="text-blue-600 font-semibold hover:text-blue-800 text-sm sm:text-base px-3 sm:px-4 h-8 sm:h-auto" onClick={() => router.push("/auth/login")}>
              Sign In
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg text-base sm:text-lg px-4 sm:px-8 h-10 sm:h-auto font-semibold transition-transform hover:scale-105 whitespace-nowrap" onClick={() => router.push("/report")}>
              Report Issue
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="py-16 sm:py-24 bg-gradient-to-r from-blue-100 to-blue-200 text-center">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-4 sm:mb-6 leading-tight animate-fadeInDown">
            Help Improve Your Community
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-700 mb-6 sm:mb-10 max-w-3xl mx-auto animate-fadeInUp">
            Report civic issues, track their progress, and work together with local government to make your neighborhood a better place to live.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Button
              size="lg"
              className="bg-blue-700 hover:bg-blue-800 text-base sm:text-lg px-6 sm:px-10 h-12 sm:h-auto font-semibold shadow-lg transition-transform hover:scale-105"
              onClick={() => router.push("/report")}
            >
              Report an Issue
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleViewIssues}
              className="text-base sm:text-lg px-6 sm:px-10 h-12 sm:h-auto bg-transparent border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white font-semibold transition-colors"
            >
              View All Issues
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-12 sm:py-20 bg-white shadow-inner">
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
          {[{ icon: <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />, value: "2,847", label: "Active Citizens" },
            { icon: <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />, value: "1,523", label: "Issues Resolved" },
            { icon: <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />, value: "3.2", label: "Days Avg Response" },
            { icon: <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />, value: "89", label: "Open Issues" }]
            .map(({ icon, value, label }) => (
              <div key={label} className="text-center p-4 sm:p-6 rounded-xl shadow-lg bg-white hover:shadow-2xl transition-shadow cursor-default">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5`}>
                  {icon}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">{value}</div>
                <div className="text-base sm:text-lg text-slate-600 font-medium">{label}</div>
              </div>
            ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-20 bg-gradient-to-tr from-white to-blue-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 sm:mb-6">How It Works</h3>
            <p className="text-lg sm:text-xl text-slate-700 max-w-3xl mx-auto">
              Simple steps to report and track civic issues in your community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
            {[{ step: "1", title: "Report the Issue", description: "Take a photo, add location details, and describe the problem you've encountered" },
              { step: "2", title: "Track Progress", description: "Receive updates as city staff review, prioritize, and work on your reported issue" },
              { step: "3", title: "See Results", description: "Get notified when the issue is resolved and see the positive impact on your community" }]
              .map(({ step, title, description }) => (
                <Card key={step} className="text-center border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 text-white font-extrabold text-lg sm:text-xl shadow-md">{step}</div>
                    <CardTitle className="text-lg sm:text-xl font-bold">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm sm:text-base text-slate-700">{description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 sm:mb-6">Issue Categories</h3>
            <p className="text-lg sm:text-xl text-slate-700">Report various types of civic issues affecting your community</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[{ name: "Road & Transportation", color: "bg-red-600" },
              { name: "Water & Utilities", color: "bg-blue-600" },
              { name: "Parks & Recreation", color: "bg-green-600" },
              { name: "Public Safety", color: "bg-yellow-500" },
              { name: "Waste Management", color: "bg-purple-600" },
              { name: "Noise & Nuisance", color: "bg-orange-600" },
              { name: "Building & Zoning", color: "bg-gray-600" },
              { name: "Other", color: "bg-slate-600" }]
              .map((category) => (
                <Badge key={category.name} variant="secondary"
                  className={`text-white hover:opacity-90 p-3 sm:p-4 text-center justify-center text-sm sm:text-base font-semibold rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105 block ${category.color} leading-5 sm:leading-6`}>
                  {category.name}
                </Badge>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-wide">CivicReport</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
              Empowering communities through transparent civic engagement and issue resolution.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Quick Links</h4>
            <div className="space-y-2 sm:space-y-3">
              <a href="#hero" className="block text-slate-400 hover:text-white transition-colors font-medium text-sm sm:text-base">Home</a>
              <a href="#how-it-works" className="block text-slate-400 hover:text-white transition-colors font-medium text-sm sm:text-base">About</a>
              <a href="#footer" className="block text-slate-400 hover:text-white transition-colors font-medium text-sm sm:text-base">Contact</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Contact</h4>
            <div className="space-y-2 sm:space-y-3 text-slate-400 font-medium text-sm sm:text-base">
              <p>Email: support@civicreport.gov</p>
              <p>Phone: (555) 123-4567</p>
              <p>Hours: Mon-Fri 8AM-6PM</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-slate-400 font-light text-sm sm:text-base">
          <p>&copy; 2025 CivicReport. All rights reserved.</p>
        </div>
      </footer>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeInDown { 0% { opacity: 0; transform: translateY(-20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fadeInDown { animation: fadeInDown 0.8s ease forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease forwards; }
      `}</style>
    </div>
  )
}

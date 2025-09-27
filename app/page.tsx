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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-hidden">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-xl transform transition-all duration-300 hover:scale-110 hover:rotate-3">
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-md" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">CivicReport</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold hidden sm:block">Community Issue Reporting</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-slate-700 hover:text-blue-600 font-semibold transition-all duration-300 hover:underline underline-offset-4 cursor-pointer relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-slate-700 hover:text-blue-600 font-semibold transition-all duration-300 hover:underline underline-offset-4 cursor-pointer relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </button>
            <button
              onClick={() => scrollToSection("footer")}
              className="text-slate-700 hover:text-blue-600 font-semibold transition-all duration-300 hover:underline underline-offset-4 cursor-pointer relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              className="text-blue-600 font-semibold hover:text-blue-800 text-sm sm:text-base px-3 sm:px-4 h-8 sm:h-auto transition-all duration-300 hover:bg-blue-50 rounded-full"
              onClick={() => router.push("/auth/login")}
            >
              Sign In
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl text-base sm:text-lg px-4 sm:px-8 h-10 sm:h-auto font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl whitespace-nowrap"
              onClick={() => router.push("/report")}
            >
              Report Issue
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="py-16 sm:py-24 bg-gradient-to-r from-blue-100 via-cyan-100 to-blue-200 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200/30 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-4 sm:mb-6 leading-tight animate-fadeInDown bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Help Improve Your Community
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-700 mb-6 sm:mb-10 max-w-3xl mx-auto animate-fadeInUp leading-relaxed">
            Report civic issues, track their progress, and work together with local government to make your neighborhood a better place to live.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-base sm:text-lg px-6 sm:px-10 h-12 sm:h-auto font-semibold shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl"
              onClick={() => router.push("/report")}
            >
              Report an Issue
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleViewIssues}
              className="text-base sm:text-lg px-6 sm:px-10 h-12 sm:h-auto bg-transparent border-blue-700 text-blue-700 hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700 hover:text-white font-semibold transition-all duration-300 hover:scale-105 rounded-xl shadow-lg hover:shadow-xl"
            >
              View All Issues
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-12 sm:py-20 bg-white/80 backdrop-blur-sm shadow-inner">
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
          {[
            { icon: <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 drop-shadow-sm" />, value: "2,847", label: "Active Citizens" },
            { icon: <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 drop-shadow-sm" />, value: "1,523", label: "Issues Resolved" },
            { icon: <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 drop-shadow-sm" />, value: "3.2", label: "Days Avg Response" },
            { icon: <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 drop-shadow-sm" />, value: "89", label: "Open Issues" }
          ].map(({ icon, value, label }) => (
            <div key={label} className="text-center p-4 sm:p-6 rounded-2xl shadow-lg bg-white/90 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-default group">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 ${label.includes("Resolved") ? "bg-green-100" : "bg-gradient-to-r from-blue-100 to-indigo-100"} rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 group-hover:scale-110 transition-all duration-300`}>
                {icon}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">{value}</div>
              <div className="text-base sm:text-lg text-slate-600 font-semibold">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-20 bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 sm:mb-6 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">How It Works</h3>
            <p className="text-lg sm:text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
              Simple steps to report and track civic issues in your community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
            {[
              { step: "1", title: "Report the Issue", description: "Take a photo, add location details, and describe the problem you've encountered" },
              { step: "2", title: "Track Progress", description: "Receive updates as city staff review, prioritize, and work on your reported issue" },
              { step: "3", title: "See Results", description: "Get notified when the issue is resolved and see the positive impact on your community" }
            ].map(({ step, title, description }) => (
              <Card key={step} className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 cursor-pointer group bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 text-white font-black text-lg sm:text-xl shadow-lg group-hover:scale-110 transition-all duration-300">{step}</div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm sm:text-base text-slate-700 leading-relaxed">{description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-12 sm:py-20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 sm:mb-6 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">Issue Categories</h3>
            <p className="text-lg sm:text-xl text-slate-700">Report various types of civic issues affecting your community</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: "Road & Transportation", color: "bg-gradient-to-r from-red-500 to-red-600" },
              { name: "Water & Utilities", color: "bg-gradient-to-r from-blue-500 to-blue-600" },
              { name: "Parks & Recreation", color: "bg-gradient-to-r from-green-500 to-green-600" },
              { name: "Public Safety", color: "bg-gradient-to-r from-yellow-400 to-yellow-500" },
              { name: "Waste Management", color: "bg-gradient-to-r from-purple-500 to-purple-600" },
              { name: "Noise & Nuisance", color: "bg-gradient-to-r from-orange-500 to-orange-600" },
              { name: "Building & Zoning", color: "bg-gradient-to-r from-gray-500 to-gray-600" },
              { name: "Other", color: "bg-gradient-to-r from-slate-500 to-slate-600" }
            ].map((category) => (
              <Badge
                key={category.name}
                variant="secondary"
                className={`text-white hover:opacity-90 p-3 sm:p-4 text-center justify-center text-sm sm:text-base font-semibold rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl block ${category.color} leading-5 sm:leading-6 hover:from-transparent hover:to-white/10 backdrop-blur-sm`}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-gradient-to-t from-slate-900 to-slate-800 text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">CivicReport</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
              Empowering communities through transparent civic engagement and issue resolution.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 sm:mb-6 text-base sm:text-lg text-white">Quick Links</h4>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => scrollToSection("hero")}
                className="block text-slate-400 hover:text-white transition-all duration-300 font-semibold text-sm sm:text-base hover:translate-x-2"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="block text-slate-400 hover:text-white transition-all duration-300 font-semibold text-sm sm:text-base hover:translate-x-2"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("footer")}
                className="block text-slate-400 hover:text-white transition-all duration-300 font-semibold text-sm sm:text-base hover:translate-x-2"
              >
                Contact
              </button>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 sm:mb-6 text-base sm:text-lg text-white">Contact</h4>
            <div className="space-y-2 sm:space-y-3 text-slate-400 font-semibold text-sm sm:text-base">
              <p>Email: support@civicreport.gov</p>
              <p>Phone: (555) 123-4567</p>
              <p>Hours: Mon-Fri 8AM-6PM</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700/50 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-slate-400 font-light text-sm sm:text-base">
          <p>&copy; 2025 CivicReport. All rights reserved.</p>
        </div>
      </footer>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeInDown {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease-out forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  )
}

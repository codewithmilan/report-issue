"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ArrowLeft, Camera, MapPin, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ReportIssuePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const categories = [
    { id: "Road & Transportation", name: "Road & Transportation (Potholes, Signals)" },
    { id: "Water & Utilities", name: "Water & Utilities (Leaks, Hydrants)" },
    { id: "Parks & Recreation", name: "Parks & Recreation" },
    { id: "Public Safety", name: "Public Safety (Streetlights, Hazards)" },
    { id: "Waste Management", name: "Waste Management (Trash, Illegal Dumping)" },
    { id: "Noise & Nuisance", name: "Noise & Nuisance" },
    { id: "Building & Zoning", name: "Building & Zoning" },
    { id: "Other", name: "Other Community Issue" },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/report");
    }
  }, [user, loading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        const coordsText = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        if (!location) {
          setLocation(coordsText);
        }
        setIsLocating(false);
        toast.success("GPS Location verified successfully!");
      },
      (err) => {
        setIsLocating(false);
        toast.error("Permission denied or unable to acquire GPS location.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) {
      toast.error("Please fill in all required fields (title, category, description).");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = "";

      // Upload file if selected
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url || "";
        }
      }

      // Submit issue to backend API (user identity extracted securely from JWT)
      const res = await fetch("/api/v1/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          location,
          latitude,
          longitude,
          imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit issue");
        return;
      }

      toast.success("Civic issue reported successfully! City staff has been notified.");
      router.push("/user/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to report issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/60 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/user/dashboard">
            <Button variant="ghost" size="sm" className="rounded-xl gap-1 text-slate-600">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-sm font-bold text-slate-900">Report a Civic Problem</h1>
            <p className="text-[11px] text-slate-500">Official Municipal Submission</p>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Form */}
      <main className="container mx-auto px-4 pt-8 max-w-2xl">
        <Card className="border border-slate-200/80 shadow-md rounded-2xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/60 border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Submit New Issue</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Your report will be automatically logged and dispatched to municipal crews
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Authenticated User Banner */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Submitting as: <strong>{user.name}</strong> ({user.email})</span>
                </div>
                <span className="text-[11px] text-blue-700 bg-white px-2 py-0.5 rounded-full font-medium shadow-xs">
                  Verified JWT
                </span>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold text-slate-700">
                  Issue Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Hazardous Pothole on Oak Avenue near 5th St"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl text-sm"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-semibold text-slate-700">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="rounded-xl text-sm">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="text-xs font-semibold text-slate-700">
                    Estimated Urgency
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="rounded-xl text-sm">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority (Cosmetic)</SelectItem>
                      <SelectItem value="medium">Medium Priority (Standard)</SelectItem>
                      <SelectItem value="high">High Priority (Safety Risk)</SelectItem>
                      <SelectItem value="urgent">Urgent Priority (Emergency Hazard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
                  Detailed Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Provide details about the hazard, size, surrounding landmarks, or when it first occurred..."
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl text-sm resize-none"
                />
              </div>

              {/* Location & GPS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location" className="text-xs font-semibold text-slate-700">
                    Location / Street Address
                  </Label>
                  <button
                    type="button"
                    onClick={handleRequestLocation}
                    disabled={isLocating}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" /> Verifying GPS...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3" /> Auto-Detect GPS Location
                      </>
                    )}
                  </button>
                </div>
                <Input
                  id="location"
                  placeholder="e.g. 420 Elm Street, outside Elementary Entrance"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-xl text-sm"
                />
                {latitude !== null && longitude !== null && (
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      GPS Coordinates Attached: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Attach Evidence Photo</Label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 text-center transition cursor-pointer relative bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-xl object-contain shadow-xs"
                      />
                      <p className="text-xs text-blue-600 font-semibold">Click to choose a different photo</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <Camera className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">Click to upload issue photo</p>
                      <p className="text-[11px] text-slate-400">PNG, JPG, or WEBP up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md text-sm transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Transmitting Report to Municipal Registry...
                  </span>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

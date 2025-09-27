"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ArrowLeft, Camera, MapPin, Edit2 } from "lucide-react";
import Link from "next/link";

export default function ReportIssuePage() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("medium");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile states
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const categories = [
    { id: "road-transportation", name: "Road & Transportation" },
    { id: "water-utilities", name: "Water & Utilities" },
    { id: "parks-recreation", name: "Parks & Recreation" },
    { id: "public-safety", name: "Public Safety" },
    { id: "waste-management", name: "Waste Management" },
    { id: "noise-nuisance", name: "Noise & Nuisance" },
    { id: "building-zoning", name: "Building & Zoning" },
    { id: "other", name: "Other" },
  ];

  // Fetch user session and profile
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return router.push("/auth/login");
      setUser(session.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);
      setNewName(profileData?.full_name || "");
    };

    fetchUser();
  }, [router]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`);
        toast.success("Location added successfully");
      },
      () => toast.error("Unable to fetch location")
    );
  };

  const handleProfileUpdate = async () => {
    if (!newName) return;
    const updates = { full_name: newName, updated_at: new Date() };
    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    if (!error) {
      setProfile({ ...profile, ...updates });
      setEditing(false);
      toast.success("Profile updated!");
    } else {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!user) return router.push("/auth/login");

      let image_url: string | undefined = undefined;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        image_url = data.url;
      }

      const { error: insertError } = await supabase.from("civic_issues").insert({
        title,
        description,
        category: categories.find(c => c.id === category)?.name,
        reporter_id: user.id,
        location_address: location,
        priority,
        status: "open",
        image_url,
      });

      if (insertError) throw insertError;

      toast.success("✅ Report submitted successfully!");
      setTitle(""); setDescription(""); setCategory(""); setLocation(""); setPriority("medium"); setFile(null);

      // Update issues count in profile
      const { data: issuesData } = await supabase
        .from("civic_issues")
        .select("*")
        .eq("reporter_id", user.id);
      setProfile({ ...profile, issues_count: issuesData.length });
    } catch (err: any) {
      setError(err.message || "Failed to submit report");
      toast.error("❌ Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button></Link>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5" /> Report an Issue</h1>
          </div>

          {/* Profile section */}
          {profile && (
            <div className="bg-white shadow-md rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
              <div>
                <p className="font-semibold text-gray-700">Logged in as:</p>
                <p className="text-gray-900">{profile.full_name || user.email}</p>
                <p className="text-gray-500 text-sm">{profile.issues_count || 0} reports submitted</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setEditing(!editing)}>
                <Edit2 size={16} /> Edit Name
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Edit profile */}
      {editing && (
        <Card className="container mx-auto px-4 py-4 mt-4 shadow-md rounded-xl bg-white/80">
          <CardContent className="flex flex-col gap-3">
            <Input placeholder="Enter full name" value={newName} onChange={e => setNewName(e.target.value)} />
            <Button onClick={handleProfileUpdate}>Save Profile</Button>
          </CardContent>
        </Card>
      )}

      {/* Report Issue Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Report a Civic Issue</CardTitle>
              <CardDescription>Help improve your community by reporting issues to local authorities.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" placeholder="Issue title" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="flex gap-2">
                    <Input id="location" placeholder="Enter location" value={location} onChange={e => setLocation(e.target.value)} required />
                    <Button type="button" variant="secondary" onClick={handleGetLocation}>📍 My Location</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" placeholder="Detailed info about the issue" value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
                </div>

                <div className="space-y-2">
                  <Label>Photo (Optional)</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Camera className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                    {file && <p className="text-sm text-green-600 mt-2">{file.name} selected</p>}
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                  </Button>
                  <Link href="/"><Button variant="outline" className="flex-1">Cancel</Button></Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

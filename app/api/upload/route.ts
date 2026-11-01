import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // If Supabase is configured, attempt upload to Supabase storage
    if (isSupabaseConfigured()) {
      try {
        const fileName = `reports/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { data, error: uploadError } = await supabase.storage
          .from("issue-photos")
          .upload(fileName, file, { upsert: true });

        if (!uploadError && data) {
          const { data: urlData } = supabase.storage.from("issue-photos").getPublicUrl(data.path);
          return NextResponse.json({ url: urlData.publicUrl });
        }
      } catch (storageErr) {
        console.warn("Storage upload failed, falling back to base64 data URL", storageErr);
      }
    }

    // Graceful fallback: convert to base64 Data URL so user images still preview and work
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "image/jpeg";
    const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

    return NextResponse.json({ url: base64Data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}


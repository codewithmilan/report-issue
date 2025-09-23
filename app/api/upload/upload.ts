// pages/api/upload.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client"; // optional: or server-side client

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const fileName = `reports/${Date.now()}_${file.name}`;
    const { data, error: uploadError } = await supabase.storage
      .from("issue-photos")
      .upload(fileName, file);

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: urlData } = supabase.storage.from("issue-photos").getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}

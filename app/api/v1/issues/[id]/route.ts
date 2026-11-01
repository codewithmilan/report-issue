import { NextRequest, NextResponse } from "next/server";
import { IssueRepo } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const issue = await IssueRepo.findById(params.id);
    if (!issue) {
      return NextResponse.json({ error: "Civic issue not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      issue,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve issue." },
      { status: 500 }
    );
  }
}


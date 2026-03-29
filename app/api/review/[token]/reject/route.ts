import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { token } = await params;
    const supabase = await createClient();

    const formData = await request.formData();
    const reason = formData.get("reason")?.toString() || "";
    const file = formData.get("photo") as File | null;

    if (!reason.trim()) {
      return NextResponse.json(
        { error: "Reason is required." },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "A rejection photo is required." },
        { status: 400 }
      );
    }

    const { data: reviewToken, error: tokenError } = await supabase
      .from("review_tokens")
      .select("*")
      .eq("token", token)
      .eq("is_active", true)
      .single();

    if (tokenError || !reviewToken) {
      return NextResponse.json(
        { error: "Invalid review token." },
        { status: 404 }
      );
    }

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", reviewToken.submission_id)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: "Submission not found." },
        { status: 404 }
      );
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `rejection/${submission.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("job-photos")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: signedUrlData } = await supabase.storage
      .from("job-photos")
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);

    const photoUrl = signedUrlData?.signedUrl || filePath;

    const { error: photoError } = await supabase
      .from("submission_photos")
      .insert({
        submission_id: submission.id,
        photo_url: photoUrl,
        photo_type: "rejection",
        uploaded_by: "client",
      });

    if (photoError) {
      return NextResponse.json(
        { error: photoError.message },
        { status: 500 }
      );
    }

    const { error: submissionUpdateError } = await supabase
      .from("submissions")
      .update({
        status: "rejected",
        rejection_reason: reason,
        rejected_at: new Date().toISOString(),
      })
      .eq("id", submission.id);

    if (submissionUpdateError) {
      return NextResponse.json(
        { error: submissionUpdateError.message },
        { status: 500 }
      );
    }

    const { error: jobUpdateError } = await supabase
      .from("jobs")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", submission.job_id);

    if (jobUpdateError) {
      return NextResponse.json(
        { error: jobUpdateError.message },
        { status: 500 }
      );
    }

    await supabase
      .from("review_tokens")
      .update({
        is_active: false,
      })
      .eq("id", reviewToken.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reject route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const notes = formData.get("notes")?.toString() || "";
    const files = formData.getAll("photos") as File[];

    if (!notes.trim()) {
      return NextResponse.json(
        { error: "Completion notes are required." },
        { status: 400 }
      );
    }

    if (!files.length) {
      return NextResponse.json(
        { error: "At least one proof photo is required." },
        { status: 400 }
      );
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        job_id: id,
        notes,
        status: "pending",
      })
      .select()
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: submissionError?.message || "Failed to create submission." },
        { status: 500 }
      );
    }

    for (const file of files) {
      const fileExt = file.name.split(".").pop() || "jpg";
      const filePath = `proof/${submission.id}/${crypto.randomUUID()}.${fileExt}`;

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
          photo_type: "proof",
          uploaded_by: "contractor",
        });

      if (photoError) {
        return NextResponse.json(
          { error: photoError.message },
          { status: 500 }
        );
      }
    }

    const token = crypto.randomUUID();

    const { error: tokenError } = await supabase.from("review_tokens").insert({
      submission_id: submission.id,
      token,
      is_active: true,
    });

    if (tokenError) {
      return NextResponse.json(
        { error: tokenError.message },
        { status: 500 }
      );
    }

    const { error: jobUpdateError } = await supabase
      .from("jobs")
      .update({
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (jobUpdateError) {
      return NextResponse.json(
        { error: jobUpdateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      token,
    });
  } catch (error) {
    console.error("Submit route error:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
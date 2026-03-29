import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ApprovePage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: reviewToken, error: tokenError } = await supabase
    .from("review_tokens")
    .select("*")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (tokenError || !reviewToken) {
    notFound();
  }

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", reviewToken.submission_id)
    .single();

  if (submissionError || !submission) {
    notFound();
  }

  await supabase
    .from("submissions")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", submission.id);

  await supabase
    .from("jobs")
    .update({
      status: "approved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", submission.job_id);

  await supabase
    .from("review_tokens")
    .update({
      is_active: false,
    })
    .eq("id", reviewToken.id);

  return (
    <main className="mx-auto max-w-2xl px-4 py-20">
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-green-800">SignOff Approved</h1>
        <p className="mt-3 text-sm text-green-700">
          Thank you. The completed work has been approved successfully.
        </p>
      </div>
    </main>
  );
}
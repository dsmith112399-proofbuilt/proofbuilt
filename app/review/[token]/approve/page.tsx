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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-2xl text-emerald-700">✓</span>
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-black">
            SignOff Approved
          </h1>

          <p className="mt-3 text-sm text-black">
            Thank you. The completed work has been approved successfully.
          </p>

          <div className="mt-8 rounded-2xl border bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            This review link has now been completed and closed.
          </div>

          <div className="mt-8 border-t pt-4 text-center text-xs text-gray-500">
            Powered by ProofBuilt
          </div>
        </div>
      </div>
    </main>
  );
}
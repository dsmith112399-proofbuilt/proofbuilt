import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ReviewPage({ params }: PageProps) {
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

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", submission.job_id)
    .single();

  if (jobError || !job) {
    notFound();
  }

  const { data: photos } = await supabase
    .from("submission_photos")
    .select("*")
    .eq("submission_id", submission.id)
    .eq("photo_type", "proof");

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Review Completed Work
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Please review the completed work below and approve or reject the SignOff.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-700">Job</div>
              <div className="mt-1 text-sm text-slate-600">{job.job_name}</div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-700">Client</div>
              <div className="mt-1 text-sm text-slate-600">{job.client_name}</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-700">Contractor Notes</div>
            <div className="mt-2 text-sm leading-6 text-slate-700">
              {submission.notes}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-900">Proof Photos</h2>

            {!photos?.length ? (
              <p className="mt-3 text-sm text-slate-600">No proof photos found.</p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {photos.map((photo: any) => (
                  <div key={photo.id} className="rounded-2xl border bg-white p-2">
                    <img
                      src={photo.photo_url}
                      alt="Proof photo"
                      className="h-72 w-full rounded-xl object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ✅ GREEN / RED BUTTONS */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href={`/review/${token}/approve`}
              className="flex-1 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white text-center shadow-md transition hover:bg-emerald-700"
            >
              Approve SignOff
            </Link>

            <Link
              href={`/review/${token}/reject`}
              className="flex-1 rounded-2xl bg-red-600 px-6 py-4 text-base font-semibold text-white text-center shadow-md transition hover:bg-red-700"
            >
              Reject SignOff
            </Link>
          </div>

          <div className="mt-10 border-t pt-6 text-center text-xs text-slate-500">
            Powered by ProofBuilt
          </div>
        </div>
      </div>
    </main>
  );
}
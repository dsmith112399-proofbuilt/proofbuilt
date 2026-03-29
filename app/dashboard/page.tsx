import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/status-badge";
import DashboardReviewLink from "@/components/dashboard-review-link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load jobs: {error.message}
        </div>
      </main>
    );
  }

  const jobsWithReviewLinks = await Promise.all(
    (jobs || []).map(async (job: any) => {
      const { data: submissions } = await supabase
        .from("submissions")
        .select("id, submitted_at")
        .eq("job_id", job.id)
        .order("submitted_at", { ascending: false })
        .limit(10);

      let activeToken: string | null = null;

      if (submissions?.length) {
        for (const submission of submissions) {
          const { data: reviewToken } = await supabase
            .from("review_tokens")
            .select("token, is_active")
            .eq("submission_id", submission.id)
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (reviewToken?.token) {
            activeToken = reviewToken.token;
            break;
          }
        }
      }

      return {
        ...job,
        reviewLink: activeToken
          ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://proofbuilt.io"}/review/${activeToken}`
          : null,
      };
    })
  );

  const draftCount =
    jobsWithReviewLinks.filter((j: any) => j.status === "draft").length || 0;
  const pendingCount =
    jobsWithReviewLinks.filter((j: any) => j.status === "pending").length || 0;
  const approvedCount =
    jobsWithReviewLinks.filter((j: any) => j.status === "approved").length || 0;
  const rejectedCount =
    jobsWithReviewLinks.filter((j: any) => j.status === "rejected").length || 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              ProofBuilt Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage jobs, upload proof, and send SignOff links.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/jobs/new"
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm"
            >
              New Job
            </Link>

            <form action="/api/logout" method="POST">
              <button
                type="submit"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Draft</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {draftCount}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Pending</div>
            <div className="mt-2 text-3xl font-bold text-amber-700">
              {pendingCount}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Approved</div>
            <div className="mt-2 text-3xl font-bold text-emerald-700">
              {approvedCount}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Rejected</div>
            <div className="mt-2 text-3xl font-bold text-red-700">
              {rejectedCount}
            </div>
          </div>
        </div>

        {!jobsWithReviewLinks.length ? (
          <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-slate-600 shadow-sm">
            No jobs yet. Create your first one.
          </div>
        ) : (
          <div className="grid gap-4">
            {jobsWithReviewLinks.map((job: any) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-semibold text-slate-900">
                      {job.job_name}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {job.client_name} • {job.client_contact}
                    </div>
                    {job.address && (
                      <div className="mt-1 text-xs text-slate-500">
                        {job.address}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {job.reviewLink && (
                      <DashboardReviewLink reviewLink={job.reviewLink} />
                    )}
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
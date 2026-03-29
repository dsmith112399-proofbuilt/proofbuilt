import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SubmitProofForm from "@/components/submit-proof-form";
import ReviewLinkActions from "@/components/review-link-actions";
import StatusBadge from "@/components/status-badge";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    submitted?: string;
    token?: string;
  }>;
};

export default async function JobDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { submitted, token } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !job) {
    notFound();
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, submission_photos(*)")
    .eq("job_id", id)
    .order("submitted_at", { ascending: false });

  const reviewLink = token
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/review/${token}`
    : null;

  const canSubmitProof = job.status === "draft" || job.status === "rejected";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {job.job_name}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {job.client_name} • {job.client_contact}
              </p>
            </div>

            <StatusBadge status={job.status} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-700">Address</div>
              <div className="mt-1 text-sm text-slate-600">
                {job.address || "No address added"}
              </div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-700">Price</div>
              <div className="mt-1 text-sm text-slate-600">
                {job.price || "No price added"}
              </div>
            </div>
          </div>

          {submitted === "1" && reviewLink && (
            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">
              <h2 className="text-lg font-semibold text-green-800">
                Proof submitted successfully
              </h2>
              <p className="mt-2 text-sm text-green-700">
                Send this client review link for SignOff:
              </p>
              <div className="mt-3 break-all rounded-xl border bg-white px-3 py-3 text-sm text-slate-700">
                {reviewLink}
              </div>

              <ReviewLinkActions
                reviewLink={reviewLink}
                clientName={job.client_name}
                clientContact={job.client_contact}
                jobName={job.job_name}
              />
            </div>
          )}

          <div className="mt-8 rounded-2xl border p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Submit Proof for SignOff
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Add completion notes and upload proof photos.
            </p>

            {canSubmitProof ? (
              <SubmitProofForm jobId={job.id} />
            ) : (
              <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
                This job is currently <span className="font-medium">{job.status}</span>.
                You can submit new proof again if the job is rejected.
              </div>
            )}
          </div>

          <div className="mt-8 rounded-2xl border p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Submission History
            </h2>

            {!submissions?.length ? (
              <p className="mt-3 text-sm text-slate-600">No submissions yet.</p>
            ) : (
              <div className="mt-5 space-y-5">
                {submissions.map((submission: any) => {
                  const proofPhotos = submission.submission_photos?.filter(
                    (p: any) => p.photo_type === "proof"
                  );
                  const rejectionPhotos = submission.submission_photos?.filter(
                    (p: any) => p.photo_type === "rejection"
                  );

                  return (
                    <div key={submission.id} className="rounded-2xl border p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <StatusBadge status={submission.status} />
                        <div className="text-xs text-slate-500">
                          {submission.submitted_at}
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-slate-700">
                        {submission.notes}
                      </p>

                      {proofPhotos?.length > 0 && (
                        <div className="mt-4">
                          <div className="mb-2 text-sm font-medium text-slate-700">
                            Proof Photos
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {proofPhotos.map((photo: any) => (
                              <img
                                key={photo.id}
                                src={photo.photo_url}
                                alt="Proof"
                                className="h-40 w-full rounded-xl border object-cover"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {submission.rejection_reason && (
                        <div className="mt-4 rounded-xl bg-red-50 px-3 py-3 text-sm text-red-700">
                          Rejection reason: {submission.rejection_reason}
                        </div>
                      )}

                      {submission.status === "rejected" &&
                        rejectionPhotos?.length > 0 && (
                          <div className="mt-4">
                            <div className="mb-2 text-sm font-medium text-slate-700">
                              Rejection Photos
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {rejectionPhotos.map((photo: any) => (
                                <img
                                  key={photo.id}
                                  src={photo.photo_url}
                                  alt="Rejection"
                                  className="h-40 w-full rounded-xl border object-cover"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
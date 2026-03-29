"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function RejectPage() {
  const params = useParams();
  const token = params.token as string;

  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!reason.trim()) {
      setError("Reason is required.");
      setLoading(false);
      return;
    }

    if (!file) {
      setError("A rejection photo is required.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("reason", reason);
      formData.append("photo", file);

      const response = await fetch(`/api/review/${token}/reject`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setDone(true);
      setLoading(false);
    } catch {
      setError("Unexpected error submitting rejection.");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl px-4 py-16">
          <div className="rounded-3xl border bg-white p-8 shadow-sm text-center">
            <h1 className="text-2xl font-bold text-red-700">
              SignOff Rejected
            </h1>
            <p className="mt-3 text-sm text-black">
              Your feedback and photo were submitted successfully.
            </p>

            <div className="mt-6 text-xs text-gray-500">
              Powered by ProofBuilt
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-black">
            Reject SignOff
          </h1>

          <p className="mt-2 text-sm text-black">
            Please explain the issue and upload a photo showing what needs to be corrected.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Reason for rejection
              </label>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-32 w-full rounded-xl border bg-white px-3 py-2 text-sm text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="let us know whats wrong here"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Upload rejection photo
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm text-black"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Reject SignOff"}
            </button>
          </form>

          <div className="mt-8 border-t pt-4 text-center text-xs text-gray-500">
            Powered by ProofBuilt
          </div>
        </div>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";

type RejectReviewFormProps = {
  token: string;
};

export default function RejectReviewForm({
  token,
}: RejectReviewFormProps) {
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
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
        <h2 className="text-lg font-semibold text-red-800">SignOff Rejected</h2>
        <p className="mt-2 text-sm text-red-700">
          Your feedback and photo were submitted successfully.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">
          Reason for rejection
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="min-h-32 w-full rounded-lg border px-3 py-2"
          placeholder="Example: upper right door is misaligned and one filler piece is missing."
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Upload rejection photo
        </label>
        <input
          type="file"
          accept="image/*"
          className="w-full rounded-lg border px-3 py-2"
          required
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Reject SignOff"}
      </button>
    </form>
  );
}
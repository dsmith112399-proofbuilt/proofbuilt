"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SubmitProofFormProps = {
  jobId: string;
};

export default function SubmitProofForm({ jobId }: SubmitProofFormProps) {
  const router = useRouter();

  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("notes", notes);

      if (files) {
        for (const file of Array.from(files)) {
          formData.append("photos", file);
        }
      }

      const response = await fetch(`/api/jobs/${jobId}/submit`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      if (!data.token) {
        setError("Submission succeeded, but no review token was returned.");
        setLoading(false);
        return;
      }

      // 👇 THIS is what fixes your issue
      router.push(`/jobs/${jobId}?submitted=1&token=${data.token}`);
      router.refresh();
    } catch {
      setError("Unexpected error submitting proof.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">
          Completion Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-32 w-full rounded-lg border px-3 py-2"
          placeholder="Installed all cabinets, aligned doors and drawers, added fillers, and cleaned the work area."
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Upload Proof Photos
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="w-full rounded-lg border px-3 py-2"
          required
          onChange={(e) => setFiles(e.target.files)}
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
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Proof"}
      </button>
    </form>
  );
}
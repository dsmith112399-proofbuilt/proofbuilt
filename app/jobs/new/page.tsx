"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewJobPage() {
  const router = useRouter();
  const supabase = createClient();

  const [jobName, setJobName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setError("You must be logged in.");
      return;
    }

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        user_id: user.id,
        job_name: jobName,
        client_name: clientName,
        client_contact: clientContact,
        address,
        price,
        status: "draft",
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/jobs/${data.id}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Create New Job</h1>
        <p className="mt-1 text-sm text-gray-600">
          Start a job before uploading proof and requesting SignOff.
        </p>

        <form onSubmit={handleCreateJob} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Job Name</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Client Name</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Client Contact</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={clientContact}
              onChange={(e) => setClientContact(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Address</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Price</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
            className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Job"}
          </button>
        </form>
      </div>
    </main>
  );
}
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-black">
              Create New Job
            </h1>
            <p className="mt-2 text-sm text-black">
              Start a new job before uploading proof and requesting SignOff.
            </p>
          </div>

          <form onSubmit={handleCreateJob} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Job Name
              </label>
              <input
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="Kitchen cabinet install"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Client Name
              </label>
              <input
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Client Contact
              </label>
              <input
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
                placeholder="Email or phone"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Address
              </label>
              <input
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Job address"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Price
              </label>
              <input
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="$3,200"
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
              className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Job"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
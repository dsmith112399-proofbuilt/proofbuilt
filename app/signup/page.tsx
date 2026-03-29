"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName,
        business_name: businessName,
        phone,
      });

      if (profileError) {
        setLoading(false);
        setError(profileError.message);
        return;
      }
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full rounded-2xl border p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Create your ProofBuilt account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Set up your contractor account to start logging jobs.
        </p>

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Business Name</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <a
          href="/login"
          className="mt-4 block text-center text-sm text-blue-600 underline"
        >
          Already have an account? Log in
        </a>
      </div>
    </main>
  );
}
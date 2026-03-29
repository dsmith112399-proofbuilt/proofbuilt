"use client";

import { useState } from "react";

type DashboardReviewLinkProps = {
  reviewLink: string;
};

export default function DashboardReviewLink({
  reviewLink,
}: DashboardReviewLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(reviewLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      {copied ? "Copied" : "Copy Review Link"}
    </button>
  );
}
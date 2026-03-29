"use client";

import { useState } from "react";

type ReviewLinkActionsProps = {
  reviewLink: string;
  clientName?: string | null;
  clientContact?: string | null;
  jobName?: string | null;
};

export default function ReviewLinkActions({
  reviewLink,
  clientName,
  clientContact,
  jobName,
}: ReviewLinkActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reviewLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const subject = encodeURIComponent(
    `ProofBuilt SignOff Review${jobName ? ` - ${jobName}` : ""}`
  );

  const body = encodeURIComponent(
    `Hi${clientName ? ` ${clientName}` : ""},\n\nPlease review the completed work here:\n${reviewLink}\n\nThanks.`
  );

  const emailHref = clientContact?.includes("@")
    ? `mailto:${clientContact}?subject=${subject}&body=${body}`
    : `mailto:?subject=${subject}&body=${body}`;

  const smsBody = encodeURIComponent(
    `Please review the completed work here: ${reviewLink}`
  );

  const smsHref = `sms:${clientContact && !clientContact.includes("@") ? clientContact : ""}?&body=${smsBody}`;

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-lg bg-black px-4 py-2 text-white"
      >
        {copied ? "Copied" : "Copy Review Link"}
      </button>

      <a
        href={emailHref}
        className="rounded-lg border px-4 py-2 text-sm text-gray-800"
      >
        Email Client
      </a>

      <a
        href={smsHref}
        className="rounded-lg border px-4 py-2 text-sm text-gray-800"
      >
        Text Client
      </a>
    </div>
  );
}
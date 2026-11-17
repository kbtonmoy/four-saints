"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

export function ShareTripButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tour Expense: ${title}`,
          text: `Track and settle our trip expenses for ${title}`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleShare}
      type="button"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
      title="Share public URL with group members"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Share Public Link</span>
        </>
      )}
    </button>
  );
}


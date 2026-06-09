"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Back navigation. With `href` it links to a specific page; without, it goes
// back in browser history (falling back to the catalog if there is none).
export function BackLink({ href, label = "Back" }: { href?: string; label?: string }) {
  const router = useRouter();
  const className =
    "mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-coral hover:underline";

  if (href) {
    return (
      <Link href={href} className={className}>
        <ArrowLeft className="h-4 w-4" /> {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/courses");
      }}
      className={className}
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );
}

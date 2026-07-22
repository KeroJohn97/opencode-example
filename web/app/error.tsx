"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <p className="text-red-500">Failed to load Pokemon data.</p>
        <button
          onClick={() => reset()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

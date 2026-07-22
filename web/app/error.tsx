"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-7xl">!</div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Something went wrong
        </h2>
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Failed to load Pokemon data. Please check your connection and try again.
        </p>
        <button
          onClick={() => reset()}
          className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

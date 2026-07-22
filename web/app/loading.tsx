export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <div className="h-9 w-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-56 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-14 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="flex gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-center bg-zinc-50 px-4 pt-5 pb-2 dark:bg-zinc-800">
              <div className="h-20 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
            </div>
            <div className="flex flex-col gap-2.5 p-4">
              <div className="h-5 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex gap-1.5">
                <div className="h-5 w-14 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-5 w-14 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="flex flex-col items-center gap-1">
                    <div className="h-1.5 w-full animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
                    <div className="h-3 w-8 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
